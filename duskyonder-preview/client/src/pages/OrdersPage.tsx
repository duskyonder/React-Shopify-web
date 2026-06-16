import { useState } from "react";
import { SFPromoBar, SFHeader, SFFooter } from "@/components/StorefrontShell";

// ==================== MOCK DATA ====================
const mockOrders = [
  {
    id: "DY-10042",
    date: "June 8, 2026",
    status: "Processing",
    statusColor: "#E8A020",
    total: "$166.00",
    items: [
      { name: "AirLight High-Rise Leggings", variant: "Sage Green / M", qty: 1, imageUrl: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=80&h=100&fit=crop" },
      { name: "SculptFlex Sports Bra", variant: "Sage Green / M", qty: 1, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=80&h=100&fit=crop" },
    ],
  },
  {
    id: "DY-10031",
    date: "May 22, 2026",
    status: "Delivered",
    statusColor: "#175C40",
    total: "$98.00",
    items: [
      { name: "EcoMove Shorts", variant: "Charcoal / S", qty: 1, imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=80&h=100&fit=crop" },
    ],
  },
  {
    id: "DY-10018",
    date: "April 5, 2026",
    status: "Delivered",
    statusColor: "#175C40",
    total: "$234.00",
    items: [
      { name: "CloudSoft Hoodie", variant: "Oat / L", qty: 1, imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=80&h=100&fit=crop" },
      { name: "AirLight Leggings", variant: "Black / L", qty: 1, imageUrl: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=80&h=100&fit=crop" },
      { name: "SculptFlex Bra", variant: "Black / L", qty: 1, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=80&h=100&fit=crop" },
    ],
  },
  {
    id: "DY-10005",
    date: "February 14, 2026",
    status: "Delivered",
    statusColor: "#175C40",
    total: "$68.00",
    items: [
      { name: "SculptFlex Sports Bra", variant: "Dusty Rose / S", qty: 1, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=80&h=100&fit=crop" },
    ],
  },
];

// ==================== STATUS BADGE ====================
function StatusBadge({ status, color }: { status: string; color: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 10px", borderRadius: 20,
      background: color + "18", color,
      fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.04em",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />
      {status}
    </span>
  );
}

// ==================== ORDER CARD ====================
function OrderCard({ order }: { order: typeof mockOrders[0] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      background: "#fff", borderRadius: 8, marginBottom: 16,
      boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 24px", flexWrap: "wrap", gap: 12,
        cursor: "pointer",
      }} onClick={() => setExpanded(!expanded)}>
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "0.72rem", color: "#888", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Order</div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1A1A1A" }}>#{order.id}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.72rem", color: "#888", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Date</div>
            <div style={{ fontWeight: 500, fontSize: "0.88rem", color: "#555" }}>{order.date}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.72rem", color: "#888", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Total</div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1A1A1A" }}>{order.total}</div>
          </div>
          <StatusBadge status={order.status} color={order.statusColor} />
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a
            href={`/account/orders/${order.id}`}
            style={{
              padding: "8px 18px", background: "transparent", color: "#175C40",
              textDecoration: "none", borderRadius: 4, fontWeight: 600,
              fontSize: "0.8rem", letterSpacing: "0.06em", textTransform: "uppercase",
              border: "1.5px solid #175C40",
            }}
            onClick={e => e.stopPropagation()}
          >
            View Details
          </a>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"
            style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* Expanded items */}
      {expanded && (
        <div style={{ borderTop: "1px solid #F5F5F5", padding: "16px 24px" }}>
          {order.items.map((item, i) => (
            <div key={i} style={{
              display: "flex", gap: 14, alignItems: "center",
              paddingBottom: i < order.items.length - 1 ? 14 : 0,
              marginBottom: i < order.items.length - 1 ? 14 : 0,
              borderBottom: i < order.items.length - 1 ? "1px solid #F5F5F5" : "none",
            }}>
              <div style={{ width: 52, height: 64, borderRadius: 4, overflow: "hidden", flexShrink: 0, background: "#F5F5F5" }}>
                <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "#1A1A1A", marginBottom: 3 }}>{item.name}</div>
                <div style={{ fontSize: "0.78rem", color: "#888" }}>{item.variant} · Qty {item.qty}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== MAIN PAGE ====================
export default function OrdersPage() {
  const [filter, setFilter] = useState<"all" | "processing" | "delivered">("all");

  const filtered = mockOrders.filter(o => {
    if (filter === "all") return true;
    if (filter === "processing") return o.status === "Processing";
    if (filter === "delivered") return o.status === "Delivered";
    return true;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAF8", fontFamily: "var(--font-body, sans-serif)" }}>
      <SFPromoBar />
      <SFHeader darkMode={false} />

      <div style={{ paddingTop: "calc(var(--promo-height, 40px) + 72px)", maxWidth: 800, margin: "0 auto", padding: "calc(var(--promo-height, 40px) + 72px) 24px 80px" }}>

        {/* Page header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: "0.72rem", letterSpacing: "0.18em", color: "#175C40", fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>
            My Account
          </div>
          <h1 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 700, color: "#1A1A1A", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
            Order History
          </h1>
          <p style={{ color: "#888", fontSize: "0.9rem", margin: 0 }}>
            {mockOrders.length} orders placed
          </p>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "#F5F5F5", padding: 4, borderRadius: 6, width: "fit-content" }}>
          {(["all", "processing", "delivered"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "8px 18px", borderRadius: 4, border: "none", cursor: "pointer",
                background: filter === f ? "#fff" : "transparent",
                color: filter === f ? "#1A1A1A" : "#888",
                fontWeight: filter === f ? 700 : 500,
                fontSize: "0.82rem", letterSpacing: "0.04em",
                textTransform: "capitalize",
                boxShadow: filter === f ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.15s",
              }}
            >
              {f === "all" ? "All Orders" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Orders list */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px", color: "#888" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>📦</div>
            <div style={{ fontWeight: 600, fontSize: "1rem", color: "#555", marginBottom: 8 }}>No orders found</div>
            <a href="/collections/all" style={{ color: "#175C40", fontWeight: 600, textDecoration: "none", fontSize: "0.9rem" }}>
              Start Shopping →
            </a>
          </div>
        ) : (
          filtered.map(order => <OrderCard key={order.id} order={order} />)
        )}

        {/* Back to account */}
        <div style={{ marginTop: 32, textAlign: "center" }}>
          <a href="/account" style={{ color: "#888", fontSize: "0.85rem", textDecoration: "none" }}>
            ← Back to Account
          </a>
        </div>
      </div>

      <SFFooter />
    </div>
  );
}
