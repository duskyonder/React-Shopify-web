import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { trpc } from "@/lib/trpc";
import { useThemeConfig } from "@/contexts/ThemeConfigContext";
import type { AboutUsTextStyle, AboutUsSectionKey } from "@/contexts/ThemeConfigContext";
import { heroPositionVars } from "@/lib/heroPosition";

export function useIntersect(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
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
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 60); return () => clearTimeout(t); }, []);

  return (
    <section
      className="au2-hero"
      style={{
        background: au.heroBgUrl
          ? `url(${au.heroBgUrl}) center/cover no-repeat`
          : "#FAF8F4",
        minHeight: au.heroMinHeight ? `${au.heroMinHeight}px` : undefined,
        ...heroPositionVars(au.heroDesktopPosition, au.heroMobilePosition),
      }}
    >
      <div className={`au2-hero-inner ${loaded ? "au2-visible" : ""}`}>
        <p className="au2-hero-eyebrow" style={tsCss(ts["heroEst"])}>{au.heroEst}</p>
        <h1 className="au2-hero-headline" style={tsCss(ts["heroHeadline"])}>{au.heroHeadline}</h1>
        <p className="au2-hero-subtitle" style={tsCss(ts["heroSubtitle"])}>{au.heroSubtitle}</p>
      </div>
      <div className="au2-scroll-hint">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12l7 7 7-7" stroke="rgba(13,61,43,0.45)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
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
    <section className="au2-story" ref={ref} style={{ "--story-img-aspect": au.storyImageAspect ?? "3/4" } as React.CSSProperties}>
      <div className={`au2-story-grid ${visible ? "au2-visible" : ""}`}>
        <div className="au2-story-text">
          <span className="au2-eyebrow" style={tsCss(ts["storyTag"])}>{au.storyTag}</span>
          <h2 className="au2-section-h2" style={tsCss(ts["storyTitle"])}>{au.storyTitle}</h2>
          {au.storyParagraphs.map((p, i) => (
            <p key={i} className="au2-body" style={{ transitionDelay: `${i * 60}ms`, ...tsCss(ts[`storyParagraph_${i}`]) }}>{p}</p>
          ))}
        </div>
        <div className="au2-story-img-wrap">
          {au.storyImageUrl ? (
            <img src={au.storyImageUrl} alt="Brand Story" className="au2-story-img" loading="lazy" />
          ) : (
            <div className="au2-img-placeholder"><span>品牌故事图片</span></div>
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
          <span className="au2-eyebrow-light" style={tsCss(ts["principlesTag"])}>{au.principlesTag}</span>
          <h2 className="au2-section-h2-light" style={tsCss(ts["principlesTitle"])}>{au.principlesTitle}</h2>
        </div>
        <div className="au2-principles-list">
          {au.principles.map((p, i) => (
            <div key={p.id} className="au2-principle-row" style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="au2-principle-num">{p.number}</div>
              <div className="au2-principle-sep" />
              <div className="au2-principle-content">
                <div className="au2-principle-title-row">
                  <span className="au2-principle-en" style={tsCss(ts[`principleTitle_${i}`])}>{p.title}</span>
                  <span className="au2-principle-zh" style={tsCss(ts[`principleSubtitle_${i}`])}>{p.subtitle}</span>
                </div>
                <p className="au2-principle-body" style={tsCss(ts[`principleBody_${i}`])}>{p.body}</p>
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
    <section className="au2-philosophy" ref={ref} style={{ "--philosophy-img-aspect": au.philosophyImageAspect ?? "4/5" } as React.CSSProperties}>
      <div className={`au2-philosophy-grid ${visible ? "au2-visible" : ""}`}>
        <div className="au2-philosophy-img-wrap">
          {au.philosophyImageUrl ? (
            <img src={au.philosophyImageUrl} alt="Product Philosophy" className="au2-philosophy-img" loading="lazy" />
          ) : (
            <div className="au2-img-placeholder"><span>产品哲学图片</span></div>
          )}
        </div>
        <div className="au2-philosophy-text">
          <span className="au2-eyebrow" style={tsCss(ts["philosophyTag"])}>{au.philosophyTag}</span>
          <h2 className="au2-section-h2" style={tsCss(ts["philosophyTitle"])}>{au.philosophyTitle}</h2>
          <p className="au2-body" style={tsCss(ts["philosophyBody"])}>{au.philosophyBody}</p>
          <ol className="au2-philosophy-list">
            {au.philosophyPoints.map((pt, i) => (
              <li key={i} style={tsCss(ts[`philosophyPoint_${i}`])}>
                <span className="au2-philosophy-li-num">{String(i + 1).padStart(2, "0")}.</span>
                <span>{pt}</span>
              </li>
            ))}
          </ol>
{/* Explore Our Fabrics link — hidden */}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// SECTION: Stats — horizontal rule + numbers
// NOTE: Hidden temporarily — uncomment to re-enable once verified
// ============================================================
export function AUStats() {
  // HIDDEN: return null to suppress rendering until data is verified
  return null;
  /* Original stats section — uncomment body below to restore:
  const { config } = useThemeConfig();
  const au = config.aboutUs!;
  const ts = au.textStyles ?? {};
  const { ref, visible } = useIntersect();

  return (
    <section className="au2-stats" ref={ref}>
      <div className={`au2-stats-inner ${visible ? "au2-visible" : ""}`}>
        {au.stats.map((s, i) => (
          <div key={s.id} className="au2-stat-item" style={{ transitionDelay: `${i * 60}ms` }}>
            <div className="au2-stat-value" style={tsCss(ts[`statValue_${i}`])}>{s.value}</div>
            <div className="au2-stat-label" style={tsCss(ts[`statLabel_${i}`])}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
  */
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
          <span className="au2-eyebrow" style={tsCss(ts["universeTag"])}>{au.universeTag}</span>
          <h2 className="au2-section-h2" style={tsCss(ts["universeTitle"])}>{au.universeTitle}</h2>
        </div>
        <div className="au2-universe-grid">
          {au.universeCards.map((c, i) => (
            <div key={c.id} className="au2-universe-card" style={{ transitionDelay: `${i * 70}ms` }}>
              <div className="au2-universe-card-top">
                <span className="au2-universe-num">{c.number}</span>
                <span className="au2-universe-module" style={tsCss(ts[`universeModule_${i}`])}>{c.module}</span>
              </div>
              <div className="au2-universe-sep" />
              <h3 className="au2-universe-title" style={tsCss(ts[`universeTitle_${i}`])}>{c.title}</h3>
              <p className="au2-universe-body" style={tsCss(ts[`universeBody_${i}`])}>{c.body}</p>
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
  const [nlOpen, setNlOpen] = useState(false);
  const [nlEmail, setNlEmail] = useState("");
  const [nlSubmitted, setNlSubmitted] = useState(false);
  const [nlError, setNlError] = useState("");
  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => { setNlSubmitted(true); setNlError(""); },
    onError: () => { setNlError("Something went wrong. Please try again."); },
  });
  const handleSubscribe = () => {
    if (!nlEmail) return;
    setNlError("");
    subscribeMutation.mutate({ email: nlEmail, source: "about-cta" });
  };

  const isDark = (config.newsletterTheme ?? "dark-green") === "dark-green";
  const bgColor = isDark ? "#0D3D2B" : "#FAF8F4";
  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const mutedColor = isDark ? "rgba(255,255,255,0.65)" : "#666";
  const inputBorder = isDark ? "rgba(255,255,255,0.25)" : "#d0ccc7";
  const inputBg = isDark ? "rgba(255,255,255,0.08)" : "#FFFFFF";
  const inputColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const btnBg = isDark ? "#FFFFFF" : "#0D3D2B";
  const btnColor = isDark ? "#0D3D2B" : "#FFFFFF";
  const closeBg = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)";
  const closeColor = isDark ? "#FFFFFF" : "#1A1A1A";

  const nlModal = nlOpen ? ReactDOM.createPortal(
    <div
      className="sf-nl-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) { setNlOpen(false); setNlSubmitted(false); setNlEmail(""); } }}
    >
      <div className="sf-nl-modal" style={{ background: bgColor }}>
        {/* Left image panel */}
        {config.newsletterImageUrl ? (
          <div className="sf-nl-image-panel">
            <img src={config.newsletterImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        ) : (
          <div className="sf-nl-image-panel sf-nl-image-panel--placeholder" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", opacity: 0.5 }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: isDark ? "#fff" : "#0D3D2B" }}>
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="currentColor" />
              </svg>
              <span style={{ fontSize: "0.7rem", color: isDark ? "#fff" : "#0D3D2B", letterSpacing: "0.1em", textTransform: "uppercase" }}>Add Image</span>
            </div>
          </div>
        )}
        {/* Right content panel */}
        <div className="sf-nl-content-panel">
          <button
            className="sf-nl-close"
            onClick={() => { setNlOpen(false); setNlSubmitted(false); setNlEmail(""); }}
            style={{ background: closeBg, color: closeColor }}
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div className="sf-nl-tag" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#175C40", borderColor: isDark ? "rgba(255,255,255,0.2)" : "#175C40" }}>DUSKYONDER</div>
          <h2 className="sf-nl-title" style={{ color: textColor }}>{config.newsletterTitle}</h2>
          <p className="sf-nl-subtitle" style={{ color: mutedColor }}>{config.newsletterText}</p>
          {nlSubmitted ? (
            <div className="sf-nl-success" style={{ color: isDark ? "#7ECBA8" : "#175C40" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
              <span>Thank you! Welcome to the club.</span>
            </div>
          ) : (
            <div className="sf-nl-form">
              <input
                type="email"
                className="sf-nl-input"
                placeholder="Your email address"
                value={nlEmail}
                onChange={(e) => setNlEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && nlEmail) handleSubscribe(); }}
                style={{ background: inputBg, border: `1.5px solid ${inputBorder}`, color: inputColor }}
              />
              {nlError && <p style={{ color: "#e55", fontSize: "0.78rem", marginTop: 4 }}>{nlError}</p>}
              <button
                className="sf-nl-btn"
                style={{ background: btnBg, color: btnColor, opacity: subscribeMutation.isPending ? 0.7 : 1 }}
                onClick={handleSubscribe}
                disabled={subscribeMutation.isPending}
              >
                {subscribeMutation.isPending ? "Subscribing…" : "Join the Club →"}
              </button>
            </div>
          )}
          {config.newsletterSocialProof && (
            <p className="sf-nl-proof" style={{ color: mutedColor }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ display: "inline", verticalAlign: "middle", marginRight: "5px" }}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {config.newsletterSocialProof}
            </p>
          )}
          <p className="sf-nl-privacy" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#aaa" }}>No spam, ever. Unsubscribe anytime.</p>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <section className="au2-cta" ref={ref}>
        <div className={`au2-cta-inner ${visible ? "au2-visible" : ""}`}>
          <p className="au2-cta-eyebrow">The Beginning</p>
          <h2 className="au2-cta-headline" style={tsCss(ts["ctaTitle"])}>{au.ctaTitle}</h2>
          <p className="au2-cta-sub" style={tsCss(ts["ctaSubtitle"])}>{au.ctaSubtitle}</p>
          <div className="au2-cta-btns">
            {au.ctaPrimaryLabel && (
              <a href="/collections/new-arrivals" className="au2-btn au2-btn-white">{au.ctaPrimaryLabel}</a>
            )}
            {au.ctaSecondaryLabel && (
              <button
                type="button"
                className="au2-btn au2-btn-outline"
                onClick={() => { setNlOpen(true); setNlSubmitted(false); setNlEmail(""); }}
              >
                {au.ctaSecondaryLabel}
              </button>
            )}
          </div>
        </div>
      </section>
      {nlModal}
    </>
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
