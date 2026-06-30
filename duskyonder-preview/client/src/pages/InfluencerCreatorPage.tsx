import { useState } from "react";
import { useParams, Link } from "wouter";
import { createPortal } from "react-dom";
import { SFPromoBar, SFHeader, SFFooter } from "@/components/StorefrontShell";
import { useThemeConfig } from "@/contexts/ThemeConfigContext";
import type { InfluencerCreator, InfluencerMediaItem } from "@/contexts/ThemeConfigContext";
import { useCart } from "@/contexts/CartContext";

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

// ---- Quick-view Product Panel (simplified PDP style) ----
function ProductQuickView({
  product,
  onClose,
}: {
  product: { name: string; price?: string; imageUrl?: string; link?: string; colors?: string[]; sizes?: string[] };
  onClose: () => void;
}) {
  const { addItem, openCart } = useCart();
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] ?? "");
  const [selectedSize, setSelectedSize] = useState("");
  const [previewIdx, setPreviewIdx] = useState(0);

  // Mock 3 preview slots (main + 2 thumbnails)
  const previews = [product.imageUrl, undefined, undefined];

  function handleAddToCart() {
    addItem({
      id: `${product.name}_${selectedColor}_${selectedSize}`,
      name: product.name,
      price: product.price ?? "",
      imageUrl: product.imageUrl,
      productUrl: product.link,
    });
    openCart();
    onClose();
  }

  return createPortal(
    <div
      className="inf-cd-qv-overlay"
      onClick={onClose}
    >
      <div className="inf-cd-qv-panel" onClick={e => e.stopPropagation()}>
        <button className="inf-cd-qv-close" onClick={onClose} aria-label="Close">✕</button>
        {/* Left: main image + thumbnails */}
        <div className="inf-cd-qv-left">
          <div className="inf-cd-qv-main-img">
            {previews[previewIdx]
              ? <img src={previews[previewIdx]} alt={product.name} />
              : <div className="inf-cd-qv-img-placeholder" />
            }
          </div>
          <div className="inf-cd-qv-thumbs">
            {previews.map((src, i) => (
              <button
                key={i}
                className={`inf-cd-qv-thumb${previewIdx === i ? " active" : ""}`}
                onClick={() => setPreviewIdx(i)}
              >
                {src
                  ? <img src={src} alt="" />
                  : <div className="inf-cd-qv-thumb-placeholder" />
                }
              </button>
            ))}
          </div>
        </div>
        {/* Right: product info */}
        <div className="inf-cd-qv-right">
          <div className="inf-cd-qv-name">{product.name}</div>
          {product.price && <div className="inf-cd-qv-price">{product.price}</div>}

          {product.colors && product.colors.length > 0 && (
            <div className="inf-cd-qv-section">
              <div className="inf-cd-qv-section-label">Color: <span style={{ fontWeight: 400, color: "#555" }}>{selectedColor}</span></div>
              <div className="inf-cd-qv-colors">
                {product.colors.map(c => (
                  <button
                    key={c}
                    className={`inf-cd-qv-color-swatch${selectedColor === c ? " active" : ""}`}
                    style={{ background: c.toLowerCase() }}
                    onClick={() => setSelectedColor(c)}
                    title={c}
                  />
                ))}
              </div>
            </div>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <div className="inf-cd-qv-section">
              <div className="inf-cd-qv-section-label">Size</div>
              <div className="inf-cd-qv-sizes">
                {product.sizes.map(s => (
                  <button
                    key={s}
                    className={`inf-cd-qv-size-btn${selectedSize === s ? " active" : ""}`}
                    onClick={() => setSelectedSize(s)}
                  >{s}</button>
                ))}
              </div>
            </div>
          )}

          <button className="inf-cd-qv-add-btn" onClick={handleAddToCart}>
            ADD TO CART
          </button>

          {product.link && (
            <a href={product.link} className="inf-cd-qv-view-link">
              View Full Details →
            </a>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

// ---- Media item lightbox ----
function MediaLightbox({ item, onClose }: { item: InfluencerMediaItem; onClose: () => void }) {
  const isVideo = item.type === "video";
  const hasProduct = !!(item.productName || item.productLink);
  return createPortal(
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      {isVideo && hasProduct ? (
        // Video + product info: left video, right product panel
        <div onClick={e => e.stopPropagation()} style={{ display: "flex", gap: 0, maxWidth: 900, width: "95vw", maxHeight: "92vh", borderRadius: 14, overflow: "hidden", background: "#fff", position: "relative", boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}>
          {/* Left: Video */}
          <div style={{ flex: "0 0 auto", width: "min(360px, 50vw)", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <video src={item.url} controls autoPlay style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
          {/* Right: Product info */}
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
        // Image or video-only: centered lightbox
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

// ---- Media Grid Item (for Videos tab) ----
function MediaGridItem({ item }: { item: InfluencerMediaItem }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
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
            {item.productLink && <a href={item.productLink} className="inf-cd-media-shop-btn" onClick={e => e.stopPropagation()}>Shop</a>}
          </div>
        )}
      </div>
      {lightboxOpen && <MediaLightbox item={item} onClose={() => setLightboxOpen(false)} />}
    </>
  );
}

// ---- Default demo products ----
function getDefaultProducts(creatorId: string) {
  return [
    { id: `${creatorId}_p1`, name: "AirLight High-Waist Leggings", price: "$98", imageUrl: "", link: "#", colors: ["#175C40", "#1a1a1a", "#f0ece4"], sizes: ["XS", "S", "M", "L", "XL"] },
    { id: `${creatorId}_p2`, name: "SculptFlex Flare Leggings", price: "$108", imageUrl: "", link: "#", colors: ["#175C40", "#e8b4a0", "#1a1a1a"], sizes: ["XS", "S", "M", "L", "XL"] },
    { id: `${creatorId}_p3`, name: "EcoMove Capri Leggings", price: "$88", imageUrl: "", link: "#", colors: ["#1a1a1a", "#175C40"], sizes: ["XS", "S", "M", "L"] },
    { id: `${creatorId}_p4`, name: "Freedom Shorts", price: "$68", imageUrl: "", link: "#", colors: ["#f0ece4", "#e8b4a0"], sizes: ["XS", "S", "M", "L", "XL"] },
    { id: `${creatorId}_p5`, name: "Sculpt Bra", price: "$68", imageUrl: "", link: "#", colors: ["#175C40", "#1a1a1a", "#8B7355", "#d0ccc8"], sizes: ["XS", "S", "M", "L"] },
    { id: `${creatorId}_p6`, name: "Form Flare Pants", price: "$118", imageUrl: "", link: "#", colors: ["#1a1a1a", "#175C40"], sizes: ["XS", "S", "M", "L", "XL"] },
  ];
}

function getDefaultMediaItems(creatorId: string): InfluencerMediaItem[] {
  const captions = [
    "Movement is freedom 🏃\u200d♀️",
    "Morning flow ✨",
    "Strong is beautiful 💪",
    "Flow state activated",
    "Run your own race",
    "Feel the difference",
  ];
  return Array.from({ length: 6 }, (_, i) => ({
    id: `${creatorId}_media_${i}`,
    type: "video" as const,
    url: "",
    thumbnailUrl: "",
    caption: captions[i] ?? "",
    productName: i < 4 ? "AirLight Leggings" : undefined,
    productLink: i < 4 ? "#" : undefined,
  }));
}

// ---- Product Card (for Products tab) ----
function ProductCard({ product }: { product: ReturnType<typeof getDefaultProducts>[0] }) {
  const [qvOpen, setQvOpen] = useState(false);
  return (
    <>
      <div className="inf-cd-product-card">
        <div className="inf-cd-product-img" onClick={() => setQvOpen(true)}>
          {product.imageUrl
            ? <img src={product.imageUrl} alt={product.name} loading="lazy" />
            : <div className="inf-cd-product-img-placeholder" />
          }
          <button className="inf-cd-product-quick-btn" onClick={e => { e.stopPropagation(); setQvOpen(true); }}>
            Quick View
          </button>
        </div>
        <div className="inf-cd-product-info">
          <div className="inf-cd-product-name">{product.name}</div>
          {product.price && <div className="inf-cd-product-price">{product.price}</div>}
          {product.colors && product.colors.length > 0 && (
            <div className="inf-cd-product-swatches">
              {product.colors.map((c, i) => (
                <span key={i} className="inf-cd-product-swatch" style={{ background: c }} />
              ))}
            </div>
          )}
        </div>
      </div>
      {qvOpen && <ProductQuickView product={product} onClose={() => setQvOpen(false)} />}
    </>
  );
}

// ---- Main Creator Detail Page ----
export default function InfluencerCreatorPage() {
  const params = useParams<{ handle: string }>();
  const handle = params.handle ?? "";
  const { config } = useThemeConfig();
  const [activeTab, setActiveTab] = useState<"products" | "videos">("products");

  const cfg = config.influencer;
  const creators = cfg?.creators ?? [];

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

  const mediaItems = creator.detailMediaItems && creator.detailMediaItems.length > 0
    ? creator.detailMediaItems
    : getDefaultMediaItems(creator.id);

  // Use admin-configured shopProducts if available, otherwise fall back to hardcoded defaults
  const products = (creator.shopProducts && creator.shopProducts.length > 0)
    ? creator.shopProducts.map(sp => ({
        id: sp.id,
        name: sp.name,
        price: sp.price,
        imageUrl: sp.imageUrl ?? "",
        link: sp.link ?? "#",
        colors: [] as string[],
        sizes: [] as string[],
      }))
    : getDefaultProducts(creator.id);

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

      {/* ===== INSTAGRAM-STYLE PROFILE HEADER ===== */}
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
            {/* Row 1: name + platform badge + social link */}
            <div className="inf-cd-profile-name-row">
              <h1 className="inf-cd-profile-name">{creator.name}</h1>
              <PlatformBadge platform={creator.platform} />
              {creator.profileLink && creator.profileLink !== "#" && (
                <a href={creator.profileLink} target="_blank" rel="noopener noreferrer" className="inf-cd-profile-social-btn">
                  Follow →
                </a>
              )}
            </div>

            {/* Row 2: handle */}
            <div className="inf-cd-profile-handle">{creator.handle}</div>

            {/* Row 3: stats */}
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

            {/* Row 4: bio */}
            {creator.bio && <p className="inf-cd-profile-bio">{creator.bio}</p>}

            {/* Row 5: discount code */}
            <div className="inf-cd-profile-code-row">
              <span className="inf-cd-profile-code-label">Exclusive Code:</span>
              <span className="inf-cd-profile-code">{creator.handle.replace("@", "").toUpperCase()}15</span>
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
          <div className="inf-cd-products-grid">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ===== VIDEOS TAB ===== */}
      {activeTab === "videos" && (
        <section className="inf-cd-tab-section">
          {mediaItems.length > 0 ? (
            <div className="inf-cd-media-grid">
              {mediaItems.map(item => <MediaGridItem key={item.id} item={item} />)}
            </div>
          ) : (
            <div className="inf-cd-empty">No content yet.</div>
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

    </div>
  );
}
