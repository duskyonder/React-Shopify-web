import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { SFPromoBar, SFHeader, SFFooter } from "@/components/StorefrontShell";
import { getCustomerLoginUrl, getCustomerLogoutUrl } from "@/lib/shopify";

// ==================== ACCOUNT PAGE ====================
// Shopify Customer Account API integration
// Uses OAuth2 flow for login/register via Shopify's hosted login page

// ---- Mock Data ----
const MOCK_CUSTOMER = {
  firstName: "Emma",
  lastName: "Chen",
  email: "emma.chen@example.com",
  phone: "+1 (555) 234-5678",
  acceptsMarketing: true,
  createdAt: "March 2024",
};

const MOCK_ADDRESSES = [
  {
    id: "addr_1",
    default: true,
    firstName: "Emma",
    lastName: "Chen",
    address1: "123 Willow Lane",
    address2: "Apt 4B",
    city: "San Francisco",
    province: "CA",
    zip: "94102",
    country: "United States",
    phone: "+1 (555) 234-5678",
  },
  {
    id: "addr_2",
    default: false,
    firstName: "Emma",
    lastName: "Chen",
    address1: "456 Oak Street",
    address2: "",
    city: "Los Angeles",
    province: "CA",
    zip: "90001",
    country: "United States",
    phone: "",
  },
];

const MOCK_ORDERS = [
  {
    id: "#DY-10042",
    date: "May 28, 2025",
    status: "Delivered",
    total: "$186.00",
    items: [
      { name: "AirLight Leggings", variant: "Black / S", qty: 1, price: "$98.00", imageUrl: "" },
      { name: "SculptFlex Sports Bra", variant: "Forest Green / S", qty: 1, price: "$68.00", imageUrl: "" },
    ],
  },
  {
    id: "#DY-10031",
    date: "April 12, 2025",
    status: "Delivered",
    total: "$98.00",
    items: [
      { name: "EcoMove Shorts", variant: "Dusty Rose / M", qty: 1, price: "$68.00", imageUrl: "" },
      { name: "Grip Socks", variant: "White / One Size", qty: 2, price: "$15.00", imageUrl: "" },
    ],
  },
  {
    id: "#DY-10018",
    date: "February 3, 2025",
    status: "Delivered",
    total: "$124.00",
    items: [
      { name: "Freedom Leggings", variant: "Navy / L", qty: 1, price: "$124.00", imageUrl: "" },
    ],
  },
];

type Tab = "overview" | "orders" | "addresses" | "profile" | "preferences";

// ---- Status Badge ----
function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, { bg: string; color: string }> = {
    Delivered: { bg: "#E8F3F0", color: "#175C40" },
    Processing: { bg: "#FFF3CD", color: "#856404" },
    Shipped: { bg: "#D1ECF1", color: "#0C5460" },
    Cancelled: { bg: "#F8D7DA", color: "#721C24" },
  };
  const style = colorMap[status] || { bg: "#f0f0f0", color: "#555" };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 2,
        fontSize: "0.72rem",
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        background: style.bg,
        color: style.color,
      }}
    >
      {status}
    </span>
  );
}

// ---- Overview Tab ----
function OverviewTab({ setTab }: { setTab: (t: Tab) => void }) {
  const recentOrder = MOCK_ORDERS[0];
  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: 32 }}>
        <h2
          style={{
            fontFamily: "'Tenor Sans', sans-serif",
            fontSize: "1.8rem",
            fontWeight: 400,
            margin: "0 0 6px",
            color: "#1A1A1A",
          }}
        >
          Welcome back, {MOCK_CUSTOMER.firstName}.
        </h2>
        <p style={{ fontSize: "0.88rem", color: "#888", margin: 0 }}>
          Member since {MOCK_CUSTOMER.createdAt}
        </p>
      </div>

      {/* Quick stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {[
          { label: "Total Orders", value: MOCK_ORDERS.length.toString() },
          { label: "Total Spent", value: "$408.00" },
          { label: "Saved Addresses", value: MOCK_ADDRESSES.length.toString() },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "#fff",
              border: "1px solid #eee",
              borderRadius: 4,
              padding: "20px 24px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "'Tenor Sans', sans-serif",
                fontSize: "2rem",
                fontWeight: 500,
                color: "#0D3D2B",
                marginBottom: 4,
              }}
            >
              {stat.value}
            </div>
            <div style={{ fontSize: "0.78rem", color: "#888", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Recent order */}
      <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 4, padding: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h3 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Most Recent Order
          </h3>
          <button
            onClick={() => setTab("orders")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "0.8rem",
              color: "#175C40",
              fontWeight: 600,
              padding: 0,
            }}
          >
            View All Orders →
          </button>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 4 }}>{recentOrder.id}</div>
            <div style={{ fontSize: "0.82rem", color: "#888", marginBottom: 8 }}>{recentOrder.date}</div>
            <StatusBadge status={recentOrder.status} />
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 700, fontSize: "1rem", color: "#0D3D2B" }}>{recentOrder.total}</div>
            <div style={{ fontSize: "0.78rem", color: "#aaa", marginTop: 4 }}>
              {recentOrder.items.length} item{recentOrder.items.length > 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Orders Tab ----
function OrdersTab() {
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <div>
      <h2
        style={{
          fontFamily: "'Tenor Sans', sans-serif",
          fontSize: "1.6rem",
          fontWeight: 400,
          margin: "0 0 24px",
        }}
      >
        Order History
      </h2>
      {/* Shopify note */}
      <div
        style={{
          background: "#E8F3F0",
          border: "1px solid #b2d8c8",
          borderRadius: 4,
          padding: "12px 16px",
          fontSize: "0.8rem",
          color: "#175C40",
          marginBottom: 24,
        }}
      >
        <strong>Shopify Integration:</strong> In deployment, order data is loaded from{" "}
        <code>{"{{ customer.orders }}"}</code> Liquid object. The UI below uses mock data for preview.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {MOCK_ORDERS.map((order) => (
          <div
            key={order.id}
            style={{ background: "#fff", border: "1px solid #eee", borderRadius: 4, overflow: "hidden" }}
          >
            {/* Order header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                cursor: "pointer",
              }}
              onClick={() => setExpanded(expanded === order.id ? null : order.id)}
            >
              <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{order.id}</div>
                  <div style={{ fontSize: "0.78rem", color: "#888", marginTop: 2 }}>{order.date}</div>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0D3D2B" }}>{order.total}</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{
                    transform: expanded === order.id ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                    color: "#888",
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
            {/* Order items (expanded) */}
            {expanded === order.id && (
              <div style={{ borderTop: "1px solid #f0f0f0", padding: "16px 20px" }}>
                {order.items.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      padding: "10px 0",
                      borderBottom: i < order.items.length - 1 ? "1px solid #f5f5f5" : "none",
                    }}
                  >
                    <div
                      style={{
                        width: 52,
                        height: 64,
                        background: "#f5f5f5",
                        borderRadius: 3,
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.2rem",
                      }}
                    >
                      👕
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>{item.name}</div>
                      <div style={{ fontSize: "0.78rem", color: "#888", marginTop: 2 }}>
                        {item.variant} · Qty: {item.qty}
                      </div>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "#0D3D2B" }}>{item.price}</div>
                  </div>
                ))}
                <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
                  <button
                    style={{
                      padding: "9px 18px",
                      background: "#0D3D2B",
                      color: "#fff",
                      border: "none",
                      borderRadius: 2,
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                    }}
                  >
                    Reorder
                  </button>
                  <button
                    style={{
                      padding: "9px 18px",
                      background: "transparent",
                      color: "#555",
                      border: "1px solid #d0ccc7",
                      borderRadius: 2,
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Addresses Tab ----
function AddressesTab() {
  const [showForm, setShowForm] = useState(false);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2
          style={{
            fontFamily: "'Tenor Sans', sans-serif",
            fontSize: "1.6rem",
            fontWeight: 400,
            margin: 0,
          }}
        >
          Saved Addresses
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "9px 18px",
            background: "#0D3D2B",
            color: "#fff",
            border: "none",
            borderRadius: 2,
            fontSize: "0.78rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          + Add Address
        </button>
      </div>

      {/* Add form (preview only) */}
      {showForm && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e0e0e0",
            borderRadius: 4,
            padding: "24px",
            marginBottom: 24,
          }}
        >
          <h3 style={{ margin: "0 0 20px", fontSize: "0.88rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            New Address
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {["First Name", "Last Name", "Address", "Apartment, suite, etc.", "City", "ZIP Code"].map((label) => (
              <div key={label} style={{ gridColumn: label === "Address" || label === "Apartment, suite, etc." ? "1 / -1" : "auto" }}>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#555", marginBottom: 6 }}>
                  {label}
                </label>
                <input
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1.5px solid #d0ccc7",
                    borderRadius: 2,
                    fontSize: "0.88rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  placeholder={label}
                />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <button
              style={{
                padding: "10px 24px",
                background: "#0D3D2B",
                color: "#fff",
                border: "none",
                borderRadius: 2,
                fontSize: "0.8rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Save Address
            </button>
            <button
              onClick={() => setShowForm(false)}
              style={{
                padding: "10px 24px",
                background: "transparent",
                color: "#555",
                border: "1px solid #d0ccc7",
                borderRadius: 2,
                fontSize: "0.8rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        {MOCK_ADDRESSES.map((addr) => (
          <div
            key={addr.id}
            style={{
              background: "#fff",
              border: `1.5px solid ${addr.default ? "#175C40" : "#eee"}`,
              borderRadius: 4,
              padding: "20px",
              position: "relative",
            }}
          >
            {addr.default && (
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  background: "#E8F3F0",
                  color: "#175C40",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "3px 8px",
                  borderRadius: 2,
                }}
              >
                Default
              </div>
            )}
            <div style={{ fontSize: "0.88rem", lineHeight: 1.8, color: "#333" }}>
              <div style={{ fontWeight: 700 }}>
                {addr.firstName} {addr.lastName}
              </div>
              <div>{addr.address1}</div>
              {addr.address2 && <div>{addr.address2}</div>}
              <div>
                {addr.city}, {addr.province} {addr.zip}
              </div>
              <div>{addr.country}</div>
              {addr.phone && <div style={{ color: "#888", marginTop: 4 }}>{addr.phone}</div>}
            </div>
            <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
              <button
                style={{
                  padding: "7px 14px",
                  background: "transparent",
                  color: "#333",
                  border: "1px solid #d0ccc7",
                  borderRadius: 2,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Edit
              </button>
              {!addr.default && (
                <button
                  style={{
                    padding: "7px 14px",
                    background: "transparent",
                    color: "#e53e3e",
                    border: "1px solid #f5c6cb",
                    borderRadius: 2,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Profile Tab ----
function ProfileTab() {
  const [saved, setSaved] = useState(false);
  return (
    <div>
      <h2
        style={{
          fontFamily: "'Tenor Sans', sans-serif",
          fontSize: "1.6rem",
          fontWeight: 400,
          margin: "0 0 24px",
        }}
      >
        Personal Information
      </h2>
      <div
        style={{
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: 4,
          padding: "28px",
          maxWidth: 560,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          {[
            { label: "First Name", value: MOCK_CUSTOMER.firstName },
            { label: "Last Name", value: MOCK_CUSTOMER.lastName },
          ].map((field) => (
            <div key={field.label}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#888",
                  marginBottom: 6,
                }}
              >
                {field.label}
              </label>
              <input
                defaultValue={field.value}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1.5px solid #d0ccc7",
                  borderRadius: 2,
                  fontSize: "0.88rem",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
              />
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              fontSize: "0.72rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#888",
              marginBottom: 6,
            }}
          >
            Email
          </label>
          <input
            defaultValue={MOCK_CUSTOMER.email}
            type="email"
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1.5px solid #d0ccc7",
              borderRadius: 2,
              fontSize: "0.88rem",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label
            style={{
              display: "block",
              fontSize: "0.72rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#888",
              marginBottom: 6,
            }}
          >
            Phone
          </label>
          <input
            defaultValue={MOCK_CUSTOMER.phone}
            type="tel"
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1.5px solid #d0ccc7",
              borderRadius: 2,
              fontSize: "0.88rem",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 20, marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Change Password
          </h3>
          {["Current Password", "New Password", "Confirm New Password"].map((label) => (
            <div key={label} style={{ marginBottom: 12 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#888",
                  marginBottom: 6,
                }}
              >
                {label}
              </label>
              <input
                type="password"
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1.5px solid #d0ccc7",
                  borderRadius: 2,
                  fontSize: "0.88rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          ))}
        </div>
        <button
          onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
          style={{
            padding: "12px 28px",
            background: "#0D3D2B",
            color: "#fff",
            border: "none",
            borderRadius: 2,
            fontSize: "0.8rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "opacity 0.15s",
          }}
        >
          {saved ? "✓ Saved" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

// ---- Preferences Tab ----
function PreferencesTab() {
  const [marketing, setMarketing] = useState(MOCK_CUSTOMER.acceptsMarketing);
  const [prefs, setPrefs] = useState({
    newArrivals: true,
    saleAlerts: true,
    orderUpdates: true,
    communityNews: false,
  });
  return (
    <div>
      <h2
        style={{
          fontFamily: "'Tenor Sans', sans-serif",
          fontSize: "1.6rem",
          fontWeight: 400,
          margin: "0 0 24px",
        }}
      >
        Communication Preferences
      </h2>
      <div
        style={{
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: 4,
          padding: "28px",
          maxWidth: 560,
        }}
      >
        {/* Master toggle */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 0",
            borderBottom: "1px solid #f0f0f0",
            marginBottom: 20,
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>Email Marketing</div>
            <div style={{ fontSize: "0.8rem", color: "#888", marginTop: 3 }}>
              Receive emails about new arrivals, promotions, and events
            </div>
          </div>
          <div
            onClick={() => setMarketing(!marketing)}
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              background: marketing ? "#175C40" : "#ccc",
              position: "relative",
              cursor: "pointer",
              transition: "background 0.2s",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 3,
                left: marketing ? 23 : 3,
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#fff",
                transition: "left 0.2s",
                boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
              }}
            />
          </div>
        </div>

        {/* Specific preferences */}
        <div style={{ opacity: marketing ? 1 : 0.4, transition: "opacity 0.2s", pointerEvents: marketing ? "auto" : "none" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#888", marginBottom: 14 }}>
            Email Topics
          </div>
          {(Object.keys(prefs) as Array<keyof typeof prefs>).map((key) => {
            const labels: Record<string, string> = {
              newArrivals: "New Arrivals",
              saleAlerts: "Sale & Promotions",
              orderUpdates: "Order Updates",
              communityNews: "Community & Events",
            };
            return (
              <div
                key={key}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: "1px solid #f5f5f5",
                }}
              >
                <span style={{ fontSize: "0.88rem", color: "#333" }}>{labels[key]}</span>
                <div
                  onClick={() => setPrefs((p) => ({ ...p, [key]: !p[key] }))}
                  style={{
                    width: 36,
                    height: 20,
                    borderRadius: 10,
                    background: prefs[key] ? "#175C40" : "#ccc",
                    position: "relative",
                    cursor: "pointer",
                    transition: "background 0.2s",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 2,
                      left: prefs[key] ? 18 : 2,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: "#fff",
                      transition: "left 0.2s",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 24 }}>
          <button
            style={{
              padding: "12px 28px",
              background: "#0D3D2B",
              color: "#fff",
              border: "none",
              borderRadius: 2,
              fontSize: "0.8rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================
// ==================== LOGIN / REGISTER PAGE ====================
function LoginPage() {
  const handleLogin = () => {
    const redirectUri = `${window.location.origin}/account`;
    const loginUrl = getCustomerLoginUrl(redirectUri);
    window.location.href = loginUrl;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF9F7" }}>
      <SFPromoBar />
      <SFHeader darkMode />

      <div style={{
        maxWidth: 440,
        margin: "0 auto",
        padding: "120px 24px 80px",
        textAlign: "center",
      }}>
        <h1 style={{
          fontFamily: "'Tenor Sans', sans-serif",
          fontSize: "2rem",
          fontWeight: 400,
          marginBottom: 12,
          color: "#1a1a1a",
        }}>Welcome Back</h1>
        <p style={{ color: "#666", fontSize: 14, marginBottom: 40 }}>
          Sign in to your account to view orders, manage addresses, and more.
        </p>

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "16px 24px",
            background: "#0D3D2B",
            color: "#fff",
            border: "none",
            borderRadius: 2,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase" as const,
            cursor: "pointer",
            marginBottom: 16,
            transition: "background 0.2s",
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
            style={{
              background: "none",
              border: "none",
              color: "#0D3D2B",
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "underline",
              fontSize: 13,
            }}
          >
            Create Account
          </button>
        </p>
      </div>

      <SFFooter />
    </div>
  );
}

export default function AccountPage() {
  const [location] = useLocation();
  const isLoginRoute = location === "/account/login" || location === "/account/register";

  // For login/register routes, show the login page
  // For /account, show the dashboard (in production this would check auth state)
  // Since Shopify Customer Account API uses OAuth, after login the user is redirected back
  // For now, show login page if on /account/login or /account/register
  // Show dashboard for /account (assuming user is authenticated after OAuth redirect)
  if (isLoginRoute) {
    return <LoginPage />;
  }

  return <AccountDashboard />;
}

function AccountDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const TABS: Array<{ id: Tab; label: string }> = [
    { id: "overview", label: "Overview" },
    { id: "orders", label: "Orders" },
    { id: "addresses", label: "Addresses" },
    { id: "profile", label: "Profile" },
    { id: "preferences", label: "Preferences" },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab setTab={setActiveTab} />;
      case "orders":
        return <OrdersTab />;
      case "addresses":
        return <AddressesTab />;
      case "profile":
        return <ProfileTab />;
      case "preferences":
        return <PreferencesTab />;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF9F7" }}>
      <SFPromoBar />
      <SFHeader darkMode />

      {/* Page header */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #eee",
          padding: "32px 24px 0",
          marginTop: "calc(var(--promo-height, 40px) + 64px)",
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            {/* Avatar */}
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "#0D3D2B",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {MOCK_CUSTOMER.firstName[0]}
              {MOCK_CUSTOMER.lastName[0]}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1rem" }}>
                {MOCK_CUSTOMER.firstName} {MOCK_CUSTOMER.lastName}
              </div>
              <div style={{ fontSize: "0.82rem", color: "#888" }}>{MOCK_CUSTOMER.email}</div>
            </div>
            <button
              onClick={() => {
                const logoutUrl = getCustomerLogoutUrl(window.location.origin);
                window.location.href = logoutUrl;
              }}
              style={{
                marginLeft: "auto",
                padding: "8px 16px",
                background: "transparent",
                color: "#555",
                border: "1px solid #d0ccc7",
                borderRadius: 2,
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                cursor: "pointer",
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
                  padding: "12px 20px",
                  background: "none",
                  border: "none",
                  borderBottom: `2px solid ${activeTab === tab.id ? "#0D3D2B" : "transparent"}`,
                  color: activeTab === tab.id ? "#0D3D2B" : "#888",
                  fontSize: "0.82rem",
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  cursor: "pointer",
                  letterSpacing: "0.04em",
                  whiteSpace: "nowrap",
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
