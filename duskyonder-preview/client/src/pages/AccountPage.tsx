import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { SFPromoBar, SFHeader, SFFooter } from "@/components/StorefrontShell";
import { getCustomerLoginUrlAsync, getCustomerLogoutUrl } from "@/lib/shopify";
import { trpc } from "@/lib/trpc";

// ==================== ACCOUNT PAGE ====================
// Shopify Customer Account API integration
// Uses OAuth2 PKCE flow — tokens stored in localStorage

// ── Token helpers ──────────────────────────────────────────────────────────────
const TOKEN_KEY = "shopify_customer_token";
const TOKEN_EXPIRY_KEY = "shopify_customer_token_expiry";
const ID_TOKEN_KEY = "shopify_customer_id_token";

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

function clearStoredToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  } catch {
    // ignore
  }
}

// ── Shopify data types ─────────────────────────────────────────────────────────
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

type Tab = "overview" | "orders" | "profile" | "preferences";

// ── Helpers ────────────────────────────────────────────────────────────────────
function getInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return displayName.slice(0, 2).toUpperCase();
}

function formatOrderStatus(order: ShopifyOrder): { label: string; bg: string; color: string } {
  const raw = (order.fulfillmentStatus ?? order.financialStatus ?? "").toLowerCase();
  if (raw === "fulfilled" || raw === "paid") return { label: "Fulfilled", bg: "#E8F3F0", color: "#175C40" };
  if (raw === "partially_fulfilled") return { label: "Partial", bg: "#FFF3CD", color: "#856404" };
  if (raw === "cancelled" || raw === "canceled") return { label: "Cancelled", bg: "#F8D7DA", color: "#721C24" };
  if (raw === "refunded") return { label: "Refunded", bg: "#f0f0f0", color: "#555" };
  return { label: "Processing", bg: "#FFF3CD", color: "#856404" };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function formatCurrency(amount: string, currency: string): string {
  return `${parseFloat(amount).toFixed(2)} ${currency}`;
}

function calcTotalSpent(orders: ShopifyOrder[]): string {
  const total = orders.reduce((sum, o) => sum + parseFloat(o.totalPrice.amount), 0);
  const currency = orders[0]?.totalPrice.currencyCode ?? "USD";
  return `${total.toFixed(2)} ${currency}`;
}

// ── Spinner ────────────────────────────────────────────────────────────────────
function Spinner({ label }: { label?: string }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 24px", color: "#888" }}>
      <style>{`@keyframes dy-spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{
        width: 32, height: 32, border: "3px solid #e0ddd8",
        borderTopColor: "#175C40", borderRadius: "50%",
        animation: "dy-spin 0.8s linear infinite",
        margin: "0 auto 14px",
      }} />
      {label && <p style={{ fontSize: "0.88rem" }}>{label}</p>}
    </div>
  );
}

// ── Status Badge ───────────────────────────────────────────────────────────────
function StatusBadge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 2,
      fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.06em",
      textTransform: "uppercase", background: bg, color,
    }}>
      {label}
    </span>
  );
}

// ── Overview Tab ───────────────────────────────────────────────────────────────
function OverviewTab({
  customer,
  setTab,
}: {
  customer: CustomerData;
  setTab: (t: Tab) => void;
}) {
  const orders = customer.orders.nodes;
  const recentOrder = orders[0] ?? null;

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{
          fontFamily: "'Tenor Sans', sans-serif",
          fontSize: "1.8rem", fontWeight: 400, margin: "0 0 6px", color: "#1A1A1A",
        }}>
          Welcome back, {customer.displayName.split(" ")[0]}.
        </h2>
        <p style={{ fontSize: "0.88rem", color: "#888", margin: 0 }}>
          {orders.length > 0
            ? `You have ${orders.length} order${orders.length > 1 ? "s" : ""} with us.`
            : "You haven't placed any orders yet."}
        </p>
      </div>

      {/* Quick stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 16, marginBottom: 32,
      }}>
        {[
          { label: "Total Orders", value: orders.length.toString() },
          { label: "Total Spent", value: orders.length > 0 ? calcTotalSpent(orders) : "—" },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: "#fff", border: "1px solid #eee", borderRadius: 4,
            padding: "20px 24px", textAlign: "center",
          }}>
            <div style={{
              fontFamily: "'Tenor Sans', sans-serif",
              fontSize: "1.8rem", fontWeight: 500, color: "#0D3D2B", marginBottom: 4,
            }}>
              {stat.value}
            </div>
            <div style={{ fontSize: "0.78rem", color: "#888", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Most recent order */}
      {recentOrder ? (
        <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 4, padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Most Recent Order
            </h3>
            <button
              onClick={() => setTab("orders")}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", color: "#175C40", fontWeight: 600, padding: 0 }}
            >
              View All Orders →
            </button>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 4 }}>{recentOrder.name}</div>
              <div style={{ fontSize: "0.82rem", color: "#888", marginBottom: 8 }}>{formatDate(recentOrder.processedAt)}</div>
              <StatusBadge {...formatOrderStatus(recentOrder)} />
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 700, fontSize: "1rem", color: "#0D3D2B" }}>
                {formatCurrency(recentOrder.totalPrice.amount, recentOrder.totalPrice.currencyCode)}
              </div>
              <div style={{ fontSize: "0.78rem", color: "#aaa", marginTop: 4 }}>
                {recentOrder.lineItems.nodes.length} item{recentOrder.lineItems.nodes.length > 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          background: "#fff", border: "1px solid #eee", borderRadius: 4,
          padding: "40px 24px", textAlign: "center", color: "#888",
        }}>
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>📦</div>
          <p style={{ margin: 0, fontSize: "0.9rem" }}>No orders yet. Start shopping!</p>
          <a href="/collections/all" style={{
            display: "inline-block", marginTop: 16, padding: "10px 24px",
            background: "#0D3D2B", color: "#fff", borderRadius: 2,
            fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", textDecoration: "none",
          }}>
            Shop Now
          </a>
        </div>
      )}
    </div>
  );
}

// ── Orders Tab ─────────────────────────────────────────────────────────────────
function OrdersTab({ orders }: { orders: ShopifyOrder[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (orders.length === 0) {
    return (
      <div>
        <h2 style={{ fontFamily: "'Tenor Sans', sans-serif", fontSize: "1.6rem", fontWeight: 400, margin: "0 0 24px" }}>
          Order History
        </h2>
        <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 4, padding: "60px 24px", textAlign: "center", color: "#888" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 14 }}>📦</div>
          <p style={{ margin: 0, fontSize: "0.9rem" }}>You haven't placed any orders yet.</p>
          <a href="/collections/all" style={{
            display: "inline-block", marginTop: 20, padding: "10px 24px",
            background: "#0D3D2B", color: "#fff", borderRadius: 2,
            fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", textDecoration: "none",
          }}>
            Shop Now
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontFamily: "'Tenor Sans', sans-serif", fontSize: "1.6rem", fontWeight: 400, margin: "0 0 24px" }}>
        Order History
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {orders.map((order) => {
          const status = formatOrderStatus(order);
          const isExpanded = expanded === order.id;
          return (
            <div key={order.id} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 4, overflow: "hidden" }}>
              {/* Order header */}
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", cursor: "pointer" }}
                onClick={() => setExpanded(isExpanded ? null : order.id)}
              >
                <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{order.name}</div>
                    <div style={{ fontSize: "0.78rem", color: "#888", marginTop: 2 }}>{formatDate(order.processedAt)}</div>
                  </div>
                  <StatusBadge {...status} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0D3D2B" }}>
                    {formatCurrency(order.totalPrice.amount, order.totalPrice.currencyCode)}
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", color: "#888" }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              {/* Line items (expanded) */}
              {isExpanded && (
                <div style={{ borderTop: "1px solid #f0f0f0", padding: "16px 20px" }}>
                  {order.lineItems.nodes.map((item, i) => (
                    <div key={i} style={{
                      display: "flex", gap: 12, alignItems: "center", padding: "10px 0",
                      borderBottom: i < order.lineItems.nodes.length - 1 ? "1px solid #f5f5f5" : "none",
                    }}>
                      {item.image?.url ? (
                        <img src={item.image.url} alt={item.image.altText ?? item.title}
                          style={{ width: 52, height: 64, objectFit: "cover", borderRadius: 3, flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 52, height: 64, background: "#f5f5f5", borderRadius: 3, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
                          👕
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>{item.title}</div>
                        {item.merchandise?.title && item.merchandise.title !== "Default Title" && (
                          <div style={{ fontSize: "0.78rem", color: "#888", marginTop: 2 }}>{item.merchandise.title}</div>
                        )}
                        <div style={{ fontSize: "0.78rem", color: "#888", marginTop: 2 }}>Qty: {item.quantity}</div>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "#0D3D2B", whiteSpace: "nowrap" }}>
                        {formatCurrency(item.price.amount, item.price.currencyCode)}
                      </div>
                    </div>
                  ))}
                  {/* Buy again */}
                  {order.lineItems.nodes[0]?.merchandise?.product?.handle && (
                    <div style={{ marginTop: 16 }}>
                      <a
                        href={`/products/${order.lineItems.nodes[0].merchandise.product.handle}`}
                        style={{
                          display: "inline-block", padding: "9px 18px",
                          background: "#0D3D2B", color: "#fff", border: "none", borderRadius: 2,
                          fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.08em",
                          textTransform: "uppercase", textDecoration: "none",
                        }}
                      >
                        Buy Again
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Profile Tab ────────────────────────────────────────────────────────────────
function ProfileTab({ customer }: { customer: CustomerData }) {
  const nameParts = customer.displayName.trim().split(/\s+/);
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ");
  const email = customer.emailAddress?.emailAddress ?? "";

  return (
    <div>
      <h2 style={{ fontFamily: "'Tenor Sans', sans-serif", fontSize: "1.6rem", fontWeight: 400, margin: "0 0 24px" }}>
        Personal Information
      </h2>
      <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 4, padding: "28px", maxWidth: 560 }}>
        <div style={{ marginBottom: 12, padding: "10px 14px", background: "#f5f9f7", borderRadius: 3, fontSize: "0.8rem", color: "#175C40", border: "1px solid #c3ddd4" }}>
          Profile editing is managed through your Shopify account. Changes made here are for display only.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          {[
            { label: "First Name", value: firstName },
            { label: "Last Name", value: lastName },
          ].map((field) => (
            <div key={field.label}>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#888", marginBottom: 6 }}>
                {field.label}
              </label>
              <input
                defaultValue={field.value}
                readOnly
                style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #d0ccc7", borderRadius: 2, fontSize: "0.88rem", outline: "none", boxSizing: "border-box", background: "#fafafa", color: "#333" }}
              />
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#888", marginBottom: 6 }}>
            Email
          </label>
          <input
            defaultValue={email}
            type="email"
            readOnly
            style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #d0ccc7", borderRadius: 2, fontSize: "0.88rem", outline: "none", boxSizing: "border-box", background: "#fafafa", color: "#333" }}
          />
        </div>
        <a
          href="https://account.duskyonder.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block", padding: "12px 28px",
            background: "#0D3D2B", color: "#fff", borderRadius: 2,
            fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.1em",
            textTransform: "uppercase", textDecoration: "none",
          }}
        >
          Manage Account on Shopify →
        </a>
      </div>
    </div>
  );
}

// ── Preferences Tab ────────────────────────────────────────────────────────────
function PreferencesTab() {
  const [marketing, setMarketing] = useState(true);
  const [prefs, setPrefs] = useState({
    newArrivals: true,
    saleAlerts: true,
    orderUpdates: true,
    communityNews: false,
  });

  return (
    <div>
      <h2 style={{ fontFamily: "'Tenor Sans', sans-serif", fontSize: "1.6rem", fontWeight: 400, margin: "0 0 24px" }}>
        Communication Preferences
      </h2>
      <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 4, padding: "28px", maxWidth: 560 }}>
        {/* Master toggle */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #f0f0f0", marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>Email Marketing</div>
            <div style={{ fontSize: "0.8rem", color: "#888", marginTop: 3 }}>Receive emails about new arrivals, promotions, and events</div>
          </div>
          <div
            onClick={() => setMarketing(!marketing)}
            style={{ width: 44, height: 24, borderRadius: 12, background: marketing ? "#175C40" : "#ccc", position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}
          >
            <div style={{ position: "absolute", top: 3, left: marketing ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
          </div>
        </div>

        {/* Topics */}
        <div style={{ opacity: marketing ? 1 : 0.4, transition: "opacity 0.2s", pointerEvents: marketing ? "auto" : "none" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#888", marginBottom: 14 }}>
            Email Topics
          </div>
          {(Object.keys(prefs) as Array<keyof typeof prefs>).map((key) => {
            const labels: Record<string, string> = { newArrivals: "New Arrivals", saleAlerts: "Sale & Promotions", orderUpdates: "Order Updates", communityNews: "Community & Events" };
            return (
              <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f5f5f5" }}>
                <span style={{ fontSize: "0.88rem", color: "#333" }}>{labels[key]}</span>
                <div
                  onClick={() => setPrefs((p) => ({ ...p, [key]: !p[key] }))}
                  style={{ width: 36, height: 20, borderRadius: 10, background: prefs[key] ? "#175C40" : "#ccc", position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}
                >
                  <div style={{ position: "absolute", top: 2, left: prefs[key] ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 24 }}>
          <button style={{ padding: "12px 28px", background: "#0D3D2B", color: "#fff", border: "none", borderRadius: 2, fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Login Page ─────────────────────────────────────────────────────────────────
function LoginPage() {
  const handleLogin = async () => {
    const redirectUri = `${window.location.origin}/account`;
    const loginUrl = await getCustomerLoginUrlAsync(redirectUri);
    window.location.href = loginUrl;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF9F7" }}>
      <SFPromoBar />
      <SFHeader darkMode />
      <div style={{ maxWidth: 440, margin: "0 auto", padding: "120px 24px 80px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "'Tenor Sans', sans-serif", fontSize: "2rem", fontWeight: 400, marginBottom: 12, color: "#1a1a1a" }}>
          Welcome Back
        </h1>
        <p style={{ color: "#666", fontSize: 14, marginBottom: 40 }}>
          Sign in to your account to view orders, manage addresses, and more.
        </p>
        <button
          onClick={handleLogin}
          style={{
            width: "100%", padding: "16px 24px", background: "#0D3D2B", color: "#fff",
            border: "none", borderRadius: 2, fontSize: 13, fontWeight: 700,
            letterSpacing: "0.12em", textTransform: "uppercase" as const, cursor: "pointer",
            marginBottom: 16, transition: "background 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#2d5c42")}
          onMouseLeave={e => (e.currentTarget.style.background = "#0D3D2B")}
        >
          Sign In with Shopify
        </button>
        <p style={{ fontSize: 13, color: "#888" }}>
          Don't have an account?{" "}
          <button
            onClick={handleLogin}
            style={{ background: "none", border: "none", color: "#0D3D2B", fontWeight: 600, cursor: "pointer", textDecoration: "underline", fontSize: 13 }}
          >
            Create Account
          </button>
        </p>
      </div>
      <SFFooter />
    </div>
  );
}

// ── Account Dashboard ──────────────────────────────────────────────────────────
function AccountDashboard() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [accessToken, setAccessToken] = useState<string | null>(() => getStoredToken());
  const [exchanging, setExchanging] = useState(false);
  const [exchangeError, setExchangeError] = useState<string | null>(null);

  const exchangeTokenMutation = trpc.customer.exchangeToken.useMutation();

  // Handle OAuth callback — exchange ?code= for access token
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
    const redirectUri = `${window.location.origin}/account`;

    exchangeTokenMutation.mutate(
      { code, codeVerifier, redirectUri },
      {
        onSuccess: (data) => {
          try {
            localStorage.setItem(TOKEN_KEY, data.accessToken);
            localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + data.expiresIn * 1000));
            if (data.idToken) localStorage.setItem(ID_TOKEN_KEY, data.idToken);
          } catch { /* ignore */ }
          sessionStorage.removeItem("shopify_code_verifier");
          sessionStorage.removeItem("shopify_auth_state");
          sessionStorage.removeItem("shopify_auth_nonce");
          window.history.replaceState({}, "", "/account");
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

  // If no token and no code in URL → redirect to Shopify login
  useEffect(() => {
    const hasCode = new URLSearchParams(window.location.search).has("code");
    if (!accessToken && !hasCode && !exchanging) {
      getCustomerLoginUrlAsync(`${window.location.origin}/account`).then((url) => {
        window.location.href = url;
      });
    }
  }, [accessToken, exchanging]);

  // Fetch customer data (name, email, orders) once we have a token
  const { data: rawCustomer, isLoading, error } = trpc.customer.getOrders.useQuery(
    { accessToken: accessToken ?? "" },
    {
      enabled: !!accessToken && !exchanging,
      retry: false,
    }
  );

  const customer = rawCustomer as CustomerData | null | undefined;
  const orders = customer?.orders?.nodes ?? [];

  // Handle auth errors
  useEffect(() => {
    if (error) {
      const trpcErr = error as { data?: { code?: string } };
      if (trpcErr.data?.code === "UNAUTHORIZED") {
        clearStoredToken();
        navigate("/account/login");
      }
    }
  }, [error, navigate]);

  const TABS: Array<{ id: Tab; label: string }> = [
    { id: "overview", label: "Overview" },
    { id: "orders", label: `Orders${orders.length > 0 ? ` (${orders.length})` : ""}` },
    { id: "profile", label: "Profile" },
    { id: "preferences", label: "Preferences" },
  ];

  const renderTab = () => {
    if (!customer) return null;
    switch (activeTab) {
      case "overview": return <OverviewTab customer={customer} setTab={setActiveTab} />;
      case "orders": return <OrdersTab orders={orders} />;
      case "profile": return <ProfileTab customer={customer} />;
      case "preferences": return <PreferencesTab />;
    }
  };

  // Loading / error states
  if (exchanging || (isLoading && !!accessToken)) {
    return (
      <div style={{ minHeight: "100vh", background: "#FAF9F7" }}>
        <SFPromoBar />
        <SFHeader darkMode />
        <Spinner label={exchanging ? "Signing you in…" : "Loading your account…"} />
        <SFFooter />
      </div>
    );
  }

  if (exchangeError) {
    return (
      <div style={{ minHeight: "100vh", background: "#FAF9F7" }}>
        <SFPromoBar />
        <SFHeader darkMode />
        <div style={{ maxWidth: 480, margin: "120px auto 0", padding: "0 24px", textAlign: "center" }}>
          <div style={{ background: "#fff5f5", border: "1px solid #fcc", borderRadius: 8, padding: "24px", color: "#c0392b" }}>
            <p style={{ margin: "0 0 16px" }}>{exchangeError}</p>
            <a href="/account/login" style={{ color: "#c0392b", fontWeight: 700 }}>Sign in again</a>
          </div>
        </div>
        <SFFooter />
      </div>
    );
  }

  if (!customer) return null;

  const initials = getInitials(customer.displayName);
  const email = customer.emailAddress?.emailAddress ?? "";

  return (
    <div style={{ minHeight: "100vh", background: "#FAF9F7" }}>
      <SFPromoBar />
      <SFHeader darkMode />

      {/* Page header */}
      <div style={{
        background: "#fff", borderBottom: "1px solid #eee",
        padding: "32px 24px 0",
        marginTop: "calc(var(--promo-height, 40px) + 64px)",
      }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            {/* Avatar with real initials */}
            <div style={{
              width: 52, height: 52, borderRadius: "50%", background: "#0D3D2B",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.1rem", fontWeight: 700, flexShrink: 0, letterSpacing: "0.02em",
            }}>
              {initials}
            </div>
            <div>
              {/* Real name */}
              <div style={{ fontWeight: 700, fontSize: "1rem" }}>{customer.displayName}</div>
              {/* Real email */}
              {email && <div style={{ fontSize: "0.82rem", color: "#888" }}>{email}</div>}
            </div>
            <button
              onClick={() => {
                const idToken = localStorage.getItem(ID_TOKEN_KEY) ?? "";
                clearStoredToken();
                localStorage.removeItem(ID_TOKEN_KEY);
                const logoutUrl = getCustomerLogoutUrl(window.location.origin, idToken);
                window.location.href = logoutUrl;
              }}
              style={{
                marginLeft: "auto", padding: "8px 16px", background: "transparent",
                color: "#555", border: "1px solid #d0ccc7", borderRadius: 2,
                fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em",
                textTransform: "uppercase", cursor: "pointer",
              }}
            >
              Log Out
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, overflowX: "auto" }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "12px 20px", background: "none", border: "none",
                  borderBottom: `2px solid ${activeTab === tab.id ? "#0D3D2B" : "transparent"}`,
                  color: activeTab === tab.id ? "#0D3D2B" : "#888",
                  fontSize: "0.82rem", fontWeight: activeTab === tab.id ? 700 : 500,
                  cursor: "pointer", letterSpacing: "0.04em", whiteSpace: "nowrap",
                  transition: "all 0.15s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px 80px" }}>
        {renderTab()}
      </div>

      <SFFooter />
    </div>
  );
}

// ==================== MAIN EXPORT ====================
export default function AccountPage() {
  const [location] = useLocation();
  const isLoginRoute = location === "/account/login" || location === "/account/register";
  if (isLoginRoute) return <LoginPage />;
  return <AccountDashboard />;
}
