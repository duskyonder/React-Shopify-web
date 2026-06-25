import { useState, useEffect, useRef, useMemo } from "react";
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

// ── Main Component ──────────────────────────────────────────────────────────


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

  // Track active heading for TOC highlight
  const [activeId, setActiveId] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showToc || tocItems.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    tocItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [tocItems, showToc]);

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
      <SFPromoBar />
      <SFHeader darkMode={true} />

      {/* ── Breadcrumb ── */}
      {showBreadcrumb && (
        <nav className="blog-breadcrumb" aria-label="Breadcrumb">
          <div className="blog-breadcrumb-inner">
            <Link href="/" className="blog-breadcrumb-link">Home</Link>
            <span className="blog-breadcrumb-sep">›</span>
            <Link href="/pages/blog" className="blog-breadcrumb-link">Journal</Link>
            {article.tags[0] && (
              <>
                <span className="blog-breadcrumb-sep">›</span>
                <Link
                  href={`/pages/blog?tag=${encodeURIComponent(article.tags[0])}`}
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
                href={`/pages/blog?tag=${encodeURIComponent(tag)}`}
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
            <span className="blog-article-author">By {article.author.name}</span>
            <span className="blog-card-dot">·</span>
            <span>{formatDate(article.publishedAt)}</span>
            <span className="blog-card-dot">·</span>
            <span>{article.readingTimeMinutes} min read</span>
          </div>

          {/* Excerpt */}
          <p className="blog-article-excerpt">{article.excerpt}</p>

          {/* Body */}
          <div
            ref={contentRef}
            className="blog-article-body"
            dangerouslySetInnerHTML={{ __html: processedHtml }}
          />

          {/* Back link */}
          <div className="blog-article-back">
            <Link href="/pages/blog" className="blog-article-back-link">
              ← Back to Journal
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

      <InlineNewsletterStrip />
      <SFFooter />
    </div>
  );
}
