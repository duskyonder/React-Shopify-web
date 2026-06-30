import { useState } from "react";
import { useParams, Link } from "wouter";
import { SFPromoBar, SFHeader, SFFooter } from "@/components/StorefrontShell";
import { useThemeConfig } from "@/contexts/ThemeConfigContext";
import type { InfluencerCreator, InfluencerMediaItem, InfluencerShopProduct } from "@/contexts/ThemeConfigContext";
import { QuickAddDrawer, type QuickAddProduct } from "@/components/QuickAddDrawer";
import { createPortal } from "react-dom";

// ---- Platform badge ----
function PlatformBadge({ platform }: { platform: string }) {
  const map: Record<string, { label: string; color: string }> = {
    instagram: { label: "IG", color: "#E1306C" },
    tiktok: { label: "TT", color: "#010101" },
    youtube: { label: "YT", color: "#FF0000" },
    xiaohongshu: { label: "XHS", color: "#FF2442" },
  };
  const p = map[platform] ?? { label: platform.toUpperCase().slice(0, 2), color: "#888" };
  return (
    <span className="inf-cd-platform-badge" style={{ background: p.color }}>{p.label}</span>
  );
}

// ---- Product Card ----
// Triggers the shared QuickAddDrawer via onQuickAdd callback
function ProductCard({
  product,
  onQuickAdd,
}: {
  product: InfluencerShopProduct;
  onQuickAdd: (p: QuickAddProduct) => void;
}) {
  function handleQuickAdd(e: React.MouseEvent) {
    e.stopPropagation();
    // Extract Shopify handle from link: "/products/some-handle" → "some-handle"
    const handle = product.link
      ? product.link.replace(/^\/products\//, "").split("?")[0]
      : undefined;
    onQuickAdd({
      id: product.id,
      handle: handle || null,
      name: product.name,
      price: product.price ?? "",
      imageUrl: product.imageUrl ?? null,
      productUrl: product.link ?? null,
    });
  }

  return (
    <div className="inf-cd-product-card">
      <div className="inf-cd-product-img" onClick={handleQuickAdd}>
        {product.imageUrl
          ? <img src={product.imageUrl} alt={product.name} loading="lazy" />
          : <div className="inf-cd-product-img-placeholder" />
        }
        <button className="inf-cd-product-quick-btn" onClick={handleQuickAdd}>
          Quick Add
        </button>
      </div>
      <div className="inf-cd-product-info">
        <div className="inf-cd-product-name">{product.name}</div>
        {product.price && <div className="inf-cd-product-price">{product.price}</div>}
      </div>
    </div>
  );
}

// ---- Media item lightbox ----
function MediaLightbox({ item, onClose }: { item: InfluencerMediaItem; onClose: () => void }) {
  const isVideo = item.type === "video";
  const hasProduct = !!(item.productName || item.productLink);
  return createPortal(
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      {isVideo && hasProduct ? (
        <div onClick={e => e.stopPropagation()} style={{ display: "flex", gap: 0, maxWidth: 900, width: "95vw", maxHeight: "92vh", borderRadius: 14, overflow: "hidden", background: "#fff", position: "relative", boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}>
          <div style={{ flex: "0 0 auto", width: "min(360px, 50vw)", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <video src={item.url} controls autoPlay style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
          <div style={{ flex: 1, padding: "36px 28px 28px", display: "flex", flexDirection: "column", gap: 16, overflowY: "auto", minWidth: 0 }}>
            {item.thumbnailUrl && (
              <div style={{ aspectRatio: "3/4", borderRadius: 8, overflow: "hidden", background: "#f5f5f5", maxHeight: 240 }}>
                <img src={item.thumbnailUrl} alt={item.productName ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
            )}
            {item.caption && <p style={{ margin: 0, fontSize: "0.9rem", color: "#666", lineHeight: 1.6 }}>{item.caption}</p>}
            {item.productName && <div style={{ fontWeight: 700, fontSize: 18, color: "#111", lineHeight: 1.3 }}>{item.productName}</div>}
            {item.productLink && (
              <a href={item.productLink} style={{ display: "inline-block", padding: "12px 24px", background: "#0D3D2B", color: "#fff", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none", borderRadius: 3, textAlign: "center" }}>Shop Now</a>
            )}
          </div>
          <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "1px solid #e0e0e0", color: "#333", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }} aria-label="Close">✕</button>
        </div>
      ) : (
        <div onClick={e => e.stopPropagation()} style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh", borderRadius: 10, overflow: "hidden", background: "#111", display: "flex", flexDirection: "column" }}>
          {item.type === "image" ? (
            <img src={item.url} alt={item.caption ?? ""} style={{ maxWidth: "85vw", maxHeight: "80vh", objectFit: "contain", display: "block" }} />
          ) : (
            <video src={item.url} controls autoPlay style={{ maxWidth: "85vw", maxHeight: "80vh", display: "block" }} />
          )}
          {(item.caption || item.productName) && (
            <div style={{ padding: "14px 20px", background: "#fff" }}>
              {item.caption && <p style={{ margin: "0 0 6px", fontSize: "0.9rem", color: "#333" }}>{item.caption}</p>}
              {item.productName && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.88rem", color: "#111" }}>{item.productName}</span>
                  {item.productLink && (
                    <a href={item.productLink} style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0D3D2B", border: "1px solid #0D3D2B", padding: "4px 12px", borderRadius: 3, textDecoration: "none" }}>Shop Now</a>
                  )}
                </div>
              )}
            </div>
          )}
          <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "1px solid #e0e0e0", color: "#333", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }} aria-label="Close">✕</button>
        </div>
      )}
    </div>,
    document.body
  );
}

// ---- Media Grid Item ----
// "Shop" button on media items also triggers QuickAddDrawer when a linked product exists
function MediaGridItem({
  item,
  onQuickAdd,
}: {
  item: InfluencerMediaItem;
  onQuickAdd: (p: QuickAddProduct) => void;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  function handleShopClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (!item.productName) return;
    const handle = item.productLink
      ? item.productLink.replace(/^\/products\//, "").split("?")[0]
      : undefined;
    onQuickAdd({
      id: item.id,
      handle: handle || null,
      name: item.productName,
      price: "",
      imageUrl: item.thumbnailUrl ?? null,
      productUrl: item.productLink ?? null,
    });
  }

  return (
    <>
      <div className="inf-cd-media-item" onClick={() => setLightboxOpen(true)}>
        {item.type === "image" ? (
          item.url ? <img src={item.url} alt={item.caption ?? ""} loading="lazy" /> : <div className="inf-cd-media-placeholder" />
        ) : (
          <>
            {item.thumbnailUrl ? <img src={item.thumbnailUrl} alt={item.caption ?? ""} loading="lazy" /> : <div className="inf-cd-media-placeholder" />}
            <div className="inf-cd-video-play-overlay">▶</div>
          </>
        )}
        {item.caption && <div className="inf-cd-media-caption">{item.caption}</div>}
        {item.productName && (
          <div className="inf-cd-media-product">
            <span className="inf-cd-media-product-name">{item.productName}</span>
            <button className="inf-cd-media-shop-btn" onClick={handleShopClick}>
              Quick Add
            </button>
          </div>
        )}
      </div>
      {lightboxOpen && <MediaLightbox item={item} onClose={() => setLightboxOpen(false)} />}
    </>
  );
}

// ---- Empty state ----
function EmptyState({ message }: { message: string }) {
  return (
    <div className="inf-cd-empty" style={{ padding: "60px 20px", textAlign: "center", color: "#888" }}>
      <p style={{ fontSize: "2rem", marginBottom: 12 }}>🗂️</p>
      <p style={{ fontSize: "0.95rem" }}>{message}</p>
    </div>
  );
}

// ---- Main Creator Detail Page ----
export default function InfluencerCreatorPage() {
  const params = useParams<{ handle: string }>();
  const handle = params.handle ?? "";
  const { config } = useThemeConfig();
  const [activeTab, setActiveTab] = useState<"products" | "videos">("products");

  // Shared QuickAddDrawer state — lifted to page level so both ProductCard and MediaGridItem can trigger it
  const [quickAddProduct, setQuickAddProduct] = useState<QuickAddProduct | null>(null);

  const creators = config.influencer?.creators ?? [];

  const creator: InfluencerCreator | undefined = creators.find(
    c => c.handle.replace("@", "").toLowerCase() === handle.toLowerCase()
  );

  if (!creator) {
    return (
      <div className="inf-creator-detail-page storefront-wrapper">
        <SFPromoBar />
        <SFHeader darkMode={true} />
        <div className="inf-cd-empty">
          <p style={{ fontSize: "2rem", marginBottom: 12 }}>😕</p>
          <p>Creator not found.</p>
          <Link href="/pages/influencer" style={{ color: "#0D3D2B", fontWeight: 600, textDecoration: "underline" }}>
            ← Back to Creators
          </Link>
        </div>
        <SFFooter />
      </div>
    );
  }

  // Dynamic discount code based on creator handle
  const discountCode = `${creator.handle.replace("@", "").toUpperCase()}15`;

  // Products: use admin-configured shopProducts only — no hardcoded fallback
  const products: InfluencerShopProduct[] = creator.shopProducts ?? [];

  // Media items: use admin-configured detailMediaItems only — no hardcoded fallback
  const mediaItems: InfluencerMediaItem[] = creator.detailMediaItems ?? [];

  return (
    <div className="inf-creator-detail-page storefront-wrapper">
      <SFPromoBar />
      <SFHeader darkMode={true} />
      <style>{`
        .inf-creator-detail-page .inf-cd-profile {
          padding-top: calc(40px + 64px + 48px);
        }
        @media (max-width: 900px) {
          .inf-creator-detail-page .inf-cd-profile {
            padding-top: calc(36px + 56px + 32px);
          }
        }
      `}</style>

      {/* ===== PROFILE HEADER ===== */}
      <section className="inf-cd-profile">
        <div className="inf-cd-profile-inner">
          {/* Left: avatar */}
          <div className="inf-cd-profile-avatar-col">
            {creator.avatarUrl
              ? <img src={creator.avatarUrl} alt={creator.name} className="inf-cd-profile-avatar" />
              : <div className="inf-cd-profile-avatar-placeholder">{creator.name.charAt(0)}</div>
            }
          </div>

          {/* Right: info */}
          <div className="inf-cd-profile-info">
            <div className="inf-cd-profile-name-row">
              <h1 className="inf-cd-profile-name">{creator.name}</h1>
              <PlatformBadge platform={creator.platform} />
              {creator.profileLink && creator.profileLink !== "#" && (
                <a href={creator.profileLink} target="_blank" rel="noopener noreferrer" className="inf-cd-profile-social-btn">
                  Follow →
                </a>
              )}
            </div>

            <div className="inf-cd-profile-handle">{creator.handle}</div>

            <div className="inf-cd-profile-stats">
              {creator.postsCount && (
                <div className="inf-cd-profile-stat">
                  <span className="inf-cd-profile-stat-value">{creator.postsCount}</span>
                  <span className="inf-cd-profile-stat-label">Posts</span>
                </div>
              )}
              <div className="inf-cd-profile-stat">
                <span className="inf-cd-profile-stat-value">{creator.followers}</span>
                <span className="inf-cd-profile-stat-label">Followers</span>
              </div>
              {creator.likes && (
                <div className="inf-cd-profile-stat">
                  <span className="inf-cd-profile-stat-value">{creator.likes}</span>
                  <span className="inf-cd-profile-stat-label">Likes</span>
                </div>
              )}
            </div>

            {creator.bio && <p className="inf-cd-profile-bio">{creator.bio}</p>}

            <div className="inf-cd-profile-code-row">
              <span className="inf-cd-profile-code-label">Exclusive Code:</span>
              <span className="inf-cd-profile-code">{discountCode}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TAB BAR ===== */}
      <div className="inf-cd-tab-bar">
        <div className="inf-cd-tab-bar-inner">
          <button
            className={`inf-cd-tab-btn${activeTab === "products" ? " active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            Products
          </button>
          <button
            className={`inf-cd-tab-btn${activeTab === "videos" ? " active" : ""}`}
            onClick={() => setActiveTab("videos")}
          >
            Videos
          </button>
        </div>
      </div>

      {/* ===== PRODUCTS TAB ===== */}
      {activeTab === "products" && (
        <section className="inf-cd-tab-section">
          {products.length > 0 ? (
            <div className="inf-cd-products-grid">
              {products.map(p => (
                <ProductCard key={p.id} product={p} onQuickAdd={setQuickAddProduct} />
              ))}
            </div>
          ) : (
            <EmptyState message="No products have been added for this creator yet." />
          )}
        </section>
      )}

      {/* ===== VIDEOS TAB ===== */}
      {activeTab === "videos" && (
        <section className="inf-cd-tab-section">
          {mediaItems.length > 0 ? (
            <div className="inf-cd-media-grid">
              {mediaItems.map(item => (
                <MediaGridItem key={item.id} item={item} onQuickAdd={setQuickAddProduct} />
              ))}
            </div>
          ) : (
            <EmptyState message="No media has been added for this creator yet." />
          )}
        </section>
      )}

      {/* ===== BACK LINK ===== */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 40px 60px" }}>
        <Link href="/pages/influencer" style={{ color: "#0D3D2B", fontWeight: 600, textDecoration: "none", fontSize: "0.9rem" }}>
          ← Back to All Creators
        </Link>
      </div>

      <SFFooter />

      {/* ===== SHARED QUICK ADD DRAWER ===== */}
      <QuickAddDrawer
        product={quickAddProduct}
        onClose={() => setQuickAddProduct(null)}
      />
    </div>
  );
}
