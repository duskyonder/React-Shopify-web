import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { useThemeConfig, Product } from "@/contexts/ThemeConfigContext";
import { useCart } from "@/contexts/CartContext";
import { ColorSwatch } from "@/components/StorefrontShell";
import { PlayIcon, XIcon, HeartIcon, ImgPlaceholder } from "@/components/HomeIcons";
import { fetchProductByHandle, type ShopifyProduct } from "@/lib/shopify";

// ── Small icon helpers ──────────────────────────────────────────────────────
const MuteIcon = ({ muted }: { muted: boolean }) => muted ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>
);

const ExpandIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
    <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
  </svg>
);

const MinimizeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/>
    <line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/>
  </svg>
);

const ChevronUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

// ── Convert video URL to embeddable format ──────────────────────────────────
function toEmbedUrl(raw: string): { type: 'iframe' | 'video' | 'tiktok'; src: string } {
  const url = raw.trim();
  const ytId = (() => {
    const m1 = url.match(/[?&]v=([^&]+)/);
    if (m1) return m1[1];
    const m2 = url.match(/youtu\.be\/([^?&]+)/);
    if (m2) return m2[1];
    const m3 = url.match(/youtube\.com\/shorts\/([^?&]+)/);
    if (m3) return m3[1];
    const m4 = url.match(/youtube\.com\/embed\/([^?&]+)/);
    if (m4) return m4[1];
    return null;
  })();
  if (ytId) return { type: 'iframe', src: `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&rel=0&playsinline=1` };
  const ttId = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
  if (ttId) return { type: 'tiktok', src: `https://www.tiktok.com/embed/v2/${ttId[1]}` };
  return { type: 'video', src: url };
}

// ── Types ───────────────────────────────────────────────────────────────────
type ColorEntry = { name: string; hex: string | null };

interface VideoCardMobileProps {
  video: any;
  mobileWidth: string;
  mobileGap: number;
  config: any;
  videos: any[];
  videoIndex: number;
  onFullscreen: (video: any, index: number) => void;
}

// ── Mobile Video Card (inline play) ─────────────────────────────────────────
function MobileVideoCard({ video, mobileWidth, mobileGap, config, videos, videoIndex, onFullscreen }: VideoCardMobileProps) {
  const { addItem, openCart } = useCart();
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [shopifyProduct, setShopifyProduct] = useState<ShopifyProduct | null>(null);
  const [sheetY, setSheetY] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);

  // Auto-fetch Shopify product when playing starts
  useEffect(() => {
    if (!playing) return;
    const handle = video.linkedProductHandle;
    if (!handle || shopifyProduct) return;
    fetchProductByHandle(handle).then(p => setShopifyProduct(p));
  }, [playing, video.linkedProductHandle]);

  // Derive product data
  const allImgs: string[] = shopifyProduct
    ? shopifyProduct.images.map((img: { url: string }) => img.url)
    : [
        ...(video.linkedProductImages || []),
        ...(video.linkedProductImage ? [video.linkedProductImage] : []),
      ].filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);
  const imgA = allImgs[0] || video.linkedProductImage || null;

  const derivedColorEntries: ColorEntry[] = shopifyProduct
    ? (shopifyProduct.options.find((o: any) => o.name.toLowerCase() === 'color')?.optionValues || []).map((v: any) => ({
        name: v.name,
        hex: v.swatch?.color || null,
      }))
    : (video.linkedProductColors || []).map((c: string) => ({
        name: c,
        hex: /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(c.trim()) ? c : null,
      }));

  const derivedSizes: string[] = shopifyProduct
    ? shopifyProduct.options
        .filter((o: any) => o.name.toLowerCase() !== 'color')
        .flatMap((o: any) => o.optionValues.map((v: any) => v.name))
    : (video.linkedProductSizes || []);

  const productName = shopifyProduct?.title || video.linkedProductName || "";
  const productPrice = shopifyProduct?.variants?.[0]?.price
    ? `$${parseFloat(shopifyProduct.variants[0].price.amount).toFixed(2)}`
    : video.linkedProductPrice || "";
  const comparePrice = shopifyProduct?.variants?.[0]?.compareAtPrice
    ? `$${parseFloat(shopifyProduct.variants[0].compareAtPrice.amount).toFixed(2)}`
    : video.linkedProductComparePrice || "";

  const handleAddToCart = () => {
    addItem({
      id: video.linkedProductId || video.id,
      name: productName,
      price: productPrice,
      comparePrice,
      imageUrl: imgA || video.linkedProductImage,
      productUrl: video.linkedProductLink,
      selectedColor: selectedColor || undefined,
      selectedSize: selectedSize || undefined,
    });
    openCart();
    setSheetOpen(false);
  };

  // Auto-derive thumbnail
  const ytMatch = video.videoPlayUrl?.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  const autoThumb = ytMatch ? `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg` : undefined;
  const thumbSrc = video.imageUrl || autoThumb;

  const hasProduct = !!(video.linkedProductName || video.linkedProductImage || video.linkedProductHandle);

  // Bottom sheet drag-to-dismiss
  const handleSheetTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
  };
  const handleSheetTouchMove = (e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    const dy = e.touches[0].clientY - dragStartY.current;
    if (dy > 0) setSheetY(dy);
  };
  const handleSheetTouchEnd = () => {
    if (sheetY > 80) setSheetOpen(false);
    setSheetY(0);
    dragStartY.current = null;
  };

  return (
    <div
      className="sf-video-card-wrapper"
      style={{ scrollSnapAlign: "start", flex: `0 0 ${mobileWidth}`, width: mobileWidth }}
    >
      {/* Video card — 4:5 aspect ratio */}
      <div
        className="sf-video-card"
        style={{ aspectRatio: "4/5", cursor: "pointer", position: "relative", overflow: "hidden", borderRadius: 10, background: "#000" }}
        onClick={() => { if (!playing) setPlaying(true); }}
      >
        {/* Thumbnail / video */}
        {!playing ? (
          <>
            {thumbSrc ? (
              <img loading="lazy" src={thumbSrc} alt={video.influencerName} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", background: "#175C40", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PlayIcon />
              </div>
            )}
            <div className="sf-video-play"><PlayIcon /></div>
          </>
        ) : (
          (() => {
            if (!video.videoPlayUrl) {
              return (
                <div style={{ width: "100%", height: "100%", background: "#175C40", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
                  {thumbSrc ? <img loading="lazy" src={thumbSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} /> : null}
                  <PlayIcon />
                  <p style={{ fontSize: 12, color: "#fff", opacity: 0.7, margin: 0 }}>No video link</p>
                </div>
              );
            }
            const { type, src } = toEmbedUrl(video.videoPlayUrl);
            if (type === 'video') {
              return <video src={src} autoPlay playsInline muted={muted} loop style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />;
            }
            // iframe / tiktok — muted param already in URL for YT; TikTok handles its own
            const muteParam = muted ? '&mute=1' : '&mute=0';
            const finalSrc = type === 'iframe' ? src.replace('&mute=1', muteParam) : src;
            return <iframe src={finalSrc} style={{ width: "100%", height: "100%", border: "none", display: "block" }} allow="autoplay; fullscreen; encrypted-media" allowFullScreen />;
          })()
        )}

        {/* Creator badge — top left */}
        <div className="sf-video-creator-badge" style={{ top: 10, left: 10 }}>
          <span className="sf-video-creator-name">{video.creatorName || video.influencerName?.replace('@', '')}</span>
        </div>

        {/* Controls — top right (only when playing) */}
        {playing && (
          <div style={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 6, zIndex: 10 }}>
            <button
              onClick={e => { e.stopPropagation(); setMuted(m => !m); }}
              style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,0.45)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}
              aria-label={muted ? "Unmute" : "Mute"}
            ><MuteIcon muted={muted} /></button>
            <button
              onClick={e => { e.stopPropagation(); onFullscreen(video, videoIndex); }}
              style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,0.45)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}
              aria-label="Fullscreen"
            ><ExpandIcon /></button>
          </div>
        )}
      </div>

      {/* Product strip — below video */}
      {hasProduct && (
        <div style={{ display: "flex", alignItems: "center", background: "#fff", borderRadius: "0 0 10px 10px", padding: "8px 10px", gap: 8, marginTop: 0 }}>
          {imgA && (
            <img loading="lazy" src={imgA} alt={productName} style={{ width: 44, height: 56, objectFit: "cover", borderRadius: 4, flexShrink: 0, background: "#f0f0f0" }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 12, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{productName}</div>
            <div style={{ fontSize: 12, color: "#333", marginTop: 2 }}>{productPrice}</div>
          </div>
          <button
            onClick={() => setSheetOpen(true)}
            style={{ width: 30, height: 30, borderRadius: "50%", background: "#111", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
            aria-label="View product details"
          ><ChevronUpIcon /></button>
        </div>
      )}

      {/* Bottom Sheet */}
      {sheetOpen && ReactDOM.createPortal(
        <div
          style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,0.5)" }}
          onClick={() => setSheetOpen(false)}
        >
          <div
            ref={sheetRef}
            onClick={e => e.stopPropagation()}
            onTouchStart={handleSheetTouchStart}
            onTouchMove={handleSheetTouchMove}
            onTouchEnd={handleSheetTouchEnd}
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: "#fff", borderRadius: "16px 16px 0 0",
              transform: `translateY(${sheetY}px)`,
              transition: sheetY === 0 ? "transform 0.3s cubic-bezier(0.23,1,0.32,1)" : "none",
              maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column",
            }}
          >
            {/* Drag handle */}
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 8px" }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "#ddd" }} />
            </div>

            {/* 40/60 product panel */}
            <div style={{ display: "flex", flex: 1, overflow: "hidden", padding: "0 0 16px" }}>
              {/* Left 40%: portrait image */}
              <div style={{ flex: "0 0 40%", padding: "0 8px 0 16px", display: "flex", alignItems: "flex-start" }}>
                <div style={{ width: "100%", aspectRatio: "3/4", borderRadius: 8, overflow: "hidden", background: "#f0f0f0" }}>
                  {imgA ? (
                    <img loading="lazy" src={imgA} alt={productName} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "#e8e8e8" }} />
                  )}
                </div>
              </div>

              {/* Right 60%: product info */}
              <div style={{ flex: 1, padding: "4px 16px 0 8px", display: "flex", flexDirection: "column", overflowY: "auto", gap: 0, minWidth: 0 }}>
                {/* Name */}
                {productName && (
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#111", lineHeight: 1.3, marginBottom: 5 }}>{productName}</div>
                )}
                {/* Price */}
                {(productPrice || comparePrice) && (
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 10 }}>
                    {productPrice && <span style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>{productPrice}</span>}
                    {comparePrice && <span style={{ fontSize: 12, color: "#aaa", textDecoration: "line-through" }}>{comparePrice}</span>}
                  </div>
                )}
                {/* Color swatches */}
                {derivedColorEntries.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Color</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {derivedColorEntries.map(({ name, hex }) => {
                        const isSel = selectedColor === name;
                        return hex ? (
                          <button key={name} onClick={() => setSelectedColor(isSel ? null : name)} title={name}
                            style={{ width: 22, height: 22, borderRadius: "50%", background: hex, border: isSel ? "2px solid #111" : "1.5px solid #d0d0d0", cursor: "pointer", padding: 0, boxShadow: isSel ? "0 0 0 2px #fff inset" : "none" }}
                            aria-label={name} />
                        ) : (
                          <button key={name} onClick={() => setSelectedColor(isSel ? null : name)}
                            style={{ padding: "3px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600, border: isSel ? "1.5px solid #111" : "1px solid #ddd", background: isSel ? "#111" : "#fff", color: isSel ? "#fff" : "#555", cursor: "pointer" }}
                          >{name}</button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {/* Size buttons */}
                {derivedSizes.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Size</div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {derivedSizes.map((size: string) => (
                        <button key={size} onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                          style={{ minWidth: 30, height: 26, padding: "0 6px", borderRadius: 3, fontSize: 11, fontWeight: 500, border: selectedSize === size ? "1.5px solid #111" : "1px solid #d8d8d8", background: selectedSize === size ? "#111" : "#fff", color: selectedSize === size ? "#fff" : "#444", cursor: "pointer" }}
                        >{size}</button>
                      ))}
                    </div>
                  </div>
                )}
                {/* Add to cart */}
                <button onClick={handleAddToCart}
                  style={{ display: "block", width: "100%", background: "#111", color: "#fff", textAlign: "center", padding: "11px 10px", borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", border: "none", cursor: "pointer", textTransform: "uppercase", marginTop: "auto" }}
                >ADD TO CART</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ── Fullscreen Video Player ──────────────────────────────────────────────────
interface FullscreenPlayerProps {
  video: any;
  videoIndex: number;
  videos: any[];
  onClose: () => void;
  onNavigate: (index: number) => void;
}

function FullscreenPlayer({ video, videoIndex, videos, onClose, onNavigate }: FullscreenPlayerProps) {
  const [muted, setMuted] = useState(false);
  const [shopifyProduct, setShopifyProduct] = useState<ShopifyProduct | null>(null);

  useEffect(() => {
    const handle = video.linkedProductHandle;
    if (!handle) { setShopifyProduct(null); return; }
    fetchProductByHandle(handle).then(p => setShopifyProduct(p));
  }, [video.linkedProductHandle]);

  const allImgs: string[] = shopifyProduct
    ? shopifyProduct.images.map((img: { url: string }) => img.url)
    : [
        ...(video.linkedProductImages || []),
        ...(video.linkedProductImage ? [video.linkedProductImage] : []),
      ].filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);
  const imgA = allImgs[0] || video.linkedProductImage || null;

  const productName = shopifyProduct?.title || video.linkedProductName || "";
  const productPrice = shopifyProduct?.variants?.[0]?.price
    ? `$${parseFloat(shopifyProduct.variants[0].price.amount).toFixed(2)}`
    : video.linkedProductPrice || "";
  const productUrl = video.linkedProductLink || "#";

  const hasProduct = !!(productName || imgA);

  if (!video.videoPlayUrl) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 999999, background: "#000", display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", gap: 12, background: "rgba(0,0,0,0.6)", zIndex: 10 }}>
          <div style={{ flex: 1, fontWeight: 600, fontSize: 14, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{productName}</div>
          <button onClick={() => setMuted(m => !m)} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} aria-label="Mute"><MuteIcon muted={muted} /></button>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} aria-label="Minimize"><MinimizeIcon /></button>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", opacity: 0.5, fontSize: 14 }}>No video link</div>
        {hasProduct && (
          <a href={productUrl} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "rgba(0,0,0,0.7)", textDecoration: "none" }}>
            {imgA && <img src={imgA} alt={productName} style={{ width: 48, height: 60, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{productName}</div>
              <div style={{ fontSize: 13, color: "#ccc", marginTop: 2 }}>{productPrice}</div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </a>
        )}
      </div>
    );
  }

  const { type, src } = toEmbedUrl(video.videoPlayUrl);
  const muteParam = muted ? '&mute=1' : '&mute=0';
  const finalSrc = type === 'iframe' ? src.replace('&mute=1', muteParam) : src;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999999, background: "#000", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", gap: 12, background: "rgba(0,0,0,0.6)", zIndex: 10, flexShrink: 0 }}>
        <div style={{ flex: 1, fontWeight: 600, fontSize: 14, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{productName}</div>
        <button onClick={() => setMuted(m => !m)} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} aria-label="Mute"><MuteIcon muted={muted} /></button>
        <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} aria-label="Minimize"><MinimizeIcon /></button>
      </div>

      {/* Video + nav arrows */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {type === 'video' ? (
          <video src={finalSrc} autoPlay playsInline muted={muted} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
        ) : (
          <iframe src={finalSrc} style={{ width: "100%", height: "100%", border: "none", display: "block" }} allow="autoplay; fullscreen; encrypted-media" allowFullScreen />
        )}

        {/* Right-side nav arrows — vertically centered */}
        <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 8, zIndex: 10 }}>
          <button
            onClick={() => onNavigate(Math.max(0, videoIndex - 1))}
            disabled={videoIndex === 0}
            style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,0.45)", border: "none", color: "#fff", cursor: videoIndex === 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: videoIndex === 0 ? 0.3 : 1, backdropFilter: "blur(4px)" }}
            aria-label="Previous video"
          ><ChevronUpIcon /></button>
          <button
            onClick={() => onNavigate(Math.min(videos.length - 1, videoIndex + 1))}
            disabled={videoIndex === videos.length - 1}
            style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,0.45)", border: "none", color: "#fff", cursor: videoIndex === videos.length - 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: videoIndex === videos.length - 1 ? 0.3 : 1, backdropFilter: "blur(4px)" }}
            aria-label="Next video"
          ><ChevronDownIcon /></button>
        </div>
      </div>

      {/* Bottom product strip — tappable, links to PDP */}
      {hasProduct && (
        <a
          href={productUrl}
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: "rgba(0,0,0,0.75)", textDecoration: "none", flexShrink: 0 }}
        >
          {imgA && <img src={imgA} alt={productName} style={{ width: 48, height: 60, objectFit: "cover", borderRadius: 4, flexShrink: 0, background: "#333" }} />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{productName}</div>
            <div style={{ fontSize: 13, color: "#ccc", marginTop: 2 }}>{productPrice}</div>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        </a>
      )}
    </div>
  );
}

// ==================== INFLUENCER VIDEOS ====================
function SFVideos({ titleAlign = "center" }: { instanceId?: string; titleAlign?: "left" | "center" | "right" }) {
  const { config } = useThemeConfig();
  const { addItem, openCart } = useCart();
  const [activeVideo, setActiveVideo] = useState<any>(null);
  const [modalHoverImg, setModalHoverImg] = useState<'A' | 'B' | null>(null);
  const [selectedVideoColor, setSelectedVideoColor] = useState<string | null>(null);
  const [selectedVideoSize, setSelectedVideoSize] = useState<string | null>(null);
  const [shopifyProduct, setShopifyProduct] = useState<ShopifyProduct | null>(null);

  // Fullscreen state (mobile)
  const [fullscreenVideo, setFullscreenVideo] = useState<any>(null);
  const [fullscreenIndex, setFullscreenIndex] = useState<number>(0);

  const trackRef = useRef<HTMLDivElement>(null);

  // Auto-fetch Shopify product when desktop modal opens
  useEffect(() => {
    if (!activeVideo) { setShopifyProduct(null); return; }
    const handle = activeVideo.linkedProductHandle;
    if (!handle) { setShopifyProduct(null); return; }
    fetchProductByHandle(handle).then(p => setShopifyProduct(p));
  }, [activeVideo]);

  if (!config.showVideos) return null;

  const desktopCount = config.videosDesktopCount ?? 4;
  const desktopGap = config.videosDesktopGap ?? 0;
  const mobileGap = config.videosMobileGap ?? 12;
  const desktopCardWidth = config.videosCardWidth ?? 0;
  const mobileCardWidth = config.videosMobileCardWidth ?? 0;
  const [isMobileVideos, setIsMobileVideos] = useState(false);
  const [videoPage, setVideoPage] = useState(0);
  const [mobileVideoPage, setMobileVideoPage] = useState(0);
  useEffect(() => {
    const check = () => setIsMobileVideos(window.innerWidth <= 900);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  const videos = config.videos;
  const totalVideoPages = Math.ceil(videos.length / desktopCount);
  const totalMobileVideoPages = Math.ceil(videos.length / 2);

  const [videoSectionVisible, setVideoSectionVisible] = useState(false);
  const videoSectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = videoSectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVideoSectionVisible(true); obs.disconnect(); }
    }, { rootMargin: "200px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!isMobileVideos) return;
    const el = trackRef.current;
    if (!el) return;
    const pageWidth = el.clientWidth + mobileGap;
    el.scrollTo({ left: mobileVideoPage * pageWidth, behavior: 'smooth' });
  }, [mobileVideoPage, isMobileVideos, mobileGap]);

  const handleMobileVideoScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const pageWidth = el.clientWidth + mobileGap;
    const newPage = Math.round(el.scrollLeft / pageWidth);
    setMobileVideoPage(p => p !== newPage ? newPage : p);
  }, [mobileGap]);

  const scrollByBtn = (dir: number) => {
    if (isMobileVideos) {
      setMobileVideoPage(p => Math.max(0, Math.min(totalMobileVideoPages - 1, p + dir)));
    } else {
      setVideoPage(p => Math.max(0, Math.min(totalVideoPages - 1, p + dir)));
    }
  };

  return (
    <>
      <section className="sf-section sf-videos" ref={videoSectionRef}>
        <div className="sf-section-header" style={{ textAlign: titleAlign }}><h2>{config.videosTitle}</h2></div>
        {!videoSectionVisible && <div style={{ minHeight: 300 }} />}
        {videoSectionVisible && <div className="sf-scroll-section-wrapper" style={{
            width: "95%",
            maxWidth: isMobileVideos
              ? (config.videosMobileMaxWidth ? `${config.videosMobileMaxWidth}px` : '1600px')
              : `${config.videosMaxWidth ?? 1600}px`,
            ['--video-card-height' as string]: isMobileVideos
              ? (config.videosMobileCardHeight ? `${config.videosMobileCardHeight}px` : undefined)
              : (config.videoCardHeight ? `${config.videoCardHeight}px` : undefined),
          } as React.CSSProperties}>
          {!isMobileVideos && (
          <button className="sf-cat-arrow prev" onClick={() => scrollByBtn(-1)}
            style={{ opacity: videoPage === 0 ? 0.3 : 1 }}>&#8249;</button>
          )}
          <div className="sf-scroll-track-outer" style={!isMobileVideos ? { overflow: "hidden" } : undefined}>
            <div
              ref={trackRef}
              className="sf-videos-scroll-track"
              onScroll={isMobileVideos ? handleMobileVideoScroll : undefined}
              style={{
                "--videos-desktop-count": desktopCount,
                scrollSnapType: isMobileVideos ? "x mandatory" : "none",
                flexWrap: "nowrap",
                gap: isMobileVideos ? mobileGap : desktopGap,
                ...(!isMobileVideos ? {
                  transform: `translateX(calc(-${videoPage} * (100% + ${desktopGap}px)))`,
                  transition: "transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
                  willChange: "transform",
                } : {}),
              } as React.CSSProperties}
            >
              {videos.map((video, idx) => {
                // Show card A fully + card B peeking: card A = ~88% of track, gap accounts for peek
                const mobileAutoWidth = mobileGap > 0
                  ? `calc(88% - ${mobileGap}px)`
                  : `88%`;
                const desktopAutoWidth = desktopGap > 0
                  ? `calc((100% - ${desktopGap * (desktopCount - 1)}px) / ${desktopCount})`
                  : `calc(100% / ${desktopCount})`;
                const mobileWidth = mobileCardWidth > 0 ? `${mobileCardWidth}px` : mobileAutoWidth;
                const desktopWidth = desktopCardWidth > 0 ? `${desktopCardWidth}px` : desktopAutoWidth;

                if (isMobileVideos) {
                  return (
                    <MobileVideoCard
                      key={video.id}
                      video={video}
                      mobileWidth={mobileWidth}
                      mobileGap={mobileGap}
                      config={config}
                      videos={videos}
                      videoIndex={idx}
                      onFullscreen={(v, i) => { setFullscreenVideo(v); setFullscreenIndex(i); }}
                    />
                  );
                }

                // Desktop card (unchanged)
                const ytMatch = video.videoPlayUrl?.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
                const autoThumb = ytMatch ? `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg` : undefined;
                const thumbSrc = video.imageUrl || autoThumb;
                return (
                  <div
                    key={video.id}
                    className="sf-video-card-wrapper"
                    style={{ flex: `0 0 ${desktopWidth}`, width: desktopWidth }}
                  >
                    <div
                      className="sf-video-card"
                      style={{ aspectRatio: config.videoAspectRatio ?? "9/16", cursor: "pointer" }}
                      onClick={() => { setActiveVideo(video); setSelectedVideoColor(null); setSelectedVideoSize(null); }}
                    >
                      {thumbSrc ? (
                        <img loading="lazy" src={thumbSrc} alt={video.influencerName} />
                      ) : (
                        <ImgPlaceholder label="视频封面" style={{ position: "absolute", inset: 0 }} />
                      )}
                      <div className="sf-video-play"><PlayIcon /></div>
                      <div className="sf-video-creator-badge">
                        <span className="sf-video-creator-name">{video.creatorName || video.influencerName.replace('@','')}</span>
                      </div>
                    </div>
                    {(video.linkedProductName || video.linkedProductImage) && (
                      <div className="sf-video-product-card">
                        {video.linkedProductImage && (
                          <img loading="lazy" src={video.linkedProductImage} alt={video.linkedProductName} className="sf-video-product-img" />
                        )}
                        <div className="sf-video-product-info">
                          <div className="sf-video-product-name">{video.linkedProductName}</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {!isMobileVideos && (
          <button className="sf-cat-arrow next" onClick={() => scrollByBtn(1)}
            style={{ opacity: videoPage >= totalVideoPages - 1 ? 0.3 : 1 }}>&#8250;</button>
          )}
        </div>}


      </section>

      {/* Desktop Video Modal */}
      {activeVideo && ReactDOM.createPortal(
        (() => {
          const allImgs: string[] = shopifyProduct
            ? shopifyProduct.images.map((img: { url: string }) => img.url)
            : [
                ...(activeVideo.linkedProductImages || []),
                ...(activeVideo.linkedProductImage ? [activeVideo.linkedProductImage] : []),
              ].filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);
          const imgA = allImgs[0] || activeVideo.linkedProductImage || null;
          const imgB = allImgs[1] || null;
          const imgC = allImgs[2] || null;
          const imgD = allImgs[3] || null;
          const displayLeft = modalHoverImg === 'A' ? imgC : imgA;
          const displayRight = modalHoverImg === 'B' ? imgD : imgB;

          const renderVideoContent = (minH: number) => {
            if (!activeVideo.videoPlayUrl) {
              return (
                <div style={{ width: "100%", height: "100%", minHeight: minH, position: "relative", background: "#000" }}>
                  {activeVideo.imageUrl ? (
                    <img loading="lazy" src={activeVideo.imageUrl} alt={activeVideo.influencerName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "#175C40", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexDirection: "column", gap: 12 }}>
                      <PlayIcon />
                      <p style={{ fontSize: 13, opacity: 0.7 }}>No video link</p>
                    </div>
                  )}
                </div>
              );
            }
            const { type, src } = toEmbedUrl(activeVideo.videoPlayUrl);
            if (type === 'iframe' || type === 'tiktok') {
              return <iframe src={src} style={{ width: "100%", height: "100%", minHeight: minH, border: "none", display: "block", background: "#000" }} allow="autoplay; fullscreen; encrypted-media" allowFullScreen />;
            } else {
              return <video src={src} controls autoPlay style={{ width: "100%", height: "100%", minHeight: minH, objectFit: "contain", background: "#000", display: "block" }} />;
            }
          };

          const imgRatio = config.videoModalImgRatio || "3/4";

          const handleAddToCart = () => {
            addItem({
              id: activeVideo.linkedProductId || activeVideo.id,
              name: activeVideo.linkedProductName || "",
              price: activeVideo.linkedProductPrice || "",
              comparePrice: activeVideo.linkedProductComparePrice,
              imageUrl: imgA || activeVideo.linkedProductImage,
              productUrl: activeVideo.linkedProductLink,
              selectedColor: selectedVideoColor || undefined,
              selectedSize: selectedVideoSize || undefined,
            });
            openCart();
          };

          const derivedColorEntries: ColorEntry[] = shopifyProduct
            ? (shopifyProduct.options.find((o: any) => o.name.toLowerCase() === 'color')?.optionValues || []).map((v: any) => ({
                name: v.name,
                hex: v.swatch?.color || null,
              }))
            : (activeVideo.linkedProductColors || []).map((c: string) => ({
                name: c,
                hex: /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(c.trim()) ? c : null,
              }));

          const derivedSizes: string[] = shopifyProduct
            ? shopifyProduct.options
                .filter((o: any) => o.name.toLowerCase() !== 'color')
                .flatMap((o: any) => o.optionValues.map((v: any) => v.name))
            : (activeVideo.linkedProductSizes || []);

          const computeDiscountLabel = () => {
            if (!activeVideo.linkedProductComparePrice || !activeVideo.linkedProductPrice) return null;
            const parsePrice = (s: string) => parseFloat(s.replace(/[^0-9.]/g, ''));
            const sale = parsePrice(activeVideo.linkedProductPrice);
            const orig = parsePrice(activeVideo.linkedProductComparePrice);
            if (!orig || !sale || orig <= sale) return null;
            const pct = Math.round((1 - sale / orig) * 100);
            return `LIMITED TIME OFFER: ${pct}% OFF`;
          };
          const discountLabel = computeDiscountLabel();

          const renderColorSwatches = (swatchSize = 26) => (
            derivedColorEntries.length > 0 ? (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#888", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>Color</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  {derivedColorEntries.map(({ name, hex }) => {
                    const isSelected = selectedVideoColor === name;
                    return hex ? (
                      <button key={name} onClick={() => setSelectedVideoColor(isSelected ? null : name)} title={name}
                        style={{ width: swatchSize, height: swatchSize, borderRadius: "50%", background: hex, border: isSelected ? "2px solid #111" : "2px solid #e0e0e0", cursor: "pointer", padding: 0, flexShrink: 0, boxShadow: isSelected ? "0 0 0 2px #fff inset" : "none", transition: "border 0.15s, box-shadow 0.15s" }}
                        aria-label={name} />
                    ) : (
                      <button key={name} onClick={() => setSelectedVideoColor(isSelected ? null : name)}
                        style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, border: isSelected ? "1.5px solid #111" : "1.5px solid #ddd", background: isSelected ? "#111" : "#fff", color: isSelected ? "#fff" : "#444", cursor: "pointer", flexShrink: 0, transition: "all 0.15s", whiteSpace: "nowrap" }}
                      >{name}</button>
                    );
                  })}
                </div>
              </div>
            ) : null
          );

          const renderSizeButtons = (btnH = 32) => (
            derivedSizes.length > 0 ? (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#888", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>Size</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {derivedSizes.map((size: string) => (
                    <button key={size} onClick={() => setSelectedVideoSize(selectedVideoSize === size ? null : size)}
                      style={{ minWidth: 36, height: btnH, padding: "0 8px", borderRadius: 4, fontSize: 12, fontWeight: 600, border: selectedVideoSize === size ? "1.5px solid #111" : "1.5px solid #ddd", background: selectedVideoSize === size ? "#111" : "#fff", color: selectedVideoSize === size ? "#fff" : "#333", cursor: "pointer", transition: "all 0.15s" }}
                    >{size}</button>
                  ))}
                </div>
              </div>
            ) : null
          );

          const modalMaxW = config.videoModalDesktopWidth || 960;
          return (
            <div
              className="sf-video-modal-overlay"
              onClick={() => { setActiveVideo(null); setModalHoverImg(null); }}
              style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,0.82)", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <div
                className="sf-video-modal-inner"
                onClick={e => e.stopPropagation()}
                style={{ display: "flex", gap: 0, maxWidth: modalMaxW, width: "95vw", maxHeight: "92vh", borderRadius: 14, overflow: "hidden", background: "#fff", position: "relative", boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}
              >
                <div style={{ flex: "0 0 50%", background: "#000", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
                  {renderVideoContent(520)}
                  <div className="sf-video-creator-badge" style={{ top: 14, left: 14 }}>
                    <span className="sf-video-creator-name">{activeVideo.creatorName || activeVideo.influencerName.replace('@','')}</span>
                  </div>
                </div>
                <div style={{ flex: "0 0 50%", padding: "32px 28px 28px", display: "flex", flexDirection: "column", overflowY: "auto", minWidth: 0, background: "#fff" }}>
                  {imgA && (
                    <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                      <div style={{ flex: 1, aspectRatio: imgRatio, borderRadius: 6, overflow: "hidden", background: "#f5f5f5", cursor: imgC ? "pointer" : "default" }}
                        onMouseEnter={() => imgC ? setModalHoverImg('A') : undefined}
                        onMouseLeave={() => setModalHoverImg(null)}>
                        <img src={displayLeft || imgA} alt={activeVideo.linkedProductName} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "opacity 0.25s" }} />
                      </div>
                      <div style={{ flex: 1, aspectRatio: imgRatio, borderRadius: 6, overflow: "hidden", background: "#f5f5f5", cursor: (imgB && imgD) ? "pointer" : "default" }}
                        onMouseEnter={() => (imgB && imgD) ? setModalHoverImg('B') : undefined}
                        onMouseLeave={() => setModalHoverImg(null)}>
                        <img src={imgB ? (displayRight || imgB) : imgA} alt={activeVideo.linkedProductName} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "opacity 0.25s", opacity: imgB ? 1 : 0.75 }} />
                      </div>
                    </div>
                  )}
                  {(shopifyProduct?.title || activeVideo.linkedProductName) && (
                    <div style={{ fontWeight: 700, fontSize: 19, color: "#111", lineHeight: 1.3, marginBottom: 6 }}>{shopifyProduct?.title || activeVideo.linkedProductName}</div>
                  )}
                  {discountLabel && (
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#555", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>{discountLabel}</div>
                  )}
                  {(() => {
                    const price = shopifyProduct?.variants?.[0]?.price
                      ? `$${parseFloat(shopifyProduct.variants[0].price.amount).toFixed(2)}`
                      : activeVideo.linkedProductPrice;
                    const comparePrice = shopifyProduct?.variants?.[0]?.compareAtPrice
                      ? `$${parseFloat(shopifyProduct.variants[0].compareAtPrice.amount).toFixed(2)}`
                      : activeVideo.linkedProductComparePrice;
                    return (price || comparePrice) ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                        {price && <span style={{ fontWeight: 700, fontSize: 17, color: "#111" }}>{price}</span>}
                        {comparePrice && <span style={{ fontSize: 14, color: "#aaa", textDecoration: "line-through" }}>{comparePrice}</span>}
                      </div>
                    ) : null;
                  })()}
                  {renderColorSwatches(26)}
                  {renderSizeButtons(32)}
                  <button onClick={handleAddToCart}
                    style={{ display: "block", width: "100%", background: "#111", color: "#fff", textAlign: "center", padding: "14px 20px", borderRadius: 5, fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", border: "none", cursor: "pointer", textTransform: "uppercase", marginTop: "auto" }}
                  >ADD TO CART</button>
                </div>
                <button onClick={() => { setActiveVideo(null); setModalHoverImg(null); }}
                  style={{ position: "absolute", top: 14, right: 14, width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "1px solid #e0e0e0", color: "#333", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
                  aria-label="Close"
                ><XIcon /></button>
              </div>
            </div>
          );
        })(),
        document.body
      )}

      {/* Mobile Fullscreen Player */}
      {fullscreenVideo && ReactDOM.createPortal(
        <FullscreenPlayer
          video={fullscreenVideo}
          videoIndex={fullscreenIndex}
          videos={videos}
          onClose={() => setFullscreenVideo(null)}
          onNavigate={(i) => { setFullscreenVideo(videos[i]); setFullscreenIndex(i); }}
        />,
        document.body
      )}
    </>
  );
}

export { SFVideos };
