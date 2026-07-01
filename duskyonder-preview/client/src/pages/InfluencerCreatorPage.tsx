import { useState, createPortal } from "react";
import { useParams, Link } from "wouter";
import { SFPromoBar, SFHeader, SFFooter } from "@/components/StorefrontShell";
import { useThemeConfig } from "@/contexts/ThemeConfigContext";
import type { InfluencerCreator, InfluencerMediaItem, InfluencerShopProduct } from "@/contexts/ThemeConfigContext";
import { QuickAddDrawer, type QuickAddProduct } from "@/components/QuickAddDrawer";

// ─── Design tokens ────────────────────────────────────────────────────────────
const FOREST = "#0D3D2B";
const TEXT_PRIMARY = "#1a1a1a";
const TEXT_SECONDARY = "#6b6b6b";
const FONT_DISPLAY = "'Tenor Sans', serif";
const FONT_BODY = "'Outfit', sans-serif";

// ─── Icons ────────────────────────────────────────────────────────────────────
function PlayIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

function ChevronUpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

function MuteIcon({ muted }: { muted: boolean }) {
  return muted ? (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

// ─── Platform badge ───────────────────────────────────────────────────────────
function PlatformBadge({ platform }: { platform: string }) {
  const map: Record<string, { label: string; color: string }> = {
    instagram:    { label: "IG",  color: "#E1306C" },
    tiktok:       { label: "TT",  color: "#010101" },
    youtube:      { label: "YT",  color: "#FF0000" },
    xiaohongshu:  { label: "XHS", color: "#FF2442" },
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

// ─── Product Card — mirrors HomeFeatured.tsx ──────────────────────────────────
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
      : null;
    return {
      id: product.id,
      handle,
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
      style={{ cursor: "pointer" }}
    >
      <div
        className="sf-product-image"
        style={{ aspectRatio: "3/4", position: "relative", overflow: "hidden", background: "#f5f5f5" }}
        onClick={() => onQuickAdd(buildPayload())}
      >
        {product.imageUrl ? (
          <>
            <div className="sf-product-img-primary">
              <img loading="lazy" src={product.imageUrl} alt={product.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
            <div className="sf-product-img-hover">
              <img loading="lazy" src={product.imageUrl} alt={product.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "brightness(0.88) saturate(1.1)" }} />
            </div>
          </>
        ) : (
          <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#e8f0ec,#f5f5f5)" }} />
        )}

        {/* Desktop hover overlay */}
        <div className="sf-product-hover-actions" style={{ opacity: hovered ? 1 : 0, transition: "opacity 0.2s" }}>
          <button className="sf-product-action-btn sf-quickadd-btn"
            onClick={(e) => { e.stopPropagation(); onQuickAdd(buildPayload()); }}
            aria-label="Quick Add">
            <PlusIcon />
          </button>
        </div>

        {/* Mobile bottom-right + circle */}
        <button
          className="sf-product-mobile-quickadd-btn"
          onClick={(e) => { e.stopPropagation(); onQuickAdd(buildPayload()); }}
          aria-label="Quick Add"
          style={{
            position: "absolute", bottom: 8, right: 8,
            width: 32, height: 32, borderRadius: "50%",
            background: "#1a3a2a", border: "none", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", zIndex: 5, boxShadow: "0 2px 8px rgba(0,0,0,0.22)",
          }}
        >
          <PlusIcon />
        </button>
      </div>

      <div className="sf-product-info" style={{ padding: "10px 0 12px" }}>
        <div className="sf-product-name" style={{
          fontFamily: FONT_DISPLAY, fontWeight: 300, fontSize: "0.875rem",
          color: TEXT_PRIMARY, lineHeight: 1.4, marginBottom: 3,
        }}>{product.name}</div>
        {product.price && (
          <div className="sf-product-price" style={{
            fontFamily: FONT_BODY, fontWeight: 700, fontSize: "0.8rem", color: TEXT_PRIMARY,
          }}>{product.price}</div>
        )}
      </div>
    </div>
  );
}

// ─── Video URL helper ─────────────────────────────────────────────────────────
function toEmbedUrl(url: string): { type: "video" | "iframe"; src: string } {
  if (!url) return { type: "video", src: url };
  const ytMatch = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  if (ytMatch) return { type: "iframe", src: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&loop=1&playlist=${ytMatch[1]}` };
  const ttMatch = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
  if (ttMatch) return { type: "iframe", src: `https://www.tiktok.com/embed/v2/${ttMatch[1]}` };
  return { type: "video", src: url };
}

// ─── Mobile Video Lightbox (full-screen portal) ───────────────────────────────
function MobileLightbox({
  item,
  onClose,
  onQuickAdd,
}: {
  item: InfluencerMediaItem;
  onClose: () => void;
  onQuickAdd: (p: QuickAddProduct) => void;
}) {
  const [muted, setMuted] = useState(false);
  const hasProduct = !!(item.productName);

  function buildPayload(): QuickAddProduct {
    const handle = item.productLink
      ? item.productLink.replace(/^\/products\//, "").split("?")[0]
      : null;
    return {
      id: item.id, handle,
      name: item.productName ?? "",
      price: item.productPrice ?? "",
      imageUrl: item.productImageUrl ?? item.thumbnailUrl ?? null,
      productUrl: item.productLink ?? null,
    };
  }

  const { type, src } = item.url ? toEmbedUrl(item.url) : { type: "video" as const, src: "" };

  return createPortal(
    <div style={{
      position: "fixed", inset: 0, zIndex: 9000,
      background: "#000",
      display: "flex", flexDirection: "column",
    }}>
      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px",
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(8px)",
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
      }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontSize: 14, color: "#fff", fontWeight: 300 }}>
          {item.productName ?? item.caption ?? ""}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          {type === "video" && (
            <button
              onClick={() => setMuted(m => !m)}
              style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.18)",
                border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              aria-label={muted ? "Unmute" : "Mute"}
            >
              <MuteIcon muted={muted} />
            </button>
          )}
          <button
            onClick={onClose}
            style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.18)",
              border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Video */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {!item.url ? (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "#fff", opacity: 0.5, fontFamily: FONT_BODY, fontSize: 13 }}>No video available</p>
          </div>
        ) : type === "video" ? (
          <video src={src} autoPlay playsInline muted={muted} loop
            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
        ) : (
          <iframe src={src} style={{ width: "100%", height: "100%", border: "none" }}
            allow="autoplay; fullscreen; encrypted-media" allowFullScreen />
        )}
      </div>

      {/* Bottom product strip */}
      {hasProduct && (
        <div
          onClick={() => { onClose(); onQuickAdd(buildPayload()); }}
          style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 16px",
            background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
            cursor: "pointer",
          }}
        >
          {(item.productImageUrl ?? item.thumbnailUrl) && (
            <img src={item.productImageUrl ?? item.thumbnailUrl!} alt={item.productName ?? ""}
              style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13, color: "#fff", fontWeight: 300,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {item.productName}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
              {item.productPrice && (
                <span style={{ fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700, color: "#fff" }}>
                  {item.productPrice}
                </span>
              )}
              {item.productComparePrice && (
                <span style={{ fontFamily: FONT_BODY, fontSize: 11, color: "rgba(255,255,255,0.55)", textDecoration: "line-through" }}>
                  {item.productComparePrice}
                </span>
              )}
              {item.productComparePrice && item.productPrice && (() => {
                const pct = Math.round((1 - parseFloat(item.productPrice.replace(/[^0-9.]/g, "")) / parseFloat(item.productComparePrice.replace(/[^0-9.]/g, ""))) * 100);
                return pct > 0 ? <span style={{ fontFamily: FONT_BODY, fontSize: 11, fontWeight: 700, color: "#ef4444" }}>-{pct}%</span> : null;
              })()}
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      )}
    </div>,
    document.body
  );
}

// ─── Video Card — separate desktop and mobile DOM ─────────────────────────────
function VideoCard({
  item,
  onQuickAdd,
}: {
  item: InfluencerMediaItem;
  onQuickAdd: (p: QuickAddProduct) => void;
}) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const hasProduct = !!(item.productName);
  const thumbSrc = item.thumbnailUrl || (item.type === "image" ? item.url : null);

  function buildPayload(): QuickAddProduct {
    const handle = item.productLink
      ? item.productLink.replace(/^\/products\//, "").split("?")[0]
      : null;
    return {
      id: item.id, handle,
      name: item.productName ?? "",
      price: item.productPrice ?? "",
      imageUrl: item.productImageUrl ?? item.thumbnailUrl ?? null,
      productUrl: item.productLink ?? null,
    };
  }

  const renderVideo = () => {
    if (!item.url) return (
      <div style={{ width: "100%", height: "100%", background: FOREST,
        display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
        {thumbSrc && <img loading="lazy" src={thumbSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />}
        <p style={{ fontSize: 12, color: "#fff", opacity: 0.7, margin: 0 }}>No video link</p>
      </div>
    );
    const { type, src } = toEmbedUrl(item.url);
    if (type === "video") return <video src={src} autoPlay playsInline muted={muted} loop style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />;
    return <iframe src={src} style={{ width: "100%", height: "100%", border: "none", display: "block" }} allow="autoplay; fullscreen; encrypted-media" allowFullScreen />;
  };

  return (
    <>
      {/* ── DESKTOP layout (hidden on mobile) ─────────────────────────── */}
      <div className="icp-video-desktop">
        <div className="sf-video-card-wrapper">
          {/* Card */}
          <div
            className="sf-video-card"
            style={{ aspectRatio: "9/16", cursor: "pointer", position: "relative",
              overflow: "hidden", borderRadius: 10, background: "#000" }}
            onClick={() => { if (!playing) setPlaying(true); }}
          >
            {!playing ? (
              <>
                {thumbSrc ? (
                  <img loading="lazy" src={thumbSrc} alt={item.caption ?? ""}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: FOREST,
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <PlayIcon />
                  </div>
                )}
                <div className="sf-video-play"><PlayIcon /></div>
              </>
            ) : renderVideo()}

            {/* Creator badge top-left */}
            {item.caption && (
              <div className="sf-video-creator-badge" style={{ top: 10, left: 10 }}>
                <span className="sf-video-creator-name">{item.caption}</span>
              </div>
            )}

            {/* Mute toggle when playing */}
            {playing && (
              <button
                onClick={e => { e.stopPropagation(); setMuted(m => !m); }}
                style={{ position: "absolute", top: 10, right: 10, width: 32, height: 32,
                  borderRadius: "50%", background: "rgba(0,0,0,0.45)", border: "none",
                  color: "#fff", cursor: "pointer", display: "flex", alignItems: "center",
                  justifyContent: "center", backdropFilter: "blur(4px)", zIndex: 10 }}
                aria-label={muted ? "Unmute" : "Mute"}
              >
                <MuteIcon muted={muted} />
              </button>
            )}
          </div>

          {/* Desktop product strip */}
          {hasProduct && (
            <div className="sf-video-product-card">
              {(item.productImageUrl ?? item.thumbnailUrl) && (
                <img loading="lazy" src={item.productImageUrl ?? item.thumbnailUrl!}
                  alt={item.productName ?? ""} className="sf-video-product-img" />
              )}
              <div className="sf-video-product-info">
                <div className="sf-video-product-name">{item.productName}</div>
                {item.productPrice && (
                  <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: TEXT_SECONDARY, marginTop: 2 }}>
                    {item.productPrice}
                    {item.productComparePrice && (
                      <span style={{ marginLeft: 6, textDecoration: "line-through", opacity: 0.6 }}>{item.productComparePrice}</span>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onQuickAdd(buildPayload()); }}
                style={{ width: 30, height: 30, borderRadius: "50%", background: "#111",
                  border: "none", color: "#fff", cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                aria-label="Quick Add"
              >
                <ChevronUpIcon />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── MOBILE layout (hidden on desktop) ─────────────────────────── */}
      <div className="icp-video-mobile">
        <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", background: "#000", aspectRatio: "9/16" }}>
          {/* Thumbnail / playing video */}
          {!playing ? (
            <>
              {thumbSrc ? (
                <img loading="lazy" src={thumbSrc} alt={item.caption ?? ""}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", background: FOREST,
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <PlayIcon size={36} />
                </div>
              )}
              {/* Center play button */}
              <button
                onClick={() => setPlaying(true)}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
                  background: "transparent", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center" }}
                aria-label="Play"
              >
                <div style={{ width: 48, height: 48, borderRadius: "50%",
                  background: "rgba(255,255,255,0.25)", backdropFilter: "blur(4px)",
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <PlayIcon size={20} />
                </div>
              </button>
            </>
          ) : renderVideo()}

          {/* Creator badge top-left */}
          {item.caption && (
            <div style={{ position: "absolute", top: 10, left: 10, zIndex: 5,
              background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
              borderRadius: 20, padding: "4px 10px" }}>
              <span style={{ fontFamily: FONT_BODY, fontSize: 11, color: "#fff", fontWeight: 600 }}>
                {item.caption}
              </span>
            </div>
          )}

          {/* Expand icon top-right */}
          <button
            onClick={e => { e.stopPropagation(); setLightboxOpen(true); }}
            style={{ position: "absolute", top: 10, right: 10, zIndex: 5,
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)",
              border: "none", color: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center" }}
            aria-label="Expand"
          >
            <ExpandIcon />
          </button>

          {/* Mute toggle when playing */}
          {playing && (
            <button
              onClick={e => { e.stopPropagation(); setMuted(m => !m); }}
              style={{ position: "absolute", top: 10, right: 50, zIndex: 5,
                width: 32, height: 32, borderRadius: "50%",
                background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)",
                border: "none", color: "#fff", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center" }}
              aria-label={muted ? "Unmute" : "Mute"}
            >
              <MuteIcon muted={muted} />
            </button>
          )}

          {/* Floating pill — bottom product strip */}
          {hasProduct && (
            <div
              onClick={() => onQuickAdd(buildPayload())}
              style={{
                position: "absolute", bottom: 12, left: 12, right: 12, zIndex: 5,
                background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)",
                borderRadius: 10, padding: "8px 10px",
                display: "flex", alignItems: "center", gap: 10,
                cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
              }}
            >
              {(item.productImageUrl ?? item.thumbnailUrl) && (
                <img src={item.productImageUrl ?? item.thumbnailUrl!} alt={item.productName ?? ""}
                  style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 12, color: TEXT_PRIMARY, fontWeight: 400,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {item.productName}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                  {item.productPrice && (
                    <span style={{ fontFamily: FONT_BODY, fontSize: 12, fontWeight: 700, color: TEXT_PRIMARY }}>
                      {item.productPrice}
                    </span>
                  )}
                  {item.productComparePrice && (
                    <span style={{ fontFamily: FONT_BODY, fontSize: 10, color: TEXT_SECONDARY, textDecoration: "line-through" }}>
                      {item.productComparePrice}
                    </span>
                  )}
                  {item.productComparePrice && item.productPrice && (() => {
                    const pct = Math.round((1 - parseFloat(item.productPrice.replace(/[^0-9.]/g, "")) / parseFloat(item.productComparePrice.replace(/[^0-9.]/g, ""))) * 100);
                    return pct > 0 ? <span style={{ fontFamily: FONT_BODY, fontSize: 10, fontWeight: 700, color: "#ef4444" }}>-{pct}%</span> : null;
                  })()}
                </div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); onQuickAdd(buildPayload()); }}
                style={{ width: 30, height: 30, borderRadius: "50%", background: "#111",
                  border: "none", color: "#fff", cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                aria-label="Quick Add"
              >
                <ChevronUpIcon />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile lightbox portal */}
      {lightboxOpen && (
        <MobileLightbox
          item={item}
          onClose={() => setLightboxOpen(false)}
          onQuickAdd={(p) => { setLightboxOpen(false); onQuickAdd(p); }}
        />
      )}
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

      <style>{`
        /* ── Profile header ── */
        .icp-section-inner {
          max-width: min(1680px, 95vw);
          margin: 0 auto;
          padding: 0 48px;
        }
        .icp-section-pt {
          padding-top: calc(40px + 64px + 48px);
        }
        .icp-profile-inner {
          display: flex;
          gap: 40px;
          align-items: flex-start;
        }
        /* ── Video card visibility ── */
        .icp-video-desktop { display: block; }
        .icp-video-mobile  { display: none;  }
        /* ── Products grid ── */
        .icp-products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
        }
        /* ── Videos grid ── */
        .icp-videos-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        @media (max-width: 1024px) {
          .icp-products-grid { grid-template-columns: repeat(3, 1fr); }
          .icp-videos-grid   { grid-template-columns: repeat(3, 1fr); gap: 12px; }
        }
        @media (max-width: 768px) {
          /* Switch video card DOM */
          .icp-video-desktop { display: none;  }
          .icp-video-mobile  { display: block; }
          /* Videos single column on mobile */
          .icp-videos-grid   { grid-template-columns: 1fr; gap: 20px; }
        }
        @media (max-width: 640px) {
          .icp-section-inner { padding: 0 16px; }
          .icp-section-pt    { padding-top: calc(8px + 56px + 8px) !important; }
          .icp-profile-inner { flex-direction: column; gap: 16px; text-align: center; align-items: center; }
          .icp-stats         { justify-content: center !important; }
          .icp-name-row      { justify-content: center !important; flex-wrap: wrap !important; }
          .icp-bio           { margin-left: auto !important; margin-right: auto !important; }
          .icp-products-grid { grid-template-columns: repeat(2, 1fr); gap: 0; }
        }
      `}</style>

      {/* ── PROFILE HEADER ── */}
      <section style={{ paddingBottom: 40, background: "#FAFAF8", borderBottom: "1px solid #ece8e1" }}>
        <div className="icp-section-inner icp-section-pt">
          <div className="icp-profile-inner">
            {/* Avatar */}
            <div style={{ flexShrink: 0 }}>
              {creator.avatarUrl ? (
                <img src={creator.avatarUrl} alt={creator.name}
                  style={{ width: 110, height: 110, borderRadius: "50%", objectFit: "cover",
                    border: "3px solid #fff", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }} />
              ) : (
                <div style={{ width: 110, height: 110, borderRadius: "50%",
                  background: FOREST, color: "#fff", display: "flex", alignItems: "center",
                  justifyContent: "center", fontFamily: FONT_DISPLAY, fontSize: 36, fontWeight: 300 }}>
                  {creator.name.charAt(0)}
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="icp-name-row"
                style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "1.75rem", fontWeight: 300,
                  color: TEXT_PRIMARY, margin: 0, letterSpacing: "0.02em", lineHeight: 1.2 }}>
                  {creator.name}
                </h1>
                <PlatformBadge platform={creator.platform} />
                {creator.profileLink && creator.profileLink !== "#" && (
                  <a href={creator.profileLink} target="_blank" rel="noopener noreferrer"
                    style={{ fontFamily: FONT_BODY, fontSize: "0.78rem", fontWeight: 600,
                      color: FOREST, border: `1px solid ${FOREST}`, padding: "4px 12px",
                      borderRadius: 2, textDecoration: "none", letterSpacing: "0.06em" }}>
                    Follow →
                  </a>
                )}
              </div>

              <div style={{ fontFamily: FONT_BODY, fontSize: "0.82rem", color: TEXT_SECONDARY,
                marginBottom: 14, letterSpacing: "0.02em" }}>
                {creator.handle}
              </div>

              <div className="icp-stats" style={{ display: "flex", gap: 28, marginBottom: 14 }}>
                {creator.postsCount && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontFamily: FONT_DISPLAY, fontSize: "1.1rem", fontWeight: 300, color: TEXT_PRIMARY }}>{creator.postsCount}</span>
                    <span style={{ fontFamily: FONT_BODY, fontSize: "0.68rem", fontWeight: 600, color: TEXT_SECONDARY, letterSpacing: "0.08em", textTransform: "uppercase" }}>Posts</span>
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontFamily: FONT_DISPLAY, fontSize: "1.1rem", fontWeight: 300, color: TEXT_PRIMARY }}>{creator.followers}</span>
                  <span style={{ fontFamily: FONT_BODY, fontSize: "0.68rem", fontWeight: 600, color: TEXT_SECONDARY, letterSpacing: "0.08em", textTransform: "uppercase" }}>Followers</span>
                </div>
                {creator.likes && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontFamily: FONT_DISPLAY, fontSize: "1.1rem", fontWeight: 300, color: TEXT_PRIMARY }}>{creator.likes}</span>
                    <span style={{ fontFamily: FONT_BODY, fontSize: "0.68rem", fontWeight: 600, color: TEXT_SECONDARY, letterSpacing: "0.08em", textTransform: "uppercase" }}>Likes</span>
                  </div>
                )}
              </div>

              {creator.bio && (
                <p className="icp-bio" style={{ fontFamily: FONT_BODY, fontSize: "0.88rem", color: TEXT_SECONDARY,
                  lineHeight: 1.7, maxWidth: 520, margin: "0 0 14px" }}>
                  {creator.bio}
                </p>
              )}

              <div style={{ display: "inline-flex", alignItems: "center", gap: 8,
                background: "#f0f7f4", border: `1px solid ${FOREST}20`, borderRadius: 4, padding: "7px 12px" }}>
                <span style={{ fontFamily: FONT_BODY, fontSize: "0.72rem", color: TEXT_SECONDARY, letterSpacing: "0.04em" }}>
                  Exclusive Code:
                </span>
                <span style={{ fontFamily: FONT_BODY, fontSize: "0.82rem", fontWeight: 700, color: FOREST, letterSpacing: "0.1em" }}>
                  {discountCode}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TAB BAR ── */}
      <div style={{ borderBottom: "1px solid #ece8e1", background: "#fff", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: "min(1680px, 95vw)", margin: "0 auto", padding: "0 16px", display: "flex", gap: 0 }}>
          {(["products", "videos"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              fontFamily: FONT_BODY, fontSize: "0.75rem", fontWeight: activeTab === tab ? 700 : 400,
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: activeTab === tab ? TEXT_PRIMARY : TEXT_SECONDARY,
              background: "none", border: "none", cursor: "pointer",
              padding: "16px 20px 14px",
              borderBottom: activeTab === tab ? `2px solid ${TEXT_PRIMARY}` : "2px solid transparent",
              transition: "color 0.15s, border-color 0.15s",
            }}>
              {tab === "products" ? "Products" : "Videos"}
            </button>
          ))}
        </div>
      </div>

      {/* ── PRODUCTS TAB ── */}
      {activeTab === "products" && (
        <section style={{ padding: "32px 0 64px", background: "#fff" }}>
          <div style={{ maxWidth: "min(1680px, 95vw)", margin: "0 auto", padding: "0 16px" }}>
            {products.length > 0 ? (
              <div className="icp-products-grid">
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
        <section style={{ padding: "32px 0 64px", background: "#fff" }}>
          <div style={{ maxWidth: "min(1680px, 95vw)", margin: "0 auto", padding: "0 16px" }}>
            {mediaItems.length > 0 ? (
              <div className="icp-videos-grid">
                {mediaItems.map(item => (
                  <VideoCard key={item.id} item={item} onQuickAdd={setQuickAddProduct} />
                ))}
              </div>
            ) : (
              <EmptyState message="No media has been added for this creator yet." />
            )}
          </div>
        </section>
      )}

      {/* ── BACK LINK ── */}
      <div style={{ maxWidth: "min(1680px, 95vw)", margin: "0 auto", padding: "0 16px 48px" }}>
        <Link href="/pages/influencer"
          style={{ fontFamily: FONT_BODY, color: FOREST, fontWeight: 600, textDecoration: "none", fontSize: "0.88rem" }}>
          ← Back to All Creators
        </Link>
      </div>

      <SFFooter />

      {/* ── SHARED QUICK ADD DRAWER ── */}
      <QuickAddDrawer product={quickAddProduct} onClose={() => setQuickAddProduct(null)} />
    </div>
  );
}
