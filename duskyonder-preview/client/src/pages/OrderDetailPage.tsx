import { SFPromoBar, SFHeader, SFFooter } from "@/components/StorefrontShell";

// ==================== MOCK DATA ====================
const mockOrderDetail = {
  id: "DY-10042",
  date: "June 8, 2026",
  status: "Processing",
  statusColor: "#E8A020",
  email: "sarah@example.com",
  items: [
    {
      id: "1",
      name: "AirLight High-Rise Leggings",
      variant: "Sage Green / M",
      price: "$98.00",
      qty: 1,
      imageUrl: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=120&h=150&fit=crop",
      sku: "AL-HR-SG-M",
    },
    {
      id: "2",
      name: "SculptFlex Sports Bra",
      variant: "Sage Green / M",
      price: "$68.00",
      qty: 1,
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=120&h=150&fit=crop",
      sku: "SF-SB-SG-M",
    },
  ],
  subtotal: "$166.00",
  shipping: "Free",
  discount: null as string | null,
  total: "$166.00",
  shippingAddress: {
    name: "Sarah Chen",
    line1: "123 Maple Street",
    city: "San Francisco, CA 94102",
    country: "United States",
  },
  billingAddress: {
    name: "Sarah Chen",
    line1: "123 Maple Street",
    city: "San Francisco, CA 94102",
    country: "United States",
  },
  paymentMethod: "Visa ending in 4242",
  estimatedDelivery: "June 13–16, 2026",
  trackingNumber: null as string | null,
  timeline: [
    { event: "Order placed", time: "June 8, 2026 at 10:32 AM", done: true },
    { event: "Payment confirmed", time: "June 8, 2026 at 10:33 AM", done: true },
    { event: "Processing", time: "In progress", done: false, active: true },
    { event: "Shipped", time: "Estimated June 10", done: false },
    { event: "Delivered", time: "Estimated June 13–16", done: false },
  ],
};

// ==================== ICONS ====================
const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
);

const TruckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const CreditCardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

// ==================== TIMELINE ====================
function OrderTimeline({ events }: { events: typeof mockOrderDetail.timeline }) {
  return (
    <div style={{ position: "relative", paddingLeft: 28 }}>
      {/* Vertical line */}
      <div style={{ position: "absolute", left: 9, top: 8, bottom: 8, width: 2, background: "#E5E5E5" }} />
      {events.map((event, i) => (
        <div key={i} style={{ position: "relative", paddingBottom: i < events.length - 1 ? 20 : 0 }}>
          {/* Dot */}
          <div style={{
            position: "absolute", left: -28, top: 2,
            width: 18, height: 18, borderRadius: "50%",
            background: event.done ? "#175C40" : (event as any).active ? "#fff" : "#F0F0F0",
            border: (event as any).active ? "2px solid #E8A020" : event.done ? "2px solid #175C40" : "2px solid #E5E5E5",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1,
          }}>
            {event.done && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            {(event as any).active && (
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#E8A020" }} />
            )}
          </div>
          <div style={{ paddingLeft: 4 }}>
            <div style={{
              fontWeight: event.done || (event as any).active ? 700 : 500,
              fontSize: "0.88rem",
              color: event.done ? "#1A1A1A" : (event as any).active ? "#E8A020" : "#BBB",
              marginBottom: 2,
            }}>
              {event.event}
            </div>
            <div style={{ fontSize: "0.78rem", color: "#999" }}>{event.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ==================== INFO CARD ====================
function InfoCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", borderRadius: 8, padding: "24px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ color: "#175C40" }}>{icon}</div>
        <h3 style={{ margin: 0, fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1A1A1A" }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

// ==================== MAIN PAGE ====================
export default function OrderDetailPage() {
  const order = mockOrderDetail;

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAF8", fontFamily: "var(--font-body, sans-serif)" }}>
      <SFPromoBar />
      <SFHeader darkMode={false} />

      <div style={{ paddingTop: "calc(var(--promo-height, 40px) + 72px)", maxWidth: 960, margin: "0 auto", padding: "calc(var(--promo-height, 40px) + 72px) 24px 80px" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28, fontSize: "0.82rem", color: "#888" }}>
          <a href="/account" style={{ color: "#888", textDecoration: "none" }}>Account</a>
          <span>/</span>
          <a href="/account/orders" style={{ color: "#888", textDecoration: "none" }}>Orders</a>
          <span>/</span>
          <span style={{ color: "#1A1A1A", fontWeight: 600 }}>#{order.id}</span>
        </div>

        {/* Page header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700, color: "#1A1A1A", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
              Order #{order.id}
            </h1>
            <p style={{ color: "#888", fontSize: "0.88rem", margin: 0 }}>Placed on {order.date}</p>
          </div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "8px 16px", borderRadius: 20,
            background: order.statusColor + "18", color: order.statusColor,
            fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.04em",
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: order.statusColor, display: "inline-block" }} />
            {order.status}
          </div>
        </div>

        {/* Main grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr min(320px, 35%)", gap: 24, alignItems: "start" }}>

          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Order items */}
            <div style={{ background: "#fff", borderRadius: 8, padding: "24px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
              <h3 style={{ margin: "0 0 20px", fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1A1A1A" }}>
                Items Ordered
              </h3>
              {order.items.map((item, i) => (
                <div key={item.id} style={{
                  display: "flex", gap: 16,
                  paddingBottom: i < order.items.length - 1 ? 16 : 0,
                  marginBottom: i < order.items.length - 1 ? 16 : 0,
                  borderBottom: i < order.items.length - 1 ? "1px solid #F5F5F5" : "none",
                }}>
                  <div style={{ width: 72, height: 88, borderRadius: 4, overflow: "hidden", flexShrink: 0, background: "#F5F5F5" }}>
                    <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.92rem", color: "#1A1A1A", marginBottom: 4 }}>{item.name}</div>
                    <div style={{ fontSize: "0.8rem", color: "#888", marginBottom: 4 }}>{item.variant}</div>
                    <div style={{ fontSize: "0.78rem", color: "#AAA", marginBottom: 8 }}>SKU: {item.sku}</div>
                    <div style={{ fontSize: "0.8rem", color: "#888" }}>Qty: {item.qty}</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1A1A1A", flexShrink: 0 }}>{item.price}</div>
                </div>
              ))}

              {/* Totals */}
              <div style={{ borderTop: "1px solid #F0F0F0", paddingTop: 16, marginTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#666", marginBottom: 8 }}>
                  <span>Subtotal</span><span>{order.subtotal}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#666", marginBottom: order.discount ? 8 : 12 }}>
                  <span>Shipping</span><span style={{ color: "#175C40", fontWeight: 600 }}>{order.shipping}</span>
                </div>
                {order.discount && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#175C40", marginBottom: 12 }}>
                    <span>Discount</span><span>-{order.discount}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1rem", fontWeight: 700, color: "#1A1A1A", borderTop: "1px solid #F0F0F0", paddingTop: 12 }}>
                  <span>Total</span><span>{order.total}</span>
                </div>
              </div>
            </div>

            {/* Shipping & Payment */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <InfoCard icon={<MapPinIcon />} title="Ship To">
                <div style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.7 }}>
                  <div style={{ fontWeight: 600, color: "#1A1A1A" }}>{order.shippingAddress.name}</div>
                  <div>{order.shippingAddress.line1}</div>
                  <div>{order.shippingAddress.city}</div>
                  <div>{order.shippingAddress.country}</div>
                </div>
              </InfoCard>
              <InfoCard icon={<CreditCardIcon />} title="Payment">
                <div style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.7 }}>
                  <div style={{ fontWeight: 600, color: "#1A1A1A", marginBottom: 4 }}>{order.paymentMethod}</div>
                  <div>Total charged: {order.total}</div>
                </div>
              </InfoCard>
            </div>

            {/* Tracking */}
            <InfoCard icon={<TruckIcon />} title="Tracking">
              {order.trackingNumber ? (
                <div style={{ fontSize: "0.88rem", color: "#555" }}>
                  <div style={{ fontWeight: 600, color: "#1A1A1A", marginBottom: 4 }}>Tracking #: {order.trackingNumber}</div>
                  <a href="#" style={{ color: "#175C40", fontWeight: 600, textDecoration: "none", fontSize: "0.85rem" }}>Track Package →</a>
                </div>
              ) : (
                <div style={{ fontSize: "0.88rem", color: "#888" }}>
                  Tracking information will be available once your order ships.
                  <br />
                  <span style={{ color: "#555", fontWeight: 600 }}>Estimated ship date: June 10, 2026</span>
                </div>
              )}
            </InfoCard>
          </div>

          {/* Right column — Timeline */}
          <div style={{ background: "#fff", borderRadius: 8, padding: "24px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", position: "sticky", top: 100 }}>
            <h3 style={{ margin: "0 0 24px", fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1A1A1A" }}>
              Order Timeline
            </h3>
            <OrderTimeline events={order.timeline} />

            <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid #F0F0F0" }}>
              <a
                href="/pages/returns"
                style={{
                  display: "block", textAlign: "center",
                  padding: "10px 16px", border: "1.5px solid #E5E5E5",
                  borderRadius: 4, color: "#555", textDecoration: "none",
                  fontSize: "0.82rem", fontWeight: 600, letterSpacing: "0.04em",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#175C40"; e.currentTarget.style.color = "#175C40"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E5E5"; e.currentTarget.style.color = "#555"; }}
              >
                Request Return / Exchange
              </a>
              <a
                href="/pages/contact"
                style={{
                  display: "block", textAlign: "center", marginTop: 10,
                  padding: "10px 16px",
                  color: "#888", textDecoration: "none",
                  fontSize: "0.82rem", fontWeight: 500,
                }}
              >
                Need Help? Contact Us
              </a>
            </div>
          </div>
        </div>

        {/* Back link */}
        <div style={{ marginTop: 32 }}>
          <a href="/account/orders" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#888", fontSize: "0.85rem", textDecoration: "none" }}>
            <ChevronLeftIcon /> Back to Orders
          </a>
        </div>
      </div>

      <SFFooter />
    </div>
  );
}
