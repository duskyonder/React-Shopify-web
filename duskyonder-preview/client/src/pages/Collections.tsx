import { ImgPlaceholder } from "@/components/HomeIcons";
import React, { useState, useEffect, useCallback } from "react";
import { useThemeConfig, CollectionConfig, CollectionProduct } from "@/contexts/ThemeConfigContext";
import { ColorSwatch, SFPromoBar, SFHeader, SFFooter } from "@/components/StorefrontShell";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
// ==================== ICONS ====================
const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const ImageIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);
const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
const GridIcon = ({ cols = 2 }: { cols?: number }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    {cols === 2 ? (
      <>
        <rect x="3" y="3" width="8" height="8" rx="1" />
        <rect x="13" y="3" width="8" height="8" rx="1" />
        <rect x="3" y="13" width="8" height="8" rx="1" />
        <rect x="13" y="13" width="8" height="8" rx="1" />
      </>
    ) : (
      <>
        <rect x="3" y="3" width="5" height="5" rx="1" />
        <rect x="9.5" y="3" width="5" height="5" rx="1" />
        <rect x="16" y="3" width="5" height="5" rx="1" />
        <rect x="3" y="9.5" width="5" height="5" rx="1" />
        <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
        <rect x="16" y="9.5" width="5" height="5" rx="1" />
        <rect x="3" y="16" width="5" height="5" rx="1" />
        <rect x="9.5" y="16" width="5" height="5" rx="1" />
        <rect x="16" y="16" width="5" height="5" rx="1" />
      </>
    )}
  </svg>
);



// ColorSwatch is imported from StorefrontShell

// ==================== QUICK VIEW MODAL ====================
function CollectionQuickView({ product, onClose }: { product: CollectionProduct; onClose: () => void }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState("M");
  const [wishlist, setWishlist] = useState(false);
  const sizes = ["XS", "S", "M", "L", "XL"];

  const selectedColor = product.colors[selectedColorIdx] ?? "";
  const colorImage = selectedColor && product.colorImages?.[selectedColor];
  const displayImages = colorImage
    ? [colorImage, ...(product.imageUrl ? [product.imageUrl] : [])]
    : product.imageUrl ? [product.imageUrl] : [];
  const currentImg = displayImages[imgIdx] || product.imageUrl;

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="sf-quickview-overlay" onClick={handleBackdrop}>
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
            <div className="sf-quickview-price">
              {product.comparePrice && (
                <span style={{ textDecoration: "line-through", color: "#999", marginRight: 8, fontSize: "0.9em" }}>
                  {product.comparePrice}
                </span>
              )}
              {product.price}
            </div>

            {product.colors.length > 0 && (
              <>
                <div className="sf-option-label" style={{ marginTop: 16 }}>
                  Color: <strong style={{ color: "#175C40" }}>{selectedColor}</strong>
                </div>
                <div className="sf-color-swatches" style={{ marginTop: 8, gap: 8 }}>
                  {product.colors.map((color, i) => (
                    <ColorSwatch
                      key={i}
                      value={color}
                      active={selectedColorIdx === i}
                      onClick={() => setSelectedColorIdx(i)}
                      size={28}
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

            <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
              <button
                className="sf-drawer-add-btn"
                style={{ flex: "0 0 44px", width: 44, background: "white", color: "#175C40", border: "2px solid #175C40", padding: 0 }}
                onClick={() => setWishlist(w => !w)}
                aria-label="Wishlist"
              >
                <HeartIcon filled={wishlist} />
              </button>
              <button className="sf-drawer-add-btn" style={{ flex: 1 }} onClick={onClose}>
                Add to Cart
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

// ==================== PRODUCT CARD ====================
function CollectionProductCard({
  product,
  aspectRatio,
  onQuickView,
  wishlist,
  onToggleWishlist,
}: {
  product: CollectionProduct;
  aspectRatio: string;
  onQuickView: (p: CollectionProduct) => void;
  wishlist: Set<string>;
  onToggleWishlist: (id: string) => void;
}) {
  const [hoveredColorIdx, setHoveredColorIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const { config } = useThemeConfig();

  const getImg = (colorIdx: number) => {
    const color = product.colors[colorIdx];
    if (color && product.colorImages?.[color]) return product.colorImages[color];
    return product.imageUrl;
  };

  const displayImg = getImg(hoveredColorIdx);
  const hoverImg = product.hoverImageUrl || displayImg;

  // Build product detail URL
  const productHandle = product.detailUrl?.replace("/products/", "") ||
    product.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const productDetailUrl = `/products/${productHandle}`;

  return (
    <div
      className="sf-product-card sf-product-card--hover"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Mobile tap link */}
      <a href={productDetailUrl} className="sf-product-mobile-link" aria-label={product.name} />

      <div className="sf-product-image" style={{ aspectRatio }}>
        <div className={"sf-product-img-primary"}>
          {displayImg ? <img loading="lazy" src={displayImg} alt={product.name} /> : <ImgPlaceholder label="产品图片" />}
        </div>
        <div className={"sf-product-img-hover"}>
          {hoverImg ? (
            <img loading="lazy" src={hoverImg} alt={product.name} style={!product.hoverImageUrl ? { filter: "brightness(0.85) saturate(1.1)" } : undefined} />
          ) : (
            <ImgPlaceholder label="悬浮图片" />
          )}
        </div>
        {product.badge && <span className="sf-product-badge">{product.badge}</span>}
        <div className="sf-product-hover-actions">
          <button
            className="sf-product-action-btn sf-quickadd-btn"
            onClick={(e) => { e.preventDefault(); onQuickView(product); }}
            aria-label="Quick Add"
          >
            <PlusIcon />
          </button>
          <button
            className="sf-product-action-btn sf-wishlist-btn"
            onClick={(e) => { e.preventDefault(); onToggleWishlist(product.id); }}
            aria-label="Add to Wishlist"
          >
            <HeartIcon filled={wishlist.has(product.id)} />
          </button>
        </div>
      </div>

      <div className="sf-product-info">
        <a href={productDetailUrl} className="sf-product-name" style={{ textDecoration: "none", color: "inherit", display: "block" }}>{product.name}</a>
        <div className="sf-product-price">
          {product.comparePrice && (
            <span style={{ textDecoration: "line-through", color: "#999", marginRight: 6, fontSize: "0.85em" }}>
              {product.comparePrice}
            </span>
          )}
          {product.price}
        </div>
        {/* Color swatches - click switches image only, does NOT navigate to product page */}
        {product.colors.length > 0 && (
          <div
            className="sf-product-swatches"
            style={{ marginTop: 6, display: "flex", gap: 4, flexWrap: "wrap", position: "relative", zIndex: 10 }}
          >
            {product.colors.map((color, i) => (
              <div
                key={i}
                style={{ position: "relative", zIndex: 10 }}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setHoveredColorIdx(i); }}
              >
                <ColorSwatch
                  value={color}
                  active={hoveredColorIdx === i}
                  size={20}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== FILTER SIDEBAR (desktop) ====================
function FilterSidebar({
  collection,
  activeColors,
  activeSubCat,
  onColorToggle,
  onSubCatChange,
}: {
  collection: CollectionConfig;
  activeColors: string[];
  activeSubCat: string;
  onColorToggle: (v: string) => void;
  onSubCatChange: (v: string) => void;
}) {
  const [colorOpen, setColorOpen] = useState(true);
  const [catOpen, setCatOpen] = useState(true);

  // Normalise: always include at least ["All"] as sub-categories
  const subCats = (collection.subCategories ?? []).length > 0
    ? collection.subCategories
    : ["All"];
  const colors = collection.colorFilters ?? [];

  return (
    <aside className="col-filter-sidebar">
      {/* Category section — always rendered */}
      <div className="col-filter-group">
        <button className="col-filter-group-header" onClick={() => setCatOpen(o => !o)}>
          <span>Category</span>
          <span style={{ transform: catOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
            <ChevronDownIcon />
          </span>
        </button>
        {catOpen && (
          <div className="col-filter-options">
            {subCats.map(cat => (
              <button
                key={cat}
                className={`col-filter-cat-btn${activeSubCat === cat ? " active" : ""}`}
                onClick={() => onSubCatChange(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Color section — always rendered; shows placeholder when no colors configured */}
      <div className="col-filter-group">
        <button className="col-filter-group-header" onClick={() => setColorOpen(o => !o)}>
          <span>Color</span>
          <span style={{ transform: colorOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
            <ChevronDownIcon />
          </span>
        </button>
        {colorOpen && (
          colors.length > 0 ? (
            <div className="col-filter-color-grid">
              {colors.map(cf => (
                <div
                  key={cf.id}
                  className="col-filter-color-item"
                  onClick={() => onColorToggle(cf.value)}
                >
                  <ColorSwatch
                    value={cf.value}
                    active={activeColors.includes(cf.value)}
                    size={28}
                  />
                  <span className="col-filter-color-label">{cf.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="col-filter-empty-hint">All colors</p>
          )
        )}
      </div>
    </aside>
  );
}

// ==================== MOBILE FILTER DRAWER ====================
function MobileFilterDrawer({
  collection,
  activeColors,
  activeSubCat,
  onColorToggle,
  onSubCatChange,
  onClose,
}: {
  collection: CollectionConfig;
  activeColors: string[];
  activeSubCat: string;
  onColorToggle: (v: string) => void;
  onSubCatChange: (v: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="col-mobile-drawer-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="col-mobile-drawer">
        <div className="col-mobile-drawer-header">
          <span>Filters</span>
          <button onClick={onClose} aria-label="Close filters"><XIcon /></button>
        </div>
        <div className="col-mobile-drawer-body">
          <FilterSidebar
            collection={collection}
            activeColors={activeColors}
            activeSubCat={activeSubCat}
            onColorToggle={onColorToggle}
            onSubCatChange={onSubCatChange}
          />
        </div>
        <div className="col-mobile-drawer-footer">
          <button className="col-apply-btn" onClick={onClose}>Apply Filters</button>
        </div>
      </div>
    </div>
  );
}

// ==================== SHOPIFY PLACEHOLDER CARD ====================
function ShopifyPlaceholderCard({ aspectRatio, index }: { aspectRatio: string; index: number }) {
  // Vary the shimmer opacity slightly per card for visual interest
  const opacity = 0.6 + (index % 3) * 0.1;
  return (
    <div className="sf-product-card">
      <div className="sf-product-image" style={{ aspectRatio }}>
        <div className="col-shopify-placeholder-img" style={{ opacity }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
      </div>
      <div className="sf-product-info">
        <div className="col-shopify-placeholder-text" style={{ width: "70%", height: 14, marginBottom: 6 }} />
        <div className="col-shopify-placeholder-text" style={{ width: "40%", height: 13 }} />
        <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
          {[0, 1, 2].map(j => (
            <div key={j} style={{ width: 16, height: 16, borderRadius: "50%", background: `hsl(${(index * 40 + j * 80) % 360}, 15%, 82%)` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== COLLECTION PAGE ====================
function CollectionPage({ collection }: { collection: CollectionConfig }) {
  const [activeColors, setActiveColors] = useState<string[]>([]);
  const [activeSubCat, setActiveSubCat] = useState("All");
  const [sortBy, setSortBy] = useState(collection.sortOptions[0] || "Featured");
  const [quickViewProduct, setQuickViewProduct] = useState<CollectionProduct | null>(null);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileColumns, setMobileColumns] = useState(2); // 2 or 3 columns on mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  const toggleWishlist = useCallback((id: string) => {
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleColor = useCallback((v: string) => {
    setActiveColors(prev => prev.includes(v) ? prev.filter(c => c !== v) : [...prev, v]);
  }, []);

  const visibleProducts = collection.products
    .filter(product => activeSubCat === "All" || product.subCategory === activeSubCat)
    .filter(product => activeColors.length === 0 || product.colors.some(color => activeColors.includes(color)))
    .slice()
    .sort((a, b) => {
      const priceA = Number.parseFloat(a.price.replace(/[^0-9.]/g, "")) || 0;
      const priceB = Number.parseFloat(b.price.replace(/[^0-9.]/g, "")) || 0;
      if (sortBy === "Price: Low to High") return priceA - priceB;
      if (sortBy === "Price: High to Low") return priceB - priceA;
      if (sortBy === "Newest") return (b.badge === "New" ? 1 : 0) - (a.badge === "New" ? 1 : 0);
      return 0;
    });
  const hasProducts = collection.products.length > 0;
  const PLACEHOLDER_COUNT = 8;
  const shopifyPlaceholders = Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => i);

  const gap = isMobile ? Math.max(collection.mobileGap, 12) : Math.max(collection.desktopGap, 20);
  const cols = isMobile ? mobileColumns : collection.productsPerRow;

  return (
    <div className="col-page">
      {/* Hero/Banner: reserved for merchant-uploaded campaign artwork, with collection copy overlaid */}
      <section
        className={`col-banner col-banner--with-info${!collection.showBanner ? " col-banner--text-only" : ""}`}
        aria-labelledby="collection-title"
        style={{
          height: collection.showBanner ? collection.bannerHeight : undefined,
          backgroundImage: collection.bannerImageUrl ? `url(${collection.bannerImageUrl})` : undefined,
        }}
      >
        {(!collection.bannerImageUrl || !collection.showBanner) && <div className="col-banner-placeholder" />}
        <div className="col-banner-shade" aria-hidden="true" />
        <div className="col-banner-info">
          <div className="col-banner-copy">
            <span className="col-eyebrow">Collection</span>
            <h1 id="collection-title" className="col-page-title">{collection.title}</h1>
            {collection.subtitle && <p className="col-page-subtitle">{collection.subtitle}</p>}
          </div>
          <div className="col-intro-meta">
            <span>{hasProducts ? `${visibleProducts.length} styles` : "Curated edit"}</span>
            <span>Designed for movement</span>
          </div>
        </div>
      </section>

      {/* Toolbar: sub-categories (desktop pill tabs) + sort + mobile filter btn */}
      <div className="col-toolbar">
        {/* Desktop sub-category pills */}
        <div className="col-subcats" aria-label="Collection categories">
          {collection.subCategories.map(cat => (
            <button
              key={cat}
              className={`col-subcat-btn${activeSubCat === cat ? " active" : ""}`}
              onClick={() => setActiveSubCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="col-toolbar-right">
          {/* Active color filter chips */}
          {activeColors.length > 0 && (
            <div className="col-active-filters">
              {activeColors.map(c => (
                <button key={c} className="col-active-chip" onClick={() => toggleColor(c)}>
                  <ColorSwatch value={c} size={14} />
                  <XIcon />
                </button>
              ))}
              <button className="col-clear-btn" onClick={() => setActiveColors([])}>Clear All</button>
            </div>
          )}

          {/* Mobile: grid toggle + filter btn */}
          {isMobile && (
            <div className="col-mobile-controls">
              <button
                className="col-grid-toggle"
                onClick={() => setMobileColumns(c => c === 2 ? 3 : 2)}
                aria-label="Toggle grid columns"
              >
                <GridIcon cols={mobileColumns === 2 ? 3 : 2} />
              </button>
              <button className="col-mobile-filter-btn" onClick={() => setMobileFilterOpen(true)}>
                <FilterIcon />
                <span>Filter</span>
                {activeColors.length > 0 && <span className="col-filter-badge">{activeColors.length}</span>}
              </button>
            </div>
          )}

          {/* Sort dropdown */}
          <div className="col-sort-wrapper">
            <select
              className="col-sort-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              {collection.sortOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <ChevronDownIcon />
          </div>
        </div>
      </div>

      {/* Main content: sidebar + grid */}
      <div className="col-main">
        {/* Desktop sidebar */}
        {!isMobile && (
          <FilterSidebar
            collection={collection}
            activeColors={activeColors}
            activeSubCat={activeSubCat}
            onColorToggle={toggleColor}
            onSubCatChange={setActiveSubCat}
          />
        )}

        {/* Product grid */}
        <div className="col-grid-wrapper">
          <div className="col-grid-heading">
            <span>{hasProducts ? `${visibleProducts.length} products` : "Product preview"}</span>
            <span>{activeSubCat !== "All" ? activeSubCat : "All styles"}</span>
          </div>

          {hasProducts && visibleProducts.length === 0 ? (
            <div className="col-empty">
              <p>No products match the selected filters.</p>
              <button className="col-clear-results-btn" onClick={() => { setActiveColors([]); setActiveSubCat("All"); }}>Clear filters</button>
            </div>
          ) : (
            <div
              className="col-product-grid"
              style={{
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gap,
              }}
            >
              {hasProducts
                ? visibleProducts.map(product => (
                    <CollectionProductCard
                      key={product.id}
                      product={product}
                      aspectRatio={collection.productAspectRatio}
                      onQuickView={setQuickViewProduct}
                      wishlist={wishlist}
                      onToggleWishlist={toggleWishlist}
                    />
                  ))
                : shopifyPlaceholders.map(i => (
                    <ShopifyPlaceholderCard key={i} aspectRatio={collection.productAspectRatio} index={i} />
                  ))}
            </div>
          )}
          <div className="col-product-count">
            {hasProducts ? `Showing ${visibleProducts.length} of ${collection.products.length}` : "Products connect here when the collection data is ready."}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFilterOpen && (
        <MobileFilterDrawer
          collection={collection}
          activeColors={activeColors}
          activeSubCat={activeSubCat}
          onColorToggle={toggleColor}
          onSubCatChange={setActiveSubCat}
          onClose={() => setMobileFilterOpen(false)}
        />
      )}

      {/* Quick view modal */}
      {quickViewProduct && (
        <CollectionQuickView
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}

// ==================== COLLECTIONS ROOT ====================
export default function Collections() {
  const { config } = useThemeConfig();
  const collections = config.collections || [];
  const [location] = useLocation();
  const routeHandle = location.match(/^\/collections\/?([^/?#]*)/)?.[1] || "";
  const matchedCollection = routeHandle ? collections.find(c => c.handle === routeHandle) : undefined;
  const [selectedId, setSelectedId] = useState<string>(matchedCollection?.id || collections[0]?.id || "");

  // --- Dynamic Shopify collection fetching ---
  const [dynamicCollection, setDynamicCollection] = useState<CollectionConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: shopifyCollection } = trpc.shopify.getCollection.useQuery(
    { handle: routeHandle },
    { enabled: !!routeHandle, staleTime: 60_000 }
  );

  // Map Shopify Storefront product data onto CollectionConfig.products when available
  useEffect(() => {
    if (!shopifyCollection || !routeHandle) {
      setDynamicCollection(null);
      return;
    }
    setIsLoading(true);

    // ── Extract distinct colors from all product variants ──────────────────
    const colorSet = new Map<string, string>(); // value (lowercase) → display label
    (shopifyCollection.products?.edges ?? []).forEach((edge: any) => {
      (edge.node.variants?.edges ?? []).forEach((ve: any) => {
        const colorOpt = (ve.node.selectedOptions ?? []).find(
          (o: any) => o.name.toLowerCase() === "color"
        );
        if (colorOpt?.value) {
          const key = colorOpt.value.toLowerCase();
          if (!colorSet.has(key)) colorSet.set(key, colorOpt.value);
        }
      });
    });
    const dynamicColorFilters = Array.from(colorSet.entries()).map(([, label]) => ({
      id: label.toLowerCase().replace(/\s+/g, "-"),
      label,
      value: label,
    }));

    const shopifyProducts: CollectionProduct[] = (shopifyCollection.products?.edges ?? []).map(
      (edge: any) => {
        const p = edge.node;
        const images: string[] = (p.images?.edges ?? []).map((e: any) => e.node.url);
        const amount = parseFloat(p.priceRange?.minVariantPrice?.amount ?? "0");
        const currency = p.priceRange?.minVariantPrice?.currencyCode ?? "GBP";
        const compareAmount = parseFloat(p.compareAtPriceRange?.maxVariantPrice?.amount ?? "0");
        const fmt = (n: number) =>
          new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(n);

        // Collect distinct colors for this product
        const productColors: string[] = [];
        (p.variants?.edges ?? []).forEach((ve: any) => {
          const colorOpt = (ve.node.selectedOptions ?? []).find(
            (o: any) => o.name.toLowerCase() === "color"
          );
          if (colorOpt?.value && !productColors.includes(colorOpt.value)) {
            productColors.push(colorOpt.value);
          }
        });

        return {
          id: p.id,
          name: p.title,
          price: fmt(amount),
          comparePrice: compareAmount > amount ? fmt(compareAmount) : undefined,
          imageUrl: images[0],
          hoverImageUrl: images[1],
          colors: productColors,
          colorImages: {},
          detailUrl: `/products/${p.handle}`,
        } satisfies CollectionProduct;
      }
    );

    // ── Build merged config: Shopify image always wins for banner ──────────
    const shopifyBannerUrl: string | undefined = (shopifyCollection as any).image?.url;
    const baseConfig: CollectionConfig = matchedCollection ?? {
      id: shopifyCollection.id,
      handle: shopifyCollection.handle,
      title: shopifyCollection.title,
      subtitle: shopifyCollection.description || undefined,
      bannerImageUrl: shopifyBannerUrl,
      bannerHeight: 480,
      showBanner: true,
      productsPerRow: 3,
      productAspectRatio: "3/4",
      showColorFilter: true,
      colorFilters: [],
      subCategories: ["All"],
      sortOptions: ["Featured", "Price: Low to High", "Price: High to Low", "Newest"],
      products: [],
      desktopGap: 24,
      mobileGap: 12,
      productDetails: {},
    };

    setDynamicCollection({
      ...baseConfig,
      // Shopify live banner always overrides static config when available
      bannerImageUrl: shopifyBannerUrl || baseConfig.bannerImageUrl,
      showBanner: true,
      // Use dynamic colors when Shopify provides them, otherwise keep static config colors
      colorFilters: dynamicColorFilters.length > 0 ? dynamicColorFilters : baseConfig.colorFilters,
      showColorFilter: true,
      products: shopifyProducts,
    });
    setIsLoading(false);
  }, [shopifyCollection, routeHandle, matchedCollection]);

  // Sync selectedId when URL handle or collections change
  useEffect(() => {
    if (matchedCollection && matchedCollection.id !== selectedId) {
      setSelectedId(matchedCollection.id);
      return;
    }
    if (!selectedId && collections.length > 0) setSelectedId(collections[0].id);
  }, [collections, matchedCollection, selectedId]);

  // Prefer live Shopify data; fall back to static config
  const activeCollection = dynamicCollection || matchedCollection || collections.find(c => c.id === selectedId) || collections[0];

  if (collections.length === 0) {
    return (
      <div style={{ position: "relative" }}>
        <SFPromoBar />
        <SFHeader darkMode />
        <div className="storefront-wrapper">
          <div className="storefront">
            <div style={{ padding: "80px 40px", textAlign: "center", color: "#888" }}>
              <p>No collections configured.</p>
            </div>
            <SFFooter />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <SFPromoBar />
      <SFHeader darkMode />
      <div className="storefront-wrapper">
        <div className="col-root storefront">
          {/* Collection tab switcher (for preview) */}
          {collections.length > 1 && (
            <div className="col-switcher">
              {collections.map(col => (
                <button
                  key={col.id}
                  className={`col-switcher-btn${selectedId === col.id ? " active" : ""}`}
                  onClick={() => setSelectedId(col.id)}
                >
                  {col.title}
                </button>
              ))}
            </div>
          )}

          {isLoading && (
            <div style={{ padding: "80px 40px", textAlign: "center", color: "#888" }}>
              <p>Loading collection…</p>
            </div>
          )}
          {!isLoading && activeCollection && <CollectionPage collection={activeCollection} />}
          <SFFooter />
        </div>
      </div>
    </div>
  );
}
