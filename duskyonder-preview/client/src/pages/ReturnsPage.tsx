import { Link } from "wouter";
import { useThemeConfig } from "@/contexts/ThemeConfigContext";
import { SFPromoBar, SFHeader, SFFooter } from "@/components/StorefrontShell";
import { heroPositionVars } from "@/lib/heroPosition";

// ---- Main Returns Page ----
export default function ReturnsPage() {
  const { config } = useThemeConfig();
  const rp = config.returnsPage!;

  const eligibleItems = rp.eligibilityItems.filter(e => e.eligible);
  const ineligibleItems = rp.eligibilityItems.filter(e => !e.eligible);

  const mailtoLink = `mailto:${rp.contactEmail}?subject=${encodeURIComponent(rp.emailSubject)}`;

  return (
    <div className="returns-page">
      <SFPromoBar />
      <SFHeader darkMode={false} />

      {/* Hero */}
      <section className="returns-hero" style={{ minHeight: rp.heroMinHeight ? `${rp.heroMinHeight}px` : undefined, ...heroPositionVars(rp.heroDesktopPosition, rp.heroMobilePosition) }}>
        <div className="returns-hero-inner">
          <nav className="policy-breadcrumb">
            <Link href="/">Home</Link>
            <span> / </span>
            <span>{rp.heroTitle}</span>
          </nav>
          <h1 className="returns-hero-title">{rp.heroTitle}</h1>
          <p className="returns-hero-subtitle">{rp.heroSubtitle}</p>
        </div>
      </section>

      {/* Policy Summary Banner */}
      <section className="returns-summary-banner">
        <div className="returns-summary-inner">
          <span className="returns-summary-icon">📋</span>
          <p className="returns-summary-text">{rp.policySummary}</p>
          <Link href="/pages/return-policy" className="returns-summary-link">View Full Policy →</Link>
        </div>
      </section>

      {/* Eligibility Check */}
      <section className="returns-eligibility-section">
        <div className="returns-eligibility-inner">
          <h2 className="returns-section-title">Before You Start</h2>
          <p className="returns-section-subtitle">Check if your item qualifies for a return or exchange.</p>
          <div className="returns-eligibility-grid">
            <div className="returns-eligibility-col returns-eligibility-col--yes">
              <h3 className="returns-eligibility-col-title">
                <span className="returns-eligibility-badge returns-eligibility-badge--yes">✓ Eligible</span>
              </h3>
              <ul className="returns-eligibility-list">
                {eligibleItems.map(item => (
                  <li key={item.id} className="returns-eligibility-item">
                    <span className="returns-eligibility-check">✓</span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
            <div className="returns-eligibility-col returns-eligibility-col--no">
              <h3 className="returns-eligibility-col-title">
                <span className="returns-eligibility-badge returns-eligibility-badge--no">✗ Not Eligible</span>
              </h3>
              <ul className="returns-eligibility-list">
                {ineligibleItems.map(item => (
                  <li key={item.id} className="returns-eligibility-item">
                    <span className="returns-eligibility-cross">✗</span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="returns-steps-section">
        <div className="returns-steps-inner">
          <h2 className="returns-section-title">How to Return</h2>
          <p className="returns-section-subtitle">Follow these steps to initiate your return or exchange.</p>
          <div className="returns-steps-list">
            {rp.steps.map((step, i) => (
              <div key={step.id} className="returns-step">
                <div className="returns-step-number">{i + 1}</div>
                <div className="returns-step-content">
                  <h3 className="returns-step-title">{step.title}</h3>
                  <p className="returns-step-desc">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="returns-cta-section">
        <div className="returns-cta-inner">
          <h2 className="returns-cta-title">Ready to Start Your Return?</h2>
          <p className="returns-cta-subtitle">Send us an email and our team will guide you through the process.</p>
          <a href={mailtoLink} className="returns-cta-btn">
            Email Us to Start Return →
          </a>
          <p className="returns-cta-note">Reply within 1–2 business days · {rp.contactEmail}</p>
        </div>
      </section>

      <SFFooter />
    </div>
  );
}
