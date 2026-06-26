import React, { useState, useRef, useMemo, useEffect } from "react";
import ReactDOM from "react-dom";
import { Link } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { useThemeConfig } from "@/contexts/ThemeConfigContext";
import { useIsMobile } from "@/hooks/useMobile";

// ---- Design tokens (图1：奶白主体 + 深绿标题栏) ----
const HEADER_BG = "#1a3a2a";      // 深绿标题栏
const HEADER_TEXT = "#f5f0e8";    // 奶白标题文字
const BODY_BG = "#FAF8F4";        // 奶白主体背景
const CARD_BG = "#FFFFFF";        // 产品卡片白色
const CARD_BORDER = "#e8e2d9";    // 卡片边框
const DIVIDER = "#e8e2d9";        // 分割线
const TEXT_PRIMARY = "#1a1a1a";   // 主文字
const TEXT_SECONDARY = "#6b6b6b"; // 次要文字
const TEXT_MUTED = "#aaa";        // 淡色文字
const ACCENT_GREEN = "#1a3a2a";   // 深绿强调色（进度条/按钮）
const PROGRESS_TRACK = "#ddd8d0"; // 进度条轨道
const BTN_CHECKOUT_BG = "#1a3a2a";
const BTN_CHECKOUT_HOVER = "#2d5c42";
const BTN_ADD_BG = "#1a3a2a";
const BTN_ADD_HOVER = "#2d5c42";
const RECOMMEND_BG = "#f0ece5";   // 推荐区背景

// ---- Trash icon ----
function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

// ---- Chevron icon ----
function ChevronIcon({ dir = "right" }: { dir?: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {dir === "right"
        ? <polyline points="9 18 15 12 9 6" />
        : <polyline points="15 18 9 12 15 6" />}
    </svg>
  );
}

// ---- Free shipping progress bar (图1样式：奶白背景) ----
function FreeShippingBar({ subtotal, threshold, text, achievedText }: {
  subtotal: number;
  threshold: number;
  text: string;
  achievedText: string;
}) {
  if (threshold <= 0) return null;
  const progress = Math.min((subtotal / threshold) * 100, 100);
  const achieved = subtotal >= threshold;
  const remaining = (threshold - subtotal).toFixed(2);

  const label = achieved
    ? achievedText
    : text.replace("{{amount}}", `$${remaining}`);

  return (
    <div style={{ padding: "14px 24px 12px", background: BODY_BG, borderBottom: `1px solid ${DIVIDER}` }}>
      <p style={{
        fontSize: 13, color: TEXT_PRIMARY, marginBottom: 8, letterSpacing: "0.01em",
        fontFamily: "'Tenor Sans', sans-serif",
        fontStyle: "italic", fontWeight: 500,
      }}>
        {label}
      </p>
      <div style={{ height: 3, background: PROGRESS_TRACK, borderRadius: 2, overflow: "hidden", marginBottom: 6 }}>
        <div style={{
          height: "100%",
          width: `${progress}%`,
          background: ACCENT_GREEN,
          borderRadius: 2,
          transition: "width 0.5s cubic-bezier(0.23,1,0.32,1)",
        }} />
      </div>
      <p style={{
        fontSize: 11, color: TEXT_SECONDARY, letterSpacing: "0.01em",
        fontFamily: "'Tenor Sans', sans-serif",
        fontStyle: "italic",
      }}>
        ✓ Free returns on all orders
      </p>
    </div>
  );
}

// ---- Recommended product card ----
function RecommendedCard({ product, onAdd }: {
  product: { id: string; name: string; price: string; imageUrl?: string; variants?: Array<{ id: string }>; variantId?: string };
  onAdd: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ flexShrink: 0, width: 150, display: "flex", flexDirection: "column", background: CARD_BG, borderRadius: 6, padding: 10, border: `1px solid ${CARD_BORDER}` }}>
      <div style={{ width: "100%", height: 160, borderRadius: 4, overflow: "hidden", background: "#f0ece5", marginBottom: 8 }}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: TEXT_MUTED }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
        )}
      </div>
      <p style={{
        fontSize: 11.5, color: TEXT_PRIMARY, lineHeight: 1.35, letterSpacing: "0.01em",
        fontFamily: "'Tenor Sans', sans-serif",
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden", margin: 0,
        flexGrow: 1,
      }}>{product.name}</p>
      {/* Price + button pushed to bottom via marginTop: auto */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginTop: "auto", paddingTop: 8 }}>
        <span style={{ fontSize: 12, color: TEXT_PRIMARY, fontWeight: 600 }}>{product.price}</span>
        <button
          onClick={onAdd}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            background: hovered ? BTN_ADD_HOVER : BTN_ADD_BG,
            color: "#fff", border: "none", borderRadius: 20,
            padding: "5px 12px", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
            cursor: "pointer", textTransform: "uppercase" as const,
            transition: "background 0.18s",
          }}
        >+ Add</button>
      </div>
    </div>
  );
}

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalCount, addItem, checkoutUrl, subtotal: shopifySubtotal, isLoading: cartLoading } = useCart();
  const { config } = useThemeConfig();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const drawerWidth = config.cartDrawerWidth ?? 420;
  const isMobile = useIsMobile();
  const cartItemNameFontSize = isMobile
    ? (config.cartItemNameFontSizeMobile ?? 14)
    : (config.cartItemNameFontSizeDesktop ?? 15);
  const cartItemPriceFontSize = isMobile
    ? (config.cartItemPriceFontSizeMobile ?? 13)
    : (config.cartItemPriceFontSizeDesktop ?? 14);
  const threshold = config.freeShippingThreshold ?? 150;
  const freeShippingText = config.freeShippingText ?? "Spend {{amount}} more for free shipping";
  const freeShippingAchievedText = config.freeShippingAchievedText ?? "You've unlocked free shipping! 🎉";

  const subtotal = shopifySubtotal ? parseFloat(shopifySubtotal) : items.reduce((sum, item) => {
    const price = parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0;
    return sum + price * item.quantity;
  }, 0);

  const currencySymbol = items[0]?.price?.replace(/[\d.,\s]/g, "").trim() || "$";

  const cartIds = useMemo(() => new Set(items.map(i => i.id)), [items]);
  const recommendationMode = config.recommendationMode ?? 'manual';
  const showRecommendations = config.showRecommendations ?? true;
  const recommendationTitle = config.recommendationTitle ?? 'PAIR IT PERFECTLY WITH';

  // --- Manual mode: resolve products from cartManualProductIds ---
  const manualRecommendedProducts = useMemo(() => {
    if (recommendationMode !== 'manual') return [];
    const allProducts = config.products || [];
    const manualIds: string[] = (config as any).cartManualProductIds ?? [];
    if (manualIds.length > 0) {
      // Use manually curated list, filtering out items already in cart
      const productMap = new Map(allProducts.map(p => [p.id, p]));
      return manualIds
        .filter(id => !cartIds.has(id))
        .map(id => productMap.get(id))
        .filter(Boolean) as typeof allProducts;
    }
    // Fallback to relatedProductIds when no manual list is set
    const productMap = new Map(allProducts.map(p => [p.id, p]));
    const relatedIds: string[] = [];
    const seen = new Set<string>();
    for (const item of items) {
      const cartProduct = allProducts.find(p => p.id === item.id);
      if (cartProduct?.relatedProductIds) {
        for (const rid of cartProduct.relatedProductIds) {
          if (!seen.has(rid) && !cartIds.has(rid)) { seen.add(rid); relatedIds.push(rid); }
        }
      }
    }
    const related = relatedIds.map(id => productMap.get(id)).filter(Boolean) as typeof allProducts;
    if (related.length < 4) {
      const fallback = allProducts.filter(p => !cartIds.has(p.id) && !seen.has(p.id));
      return [...related, ...fallback].slice(0, 6);
    }
    return related.slice(0, 6);
  }, [config.products, (config as any).cartManualProductIds, cartIds, items, recommendationMode]);

  // --- Auto mode: fetch Shopify productRecommendations for first cart item ---
  const SHOPIFY_STORE_DOMAIN = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN as string;
  const SHOPIFY_STOREFRONT_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN as string;
  const [autoRecommendedProducts, setAutoRecommendedProducts] = useState<typeof manualRecommendedProducts>([]);
  const [autoLoading, setAutoLoading] = useState(false);
  // Use productId (product GID) from the cart item — NOT items[0].id which is the cart line ID
  const firstCartProductId = items[0]?.productId ?? null;

  // Helper: map a raw Storefront API product node to our internal shape
  const mapStorefrontProduct = (p: any) => ({
    id: p.id,
    name: p.title,
    price: `$${parseFloat(p.priceRange.minVariantPrice.amount).toFixed(2)}`,
    imageUrl: p.images.nodes[0]?.url ?? '',
    colors: [],
    detailUrl: `/products/${p.handle}`,
    // Store variants array so onAdd can use prod.variants?.[0]?.id
    variants: p.variants?.nodes ?? [],
  });

  // Helper: fetch best-seller collection as fallback
  const fetchBestSellers = async (): Promise<ReturnType<typeof mapStorefrontProduct>[]> => {
    const gql = `
      query GetBestSellers {
        collection(handle: "best-sellers") {
          products(first: 6) {
            nodes {
              id handle title
              priceRange { minVariantPrice { amount currencyCode } }
              images(first: 1) { nodes { url altText } }
              variants(first: 1) { nodes { id } }
            }
          }
        }
      }
    `;
    try {
      const res = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/api/2024-10/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
        },
        body: JSON.stringify({ query: gql }),
      });
      const json = await res.json();
      const nodes: any[] = json.data?.collection?.products?.nodes ?? [];
      return nodes
        .filter((p: any) => !cartIds.has(p.id))
        .slice(0, 6)
        .map(mapStorefrontProduct);
    } catch {
      return [];
    }
  };

  useEffect(() => {
    if (recommendationMode !== 'auto' || !firstCartProductId || !isOpen) return;
    let cancelled = false;
    setAutoLoading(true);
    // Normalize to full Shopify product GID
    const rawId = firstCartProductId;
    const productGid = rawId.startsWith('gid://shopify/Product/')
      ? rawId
      : rawId.startsWith('gid://')
        ? rawId
        : `gid://shopify/Product/${rawId.replace(/[^0-9]/g, '')}`;
    const gql = `
      query GetRecommendations($productId: ID!) {
        productRecommendations(productId: $productId) {
          id handle title
          priceRange { minVariantPrice { amount currencyCode } }
          images(first: 1) { nodes { url altText } }
          variants(first: 1) { nodes { id } }
        }
      }
    `;
    fetch(`https://${SHOPIFY_STORE_DOMAIN}/api/2024-10/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query: gql, variables: { productId: productGid } }),
    })
      .then(r => r.json())
      .then(async json => {
        if (cancelled) return;
        const nodes: any[] = json.data?.productRecommendations ?? [];
        const mapped = nodes
          .filter((p: any) => !cartIds.has(p.id))
          .slice(0, 6)
          .map(mapStorefrontProduct);
        if (mapped.length > 0) {
          setAutoRecommendedProducts(mapped);
        } else {
          // Primary AI returned empty — try best-sellers collection
          const bestSellers = await fetchBestSellers();
          if (!cancelled) {
            setAutoRecommendedProducts(bestSellers.length > 0 ? bestSellers : manualRecommendedProducts);
          }
        }
      })
      .catch(async () => {
        if (cancelled) return;
        // On API error — try best-sellers, then manual curated
        const bestSellers = await fetchBestSellers();
        if (!cancelled) {
          setAutoRecommendedProducts(bestSellers.length > 0 ? bestSellers : manualRecommendedProducts);
        }
      })
      .finally(() => { if (!cancelled) setAutoLoading(false); });
    return () => { cancelled = true; };
  }, [recommendationMode, firstCartProductId, isOpen, cartIds, SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_TOKEN, manualRecommendedProducts]);

  // In auto mode: prefer AI results; fall back to manual if auto is still empty after load
  const recommendedProducts = recommendationMode === 'auto'
    ? (autoRecommendedProducts.length > 0 ? autoRecommendedProducts : (!autoLoading ? manualRecommendedProducts : []))
    : manualRecommendedProducts;

  const handleCheckout = () => {
    setCheckoutLoading(true);
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
      return;
    }
    // Fallback: if no checkout URL available
    setTimeout(() => {
      setCheckoutLoading(false);
      alert("Unable to proceed to checkout. Please try again.");
    }, 600);
  };

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -170, behavior: "smooth" });
  };
  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 170, behavior: "smooth" });
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        style={{
          position: "fixed", inset: 0, zIndex: 999998,
          background: "rgba(0,0,0,0.40)",
          animation: "cartFadeIn 0.22s ease",
        }}
      />

      {/* Drawer — 奶白主体 + 深绿标题栏 */}
      <div
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 999999,
          width: `min(${drawerWidth}px, 96vw)`,
          background: BODY_BG,
          display: "flex", flexDirection: "column",
          boxShadow: "-8px 0 48px rgba(0,0,0,0.20)",
          animation: "cartSlideIn 0.3s cubic-bezier(0.23,1,0.32,1)",
          fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
        }}
      >
        {/* ---- Header (深绿) ---- */}
        <div style={{
          padding: "20px 24px 18px",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
          background: HEADER_BG,
        }}>
          <span style={{
            fontFamily: "'Tenor Sans', sans-serif",
            fontSize: 22, fontWeight: 400, color: HEADER_TEXT, letterSpacing: "0.08em",
            textTransform: "uppercase" as const,
          }}>
            YOUR CART <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 26, height: 26, borderRadius: "50%",
              border: `1.5px solid ${HEADER_TEXT}`,
              fontSize: 13, fontFamily: "'Inter', sans-serif", fontWeight: 500,
              marginLeft: 6, verticalAlign: "middle",
            }}>{totalCount}</span>
          </span>
          <button
            onClick={closeCart}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: HEADER_TEXT, opacity: 0.75, fontSize: 18, lineHeight: 1, padding: 4,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "0.75")}
            aria-label="Close cart"
          >✕</button>
        </div>

        {/* ---- Free Shipping Progress ---- */}
        {items.length > 0 && (config.showShippingBar ?? true) && (
          <FreeShippingBar
            subtotal={subtotal} threshold={threshold}
            text={freeShippingText} achievedText={freeShippingAchievedText}
          />
        )}

        {/* ---- Items list ---- */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 0" }}>
          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 24px", color: TEXT_SECONDARY }}>
              <div style={{
                fontFamily: "'Tenor Sans', sans-serif",
                fontSize: 28, color: TEXT_PRIMARY, marginBottom: 10, fontWeight: 400,
                letterSpacing: "0.04em",
              }}>Your cart is empty</div>
              <p style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 24, color: TEXT_SECONDARY }}>
                Discover our premium activewear collection
              </p>
              <button
                onClick={closeCart}
                style={{
                  background: BTN_CHECKOUT_BG, color: "#fff", border: "none",
                  padding: "13px 32px", borderRadius: 2, fontSize: 11,
                  fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" as const, cursor: "pointer",
                  transition: "background 0.18s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = BTN_CHECKOUT_HOVER)}
                onMouseLeave={e => (e.currentTarget.style.background = BTN_CHECKOUT_BG)}
              >Continue Shopping</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map((item) => {
                const productPath = item.productUrl || `/products/${item.id}`;
                return (
                  <div key={item.id} style={{
                    display: "flex", gap: 14, padding: "14px 16px",
                    background: CARD_BG, borderRadius: 8,
                    border: `1px solid ${CARD_BORDER}`,
                  }}>
                    {/* Product image */}
                    <Link href={productPath} onClick={closeCart} style={{ textDecoration: "none", flexShrink: 0 }}>
                      <div style={{
                        width: 80, height: 100, borderRadius: 4, overflow: "hidden",
                        background: "#f0ece5", flexShrink: 0,
                      }}>
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: TEXT_MUTED }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Info block */}
                    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                      {/* Name + price row */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                        <Link
                          href={productPath}
                          onClick={closeCart}
                          style={{
                            fontFamily: "var(--font-serif)",
                            fontSize: cartItemNameFontSize, fontWeight: 600, letterSpacing: "0.03em",
                            textDecoration: "underline",
                            textUnderlineOffset: "2px",
                            color: TEXT_PRIMARY, lineHeight: 1.3, flex: 1,
                          } as React.CSSProperties}
                        >
                          {item.name}
                        </Link>
                        <span style={{ fontSize: cartItemPriceFontSize, fontWeight: 600, color: TEXT_PRIMARY, flexShrink: 0 }}>{item.price}</span>
                      </div>

                      {/* Variant info */}
                      {(item.variantTitle || item.selectedColor || item.selectedSize) && (
                        <p style={{ fontSize: 12, color: TEXT_SECONDARY, margin: 0, letterSpacing: "0.01em" }}>
                          {item.variantTitle || [item.selectedColor, item.selectedSize].filter(Boolean).join(" · ")}
                        </p>
                      )}

                      {/* Qty stepper + Remove */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            style={{
                              width: 26, height: 26, border: "none", background: "none",
                              cursor: "pointer", fontSize: 18, color: TEXT_PRIMARY,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              padding: 0, lineHeight: 1,
                            }}
                          >−</button>
                          <span style={{ fontSize: 14, fontWeight: 500, color: TEXT_PRIMARY, minWidth: 14, textAlign: "center" }}>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            style={{
                              width: 26, height: 26, border: "none", background: "none",
                              cursor: "pointer", fontSize: 18, color: TEXT_PRIMARY,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              padding: 0, lineHeight: 1,
                            }}
                          >+</button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          style={{
                            background: "none", border: "none",
                            cursor: "pointer", color: TEXT_MUTED, padding: 4,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "color 0.15s",
                            fontFamily: "'Tenor Sans', sans-serif",
                            fontSize: 12, letterSpacing: "0.04em", textDecoration: "underline",
                            textUnderlineOffset: "2px",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.color = TEXT_PRIMARY)}
                          onMouseLeave={e => (e.currentTarget.style.color = TEXT_MUTED)}
                          title="Remove"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* ---- Recommended (PAIR IT PERFECTLY WITH) ---- */}
              {showRecommendations && (recommendedProducts.length > 0 || autoLoading) && (
                <div style={{ padding: "16px 0 8px", background: RECOMMEND_BG, borderRadius: 8, marginTop: 4 }}>
                  <p style={{
                    fontSize: 10, fontWeight: 700, color: TEXT_SECONDARY,
                    letterSpacing: "0.18em", textTransform: "uppercase" as const,
                    marginBottom: 12, paddingLeft: 16,
                  }}>
                    {recommendationTitle}
                  </p>
                  {autoLoading && (
                    <div style={{ display: 'flex', gap: 10, paddingLeft: 16, paddingRight: 16, paddingBottom: 4 }}>
                      {[1,2,3].map(i => (
                        <div key={i} style={{ width: 130, flexShrink: 0, height: 170, background: '#e8e2d9', borderRadius: 6, opacity: 0.5 }} />
                      ))}
                    </div>
                  )}
                  {/* Scroll container with desktop arrows — hidden while auto-loading */}
                  {!autoLoading && <div style={{ position: "relative" }}>
                    {/* Left arrow (desktop only) */}
                    <button
                      onClick={scrollLeft}
                      style={{
                        position: "absolute", left: -14, top: "50%", transform: "translateY(-50%)",
                        zIndex: 10, background: CARD_BG, border: `1px solid ${CARD_BORDER}`,
                        borderRadius: "50%", width: 30, height: 30,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                        color: TEXT_PRIMARY,
                      }}
                      className="cart-rec-arrow cart-rec-arrow--left"
                      aria-label="Scroll left"
                    >
                      <ChevronIcon dir="left" />
                    </button>

                    <div
                      ref={scrollRef}
                      style={{
                        display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4,
                        paddingLeft: 16, paddingRight: 16,
                        scrollbarWidth: "none" as const,
                      }}
                    >
                      {recommendedProducts.map(prod => (
                        <RecommendedCard
                          key={prod.id}
                          product={prod}
                          onAdd={() => {
                            // DEBUG: Let's see the full object
                            console.log("Full product object for adding:", JSON.stringify(prod, null, 2));

                            // Determine Variant ID safely
                            const variantId = (prod.variants && prod.variants.length > 0)
                              ? prod.variants[0].id
                              : ((prod as any).variantId || prod.id);

                            if (!variantId) {
                              console.error("FAILED to resolve variant ID. Product object:", prod);
                              return;
                            }

                            addItem({
                              id: variantId,
                              name: prod.name,
                              price: prod.price,
                              imageUrl: prod.imageUrl,
                              productUrl: prod.detailUrl,
                            });
                          }}
                        />
                      ))}
                    </div>

                    {/* Right arrow (desktop only) */}
                    <button
                      onClick={scrollRight}
                      style={{
                        position: "absolute", right: -14, top: "50%", transform: "translateY(-50%)",
                        zIndex: 10, background: CARD_BG, border: `1px solid ${CARD_BORDER}`,
                        borderRadius: "50%", width: 30, height: 30,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                        color: TEXT_PRIMARY,
                      }}
                      className="cart-rec-arrow cart-rec-arrow--right"
                      aria-label="Scroll right"
                    >
                      <ChevronIcon dir="right" />
                    </button>
                  </div>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ---- Footer ---- */}
        {items.length > 0 && (
          <div style={{
            padding: "18px 20px 22px",
            borderTop: `1px solid ${DIVIDER}`,
            background: BODY_BG, flexShrink: 0,
          }}>
            {/* Subtotal row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, color: TEXT_PRIMARY,
                letterSpacing: "0.14em", textTransform: "uppercase" as const,
              }}>SUBTOTAL</span>
              <span style={{
                fontFamily: "'Tenor Sans', sans-serif",
                fontWeight: 600, fontSize: 22, color: TEXT_PRIMARY, letterSpacing: "0.02em",
              }}>{currencySymbol}{subtotal.toFixed(2)}</span>
            </div>
            <p style={{
              fontFamily: "'Tenor Sans', sans-serif",
              fontSize: 12, fontStyle: "italic", color: TEXT_SECONDARY, marginBottom: 16,
            }}>Shipping &amp; taxes at checkout</p>

            {/* CHECKOUT button */}
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              style={{
                display: "block", width: "100%",
                background: BTN_CHECKOUT_BG,
                color: "#fff", border: "none",
                padding: "15px 20px", borderRadius: 2,
                fontSize: 12, fontWeight: 700, letterSpacing: "0.16em",
                textTransform: "uppercase" as const, cursor: checkoutLoading ? "wait" : "pointer",
                transition: "background 0.2s",
                marginBottom: 12,
              }}
              onMouseEnter={e => { if (!checkoutLoading) (e.currentTarget as HTMLButtonElement).style.background = BTN_CHECKOUT_HOVER; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = BTN_CHECKOUT_BG; }}
            >
              {checkoutLoading ? "Redirecting..." : "CHECKOUT"}
            </button>

            {/* Continue shopping */}
            <button
              onClick={closeCart}
              style={{
                display: "block", width: "100%", background: "none", border: "none",
                color: TEXT_SECONDARY, letterSpacing: "0.06em",
                textDecoration: "underline", cursor: "pointer", textAlign: "center" as const,
                fontFamily: "'Tenor Sans', sans-serif",
                fontStyle: "italic", fontSize: 13,
              } as React.CSSProperties}
              onMouseEnter={e => (e.currentTarget.style.color = TEXT_PRIMARY)}
              onMouseLeave={e => (e.currentTarget.style.color = TEXT_SECONDARY)}
            >Continue Shopping</button>
          </div>
        )}
      </div>

      {/* Keyframe animations + mobile arrow hide */}
      <style>{`
        @keyframes cartFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes cartSlideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
        .cart-rec-arrow { display: flex !important; }
        @media (max-width: 640px) {
          .cart-rec-arrow { display: none !important; }
        }
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </>,
    document.body
  );
}
