import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useCart } from "@/contexts/CartContext";
import type { InfluencerConfig, InfluencerTextStyle, InfluencerStatItem } from "@/contexts/ThemeConfigContext";

export function tsStyle(style?: InfluencerTextStyle): React.CSSProperties {
  if (!style) return {};
  return {
    fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
    color: style.color,
    maxWidth: style.maxWidth,
  };
}

export function useIntersect(ref: React.RefObject<Element | null>) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return visible;
}

// ---- Animated counter ----
export function AnimatedCounter({ target, duration = 1600 }: { target: string; duration?: number }) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        obs.disconnect();
        // Parse numeric part and suffix
        const match = target.match(/^([0-9,]+\.?[0-9]*)(.*)$/);
        if (!match) { setDisplay(target); return; }
        const numStr = match[1].replace(/,/g, "");
        const suffix = match[2] ?? "";
        const end = parseFloat(numStr);
        if (isNaN(end)) { setDisplay(target); return; }
        const startTime = performance.now();
        const isInt = Number.isInteger(end);
        const tick = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // ease-out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = end * eased;
          const formatted = isInt
            ? Math.round(current).toLocaleString()
            : current.toFixed(1);
          setDisplay(formatted + suffix);
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{display}</span>;
}

// ---- Stats Section ----
export function StatsSection({ items }: { items: InfluencerStatItem[] }) {
  const visible = items.filter(i => i.visible !== false);
  if (!visible.length) return null;
  return (
    <div className="inf-stats-bar">
      {visible.map((item, idx) => (
        <div key={item.id} className="inf-stats-item">
          {idx > 0 && <div className="inf-stats-divider" />}
          <div className="inf-stats-value">
            <AnimatedCounter target={item.value} />
          </div>
          <div className="inf-stats-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

// ---- Platform icon ----
export function PlatformBadge({ platform }: { platform: string }) {
  const map: Record<string, { label: string; color: string }> = {
    instagram: { label: "IG", color: "#E1306C" },
    tiktok: { label: "TT", color: "#010101" },
    youtube: { label: "YT", color: "#FF0000" },
    xiaohongshu: { label: "XHS", color: "#FF2442" },
  };
  const p = map[platform] ?? { label: platform.toUpperCase().slice(0, 2), color: "#888" };
  return (
    <span className="inf-platform-badge" style={{ background: p.color }}>{p.label}</span>
  );
}

// ---- Shop Her Look Modal (matches homepage video quick-view style) ----
export function ShopHerLookModal({
  creator,
  onClose,
}: {
  creator: InfluencerConfig["creators"][0];
  onClose: () => void;
}) {
  const { addItem, openCart } = useCart();
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  function handleShopNow() {
    addItem({
      id: creator.id + "_shop",
      name: creator.shopProductName ?? "",
      price: creator.shopProductPrice ?? "",
      imageUrl: creator.shopProductImageUrl,
      productUrl: creator.shopProductLink,
    });
    openCart();
    onClose();
  }

  if (isMobile) {
    // Mobile: full-screen stacked layout
    return createPortal(
      <div
        className="inf-shop-modal-overlay"
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 99999, background: "#000", display: "flex", flexDirection: "column" }}
      >
        <div
          className="inf-shop-modal-mobile"
          onClick={e => e.stopPropagation()}
          style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column" }}
        >
          {/* Product image top half */}
          <div style={{ flex: "0 0 55%", background: "#EAF2EE", overflow: "hidden", position: "relative" }}>
            {creator.shopProductImageUrl
              ? <img src={creator.shopProductImageUrl} alt={creator.shopProductName} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #c8ddd5 0%, #EAF2EE 100%)" }} />
            }
          </div>
          {/* Info bottom half */}
          <div style={{ flex: 1, background: "#fff", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#111" }}>{creator.shopProductName}</div>
            {creator.shopProductPrice && (
              <div style={{ fontWeight: 700, fontSize: 17, color: "#111" }}>{creator.shopProductPrice}</div>
            )}
            <button
              onClick={handleShopNow}
              style={{ display: "block", width: "100%", background: "#111", color: "#fff", textAlign: "center", padding: "14px 20px", borderRadius: 4, fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", border: "none", cursor: "pointer", textTransform: "uppercase" }}
            >SHOP NOW</button>
          </div>
          {/* Close button */}
          <button
            onClick={onClose}
            style={{ position: "absolute", top: 14, right: 14, width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "1px solid #e0e0e0", color: "#333", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.12)", fontSize: 16 }}
            aria-label="Close"
          >✕</button>
        </div>
      </div>,
      document.body
    );
  }

  // Desktop: left image + right product info (matches homepage sf-video-modal-inner)
  return createPortal(
    <div
      className="inf-shop-modal-overlay"
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,0.82)", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div
        className="sf-video-modal-inner"
        onClick={e => e.stopPropagation()}
        style={{ display: "flex", gap: 0, maxWidth: 780, width: "95vw", maxHeight: "88vh", borderRadius: 14, overflow: "hidden", background: "#fff", position: "relative", boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}
      >
        {/* Left: Product image */}
        <div style={{ flex: "0 0 auto", width: "min(340px, 45vw)", background: "#EAF2EE", overflow: "hidden", position: "relative" }}>
          {creator.shopProductImageUrl
            ? <img src={creator.shopProductImageUrl} alt={creator.shopProductName} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #c8ddd5 0%, #EAF2EE 100%)" }} />
          }
          {/* Creator badge top-left */}
          <div className="sf-video-creator-badge" style={{ position: "absolute", top: 14, left: 14, display: "flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.55)", borderRadius: 20, padding: "4px 10px 4px 4px" }}>
            <div className="sf-video-creator-avatar sf-video-creator-avatar--placeholder" style={{ width: 28, height: 28, borderRadius: "50%", background: "#175C40", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
              {creator.name.charAt(0)}
            </div>
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>{creator.name}</span>
          </div>
        </div>
        {/* Right: Product info */}
        <div style={{ flex: 1, padding: "36px 32px 32px", display: "flex", flexDirection: "column", gap: 20, overflowY: "auto", minWidth: 0 }}>
          {/* Product name */}
          {creator.shopProductName && (
            <div style={{ fontWeight: 700, fontSize: 20, color: "#111", lineHeight: 1.3 }}>{creator.shopProductName}</div>
          )}
          {/* Price */}
          {creator.shopProductPrice && (
            <div style={{ fontWeight: 700, fontSize: 18, color: "#111" }}>{creator.shopProductPrice}</div>
          )}
          {/* Product image preview (2 placeholder tiles if no images) */}
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1, aspectRatio: "3/4", borderRadius: 8, overflow: "hidden", background: "#f5f5f5" }}>
              {creator.shopProductImageUrl
                ? <img src={creator.shopProductImageUrl} alt={creator.shopProductName} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #c8ddd5 0%, #EAF2EE 100%)" }} />
              }
            </div>
            <div style={{ flex: 1, aspectRatio: "3/4", borderRadius: 8, overflow: "hidden", background: "#f5f5f5" }}>
              <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #EAF2EE 0%, #d4e8e0 100%)" }} />
            </div>
          </div>
          {/* Shop Now button */}
          <button
            onClick={handleShopNow}
            style={{ display: "block", width: "100%", background: "#111", color: "#fff", textAlign: "center", padding: "13px 20px", borderRadius: 5, fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", border: "none", cursor: "pointer", textTransform: "uppercase", marginTop: "auto" }}
          >SHOP NOW</button>
        </div>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 14, right: 14, width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "1px solid #e0e0e0", color: "#333", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.12)", fontSize: 16 }}
          aria-label="Close"
        >✕</button>
      </div>
    </div>,
    document.body
  );
}

// ---- Creator Card ----
export function CreatorCard({ creator, cfg }: { creator: InfluencerConfig["creators"][0]; cfg: InfluencerConfig }) {
  const [shopOpen, setShopOpen] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const ts = (key: string) => tsStyle(cfg.textStyles?.[key]);
  const imgRatio = cfg.creatorImgRatio ?? "3/4";

  return (
    <div className="inf-creator-card">
      {/* Cover / Video */}
      <a
        href={creator.handle ? `/pages/influencer/${creator.handle.replace('@', '')}` : undefined}
        className="inf-creator-cover-link"
        onClick={e => { if (creator.videoUrl) { e.preventDefault(); setVideoPlaying(true); } }}
      >
        <div className="inf-creator-cover" style={{ aspectRatio: imgRatio }}>
          {creator.videoCoverUrl
            ? <img src={creator.videoCoverUrl} alt={creator.name} loading="lazy" />
            : <div className="inf-creator-cover-placeholder" />
          }
          {creator.videoUrl && !videoPlaying && (
            <div className="inf-creator-play-btn">▶</div>
          )}
          {creator.videoUrl && videoPlaying && (
            <div className="inf-creator-video-wrap" onClick={e => e.stopPropagation()}>
              {creator.videoUrl.includes("youtube") || creator.videoUrl.includes("youtu.be")
                ? <iframe src={creator.videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")} allow="autoplay" allowFullScreen />
                : <video src={creator.videoUrl} autoPlay controls />
              }
            </div>
          )}
          <PlatformBadge platform={creator.platform} />
          {/* Name overlay at bottom of cover */}
          <div className="inf-creator-cover-overlay">
            <div className="inf-creator-cover-name" style={ts("creatorName")}>{creator.name}</div>
            <div className="inf-creator-cover-handle" style={ts("creatorHandle")}>{creator.handle}</div>
          </div>
        </div>
      </a>


      {/* Shop Her Look modal */}
      {shopOpen && (
        <ShopHerLookModal creator={creator} onClose={() => setShopOpen(false)} />
      )}
    </div>
  );
}

// ---- Main Page ----
