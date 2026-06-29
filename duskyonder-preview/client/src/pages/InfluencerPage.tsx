import { useRef } from "react";
import { SFPromoBar, SFHeader, SFFooter } from "@/components/StorefrontShell";
import { useThemeConfig } from "@/contexts/ThemeConfigContext";
import type { InfluencerConfig } from "@/contexts/ThemeConfigContext";
import { tsStyle, useIntersect, StatsSection, CreatorCard } from "@/components/InfluencerComponents";

export default function InfluencerPage() {
  const { config } = useThemeConfig();
  const cfg = config.influencer ?? ({} as InfluencerConfig);

  const ts = (key: string) => tsStyle(cfg.textStyles?.[key]);
  const isVisible = (key: string) => cfg.textStyles?.[key]?.visible !== false;

  // Section refs for animation
  const heroRef = useRef<HTMLDivElement>(null);
  const creatorsRef = useRef<HTMLDivElement>(null);

  const heroVis = useIntersect(heroRef);
  const creatorsVis = useIntersect(creatorsRef);

  const perRow = cfg.creatorsPerRow ?? 4;
  // Use CSS variable injection so media queries can override on mobile
  const creatorsGridStyle = {
    "--creators-per-row": perRow,
  } as React.CSSProperties;
  const isFullWidth = cfg.heroFullWidth === true;

  return (
    <div className="inf-page storefront-wrapper">
      <SFPromoBar />
      <SFHeader darkMode={true} />

      {/* ===== HERO ===== */}
      <section
        className={`inf-hero${heroVis ? " inf-animate-in" : ""}${isFullWidth ? " inf-hero--fullwidth" : ""}`}
        style={{ background: cfg.heroBgColor ?? "#0D3D2B", color: cfg.heroTextColor ?? "#fff" }}
        ref={heroRef}
      >
        <div className={isFullWidth ? "inf-hero-inner-fw" : "inf-hero-inner"}>
          <div className="inf-hero-content">
            {isVisible("heroTag") && (
              <div className="inf-hero-tag" style={ts("heroTag")}>{cfg.heroTag}</div>
            )}
            {isVisible("heroTitle") && (
              <h1 className="inf-hero-title" style={ts("heroTitle")}>{cfg.heroTitle}</h1>
            )}
            {isVisible("heroSubtitle") && (
              <p className="inf-hero-subtitle" style={ts("heroSubtitle")}>{cfg.heroSubtitle}</p>
            )}
            <div className="inf-hero-btns">
              {isVisible("heroPrimaryBtn") && (
                <a
                  href="/pages/influencer/apply"
                  className="inf-hero-btn-primary"
                  style={ts("heroPrimaryBtn")}
                >
                  {cfg.heroPrimaryBtnLabel}
                </a>
              )}
              {isVisible("heroSecondaryBtn") && (
                <a href={cfg.heroSecondaryBtnLink ?? "#creators"} className="inf-hero-btn-secondary" style={ts("heroSecondaryBtn")}>
                  {cfg.heroSecondaryBtnLabel} ↓
                </a>
              )}
            </div>
          </div>
          {!isFullWidth && (
            <div className="inf-hero-visual">
              <div className="inf-hero-img-placeholder" />
            </div>
          )}
        </div>
      </section>

      {/* ===== STATS COUNTER BAR ===== */}
      {cfg.showStats !== false && cfg.statsItems && cfg.statsItems.length > 0 && (
        <StatsSection items={cfg.statsItems} />
      )}

      {/* ===== CREATORS ===== */}
      {cfg.showCreators !== false && (
        <section className={`inf-section inf-creators-section${creatorsVis ? " inf-animate-in" : ""}`} id="creators" ref={creatorsRef}>
          <div className="inf-section-inner">
            {isVisible("creatorsTitle") && (
              <h2 className="inf-section-title" style={ts("creatorsTitle")}>{cfg.creatorsTitle}</h2>
            )}
            {isVisible("creatorsSubtitle") && (
              <p className="inf-section-subtitle" style={ts("creatorsSubtitle")}>{cfg.creatorsSubtitle}</p>
            )}
            <div
              className="inf-creators-grid"
              style={creatorsGridStyle}
            >
              {(cfg.creators ?? []).map(creator => (
                <CreatorCard key={creator.id} creator={creator} cfg={cfg} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== APPLY CTA ===== */}
      <section className="inf-apply-cta-section" style={{ background: cfg.heroBgColor ?? "#0D3D2B" }}>
        <div className="inf-apply-cta-inner">
          <h2 className="inf-apply-cta-title" style={{ color: cfg.heroTextColor ?? "#fff" }}>
            Ready to Move With Us?
          </h2>
          <p className="inf-apply-cta-subtitle" style={{ color: cfg.heroTextColor ? `${cfg.heroTextColor}cc` : "rgba(255,255,255,0.8)" }}>
            Join our creator network and move with purpose.
          </p>
          <a href="/pages/influencer/apply" className="inf-apply-cta-btn">
            Apply Now →
          </a>
        </div>
      </section>

      <SFFooter />
    </div>
  );
}
