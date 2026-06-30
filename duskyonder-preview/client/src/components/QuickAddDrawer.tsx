import { useState, useEffect, useRef } from "react";
import { useCart } from "@/contexts/CartContext";
import { fetchProductByHandle, ShopifyProduct, ShopifyProductVariant } from "@/lib/shopify";

// ---- Design tokens (matches CartDrawer palette) ----
const HEADER_BG = "#1a3a2a";
const HEADER_TEXT = "#f5f0e8";
const BODY_BG = "#FAF8F4";
const CARD_BORDER = "#e8e2d9";
const TEXT_PRIMARY = "#1a1a1a";
const TEXT_SECONDARY = "#6b6b6b";
const ACCENT_GREEN = "#1a3a2a";
const BTN_HOVER = "#2d5c42";

export interface QuickAddProduct {
  /** Shopify product handle — used to fetch live variant data */
  handle?: string | null;
  /** Fallback product GID when handle is unavailable */
  id: string;
  name: string;
  price: string;
  comparePrice?: string;
  imageUrl?: string | null;
  productUrl?: string | null;
  /** Pre-populated colors (fallback when Shopify data not yet loaded) */
  colors?: string[];
  /** Pre-populated sizes (fallback when Shopify data not yet loaded) */
  sizes?: string[];
  /** Color → image mapping */
  colorImages?: Record<string, string>;
}

interface QuickAddDrawerProps {
  product: QuickAddProduct | null;
  onClose: () => void;
}

/**
 * Unified Quick-Add bottom-sheet drawer.
 * - Fetches live Shopify variant data via product handle
 * - Shows color swatches + size grid
 * - Pre-selects first available variant on open
 * - Resolves exact variant GID before calling addItem
 */
export function QuickAddDrawer({ product, onClose }: QuickAddDrawerProps) {
  const { addItem, openCart } = useCart();

  const [shopifyProduct, setShopifyProduct] = useState<ShopifyProduct | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [sheetY, setSheetY] = useState(0);
  const dragStartY = useRef<number | null>(null);

  // Reset state when product changes
  useEffect(() => {
    setShopifyProduct(null);
    setSelectedColor(null);
    setSelectedSize(null);
    setAdding(false);
    setSheetY(0);
  }, [product?.id]);

  // Fetch live Shopify data
  useEffect(() => {
    if (!product?.handle) return;
    fetchProductByHandle(product.handle).then(p => {
      setShopifyProduct(p);
      if (p) {
        // Pre-select first available variant's color + size
        const firstAvailable = p.variants.find(v => v.availableForSale) ?? p.variants[0];
        if (firstAvailable) {
          const colorOpt = firstAvailable.selectedOptions.find(o => o.name.toLowerCase() === "color");
          const sizeOpt = firstAvailable.selectedOptions.find(o => o.name.toLowerCase() === "size");
          if (colorOpt) setSelectedColor(colorOpt.value);
          if (sizeOpt) setSelectedSize(sizeOpt.value);
        }
      }
    });
  }, [product?.handle]);

  // Derive colors from Shopify or fallback
  const colorEntries: Array<{ name: string; hex: string | null }> = shopifyProduct
    ? (shopifyProduct.options.find(o => o.name.toLowerCase() === "color")?.optionValues ?? []).map(v => ({
        name: v.name,
        hex: v.swatch?.color ?? null,
      }))
    : (product?.colors ?? []).map(c => ({
        name: c,
        hex: /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(c.trim()) ? c : null,
      }));

  // Derive sizes from Shopify or fallback
  const sizes: string[] = shopifyProduct
    ? shopifyProduct.options
        .filter(o => o.name.toLowerCase() !== "color")
        .flatMap(o => o.optionValues.map(v => v.name))
    : (product?.sizes ?? []);

  // Determine which sizes are available for the selected color
  const isSizeAvailable = (size: string): boolean => {
    if (!shopifyProduct) return true;
    return shopifyProduct.variants.some(v => {
      const sizeOk = v.selectedOptions.some(o => o.name.toLowerCase() === "size" && o.value === size);
      const colorOk = !selectedColor || v.selectedOptions.some(o => o.name.toLowerCase() === "color" && o.value === selectedColor);
      return sizeOk && colorOk && v.availableForSale;
    });
  };

  // Resolve the best matching variant GID
  const resolveVariantId = (): string | null => {
    if (!shopifyProduct?.variants?.length) return product?.id ?? null;
    const findVariant = (requireAvailable: boolean): ShopifyProductVariant | undefined => {
      return shopifyProduct.variants.find(v => {
        const colorOk = !selectedColor || v.selectedOptions.some(o => o.name.toLowerCase() === "color" && o.value === selectedColor);
        const sizeOk = !selectedSize || v.selectedOptions.some(o => o.name.toLowerCase() === "size" && o.value === selectedSize);
        const availOk = !requireAvailable || v.availableForSale;
        return colorOk && sizeOk && availOk;
      });
    };
    const matched = findVariant(true) ?? findVariant(false) ?? shopifyProduct.variants[0];
    return matched?.id ?? null;
  };

  // Displayed image: color-mapped or product default
  const displayImage = (selectedColor && product?.colorImages?.[selectedColor])
    ? product.colorImages[selectedColor]
    : product?.imageUrl ?? null;

  // Drag-to-dismiss
  const handleTouchStart = (e: React.TouchEvent) => { dragStartY.current = e.touches[0].clientY; };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    const dy = e.touches[0].clientY - dragStartY.current;
    if (dy > 0) setSheetY(dy);
  };
  const handleTouchEnd = () => {
    if (sheetY > 80) onClose();
    setSheetY(0);
    dragStartY.current = null;
  };

  const handleAddToCart = async () => {
    if (!product) return;
    const variantId = resolveVariantId();
    if (!variantId) {
      console.error("QuickAddDrawer: Could not resolve variant ID for", product);
      return;
    }
    console.log("QuickAddDrawer: Adding variant", variantId);
    setAdding(true);
    try {
      await addItem({
        variantId,
        name: product.name,
        price: product.price,
        imageUrl: displayImage ?? undefined,
        productUrl: product.productUrl ?? undefined,
        selectedColor: selectedColor ?? undefined,
        selectedSize: selectedSize ?? undefined,
      });
      openCart();
      onClose();
    } finally {
      setAdding(false);
    }
  };

  if (!product) return null;

  const isOpen = !!product;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.45)",
          zIndex: 8500,
          opacity: isOpen ? 1 : 0,
          transition: "opacity 0.25s",
          pointerEvents: isOpen ? "auto" : "none",
        }}
      />

      {/* Bottom sheet */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0,
          zIndex: 8501,
          background: BODY_BG,
          borderRadius: "16px 16px 0 0",
          boxShadow: "0 -4px 32px rgba(0,0,0,0.18)",
          transform: `translateY(${sheetY}px)`,
          transition: sheetY === 0 ? "transform 0.3s cubic-bezier(0.23,1,0.32,1)" : "none",
          maxHeight: "90svh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "#ccc" }} />
        </div>

        {/* Header */}
        <div style={{
          background: HEADER_BG, color: HEADER_TEXT,
          padding: "12px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <span style={{ fontFamily: "'Tenor Sans', sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Quick Add
          </span>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: HEADER_TEXT, cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Product summary */}
        <div style={{ display: "flex", gap: 14, padding: "16px 20px 12px", borderBottom: `1px solid ${CARD_BORDER}`, flexShrink: 0 }}>
          {displayImage && (
            <div style={{ width: 72, height: 88, borderRadius: 6, overflow: "hidden", flexShrink: 0, background: "#f0ece5" }}>
              <img src={displayImage} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: TEXT_PRIMARY,
              fontFamily: "'Tenor Sans', sans-serif", lineHeight: 1.35,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden",
            }}>{product.name}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700, color: TEXT_PRIMARY }}>{product.price}</span>
              {product.comparePrice && (() => {
                const parseAmt = (s: string) => parseFloat((s || '').replace(/[^0-9.]/g, ''));
                const saleAmt = parseAmt(product.price);
                const origAmt = parseAmt(product.comparePrice);
                const hasDiscount = origAmt > saleAmt;
                const discountPct = hasDiscount ? Math.round(((origAmt - saleAmt) / origAmt) * 100) : 0;
                return (
                  <>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: TEXT_SECONDARY, textDecoration: "line-through" }}>{product.comparePrice}</span>
                    {hasDiscount && <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 700, color: "#dc2626" }}>-{discountPct}%</span>}
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Variant selectors */}
        <div style={{ padding: "16px 20px", flex: 1 }}>
          {/* Color swatches */}
          {colorEntries.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_SECONDARY, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                Color{selectedColor ? `: ${selectedColor}` : ""}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {colorEntries.map(({ name, hex }) => {
                  const active = selectedColor === name;
                  return hex ? (
                    <button
                      key={name}
                      onClick={() => setSelectedColor(active ? null : name)}
                      title={name}
                      aria-label={name}
                      style={{
                        width: 28, height: 28, borderRadius: "50%",
                        background: hex,
                        border: active ? `2px solid ${ACCENT_GREEN}` : "2px solid #e0e0e0",
                        boxShadow: active ? "0 0 0 2px #fff inset" : "none",
                        cursor: "pointer", padding: 0, flexShrink: 0,
                        transition: "border 0.15s, box-shadow 0.15s",
                      }}
                    />
                  ) : (
                    <button
                      key={name}
                      onClick={() => setSelectedColor(active ? null : name)}
                      style={{
                        padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                        border: active ? `1.5px solid ${ACCENT_GREEN}` : "1.5px solid #ddd",
                        background: active ? ACCENT_GREEN : "#fff",
                        color: active ? "#fff" : "#444",
                        cursor: "pointer", flexShrink: 0,
                        transition: "all 0.15s", whiteSpace: "nowrap",
                      }}
                    >{name}</button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size grid */}
          {sizes.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_SECONDARY, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                Size{selectedSize ? `: ${selectedSize}` : ""}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {sizes.map(size => {
                  const active = selectedSize === size;
                  const available = isSizeAvailable(size);
                  return (
                    <button
                      key={size}
                      onClick={() => available && setSelectedSize(active ? null : size)}
                      disabled={!available}
                      style={{
                        minWidth: 44, height: 36, borderRadius: 6, fontSize: 12, fontWeight: 600,
                        border: active ? `1.5px solid ${ACCENT_GREEN}` : "1.5px solid #ddd",
                        background: active ? ACCENT_GREEN : available ? "#fff" : "#f5f5f5",
                        color: active ? "#fff" : available ? "#333" : "#bbb",
                        cursor: available ? "pointer" : "not-allowed",
                        padding: "0 10px",
                        transition: "all 0.15s",
                        textDecoration: available ? "none" : "line-through",
                        position: "relative" as const,
                      }}
                    >{size}</button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add to Cart button */}
          <button
            onClick={handleAddToCart}
            disabled={adding}
            style={{
              width: "100%",
              background: adding ? "#6b9e84" : ACCENT_GREEN,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "14px 0",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
              cursor: adding ? "not-allowed" : "pointer",
              transition: "background 0.2s",
              fontFamily: "'Tenor Sans', sans-serif",
            }}
            onMouseEnter={e => { if (!adding) (e.currentTarget as HTMLButtonElement).style.background = BTN_HOVER; }}
            onMouseLeave={e => { if (!adding) (e.currentTarget as HTMLButtonElement).style.background = ACCENT_GREEN; }}
          >
            {adding ? "Adding…" : "Add to Cart"}
          </button>

          {product.productUrl && (
            <a
              href={product.productUrl}
              style={{ display: "block", textAlign: "center", marginTop: 12, color: ACCENT_GREEN, fontSize: 12, textDecoration: "underline" }}
            >
              View Full Details →
            </a>
          )}
        </div>
      </div>
    </>
  );
}
