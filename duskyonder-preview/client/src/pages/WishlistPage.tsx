import React, { useState } from "react";
import { useThemeConfig } from "@/contexts/ThemeConfigContext";
import { useCart } from "@/contexts/CartContext";
import { SFPromoBar, SFHeader, SFFooter } from "@/components/StorefrontShell";

// ==================== WISHLIST PAGE ====================
// Shopify equivalent: /wishlist (customer.metafields or third-party app)
// Shopify Liquid interface: {{ customer.metafields.wishlist.items }}
// This is a high-fidelity UI demo using mock data from ThemeConfig products

export default function WishlistPage() {
  const { config } = useThemeConfig();
  const { addItem, openCart } = useCart();

  // Use products from ThemeConfig as mock wishlist items
  const allProducts = config.products || [];
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(
    () => new Set(allProducts.slice(0, 4).map((p) => p.id))
  );
  const [addedToCart, setAddedToCart] = useState<Set<string>>(new Set());

  const wishlistProducts = allProducts.filter((p) => wishlistIds.has(p.id));

  const removeFromWishlist = (id: string) => {
    setWishlistIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
  };

  const handleAddToCart = (product: typeof allProducts[0]) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });
    setAddedToCart((prev) => { const next = new Set(prev); next.add(product.id); return next; });
    setTimeout(() => {
      setAddedToCart((prev) => { const next = new Set(prev); next.delete(product.id); return next; });
    }, 1500);
    openCart();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF9F7" }}>
      <SFPromoBar />
      <SFHeader darkMode />

      {/* Page Header */}
      <div
        style={{
          marginTop: "calc(var(--promo-height, 40px) + 64px)",
          padding: "48px 24px 32px",
          maxWidth: 1200,
          margin: "calc(var(--promo-height, 40px) + 64px) auto 0",
          borderBottom: "1px solid #e8e4df",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap" }}>
          <h1
            style={{
              fontFamily: "'Tenor Sans', sans-serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 400,
              margin: 0,
              color: "#1A1A1A",
              letterSpacing: "-0.01em",
            }}
          >
            My Wishlist
          </h1>
          <span style={{ fontSize: "0.85rem", color: "#888", fontWeight: 400 }}>
            {wishlistProducts.length} {wishlistProducts.length === 1 ? "item" : "items"}
          </span>
        </div>
        <p style={{ margin: "12px 0 0", fontSize: "0.88rem", color: "#888", lineHeight: 1.6 }}>
          {/* Shopify Liquid: {{ customer.metafields.wishlist.items | size }} items saved */}
          Items you've saved for later. Add to cart when you're ready.
        </p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 80px" }}>
        {wishlistProducts.length === 0 ? (
          /* Empty state */
          <div
            style={{
              textAlign: "center",
              padding: "80px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "#E8F3F0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#175C40" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <h2
              style={{
                fontFamily: "'Tenor Sans', sans-serif",
                fontSize: "1.8rem",
                fontWeight: 400,
                margin: 0,
                color: "#1A1A1A",
              }}
            >
              Your wishlist is empty
            </h2>
            <p style={{ fontSize: "0.88rem", color: "#888", maxWidth: 360, lineHeight: 1.65, margin: 0 }}>
              Save items you love by clicking the heart icon on any product. They'll appear here for easy access.
            </p>
            <a
              href="/collections"
              style={{
                display: "inline-block",
                marginTop: 8,
                padding: "12px 32px",
                background: "#0D3D2B",
                color: "#fff",
                borderRadius: 2,
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              Explore Collections
            </a>
          </div>
        ) : (
          <>
            {/* Actions bar */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24, gap: 12 }}>
              <button
                onClick={() => {
                  wishlistProducts.forEach((p) => handleAddToCart(p));
                }}
                style={{
                  padding: "10px 24px",
                  background: "#0D3D2B",
                  color: "#fff",
                  border: "none",
                  borderRadius: 2,
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                Add All to Cart
              </button>
              <button
                onClick={() => setWishlistIds(new Set())}
                style={{
                  padding: "10px 20px",
                  background: "transparent",
                  color: "#888",
                  border: "1px solid #d0ccc7",
                  borderRadius: 2,
                  fontSize: "0.78rem",
                  cursor: "pointer",
                }}
              >
                Clear All
              </button>
            </div>

            {/* Product grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 24,
              }}
            >
              {wishlistProducts.map((product) => (
                <div
                  key={product.id}
                  style={{
                    background: "#fff",
                    borderRadius: 4,
                    overflow: "hidden",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                    transition: "box-shadow 0.2s",
                    position: "relative",
                  }}
                >
                  {/* Product image */}
                  <a href={`/products/${product.detailUrl?.split('/').pop() || product.id}`} style={{ display: "block", position: "relative", aspectRatio: "3/4", background: "#1A3D2B", overflow: "hidden" }}>
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", fontSize: "0.75rem" }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21,15 16,10 5,21" />
                        </svg>
                      </div>
                    )}

                    {/* Badges */}
                    {product.badge && (
                      <div style={{ position: "absolute", top: 12, left: 12, background: "#175C40", color: "#fff", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", padding: "3px 8px", borderRadius: 2, textTransform: "uppercase" }}>
                        {product.badge}
                      </div>
                    )}
                  </a>

                  {/* Remove button */}
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    title="Remove from wishlist"
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.9)",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#e55" stroke="#e55" strokeWidth="1.5">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>

                  {/* Product info */}
                  <div style={{ padding: "16px 16px 20px" }}>
                    <a href={`/products/${product.detailUrl?.split('/').pop() || product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                      <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#1A1A1A", marginBottom: 6, lineHeight: 1.35 }}>
                        {product.name}
                      </div>
                    </a>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                      <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#175C40" }}>
                        ${product.price}
                      </span>
  
                    </div>

                    {/* Color swatches (if available) */}
                    {product.colors && product.colors.length > 0 && (
                      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                        {product.colors.slice(0, 5).map((color, ci) => (
                          <div
                            key={ci}
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: "50%",
                              background: typeof color === "string" ? color : "#ccc",
                              border: "1.5px solid rgba(0,0,0,0.1)",
                            }}
                          />
                        ))}
                        {product.colors.length > 5 && (
                          <span style={{ fontSize: "0.72rem", color: "#888", alignSelf: "center" }}>+{product.colors.length - 5}</span>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => handleAddToCart(product)}
                      style={{
                        width: "100%",
                        padding: "11px 0",
                        background: addedToCart.has(product.id) ? "#175C40" : "#0D3D2B",
                        color: "#fff",
                        border: "none",
                        borderRadius: 2,
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                    >
                      {addedToCart.has(product.id) ? "✓ Added to Cart" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue shopping */}
            <div style={{ textAlign: "center", marginTop: 48 }}>
              <a
                href="/collections"
                style={{ fontSize: "0.82rem", color: "#175C40", fontWeight: 600, textDecoration: "none", letterSpacing: "0.05em" }}
              >
                ← Continue Shopping
              </a>
            </div>
          </>
        )}
      </div>

      <SFFooter />
    </div>
  );
}
