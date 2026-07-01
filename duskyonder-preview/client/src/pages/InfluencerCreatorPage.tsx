import { useState } from "react";
import { useParams, Link } from "wouter";
import { SFPromoBar, SFHeader, SFFooter } from "@/components/StorefrontShell";
import { useThemeConfig } from "@/contexts/ThemeConfigContext";
import type { InfluencerCreator, InfluencerMediaItem, InfluencerShopProduct } from "@/contexts/ThemeConfigContext";
import { QuickAddDrawer, type QuickAddProduct } from "@/components/QuickAddDrawer";
import { createPortal } from "react-dom";

// ─── Design tokens (mirrors Home page palette) ───────────────────────────────
const FOREST = "#0D3D2B";
const FOREST_HOVER = "#175C40";
const TEXT_PRIMARY = "#1a1a1a";
const TEXT_SECONDARY = "#6b6b6b";
const CARD_BG = "#fff";
const CARD_IMG_BG = "#f5f5f5";
const FONT_DISPLAY = "'Tenor Sans', serif";
const FONT_BODY = "'Outfit', sans-serif";

// ─── Play icon (matches HomeVideos) ──────────────────────────────────────────
function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

// ─── Plus icon (matches HomeFeatured mobile quick-add) ───────────────────────
function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

// ─── Platform badge ───────────────────────────────────────────────────────────
function PlatformBadge({ platform }: { platform: string }) {
  const map: Record<string, { label: string; color: string }> = {
    instagram: { label: "IG", color: "#E1306C" },
    tiktok: { label: "TT", color: "#010101" },
    youtube: { label: "YT", color: "#FF0000" },
    xiaohongshu: { label: "XHS", color: "#FF2442" },
  };
  const p = map[platform] ?? { label: platform.toUpperCase().slice(0, 2), color: "#888" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      background: p.color, color: "#fff",
      fontFamily: FONT_BODY, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
      padding: "3px 7px", borderRadius: 3, flexShrink: 0,
    }}>{p.label}</span>
  );
}

// ─── Product Card (matches sf-product-card from HomeFeatured) ─────────────────
// Desktop: image with hover overlay "Quick Add" button + product info below
// Mobile: image with bottom-right + circle button (same as HomeFeatured mobile)
function ProductCard({
  product,
  onQuickAdd,
}: {
  product: InfluencerShopProduct;
  onQuickAdd: (p: QuickAddProduct) => void;
}) {
  const [hovered, setHovered] = useState(false);

  function buildPayload(): QuickAddProduct {
    const handle = product.link
      ? product.link.replace(/^\/products\//, "").split("?")[0]
      : undefined;
    return {
      id: product.id,
      handle: handle || null,
      name: product.name,
      price: product.price ?? "",
      imageUrl: product.imageUrl ?? null,
      productUrl: product.link ?? null,
    };
  }

  return (
    <div
      className="sf-product-card sf-product-card--hover"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: "relative", cursor: "pointer" }}
    >
      {/* Full-card link for desktop (sits above image, below action buttons) */}
      {product.link && (
        <a
          href={product.link}
          className="sf-product-desktop-link"
          aria-label={product.name}
        />
      )}

      {/* Image area — 3:4 aspect ratio, matches HomeFeatured */}
      <div
        className="sf-product-image"
        style={{ aspectRatio: "3/4", position: "relative", overflow: "hidden", background: CARD_IMG_BG }}
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block",
              transition: "transform 0.4s cubic-bezier(0.23,1,0.32,1)",
              transform: hovered ? "scale(1.04)" : "scale(1)" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#e8f0ec,#f5f5f5)" }} />
        )}

        {/* Desktop hover: "Quick Add" bar — matches sf-product-hover-actions */}
        <div
          className="sf-product-hover-actions"
          style={{ opacity: hovered ? 1 : 0, transition: "opacity 0.2s" }}
        >
          <button
            className="sf-product-action-btn sf-quickadd-btn"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickAdd(buildPayload()); }}
            aria-label="Quick Add"
            title="Quick Add to Cart"
          >
            <PlusIcon />
          </button>
        </div>

        {/* Mobile: bottom-right + circle button — matches HomeFeatured mobile */}
        <button
          className="sf-product-mobile-quickadd-btn"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickAdd(buildPayload()); }}
          aria-label="Quick Add"
          style={{
            position: "absolute", bottom: 8, right: 8,
            width: 32, height: 32, borderRadius: "50%",
            background: FOREST, border: "none", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", zIndex: 5,
            boxShadow: "0 2px 8px rgba(0,0,0,0.22)",
          }}
        >
          <PlusIcon />
        </button>
      </div>

      {/* Product info — matches sf-product-info */}
      <div className="sf-product-info" style={{ padding: "12px 0 14px" }}>
        <div
          className="sf-product-name"
          style={{
            fontFamily: FONT_DISPLAY, fontWeight: 300, fontSize: "0.875rem",
            color: TEXT_PRIMARY, lineHeight: 1.4, marginBottom: 4,
          }}
        >
          {product.name}
        </div>
        {product.price && (
          <div
            className="sf-product-price"
            style={{ fontFamily: FONT_BODY, fontWeight: 300, fontSize: "0.8rem", color: TEXT_PRIMARY }}
          >
            {product.price}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Media Lightbox (portal, for viewing full media) ─────────────────────────
function MediaLightbox({ item, onClose }: { item: InfluencerMediaItem; onClose: () => void }) {
  const isVideo = item.type === "video";
  const hasProduct = !!(item.productName || item.productLink);

  return createPortal(
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,0.75)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
    >
      {isVideo && hasProduct ? (
        <div
          onClick={e => e.stopPropagation()}
          style={{ display: "flex", gap: 0, maxWidth: 900, width: "95vw", maxHeight: "92vh",
            borderRadius: 14, overflow: "hidden", background: CARD_BG, position: "relative",
            boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}
        >
          <div style={{ flex: "0 0 auto", width: "min(360px,50vw)", background: "#000",
            display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <video src={item.url} controls autoPlay
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
          <div style={{ flex: 1, padding: "36px 28px 28px", display: "flex", flexDirection: "column",
            gap: 16, overflowY: "auto", minWidth: 0 }}>
            {item.thumbnailUrl && (
              <div style={{ aspectRatio: "3/4", borderRadius: 8, overflow: "hidden",
                background: CARD_IMG_BG, maxHeight: 240 }}>
                <img src={item.thumbnailUrl} alt={item.productName ?? ""}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
            )}
            {item.caption && (
              <p style={{ margin: 0, fontFamily: FONT_BODY, fontSize: "0.9rem", color: TEXT_SECONDARY, lineHeight: 1.6 }}>
                {item.caption}
              </p>
            )}
            {item.productName && (
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 400, fontSize: 18, color: TEXT_PRIMARY, lineHeight: 1.3 }}>
                {item.productName}
              </div>
            )}
            {item.productLink && (
              <a href={item.productLink}
                style={{ display: "inline-block", padding: "12px 24px", background: FOREST, color: "#fff",
                  fontFamily: FONT_BODY, fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.08em",
                  textTransform: "uppercase", textDecoration: "none", borderRadius: 3, textAlign: "center" }}>
                Shop Now
              </a>
            )}
          </div>
          <button onClick={onClose}
            style={{ position: "absolute", top: 12, right: 12, width: 34, height: 34, borderRadius: "50%",
              background: "rgba(255,255,255,0.9)", border: "1px solid #e0e0e0", color: "#333",
              cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
            aria-label="Close">✕</button>
        </div>
      ) : (
        <div
          onClick={e => e.stopPropagation()}
          style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh", borderRadius: 10,
            overflow: "hidden", background: "#111", display: "flex", flexDirection: "column" }}
        >
          {item.type === "image" ? (
            <img src={item.url} alt={item.caption ?? ""}
              style={{ maxWidth: "85vw", maxHeight: "80vh", objectFit: "contain", display: "block" }} />
          ) : (
            <video src={item.url} controls autoPlay
              style={{ maxWidth: "85vw", maxHeight: "80vh", display: "block" }} />
          )}
          {(item.caption || item.productName) && (
            <div style={{ padding: "14px 20px", background: CARD_BG }}>
              {item.caption && (
                <p style={{ margin: "0 0 6px", fontFamily: FONT_BODY, fontSize: "0.9rem", color: "#333" }}>
                  {item.caption}
                </p>
              )}
              {item.productName && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 400, fontSize: "0.88rem", color: TEXT_PRIMARY }}>
                    {item.productName}
                  </span>
                  {item.productLink && (
                    <a href={item.productLink}
                      style={{ fontFamily: FONT_BODY, fontSize: "0.8rem", fontWeight: 700, color: FOREST,
                        border: `1px solid ${FOREST}`, padding: "4px 12px", borderRadius: 3, textDecoration: "none" }}>
                      Shop Now
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
          <button onClick={onClose}
            style={{ position: "absolute", top: 12, right: 12, width: 34, height: 34, borderRadius: "50%",
              background: "rgba(255,255,255,0.9)", border: "1px solid #e0e0e0", color: "#333",
              cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
            aria-label="Close">✕</button>
        </div>
      )}
    </div>,
    document.body
  );
}

// ─── Video Card (matches sf-video-card-wrapper from HomeVideos) ───────────────
// 9:16 video thumbnail with play badge + creator name badge (top-left)
// Product strip below card: thumbnail | name + price | + circle button
function VideoCard({
  item,
  onQuickAdd,
}: {
  item: InfluencerMediaItem;
  onQuickAdd: (p: QuickAddProduct) => void;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const hasProduct = !!(item.productName);

  function handleQuickAdd(e: React.MouseEvent) {
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

  // Thumbnail: use explicit thumbnailUrl, else the media url for images
  const thumbSrc = item.thumbnailUrl || (item.type === "image" ? item.url : null);

  return (
    <>
      {/* sf-video-card-wrapper: flex column, gap 0 */}
      <div className="sf-video-card-wrapper" style={{ display: "flex", flexDirection: "column", gap: 0 }}>

        {/* Video card — 9:16 aspect, matches sf-video-card */}
        <div
          className="sf-video-card"
          style={{ aspectRatio: "9/16", cursor: "pointer", position: "relative",
            overflow: "hidden", borderRadius: 8, background: "#1a6b4a", width: "100%" }}
          onClick={() => setLightboxOpen(true)}
        >
          {thumbSrc ? (
            <img loading="lazy" src={thumbSrc} alt={item.caption ?? ""}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", background: FOREST,
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PlayIcon />
            </div>
          )}

          {/* Play badge — matches sf-video-play */}
          <div className="sf-video-play">
            <PlayIcon />
          </div>

          {/* Caption badge — top-left, matches sf-video-creator-badge */}
          {item.caption && (
            <div className="sf-video-creator-badge">
              <span className="sf-video-creator-name">{item.caption}</span>
            </div>
          )}
        </div>

        {/* Product strip — matches sf-video-product-card */}
        {hasProduct && (
          <div className="sf-video-product-card" style={{ borderRadius: "0 0 8px 8px" }}>
            {item.thumbnailUrl && (
              <img loading="lazy" src={item.thumbnailUrl} alt={item.productName ?? ""}
                className="sf-video-product-img" />
            )}
            <div className="sf-video-product-info">
              <div className="sf-video-product-name">{item.productName}</div>
            </div>
            {/* Quick-add circle button — matches HomeVideos product strip */}
            <button
              onClick={handleQuickAdd}
              style={{ width: 30, height: 30, borderRadius: "50%", background: TEXT_PRIMARY,
                border: "none", color: "#fff", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, marginRight: 10 }}
              aria-label="Quick Add"
            >
              <PlusIcon />
            </button>
          </div>
        )}
      </div>

      {lightboxOpen && <MediaLightbox item={item} onClose={() => setLightboxOpen(false)} />}
    </>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ message }: { message: string }) {
  return (
    <div style={{ padding: "60px 20px", textAlign: "center", color: TEXT_SECONDARY }}>
      <p style={{ fontSize: "2rem", marginBottom: 12 }}>🗂️</p>
      <p style={{ fontFamily: FONT_BODY, fontSize: "0.95rem" }}>{message}</p>
    </div>
  );
}

// ─── Main Creator Detail Page ─────────────────────────────────────────────────
export default function InfluencerCreatorPage() {
  const params = useParams<{ handle: string }>();
  const handle = params.handle ?? "";
  const { config } = useThemeConfig();
  const [activeTab, setActiveTab] = useState<"products" | "videos">("products");
  const [quickAddProduct, setQuickAddProduct] = useState<QuickAddProduct | null>(null);

  const creators = config.influencer?.creators ?? [];
  const creator: InfluencerCreator | undefined = creators.find(
    c => c.handle.replace("@", "").toLowerCase() === handle.toLowerCase()
  );

  if (!creator) {
    return (
      <div className="storefront-wrapper">
        <SFPromoBar />
        <SFHeader darkMode={true} />
        <div style={{ padding: "120px 20px 60px", textAlign: "center", color: TEXT_SECONDARY }}>
          <p style={{ fontSize: "2rem", marginBottom: 12 }}>😕</p>
          <p style={{ fontFamily: FONT_BODY, marginBottom: 20 }}>Creator not found.</p>
          <Link href="/pages/influencer"
            style={{ fontFamily: FONT_BODY, color: FOREST, fontWeight: 600, textDecoration: "underline" }}>
            ← Back to Creators
          </Link>
        </div>
        <SFFooter />
      </div>
    );
  }

  const discountCode = `${creator.handle.replace("@", "").toUpperCase()}15`;
  const products: InfluencerShopProduct[] = creator.shopProducts ?? [];
  const mediaItems: InfluencerMediaItem[] = creator.detailMediaItems ?? [];

  return (
    <div className="storefront-wrapper">
      <SFPromoBar />
      <SFHeader darkMode={true} />

      {/* ── PROFILE HEADER ── */}
      <section style={{
        paddingTop: "calc(40px + 64px + 48px)",
        paddingBottom: 48,
        background: "#FAFAF8",
        borderBottom: "1px solid #ece8e1",
      }}>
        <style>{`
          @media (max-width: 900px) {
            .icp-profile-inner { flex-direction: column !important; gap: 24px !important; text-align: center !important; }
            .icp-stats { justify-content: center !important; }
            .icp-name-row { justify-content: center !important; flex-wrap: wrap !important; }
            .icp-section-pt { padding-top: calc(36px + 56px + 32px) !important; }
          }
        `}</style>
        <div
          className="icp-section-pt"
          style={{ maxWidth: "min(1680px, 95vw)", margin: "0 auto", padding: "0 48px" }}
        >
          <div
            className="icp-profile-inner"
            style={{ display: "flex", gap: 40, alignItems: "flex-start" }}
          >
            {/* Avatar */}
            <div style={{ flexShrink: 0 }}>
              {creator.avatarUrl ? (
                <img src={creator.avatarUrl} alt={creator.name}
                  style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover",
                    border: "3px solid #fff", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }} />
              ) : (
                <div style={{ width: 120, height: 120, borderRadius: "50%",
                  background: FOREST, color: "#fff", display: "flex", alignItems: "center",
                  justifyContent: "center", fontFamily: FONT_DISPLAY, fontSize: 40, fontWeight: 300 }}>
                  {creator.name.charAt(0)}
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="icp-name-row"
                style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "2rem", fontWeight: 300,
                  color: TEXT_PRIMARY, margin: 0, letterSpacing: "0.02em", lineHeight: 1.2 }}>
                  {creator.name}
                </h1>
                <PlatformBadge platform={creator.platform} />
                {creator.profileLink && creator.profileLink !== "#" && (
                  <a href={creator.profileLink} target="_blank" rel="noopener noreferrer"
                    style={{ fontFamily: FONT_BODY, fontSize: "0.8rem", fontWeight: 600,
                      color: FOREST, border: `1px solid ${FOREST}`, padding: "4px 12px",
                      borderRadius: 2, textDecoration: "none", letterSpacing: "0.06em",
                      transition: "background 0.2s, color 0.2s" }}>
                    Follow →
                  </a>
                )}
              </div>

              <div style={{ fontFamily: FONT_BODY, fontSize: "0.85rem", color: TEXT_SECONDARY,
                marginBottom: 16, letterSpacing: "0.02em" }}>
                {creator.handle}
              </div>

              {/* Stats */}
              <div className="icp-stats"
                style={{ display: "flex", gap: 32, marginBottom: 16 }}>
                {creator.postsCount && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontFamily: FONT_DISPLAY, fontSize: "1.25rem", fontWeight: 300, color: TEXT_PRIMARY }}>
                      {creator.postsCount}
                    </span>
                    <span style={{ fontFamily: FONT_BODY, fontSize: "0.72rem", fontWeight: 600,
                      color: TEXT_SECONDARY, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      Posts
                    </span>
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontFamily: FONT_DISPLAY, fontSize: "1.25rem", fontWeight: 300, color: TEXT_PRIMARY }}>
                    {creator.followers}
                  </span>
                  <span style={{ fontFamily: FONT_BODY, fontSize: "0.72rem", fontWeight: 600,
                    color: TEXT_SECONDARY, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Followers
                  </span>
                </div>
                {creator.likes && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontFamily: FONT_DISPLAY, fontSize: "1.25rem", fontWeight: 300, color: TEXT_PRIMARY }}>
                      {creator.likes}
                    </span>
                    <span style={{ fontFamily: FONT_BODY, fontSize: "0.72rem", fontWeight: 600,
                      color: TEXT_SECONDARY, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      Likes
                    </span>
                  </div>
                )}
              </div>

              {creator.bio && (
                <p style={{ fontFamily: FONT_BODY, fontSize: "0.9rem", color: TEXT_SECONDARY,
                  lineHeight: 1.7, maxWidth: 560, margin: "0 0 16px" }}>
                  {creator.bio}
                </p>
              )}

              {/* Discount code */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8,
                background: "#f0f7f4", border: `1px solid ${FOREST}20`, borderRadius: 4,
                padding: "8px 14px" }}>
                <span style={{ fontFamily: FONT_BODY, fontSize: "0.75rem", color: TEXT_SECONDARY,
                  letterSpacing: "0.04em" }}>
                  Exclusive Code:
                </span>
                <span style={{ fontFamily: FONT_BODY, fontSize: "0.85rem", fontWeight: 700,
                  color: FOREST, letterSpacing: "0.1em" }}>
                  {discountCode}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TAB BAR ── */}
      <div style={{ borderBottom: "1px solid #ece8e1", background: "#fff", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: "min(1680px, 95vw)", margin: "0 auto", padding: "0 48px",
          display: "flex", gap: 0 }}>
          {(["products", "videos"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                fontFamily: FONT_BODY, fontSize: "0.78rem", fontWeight: activeTab === tab ? 700 : 400,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: activeTab === tab ? TEXT_PRIMARY : TEXT_SECONDARY,
                background: "none", border: "none", cursor: "pointer",
                padding: "18px 20px 16px",
                borderBottom: activeTab === tab ? `2px solid ${TEXT_PRIMARY}` : "2px solid transparent",
                transition: "color 0.15s, border-color 0.15s",
              }}
            >
              {tab === "products" ? "Products" : "Videos"}
            </button>
          ))}
        </div>
      </div>

      {/* ── PRODUCTS TAB ── */}
      {activeTab === "products" && (
        <section style={{ padding: "48px 0 80px", background: "#fff" }}>
          <div style={{ maxWidth: "min(1680px, 95vw)", margin: "0 auto", padding: "0 48px" }}>
            {products.length > 0 ? (
              /* 4-column grid, matches HomeFeatured desktop layout */
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 0,
              }}>
                <style>{`
                  @media (max-width: 1024px) { .icp-products-grid { grid-template-columns: repeat(2, 1fr) !important; } }
                  @media (max-width: 480px) { .icp-products-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; } }
                `}</style>
                {products.map(p => (
                  <ProductCard key={p.id} product={p} onQuickAdd={setQuickAddProduct} />
                ))}
              </div>
            ) : (
              <EmptyState message="No products have been added for this creator yet." />
            )}
          </div>
        </section>
      )}

      {/* ── VIDEOS TAB ── */}
      {activeTab === "videos" && (
        <section style={{ padding: "48px 0 80px", background: "#fff" }}>
          <div style={{ maxWidth: "min(1680px, 95vw)", margin: "0 auto", padding: "0 48px" }}>
            {mediaItems.length > 0 ? (
              /* Video grid: 4 columns desktop → 2 tablet → 2 mobile, matches HomeVideos desktop */
              <>
                <style>{`
                  .icp-videos-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
                  @media (max-width: 1024px) { .icp-videos-grid { grid-template-columns: repeat(2, 1fr); } }
                  @media (max-width: 480px) { .icp-videos-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
                `}</style>
                <div className="icp-videos-grid">
                  {mediaItems.map(item => (
                    <VideoCard key={item.id} item={item} onQuickAdd={setQuickAddProduct} />
                  ))}
                </div>
              </>
            ) : (
              <EmptyState message="No media has been added for this creator yet." />
            )}
          </div>
        </section>
      )}

      {/* ── BACK LINK ── */}
      <div style={{ maxWidth: "min(1680px, 95vw)", margin: "0 auto", padding: "0 48px 60px" }}>
        <Link href="/pages/influencer"
          style={{ fontFamily: FONT_BODY, color: FOREST, fontWeight: 600,
            textDecoration: "none", fontSize: "0.9rem" }}>
          ← Back to All Creators
        </Link>
      </div>

      <SFFooter />

      {/* ── SHARED QUICK ADD DRAWER ── */}
      <QuickAddDrawer
        product={quickAddProduct}
        onClose={() => setQuickAddProduct(null)}
      />
    </div>
  );
}
