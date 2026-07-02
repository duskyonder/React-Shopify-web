import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { useThemeConfig, SectionKey, Product } from "@/contexts/ThemeConfigContext";
import { useCart } from "@/contexts/CartContext";
import { ColorSwatch, SFPromoBar as SharedSFPromoBar, SFHeader as SharedSFHeader, SFFooter as SharedSFFooter } from "@/components/StorefrontShell";
import { SFVideos } from "@/components/HomeVideos";
import { SFFeatured } from "@/components/HomeFeatured";
import { SFNewsletter } from "@/components/HomeNewsletter";
import { ImageIcon, ImgPlaceholder } from "@/components/HomeIcons";
// ==================== HERO SLIDESHOW ====================
// Position mapping for 9-grid content placement
const POSITION_MAP: Record<string, React.CSSProperties> = {
  "top-left":      { top: "8%",  left: "5%",  right: "auto", bottom: "auto", transform: "none", alignItems: "flex-start", textAlign: "left" },
  "top-center":    { top: "8%",  left: "50%", right: "auto", bottom: "auto", transform: "translateX(-50%)", alignItems: "center", textAlign: "center" },
  "top-right":     { top: "8%",  right: "5%", left: "auto",  bottom: "auto", transform: "none", alignItems: "flex-end", textAlign: "right" },
  "middle-left":   { top: "50%", left: "5%",  right: "auto", bottom: "auto", transform: "translateY(-50%)", alignItems: "flex-start", textAlign: "left" },
  "middle-center": { top: "50%", left: "50%", right: "auto", bottom: "auto", transform: "translate(-50%, -50%)", alignItems: "center", textAlign: "center" },
  "middle-right":  { top: "50%", right: "5%", left: "auto",  bottom: "auto", transform: "translateY(-50%)", alignItems: "flex-end", textAlign: "right" },
  "bottom-left":   { bottom: "8%", left: "5%",  right: "auto", top: "auto", transform: "none", alignItems: "flex-start", textAlign: "left" },
  "bottom-center": { bottom: "8%", left: "50%", right: "auto", top: "auto", transform: "translateX(-50%)", alignItems: "center", textAlign: "center" },
  "bottom-right":  { bottom: "8%", right: "5%", left: "auto",  top: "auto", transform: "none", alignItems: "flex-end", textAlign: "right" },
};
function SFHero({ titleAlign = "center" }: { instanceId?: string; titleAlign?: "left" | "center" | "right" }) {
  const { config, isConfigReady } = useThemeConfig();
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = config.slides.length;
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (config.slideshowAutoplay && total > 1) {
      timerRef.current = setInterval(() => setCurrent(c => (c + 1) % total), config.slideshowSpeed * 1000);
    }
  }, [config.slideshowAutoplay, config.slideshowSpeed, total]);
  useEffect(() => { startTimer(); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, [startTimer]);
  const go = (n: number) => { setCurrent((current + n + total) % total); startTimer(); };
  // While config is loading, show only a clean beige background.
  // This prevents the stale/old banner image from flashing before the
  // correct config arrives from the server.
  if (!isConfigReady) {
    return <section className="sf-hero" style={{ background: '#FAF8F4' }} />;
  }
  // Hero: full-viewport on both mobile and desktop.
  // Mobile uses 100svh (safe viewport height avoids mobile browser chrome).
  // Desktop uses 100vh — CSS-driven, no admin height dependency.
  return (
    <section className="sf-hero">
      {config.slides.map((slide, i) => {
        // ── Resolve alignment: per-slide editorial controls take priority over nine-grid ──
        // getVar: returns a CSS-ready string or undefined (no var injected when absent/zero/default)
        const getVar = (val: unknown, unit = 'px'): string | undefined => {
          if (val == null || val === '' || val === 'default' || val === 0) return undefined;
          const n = parseFloat(String(val));
          if (isNaN(n) || n === 0) return undefined;
          return `${n}${unit}`;
        };

        // Backward-compat: if only the old single-value fields are set, use them as desktop fallback
        const tFsD = slide.titleFontSizeDesktop ?? slide.titleFontSize;
        const tFsM = slide.titleFontSizeMobile;
        const tLsD = slide.titleLetterSpacingDesktop ?? slide.titleLetterSpacing;
        const tLsM = slide.titleLetterSpacingMobile;
        const ssFsD = slide.subtitleFontSizeDesktop ?? slide.subtitleFontSize;
        const ssFsM = slide.subtitleFontSizeMobile;
        const ssLsD = slide.subtitleLetterSpacingDesktop ?? slide.subtitleLetterSpacing;
        const ssLsM = slide.subtitleLetterSpacingMobile;
        const vGapD = slide.verticalSpacingDesktop ?? slide.verticalSpacing;
        const vGapM = slide.verticalSpacingMobile;
        const bFsD  = slide.buttonFontSizeDesktop ?? slide.buttonFontSize;
        const bFsM  = slide.buttonFontSizeMobile;

        // Backward-compat: legacy universal offsets fall back to desktop
        const offXD = slide.horizontalOffsetDesktop ?? slide.horizontalOffset;
        const offYD = slide.verticalOffsetDesktop   ?? slide.verticalOffset;
        // Explicit number coercion so string values from JSON storage don't slip through
        const offXM = slide.horizontalOffsetMobile != null ? Number(slide.horizontalOffsetMobile) : undefined;
        const offYM = slide.verticalOffsetMobile   != null ? Number(slide.verticalOffsetMobile)   : undefined;
        const btnPadXD = slide.buttonPaddingX        != null ? Number(slide.buttonPaddingX)        : undefined;
        const btnPadYD = slide.buttonPaddingY        != null ? Number(slide.buttonPaddingY)        : undefined;
        const btnPadXM = slide.buttonPaddingXMobile  != null ? Number(slide.buttonPaddingXMobile)  : undefined;
        const btnPadYM = slide.buttonPaddingYMobile  != null ? Number(slide.buttonPaddingYMobile)  : undefined;

        // CSS variable dictionary injected on the slide wrapper
        const slideCssVars = {
          '--title-fs-d':  getVar(tFsD),
          '--title-fs-m':  getVar(tFsM),
          '--title-ls-d':  getVar(tLsD, 'em'),
          '--title-ls-m':  getVar(tLsM, 'em'),
          '--sub-fs-d':    getVar(ssFsD),
          '--sub-fs-m':    getVar(ssFsM),
          '--sub-ls-d':    getVar(ssLsD, 'em'),
          '--sub-ls-m':    getVar(ssLsM, 'em'),
          '--v-gap-d':     getVar(vGapD),
          '--v-gap-m':     getVar(vGapM),
          '--btn-fs-d':    getVar(bFsD),
          '--btn-fs-m':    getVar(bFsM),
          '--btn-pad-x-d': getVar(btnPadXD),
          '--btn-pad-y-d': getVar(btnPadYD),
          '--btn-pad-x-m': getVar(btnPadXM),
          '--btn-pad-y-m': getVar(btnPadYM),
          // Offsets: always inject the % value (even 0%) so the CSS var is never absent
          '--offset-x-d':  offXD != null ? `${Number(offXD)}%` : '0%',
          '--offset-y-d':  offYD != null ? `${Number(offYD)}%` : '0%',
          '--offset-x-m':  offXM != null ? `${offXM}%` : '0%',
          '--offset-y-m':  offYM != null ? `${offYM}%` : '0%',
          // Horizontal alignment for editorial mode — drives align-items on .sf-hero-content
          '--hero-align-h': slide.alignItems ?? 'flex-start',
          // Global hero title/subtitle color & weight
          ...(config.heroTitleColor  ? { '--hero-title-color': config.heroTitleColor }   : {}),
          ...(config.heroTitleWeight ? { '--hero-title-weight': config.heroTitleWeight } : {}),
          ...(config.heroSubtitleColor ? { '--hero-sub-color': config.heroSubtitleColor } : {}),
        } as React.CSSProperties;

        // Button style — padding and font-size are handled by CSS vars in the stylesheet
        const buttonStyle: React.CSSProperties = {
          borderRadius: config.heroBtnShape === 'pill' ? 999 : config.heroBtnShape === 'rounded' ? 8 : 2,
          background:   config.heroBtnStyle === 'solid' ? (config.heroBtnBg || '#175C40') : 'transparent',
          border:       `2px solid ${config.heroBtnBorderColor || 'rgba(255,255,255,0.9)'}`,
          color:        config.heroBtnTextColor || '#ffffff',
          fontWeight:   config.heroBtnFontWeight || '600',
          letterSpacing: `${(config.heroBtnLetterSpacing ?? 8) / 100}em`,
        };

        const hasEditorialLayout = slide.justifyContent || slide.alignItems;
        const desktopPos = slide.contentPosition || "middle-center";
        const mobilePos = slide.contentPositionMobile || desktopPos;
        const dStyle = POSITION_MAP[desktopPos] || POSITION_MAP["middle-center"];
        const mStyle = POSITION_MAP[mobilePos] || POSITION_MAP["middle-center"];
        const { alignItems: dAlign, textAlign: dText, top: dTop, left: dLeft, right: dRight, bottom: dBottom, transform: dTransform } = dStyle as any;
        const { alignItems: mAlign, textAlign: mText, top: mTop, left: mLeft, right: mRight, bottom: mBottom, transform: mTransform } = mStyle as any;

        // Per-slide editorial overrides — all alignment/offset is driven by CSS vars.
        // We derive text-align for the inner wrapper only.
        const slideJustify = slide.justifyContent ?? "center";
        const slideAlign   = slide.alignItems   ?? "center";
        const slideTextAlign = slideAlign === "flex-start" ? "left" : slideAlign === "flex-end" ? "right" : "center";

        // Build content container style.
        // Editorial mode: full-inset flex container; NO hardcoded align-items or max-width.
        //   Horizontal alignment is controlled by --hero-align-h CSS var (injected below).
        // Legacy mode: position via CSS vars (nine-grid).
        const contentStyle: React.CSSProperties = hasEditorialLayout ? {
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: slideJustify,
          // align-items driven by CSS var --hero-align-h; no inline value here
        } : {
          position: "absolute",
          display: "flex", flexDirection: "column",
          gap: 12,
          // Legacy nine-grid CSS vars
          "--hero-top": dTop ?? "auto",
          "--hero-left": dLeft ?? "auto",
          "--hero-right": dRight ?? "auto",
          "--hero-bottom": dBottom ?? "auto",
          "--hero-transform": dTransform ?? "none",
          "--hero-align": dAlign ?? "center",
          "--hero-text": dText ?? "center",
          "--hero-m-top": mTop ?? "auto",
          "--hero-m-left": mLeft ?? "auto",
          "--hero-m-right": mRight ?? "auto",
          "--hero-m-bottom": mBottom ?? "auto",
          "--hero-m-transform": mTransform ?? "none",
          "--hero-m-align": mAlign ?? "center",
          "--hero-m-text": mText ?? "center",
        } as React.CSSProperties;

        // Inner text wrapper — full-width so text can reach edges (e.g. bottom-right flush).
        // align-items is inherited from the parent container via --hero-align-h CSS var.
        const innerStyle: React.CSSProperties = hasEditorialLayout ? {
          display: "flex", flexDirection: "column", gap: 12,
          width: "100%",
          textAlign: slideTextAlign as React.CSSProperties['textAlign'],
        } : {};

        // Render both mobile and desktop images in HTML; CSS hides the inactive one.
        // This avoids any JS/SSR mismatch and lets the browser fetch the correct image
        // on the very first paint without waiting for client-side hydration.
        const desktopImgUrl = slide.imageUrl;
        const mobileImgUrl  = slide.mobileImageUrl || slide.imageUrl;
        return (
          <div key={slide.id} className={`sf-hero-slide${i === current ? " active" : ""}`} style={slideCssVars}>
            {desktopImgUrl || mobileImgUrl ? (
              <>
                {/* Desktop image — hidden on mobile via CSS */}
                {desktopImgUrl && (
                  <img
                    src={desktopImgUrl}
                    alt={slide.title}
                    className="sf-hero-img sf-hero-img-desktop"
                    fetchPriority="high"
                    loading="eager"
                  />
                )}
                {/* Mobile image — hidden on desktop via CSS; only rendered when a separate mobile URL exists */}
                {slide.mobileImageUrl && (
                  <img
                    src={slide.mobileImageUrl}
                    alt={slide.title}
                    className="sf-hero-img sf-hero-img-mobile"
                    fetchPriority="high"
                    loading="eager"
                  />
                )}
              </>
            ) : (
              <div className="sf-hero-bg" />
            )}
            <div
              className={`sf-hero-content${slide.textColorMode === 'dark' ? ' sf-hero-dark-text' : ''}`}
              style={contentStyle}
            >
              {/* Inner wrapper for editorial mode */}
              <div style={innerStyle}>
              {/* Custom text blocks take priority over legacy title/subtitle */}
              {slide.textBlocks && slide.textBlocks.length > 0 ? (
                slide.textBlocks.map(block => (
                  block.type === "heading" ? (
                    <h1
                      key={block.id}
                      className="sf-hero-text-block"
                      style={{
                        margin: 0,
                        fontSize: `var(--tb-font-size, ${block.fontSize || 48}px)`,
                        fontWeight: block.fontWeight || "700",
                        color: block.color || "#ffffff",
                        fontStyle: block.fontStyle || "normal",
                        lineHeight: 1.15,
                        ["--tb-font-size" as string]: `${block.fontSize || 48}px`,
                        ["--tb-m-font-size" as string]: `${block.mobileFontSize ?? block.fontSize ?? 48}px`,
                      } as React.CSSProperties}
                    >{block.text}</h1>
                  ) : (
                    <p
                      key={block.id}
                      className="sf-hero-text-block"
                      style={{
                        margin: 0,
                        fontSize: `var(--tb-font-size, ${block.fontSize || 18}px)`,
                        fontWeight: block.fontWeight || "400",
                        color: block.color || "rgba(255,255,255,0.9)",
                        fontStyle: block.fontStyle || "normal",
                        lineHeight: 1.5,
                        ["--tb-font-size" as string]: `${block.fontSize || 18}px`,
                        ["--tb-m-font-size" as string]: `${block.mobileFontSize ?? block.fontSize ?? 18}px`,
                      } as React.CSSProperties}
                    >{block.text}</p>
                  )
                ))
              ) : (
                <>
                  <h1 className="sf-hero-title"
                    style={{
                      ...(config.heroTitleColor  ? { color: config.heroTitleColor }       : {}),
                      ...(config.heroTitleWeight ? { fontWeight: config.heroTitleWeight } : {}),
                    }}
                  >{slide.title}</h1>
                  {slide.subtitle && (
                    <p className="sf-hero-subtitle"
                      style={{ ...(config.heroSubtitleColor ? { color: config.heroSubtitleColor } : {}) }}
                    >
                      {slide.subtitle.split('|').map((line, index, array) => (
                        <React.Fragment key={index}>
                          {line}
                          {index < array.length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </p>
                  )}
                </>
              )}
              <a
                href={slide.buttonLink}
                className="sf-hero-cta-btn"
                style={{
                  ...buttonStyle,
                  alignSelf: hasEditorialLayout
                    ? (slideAlign === 'flex-start' ? 'flex-start' : slideAlign === 'flex-end' ? 'flex-end' : 'center')
                    : ('var(--hero-btn-self, center)' as any),
                  ['--hero-btn-self' as string]: dAlign === 'flex-start' ? 'flex-start' : dAlign === 'flex-end' ? 'flex-end' : 'center',
                  ['--hero-btn-m-self' as string]: mAlign === 'flex-start' ? 'flex-start' : mAlign === 'flex-end' ? 'flex-end' : 'center',
                }}
              >{slide.buttonLabel}</a>
              </div>
            </div>
          </div>
        );
      })}
      <button className="sf-hero-arrow prev" onClick={() => go(-1)}>&#8249;</button>
      <button className="sf-hero-arrow next" onClick={() => go(1)}>&#8250;</button>
      <div className="sf-hero-dots">
        {config.slides.map((_, i) => (
          <button key={i} className={`sf-hero-dot${i === current ? " active" : ""}`} onClick={() => { setCurrent(i); startTimer(); }} />
        ))}
      </div>
    </section>
  );
}

// Brand Story section removed


// ==================== CATEGORIES (desktop: single-row scroll with configurable count) ====================
function SFCategories({ instanceId, titleAlign = "center" }: { instanceId?: string; titleAlign?: "left" | "center" | "right" }) {
  const { config } = useThemeConfig();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const overlayOpacity = (config.categoryOverlayOpacity ?? 60) / 100;
  const labelFontSizeDesktop = config.categoryLabelFontSizeDesktop ?? 14;
  const labelFontSizeMobile = config.categoryLabelFontSizeMobile ?? 12;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Resolve per-instance column settings
  const catInst = (config.categoryInstances ?? []).find(c => c.id === instanceId);
  const columnsDesktop = catInst?.columnsDesktop ?? 4;
  const columnsMobile = catInst?.columnsMobile ?? 2;
  const sectionTitle = catInst?.title || config.categoriesTitle;
  const cats = config.categories;

  return (
    <section className="sf-section sf-categories">
      <div style={{ width: "95%", margin: "0 auto" }}>
        <div className="sf-section-header" style={{ textAlign: titleAlign }}><h2>{sectionTitle}</h2></div>
      </div>
      <div
        className="sf-categories-wrapper"
        style={{
          ["--cat-overlay-opacity" as string]: overlayOpacity,
          ["--cat-label-font-size" as string]: isMobile ? `${labelFontSizeMobile}px` : `${labelFontSizeDesktop}px`,
          width: isMobile ? "100%" : "95%",
          margin: "0 auto",
        } as React.CSSProperties}
      >
        <div
          className="sf-categories-grid"
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? `repeat(${columnsMobile}, 1fr)` : `repeat(${columnsDesktop}, 1fr)`,
            gap: isMobile ? `${config.categoriesMobileGap || 12}px` : `${config.categoriesDesktopGap || 20}px`,
          }}
          onMouseLeave={() => setHoveredId(null)}
        >
          {cats.map((cat) => (
            <a
              key={cat.id}
              href={cat.link}
              className={`sf-category-card sf-category-focus${hoveredId && hoveredId !== cat.id ? " dimmed" : ""}${hoveredId === cat.id ? " focused" : ""}`}
              style={{ textDecoration: "none" }}
              onMouseEnter={() => setHoveredId(cat.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="sf-cat-img-wrap">
                {cat.imageUrl ? (
                  <img loading="lazy" src={cat.imageUrl} alt={cat.title} />
                ) : (
                  <ImgPlaceholder label={cat.title} />
                )}
                <div className="sf-cat-overlay-text">{cat.title}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}


// ==================== MARQUEE (enhanced: text + image items, direction) ====================
function SFMarquee({ titleAlign = "center" }: { instanceId?: string; titleAlign?: "left" | "center" | "right" }) {
  const { config } = useThemeConfig();
  if (!config.showMarquee) return null;

  const items = config.marqueeItems && config.marqueeItems.length > 0
    ? config.marqueeItems
    : [{ id: "mq_legacy", type: "text" as const, text: config.marqueeText || "DUSKYONDER" }];

  const isReverse = config.marqueeDirection === "right";
  // Scale duration by item count so visual speed stays consistent regardless of how many items are shown
  const speed = (config.marqueeSpeed || 20) * items.length;
  // Build the content once, then duplicate for seamless loop.
  // Repeat items enough times so a single short word fills the full banner width.
  const REPEAT = 10;
  const renderItem = (item: typeof items[0], key: string) => {
    if (item.type === "image" && item.imageUrl) {
      return (
        <span key={key} className="sf-marquee-item sf-marquee-item--image">
          <img loading="lazy" src={item.imageUrl} alt="" style={{ height: 28, width: "auto", objectFit: "contain", verticalAlign: "middle" }} />
        </span>
      );
    }
    return (
      <span key={key} className="sf-marquee-item sf-marquee-item--text">
        {item.text || "DUSKYONDER"}
      </span>
    );
  };

  // Expand items array so the track is always wider than the viewport
  const expandedItems = Array.from({ length: REPEAT }, (_, r) =>
    items.map((item, i) => renderItem(item, `a_${r}_${i}`))
  );
  const expandedItemsDup = Array.from({ length: REPEAT }, (_, r) =>
    items.map((item, i) => renderItem(item, `b_${r}_${i}`))
  );

  return (
    <div className="sf-marquee-section" style={{ background: config.marqueeBg, color: config.marqueeColor }}>
      <div
        className={`sf-marquee-track${isReverse ? " sf-marquee-reverse" : ""}`}
        style={{ animationDuration: `${speed}s` }}
      >
        <span className="sf-marquee-content">{expandedItems}</span>
        <span className="sf-marquee-content" aria-hidden="true">{expandedItemsDup}</span>
      </div>
    </div>
  );
}


// ==================== SERIES SHOWCASE ====================
function SFSeries({ titleAlign = "center" }: { instanceId?: string; titleAlign?: "left" | "center" | "right" }) {
  const { config } = useThemeConfig();
  const [activeIdx, setActiveIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const series = config.seriesList || [];
  const total = series.length;

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (total > 1) {
      timerRef.current = setInterval(() => setActiveIdx(i => (i + 1) % total), (config.seriesAutoplaySpeed || 5) * 1000);
    }
  }, [total, config.seriesAutoplaySpeed]);

  useEffect(() => { startTimer(); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, [startTimer]);

  if (!config.showSeries || total === 0) return null;

  const active = series[activeIdx];
  const isWhiteTheme = (config.seriesTheme ?? "green") === "white";

  // Derived theme tokens
  const sectionBg = isWhiteTheme ? "#fff" : "#0D3D2B";
  const contentColor = isWhiteTheme ? "#111" : "white";
  const labelColor = isWhiteTheme ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.5)";
  const headlineColor = isWhiteTheme ? "#111" : "white";
  const headlineEmColor = isWhiteTheme ? "#175C40" : "#4CAF82";
  const itemNameColor = isWhiteTheme ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.7)";
  const itemActiveNameColor = isWhiteTheme ? "#111" : "white";
  const itemHoverNameColor = isWhiteTheme ? "#111" : "white";
  const itemNumColor = isWhiteTheme ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.4)";
  const itemActiveNumColor = isWhiteTheme ? "#175C40" : "#4CAF82";
  const dividerColor = isWhiteTheme ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)";
  const descColor = isWhiteTheme ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)";
  const gradientTop = isWhiteTheme ? "transparent" : undefined; // white theme: no gradient transitions
  const gradientBottom = isWhiteTheme ? "transparent" : undefined;
  const inlineImgBg = isWhiteTheme ? "#f5f5f5" : "#1a4d35";

  return (
    <>
    <section className="sf-section sf-series-section" style={{ background: sectionBg, color: contentColor }}>
      <div className="sf-series-inner" style={{
        width: "95%",
        ["--series-min-height" as string]: isMobile
          ? (config.seriesMobileMinHeight ? `${config.seriesMobileMinHeight}px` : `${config.seriesImageHeight ?? 520}px`)
          : `${config.seriesImageHeight ?? 520}px`,
        ["--series-m-img-width" as string]: config.seriesMobileImageWidth && config.seriesMobileImageWidth > 0 ? `${config.seriesMobileImageWidth}px` : "100%",
      } as React.CSSProperties}>
        {/* Desktop: left image block */}
        <div className={"sf-series-image sf-series-image--desktop"} style={{
          aspectRatio: config.seriesImageAspectRatio || "4/5",
          ...(config.seriesImageWidth && config.seriesImageWidth > 0 ? { width: `${config.seriesImageWidth}px`, flex: `0 0 ${config.seriesImageWidth}px` } : {}),
          ["--series-m-img-width" as string]: config.seriesMobileImageWidth && config.seriesMobileImageWidth > 0 ? `${config.seriesMobileImageWidth}px` : "100%",
          transition: "opacity 0.5s ease-in-out",
        }}>
          {active?.link ? (
            <a href={active.link} style={{ display: "block", width: "100%", height: "100%", position: "absolute", inset: 0 }}>
              {active?.imageUrl ? (
                <img loading="lazy" src={active.imageUrl} alt={active.name} key={active.id} className="sf-series-img" />
              ) : (
                <ImgPlaceholder label={`${active?.name || "Series"} Image`} style={{ position: "absolute", inset: 0, borderRadius: 0 }} />
              )}
            </a>
          ) : (
            active?.imageUrl ? (
              <img loading="lazy" src={active.imageUrl} alt={active.name} key={active.id} className="sf-series-img" />
            ) : (
              <ImgPlaceholder label={`${active?.name || "Series"} Image`} style={{ position: "absolute", inset: 0, borderRadius: 0 }} />
            )
          )}
        </div>
        <div className="sf-series-content" style={{ textAlign: "center", alignItems: "center", justifyContent: "center", display: "flex", flexDirection: "column" }}>
          <div className="sf-series-label" style={{ color: labelColor }}>{config.seriesLabel || "TOP COLLECTIONS"}</div>
          <h2 className="sf-series-headline" style={{ color: headlineColor }}>
            {config.seriesHeadline || "THIS DREAMY PRINT"}<br />
            <em style={{ color: headlineEmColor }}>{config.seriesSubheadline || "DRAWS INSPIRATION"}</em>
          </h2>
          <div className="sf-series-list" style={{ display: "flex", flexDirection: "column", gap: "2rem", alignItems: "center" }}>
            {series.map((item, i) => (
              <div key={item.id}>
                <div
                  className={`sf-series-item-editorial${i === activeIdx ? " active" : ""}`}
                  onClick={() => { setActiveIdx(i); startTimer(); }}
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "clamp(1rem, 2vw, 1.875rem)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    lineHeight: 1.1,
                    cursor: "pointer",
                    transition: "color 0.5s ease",
                    color: i === activeIdx
                      ? (isWhiteTheme ? "#111" : "#ffffff")
                      : (isWhiteTheme ? "#d4d4d4" : "rgba(255,255,255,0.25)"),
                    textAlign: "center",
                  }}
                >
                  {item.name}
                </div>
                {/* Mobile: inline image shown below the active item */}
                {isMobile && i === activeIdx && (
                  <div className="sf-series-inline-img" style={{ position: "relative", aspectRatio: config.seriesImageAspectRatio || "4/5", background: inlineImgBg }}>
                    {item.link ? (
                      <a href={item.link} style={{ display: "block", width: "100%", height: "100%", position: "absolute", inset: 0 }}>
                        {item.imageUrl ? (
                          <img loading="lazy" src={item.imageUrl} alt={item.name} key={item.id} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        ) : (
                          <ImgPlaceholder label={item.name} style={{ position: "absolute", inset: 0, borderRadius: 0 }} />
                        )}
                      </a>
                    ) : (
                      item.imageUrl ? (
                        <img loading="lazy" src={item.imageUrl} alt={item.name} key={item.id} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      ) : (
                        <ImgPlaceholder label={item.name} style={{ position: "absolute", inset: 0, borderRadius: 0 }} />
                      )
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
    </>
  );
}


// ==================== FABRIC INTRO ====================
function SFFabric({ titleAlign = "center" }: { instanceId?: string; titleAlign?: "left" | "center" | "right" }) {
  const { config } = useThemeConfig();
  if (!config.showFabric) return null;
  const perRow = config.fabricsPerRow ?? 3;
  const cardPadding = config.fabricCardPadding ?? 32;
  const isWhite = (config.fabricTheme ?? "green") === "white";

  const sectionBg   = isWhite ? "#fff"                      : "#0D3D2B";
  const headingColor = isWhite ? "#111"                      : "white";
  const cardBg       = isWhite ? "#f5f5f5"                   : "rgba(255,255,255,0.07)";
  const cardBorder   = isWhite ? "1px solid #e8e8e8"         : "1px solid rgba(255,255,255,0.12)";
  const iconBg       = isWhite ? "rgba(23,92,64,0.12)"       : "rgba(23,92,64,0.6)";
  const h3Color      = isWhite ? "#175C40"                   : "#4CAF82";
  const pColor       = isWhite ? "rgba(0,0,0,0.6)"           : "rgba(255,255,255,0.75)";

  return (
    <>
    <section className="sf-section sf-fabric" style={{ background: sectionBg }}>
      <div className="sf-section-header" style={{ textAlign: titleAlign }}>
        <h2 style={{ color: headingColor }}>{config.fabricTitle}</h2>
      </div>
      <div
        className="sf-fabric-grid"
        style={{ gridTemplateColumns: `repeat(${perRow}, 1fr)` }}
      >
        {config.fabrics.map((fabric) => (
          <div
            key={fabric.id}
            className="sf-fabric-card"
            style={{ padding: cardPadding, background: cardBg, border: cardBorder,
              // hover handled by CSS class; override base colours via CSS var trick not needed —
              // onMouseEnter/Leave would require state; CSS class sf-fabric-card:hover still fires
              // but its rgba values may mismatch. We override the base only; hover is acceptable.
            }}
          >
            <div className="sf-fabric-icon" style={{ background: iconBg }}>{fabric.icon}</div>
            <h3 style={{ color: h3Color }}>{fabric.title}</h3>
            <p style={{ color: pColor }}>{fabric.description}</p>
          </div>
        ))}
      </div>
    </section>
    </>
  );
}


// ==================== SECTION RENDERER ====================
const SECTION_MAP: Partial<Record<SectionKey, React.ComponentType<{ instanceId?: string; titleAlign?: "left" | "center" | "right" }>>> = {
  "hero": SFHero,
  "categories": SFCategories,
  "marquee": SFMarquee,
  "videos": SFVideos,
  "featured": SFFeatured,
  "series": SFSeries,
  "fabric": SFFabric,
};

// ==================== MAIN PAGE ====================
const HOME_SEO_TITLE = "Dusk Yonder | Premium Athleisure & Everyday Activewear";
const HOME_SEO_DESC = "Dusk Yonder — premium athleisure designed to blur the lines between workout and daily life. Shop versatile leggings, sports bras, and jumpsuits for modern movement.";
const SITE_DEFAULT_TITLE = "Dusk Yonder | Performance Activewear";
const SITE_DEFAULT_DESC = "Dusk Yonder — high-performance activewear designed for versatility. Shop leggings, sports bras, jumpsuits, shorts and more.";

function setPageMeta(selector: string, value: string) {
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    const [attrName, attrVal] = selector.replace(/[\[\]'"]/g, "").split("=");
    el.setAttribute(attrName, attrVal);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

export default function Home() {
  const { config } = useThemeConfig();

  useEffect(() => {
    document.title = HOME_SEO_TITLE;
    setPageMeta('meta[name="description"]', HOME_SEO_DESC);
    setPageMeta('meta[property="og:title"]', HOME_SEO_TITLE);
    setPageMeta('meta[property="og:description"]', HOME_SEO_DESC);
    return () => {
      document.title = SITE_DEFAULT_TITLE;
      setPageMeta('meta[name="description"]', SITE_DEFAULT_DESC);
      setPageMeta('meta[property="og:title"]', SITE_DEFAULT_TITLE);
      setPageMeta('meta[property="og:description"]', SITE_DEFAULT_DESC);
    };
  }, []);

  const sectionOrder = config.sectionOrder || [
    { key: "hero" as SectionKey, label: "英雄横幅", visible: true },
    { key: "categories" as SectionKey, label: "产品分类", visible: true },
    { key: "marquee" as SectionKey, label: "滚动字幕", visible: true },
    { key: "videos" as SectionKey, label: "达人视频", visible: true },
    { key: "featured" as SectionKey, label: "Best Sellers", visible: true, instanceId: "featured_default" },
    { key: "series" as SectionKey, label: "系列展示", visible: true },
    { key: "fabric" as SectionKey, label: "面料介绍", visible: true },
  ];

  return (
    <div
      style={{
        position: "relative",
        ["--promo-height" as string]: config.showPromoBar ? `${config.promoBarHeight ?? 40}px` : "0px",
        ["--promo-m-height" as string]: config.showPromoBar ? `${config.promoBarMobileHeight ?? 36}px` : "0px",
      } as React.CSSProperties}
    >

      {/* PromoBar and Header are OUTSIDE storefront to avoid overflow-x:hidden breaking fixed positioning */}
      <SharedSFPromoBar />
      <SharedSFHeader />
      <div className="storefront-wrapper">
        <div className="storefront">
          {sectionOrder
            .filter(s => s.visible !== false)
            .map(s => {
              const uid = s.instanceId || s.key;
              const Component = SECTION_MAP[s.key];
              if (!Component) return null;
              return <Component key={uid} instanceId={uid} titleAlign={s.titleAlign ?? "center"} />;
            })
          }
          <SharedSFFooter />
          <SFNewsletter />
        </div>
      </div>

    </div>
  );
}
