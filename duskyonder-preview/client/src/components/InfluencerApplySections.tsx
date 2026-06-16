import { useState, useRef, useEffect } from "react";
import { useThemeConfig } from "@/contexts/ThemeConfigContext";
import type {
  InfluencerConfig,
  InfluencerTextStyle,
  InfluencerApplySectionKey,
  InfluencerBenefit,
  InfluencerRequirement,
  InfluencerFormField,
  InfluencerFaqItem,
} from "@/contexts/ThemeConfigContext";

export function tsStyle(style?: InfluencerTextStyle): React.CSSProperties {
  if (!style) return {};
  return {
    fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
    color: style.color,
    maxWidth: style.maxWidth,
  };
}

export function useIntersect(ref: React.RefObject<Element | null>) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return visible;
}

// ---- FAQ Item ----
export function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`inf-faq-item${open ? " open" : ""}`}>
      <button className="inf-faq-question" onClick={() => setOpen(!open)}>
        <span>{question}</span>
        <span className="inf-faq-chevron">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="inf-faq-answer">{answer}</div>}
    </div>
  );
}

// ---- Form Field Renderer ----
export function FormField({ field }: { field: InfluencerConfig["formFields"][0] }) {
  const [selected, setSelected] = useState<string[]>([]);
  if (!field.visible) return null;

  if (field.type === "text" || field.type === "email") {
    return (
      <div className="inf-form-field">
        <label className="inf-form-label">{field.label}{field.required && <span className="inf-form-required">*</span>}</label>
        <input type={field.type} className="inf-form-input" placeholder={field.placeholder} required={field.required} />
      </div>
    );
  }
  if (field.type === "textarea") {
    return (
      <div className="inf-form-field inf-form-field-full">
        <label className="inf-form-label">{field.label}{field.required && <span className="inf-form-required">*</span>}</label>
        <textarea className="inf-form-textarea" placeholder={field.placeholder} required={field.required} rows={4} />
      </div>
    );
  }
  if (field.type === "select") {
    return (
      <div className="inf-form-field">
        <label className="inf-form-label">{field.label}{field.required && <span className="inf-form-required">*</span>}</label>
        <select className="inf-form-select" required={field.required}>
          <option value="">{field.placeholder ?? "Select..."}</option>
          {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
    );
  }
  if (field.type === "multiselect") {
    return (
      <div className="inf-form-field inf-form-field-full">
        <label className="inf-form-label">{field.label}</label>
        <div className="inf-form-multiselect">
          {field.options?.map(opt => (
            <button
              key={opt}
              type="button"
              className={`inf-form-chip${selected.includes(opt) ? " selected" : ""}`}
              onClick={() => setSelected(prev => prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt])}
            >{opt}</button>
          ))}
        </div>
      </div>
    );
  }
  if (field.type === "file") {
    return (
      <div className="inf-form-field inf-form-field-full">
        <label className="inf-form-label">{field.label}</label>
        <div className="inf-form-file-area">
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" />
          <span>{field.placeholder ?? "Upload file"}</span>
        </div>
      </div>
    );
  }
  return null;
}

// ---- Section renderers ----
export function BenefitsSection({ cfg }: { cfg: InfluencerConfig }) {
  const ref = useRef<HTMLDivElement>(null);
  const vis = useIntersect(ref);
  const ts = (key: string) => tsStyle(cfg.textStyles?.[key]);
  const isVisible = (key: string) => cfg.textStyles?.[key]?.visible !== false;
  return (
    <section className={`inf-section inf-benefits-section inf-benefits-section--minimal${vis ? " inf-animate-in" : ""}`} ref={ref}>
      <div className="inf-section-inner">
        {isVisible("benefitsTitle") && (
          <h2 className="inf-section-title inf-apply-section-title" style={ts("benefitsTitle")}>{cfg.benefitsTitle}</h2>
        )}
        {isVisible("benefitsSubtitle") && (
          <p className="inf-section-subtitle" style={ts("benefitsSubtitle")}>{cfg.benefitsSubtitle}</p>
        )}
        <div className="inf-benefits-grid">
          {(cfg.benefits ?? []).filter(b => b.visible !== false).map((b, i) => (
            <div className="inf-benefit-card" key={b.id} style={{ animationDelay: `${i * 60}ms` }}>
              <div className="inf-benefit-icon">{b.icon}</div>
              {isVisible(`benefitTitle_${b.id}`) && (
                <div className="inf-benefit-title" style={ts(`benefitTitle_${b.id}`)}>{b.title}</div>
              )}
              {isVisible(`benefitDesc_${b.id}`) && (
                <div className="inf-benefit-desc" style={ts(`benefitDesc_${b.id}`)}>{b.description}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RequirementsSection({ cfg }: { cfg: InfluencerConfig }) {
  const ref = useRef<HTMLDivElement>(null);
  const vis = useIntersect(ref);
  const ts = (key: string) => tsStyle(cfg.textStyles?.[key]);
  const isVisible = (key: string) => cfg.textStyles?.[key]?.visible !== false;
  return (
    <section
      className={`inf-section inf-req-section inf-req-section--minimal${vis ? " inf-animate-in" : ""}`}
      ref={ref}
      style={{
        paddingTop: cfg.reqSectionPaddingY ?? 60,
        paddingBottom: cfg.reqSectionPaddingY ?? 60,
        paddingLeft: cfg.reqSectionPaddingX ?? 24,
        paddingRight: cfg.reqSectionPaddingX ?? 24,
      }}
    >
      <div className="inf-section-inner" style={{ maxWidth: cfg.reqSectionMaxWidth ?? 1100 }}>
        {isVisible("requirementsTitle") && (
          <h2 className="inf-section-title inf-apply-section-title" style={ts("requirementsTitle")}>{cfg.requirementsTitle}</h2>
        )}
        <div className="inf-req-grid">
          <div className="inf-req-col">
            {isVisible("requirementsLeftTitle") && (
              <h3 className="inf-req-col-title" style={ts("requirementsLeftTitle")}>{cfg.requirementsLeftTitle}</h3>
            )}
            <ul className="inf-req-list">
              {(cfg.requirementsLeft ?? []).filter(r => r.visible !== false).map(r => (
                <li key={r.id} className="inf-req-item">
                  <span className="inf-req-check">✓</span>
                  <span>{r.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="inf-req-col">
            {isVisible("requirementsRightTitle") && (
              <h3 className="inf-req-col-title" style={ts("requirementsRightTitle")}>{cfg.requirementsRightTitle}</h3>
            )}
            <ul className="inf-req-list">
              {(cfg.requirementsRight ?? []).filter(r => r.visible !== false).map(r => (
                <li key={r.id} className="inf-req-item">
                  <span className="inf-req-check">✓</span>
                  <span>{r.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FormSection({ cfg }: { cfg: InfluencerConfig }) {
  const ref = useRef<HTMLDivElement>(null);
  const vis = useIntersect(ref);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const ts = (key: string) => tsStyle(cfg.textStyles?.[key]);
  const isVisible = (key: string) => cfg.textStyles?.[key]?.visible !== false;
  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormSubmitted(true);
  }
  return (
    <section className={`inf-section inf-form-section inf-form-section--minimal${vis ? " inf-animate-in" : ""}`} id="apply" ref={ref}>
      <div className="inf-section-inner">
        {isVisible("formTitle") && (
          <h2 className="inf-section-title inf-apply-section-title" style={ts("formTitle")}>{cfg.formTitle}</h2>
        )}
        {isVisible("formSubtitle") && (
          <p className="inf-section-subtitle" style={ts("formSubtitle")}>{cfg.formSubtitle}</p>
        )}
        {formSubmitted ? (
          <div className="inf-form-success">
            <div className="inf-form-success-icon">✓</div>
            <h3>Application Received!</h3>
            <p>Thank you for applying. We'll review your profile and get back to you within 5–7 business days.</p>
          </div>
        ) : (
          <form className="inf-form" onSubmit={handleFormSubmit}>
            <div className="inf-form-grid">
              {(cfg.formFields ?? []).map(field => (
                <FormField key={field.id} field={field} />
              ))}
            </div>
            {isVisible("formBtn") && (
              <button type="submit" className="inf-form-submit" style={ts("formBtn")}>
                {cfg.formBtnLabel}
              </button>
            )}
          </form>
        )}
      </div>
    </section>
  );
}

export function FaqSection({ cfg }: { cfg: InfluencerConfig }) {
  const ref = useRef<HTMLDivElement>(null);
  const vis = useIntersect(ref);
  const ts = (key: string) => tsStyle(cfg.textStyles?.[key]);
  const isVisible = (key: string) => cfg.textStyles?.[key]?.visible !== false;
  return (
    <section className={`inf-section inf-faq-section inf-faq-section--minimal${vis ? " inf-animate-in" : ""}`} ref={ref}>
      <div className="inf-section-inner inf-faq-inner">
        {isVisible("faqTitle") && (
          <h2 className="inf-section-title inf-apply-section-title" style={ts("faqTitle")}>{cfg.faqTitle}</h2>
        )}
        <div className="inf-faq-list">
          {(cfg.faqItems ?? []).filter(f => f.visible !== false).map(f => (
            <FaqItem key={f.id} question={f.question} answer={f.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function FooterCtaSection({ cfg }: { cfg: InfluencerConfig }) {
  const ts = (key: string) => tsStyle(cfg.textStyles?.[key]);
  const isVisible = (key: string) => cfg.textStyles?.[key]?.visible !== false;
  return (
    <section className="inf-footer-cta" style={{ background: cfg.heroBgColor ?? "#0D3D2B" }}>
      <div className="inf-footer-cta-inner">
        {isVisible("footerCtaTitle") && (
          <h2 className="inf-footer-cta-title" style={ts("footerCtaTitle")}>{cfg.footerCtaTitle}</h2>
        )}
        {isVisible("footerCtaSubtitle") && (
          <p className="inf-footer-cta-subtitle" style={ts("footerCtaSubtitle")}>{cfg.footerCtaSubtitle}</p>
        )}
        <div className="inf-footer-cta-btns">
          {isVisible("footerCtaPrimaryBtn") && (
            <a href={cfg.footerCtaPrimaryLink ?? "#"} className="inf-footer-cta-btn-primary" style={ts("footerCtaPrimaryBtn")}>
              {cfg.footerCtaPrimaryLabel}
            </a>
          )}
          {isVisible("footerCtaSecondaryBtn") && (
            <a href={cfg.footerCtaSecondaryLink ?? "/pages/blog"} className="inf-footer-cta-btn-secondary" style={ts("footerCtaSecondaryBtn")}>
              {cfg.footerCtaSecondaryLabel}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

// ---- Section map ----
export const SECTION_MAP: Record<InfluencerApplySectionKey, React.ComponentType<{ cfg: InfluencerConfig }>> = {
  "ia-benefits": BenefitsSection,
  "ia-requirements": RequirementsSection,
  "ia-form": FormSection,
  "ia-faq": FaqSection,
  "ia-footer-cta": FooterCtaSection,
};

// ---- Editor Primitives ----
