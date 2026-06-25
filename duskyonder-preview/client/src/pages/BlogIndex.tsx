import { useState, useMemo } from "react";
import { Link } from "wouter";
import { SFHeader, SFFooter, SFPromoBar } from "@/components/StorefrontShell";
import { useThemeConfig } from "@/contexts/ThemeConfigContext";
import { heroPositionVars } from "@/lib/heroPosition";
import {
  mockArticles,
  mockBlogMeta,
  getAllTags,
  filterByTag,
  type BlogArticle,
} from "../../../shared/mockBlogData";
import BlogArticleDrawer from "@/components/BlogArticleDrawer";

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ── Article Card ────────────────────────────────────────────────────────────

interface ArticleCardProps {
  article: BlogArticle;
  onDrawerOpen: (article: BlogArticle) => void;
  detailMode: "drawer" | "page";
  cardLinkStyle: "A" | "C";
}

function ArticleCard({ article, onDrawerOpen, detailMode, cardLinkStyle }: ArticleCardProps) {
  const href = `/pages/blog/${article.handle}`;

  const handleClick = (e: React.MouseEvent) => {
    if (detailMode === "drawer") {
      e.preventDefault();
      onDrawerOpen(article);
    }
  };

  return (
    <article className="blog-card">
      <Link href={href} onClick={handleClick} className="blog-card-img-wrap">
        {article.image?.url ? (
          <img src={article.image.url} alt={article.image.altText} className="blog-card-img" />
        ) : (
          <div className="blog-card-img-placeholder" />
        )}
        {article.tags[0] && (
          <span className="blog-card-tag">{article.tags[0]}</span>
        )}
      </Link>
      <div className="blog-card-body">
        <div className="blog-card-meta">
          <span>{formatDate(article.publishedAt)}</span>
          <span className="blog-card-dot">·</span>
          <span>{article.readingTimeMinutes} min read</span>
        </div>
        <Link href={href} onClick={handleClick}>
          <h3 className="blog-card-title">{article.title}</h3>
        </Link>
        <p className="blog-card-excerpt">{article.excerpt}</p>
        <div className="blog-card-footer">
          {cardLinkStyle === "A" ? (
            <Link href={href} onClick={handleClick} className="blog-card-link-a">
              Read More →
            </Link>
          ) : (
            <Link href={href} onClick={handleClick} className="blog-card-link-c">
              <span>Read More</span>
              <span className="blog-card-link-arrow">↗</span>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

// ── Featured Card ───────────────────────────────────────────────────────────

interface FeaturedCardProps {
  article: BlogArticle;
  onDrawerOpen: (article: BlogArticle) => void;
  detailMode: "drawer" | "page";
  cardLinkStyle: "A" | "C";
}

function FeaturedCard({ article, onDrawerOpen, detailMode, cardLinkStyle }: FeaturedCardProps) {
  const href = `/pages/blog/${article.handle}`;

  const handleClick = (e: React.MouseEvent) => {
    if (detailMode === "drawer") {
      e.preventDefault();
      onDrawerOpen(article);
    }
  };

  return (
    <article className="blog-featured-card">
      <Link href={href} onClick={handleClick} className="blog-featured-img-wrap">
        {article.image?.url ? (
          <img src={article.image.url} alt={article.image.altText} className="blog-featured-img" />
        ) : (
          <div className="blog-featured-img-placeholder" />
        )}
      </Link>
      <div className="blog-featured-body">
        <div className="blog-featured-meta">
          {article.tags[0] && <span className="blog-featured-tag">{article.tags[0]}</span>}
          <span>{formatDate(article.publishedAt)}</span>
          <span className="blog-card-dot">·</span>
          <span>{article.readingTimeMinutes} min read</span>
        </div>
        <Link href={href} onClick={handleClick}>
          <h2 className="blog-featured-title">{article.title}</h2>
        </Link>
        <p className="blog-featured-excerpt">{article.excerpt}</p>
        <div className="blog-featured-actions">
          {cardLinkStyle === "A" ? (
            <Link href={href} className="blog-card-link-a blog-card-link-a--featured">
              Read Article →
            </Link>
          ) : (
            <Link href={href} className="blog-card-link-c blog-card-link-c--featured">
              <span>Read Article</span>
              <span className="blog-card-link-arrow">↗</span>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

const PAGE_SIZE = 6;

export default function BlogIndex() {
  const { config } = useThemeConfig();
  const blogCfg = config.blog;

  const heroTitle = blogCfg?.heroTitle ?? mockBlogMeta.title;
  const heroSubtitle = blogCfg?.heroSubtitle ?? "Stories about movement, wellness, and the life you're building.";
  const heroBgColor = blogCfg?.heroBgColor ?? "#F7F5F2";
  const heroTextColor = blogCfg?.heroTextColor ?? "#1a1a1a";
  const showFeatured = blogCfg?.showFeatured ?? true;
  const showCategoryFilter = blogCfg?.showCategoryFilter ?? true;
  const footerCtaTitle = blogCfg?.footerCtaTitle ?? "Stay in the Loop";
  const footerCtaSubtitle = blogCfg?.footerCtaSubtitle ?? "Subscribe for movement tips, new arrivals, and community stories.";
  const footerCtaPlaceholder = blogCfg?.footerCtaPlaceholder ?? "Your email address";
  const footerCtaButton = blogCfg?.footerCtaButton ?? "Subscribe";
  const showFooterCta = blogCfg?.showFooterCta ?? true;
  const detailMode = (blogCfg?.detailMode ?? "drawer") as "drawer" | "page";
  const cardLinkStyle = (blogCfg?.cardLinkStyle ?? "C") as "A" | "C";
  const customCategories = blogCfg?.customCategories ?? [];
  const heroMinHeight = blogCfg?.heroMinHeight;
  const heroDesktopPosition = blogCfg?.heroDesktopPosition;
  const heroMobilePosition = blogCfg?.heroMobilePosition;

  // Merge auto-detected tags with custom categories
  const autoTags = useMemo(() => getAllTags(mockArticles), []);
  const allCategories = useMemo(() => {
    const merged = new Set(["All", ...autoTags, ...customCategories]);
    return Array.from(merged);
  }, [autoTags, customCategories]);

  const [activeTag, setActiveTag] = useState("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [drawerArticle, setDrawerArticle] = useState<BlogArticle | null>(null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const filtered = useMemo(() => filterByTag(mockArticles, activeTag), [activeTag]);
  const featuredArticle = filtered[0];
  const gridArticles = showFeatured ? filtered.slice(1, visibleCount + 1) : filtered.slice(0, visibleCount);
  const hasMore = showFeatured
    ? filtered.length - 1 > visibleCount
    : filtered.length > visibleCount;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <div className="blog-page">
      <SFPromoBar />
      <SFHeader darkMode={false} />

      {/* ── Hero ── */}
      <section
        className="blog-hero"
        style={{ background: heroBgColor, color: heroTextColor, minHeight: heroMinHeight ? `${heroMinHeight}px` : undefined, ...heroPositionVars(heroDesktopPosition, heroMobilePosition) }}
      >
        <div className="blog-hero-inner">
          <p className="blog-hero-label">JOURNAL</p>
          <h1 className="blog-hero-title">{heroTitle}</h1>
          <p className="blog-hero-subtitle">{heroSubtitle}</p>
        </div>
      </section>

      {/* ── Category Filter ── */}
      {showCategoryFilter && allCategories.length > 1 && (
        <div className="blog-filter-bar">
          <div className="blog-filter-inner">
            {allCategories.map((tag) => (
              <button
                key={tag}
                className={`blog-filter-btn${activeTag === tag ? " active" : ""}`}
                onClick={() => {
                  setActiveTag(tag);
                  setVisibleCount(PAGE_SIZE);
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="blog-content">
        {/* ── Featured Card ── */}
        {showFeatured && featuredArticle && (
          <div className="blog-featured-wrap">
            <FeaturedCard
              article={featuredArticle}
              onDrawerOpen={setDrawerArticle}
              detailMode={detailMode}
              cardLinkStyle={cardLinkStyle}
            />
          </div>
        )}

        {/* ── Article Grid ── */}
        {gridArticles.length > 0 ? (
          <div className="blog-grid">
            {gridArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onDrawerOpen={setDrawerArticle}
                detailMode={detailMode}
                cardLinkStyle={cardLinkStyle}
              />
            ))}
          </div>
        ) : (
          <div className="blog-empty">
            <p>No articles found in this category yet.</p>
          </div>
        )}

        {/* ── Load More ── */}
        {hasMore && (
          <div className="blog-load-more">
            <button
              className="blog-load-more-btn"
              onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
            >
              Load More Articles
            </button>
          </div>
        )}
      </div>

      {/* ── Footer CTA ── */}
      {showFooterCta && (
        <section className="blog-footer-cta">
          <div className="blog-footer-cta-inner">
            <h2 className="blog-footer-cta-title">{footerCtaTitle}</h2>
            <p className="blog-footer-cta-subtitle">{footerCtaSubtitle}</p>
            {subscribed ? (
              <p className="blog-footer-cta-success">Thanks for subscribing!</p>
            ) : (
              <form className="blog-footer-cta-form" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  className="blog-footer-cta-input"
                  placeholder={footerCtaPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="blog-footer-cta-btn">
                  {footerCtaButton}
                </button>
              </form>
            )}
          </div>
        </section>
      )}

      <SFFooter />

      {/* ── Article Drawer (Mode A) ── */}
      <BlogArticleDrawer
        article={drawerArticle}
        onClose={() => setDrawerArticle(null)}
      />
    </div>
  );
}
