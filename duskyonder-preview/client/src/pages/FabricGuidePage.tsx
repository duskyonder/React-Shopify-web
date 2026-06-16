import { useThemeConfig } from "@/contexts/ThemeConfigContext";
import type { FabricItem } from "@/contexts/ThemeConfigContext";
import { SFPromoBar, SFHeader, SFFooter } from "@/components/StorefrontShell";
import { heroPositionVars } from "@/lib/heroPosition";

// ---- Fabric Card ----
function FabricCard({ fab }: { fab: FabricItem }) {
  const fabColor = fab.color ?? "#B8D4C8";
  const isLight = fabColor === "#ffffff" || fabColor === "#f5f5f5" || parseInt(fabColor.slice(1), 16) > 0xaaaaaa;
  const textColor = isLight ? "#1a1a1a" : "#ffffff";

  return (
    <div className="fabric-card" style={{ background: fabColor }}>
      <div className="fabric-card-inner">
        <h3 className="fabric-card-name" style={{ color: textColor }}>{fab.name}</h3>
        <p className="fabric-card-composition" style={{ color: textColor + "cc" }}>{fab.composition}</p>
        <div className="fabric-card-tags">
          {fab.tags.map(tag => (
            <span key={tag} className="fabric-card-tag" style={{ color: textColor, borderColor: textColor + "66" }}>{tag}</span>
          ))}
        </div>
        <p className="fabric-card-scene" style={{ color: textColor + "99" }}>
          <span style={{ marginRight: "4px" }}>🏃</span> {fab.scene}
        </p>
        {fab.description && (
          <p className="fabric-card-desc" style={{ color: textColor + "bb" }}>{fab.description}</p>
        )}
      </div>
    </div>
  );
}

// ---- Main Fabric Guide Page ----
export default function FabricGuidePage() {
  const { config } = useThemeConfig();
  const fg = config.fabricGuidePage!;

  return (
    <div className="fabric-guide-page">
      <SFPromoBar />
      <SFHeader darkMode={false} />

      {/* Hero */}
      <section
        className="fabric-hero"
        style={{ background: fg.heroBgColor, color: fg.heroTextColor, minHeight: fg.heroMinHeight ? `${fg.heroMinHeight}px` : undefined, ...heroPositionVars(fg.heroDesktopPosition, fg.heroMobilePosition) }}
      >
        <div className="fabric-hero-inner">
          <p className="fabric-hero-eyebrow">DUSKYONDER × MATERIALS</p>
          <h1 className="fabric-hero-title">{fg.heroTitle}</h1>
          <p className="fabric-hero-subtitle">{fg.heroSubtitle}</p>
        </div>
      </section>

      {/* Intro */}
      <section className="fabric-intro-section">
        <div className="fabric-intro-inner">
          <p className="fabric-intro-text">{fg.intro}</p>
        </div>
      </section>

      {/* Fabric Cards Grid */}
      <section className="fabric-cards-section">
        <div className="fabric-cards-inner">
          <h2 className="fabric-cards-title">Our Fabrics</h2>
          <div className="fabric-cards-grid">
            {fg.fabrics.map(fab => (
              <FabricCard key={fab.id} fab={fab} />
            ))}
          </div>
        </div>
      </section>

      {/* Care Guide */}
      {fg.careItems.length > 0 && (
        <section className="fabric-care-section">
          <div className="fabric-care-inner">
            <h2 className="fabric-care-title">Care Instructions</h2>
            <p className="fabric-care-subtitle">Proper care extends the life of your activewear and keeps it performing at its best.</p>
            <div className="fabric-care-grid">
              {fg.careItems.map(care => (
                <div key={care.id} className="fabric-care-item">
                  <span className="fabric-care-icon">{care.icon}</span>
                  <p className="fabric-care-text">{care.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sustainability Note */}
      {fg.showSustainability && fg.sustainabilityText && (
        <section className="fabric-sustainability-section">
          <div className="fabric-sustainability-inner">
            <span className="fabric-sustainability-icon">🌿</span>
            <h3 className="fabric-sustainability-title">{fg.sustainabilityTitle}</h3>
            <p className="fabric-sustainability-text">{fg.sustainabilityText}</p>
          </div>
        </section>
      )}

      <SFFooter />
    </div>
  );
}
