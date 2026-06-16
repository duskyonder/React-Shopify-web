import { SFPromoBar, SFHeader, SFFooter } from "@/components/StorefrontShell";
import { useThemeConfig } from "@/contexts/ThemeConfigContext";
import type { InfluencerConfig, InfluencerApplySectionKey } from "@/contexts/ThemeConfigContext";
import { SECTION_MAP } from "@/components/InfluencerApplySections";

export default function InfluencerApplyPage() {
  const { config } = useThemeConfig();
  const cfg = config.influencer ?? ({} as InfluencerConfig);

  const defaultSections = [
    { key: "ia-benefits" as InfluencerApplySectionKey, label: "合作权益", visible: true },
    { key: "ia-requirements" as InfluencerApplySectionKey, label: "申请要求", visible: true },
    { key: "ia-form" as InfluencerApplySectionKey, label: "申请表单", visible: true },
    { key: "ia-faq" as InfluencerApplySectionKey, label: "FAQ", visible: true },
    { key: "ia-footer-cta" as InfluencerApplySectionKey, label: "Footer CTA", visible: true },
  ];

  const sectionOrder = cfg.applyPageSectionOrder ?? defaultSections;
  const visibleSections = sectionOrder.filter(s => s.visible !== false);

  return (
    <div className="inf-page storefront-wrapper">
      <SFPromoBar />
      <SFHeader darkMode={true} />

      {/* ===== PAGE HERO ===== */}
      <section className="inf-apply-page-hero inf-apply-page-hero--light" style={{ background: "#FAF9F7" }}>
        <div className="inf-apply-page-hero-inner">
          <div className="inf-apply-page-breadcrumb">
            <a href="/pages/influencer">Creators</a>
            <span> / </span>
            <span>Apply</span>
          </div>
          <h1 className="inf-apply-page-title" style={{ color: cfg.heroTextColor ?? "#1a1a1a" }}>
            Join the Movement
          </h1>
          <p className="inf-apply-page-subtitle" style={{ color: cfg.heroTextColor ? `${cfg.heroTextColor}cc` : "#666" }}>
            Tell us about yourself and how you move.
          </p>
        </div>
      </section>

      {/* ===== DYNAMIC SECTIONS ===== */}
      {visibleSections.map(s => {
        const Component = SECTION_MAP[s.key];
        if (!Component) return null;
        return <Component key={s.key} cfg={cfg} />;
      })}

      <SFFooter />
    </div>
  );
}
