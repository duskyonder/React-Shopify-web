import React, { useEffect, useRef, useState } from "react";
import { useThemeConfig } from "@/contexts/ThemeConfigContext";
import type {
  AboutUsTextStyle,
  AboutUsSectionKey,
} from "@/contexts/ThemeConfigContext";
import { heroPositionVars } from "@/lib/heroPosition";

export function useIntersect(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ---- Text style helper ----
export function tsCss(ts?: AboutUsTextStyle): React.CSSProperties {
  if (!ts) return {};
  return {
    ...(ts.maxWidth ? { maxWidth: ts.maxWidth } : {}),
    ...(ts.noWrap ? { whiteSpace: "nowrap" } : {}),
  };
}

// ============================================================
// SECTION: Hero — full-screen dark green, giant headline
// ============================================================
export function AUHero() {
  const { config } = useThemeConfig();
  const au = config.aboutUs!;
  const ts = au.textStyles ?? {};
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      className="au2-hero"
      style={{
        background: au.heroBgUrl
          ? `linear-gradient(to bottom, rgba(13,61,43,0.72) 0%, rgba(13,61,43,0.55) 100%), url(${au.heroBgUrl}) center/cover no-repeat`
          : "linear-gradient(160deg, #0D3D2B 0%, #175C40 55%, #1a6b4a 100%)",
        minHeight: au.heroMinHeight ? `${au.heroMinHeight}px` : undefined,
        ...heroPositionVars(au.heroDesktopPosition, au.heroMobilePosition),
      }}
    >
      <div className={`au2-hero-inner ${loaded ? "au2-visible" : ""}`}>
        <p className="au2-hero-eyebrow" style={tsCss(ts["heroEst"])}>
          {au.heroEst}
        </p>
        <h1 className="au2-hero-headline" style={tsCss(ts["heroHeadline"])}>
          {au.heroHeadline}
        </h1>
        <p className="au2-hero-subtitle" style={tsCss(ts["heroSubtitle"])}>
          {au.heroSubtitle}
        </p>
      </div>
      <div className="au2-scroll-hint">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5v14M5 12l7 7 7-7"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </section>
  );
}

// ============================================================
// SECTION: Brand Story — left text / right image offset layout
// ============================================================
export function AUStory() {
  const { config } = useThemeConfig();
  const au = config.aboutUs!;
  const ts = au.textStyles ?? {};
  const { ref, visible } = useIntersect();

  return (
    <section
      className="au2-story"
      ref={ref}
      style={
        {
          "--story-img-aspect": au.storyImageAspect ?? "3/4",
        } as React.CSSProperties
      }
    >
      <div className={`au2-story-grid ${visible ? "au2-visible" : ""}`}>
        <div className="au2-story-text">
          <span className="au2-eyebrow" style={tsCss(ts["storyTag"])}>
            {au.storyTag}
          </span>
          <h2 className="au2-section-h2" style={tsCss(ts["storyTitle"])}>
            {au.storyTitle}
          </h2>
          {au.storyParagraphs.map((p, i) => (
            <p
              key={i}
              className="au2-body"
              style={{
                transitionDelay: `${i * 60}ms`,
                ...tsCss(ts[`storyParagraph_${i}`]),
              }}
            >
              {p}
            </p>
          ))}
        </div>
        <div className="au2-story-img-wrap">
          {au.storyImageUrl ? (
            <img
              src={au.storyImageUrl}
              alt="Brand Story"
              className="au2-story-img"
              loading="lazy"
            />
          ) : (
            <div className="au2-img-placeholder">
              <span>品牌故事图片</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// SECTION: Principles — numbered rows, olaben style
// ============================================================
export function AUPrinciples() {
  const { config } = useThemeConfig();
  const au = config.aboutUs!;
  const ts = au.textStyles ?? {};
  const { ref, visible } = useIntersect();

  return (
    <section className="au2-principles" ref={ref}>
      <div className={`au2-principles-inner ${visible ? "au2-visible" : ""}`}>
        <div className="au2-principles-header">
          <span
            className="au2-eyebrow-light"
            style={tsCss(ts["principlesTag"])}
          >
            {au.principlesTag}
          </span>
          <h2
            className="au2-section-h2-light"
            style={tsCss(ts["principlesTitle"])}
          >
            {au.principlesTitle}
          </h2>
        </div>
        <div className="au2-principles-list">
          {au.principles.map((p, i) => (
            <div
              key={p.id}
              className="au2-principle-row"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="au2-principle-num">{p.number}</div>
              <div className="au2-principle-sep" />
              <div className="au2-principle-content">
                <div className="au2-principle-title-row">
                  <span
                    className="au2-principle-en"
                    style={tsCss(ts[`principleTitle_${i}`])}
                  >
                    {p.title}
                  </span>
                  <span
                    className="au2-principle-zh"
                    style={tsCss(ts[`principleSubtitle_${i}`])}
                  >
                    {p.subtitle}
                  </span>
                </div>
                <p
                  className="au2-principle-body"
                  style={tsCss(ts[`principleBody_${i}`])}
                >
                  {p.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// SECTION: Product Philosophy — image left, text right
// ============================================================
export function AUPhilosophy() {
  const { config } = useThemeConfig();
  const au = config.aboutUs!;
  const ts = au.textStyles ?? {};
  const { ref, visible } = useIntersect();

  return (
    <section
      className="au2-philosophy"
      ref={ref}
      style={
        {
          "--philosophy-img-aspect": au.philosophyImageAspect ?? "4/5",
        } as React.CSSProperties
      }
    >
      <div className={`au2-philosophy-grid ${visible ? "au2-visible" : ""}`}>
        <div className="au2-philosophy-img-wrap">
          {au.philosophyImageUrl ? (
            <img
              src={au.philosophyImageUrl}
              alt="Product Philosophy"
              className="au2-philosophy-img"
              loading="lazy"
            />
          ) : (
            <div className="au2-img-placeholder">
              <span>产品哲学图片</span>
            </div>
          )}
        </div>
        <div className="au2-philosophy-text">
          <span className="au2-eyebrow" style={tsCss(ts["philosophyTag"])}>
            {au.philosophyTag}
          </span>
          <h2 className="au2-section-h2" style={tsCss(ts["philosophyTitle"])}>
            {au.philosophyTitle}
          </h2>
          <p className="au2-body" style={tsCss(ts["philosophyBody"])}>
            {au.philosophyBody}
          </p>
          <ol className="au2-philosophy-list">
            {au.philosophyPoints.map((pt, i) => (
              <li key={i} style={tsCss(ts[`philosophyPoint_${i}`])}>
                <span className="au2-philosophy-li-num">
                  {String(i + 1).padStart(2, "0")}.
                </span>
                <span>{pt}</span>
              </li>
            ))}
          </ol>
          {au.philosophyCtaLabel && (
            <a href={au.philosophyCtaLink} className="au2-text-link">
              {au.philosophyCtaLabel} <span className="au2-arrow">→</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// SECTION: Stats — horizontal rule + numbers
// ============================================================
export function AUStats() {
  const { config } = useThemeConfig();
  const au = config.aboutUs!;
  const ts = au.textStyles ?? {};
  const { ref, visible } = useIntersect();

  return (
    <section className="au2-stats" ref={ref}>
      <div className={`au2-stats-inner ${visible ? "au2-visible" : ""}`}>
        {au.stats.map((s, i) => (
          <div
            key={s.id}
            className="au2-stat-item"
            style={{ transitionDelay: `${i * 60}ms` }}
          >
            <div className="au2-stat-value" style={tsCss(ts[`statValue_${i}`])}>
              {s.value}
            </div>
            <div className="au2-stat-label" style={tsCss(ts[`statLabel_${i}`])}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================================================
// SECTION: Universe — 2×2 grid cards
// ============================================================
export function AUUniverse() {
  const { config } = useThemeConfig();
  const au = config.aboutUs!;
  const ts = au.textStyles ?? {};
  const { ref, visible } = useIntersect();

  return (
    <section className="au2-universe" ref={ref}>
      <div className={`au2-universe-inner ${visible ? "au2-visible" : ""}`}>
        <div className="au2-universe-header">
          <span className="au2-eyebrow" style={tsCss(ts["universeTag"])}>
            {au.universeTag}
          </span>
          <h2 className="au2-section-h2" style={tsCss(ts["universeTitle"])}>
            {au.universeTitle}
          </h2>
        </div>
        <div className="au2-universe-grid">
          {au.universeCards.map((c, i) => (
            <div
              key={c.id}
              className="au2-universe-card"
              style={{ transitionDelay: `${i * 70}ms` }}
            >
              <div className="au2-universe-card-top">
                <span className="au2-universe-num">{c.number}</span>
                <span
                  className="au2-universe-module"
                  style={tsCss(ts[`universeModule_${i}`])}
                >
                  {c.module}
                </span>
              </div>
              <div className="au2-universe-sep" />
              <h3
                className="au2-universe-title"
                style={tsCss(ts[`universeTitle_${i}`])}
              >
                {c.title}
              </h3>
              <p
                className="au2-universe-body"
                style={tsCss(ts[`universeBody_${i}`])}
              >
                {c.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// SECTION: CTA — dark green, centered invitation
// ============================================================
export function AUCTA() {
  const { config } = useThemeConfig();
  const au = config.aboutUs!;
  const ts = au.textStyles ?? {};
  const { ref, visible } = useIntersect();

  return (
    <section className="au2-cta" ref={ref}>
      <div className={`au2-cta-inner ${visible ? "au2-visible" : ""}`}>
        <p className="au2-cta-eyebrow">The Beginning</p>
        <h2 className="au2-cta-headline" style={tsCss(ts["ctaTitle"])}>
          {au.ctaTitle}
        </h2>
        <p className="au2-cta-sub" style={tsCss(ts["ctaSubtitle"])}>
          {au.ctaSubtitle}
        </p>
        <div className="au2-cta-btns">
          {au.ctaPrimaryLabel && (
            <a href={au.ctaPrimaryLink} className="au2-btn au2-btn-white">
              {au.ctaPrimaryLabel}
            </a>
          )}
          {au.ctaSecondaryLabel && (
            <a href={au.ctaSecondaryLink} className="au2-btn au2-btn-outline">
              {au.ctaSecondaryLabel}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Section renderer map
// ============================================================
export const SECTION_MAP: Record<AboutUsSectionKey, React.FC> = {
  "au-hero": AUHero,
  "au-story": AUStory,
  "au-principles": AUPrinciples,
  "au-product-philosophy": AUPhilosophy,
  "au-stats": AUStats,
  "au-universe": AUUniverse,
  "au-cta": AUCTA,
};

// ============================================================
// Main AboutUs page
// ============================================================
