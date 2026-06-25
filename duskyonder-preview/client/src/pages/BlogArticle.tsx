import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link, useParams } from "wouter";
import { SFHeader, SFFooter, SFPromoBar } from "@/components/StorefrontShell";
import { useThemeConfig } from "@/contexts/ThemeConfigContext";
import { type BlogArticle } from "../../../shared/mockBlogData";
import { trpc } from "@/lib/trpc";

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function extractToc(html: string): TocItem[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const headings = doc.querySelectorAll("h2, h3");
  const items: TocItem[] = [];
  headings.forEach((h, i) => {
    const id = h.id || `heading-${i}`;
    items.push({
      id,
      text: h.textContent ?? "",
      level: parseInt(h.tagName[1]),
    });
  });
  return items;
}

// Inject IDs into headings in the rendered HTML
function injectHeadingIds(html: string): string {
  let counter = 0;
  return html.replace(/<(h[23])[^>]*>(.*?)<\/h[23]>/gi, (match, tag, text) => {
    const id = `heading-${counter++}`;
    const cleanText = text.replace(/<[^>]+>/g, "");
    return `<${tag} id="${id}">${cleanText}</${tag}>`;
  });
}

// ── TOC Sidebar ─────────────────────────────────────────────────────────────

interface TocSidebarProps {
  items: TocItem[];
  activeId: string;
}

function TocSidebar({ items, activeId }: TocSidebarProps) {
  if (items.length === 0) return null;

  return (
    <nav className="blog-article-toc" aria-label="Table of contents">
      <p className="blog-article-toc-title">In This Article</p>
      <ul className="blog-article-toc-list">
        {items.map((item) => (
          <li
            key={item.id}
            className={`blog-article-toc-item${item.level === 3 ? " indent" : ""}${activeId === item.id ? " active" : ""}`}
          >
            <a
              href={`#${item.id}`}
              className="blog-article-toc-link"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// ── Mobile TOC ─────────────────────────────────────────────────────────────

interface MobileTocProps {
  items: TocItem[];
  activeId: string;
  scrollProgress: number;
}

function MobileToc({ items, activeId, scrollProgress }: MobileTocProps) {
  const [open, setOpen] = useState(false);
  if (items.length === 0) return null;
  const activeIndex = items.findIndex((i) => i.id === activeId);
  const activeLabel = activeIndex >= 0 ? `Section ${activeIndex + 1}` : "Contents";

  return (
    <div className="blog-mobile-toc">
      <button
        className="blog-mobile-toc__toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="blog-mobile-toc__label">
          {open ? "Contents" : activeLabel}
        </span>
        <span className={`blog-mobile-toc__chevron${open ? " open" : ""}`}>▾</span>
      </button>
      {open && (
        <ul className="blog-mobile-toc__list">
          {items.map((item, idx) => (
            <li
              key={item.id}
              className={`blog-mobile-toc__item${item.level === 3 ? " indent" : ""}${activeId === item.id ? " active" : ""}`}
            >
              <a
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  setTimeout(() => {
                    const el = document.getElementById(item.id);
                    if (el) {
                      const offset = 120;
                      const top = el.getBoundingClientRect().top + window.scrollY - offset;
                      window.scrollTo({ top, behavior: "smooth" });
                    }
                  }, 50);
                }}
              >
                Section {idx + 1}
              </a>
            </li>
          ))}
        </ul>
      )}
      {/* 3px reading progress bar below the TOC */}
      <div className="blog-mobile-toc__progress-bar">
        <div className="blog-mobile-toc__progress-fill" style={{ width: `${scrollProgress}%` }} />
      </div>
    </div>
  );
}

// ── Back-to-top visibility hook ──────────────────────────────────────────────
function useShowBackToTop(threshold = 500): boolean {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const handler = () => setShow(window.scrollY > threshold);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, [threshold]);
  return show;
}

// ── Main Component ──────────────────────────────────────────────


// ---- Inline Newsletter Strip ----
function InlineNewsletterStrip() {
  const { config } = useThemeConfig();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  if (!config.enableNewsletter) return null;
  return (
    <div className="sf-inline-newsletter">
      <div className="sf-inline-newsletter-inner">
        <div className="sf-inline-newsletter-label">Newsletter</div>
        <h3 className="sf-inline-newsletter-title">{config.newsletterTitle ?? "Join the Club"}</h3>
        <p className="sf-inline-newsletter-subtitle">
          {config.newsletterText ?? "Subscribe for new arrivals, exclusive offers, and movement inspiration."}
        </p>
        {submitted ? (
          <div className="sf-inline-newsletter-success">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
            <span>Thank you! Welcome to the club.</span>
          </div>
        ) : (
          <div className="sf-inline-newsletter-form">
            <input
              type="email"
              className="sf-inline-newsletter-input"
              placeholder="Your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <button
              className="sf-inline-newsletter-btn"
              onClick={() => { if (email) setSubmitted(true); }}
            >Subscribe</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BlogArticle() {
  const params = useParams<{ handle: string }>();
  const handle = params.handle;
  const { config } = useThemeConfig();
  const blogCfg = config.blog;

  const showToc = blogCfg?.showToc ?? true;
  const showBreadcrumb = blogCfg?.showBreadcrumb ?? true;

  // Fetch article from Shopify Admin API
  const { data: articleData, isLoading: articleLoading } = trpc.shopify.getBlogArticle.useQuery(
    { blogHandle: "news", articleHandle: handle ?? "" },
    { enabled: !!handle }
  );

  const article: BlogArticle | undefined = useMemo(() => {
    if (!articleData) return undefined;
    const a = articleData as any;
    const readingTime = Math.max(1, Math.round((a.body_html?.split(" ").length ?? 100) / 200));
    return {
      id: String(a.id),
      handle: a.handle,
      title: a.title,
      excerpt: a.excerpt ?? "",
      publishedAt: a.published_at,
      readingTimeMinutes: readingTime,
      tags: typeof a.tags === "string" ? a.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : (a.tags ?? []),
      image: a.image ? { url: a.image.src, altText: a.image.alt ?? a.title } : null,
      author: a.author ?? "Dusk Yonder",
      content: a.body_html ?? "",
    };
  }, [articleData]);

  // Fetch related articles from the same blog
  const { data: blogData } = trpc.shopify.getBlog.useQuery({ handle: "news" });
  const allArticles: BlogArticle[] = useMemo(() => {
    if (!blogData?.articles?.edges) return [];
    return (blogData.articles.edges as any[]).map((e: any) => {
      const a = e.node;
      return {
        id: String(a.id),
        handle: a.handle,
        title: a.title,
        excerpt: a.excerpt ?? "",
        publishedAt: a.publishedAt,
        readingTimeMinutes: 1,
        tags: a.tags ?? [],
        image: a.image ? { url: a.image.url, altText: a.image.altText ?? a.title } : null,
        author: a.author?.name ?? "Dusk Yonder",
        content: "",
      } as BlogArticle;
    });
  }, [blogData]);

  // Process HTML to inject heading IDs
  const processedHtml = useMemo(
    () => (article ? injectHeadingIds(article.content) : ""),
    [article]
  );

  // Extract TOC from processed HTML
  const tocItems = useMemo(() => extractToc(processedHtml), [processedHtml]);

  // Track active heading for TOC highlight + scroll progress
  const [activeId, setActiveId] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const showBackToTop = useShowBackToTop(500);

  const updateScroll = useCallback(() => {
    // Progress bar: based on full page scroll
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    setScrollProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);

    // Scrollspy: last heading at/above viewport top (with header offset)
    if (!showToc || tocItems.length === 0) return;
    const topOffset = 130; // header + promo + buffer
    // Bottom-of-page: highlight last section
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 50) {
      setActiveId(tocItems[tocItems.length - 1].id);
      return;
    }
    let current = tocItems[0].id;
    for (const item of tocItems) {
      const el = document.getElementById(item.id);
      if (el && el.getBoundingClientRect().top <= topOffset) {
        current = item.id;
      }
    }
    setActiveId(current);
  }, [tocItems, showToc]);

  useEffect(() => {
    window.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll(); // run once on mount
    return () => window.removeEventListener("scroll", updateScroll);
  }, [updateScroll]);

  // Related articles (same tag, exclude current)
  const relatedArticles = useMemo(() => {
    if (!article) return [];
    return allArticles
      .filter((a) => a.handle !== handle && a.tags.some((t) => article.tags.includes(t)))
      .slice(0, 3);
  }, [article, handle, allArticles]);

  if (articleLoading) {
    return (
      <div className="blog-article-page">
        <SFPromoBar />
        <SFHeader darkMode={true} />
        <div className="blog-article-not-found">
          <p>Loading article…</p>
        </div>
        <SFFooter />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="blog-article-page">
        <SFPromoBar />
        <SFHeader darkMode={true} />
        <div className="blog-article-not-found">
          <h1>Article not found</h1>
          <Link href="/blogs/news" className="blog-article-back-link">← Back to Blog</Link>
        </div>
        <SFFooter />
      </div>
    );
  }

  const hasToc = showToc && tocItems.length > 0;

  return (
    <div className="blog-article-page">
      {/* ── Reading Progress Bar ── */}
      <div
        className="blog-article-progress-bar"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      <SFPromoBar />
      <SFHeader darkMode={true} />

      {/* ── Breadcrumb ── */}
      {showBreadcrumb && (
        <nav className="blog-breadcrumb" aria-label="Breadcrumb">
          <div className="blog-breadcrumb-inner">
            <Link href="/" className="blog-breadcrumb-link">Home</Link>
            <span className="blog-breadcrumb-sep">›</span>
            <Link href="/blogs/news" className="blog-breadcrumb-link">Blog</Link>
            {article.tags[0] && (
              <>
                <span className="blog-breadcrumb-sep">›</span>
                <Link
                  href={`/blogs/news?tag=${encodeURIComponent(article.tags[0])}`}
                  className="blog-breadcrumb-link"
                >
                  {article.tags[0]}
                </Link>
              </>
            )}
            <span className="blog-breadcrumb-sep">›</span>
            <span className="blog-breadcrumb-current">{article.title}</span>
          </div>
        </nav>
      )}

      {/* ── Hero Image ── */}
      {article.image?.url && (
        <div className="blog-article-hero">
          <img src={article.image.url} alt={article.image.altText} className="blog-article-hero-img" />
        </div>
      )}

      {/* ── Article Layout ── */}
      <div className={`blog-article-layout${hasToc ? " with-toc" : ""}`}>
        {/* Main Content */}
        <article className="blog-article-main">
          {/* Tags */}
          <div className="blog-article-tags">
            {article.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blogs/news?tag=${encodeURIComponent(tag)}`}
                className="blog-article-tag"
              >
                {tag}
              </Link>
            ))}
          </div>

          {/* Title */}
          <h1 className="blog-article-title">{article.title}</h1>

          {/* Meta */}
          <div className="blog-article-meta">
            <span className="blog-article-author">By {typeof article.author === "string" ? article.author : (article.author as any)?.name ?? "Dusk Yonder"}</span>
            <span className="blog-card-dot">·</span>
            <span>{formatDate(article.publishedAt)}</span>
            <span className="blog-card-dot">·</span>
            <span>{article.readingTimeMinutes} min read</span>
          </div>

          {/* Excerpt */}
          <p className="blog-article-excerpt">{article.excerpt}</p>

          {/* Mobile TOC + progress bar */}
          {hasToc && (
            <div className="blog-mobile-toc-wrap">
              <MobileToc items={tocItems} activeId={activeId} scrollProgress={scrollProgress} />
            </div>
          )}

          {/* Body */}
          <div
            ref={contentRef}
            className="blog-article-body"
            dangerouslySetInnerHTML={{ __html: processedHtml }}
          />

          {/* Back link */}
          <div className="blog-article-back">
            <Link href="/blogs/news" className="blog-article-back-link">
              ← Back to Blog
            </Link>
          </div>
        </article>

        {/* TOC Sidebar */}
        {hasToc && (
          <aside className="blog-article-sidebar">
            <div className="blog-article-sidebar-sticky">
              <TocSidebar items={tocItems} activeId={activeId} />
            </div>
          </aside>
        )}
      </div>

      {/* ── Related Articles ── */}
      {relatedArticles.length > 0 && (
        <section className="blog-related">
          <div className="blog-related-inner">
            <h2 className="blog-related-title">You Might Also Like</h2>
            <div className="blog-related-grid">
              {relatedArticles.map((rel) => (
                <article key={rel.id} className="blog-related-card">
                  <Link href={`/blogs/news/${rel.handle}`} className="blog-related-img-wrap">
                    {rel.image?.url ? (
                      <img src={rel.image.url} alt={rel.image.altText} className="blog-related-img" />
                    ) : (
                      <div className="blog-related-img-placeholder" />
                    )}
                  </Link>
                  <div className="blog-related-body">
                    {rel.tags[0] && <span className="blog-card-tag">{rel.tags[0]}</span>}
                    <Link href={`/blogs/news/${rel.handle}`}>
                      <h3 className="blog-related-card-title">{rel.title}</h3>
                    </Link>
                    <p className="blog-related-card-excerpt">{rel.excerpt.slice(0, 100)}...</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Floating back-to-top button */}
      <button
        className={`blog-back-to-top${showBackToTop ? " visible" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>

      <InlineNewsletterStrip />
      <SFFooter />
    </div>
  );
}
