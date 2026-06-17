import React, { useState, useRef, useEffect, useCallback } from "react";
import { useThemeConfig, Product } from "@/contexts/ThemeConfigContext";
import { useCart } from "@/contexts/CartContext";
import { ColorSwatch } from "@/components/StorefrontShell";
import { HeartIcon, PlusIcon, XIcon, ImageIcon, ImgPlaceholder } from "@/components/HomeIcons";

// ==================== QUICK VIEW MODAL ====================
function QuickViewModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState("S");
  const [imgIdx, setImgIdx] = useState(0);
  const [wishlist, setWishlist] = useState(false);
  const sizes = ["XS", "S", "M", "L", "XL"];

  const selectedColor = product.colors[selectedColorIdx];
  // Determine displayed image: colorImages mapping → fallback to imageUrl
  const colorImage = selectedColor && product.colorImages?.[selectedColor];
  const displayImages = [
    colorImage || product.imageUrl,
    product.hoverImageUrl,
  ].filter(Boolean) as string[];

  const currentImg = displayImages[imgIdx] || null;

  useEffect(() => {
    // When color changes, reset image index
    setImgIdx(0);
  }, [selectedColorIdx]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="sf-quickview-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sf-quickview-modal">
        <button className="sf-quickview-close" onClick={onClose} aria-label="Close"><XIcon /></button>
        <div className="sf-quickview-inner">
          {/* Left: image gallery */}
          <div className="sf-quickview-gallery">
            <div className="sf-quickview-main-img">
              {currentImg ? (
                <img loading="lazy" src={currentImg} alt={product.name} />
              ) : (
                <ImgPlaceholder label="Product Image" style={{ position: "absolute", inset: 0 }} />
              )}
              {product.badge && <span className="sf-product-badge">{product.badge}</span>}
            </div>
            {displayImages.length > 1 && (
              <div className="sf-quickview-thumbs">
                {displayImages.map((img, i) => (
                  <button
                    key={i}
                    className={`sf-quickview-thumb${imgIdx === i ? " active" : ""}`}
                    onClick={() => setImgIdx(i)}
                  >
                    <img loading="lazy" src={img} alt={`View ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: product info */}
          <div className="sf-quickview-info">
            <h2 className="sf-quickview-name">{product.name}</h2>
            <div className="sf-quickview-price">{product.price}</div>

            {product.colors.length > 0 && (
              <>
                <div className="sf-option-label" style={{ marginTop: 16 }}>
                  Color: <strong style={{ color: "#175C40" }}>{selectedColor}</strong>
                </div>
                <div className="sf-color-swatches" style={{ marginTop: 8 }}>
                  {product.colors.map((color, i) => (
                    <div
                      key={i}
                      className={`sf-color-swatch${selectedColorIdx === i ? " active" : ""}`}
                      style={{
                        background: color,
                        border: color === "#F9F9F9" ? "2px solid #eee" : undefined,
                        width: 28, height: 28,
                      }}
                      onClick={() => setSelectedColorIdx(i)}
                      title={color}
                    />
                  ))}
                </div>
              </>
            )}

            <div className="sf-option-label" style={{ marginTop: 16 }}>Size</div>
            <div className="sf-size-btns" style={{ marginTop: 8 }}>
              {sizes.map((size) => (
                <button
                  key={size}
                  className={`sf-size-btn${selectedSize === size ? " active" : ""}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>

            <div style={{ marginTop: 24, display: "flex", gap: 10, alignItems: "stretch" }}>
              <button
                className="sf-drawer-add-btn"
                style={{ flex: 1, minWidth: 0, padding: "14px 12px", whiteSpace: "nowrap" }}
                onClick={() => onClose()}
              >
                ADD TO CART
              </button>
              <button
                className="sf-drawer-add-btn sf-drawer-wishlist-btn"
                onClick={() => setWishlist(w => !w)}
                aria-label="Wishlist"
              >
                <HeartIcon filled={wishlist} />
              </button>
            </div>

            {product.detailUrl && (
              <a
                href={product.detailUrl}
                style={{ display: "block", textAlign: "center", marginTop: 12, color: "#175C40", fontSize: "0.875rem", textDecoration: "underline" }}
              >
                View Full Details →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== DESKTOP PRODUCT PAGER (shows exactly N products, arrow-only navigation) ====================
function DesktopProductPager({ products, productsPerRow, renderCard, gap = 0, cardWidth: fixedCardWidth = 0, maxWidth = 1680, cardHeight = 380 }: {
  products: Product[];
  productsPerRow: number;
  renderCard: (p: Product, prefix?: string) => React.ReactNode;
  gap?: number;
  cardWidth?: number;
  maxWidth?: number;
  cardHeight?: number;
}) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(products.length / productsPerRow);
  // If fixedCardWidth > 0, use px; otherwise auto-divide container
  const cardWidth = fixedCardWidth > 0
    ? `${fixedCardWidth}px`
    : gap > 0
      ? `calc((100% - ${gap * (productsPerRow - 1)}px) / ${productsPerRow})`
      : `calc(100% / ${productsPerRow})`;
  // translateX per page: each page = productsPerRow cards + gaps
  const pageStep = fixedCardWidth > 0
    ? `${fixedCardWidth * productsPerRow + gap * (productsPerRow - 1)}px`
    : `calc(100% + ${gap}px)`;

  return (
    <>
    <div className="sf-scroll-section-wrapper" style={{ width: "95%", maxWidth: `${maxWidth}px`, ['--product-card-height' as string]: cardHeight > 0 ? `${cardHeight}px` : 'auto' } as React.CSSProperties}>
      <button
        className="sf-cat-arrow prev"
        onClick={() => setPage(p => Math.max(0, p - 1))}
        style={{ opacity: page === 0 ? 0.3 : 1 }}
      >&#8249;</button>
      <div style={{ overflow: "hidden", width: "100%", paddingBottom: 24, marginBottom: -24 }}>
        <div style={{
          display: "flex",
          gap,
          transform: `translateX(calc(-${page} * ${pageStep}))`,
          transition: "transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
          willChange: "transform",
          paddingBottom: 4,
        }}>
          {Array.from({ length: totalPages }).map((_, pi) => (
            products.slice(pi * productsPerRow, (pi + 1) * productsPerRow).map((product) => (
              <div key={product.id} style={{ flex: `0 0 ${cardWidth}`, width: cardWidth, minWidth: 0 }}>
                {renderCard(product)}
              </div>
            ))
          ))}
        </div>
      </div>
      <button
        className="sf-cat-arrow next"
        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
        style={{ opacity: page >= totalPages - 1 ? 0.3 : 1 }}
      >&#8250;</button>
    </div>
    {totalPages > 1 && (
      <div className="sf-section-dots">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button key={i} className={`sf-section-dot${i === page ? " active" : ""}`} onClick={() => setPage(i)} />
        ))}
      </div>
    )}
    </>
  );
}

// ==================== BEST SELLERS (hover swap + quick view + color swatch image swap) ====================
function SFFeatured({ instanceId, titleAlign = "center" }: { instanceId?: string; titleAlign?: "left" | "center" | "right" }) {
  const { config } = useThemeConfig();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [hoveredColors, setHoveredColors] = useState<Record<string, number>>({}); // productId → colorIdx
  const [isMobile, setIsMobile] = useState(false);
  const [autoProducts, setAutoProducts] = useState<Product[]>([]);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  // Determine which data to use: default instance uses config.products, extra instances use featuredInstances
  const isDefault = !instanceId || instanceId === "featured_default";
  const instanceData = isDefault ? null : config.featuredInstances?.find(f => f.id === instanceId);

  // Determine data source
  const dataSource = isDefault ? (config.productsDataSource ?? 'manual') : (instanceData?.dataSource ?? 'manual');
  const collectionHandle = isDefault ? (config.productsCollectionHandle ?? '') : (instanceData?.collectionHandle ?? '');
  const productTag = instanceData?.tag ?? '';

  // Auto-fetch products from Shopify when dataSource is 'auto'
  useEffect(() => {
    if (dataSource !== 'auto') return;
    let cancelled = false;
    (async () => {
      const { fetchBestSellingProducts, fetchCollectionProducts, fetchProductsByTag } = await import('@/lib/shopify');
      let results;
      if (productTag) {
        results = await fetchProductsByTag(productTag, 12);
      } else if (collectionHandle) {
        results = await fetchCollectionProducts(collectionHandle, 12);
      } else {
        results = await fetchBestSellingProducts(12);
      }
      if (!cancelled) {
        setAutoProducts(results.map(p => ({
          id: p.id,
          name: p.title,
          price: p.price,
          imageUrl: p.imageUrl,
          hoverImageUrl: p.hoverImageUrl || '',
          colors: p.colors,
          colorImages: {},
          detailUrl: p.detailUrl,
        })));
      }
    })();
    return () => { cancelled = true; };
  }, [dataSource, collectionHandle, productTag]);

  const manualProducts = isDefault ? config.products : (instanceData?.products ?? []);
  const products = dataSource === 'auto' ? autoProducts : manualProducts;
  const sectionTitle = isDefault ? config.featuredTitle : (instanceData?.title ?? "Best Sellers");

  // Mobile scroll state
  const mobileTrackRef = useRef<HTMLDivElement>(null);
  const mobileIsJumping = useRef(false);
  const desktopTrackRef = useRef<HTMLDivElement>(null);

  const scrollDesktopByBtn = (dir: number) => {
    const el = desktopTrackRef.current;
    if (!el) return;
    const cardWidth = el.clientWidth / (productsPerRow ?? 4);
    el.scrollBy({ left: dir * cardWidth, behavior: "smooth" });
  };
  const productsPerRow = isDefault ? (config.productsPerRow ?? 4) : (instanceData?.productsPerRow ?? 4);
  const productAspectRatio = isDefault ? (config.productAspectRatio ?? "3/4") : (instanceData?.productAspectRatio ?? "3/4");
  const desktopGap = config.productsDesktopGap ?? 0;
  const mobileGap = config.productsMobileGap ?? 12;
  const desktopCardWidth = config.productsCardWidth ?? 0;
  const mobileCardWidth = config.productsMobileCardWidth ?? 0;

  // Mobile: paginated scroll state
  const [mobilePage, setMobilePage] = useState(0);
  const mobileCardCount = 2;
  const mobileTotalPages = Math.ceil(products.length / mobileCardCount);
  // Scroll to page when mobilePage changes
  useEffect(() => {
    if (!isMobile) return;
    const el = mobileTrackRef.current;
    if (!el) return;
    const pageWidth = el.clientWidth + mobileGap;
    el.scrollTo({ left: mobilePage * pageWidth, behavior: 'smooth' });
  }, [mobilePage, isMobile, mobileGap]);
  // Update mobilePage on scroll
  const handleMobileScroll = useCallback(() => {
    const el = mobileTrackRef.current;
    if (!el || mobileIsJumping.current) return;
    const pageWidth = el.clientWidth + mobileGap;
    const newPage = Math.round(el.scrollLeft / pageWidth);
    setMobilePage(p => p !== newPage ? newPage : p);
  }, [mobileGap]);

  if (!config.showFeatured) return null;

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const getProductImage = (product: Product) => {
    const colorIdx = hoveredColors[product.id] ?? 0;
    const color = product.colors[colorIdx];
    if (color && product.colorImages?.[color]) return product.colorImages[color];
    return product.imageUrl;
  };

  // Render a single product card (shared between grid and mobile infinite track)
  const renderProductCard = (product: Product, keyPrefix = "") => {
    const displayImg = getProductImage(product);
    return (
      <div key={`${keyPrefix}${product.id}`} className="sf-product-card sf-product-card--hover">
        {/* Mobile: tap → detail page */}
        <a
          href={product.detailUrl || "#"}
          className="sf-product-mobile-link"
          aria-label={product.name}
        />
        <div className="sf-product-image" style={{ aspectRatio: productAspectRatio }}>
          <div className={"sf-product-img-primary"}>
            {displayImg ? <img loading="lazy" src={displayImg} alt={product.name} /> : <ImgPlaceholder label="产品图片" />}
          </div>
          <div className={"sf-product-img-hover"}>
            {product.hoverImageUrl ? <img loading="lazy" src={product.hoverImageUrl} alt={product.name} /> : (
              displayImg ? <img loading="lazy" src={displayImg} alt={product.name} style={{ filter: "brightness(0.85) saturate(1.1)" }} /> : <ImgPlaceholder label="悬浮图片" />
            )}
          </div>
          {product.badge && <span className="sf-product-badge">{product.badge}</span>}
          <div className="sf-product-hover-actions">
            <button
              className="sf-product-action-btn sf-quickadd-btn"
              onClick={(e) => { e.preventDefault(); setQuickViewProduct(product); }}
              aria-label="Quick Add"
              title="Quick Add to Cart"
            >
              <PlusIcon />
            </button>
            <button
              className="sf-product-action-btn sf-wishlist-btn"
              onClick={(e) => toggleWishlist(product.id, e)}
              aria-label="Add to Wishlist"
            >
              <HeartIcon filled={wishlist.has(product.id)} />
            </button>
          </div>
        </div>
        <div className="sf-product-info">
          <div className="sf-product-name">{product.name}</div>
          <div className="sf-product-price">{product.price}</div>
          <div className="sf-product-swatches" style={{ position: "relative", zIndex: 10, gap: `${config.productsSwatchGap ?? 4}px`, marginLeft: config.productsSwatchOffsetX ? `${config.productsSwatchOffsetX}px` : undefined, marginTop: `${config.productsSwatchMarginTop ?? 6}px`, justifyContent: config.productsSwatchAlign ?? "flex-start" }}>
            {product.colors.map((color, i) => (
              <div
                key={i}
                style={{ position: "relative", zIndex: 10 }}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setHoveredColors(prev => ({ ...prev, [product.id]: i })); }}
              >
                <ColorSwatch
                  value={color}
                  active={(hoveredColors[product.id] ?? 0) === i}
                  size={config.productsSwatchSize ?? 10}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <section className="sf-section sf-featured" style={{
        ['--products-title-fs-desktop' as string]: `${config.productsTitleFontSizeDesktop ?? 16}px`,
        ['--products-title-fs-mobile' as string]: `${config.productsTitleFontSizeMobile ?? 14}px`,
      } as React.CSSProperties}>
        <div className="sf-section-header sf-featured-header" style={{ textAlign: titleAlign }}>
          <h2 className="sf-featured-title">{sectionTitle}</h2>
        </div>
        {isMobile ? (
          /* Mobile: paginated scroll with dot indicators */
          <div className="sf-products-mobile-outer" style={{
            ...(config.productsMobileMaxWidth ? { maxWidth: `${config.productsMobileMaxWidth}px`, margin: "0 auto" } : {}),
            ["--product-card-height" as string]: config.productsMobileCardHeight ? `${config.productsMobileCardHeight}px` : undefined,
          } as React.CSSProperties}>
            <div
              ref={mobileTrackRef}
              className="sf-products-mobile-track"
              style={{ overflowX: "auto", scrollbarWidth: "none", scrollBehavior: "smooth", scrollSnapType: "x mandatory", gap: mobileGap }}
              onScroll={handleMobileScroll}
            >
              {products.map((product, idx) => {
                const mobileAutoWidth = mobileGap > 0
                  ? `calc((100% - ${mobileGap * (mobileCardCount - 1)}px) / ${mobileCardCount})`
                  : `calc(100% / ${mobileCardCount})`;
                const mobileW = mobileCardWidth > 0 ? `${mobileCardWidth}px` : mobileAutoWidth;
                return (
                <div key={idx} style={{ scrollSnapAlign: idx % mobileCardCount === 0 ? "start" : "none", flexShrink: 0, flex: `0 0 ${mobileW}`, width: mobileW }}>
                  {renderProductCard(product)}
                </div>
                );
              })}
            </div>
            {mobileTotalPages > 1 && (
              <div className="sf-section-dots">
                {Array.from({ length: mobileTotalPages }).map((_, i) => (
                  <button key={i} className={`sf-section-dot${i === mobilePage ? " active" : ""}`} onClick={() => setMobilePage(i)} />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Desktop: paginated display - show exactly productsPerRow items at a time */
          <DesktopProductPager
            products={products}
            productsPerRow={productsPerRow}
            renderCard={renderProductCard}
            gap={desktopGap}
            cardWidth={desktopCardWidth}
            maxWidth={config.productsMaxWidth ?? 1600}
            cardHeight={config.productCardHeight ?? 0}
          />
        )}
      </section>

      {quickViewProduct && (
        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </>
  );
}


export { QuickViewModal, DesktopProductPager, SFFeatured };
