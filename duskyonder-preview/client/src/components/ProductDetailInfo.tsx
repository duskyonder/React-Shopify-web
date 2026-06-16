import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import { Link, useLocation } from "wouter";
import { useIsMobile } from "@/hooks/useMobile";
import { useThemeConfig, CollectionProduct, ProductDetailConfig, CareIconKey, CareInstruction } from "@/contexts/ThemeConfigContext";
import { ColorSwatch } from "@/components/StorefrontShell";
import { HeartIcon, ChevronDownIcon, ShareIcon, InstagramIcon, PinterestIcon, LinkIcon, ArrowUpIcon, ImagePlaceholderIcon, PlayIcon, CareIconSvg, colorLabel } from "@/components/ProductDetailIcons";
import { SizeGuideModal } from "@/components/ProductDetailModals";
import { CollapsibleSection } from "@/components/ProductDetailGallery";
import { useCart } from "@/contexts/CartContext";
import type { ShopifyProduct } from "@/lib/shopify";

// ==================== PRODUCT INFO PANEL ====================
export function ProductInfoPanel({
  product,
  detail,
  collectionHandle,
  collectionTitle,
  selectedColorIdx,
  onColorChange,
  shopifyProduct,
}: {
  product: CollectionProduct;
  detail: Partial<ProductDetailConfig>;
  collectionHandle: string;
  collectionTitle: string;
  selectedColorIdx: number;
  onColorChange: (idx: number) => void;
  shopifyProduct?: ShopifyProduct | null;
}) {
  const { config } = useThemeConfig();
  const { addItem, openCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Use Shopify product sizes if available, otherwise fall back to config
  const shopifySizeOption = shopifyProduct?.options?.find(o => o.name.toLowerCase() === "size");
  const sizes = shopifySizeOption
    ? shopifySizeOption.values.map(s => {
        // Check if this size has any available variant
        const selectedColor = product.colors?.[selectedColorIdx];
        const available = shopifyProduct!.variants.some(v => {
          const sizeMatch = v.selectedOptions.some(o => o.name.toLowerCase() === "size" && o.value === s);
          const colorMatch = !selectedColor || v.selectedOptions.some(o => o.name.toLowerCase() === "color" && o.value === selectedColor);
          return sizeMatch && colorMatch && v.availableForSale;
        });
        return { label: s, available };
      })
    : (detail.sizes || config.pdpDefaultSizes);
  const sizeGuide = detail.sizeGuide || config.pdpSizeGuide;
  const shippingBlocks: string[] = detail.shippingBlocks ?? config.pdpShippingBlocks ?? (detail.shippingText || config.pdpShippingText ? [detail.shippingText || config.pdpShippingText || ""] : []);
  const showShare = config.pdpShowShare !== false;
  const showWishlist = config.pdpShowWishlist !== false;
  const shippingModuleTitle = config.pdpShippingModuleTitle || "Free Shipping";
  const shippingModuleBlocks = config.pdpShippingModuleBlocks || [];
  const returnModuleTitle = config.pdpReturnModuleTitle || "Easy Returns";
  const returnModuleBlocks = config.pdpReturnModuleBlocks || [];
  const showBadge = detail.showBadge !== false;
  const showFabric = detail.showFabric !== false;
  const fabricId = detail.fabricId;
  const fabric = fabricId ? config.fabrics.find(f => f.id === fabricId) : null;
  // Care instructions: product-level override > global default > hardcoded fallback
  const careInstructions: CareInstruction[] = detail.careInstructions?.length
    ? detail.careInstructions
    : (config.pdpDefaultCareInstructions?.length ? config.pdpDefaultCareInstructions : [
        { icon: "machine-wash", label: "Machine Wash Cold" },
        { icon: "hang-dry", label: "Hang to Dry" },
        { icon: "do-not-bleach", label: "Do Not Bleach" },
      ]);
  // Description blocks: Shopify product HTML > product-level override > global default
  const shopifyDescriptionHtml = shopifyProduct?.descriptionHtml;
  const descriptionBlocks = shopifyDescriptionHtml
    ? [{ id: "shopify_desc", title: "PRODUCT DETAILS", content: shopifyDescriptionHtml, isHtml: true }]
    : (detail.descriptionBlocks && detail.descriptionBlocks.length > 0)
      ? detail.descriptionBlocks
      : (config.pdpDefaultDescriptionBlocks && config.pdpDefaultDescriptionBlocks.length > 0
          ? config.pdpDefaultDescriptionBlocks
          : (detail.description ? [{ id: "desc", title: "PRODUCT DETAILS", content: detail.description }] : []));

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pdp-info-panel">
      {/* Breadcrumb */}
      <nav className="pdp-breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href={`/collections/${collectionHandle}`}>{collectionTitle}</Link>
        <span>/</span>
        <span>{product.name}</span>
      </nav>

      {/* Badge */}
      {showBadge && product.badge && (
        <div className="pdp-badge">
          {product.badge}
        </div>
      )}

      {/* Product name */}
      <h1 className="pdp-product-name">{product.name}</h1>

      {/* Price */}
      <div className="pdp-price-row">
        <span className="pdp-price">{product.price}</span>
        {(detail.comparePrice || product.comparePrice) && (
          <span className="pdp-compare-price">{detail.comparePrice || product.comparePrice}</span>
        )}
      </div>

      {/* Color selection */}
      {product.colors.length > 0 && (
        <div className="pdp-option-group">
          <div className="pdp-option-label">
            Color: <strong>{colorLabel(product.colors[selectedColorIdx] || "")}</strong>
          </div>
          <div className="pdp-color-swatches">
            {product.colors.map((color, i) => (
              <ColorSwatch
                key={i}
                value={color}
                active={selectedColorIdx === i}
                onClick={() => onColorChange(i)}
                size={28}
              />
            ))}
          </div>
        </div>
      )}

      {/* Size selection */}
      <div className="pdp-option-group">
        <div className="pdp-option-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Size{selectedSize ? `: <strong>${selectedSize}</strong>` : ""}</span>
          <button className="pdp-size-guide-btn" onClick={() => setShowSizeGuide(true)}>Size Guide</button>
        </div>
        <div className="pdp-size-grid">
          {sizes.map(s => (
            <button
              key={s.label}
              className={`pdp-size-btn${selectedSize === s.label ? " active" : ""}${!s.available ? " unavailable" : ""}`}
              onClick={() => s.available && setSelectedSize(s.label)}
              disabled={!s.available}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div className="pdp-option-group">
        <div className="pdp-option-label">Quantity</div>
        <div className="pdp-qty-row">
          <button className="pdp-qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
          <span className="pdp-qty-value">{quantity}</span>
          <button className="pdp-qty-btn" onClick={() => setQuantity(q => q + 1)}>+</button>
        </div>
      </div>

      {/* Add to cart + wishlist */}
      <div className="pdp-cta-row">
        <button
          className="pdp-add-to-cart"
          style={{ flex: 1 }}
          disabled={addingToCart}
          onClick={() => {
            // Find the matching variant based on selected color + size
            const selectedColor = product.colors?.[selectedColorIdx];
            let variantId: string | undefined;
            if (shopifyProduct) {
              const variant = shopifyProduct.variants.find(v => {
                const colorMatch = !selectedColor || v.selectedOptions.some(o => o.name.toLowerCase() === "color" && o.value === selectedColor);
                const sizeMatch = !selectedSize || v.selectedOptions.some(o => o.name.toLowerCase() === "size" && o.value === selectedSize);
                return colorMatch && sizeMatch && v.availableForSale;
              }) || shopifyProduct.variants.find(v => v.availableForSale);
              variantId = variant?.id;
            }
            if (!variantId && !selectedSize && shopifyProduct?.variants?.length) {
              // If no size selected, prompt user
              alert("Please select a size");
              return;
            }
            setAddingToCart(true);
            addItem({
              id: variantId || product.id,
              name: product.name,
              price: product.price,
              comparePrice: product.comparePrice,
              imageUrl: product.imageUrl,
              productUrl: `/products/${shopifyProduct?.handle || ""}`,
              variantId: variantId || undefined,
              selectedColor: selectedColor || undefined,
              selectedSize: selectedSize || undefined,
            });
            openCart();
            setTimeout(() => setAddingToCart(false), 500);
          }}
        >
          {addingToCart ? "ADDING..." : "ADD TO CART"}
        </button>
        {showWishlist && (
          <button className={`pdp-wishlist-btn${wishlist ? " active" : ""}`} onClick={() => setWishlist(w => !w)}>
            <HeartIcon filled={wishlist} />
          </button>
        )}
      </div>

      {/* Shipping / Return quick-info modules */}
      <div className="pdp-info-modules">
        <div className="pdp-info-module">
          <span className="pdp-info-module-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          </span>
          <div className="pdp-info-module-content">
            <span className="pdp-info-module-title">{shippingModuleTitle}</span>
            {shippingModuleBlocks.map((block, i) => (
              <span key={i} className="pdp-info-module-text">{block}</span>
            ))}
          </div>
        </div>
        <div className="pdp-info-module">
          <span className="pdp-info-module-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4"/></svg>
          </span>
          <div className="pdp-info-module-content">
            <span className="pdp-info-module-title">{returnModuleTitle}</span>
            {returnModuleBlocks.map((block, i) => (
              <span key={i} className="pdp-info-module-text">{block}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Social share */}
      {showShare && (
        <div className="pdp-share-row">
          <button className="pdp-share-trigger" onClick={() => setShareOpen(o => !o)}>
            <ShareIcon /><span>Share</span>
          </button>
          {shareOpen && (
            <div className="pdp-share-menu">
              <a href={`https://www.instagram.com/`} target="_blank" rel="noopener noreferrer" className="pdp-share-btn">
                <InstagramIcon /><span>Instagram</span>
              </a>
              <a href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&description=${encodeURIComponent(product.name)}`} target="_blank" rel="noopener noreferrer" className="pdp-share-btn">
                <PinterestIcon /><span>Pinterest</span>
              </a>
              <button className="pdp-share-btn" onClick={handleCopyLink}>
                <LinkIcon /><span>{copied ? "Copied!" : "Copy Link"}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Product description - rich text blocks (above SHIPPING) */}
      {descriptionBlocks.map((block, i) => (
        <CollapsibleSection key={block.id || i} title={block.title || "PRODUCT DETAILS"} defaultOpen={i === 0}>
          {(block as any).isHtml ? (
            <div
              className="pdp-shopify-description"
              style={{ fontSize: "var(--pdp-body-font-size-desktop, 14px)", color: "#555", lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          ) : (
            <div style={{ fontSize: "var(--pdp-body-font-size-desktop, 14px)", color: "#555", lineHeight: 1.8, whiteSpace: "pre-line" }}>{block.content}</div>
          )}
        </CollapsibleSection>
      ))}

      {/* Shipping & Returns */}
      <CollapsibleSection title="SHIPPING & RETURNS" defaultOpen={false}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {shippingBlocks.map((block, i) => (
            <p key={i} style={{ fontSize: "var(--pdp-body-font-size-desktop, 14px)", color: "#555", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{block}</p>
          ))}
        </div>
      </CollapsibleSection>

      {/* Care Instructions */}
      <CollapsibleSection title="CARE INSTRUCTIONS" defaultOpen={false}>
        <div className="pdp-care-grid">
          {careInstructions.map((ci, i) => (
            <div key={i} className="pdp-care-item">
              <div className="pdp-care-icon"><CareIconSvg icon={ci.icon} /></div>
              <span className="pdp-care-label">{ci.label}</span>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Fabric info */}
      {showFabric && fabric && (
        <CollapsibleSection title="FABRIC & TECHNOLOGY" defaultOpen={false}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 28 }}>{fabric.icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{fabric.title}</div>
              <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, margin: 0 }}>{fabric.description}</p>
            </div>
          </div>
        </CollapsibleSection>
      )}

      {showSizeGuide && <SizeGuideModal onClose={() => setShowSizeGuide(false)} sizeGuide={sizeGuide} sizeGuideTables={detail.sizeGuideTables || config.pdpSizeGuideTables} />}
    </div>
  );
}

// ==================== PRODUCT VIDEO ====================
export function ProductVideo({ videoUrl }: { videoUrl: string }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isYoutube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");
  const isVimeo = videoUrl.includes("vimeo.com");

  if (isYoutube || isVimeo) {
    let embedUrl = videoUrl;
    if (isYoutube) {
      const match = videoUrl.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
      if (match) embedUrl = `https://www.youtube.com/embed/${match[1]}?autoplay=0`;
    } else if (isVimeo) {
      const match = videoUrl.match(/vimeo\.com\/(\d+)/);
      if (match) embedUrl = `https://player.vimeo.com/video/${match[1]}`;
    }
    return (
      <div className="pdp-video-section">
        <h2 className="pdp-section-title">Product Video</h2>
        <div className="pdp-video-embed">
          <iframe src={embedUrl} frameBorder="0" allow="autoplay; fullscreen" allowFullScreen style={{ width: "100%", height: "100%", borderRadius: 8 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="pdp-video-section">
      <h2 className="pdp-section-title">Product Video</h2>
      <div className="pdp-video-embed" style={{ position: "relative", cursor: "pointer" }} onClick={() => { setPlaying(true); videoRef.current?.play(); }}>
        <video ref={videoRef} src={videoUrl} style={{ width: "100%", borderRadius: 8 }} controls={playing} playsInline />
        {!playing && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PlayIcon />
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== RECOMMENDED PRODUCTS ====================
export function RecommendedProducts({
  currentProductId,
  collectionProducts,
  manualIds,
  count,
  mobileCount,
  sectionTitle = "You May Also Like",
  titleColor = "",
  titleSize = 22,
  titleMobileSize = 18,
  recommendedBadges,
}: {
  currentProductId: string;
  collectionProducts: CollectionProduct[];
  manualIds: string[];
  count: number;
  mobileCount: number;
  sectionTitle?: string;
  titleColor?: string;
  titleSize?: number;
  titleMobileSize?: number;
  recommendedBadges?: Record<string, string>;
}) {
  const [page, setPage] = useState(0);
  const isMobile = useIsMobile();
  const displayCount = isMobile ? mobileCount : count;
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // IntersectionObserver lazy loading
  const [recVisible, setRecVisible] = useState(false);
  const recRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = recRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setRecVisible(true); obs.disconnect(); }
    }, { rootMargin: "200px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Build list: manual first, then fill from same collection (excluding current)
  const manualProducts = manualIds
    .map(id => collectionProducts.find(p => p.id === id))
    .filter((p): p is CollectionProduct => !!p && p.id !== currentProductId);
  const autoProducts = collectionProducts.filter(
    p => p.id !== currentProductId && !manualIds.includes(p.id)
  );
  const allRecs = [...manualProducts, ...autoProducts].slice(0, Math.max(count, mobileCount, 4));

  const totalPages = Math.ceil(allRecs.length / displayCount);

  // Reset page when displayCount changes
  useEffect(() => { setPage(0); }, [displayCount]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) setPage(p => Math.min(totalPages - 1, p + 1));
      else setPage(p => Math.max(0, p - 1));
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <div className="pdp-recs-section" ref={recRef}>
      <h2 className="pdp-section-title" style={{ textAlign: "center", color: titleColor || undefined, fontSize: isMobile ? titleMobileSize : titleSize }}>{sectionTitle}</h2>
      {!recVisible && <div style={{ minHeight: 200 }} />}
      {recVisible && <div className="pdp-recs-wrapper"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {!isMobile && (
          <button className="sf-cat-arrow prev" onClick={() => setPage(p => Math.max(0, p - 1))} style={{ opacity: page === 0 ? 0.3 : 1 }}>&#8249;</button>
        )}
        <div style={{ overflow: "hidden", flex: 1 }}>
          <div style={{
            display: "flex",
            gap: isMobile ? 10 : 16,
            transform: `translateX(calc(-${page} * (100% + ${isMobile ? 10 : 16}px)))`,
            transition: "transform 0.4s cubic-bezier(0.23,1,0.32,1)",
          }}>
            {Array.from({ length: totalPages }).map((_, pi) =>
              allRecs.slice(pi * displayCount, (pi + 1) * displayCount).map(prod => (
                <div key={prod.id} style={{ flex: `0 0 calc((100% - ${(displayCount - 1) * (isMobile ? 10 : 16)}px) / ${displayCount})`, minWidth: 0 }}>
                  <RecommendedCard product={prod} overrideBadge={recommendedBadges?.[prod.id]} />
                </div>
              ))
            )}
          </div>
        </div>
        {!isMobile && (
          <button className="sf-cat-arrow next" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} style={{ opacity: page >= totalPages - 1 ? 0.3 : 1 }}>&#8250;</button>
        )}
      </div>}
      {recVisible && isMobile && totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 14 }}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} onClick={() => setPage(i)} style={{
              width: i === page ? 20 : 8, height: 8, borderRadius: 4,
              background: i === page ? "#175C40" : "#ccc",
              border: "none", cursor: "pointer", padding: 0,
              transition: "all 0.3s cubic-bezier(0.23,1,0.32,1)",
            }} />
          ))}
        </div>
      )}
    </div>
  );
}

export function RecommendedCard({ product, overrideBadge }: { product: CollectionProduct; overrideBadge?: string }) {
  const [hovered, setHovered] = useState(false);
  const [colorIdx, setColorIdx] = useState(0);
  const [, navigate] = useLocation();
  const { config } = useThemeConfig();
  const swatchSize = config.productsSwatchSize ?? 10;
  const swatchGap = config.productsSwatchGap ?? 4;
  const swatchOffsetX = config.productsSwatchOffsetX ?? 0;
  const swatchMarginTop = config.productsSwatchMarginTop ?? 6;
  const swatchAlign = config.productsSwatchAlign ?? "flex-start";

  const handle = product.detailUrl?.replace("/products/", "") ||
    product.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  // Determine display image based on selected color
  const activeColor = product.colors[colorIdx];
  const colorImage = activeColor && product.colorImages?.[activeColor];
  const displayImg = colorImage || product.imageUrl;
  const hoverImg = product.hoverImageUrl || displayImg;

  return (
    <div
      className="sf-product-card"
      style={{ cursor: "pointer" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/products/${handle}`)}
    >
      <div className="sf-product-image" style={{ aspectRatio: "3/4" }}>
        {displayImg ? (
          <img
            src={hovered && hoverImg ? hoverImg : displayImg}
            alt={product.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.3s ease" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ImagePlaceholderIcon />
          </div>
        )}
        {(overrideBadge || product.badge) && (() => {
          const badgeText = overrideBadge || product.badge || "";
          const badgeLower = badgeText.toLowerCase();
          const badgeBg = badgeLower === "new" ? "#175C40"
            : badgeLower === "limited" ? "#8B4513"
            : badgeLower === "sale" ? "#C0392B"
            : badgeLower === "best seller" ? "#0D3D2B"
            : "#0D3D2B";
          return (
            <div className="sf-product-badge" style={{ background: badgeBg }}>
              {badgeText}
            </div>
          );
        })()}
      </div>
      <div className="sf-product-info">
        <div className="sf-product-name">{product.name}</div>
        <div className="sf-product-price">{product.price}</div>
        {product.colors.length > 0 && (
          <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: swatchGap, marginTop: swatchMarginTop, marginLeft: swatchOffsetX, justifyContent: swatchAlign }}
            onClick={e => e.stopPropagation()}
          >
            {product.colors.map((c, i) => (
              <ColorSwatch key={i} value={c} active={colorIdx === i} onClick={() => setColorIdx(i)} size={swatchSize} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== BACK TO TOP ====================
export function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!visible) return null;
  return (
    <button
      className="pdp-back-to-top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      title="Back to top"
    >
      <ArrowUpIcon />
    </button>
  );
}

// ==================== MOBILE STICKY CTA ====================
export function MobileStickyCart({ productName, price, shopifyProduct }: { productName: string; price: string; shopifyProduct?: ShopifyProduct | null }) {
  const [visible, setVisible] = useState(false);
  const { addItem, openCart } = useCart();
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleMobileAdd = () => {
    const firstAvailable = shopifyProduct?.variants?.find(v => v.availableForSale);
    addItem({
      id: firstAvailable?.id || shopifyProduct?.id || "unknown",
      name: productName,
      price: price,
      imageUrl: shopifyProduct?.images?.[0]?.url,
      productUrl: `/products/${shopifyProduct?.handle || ""}`,
      variantId: firstAvailable?.id || undefined,
    });
    openCart();
  };

  return (
    <div className={`pdp-mobile-sticky${visible ? " visible" : ""}`}>
      <div className="pdp-mobile-sticky-info">
        <span className="pdp-mobile-sticky-name">{productName}</span>
        <span className="pdp-mobile-sticky-price">{price}</span>
      </div>
      <button className="pdp-mobile-sticky-btn" onClick={handleMobileAdd}>ADD TO CART</button>
    </div>
  );
}

// ==================== MAIN PRODUCT DETAIL PAGE ====================

// ---- Inline Newsletter Strip ----
export function InlineNewsletterStrip() {
  const { config } = useThemeConfig();
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  if (!config.enableNewsletter) return null;
  return (
    <div className="sf-inline-newsletter">
      <div className="sf-inline-newsletter-inner">
        <div className="sf-inline-newsletter-label">Newsletter</div>
        <h3 className="sf-inline-newsletter-title">{config.newsletterTitle ?? "Join the Club"}</h3>
        <p className="sf-inline-newsletter-subtitle">
          {config.newsletterText ?? "Subscribe for new arrivals, exclusive offers, and movement inspiration."}
        </p>
        {submitted ? (
          <div className="sf-inline-newsletter-success">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
            <span>Thank you! Welcome to the club.</span>
          </div>
        ) : (
          <div className="sf-inline-newsletter-form">
            <input
              type="email"
              className="sf-inline-newsletter-input"
              placeholder="Your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <button
              className="sf-inline-newsletter-btn"
              onClick={() => { if (email) setSubmitted(true); }}
            >Subscribe</button>
          </div>
        )}
      </div>
    </div>
  );
}

