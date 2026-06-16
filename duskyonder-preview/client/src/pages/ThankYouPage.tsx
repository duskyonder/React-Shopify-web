import { SFPromoBar, SFHeader, SFFooter } from "@/components/StorefrontShell";

// ==================== MOCK DATA ====================
const mockOrder = {
  orderNumber: "#DY-10042",
  date: "June 8, 2026",
  email: "sarah@example.com",
  items: [
    {
      id: "1",
      name: "AirLight High-Rise Leggings",
      variant: "Sage Green / M",
      price: "$98.00",
      qty: 1,
      imageUrl: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=120&h=150&fit=crop",
    },
    {
      id: "2",
      name: "SculptFlex Sports Bra",
      variant: "Sage Green / M",
      price: "$68.00",
      qty: 1,
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=120&h=150&fit=crop",
    },
  ],
  subtotal: "$166.00",
  shipping: "Free",
  total: "$166.00",
  shippingAddress: {
    name: "Sarah Chen",
    line1: "123 Maple Street",
    city: "San Francisco, CA 94102",
    country: "United States",
  },
  estimatedDelivery: "June 13–16, 2026",
};

// ==================== ICONS ====================
const CheckCircleIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const PackageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M16.5 9.4 7.55 4.24" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.29 7 12 12 20.71 7" /><line x1="12" y1="22" x2="12" y2="12" />
  </svg>
);

const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

// ==================== STEP TRACKER ====================
function OrderSteps() {
  const steps = [
    { label: "Order Placed", done: true, active: false },
    { label: "Processing", done: false, active: true },
    { label: "Shipped", done: false, active: false },
    { label: "Delivered", done: false, active: false },
  ];
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 0, margin: "32px 0" }}>
      {steps.map((step, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
          {/* Connector line */}
          {i > 0 && (
            <div style={{
              position: "absolute", top: 14, right: "50%", width: "100%", height: 2,
              background: step.done ? "#175C40" : "#E5E5E5",
              zIndex: 0,
            }} />
          )}
          {/* Circle */}
          <div style={{
            width: 28, height: 28, borderRadius: "50%", zIndex: 1,
            background: step.done ? "#175C40" : step.active ? "#fff" : "#F5F5F5",
            border: step.active ? "2px solid #175C40" : step.done ? "2px solid #175C40" : "2px solid #E5E5E5",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.75rem", fontWeight: 700,
            color: step.done ? "#fff" : step.active ? "#175C40" : "#BBB",
          }}>
            {step.done ? "✓" : i + 1}
          </div>
          <div style={{
            marginTop: 8, fontSize: "0.72rem", fontWeight: step.active ? 700 : 500,
            color: step.done || step.active ? "#175C40" : "#999",
            textAlign: "center", letterSpacing: "0.03em",
          }}>
            {step.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ==================== MAIN PAGE ====================
export default function ThankYouPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#FAFAF8", fontFamily: "var(--font-body, sans-serif)" }}>
      <SFPromoBar />
      <SFHeader darkMode={false} />

      <div style={{ paddingTop: "calc(var(--promo-height, 40px) + 72px)", paddingBottom: 80, maxWidth: 720, margin: "0 auto", padding: "calc(var(--promo-height, 40px) + 72px) 24px 80px" }}>

        {/* Hero confirmation */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ color: "#175C40", marginBottom: 16 }}><CheckCircleIcon /></div>
          <div style={{ fontSize: "0.78rem", letterSpacing: "0.18em", color: "#175C40", fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>
            Order Confirmed
          </div>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 700, color: "#1A1A1A", margin: "0 0 12px", letterSpacing: "-0.02em" }}>
            Thank you, {mockOrder.shippingAddress.name.split(" ")[0]}!
          </h1>
          <p style={{ color: "#666", fontSize: "1rem", margin: "0 0 8px" }}>
            Your order <strong>{mockOrder.orderNumber}</strong> has been placed successfully.
          </p>
          <p style={{ color: "#888", fontSize: "0.88rem" }}>
            A confirmation email has been sent to <strong>{mockOrder.email}</strong>
          </p>
        </div>

        {/* Order status tracker */}
        <div style={{ background: "#fff", borderRadius: 8, padding: "28px 32px", marginBottom: 24, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <h2 style={{ fontSize: "0.88rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1A1A1A", margin: 0 }}>
              Order Status
            </h2>
            <span style={{ fontSize: "0.8rem", color: "#888" }}>Est. delivery: {mockOrder.estimatedDelivery}</span>
          </div>
          <OrderSteps />
          <div style={{ fontSize: "0.82rem", color: "#888", borderTop: "1px solid #F0F0F0", paddingTop: 16, marginTop: 4 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <PackageIcon />
              Your order is being processed. You'll receive a shipping confirmation with tracking info shortly.
            </span>
          </div>
        </div>

        {/* Order summary */}
        <div style={{ background: "#fff", borderRadius: 8, padding: "28px 32px", marginBottom: 24, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: "0.88rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1A1A1A", margin: "0 0 20px" }}>
            Order Summary — {mockOrder.orderNumber}
          </h2>
          {mockOrder.items.map(item => (
            <div key={item.id} style={{ display: "flex", gap: 16, paddingBottom: 16, marginBottom: 16, borderBottom: "1px solid #F5F5F5" }}>
              <div style={{ width: 64, height: 80, borderRadius: 4, overflow: "hidden", flexShrink: 0, background: "#F5F5F5" }}>
                <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1A1A1A", marginBottom: 4 }}>{item.name}</div>
                <div style={{ fontSize: "0.8rem", color: "#888", marginBottom: 4 }}>{item.variant}</div>
                <div style={{ fontSize: "0.8rem", color: "#888" }}>Qty: {item.qty}</div>
              </div>
              <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1A1A1A", flexShrink: 0 }}>{item.price}</div>
            </div>
          ))}
          <div style={{ borderTop: "1px solid #F0F0F0", paddingTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#666", marginBottom: 8 }}>
              <span>Subtotal</span><span>{mockOrder.subtotal}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#666", marginBottom: 12 }}>
              <span>Shipping</span><span style={{ color: "#175C40", fontWeight: 600 }}>{mockOrder.shipping}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1rem", fontWeight: 700, color: "#1A1A1A" }}>
              <span>Total</span><span>{mockOrder.total}</span>
            </div>
          </div>
        </div>

        {/* Shipping address */}
        <div style={{ background: "#fff", borderRadius: 8, padding: "28px 32px", marginBottom: 40, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: "0.88rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1A1A1A", margin: "0 0 16px" }}>
            Shipping To
          </h2>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ color: "#175C40", marginTop: 2 }}><MapPinIcon /></div>
            <div style={{ fontSize: "0.9rem", color: "#555", lineHeight: 1.7 }}>
              <div style={{ fontWeight: 600, color: "#1A1A1A" }}>{mockOrder.shippingAddress.name}</div>
              <div>{mockOrder.shippingAddress.line1}</div>
              <div>{mockOrder.shippingAddress.city}</div>
              <div>{mockOrder.shippingAddress.country}</div>
            </div>
          </div>
        </div>

        {/* CTA buttons */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <a
            href="/account/orders"
            style={{
              padding: "14px 32px", background: "#175C40", color: "#fff",
              textDecoration: "none", borderRadius: 4, fontWeight: 600,
              fontSize: "0.88rem", letterSpacing: "0.08em", textTransform: "uppercase",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#0F3D2A")}
            onMouseLeave={e => (e.currentTarget.style.background = "#175C40")}
          >
            View My Orders
          </a>
          <a
            href="/collections/all"
            style={{
              padding: "14px 32px", background: "transparent", color: "#1A1A1A",
              textDecoration: "none", borderRadius: 4, fontWeight: 600,
              fontSize: "0.88rem", letterSpacing: "0.08em", textTransform: "uppercase",
              border: "1.5px solid #1A1A1A",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#1A1A1A"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1A1A1A"; }}
          >
            Continue Shopping
          </a>
        </div>

        {/* Email confirmation note */}
        <div style={{ textAlign: "center", marginTop: 40, padding: "20px 24px", background: "#F0F7F4", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <div style={{ color: "#175C40" }}><MailIcon /></div>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#555" }}>
            Didn't receive an email? Check your spam folder or{" "}
            <a href="/pages/contact" style={{ color: "#175C40", fontWeight: 600, textDecoration: "none" }}>contact us</a>.
          </p>
        </div>
      </div>

      <SFFooter />
    </div>
  );
}
