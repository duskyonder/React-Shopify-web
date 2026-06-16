import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { useThemeConfig, Product } from "@/contexts/ThemeConfigContext";
import { useCart } from "@/contexts/CartContext";
import { ColorSwatch } from "@/components/StorefrontShell";
import { PlayIcon, XIcon, HeartIcon, ImageIcon, ImgPlaceholder } from "@/components/HomeIcons";


// ==================== INFLUENCER VIDEOS ====================
function SFVideos({ titleAlign = "center" }: { instanceId?: string; titleAlign?: "left" | "center" | "right" }) {
  const { config } = useThemeConfig();
  const { addItem, openCart } = useCart();
  const [activeVideo, setActiveVideo] = useState<any>(null);
  const [modalHoverImg, setModalHoverImg] = useState<'A' | 'B' | null>(null);
  const [isMobileModal, setIsMobileModal] = useState(false);
  const [selectedVideoColor, setSelectedVideoColor] = useState<string | null>(null);
  const [selectedVideoSize, setSelectedVideoSize] = useState<string | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobileModal(window.innerWidth <= 767);
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!config.showVideos) return null;

  const desktopCount = config.videosDesktopCount ?? 4;
  const desktopGap = config.videosDesktopGap ?? 0;
  const mobileGap = config.videosMobileGap ?? 12;
  const desktopCardWidth = config.videosCardWidth ?? 0;
  const mobileCardWidth = config.videosMobileCardWidth ?? 0;
  const [isMobileVideos, setIsMobileVideos] = useState(false);
  const [videoPage, setVideoPage] = useState(0);
  const [mobileVideoPage, setMobileVideoPage] = useState(0);
  const mobileVideoCardCount = 2;
  useEffect(() => {
    const check = () => setIsMobileVideos(window.innerWidth <= 900);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  const videos = config.videos;
  const totalVideoPages = Math.ceil(videos.length / desktopCount);
  const totalMobileVideoPages = Math.ceil(videos.length / mobileVideoCardCount);

  // IntersectionObserver lazy loading
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

  // Scroll mobile video track when mobileVideoPage changes
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
            maxWidth: isMobileVideos
              ? (config.videosMobileMaxWidth ? `${config.videosMobileMaxWidth}px` : undefined)
              : `${Math.max(config.videosMaxWidth ?? 1680, 1680)}px`,
            ['--video-card-height' as string]: isMobileVideos
              ? (config.videosMobileCardHeight ? `${config.videosMobileCardHeight}px` : undefined)
              : (config.videoCardHeight ? `${config.videoCardHeight}px` : undefined),
          } as React.CSSProperties}>
          <button className="sf-cat-arrow prev" onClick={() => scrollByBtn(-1)}
            style={!isMobileVideos ? { opacity: videoPage === 0 ? 0.3 : 1 } : undefined}>&#8249;</button>
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
              {videos.map((video) => {
                const mobileCardCount = 2;
                const mobileAutoWidth = mobileGap > 0
                  ? `calc((100% - ${mobileGap * (mobileCardCount - 1)}px) / ${mobileCardCount})`
                  : `calc(100% / ${mobileCardCount})`;
                const desktopAutoWidth = desktopGap > 0
                  ? `calc((100% - ${desktopGap * (desktopCount - 1)}px) / ${desktopCount})`
                  : `calc(100% / ${desktopCount})`;
                const mobileWidth = mobileCardWidth > 0 ? `${mobileCardWidth}px` : mobileAutoWidth;
                const desktopWidth = desktopCardWidth > 0 ? `${desktopCardWidth}px` : desktopAutoWidth;
                // Auto-derive thumbnail from YouTube URL if no manual imageUrl
                const ytMatch = video.videoPlayUrl?.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
                const autoThumb = ytMatch ? `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg` : undefined;
                const thumbSrc = video.imageUrl || autoThumb;
                return (
                <div
                  key={video.id}
                  className="sf-video-card-wrapper"
                  style={isMobileVideos ? { scrollSnapAlign: "start", flex: `0 0 ${mobileWidth}`, width: mobileWidth } : { flex: `0 0 ${desktopWidth}`, width: desktopWidth }}
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
                    {/* Creator badge - top left */}
                    <div className="sf-video-creator-badge">
                      {video.creatorAvatar ? (
                        <img loading="lazy" src={video.creatorAvatar} alt={video.creatorName || video.influencerName} className="sf-video-creator-avatar" />
                      ) : (
                        <div className="sf-video-creator-avatar sf-video-creator-avatar--placeholder">
                          {(video.creatorName || video.influencerName).replace('@','').charAt(0).toUpperCase()}
                        </div>
                      )}
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
          <button className="sf-cat-arrow next" onClick={() => scrollByBtn(1)}
            style={!isMobileVideos ? { opacity: videoPage >= totalVideoPages - 1 ? 0.3 : 1 } : undefined}>&#8250;</button>
        </div>}
        {videoSectionVisible && !isMobileVideos && totalVideoPages > 1 && (
          <div className="sf-section-dots">
            {Array.from({ length: totalVideoPages }).map((_, i) => (
              <button key={i} className={`sf-section-dot${i === videoPage ? " active" : ""}`} onClick={() => setVideoPage(i)} />
            ))}
          </div>
        )}
        {videoSectionVisible && isMobileVideos && totalMobileVideoPages > 1 && (
          <div className="sf-section-dots">
            {Array.from({ length: totalMobileVideoPages }).map((_, i) => (
              <button key={i} className={`sf-section-dot${i === mobileVideoPage ? " active" : ""}`} onClick={() => setMobileVideoPage(i)} />
            ))}
          </div>
        )}
      </section>

      {/* Video Play Modal */}
      {activeVideo && ReactDOM.createPortal(
        (() => {
          // Compute product images for hover logic: A, B, C, D
          const allImgs: string[] = [
            ...(activeVideo.linkedProductImages || []),
            ...(activeVideo.linkedProductImage ? [activeVideo.linkedProductImage] : []),
          ].filter((v: string, i: number, a: string[]) => a.indexOf(v) === i); // dedupe
          // A=allImgs[0], B=allImgs[1], C=allImgs[2], D=allImgs[3]
          const imgA = allImgs[0] || activeVideo.linkedProductImage || null;
          const imgB = allImgs[1] || null;
          const imgC = allImgs[2] || null;
          const imgD = allImgs[3] || null;
          // Hover logic: default A+B; hover A => C+B; hover B => A+D
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
                      <p style={{ fontSize: 13, opacity: 0.7 }}>暂无视频链接</p>
                    </div>
                  )}
                </div>
              );
            }
            const url: string = activeVideo.videoPlayUrl;
            const isYoutube = url.includes("youtube.com") || url.includes("youtu.be");
            const isTiktok = url.includes("tiktok.com");
            if (isYoutube) {
              const embedUrl = url.includes("embed")
                ? url
                : url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/").split("&")[0] + "?autoplay=1";
              return <iframe src={embedUrl} style={{ width: "100%", height: "100%", minHeight: minH, border: "none", display: "block" }} allow="autoplay; fullscreen" allowFullScreen />;
            } else if (isTiktok) {
              return (
                <div style={{ width: "100%", height: "100%", minHeight: minH, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexDirection: "column", gap: 12, padding: 24, textAlign: "center", background: "#000" }}>
                  <PlayIcon />
                  <p style={{ fontSize: 14, opacity: 0.8 }}>TikTok 视频请直接访问链接</p>
                  <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "#4fc3f7", fontSize: 13, wordBreak: "break-all" }}>{url}</a>
                </div>
              );
            } else {
              return <video ref={videoRef} src={url} controls autoPlay style={{ width: "100%", height: "100%", minHeight: minH, objectFit: "contain", background: "#000", display: "block" }} />;
            }
          };

          if (isMobileModal) {
            // Mobile: fullscreen video with product overlay at bottom
            return (
              <div
                className="sf-video-modal-overlay"
                onClick={() => { setActiveVideo(null); setModalHoverImg(null); }}
                style={{ position: "fixed", inset: 0, zIndex: 99999, background: "#000" }}
              >
                <div
                  className="sf-video-modal-mobile"
                  onClick={e => e.stopPropagation()}
                  style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column" }}
                >
                  {/* Video fills screen */}
                  <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
                    {renderVideoContent(400)}
                    {/* Creator badge top-left */}
                    <div className="sf-video-creator-badge" style={{ top: 16, left: 16 }}>
                      {activeVideo.creatorAvatar ? (
                        <img loading="lazy" src={activeVideo.creatorAvatar} alt={activeVideo.creatorName || activeVideo.influencerName} className="sf-video-creator-avatar" />
                      ) : (
                        <div className="sf-video-creator-avatar sf-video-creator-avatar--placeholder">
                          {(activeVideo.creatorName || activeVideo.influencerName).replace('@','').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="sf-video-creator-name">{activeVideo.creatorName || activeVideo.influencerName.replace('@','')}</span>
                    </div>
                    {/* Close button top-right */}
                    <button
                      onClick={() => { setActiveVideo(null); setModalHoverImg(null); }}
                      style={{ position: "absolute", top: 14, right: 14, width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,0.5)", border: "1.5px solid rgba(255,255,255,0.4)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}
                      aria-label="Close"
                    ><XIcon /></button>
                  </div>
                  {/* Product bar at bottom */}
                  {(activeVideo.linkedProductName || imgA) && (
                    <div style={{ background: "rgba(255,255,255,0.97)", padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: (activeVideo.linkedProductColors?.length || activeVideo.linkedProductSizes?.length) ? 8 : 0 }}>
                        {imgA && (
                          <div style={{ width: 52, height: 68, borderRadius: 6, overflow: "hidden", flexShrink: 0, background: "#f5f5f5" }}>
                            <img loading="lazy" src={imgA} alt={activeVideo.linkedProductName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: "#111", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>{activeVideo.linkedProductName}</div>
                          {/* Price: current + compare */}
                          {(activeVideo.linkedProductPrice || activeVideo.linkedProductComparePrice) && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                              {activeVideo.linkedProductPrice && (
                                <span style={{ fontWeight: 700, fontSize: 13, color: "#111" }}>{activeVideo.linkedProductPrice}</span>
                              )}
                              {activeVideo.linkedProductComparePrice && (
                                <span style={{ fontSize: 12, color: "#aaa", textDecoration: "line-through" }}>{activeVideo.linkedProductComparePrice}</span>
                              )}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => {
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
                          }}
                          style={{ flexShrink: 0, background: "#111", color: "#fff", padding: "9px 16px", borderRadius: 4, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", border: "none", cursor: "pointer", textTransform: "uppercase", whiteSpace: "nowrap" }}
                        >SHOP NOW</button>
                      </div>
                      {/* Color swatches */}
                      {activeVideo.linkedProductColors && activeVideo.linkedProductColors.length > 0 && (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                          {activeVideo.linkedProductColors.map((color: string) => (
                            <button
                              key={color}
                              onClick={() => setSelectedVideoColor(selectedVideoColor === color ? null : color)}
                              style={{
                                width: 22, height: 22, borderRadius: "50%",
                                background: color,
                                border: selectedVideoColor === color ? "2px solid #111" : "2px solid #ddd",
                                cursor: "pointer", padding: 0,
                                boxShadow: selectedVideoColor === color ? "0 0 0 2px #fff inset" : "none",
                                transition: "border 0.15s",
                              }}
                              title={color}
                            />
                          ))}
                        </div>
                      )}
                      {/* Size buttons */}
                      {activeVideo.linkedProductSizes && activeVideo.linkedProductSizes.length > 0 && (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {activeVideo.linkedProductSizes.map((size: string) => (
                            <button
                              key={size}
                              onClick={() => setSelectedVideoSize(selectedVideoSize === size ? null : size)}
                              style={{
                                padding: "3px 10px", borderRadius: 3, fontSize: 11, fontWeight: 600,
                                border: selectedVideoSize === size ? "1.5px solid #111" : "1.5px solid #ddd",
                                background: selectedVideoSize === size ? "#111" : "#fff",
                                color: selectedVideoSize === size ? "#fff" : "#333",
                                cursor: "pointer", transition: "all 0.15s",
                              }}
                            >{size}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // Desktop: left video + right product panel
          const modalMaxW = config.videoModalDesktopWidth || 960;
          const imgRatio = config.videoModalImgRatio || "3/4";
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
                {/* Left: Video */}
                <div style={{ flex: "0 0 auto", width: "min(380px, 50vw)", background: "#000", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
                  {renderVideoContent(520)}
                  {/* Creator badge top-left on video */}
                  <div className="sf-video-creator-badge" style={{ top: 14, left: 14 }}>
                    {activeVideo.creatorAvatar ? (
                      <img loading="lazy" src={activeVideo.creatorAvatar} alt={activeVideo.creatorName || activeVideo.influencerName} className="sf-video-creator-avatar" />
                    ) : (
                      <div className="sf-video-creator-avatar sf-video-creator-avatar--placeholder">
                        {(activeVideo.creatorName || activeVideo.influencerName).replace('@','').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="sf-video-creator-name">{activeVideo.creatorName || activeVideo.influencerName.replace('@','')}</span>
                  </div>
                </div>
                {/* Right: Product info */}
                <div style={{ flex: 1, padding: "36px 32px 32px", display: "flex", flexDirection: "column", gap: 20, overflowY: "auto", minWidth: 0 }}>
                  {/* Product images: 2 side by side with hover logic */}
                  {(imgA || imgB) && (
                    <div style={{ display: "flex", gap: 10 }}>
                      {imgA && (
                        <div
                          style={{ flex: 1, aspectRatio: imgRatio, borderRadius: 8, overflow: "hidden", background: "#f5f5f5", cursor: imgC ? "pointer" : "default", transition: "opacity 0.2s" }}
                          onMouseEnter={() => imgC ? setModalHoverImg('A') : undefined}
                          onMouseLeave={() => setModalHoverImg(null)}
                        >
                          <img
                            src={displayLeft || imgA}
                            alt={activeVideo.linkedProductName}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "opacity 0.25s" }}
                          />
                        </div>
                      )}
                      {imgB && (
                        <div
                          style={{ flex: 1, aspectRatio: imgRatio, borderRadius: 8, overflow: "hidden", background: "#f5f5f5", cursor: imgD ? "pointer" : "default", transition: "opacity 0.2s" }}
                          onMouseEnter={() => imgD ? setModalHoverImg('B') : undefined}
                          onMouseLeave={() => setModalHoverImg(null)}
                        >
                          <img
                            src={displayRight || imgB}
                            alt={activeVideo.linkedProductName}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "opacity 0.25s" }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                  {/* Product name */}
                  {activeVideo.linkedProductName && (
                    <div style={{ fontWeight: 700, fontSize: 18, color: "#111", lineHeight: 1.3 }}>{activeVideo.linkedProductName}</div>
                  )}
                  {/* Price: current + compare */}
                  {(activeVideo.linkedProductPrice || activeVideo.linkedProductComparePrice) && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {activeVideo.linkedProductPrice && (
                        <span style={{ fontWeight: 700, fontSize: 17, color: "#111" }}>{activeVideo.linkedProductPrice}</span>
                      )}
                      {activeVideo.linkedProductComparePrice && (
                        <span style={{ fontSize: 14, color: "#aaa", textDecoration: "line-through" }}>{activeVideo.linkedProductComparePrice}</span>
                      )}
                    </div>
                  )}
                  {/* Color selectors - desktop */}
                  {activeVideo.linkedProductColors && activeVideo.linkedProductColors.length > 0 && (
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Color</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {activeVideo.linkedProductColors.map((color: string) => (
                          <button
                            key={color}
                            onClick={() => setSelectedVideoColor(selectedVideoColor === color ? null : color)}
                            style={{
                              width: 26, height: 26, borderRadius: "50%", background: color,
                              border: selectedVideoColor === color ? "2px solid #111" : "2px solid #ddd",
                              cursor: "pointer", padding: 0, flexShrink: 0,
                              boxShadow: selectedVideoColor === color ? "0 0 0 2px #fff inset" : "none",
                              transition: "border 0.15s, box-shadow 0.15s",
                            }}
                            aria-label={color}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Size selectors - desktop */}
                  {activeVideo.linkedProductSizes && activeVideo.linkedProductSizes.length > 0 && (
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Size</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {activeVideo.linkedProductSizes.map((size: string) => (
                          <button
                            key={size}
                            onClick={() => setSelectedVideoSize(selectedVideoSize === size ? null : size)}
                            style={{
                              minWidth: 36, height: 32, padding: "0 8px", borderRadius: 4,
                              border: selectedVideoSize === size ? "1.5px solid #111" : "1.5px solid #ddd",
                              background: selectedVideoSize === size ? "#111" : "#fff",
                              color: selectedVideoSize === size ? "#fff" : "#333",
                              cursor: "pointer", fontSize: 12, fontWeight: 600,
                              transition: "all 0.15s",
                            }}
                          >{size}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Shop Now button */}
                  <button
                    onClick={() => {
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
                    }}
                    style={{ display: "block", width: "100%", background: "#111", color: "#fff", textAlign: "center", padding: "13px 20px", borderRadius: 5, fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", border: "none", cursor: "pointer", textTransform: "uppercase", marginTop: "auto" }}
                  >SHOP NOW</button>
                </div>
                {/* Close button */}
                <button
                  onClick={() => { setActiveVideo(null); setModalHoverImg(null); }}
                  style={{ position: "absolute", top: 14, right: 14, width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "1px solid #e0e0e0", color: "#333", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
                  aria-label="Close"
                ><XIcon /></button>
              </div>
            </div>
          );
        })()
        ,
        document.body
      )}
    </>
  );
}

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


export { SFVideos };
