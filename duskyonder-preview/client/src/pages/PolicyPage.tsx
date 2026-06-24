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

// ---- Shopify Dynamic Policy Page ----
// Renders a page fetched live from Shopify by handle (e.g. "privacy-policy", "shipping-policy")
function ShopifyPolicyPage({ handle }: { handle: string }) {
  const { data: page, isLoading, error } = trpc.shopify.getPage.useQuery(
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

  if (!page || error) {
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

  const bodyHtml: string = page.body ?? "";
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
            <span>{page.title}</span>
          </nav>
          <h1 className="policy-hero-title">{page.title}</h1>
          {page.bodySummary && (
            <p className="policy-hero-subtitle">{page.bodySummary}</p>
          )}
        </div>
      </section>

      {/* Body */}
      <section className="policy-body-section">
        <div className={`policy-body-inner${headings.length > 0 ? " policy-body-inner--with-toc" : ""}`}>
          {/* Table of Contents */}
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

          {/* Page Content */}
          <div className="policy-content">
            <div
              className="policy-body-html"
              dangerouslySetInnerHTML={{ __html: bodyWithIds }}
            />
            {page.updatedAt && (
              <p className="policy-last-updated">
                Last updated: {new Date(page.updatedAt).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            )}
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
// When called with `pageKey`, renders the static config-based page (legacy routes).
// When called with `shopifyHandle`, fetches live content from Shopify by handle.
// When called with neither, derives the handle from the URL path.
interface PolicyPageProps {
  pageKey?: keyof PolicyPagesConfig;
  shopifyHandle?: string;
  showFaqs?: boolean;
  showHighlights?: boolean;
}

export default function PolicyPage({ pageKey, shopifyHandle, showFaqs, showHighlights }: PolicyPageProps) {
  const [location] = useLocation();

  // If a static pageKey is provided, use the legacy config-based renderer
  if (pageKey) {
    return <StaticPolicyPage pageKey={pageKey} showFaqs={showFaqs} showHighlights={showHighlights} />;
  }

  // Derive handle: explicit prop > URL path segment after /pages/
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

  return <ShopifyPolicyPage handle={handle} />;
}
