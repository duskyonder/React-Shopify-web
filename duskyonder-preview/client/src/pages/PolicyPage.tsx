import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useThemeConfig } from "@/contexts/ThemeConfigContext";
import type { PolicyPagesConfig, PolicyPageConfig } from "@/contexts/ThemeConfigContext";
import { SFPromoBar, SFHeader, SFFooter } from "@/components/StorefrontShell";
import { heroPositionVars } from "@/lib/heroPosition";
import { trpc } from "@/lib/trpc";

// ---- Table of Contents ----
function extractHeadings(html: string): { id: string; text: string; level: number }[] {
  const re = /<h([2-4])[^>]*>(.*?)<\/h[2-4]>/gi;
  const matches: RegExpExecArray[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) matches.push(m);
  return matches.map((m, i) => ({
    id: `heading-${i}`,
    text: m[2].replace(/<[^>]+>/g, ""),
    level: parseInt(m[1]),
  }));
}

// Policy key → field name in shop.policies response
type ShopPolicyKey = "privacyPolicy" | "termsOfService" | "refundPolicy" | "shippingPolicy";

// ---- Shopify Shop Policy Page ----
// Fetches all policies in one call via shop { privacyPolicy, termsOfService, ... }
// This reads from Shopify Admin > Settings > Policies — not the Pages list.
function ShopifyShopPolicyPage({ policyKey }: { policyKey: ShopPolicyKey }) {
  const { data: shop, isLoading, error } = trpc.shopify.getPolicies.useQuery(
    undefined,
    { staleTime: 10 * 60_000 }
  );

  if (isLoading) {
    return (
      <div className="policy-page">
        <SFPromoBar />
        <SFHeader darkMode={false} />
        <div style={{ padding: "80px 40px", textAlign: "center", color: "#888" }}>
          <p>Loading&hellip;</p>
        </div>
        <SFFooter />
      </div>
    );
  }

  const policy = shop?.[policyKey] as { title: string; body: string; url: string } | null | undefined;

  if (error || !policy) {
    return (
      <div className="policy-page">
        <SFPromoBar />
        <SFHeader darkMode={false} />
        <div style={{ padding: "80px 40px", textAlign: "center", color: "#888", maxWidth: 600, margin: "0 auto" }}>
          <p style={{ fontWeight: 600, marginBottom: 8 }}>Policy not found</p>
          <p style={{ fontSize: "0.9rem", marginBottom: 16 }}>
            No content for <strong>{policyKey}</strong> was found.<br />
            Add it in <strong>Shopify Admin &rarr; Settings &rarr; Policies</strong>.
          </p>
          <Link href="/" style={{ color: "#175C40", textDecoration: "underline" }}>Return home</Link>
        </div>
        <SFFooter />
      </div>
    );
  }

  const bodyHtml: string = policy.body ?? "";
  const headings = extractHeadings(bodyHtml);
  let _hIdx = 0;
  const bodyWithIds = bodyHtml.replace(
    /<h([2-4])([^>]*)>(.*?)<\/h[2-4]>/gi,
    (_, level, attrs, text) => {
      const idx = _hIdx++;
      return `<h${level}${attrs} id="heading-${idx}">${text}</h${level}>`;
    }
  );

  return (
    <div className="policy-page">
      <SFPromoBar />
      <SFHeader darkMode={false} />

      {/* Hero */}
      <section className="policy-hero" style={{ background: "#f7f5f2", color: "#1a1a1a" }}>
        <div className="policy-hero-inner">
          <nav className="policy-breadcrumb" style={{ color: "#888" }}>
            <Link href="/">Home</Link>
            <span> / </span>
            <span>{policy.title}</span>
          </nav>
          <h1 className="policy-hero-title">{policy.title}</h1>
        </div>
      </section>

      {/* Body */}
      <section className="policy-body-section">
        <div className={`policy-body-inner${headings.length > 0 ? " policy-body-inner--with-toc" : ""}`}>
          {headings.length > 0 && (
            <aside className="policy-toc">
              <h3 className="policy-toc-title">Contents</h3>
              <ul className="policy-toc-list">
                {headings.map(h => (
                  <li key={h.id} className={`policy-toc-item policy-toc-item--h${h.level}`}>
                    <a
                      href={`#${h.id}`}
                      onClick={e => {
                        e.preventDefault();
                        document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          )}
          <div className="policy-content">
            <div
              className="policy-body-html"
              dangerouslySetInnerHTML={{ __html: bodyWithIds }}
            />
          </div>
        </div>
      </section>

      <SFFooter />
    </div>
  );
}

// ---- Shopify Custom Page (generic /pages/:handle fetch) ----
// Used for non-policy custom pages created in Shopify Admin > Online Store > Pages
function ShopifyCustomPage({ handle }: { handle: string }) {
  const { data: page, isLoading } = trpc.shopify.getPage.useQuery(
    { handle },
    { staleTime: 5 * 60_000 }
  );

  if (isLoading) {
    return (
      <div className="policy-page">
        <SFPromoBar />
        <SFHeader darkMode={false} />
        <div style={{ padding: "80px 40px", textAlign: "center", color: "#888" }}>
          <p>Loading&hellip;</p>
        </div>
        <SFFooter />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="policy-page">
        <SFPromoBar />
        <SFHeader darkMode={false} />
        <div style={{ padding: "80px 40px", textAlign: "center", color: "#888" }}>
          <p>Page not found.</p>
          <Link href="/" style={{ color: "#175C40", textDecoration: "underline" }}>Return home</Link>
        </div>
        <SFFooter />
      </div>
    );
  }

  const bodyHtml: string = (page as any).body ?? "";
  const headings = extractHeadings(bodyHtml);
  let _hIdx = 0;
  const bodyWithIds = bodyHtml.replace(
    /<h([2-4])([^>]*)>(.*?)<\/h[2-4]>/gi,
    (_, level, attrs, text) => `<h${level}${attrs} id="heading-${_hIdx++}">${text}</h${level}>`
  );

  return (
    <div className="policy-page">
      <SFPromoBar />
      <SFHeader darkMode={false} />
      <section className="policy-hero" style={{ background: "#f7f5f2", color: "#1a1a1a" }}>
        <div className="policy-hero-inner">
          <nav className="policy-breadcrumb" style={{ color: "#888" }}>
            <Link href="/">Home</Link><span> / </span><span>{(page as any).title}</span>
          </nav>
          <h1 className="policy-hero-title">{(page as any).title}</h1>
        </div>
      </section>
      <section className="policy-body-section">
        <div className={`policy-body-inner${headings.length > 0 ? " policy-body-inner--with-toc" : ""}`}>
          {headings.length > 0 && (
            <aside className="policy-toc">
              <h3 className="policy-toc-title">Contents</h3>
              <ul className="policy-toc-list">
                {headings.map(h => (
                  <li key={h.id} className={`policy-toc-item policy-toc-item--h${h.level}`}>
                    <a href={`#${h.id}`} onClick={e => { e.preventDefault(); document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" }); }}>{h.text}</a>
                  </li>
                ))}
              </ul>
            </aside>
          )}
          <div className="policy-content">
            <div className="policy-body-html" dangerouslySetInnerHTML={{ __html: bodyWithIds }} />
          </div>
        </div>
      </section>
      <SFFooter />
    </div>
  );
}

// ---- Static Config-based Policy Page (legacy) ----
interface StaticPolicyPageProps {
  pageKey: keyof PolicyPagesConfig;
  showFaqs?: boolean;
  showHighlights?: boolean;
}

function StaticPolicyPage({ pageKey, showFaqs, showHighlights }: StaticPolicyPageProps) {
  const { config } = useThemeConfig();
  const pp = config.policyPages!;
  const page = pp[pageKey];
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const headings = page.showToc ? extractHeadings(page.bodyHtml) : [];

  let _hIdx = 0;
  const bodyWithIds = page.bodyHtml.replace(
    /<h([2-4])([^>]*)>(.*?)<\/h[2-4]>/gi,
    (_, level, attrs, text) => {
      const idx = _hIdx++;
      return `<h${level}${attrs} id="heading-${idx}">${text}</h${level}>`;
    }
  );

  return (
    <div className="policy-page">
      <SFPromoBar />
      <SFHeader darkMode={false} />

      {/* Hero */}
      <section
        className="policy-hero"
        style={{
          background: page.heroBgColor,
          color: page.heroTextColor,
          minHeight: page.heroMinHeight ? `${page.heroMinHeight}px` : undefined,
          ...heroPositionVars(page.heroDesktopPosition, page.heroMobilePosition),
        }}
      >
        <div className="policy-hero-inner">
          <nav className="policy-breadcrumb" style={{ color: page.heroTextColor + "99" }}>
            <Link href="/">Home</Link>
            <span> / </span>
            <span>{page.heroTitle}</span>
          </nav>
          <h1 className="policy-hero-title">{page.heroTitle}</h1>
          <p className="policy-hero-subtitle">{page.heroSubtitle}</p>
        </div>
      </section>

      {/* Highlights (shipping page) */}
      {showHighlights && (page.highlights ?? []).length > 0 && (
        <section className="policy-highlights">
          <div className="policy-highlights-inner">
            {(page.highlights ?? []).map(hl => (
              <div key={hl.id} className="policy-highlight-card">
                <span className="policy-highlight-icon">{hl.icon}</span>
                <h3 className="policy-highlight-title">{hl.title}</h3>
                <p className="policy-highlight-desc">{hl.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Body */}
      <section className="policy-body-section">
        <div className={`policy-body-inner${page.showToc && headings.length > 0 ? " policy-body-inner--with-toc" : ""}`}>
          {page.showToc && headings.length > 0 && (
            <aside className="policy-toc">
              <h3 className="policy-toc-title">Contents</h3>
              <ul className="policy-toc-list">
                {headings.map(h => (
                  <li key={h.id} className={`policy-toc-item policy-toc-item--h${h.level}`}>
                    <a href={`#${h.id}`} onClick={e => {
                      e.preventDefault();
                      document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}>{h.text}</a>
                  </li>
                ))}
              </ul>
            </aside>
          )}

          <div className="policy-content">
            <div className="policy-shopify-note">
              <span>ℹ️</span>
              <span>After installing this theme in Shopify, this content will automatically sync from your Shopify Admin policy settings.</span>
            </div>
            <div
              className="policy-body-html"
              dangerouslySetInnerHTML={{ __html: bodyWithIds }}
            />
          </div>
        </div>
      </section>

      {/* FAQs (return policy) */}
      {showFaqs && (page.faqs ?? []).length > 0 && (
        <section className="policy-faqs-section">
          <div className="policy-faqs-inner">
            <h2 className="policy-faqs-title">Frequently Asked Questions</h2>
            <div className="policy-faqs-list">
              {(page.faqs ?? []).map(faq => (
                <div key={faq.id} className={`policy-faq-item${openFaq === faq.id ? " open" : ""}`}>
                  <button
                    className="policy-faq-question"
                    onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  >
                    <span>{faq.question}</span>
                    <svg className="policy-faq-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                  {openFaq === faq.id && (
                    <div className="policy-faq-answer">{faq.answer}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      {page.ctaLabel && page.ctaLink && (
        <section className="policy-cta-section">
          <Link href={page.ctaLink} className="policy-cta-btn">{page.ctaLabel} →</Link>
        </section>
      )}

      <SFFooter />
    </div>
  );
}

// ---- Public Export ----
// policyKey  → fetch from shop.policies (Shopify Settings > Policies)
// pageKey    → legacy static config renderer
// neither    → derive handle from URL and fetch as a custom Page
interface PolicyPageProps {
  policyKey?: ShopPolicyKey;
  pageKey?: keyof PolicyPagesConfig;
  shopifyHandle?: string;
  showFaqs?: boolean;
  showHighlights?: boolean;
}

export default function PolicyPage({ policyKey, pageKey, shopifyHandle, showFaqs, showHighlights }: PolicyPageProps) {
  const [location] = useLocation();

  // Shop-level policy (Settings > Policies) — primary path for legal pages
  if (policyKey) {
    return <ShopifyShopPolicyPage policyKey={policyKey} />;
  }

  // Legacy static config renderer (kept for backward compat)
  if (pageKey) {
    return <StaticPolicyPage pageKey={pageKey} showFaqs={showFaqs} showHighlights={showHighlights} />;
  }

  // Generic custom-page catch-all: derive handle from URL
  const handle = shopifyHandle ?? location.match(/\/pages\/([^/?#]+)/)?.[1] ?? "";

  if (!handle) {
    return (
      <div className="policy-page">
        <SFPromoBar />
        <SFHeader darkMode={false} />
        <div style={{ padding: "80px 40px", textAlign: "center", color: "#888" }}>
          <p>Page not found.</p>
        </div>
        <SFFooter />
      </div>
    );
  }

  // Fall back to custom-page fetch for non-policy /pages/* routes
  return <ShopifyCustomPage handle={handle} />;
}
