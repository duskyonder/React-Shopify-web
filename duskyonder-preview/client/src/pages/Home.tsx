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
  const { config } = useThemeConfig();
  const [current, setCurrent] = useState(0);
  const [isMobileHero, setIsMobileHero] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = config.slides.length;
  useEffect(() => {
    const check = () => setIsMobileHero(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (config.slideshowAutoplay && total > 1) {
      timerRef.current = setInterval(() => setCurrent(c => (c + 1) % total), config.slideshowSpeed * 1000);
    }
  }, [config.slideshowAutoplay, config.slideshowSpeed, total]);
  useEffect(() => { startTimer(); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, [startTimer]);
  const go = (n: number) => { setCurrent((current + n + total) % total); startTimer(); };
  // Hero sits below the header — on mobile use 100svh (full screen), on desktop use configured height
  const baseHeroHeight = isMobileHero
    ? (config.heroMobileHeight || window.innerHeight)
    : (config.heroHeight || 600);
  const heroHeight = baseHeroHeight;
  return (
    <section className="sf-hero" style={{ height: isMobileHero ? '100svh' : heroHeight }}>
      {config.slides.map((slide, i) => {
        const desktopPos = slide.contentPosition || "middle-center";
        const mobilePos = slide.contentPositionMobile || desktopPos;
        const dStyle = POSITION_MAP[desktopPos] || POSITION_MAP["middle-center"];
        const mStyle = POSITION_MAP[mobilePos] || POSITION_MAP["middle-center"];
        const { alignItems: dAlign, textAlign: dText, top: dTop, left: dLeft, right: dRight, bottom: dBottom, transform: dTransform } = dStyle as any;
        const { alignItems: mAlign, textAlign: mText, top: mTop, left: mLeft, right: mRight, bottom: mBottom, transform: mTransform } = mStyle as any;
        // 移动端优先使用 mobileImageUrl，未设置则回退到 imageUrl
        const activeImgUrl = isMobileHero ? (slide.mobileImageUrl || slide.imageUrl) : slide.imageUrl;
        return (
          <div key={slide.id} className={`sf-hero-slide${i === current ? " active" : ""}`}>
            {activeImgUrl ? (
              <img src={activeImgUrl} alt={slide.title} className="sf-hero-img" fetchPriority="high" />
            ) : (
              <div className="sf-hero-bg" />
            )}
            <div
              className={`sf-hero-content${slide.textColorMode === 'dark' ? ' sf-hero-dark-text' : ''}`}
              style={{
                position: "absolute",
                display: "flex", flexDirection: "column",
                maxWidth: "min(560px, 90%)", gap: 12,
                // Desktop CSS vars
                "--hero-top": dTop ?? "auto",
                "--hero-left": dLeft ?? "auto",
                "--hero-right": dRight ?? "auto",
                "--hero-bottom": dBottom ?? "auto",
                "--hero-transform": dTransform ?? "none",
                "--hero-align": dAlign ?? "center",
                "--hero-text": dText ?? "center",
                // Mobile CSS vars
                "--hero-m-top": mTop ?? "auto",
                "--hero-m-left": mLeft ?? "auto",
                "--hero-m-right": mRight ?? "auto",
                "--hero-m-bottom": mBottom ?? "auto",
                "--hero-m-transform": mTransform ?? "none",
                "--hero-m-align": mAlign ?? "center",
                "--hero-m-text": mText ?? "center",
              } as React.CSSProperties}
            >
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
                  <h1
                    className="sf-hero-title"
                    style={{
                      // CSS vars control font-size via .sf-hero-title { font-size: var(--hero-title-fs) }
                      ["--hero-title-fs" as string]: config.heroTitleFontSize ? `${config.heroTitleFontSize}px` : undefined,
                      ["--hero-title-m-fs" as string]: config.heroTitleMobileFontSize ? `${config.heroTitleMobileFontSize}px` : (config.heroTitleFontSize ? `${config.heroTitleFontSize}px` : undefined),
                      // Direct inline for color and weight (no CSS var needed)
                      ...(config.heroTitleColor ? { color: config.heroTitleColor } : {}),
                      ...(config.heroTitleWeight ? { fontWeight: config.heroTitleWeight } : {}),
                    } as React.CSSProperties}
                  >{slide.title}</h1>
                  <p
                    className="sf-hero-subtitle"
                    style={{
                      // CSS vars control font-size via .sf-hero-subtitle { font-size: var(--hero-sub-fs) }
                      ["--hero-sub-fs" as string]: config.heroSubtitleFontSize ? `${config.heroSubtitleFontSize}px` : undefined,
                      ["--hero-sub-m-fs" as string]: config.heroSubtitleMobileFontSize ? `${config.heroSubtitleMobileFontSize}px` : (config.heroSubtitleFontSize ? `${config.heroSubtitleFontSize}px` : undefined),
                      // Direct inline for color
                      ...(config.heroSubtitleColor ? { color: config.heroSubtitleColor } : {}),
                    } as React.CSSProperties}
                  >{slide.subtitle}</p>
                </>
              )}
              <a
                href={slide.buttonLink}
                className="sf-hero-cta-btn"
                style={{
                  borderRadius: config.heroBtnShape === "pill" ? 999 : config.heroBtnShape === "rounded" ? 8 : 2,
                  background: config.heroBtnStyle === "solid" ? (config.heroBtnBg || "#175C40") : "transparent",
                  border: `2px solid ${config.heroBtnBorderColor || "rgba(255,255,255,0.9)"}`,
                  color: config.heroBtnTextColor || "#ffffff",
                  fontSize: `var(--hero-btn-font-size, ${config.heroBtnFontSize || 14}px)`,
                  fontWeight: config.heroBtnFontWeight || "600",
                  letterSpacing: `${(config.heroBtnLetterSpacing ?? 8) / 100}em`,
                  padding: `var(--hero-btn-pad-y, ${config.heroBtnPaddingY || 12}px) var(--hero-btn-pad-x, ${config.heroBtnPaddingX || 28}px)`,
                  // Mobile: use mAlign for alignSelf; desktop: use dAlign
                  // We use a CSS variable so the mobile media query can override
                  ["--hero-btn-self" as string]: dAlign === "flex-start" ? "flex-start" : dAlign === "flex-end" ? "flex-end" : "center",
                  ["--hero-btn-m-self" as string]: mAlign === "flex-start" ? "flex-start" : mAlign === "flex-end" ? "flex-end" : "center",
                  alignSelf: "var(--hero-btn-self, center)" as any,
                  // CSS vars for mobile override
                  ["--hero-btn-font-size" as string]: `${config.heroBtnFontSize || 14}px`,
                  ["--hero-btn-m-font-size" as string]: `${config.heroBtnMobileFontSize ?? config.heroBtnFontSize ?? 14}px`,
                  ["--hero-btn-pad-x" as string]: `${config.heroBtnPaddingX || 28}px`,
                  ["--hero-btn-pad-y" as string]: `${config.heroBtnPaddingY || 12}px`,
                  ["--hero-btn-m-pad-x" as string]: `${config.heroBtnMobilePaddingX ?? config.heroBtnPaddingX ?? 28}px`,
                  ["--hero-btn-m-pad-y" as string]: `${config.heroBtnMobilePaddingY ?? config.heroBtnPaddingY ?? 12}px`,
                }}
              >{slide.buttonLabel}</a>
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
function SFCategories({ titleAlign = "center" }: { instanceId?: string; titleAlign?: "left" | "center" | "right" }) {
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

  // Only show first 4 categories
  const cats = config.categories.slice(0, 4);

  return (
    <section className="sf-section sf-categories">
      <div style={{ width: "95%", maxWidth: 1600, margin: "0 auto" }}>
        <div className="sf-section-header" style={{ textAlign: titleAlign }}><h2>{config.categoriesTitle}</h2></div>
      </div>
      <div
        className="sf-categories-wrapper"
        style={{
          ["--cat-overlay-opacity" as string]: overlayOpacity,
          ["--cat-label-font-size" as string]: isMobile ? `${labelFontSizeMobile}px` : `${labelFontSizeDesktop}px`,
          width: "95%",
          maxWidth: 1600,
          margin: "0 auto",
        } as React.CSSProperties}
      >
        <div
          className="sf-categories-grid"
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
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
  const speed = config.marqueeSpeed || 20;

  // Build the content once, then duplicate for seamless loop
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

  const content = items.map((item, i) => renderItem(item, `a_${i}`));
  const contentDup = items.map((item, i) => renderItem(item, `b_${i}`));

  return (
    <div className="sf-marquee-section" style={{ background: config.marqueeBg, color: config.marqueeColor }}>
      <div
        className={`sf-marquee-track${isReverse ? " sf-marquee-reverse" : ""}`}
        style={{ animationDuration: `${speed}s` }}
      >
        <span className="sf-marquee-content">{content}</span>
        <span className="sf-marquee-content" aria-hidden="true">{contentDup}</span>
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
        maxWidth: isMobile
          ? (config.seriesMobileMaxWidth ? `${config.seriesMobileMaxWidth}px` : '1600px')
          : `${config.seriesMaxWidth ?? 1600}px`,
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
        <div className="sf-series-content">
          <div className="sf-series-label" style={{ color: labelColor }}>{config.seriesLabel || "TOP COLLECTIONS"}</div>
          <h2 className="sf-series-headline" style={{ color: headlineColor }}>
            {config.seriesHeadline || "THIS DREAMY PRINT"}<br />
            <em style={{ color: headlineEmColor }}>{config.seriesSubheadline || "DRAWS INSPIRATION"}</em>
          </h2>
          <div className="sf-series-list">
            {series.map((item, i) => (
              <div key={item.id}>
                <div
                  className={`sf-series-item${i === activeIdx ? " active" : ""}`}
                  onClick={() => { setActiveIdx(i); startTimer(); }}
                >
                  <div className="sf-series-item-inner">
                    <span className="sf-series-num" style={{ color: i === activeIdx ? itemActiveNumColor : itemNumColor }}>{item.label}</span>
                    <div>
                      <div className="sf-series-name" style={{ color: i === activeIdx ? itemActiveNameColor : itemNameColor }}>{item.name}</div>
                      {item.description && i === activeIdx && (
                        <div className="sf-series-desc" style={{ color: descColor }}>{item.description}</div>
                      )}
                    </div>
                  </div>
                  <div className="sf-series-divider" style={{ background: dividerColor }} />
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
  return (
    <>
    <section className="sf-section sf-fabric">
      <div className="sf-section-header" style={{ textAlign: titleAlign }}><h2>{config.fabricTitle}</h2></div>
      <div
        className="sf-fabric-grid"
        style={{
          gridTemplateColumns: `repeat(${perRow}, 1fr)`,
        }}
      >
        {config.fabrics.map((fabric) => (
          <div key={fabric.id} className="sf-fabric-card" style={{ padding: cardPadding }}>
            <div className="sf-fabric-icon">{fabric.icon}</div>
            <h3>{fabric.title}</h3>
            <p>{fabric.description}</p>
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
export default function Home() {
  const { config } = useThemeConfig();

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
