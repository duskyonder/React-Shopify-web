import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { SFPromoBar, SFHeader, SFFooter } from "@/components/StorefrontShell";
import { trpc } from "@/lib/trpc";

// ── Types ──────────────────────────────────────────────────────────────────────
interface LineItem {
  title: string;
  quantity: number;
  price: { amount: string; currencyCode: string };
  image: { url: string; altText: string | null } | null;
  merchandise: {
    id: string;
    title: string;
    product: { handle: string };
  } | null;
}

interface ShopifyOrder {
  id: string;
  name: string;
  processedAt: string;
  financialStatus: string | null;
  fulfillmentStatus: string | null;
  totalPrice: { amount: string; currencyCode: string };
  lineItems: { nodes: LineItem[] };
}

interface CustomerData {
  displayName: string;
  emailAddress: { emailAddress: string } | null;
  orders: { nodes: ShopifyOrder[] };
}

// ── Token helpers ──────────────────────────────────────────────────────────────
const TOKEN_KEY = "shopify_customer_token";
const TOKEN_EXPIRY_KEY = "shopify_customer_token_expiry";

function getStoredToken(): string | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!token) return null;
    if (expiry && Date.now() > parseInt(expiry, 10)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

function storeToken(accessToken: string, expiresIn: number) {
  try {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + expiresIn * 1000));
  } catch {
    // ignore
  }
}

// ── UI helpers ─────────────────────────────────────────────────────────────────
function formatStatus(status: string | null): { label: string; color: string } {
  if (!status) return { label: "Pending", color: "#888" };
  const s = status.toLowerCase();
  if (s === "paid" || s === "fulfilled") return { label: "Fulfilled", color: "#175C40" };
  if (s === "partially_fulfilled") return { label: "Partial", color: "#E8A020" };
  if (s === "cancelled" || s === "canceled") return { label: "Cancelled", color: "#c0392b" };
  if (s === "pending" || s === "open") return { label: "Processing", color: "#E8A020" };
  if (s === "refunded") return { label: "Refunded", color: "#888" };
  return { label: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(), color: "#555" };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function StatusBadge({ status }: { status: string | null }) {
  const { label, color } = formatStatus(status);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 10px", borderRadius: 20,
      background: color + "18", color,
      fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.04em",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />
      {label}
    </span>
  );
}

// ── Order Card ─────────────────────────────────────────────────────────────────
function OrderCard({ order }: { order: ShopifyOrder }) {
  const [expanded, setExpanded] = useState(false);
  const firstItem = order.lineItems.nodes[0];
  const extraCount = order.lineItems.nodes.length - 1;
  const displayStatus = order.fulfillmentStatus ?? order.financialStatus;

  return (
    <div style={{
      background: "#fff", borderRadius: 8, marginBottom: 16,
      boxShadow: "0 1px 6px rgba(0,0,0,0.06)", overflow: "hidden",
    }}>
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px", flexWrap: "wrap", gap: 12, cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {firstItem?.image?.url ? (
            <img
              src={firstItem.image.url}
              alt={firstItem.image.altText ?? firstItem.title}
              style={{ width: 64, height: 80, objectFit: "cover", borderRadius: 4, flexShrink: 0 }}
            />
          ) : (
            <div style={{
              width: 64, height: 80, borderRadius: 4, background: "#f0ede8",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#bbb", fontSize: "1.5rem", flexShrink: 0,
            }}>📦</div>
          )}
          <div>
            <StatusBadge status={displayStatus} />
            <div style={{ marginTop: 6, fontSize: "0.85rem", color: "#555" }}>
              <span style={{ fontWeight: 700, color: "#1a1a1a" }}>{order.name}</span>
              {" · "}
              {parseFloat(order.totalPrice.amount).toFixed(2)} {order.totalPrice.currencyCode}
            </div>
            <div style={{ fontSize: "0.78rem", color: "#999", marginTop: 2 }}>
              {formatDate(order.processedAt)}
              {extraCount > 0 && ` · +${extraCount} more item${extraCount > 1 ? "s" : ""}`}
            </div>
          </div>
        </div>
        {firstItem?.merchandise?.product?.handle && (
          <a
            href={`/products/${firstItem.merchandise.product.handle}`}
            onClick={e => e.stopPropagation()}
            style={{
              padding: "8px 18px", border: "1px solid #ddd", borderRadius: 20,
              fontSize: "0.8rem", fontWeight: 600, color: "#1a1a1a",
              textDecoration: "none", background: "#fff",
              transition: "border-color 0.2s, color 0.2s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#175C40"; e.currentTarget.style.color = "#175C40"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#ddd"; e.currentTarget.style.color = "#1a1a1a"; }}
          >
            Buy again
          </a>
        )}
      </div>

      {expanded && (
        <div style={{ borderTop: "1px solid #f0ede8", padding: "16px 24px" }}>
          {order.lineItems.nodes.map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "10px 0",
              borderBottom: i < order.lineItems.nodes.length - 1 ? "1px solid #f5f3ef" : "none",
            }}>
              {item.image?.url ? (
                <img src={item.image.url} alt={item.image.altText ?? item.title}
                  style={{ width: 48, height: 60, objectFit: "cover", borderRadius: 3, flexShrink: 0 }} />
              ) : (
                <div style={{ width: 48, height: 60, background: "#f0ede8", borderRadius: 3, flexShrink: 0 }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1a1a1a" }}>{item.title}</div>
                {item.merchandise?.title && item.merchandise.title !== "Default Title" && (
                  <div style={{ fontSize: "0.78rem", color: "#888", marginTop: 2 }}>{item.merchandise.title}</div>
                )}
                <div style={{ fontSize: "0.78rem", color: "#888", marginTop: 2 }}>Qty: {item.quantity}</div>
              </div>
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1a1a1a", whiteSpace: "nowrap" }}>
                {parseFloat(item.price.amount).toFixed(2)} {item.price.currencyCode}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div style={{ textAlign: "center", padding: "60px 24px", color: "#888" }}>
      <div style={{ fontSize: "3rem", marginBottom: 16 }}>📦</div>
      <div style={{ fontWeight: 600, fontSize: "1.1rem", color: "#555", marginBottom: 8 }}>
        You haven't placed any orders yet
      </div>
      <p style={{ fontSize: "0.9rem", color: "#999", marginBottom: 28 }}>
        When you place an order, it will appear here.
      </p>
      <a href="/collections/all" style={{
        display: "inline-block", padding: "12px 28px",
        background: "#0D3D2B", color: "#fff", borderRadius: 2,
        fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.1em",
        textTransform: "uppercase", textDecoration: "none",
      }}>
        Shop Now
      </a>
    </div>
  );
}

// ── Loading Spinner ────────────────────────────────────────────────────────────
function Spinner({ label }: { label: string }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 24px", color: "#888" }}>
      <style>{`@keyframes dy-spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{
        width: 36, height: 36, border: "3px solid #e0ddd8",
        borderTopColor: "#175C40", borderRadius: "50%",
        animation: "dy-spin 0.8s linear infinite",
        margin: "0 auto 16px",
      }} />
      <p style={{ fontSize: "0.9rem" }}>{label}</p>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const [, navigate] = useLocation();
  const [accessToken, setAccessToken] = useState<string | null>(() => getStoredToken());
  const [exchanging, setExchanging] = useState(false);
  const [exchangeError, setExchangeError] = useState<string | null>(null);

  const exchangeTokenMutation = trpc.customer.exchangeToken.useMutation();

  // Step 1: Handle OAuth callback — exchange ?code= for access token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (!code) return;

    const codeVerifier = sessionStorage.getItem("shopify_code_verifier");
    if (!codeVerifier) {
      setExchangeError("Session expired. Please sign in again.");
      return;
    }

    setExchanging(true);
    const redirectUri = `${window.location.origin}/account/orders`;

    exchangeTokenMutation.mutate(
      { code, codeVerifier, redirectUri },
      {
        onSuccess: (data) => {
          storeToken(data.accessToken, data.expiresIn);
          sessionStorage.removeItem("shopify_code_verifier");
          sessionStorage.removeItem("shopify_auth_state");
          sessionStorage.removeItem("shopify_auth_nonce");
          window.history.replaceState({}, "", "/account/orders");
          setAccessToken(data.accessToken);
          setExchanging(false);
        },
        onError: (err) => {
          setExchangeError(err.message ?? "Sign-in failed. Please try again.");
          setExchanging(false);
        },
      }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Step 2: If no token and no code in URL → redirect to Shopify login
  useEffect(() => {
    const hasCode = new URLSearchParams(window.location.search).has("code");
    if (!accessToken && !hasCode && !exchanging) {
      import("@/lib/shopify").then(({ getCustomerLoginUrlAsync }) => {
        const redirectUri = `${window.location.origin}/account/orders`;
        getCustomerLoginUrlAsync(redirectUri).then((url) => {
          window.location.href = url;
        });
      });
    }
  }, [accessToken, exchanging]);

  // Step 3: Fetch orders once we have a token
  const { data: rawCustomer, isLoading, error } = trpc.customer.getOrders.useQuery(
    { accessToken: accessToken ?? "" },
    {
      enabled: !!accessToken && !exchanging,
      retry: false,
    }
  );

  const customer = rawCustomer as CustomerData | null | undefined;
  const orders = customer?.orders?.nodes ?? [];

  // Handle auth errors from the query
  useEffect(() => {
    if (error) {
      const trpcErr = error as { data?: { code?: string } };
      if (trpcErr.data?.code === "UNAUTHORIZED") {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(TOKEN_EXPIRY_KEY);
        navigate("/account/login");
      }
    }
  }, [error, navigate]);

  return (
    <div style={{ minHeight: "100vh", background: "#FAF9F7" }}>
      <SFPromoBar />
      <SFHeader darkMode />

      <div style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "calc(var(--promo-height, 40px) + 80px) 24px 80px",
      }}>
        {/* Page title */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <h1 style={{
            fontFamily: "'Tenor Sans', sans-serif",
            fontSize: "1.8rem", fontWeight: 400, color: "#1a1a1a", margin: 0,
          }}>
            My Orders
          </h1>
          <a href="/account" style={{ fontSize: "0.82rem", color: "#888", textDecoration: "none" }}>
            ← Back to Account
          </a>
        </div>

        {/* Customer greeting */}
        {customer?.displayName && (
          <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: 24 }}>
            Signed in as <strong>{customer.displayName}</strong>
            {customer.emailAddress?.emailAddress && ` (${customer.emailAddress.emailAddress})`}
          </p>
        )}

        {/* Exchange error */}
        {exchangeError && (
          <div style={{
            background: "#fff5f5", border: "1px solid #fcc", borderRadius: 8,
            padding: "16px 20px", color: "#c0392b", fontSize: "0.9rem", marginBottom: 24,
          }}>
            {exchangeError}{" "}
            <a href="/account/login" style={{ color: "#c0392b", fontWeight: 600 }}>Sign in again</a>
          </div>
        )}

        {/* Loading states */}
        {exchanging && <Spinner label="Signing you in…" />}
        {!exchanging && isLoading && <Spinner label="Loading your orders…" />}

        {/* Query error (non-auth) */}
        {error && !isLoading && !exchanging && (error as { data?: { code?: string } }).data?.code !== "UNAUTHORIZED" && (
          <div style={{
            background: "#fff5f5", border: "1px solid #fcc", borderRadius: 8,
            padding: "16px 20px", color: "#c0392b", fontSize: "0.9rem", marginBottom: 24,
          }}>
            Unable to load orders.{" "}
            <button
              onClick={() => {
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(TOKEN_EXPIRY_KEY);
                navigate("/account/login");
              }}
              style={{ background: "none", border: "none", color: "#c0392b", textDecoration: "underline", cursor: "pointer", fontSize: "0.9rem", padding: 0 }}
            >
              Sign in again
            </button>
          </div>
        )}

        {/* Orders list */}
        {!isLoading && !exchanging && !error && accessToken && (
          orders.length === 0 ? <EmptyState /> : orders.map(order => <OrderCard key={order.id} order={order} />)
        )}
      </div>

      <SFFooter />
    </div>
  );
}
