import { useState, useRef, useEffect, useCallback } from "react";
import { useThemeConfig } from "@/contexts/ThemeConfigContext";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";

// ==================== ICONS ====================
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);
const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
);
const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
);
const ChevronDownIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
);

// ==================== SPLIT COLOR SWATCH (shared) ====================
export function ColorSwatch({ value, active, onClick, size = 10 }: {
  value: string; active?: boolean; onClick?: () => void; size?: number;
}) {
  const isSplit = value.includes("+");
  const [c1, c2] = isSplit ? value.split("+") : [value, value];
  const isLight = (hex: string) => {
    const h = hex.replace("#", "");
    if (h.length < 6) return true;
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 200;
  };
  const needsBorder = isLight(c1) || isLight(c2);
  return (
    <div
      onClick={onClick}
      title={value}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        // no outer ring — active state shown by scale + border only
        border: active
          ? `1.5px solid #333`
          : needsBorder
          ? "1px solid #ccc"
          : "none",
        flexShrink: 0,
        position: "relative",
        transform: active ? "scale(1.25)" : "scale(1)",
        transition: "transform 0.15s ease, border 0.15s ease",
        boxSizing: "border-box",
      }}
    >
      {isSplit ? (
        <>
          <div style={{ position: "absolute", left: 0, top: 0, width: "50%", height: "100%", background: c1 }} />
          <div style={{ position: "absolute", right: 0, top: 0, width: "50%", height: "100%", background: c2 }} />
        </>
      ) : (
        <div style={{ width: "100%", height: "100%", background: c1 }} />
      )}
    </div>
  );
}

// ==================== PROMO BAR ====================
export function SFPromoBar() {
  const { config } = useThemeConfig();
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const items = config.promoBarItems || [];
  const total = items.length;

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (total > 1) {
      timerRef.current = setInterval(() => setCurrent(c => (c + 1) % total), 4000);
    }
  }, [total]);

  useEffect(() => { startTimer(); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, [startTimer]);

  if (!config.showPromoBar || total === 0) return null;

  const item = items[current];
  const barH = config.promoBarHeight ?? 40;
  const barMH = config.promoBarMobileHeight ?? 36;
  const barFs = config.promoBarFontSize ?? 13;
  const barMFs = config.promoBarMobileFontSize ?? 12;
  const promoStyle = {
    background: config.promoBarBg,
    color: config.promoBarColor,
    "--promo-height": `${barH}px`,
    "--promo-m-height": `${barMH}px`,
    "--promo-font-size": `${barFs}px`,
    "--promo-m-font-size": `${barMFs}px`,
  } as React.CSSProperties;

  return (
    <div className="sf-promo-bar" style={promoStyle}>
      <button className="sf-promo-arrow" onClick={() => { setCurrent((current - 1 + total) % total); startTimer(); }}>
        <ChevronLeftIcon />
      </button>
      <div className="sf-promo-text">
        {item?.link ? (
          <a href={item.link} style={{ color: "inherit", textDecoration: "none" }}>{item?.text}</a>
        ) : (
          <span>{item?.text}</span>
        )}
      </div>
      <button className="sf-promo-arrow" onClick={() => { setCurrent((current + 1) % total); startTimer(); }}>
        <ChevronRightIcon />
      </button>
    </div>
  );
}

// ==================== HEADER (with 2-level nav dropdown) ====================
export function SFHeader({ darkMode = false }: { darkMode?: boolean }) {
  const { config } = useThemeConfig();
  const { totalCount, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Search overlay keyboard handling
  useEffect(() => {
    if (!searchOpen) return;
    const timer = setTimeout(() => searchInputRef.current?.focus(), 80);
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); } };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [searchOpen]);

  // Derive search results from config data
  const searchResults = useCallback(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: Array<{ type: string; title: string; url: string; imageUrl?: string; subtitle?: string }> = [];
    // Products
    const allProducts = [
      ...(config.products || []),
      ...(config.collections || []).flatMap(c => c.products || []),
    ];
    const seen = new Set<string>();
    allProducts.forEach(p => {
      if (seen.has(p.id)) return;
      seen.add(p.id);
      if (p.name?.toLowerCase().includes(q)) {
        results.push({ type: "Product", title: p.name, url: (p as any).detailUrl || `/products/${p.name.toLowerCase().replace(/\s+/g, "-")}`, imageUrl: p.imageUrl, subtitle: p.price });
      }
    });
    // Collections
    (config.collections || []).forEach(c => {
      if (c.title?.toLowerCase().includes(q)) {
        results.push({ type: "Collection", title: c.title, url: `/collections/${c.handle}` });
      }
    });
    // Nav pages
    (config.navItems || []).forEach(item => {
      if (item.label?.toLowerCase().includes(q)) {
        results.push({ type: "Page", title: item.label, url: item.link || "/" });
      }
      (item.children || []).forEach(child => {
        if (child.label?.toLowerCase().includes(q)) {
          results.push({ type: "Page", title: child.label, url: child.link || "/" });
        }
      });
    });
    return results.slice(0, 8);
  }, [searchQuery, config]);

  const navItems = config.navItems || [];
  const navLeft = navItems.filter(item => !/influenc|blog/i.test(item.label || ""));
  const navRight = navItems.filter(item => /influenc|blog/i.test(item.label || ""));

  // Logo 双色切换：透明导航栏时用白色 Logo，白色底时用绿色 Logo
  const isTransparent = !scrolled && !darkMode;
  const logoDesktopH = config.logoDesktopHeight ?? 40;
  const logoMobileH = config.logoMobileHeight ?? 32;
  // 选择当前应显示的 Logo URL
  const activeLogoUrl = isTransparent
    ? (config.logoImageUrlWhite || config.logoImageUrl)
    : (config.logoImageUrl || config.logoImageUrlWhite);

  const renderLogo = () => {
    const greenUrl = config.logoImageUrl || config.logoImageUrlWhite;
    const whiteUrl = config.logoImageUrlWhite || config.logoImageUrl;
    if (greenUrl || whiteUrl) {
      return (
        <a href="/" className="sf-logo sf-logo-center" style={{ display: "flex", alignItems: "center", position: "relative" }}>
          {/* 绿色 Logo：白底导航栏时显示 */}
          {greenUrl && (
            <img src={greenUrl} alt={config.logoText}
              style={{ height: logoDesktopH, maxWidth: 200, objectFit: "contain",
                position: isTransparent ? "absolute" : "relative",
                opacity: isTransparent ? 0 : 1,
                transition: "opacity 0.1s ease",
                pointerEvents: isTransparent ? "none" : "auto" }} />
          )}
          {/* 白色 Logo：透明导航栏时显示 */}
          {whiteUrl && (
            <img src={whiteUrl} alt={config.logoText}
              style={{ height: logoDesktopH, maxWidth: 200, objectFit: "contain",
                position: isTransparent ? "relative" : "absolute",
                opacity: isTransparent ? 1 : 0,
                transition: "opacity 0.1s ease",
                pointerEvents: isTransparent ? "auto" : "none" }} />
          )}
        </a>
      );
    }
    return <a href="/" className="sf-logo sf-logo-center">{config.logoText}</a>;
  };

  const [openNavId, setOpenNavId] = useState<string | null>(null);
  const navHoverTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const handleNavEnter = (id: string) => {
    if (navHoverTimers.current[id]) clearTimeout(navHoverTimers.current[id]);
    setOpenNavId(id);
  };
  const handleNavLeave = (id: string) => {
    navHoverTimers.current[id] = setTimeout(() => setOpenNavId(null), 100);
  };

  const navLinkStyle: React.CSSProperties = {
    // Use CSS variable for responsive font size (mobile override via media query in index.css)
    fontSize: `var(--nav-font-size, ${config.navFontSize || 14}px)`,
    fontWeight: config.navFontWeight ? Number(config.navFontWeight) : undefined,
    fontStyle: config.navFontStyle || undefined,
  };
  // Set CSS variables on the nav element
  const navCssVars = {
    "--nav-font-size": `${config.navFontSize || 14}px`,
    "--nav-m-font-size": `${config.navMobileFontSize ?? config.navFontSize ?? 14}px`,
  } as React.CSSProperties;

  const renderNavItem = (item: typeof navItems[0], i: number) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openNavId === item.id;
    return (
      <div
        key={item.id || i}
        className="sf-nav-item-wrapper"
        onMouseEnter={() => hasChildren && handleNavEnter(item.id)}
        onMouseLeave={() => hasChildren && handleNavLeave(item.id)}
        style={{ position: "relative" }}
      >
        <a href={item.link} className="sf-nav-link" style={navLinkStyle}>
          {item.label}
          {hasChildren && <span style={{ marginLeft: 3, opacity: 0.7, display: "inline-flex", alignItems: "center" }}><ChevronDownIcon /></span>}
        </a>
        {hasChildren && (
          <div
            className="sf-nav-dropdown"
            style={isOpen ? { opacity: 1, pointerEvents: "auto", transform: "translateX(-50%) translateY(0)" } : undefined}
            onMouseEnter={() => handleNavEnter(item.id)}
            onMouseLeave={() => handleNavLeave(item.id)}
          >
            {item.children!.map((child) => (
              <a key={child.id} href={child.link} className="sf-nav-dropdown-item">{child.label}</a>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <header
        className={`sf-header${scrolled || darkMode ? " scrolled" : ""}${!config.showPromoBar ? " no-promo" : ""}${darkMode ? " dark-mode" : ""}`}
        style={{
          // top is controlled by CSS var(--promo-height) / var(--promo-m-height) in index.css
          ["--promo-height" as string]: config.showPromoBar ? `${config.promoBarHeight ?? 40}px` : "0px",
          ["--promo-m-height" as string]: config.showPromoBar ? `${config.promoBarMobileHeight ?? 36}px` : "0px",
          // inject nav color CSS variables for dynamic theming
          ["--nav-text-color" as string]: config.navTextColor || "#333333",
          ["--nav-hover-color" as string]: config.navHoverColor || "#175C40",
        } as React.CSSProperties}
      >
        {/* Desktop */}
        <div className="sf-header-inner sf-header-desktop">
          <nav className="sf-nav sf-nav-left" style={navCssVars}>
            {navLeft.map((item, i) => renderNavItem(item, i))}
          </nav>
          {renderLogo()}
          <div className="sf-header-right">
            <nav className="sf-nav sf-nav-right" style={navCssVars}>
              {navRight.map((item, i) => renderNavItem(item, i))}
            </nav>
            <div className="sf-header-actions">
              <button className="sf-icon-btn" aria-label="Search" onClick={() => setSearchOpen(true)}><SearchIcon /></button>
              <a href={config.accountUrl || "/account/login"} className="sf-icon-btn" aria-label="Account"><UserIcon /></a>
              <a href={config.wishlistUrl || "/wishlist"} className="sf-icon-btn" aria-label="Wishlist"><HeartIcon /></a>
              <button className="sf-icon-btn" aria-label="Cart" style={{ position: "relative" }} onClick={openCart}>
                <CartIcon />
                {totalCount > 0 && <span className="cart-badge">{totalCount}</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className="sf-header-inner sf-header-mobile">
          <div className="sf-mobile-left">
            <button className="sf-icon-btn" aria-label="Search" onClick={() => setSearchOpen(true)}><SearchIcon /></button>
            <button className="sf-icon-btn sf-hamburger" aria-label="Menu" onClick={() => setMobileOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
          {(config.logoImageUrl || config.logoImageUrlWhite) ? (
            <a href="/" className="sf-logo sf-logo-center" style={{ display: "flex", alignItems: "center", position: "relative" }}>
              {(config.logoImageUrl || config.logoImageUrlWhite) && (
                <img src={config.logoImageUrl || config.logoImageUrlWhite!} alt={config.logoText}
                  style={{ height: logoMobileH, maxWidth: 140, objectFit: "contain",
                    position: isTransparent ? "absolute" : "relative",
                    opacity: isTransparent ? 0 : 1,
                    transition: "opacity 0.1s ease",
                    pointerEvents: isTransparent ? "none" : "auto" }} />
              )}
              {(config.logoImageUrlWhite || config.logoImageUrl) && (
                <img src={config.logoImageUrlWhite || config.logoImageUrl!} alt={config.logoText}
                  style={{ height: logoMobileH, maxWidth: 140, objectFit: "contain",
                    position: isTransparent ? "relative" : "absolute",
                    opacity: isTransparent ? 1 : 0,
                    transition: "opacity 0.1s ease",
                    pointerEvents: isTransparent ? "auto" : "none" }} />
              )}
            </a>
          ) : (
            <a href="/" className="sf-logo sf-logo-center">{config.logoText}</a>
          )}
          <div className="sf-mobile-right">
            <a href={config.wishlistUrl || "/wishlist"} className="sf-icon-btn" aria-label="Wishlist"><HeartIcon /></a>
            <button className="sf-icon-btn" aria-label="Cart" style={{ position: "relative" }} onClick={openCart}>
              <CartIcon />
              {totalCount > 0 && <span className="cart-badge">{totalCount}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      {searchOpen && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 9500,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
            display: "flex", flexDirection: "column", alignItems: "center",
            paddingTop: "clamp(60px, 12vh, 120px)",
            animation: "fadeIn 0.2s ease",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) { setSearchOpen(false); setSearchQuery(""); } }}
        >
          {/* Search box */}
          <div style={{ width: "min(640px, 90vw)", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", background: "#fff", borderRadius: 4, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.3)" }}>
              <div style={{ padding: "0 16px", color: "#888", flexShrink: 0, display: "flex" }}>
                <SearchIcon />
              </div>
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    setSearchOpen(false);
                    window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
                  }
                }}
                placeholder="Search products, collections..."
                style={{
                  flex: 1, padding: "18px 0", border: "none", outline: "none",
                  fontSize: "1.05rem", background: "transparent", color: "#1A1A1A",
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{ padding: "0 16px", background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: "1.1rem" }}
                >✕</button>
              )}
            </div>

            {/* Results */}
            {searchQuery.trim() && (
              <div style={{ background: "#fff", borderRadius: 4, marginTop: 8, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.25)" }}>
                {searchResults().length === 0 ? (
                  <div style={{ padding: "24px", textAlign: "center", color: "#888", fontSize: "0.9rem" }}>
                    No results for "{searchQuery}"
                  </div>
                ) : (
                  searchResults().map((result, i) => (
                    <a
                      key={i}
                      href={result.url}
                      onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "12px 20px",
                        textDecoration: "none",
                        borderBottom: i < searchResults().length - 1 ? "1px solid #f5f5f5" : "none",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#f9f9f9")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      {result.imageUrl ? (
                        <img src={result.imageUrl} alt="" style={{ width: 44, height: 52, objectFit: "cover", borderRadius: 3, flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 44, height: 44, background: "#f0f0f0", borderRadius: 3, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>
                          {result.type === "Product" ? "👕" : result.type === "Collection" ? "📦" : "📄"}
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "#1A1A1A", marginBottom: 2 }}>{result.title}</div>
                        <div style={{ fontSize: "0.75rem", color: "#888" }}>
                          {result.type}{result.subtitle ? ` · ${result.subtitle}` : ""}
                        </div>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                    </a>
                  ))
                )}
              </div>
            )}

            {/* Suggestions (empty state) */}
            {!searchQuery.trim() && (
              <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                {["Leggings", "Sports Bra", "Shorts", "New Arrivals", "Best Sellers"].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    style={{
                      padding: "8px 16px", borderRadius: 20,
                      background: "rgba(255,255,255,0.15)",
                      border: "1px solid rgba(255,255,255,0.3)",
                      color: "#fff", fontSize: "0.82rem", cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Close hint */}
          <div style={{ marginTop: 24, color: "rgba(255,255,255,0.5)", fontSize: "0.78rem", letterSpacing: "0.04em" }}>
            Press ESC to close
          </div>
        </div>
      )}

      {/* Mobile Nav Drawer */}
      {mobileOpen && (
        <>
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 9000 }} onClick={() => setMobileOpen(false)} />
          <div style={{
            position: "fixed", top: 0, left: 0, bottom: 0, width: 300,
            background: "white", zIndex: 9001, display: "flex", flexDirection: "column",
            boxShadow: "4px 0 24px rgba(0,0,0,0.15)",
            animation: "slideInLeft 0.3s cubic-bezier(0.23,1,0.32,1)",
          }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              {config.logoImageUrl ? (
                <img src={config.logoImageUrl} alt={config.logoText} style={{ height: Math.max(logoMobileH - 4, 24), objectFit: "contain" }} />
              ) : (
                <span className="sf-logo" style={{ fontSize: "1.1rem" }}>{config.logoText}</span>
              )}
              <button onClick={() => setMobileOpen(false)} style={{ background: "none", border: "none", fontSize: "1.4rem", cursor: "pointer", color: "#666" }}>✕</button>
            </div>
            <nav style={{ padding: "8px 0", flex: 1, overflowY: "auto" }}>
              {navItems.map((item) => (
                <div key={item.id}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    {item.children && item.children.length > 0 ? (
                      <button
                        onClick={() => setMobileExpanded(mobileExpanded === item.id ? null : item.id)}
                        style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "space-between", padding: "14px 24px", background: "none", border: "none", cursor: "pointer", color: "#333", fontSize: "1rem", fontWeight: 500, textAlign: "left" }}
                      >
                        <span>{item.label}</span>
                        <span style={{ marginLeft: 8, color: "#999", transition: "transform 0.2s", transform: mobileExpanded === item.id ? "rotate(180deg)" : "rotate(0deg)", display: "inline-flex" }}>
                          <ChevronDownIcon />
                        </span>
                      </button>
                    ) : (
                      <a href={item.link} onClick={() => setMobileOpen(false)}
                        style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, padding: "14px 24px", color: "#333", textDecoration: "none", fontSize: "1rem", fontWeight: 500 }}
                      >
                        {item.label}
                        {(item.link?.includes("influencer") || item.link?.includes("creators") || item.label?.toLowerCase().includes("influencer") || item.label?.toLowerCase().includes("creator")) && (
                          <span style={{ display: "inline-block", padding: "2px 7px", background: "#175C40", color: "#fff", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", borderRadius: 3, lineHeight: 1.5 }}>JOIN</span>
                        )}
                      </a>
                    )}
                  </div>
                  {mobileExpanded === item.id && item.children && (
                    <div style={{ background: "#f9f9f9", paddingLeft: 16 }}>
                      {item.children.map(child => (
                        <a key={child.id} href={child.link} onClick={() => setMobileOpen(false)}
                          style={{ display: "block", padding: "10px 24px", color: "#555", textDecoration: "none", fontSize: "0.9rem", borderBottom: "1px solid #eee" }}
                        >{child.label}</a>
                      ))}
                    </div>
                  )}
                  <div style={{ height: 1, background: "#f5f5f5" }} />
                </div>
              ))}
            </nav>
            <div style={{ padding: "20px 24px", borderTop: "1px solid #eee", display: "flex", gap: 16 }}>
              <a href={config.accountUrl || "/account/login"} style={{ display: "flex", alignItems: "center", gap: 8, color: "#333", textDecoration: "none", fontSize: "0.9rem" }}>
                <UserIcon /> Account
              </a>
              <a href={config.wishlistUrl || "/wishlist"} style={{ display: "flex", alignItems: "center", gap: 8, color: "#333", textDecoration: "none", fontSize: "0.9rem" }}>
                <HeartIcon /> Wishlist
              </a>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ==================== SOCIAL ICONS ====================
const SocialIconYouTube = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);
const SocialIconFacebook = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);
const SocialIconInstagram = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);
const SocialIconPinterest = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
  </svg>
);
const SocialIconTwitterX = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const SocialIconTikTok = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
  </svg>
);

const SOCIAL_ICON_MAP: Record<string, React.ReactElement> = {
  youtube: <SocialIconYouTube />,
  facebook: <SocialIconFacebook />,
  instagram: <SocialIconInstagram />,
  pinterest: <SocialIconPinterest />,
  twitter: <SocialIconTwitterX />,
  tiktok: <SocialIconTikTok />,
};

// ==================== FOOTER ====================
export function SFFooter() {
  const { config } = useThemeConfig();
  const { socialLinks } = config;
  const [footerEmail, setFooterEmail] = useState("");
  const [footerStatus, setFooterStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const footerSubscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: (data) => { setFooterStatus(data.alreadySubscribed ? "success" : "success"); setFooterEmail(""); },
    onError: () => setFooterStatus("error"),
  });
  const handleFooterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!footerEmail) return;
    setFooterStatus("pending");
    footerSubscribe.mutate({ email: footerEmail, source: "footer" });
  };
  const socialItems = [
    { key: "youtube", label: "YouTube", url: socialLinks.youtube },
    { key: "facebook", label: "Facebook", url: socialLinks.facebook },
    { key: "instagram", label: "Instagram", url: socialLinks.instagram },
    { key: "pinterest", label: "Pinterest", url: socialLinks.pinterest },
    { key: "twitter", label: "Twitter/X", url: socialLinks.twitter },
    { key: "tiktok", label: "TikTok", url: socialLinks.tiktok },
  ];
  return (
    <footer
      className="sf-footer"
      style={{
        ["--footer-pad-y" as string]: `${config.footerPaddingY ?? 60}px`,
        ["--footer-m-pad-y" as string]: `${config.footerMobilePaddingY ?? 24}px`,
        ["--footer-nav-font-size" as string]: `${config.footerNavFontSize ?? 14}px`,
        ["--footer-nav-m-font-size" as string]: `${config.footerNavMobileFontSize ?? config.footerNavFontSize ?? 14}px`,
      } as React.CSSProperties}
    >
      {/* Desktop: original 4-column grid */}
      <div className="sf-footer-grid sf-footer-desktop">
        <div className="sf-footer-brand">
          {config.logoImageUrl ? (
            <a href="/"><img src={config.logoImageUrl} alt={config.logoText} style={{ height: 36, objectFit: "contain", marginBottom: 12 }} /></a>
          ) : (
            <a href="/" className="sf-logo">{config.logoText}</a>
          )}
          <p>{config.footerAbout}</p>
          <div className="sf-social-links" style={{ marginTop: 16 }}>
            {socialItems.filter(s => s.url).map(s => (
              <a key={s.key} href={s.url} className="sf-social-link" title={s.label} target="_blank" rel="noopener noreferrer">
                {SOCIAL_ICON_MAP[s.key] || s.label}
              </a>
            ))}
          </div>
        </div>
        {(config.footerColumns && config.footerColumns.length > 0
          ? config.footerColumns
          : [
              { id: "shop", title: "Shop", links: [
                { id: "s1", label: "Shop All", link: "/collections" },
                { id: "s2", label: "New Arrivals", link: "/collections/new-arrivals" },
                { id: "s3", label: "Sale", link: "/collections/sale" },
              ]},
              { id: "company", title: "Company", links: [
                { id: "c1", label: "Our Story", link: "/about" },
                { id: "c2", label: "Blog", link: "/blog" },
                { id: "c3", label: "Sustainability", link: "/sustainability" },
              ]},
              { id: "help", title: "Help", links: [
                { id: "h1", label: "Contact Us", link: "/contact" },
                { id: "h2", label: "Shipping & Returns", link: "/returns" },
                { id: "h3", label: "Size Guide", link: "/size-guide" },
              ]},
            ]
        ).map(col => (
          <div key={col.id} className="sf-footer-col">
            <h4>{col.title}</h4>
            <ul className="sf-footer-links">
              {col.links.map(link => (
                <li key={link.id}><a href={link.link}>{link.label}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Mobile: stacked layout — brand centered on top, nav columns in 3-col row, social at bottom */}
        <div className="sf-footer-mobile">
          {/* Brand + tagline */}
          <div className="sf-footer-mobile-brand">
            {config.logoImageUrl ? (
              <a href="/"><img src={config.logoImageUrl} alt={config.logoText} style={{ height: 36, objectFit: "contain" }} /></a>
            ) : (
              <a href="/" className="sf-logo" style={{ color: "#4CAF82", fontSize: "1.4rem", display: "block", marginBottom: 8 }}>{config.logoText}</a>
            )}
            {config.footerAbout && (
              <p className="sf-footer-mobile-tagline">{config.footerAbout}</p>
            )}
          </div>
          {/* Newsletter */}
          <div className="sf-footer-mobile-newsletter">
            <p className="sf-footer-mobile-newsletter-label">Never miss out</p>
            <p className="sf-footer-mobile-newsletter-sub">Sign up to our newsletter and be the first notified about new arrivals, offers and more.</p>
            {footerStatus === "success" ? (
              <p className="sf-footer-mobile-newsletter-success">✓ You're subscribed!</p>
            ) : (
              <form className="sf-footer-mobile-newsletter-form" onSubmit={handleFooterSubmit}>
                <input
                  type="email"
                  placeholder="E-mail"
                  className="sf-footer-mobile-newsletter-input"
                  value={footerEmail}
                  onChange={e => setFooterEmail(e.target.value)}
                  disabled={footerStatus === "pending"}
                />
                <button
                  type="submit"
                  className="sf-footer-mobile-newsletter-btn"
                  aria-label="Subscribe"
                  disabled={footerStatus === "pending"}
                >
                  {footerStatus === "pending"
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="10" strokeOpacity="0.3" /><path d="M12 2a10 10 0 0 1 10 10" /></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                  }
                </button>
              </form>
            )}
            {footerStatus === "error" && <p className="sf-footer-mobile-newsletter-error">Something went wrong. Please try again.</p>}
          </div>
          {/* Nav links: dynamic columns from admin config */}
          <div className="sf-footer-mobile-nav">
            {(config.footerColumns && config.footerColumns.length > 0
              ? config.footerColumns
              : [
                  { id: "shop", title: "Shop", links: [
                    { id: "s1", label: "Shop All", link: "/collections" },
                    { id: "s2", label: "New Arrivals", link: "/collections/new-arrivals" },
                    { id: "s3", label: "Sale", link: "/collections/sale" },
                  ]},
                  { id: "company", title: "Company", links: [
                    { id: "c1", label: "Our Story", link: "/about" },
                    { id: "c2", label: "Blog", link: "/blog" },
                    { id: "c3", label: "Sustainability", link: "/sustainability" },
                  ]},
                  { id: "help", title: "Help", links: [
                    { id: "h1", label: "Contact Us", link: "/contact" },
                    { id: "h2", label: "Shipping & Returns", link: "/returns" },
                    { id: "h3", label: "Size Guide", link: "/size-guide" },
                  ]},
                ]
            ).map(col => (
              <div key={col.id} className="sf-footer-col">
                <h4>{col.title}</h4>
                <ul className="sf-footer-links">
                  {col.links.map(link => (
                    <li key={link.id}><a href={link.link}>{link.label}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {/* Social icons */}
          <div className="sf-footer-mobile-social">
            {socialItems.filter(s => s.url).map(s => (
              <a key={s.key} href={s.url} className="sf-social-link" title={s.label} target="_blank" rel="noopener noreferrer">
                {SOCIAL_ICON_MAP[s.key] || s.label}
              </a>
            ))}
          </div>
        </div>

      <div className="sf-footer-bottom">
        <p>{config.footerCopyright || `\u00A9 ${new Date().getFullYear()} ${config.logoText}. All rights reserved.`}</p>
      </div>
    </footer>
  );
}
