import { useEffect, useRef } from "react";
import { Link } from "wouter";
import type { BlogArticle } from "../../../shared/mockBlogData";

interface BlogArticleDrawerProps {
  article: BlogArticle | null;
  onClose: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogArticleDrawer({ article, onClose }: BlogArticleDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (article) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [article, onClose]);

  if (!article) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="blog-drawer-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="blog-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={article.title}
      >
        {/* Header */}
        <div className="blog-drawer-header">
          <button
            className="blog-drawer-close"
            onClick={onClose}
            aria-label="Close article"
          >
            ✕
          </button>
          <Link
            href={`/pages/blog/${article.handle}`}
            className="blog-drawer-open-page"
            onClick={onClose}
          >
            Open Full Page ↗
          </Link>
        </div>

        {/* Content */}
        <div className="blog-drawer-content">
          {/* Hero image */}
          {article.image?.url && (
            <div className="blog-drawer-hero-img">
              <img src={article.image.url} alt={article.image.altText} />
            </div>
          )}

          {/* Meta */}
          <div className="blog-drawer-meta">
            {article.tags.map((tag) => (
              <span key={tag} className="blog-drawer-tag">{tag}</span>
            ))}
            <span className="blog-drawer-date">{formatDate(article.publishedAt)}</span>
            <span className="blog-card-dot">·</span>
            <span className="blog-drawer-read-time">{article.readingTimeMinutes} min read</span>
          </div>

          {/* Title */}
          <h1 className="blog-drawer-title">{article.title}</h1>

          {/* Author */}
          <p className="blog-drawer-author">By {article.author.name}</p>

          {/* Body */}
          <div
            className="blog-drawer-body"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Footer */}
          <div className="blog-drawer-footer">
            <Link
              href={`/pages/blog/${article.handle}`}
              className="blog-drawer-full-link"
              onClick={onClose}
            >
              Read full article on its own page →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
