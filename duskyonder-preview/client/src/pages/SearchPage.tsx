import React, { useState, useMemo, useEffect } from "react";
import { useSearch } from "wouter";
import { useThemeConfig, CollectionSeries } from "@/contexts/ThemeConfigContext";
import { useCart } from "@/contexts/CartContext";
import { SFPromoBar, SFHeader, SFFooter } from "@/components/StorefrontShell";
import { trpc } from "@/lib/trpc";

// ==================== SEARCH PAGE ====================
// Shopify equivalent: /search (search.liquid)
// Shopify API: {{ search.results }} / predictive_search
// Interface: {{ search.terms }}, {{ search.results_count }}, {{ search.results }}

type SortOption = "relevance" | "price-asc" | "price-desc" | "newest";
type FilterType = "all" | "products" | "collections" | "pages";

export default function SearchPage() {
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const initialQuery = params.get("q") || "";

  const { config } = useThemeConfig();
  const { addItem, openCart } = useCart();

  const [query, setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [sort, setSort] = useState<SortOption>("relevance");
  const [filter, setFilter] = useState<FilterType>("all");
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  // Debounce: fire the API call 400ms after the user commits a search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => clearTimeout(timer);
  }, [query]);

  // Live Shopify product search via tRPC
  const { data: liveProducts, isFetching: searchLoading, isError: searchError } = trpc.search.products.useQuery(
    { query: debouncedQuery, limit: 20 },
    { enabled: debouncedQuery.length > 0, staleTime: 30_000 }
  );

  const allSeries = config.seriesList || [];

  const staticPages = [
    { type: "page" as const, id: "about", title: "About Us", desc: "Our story, mission, and values.", url: "/pages/about-us" },
    { type: "page" as const, id: "fabric", title: "Fabric Guide", desc: "Learn about our eco-friendly fabrics and materials.", url: "/pages/fabric-guide" },
    { type: "page" as const, id: "size", title: "Size Guide", desc: "Find your perfect fit with our comprehensive size chart.", url: "/pages/size-guide" },
    { type: "page" as const, id: "returns", title: "Returns & Exchanges", desc: "Our hassle-free return policy.", url: "/pages/returns" },
    { type: "page" as const, id: "blog", title: "Blog", desc: "Activewear tips, style guides, and brand stories.", url: "/pages/blog" },
    { type: "page" as const, id: "influencer", title: "Influencer Program", desc: "Join our creator community.", url: "/pages/influencer" },
  ];

  const results = useMemo(() => {
    if (!query.trim()) return { products: [], collections: [], pages: [] };
    const q = query.toLowerCase();

    // Live Shopify products mapped to the product card shape
    const products = (liveProducts ?? []).map((p) => ({
      type: "product" as const,
      id: p.id,
      title: p.title,
      price: p.price,
      badge: undefined as string | undefined,
      imageUrl: p.imageUrl,
      colors: [] as string[],
      url: p.url,
      variantId: p.variantId,
    }));

    const collections = allSeries
      .filter((s: CollectionSeries) => s.name.toLowerCase().includes(q) || (s.description || "").toLowerCase().includes(q) || s.label.toLowerCase().includes(q))
      .map((s: CollectionSeries) => ({ type: "collection" as const, id: s.id, title: s.name, desc: s.description || s.label, imageUrl: s.imageUrl, url: s.link || `/collections/${s.id}` }));

    const pages = staticPages.filter((p) => p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));

    return { products, collections, pages };
  }, [query, liveProducts, allSeries]);

  const sortedProducts = useMemo(() => {
    const list = [...results.products];
    if (sort === "price-asc") list.sort((a, b) => parseFloat(a.price.replace("$", "")) - parseFloat(b.price.replace("$", "")));
    if (sort === "price-desc") list.sort((a, b) => parseFloat(b.price.replace("$", "")) - parseFloat(a.price.replace("$", "")));
    return list;
  }, [results.products, sort]);

  const totalCount =
    (filter === "all" ? results.products.length + results.collections.length + results.pages.length : 0) +
    (filter === "products" ? results.products.length : 0) +
    (filter === "collections" ? results.collections.length : 0) +
    (filter === "pages" ? results.pages.length : 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(inputValue);
    // Update URL: window.history.replaceState(null, "", `/search?q=${encodeURIComponent(inputValue)}`);
    window.history.replaceState(null, "", `/search?q=${encodeURIComponent(inputValue)}`);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF9F7" }}>
      <SFPromoBar />
      <SFHeader darkMode />

      {/* Search header */}
      <div
        style={{
          marginTop: "calc(var(--promo-height, 40px) + 64px)",
          background: "#0D3D2B",
          padding: "48px 24px 40px",
          color: "#fff",
        }}
      >
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.6, marginBottom: 16, textAlign: "center" }}>
            SEARCH
          </div>
          <form onSubmit={handleSearch}>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search products, collections, guides..."
                autoFocus
                style={{
                  width: "100%",
                  padding: "16px 56px 16px 20px",
                  fontSize: "1.1rem",
                  border: "none",
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.12)",
                  color: "#fff",
                  outline: "none",
                  boxSizing: "border-box",
                  letterSpacing: "0.01em",
                }}
              />
              <button
                type="submit"
                style={{
                  position: "absolute",
                  right: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.7)",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            </div>
          </form>
          {query && (
            <div style={{ textAlign: "center", marginTop: 16, fontSize: "0.85rem", opacity: 0.7 }}>
              {/* Shopify Liquid: {{ search.results_count }} results for "{{ search.terms }}" */}
              {totalCount} result{totalCount !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 80px" }}>
        {!query.trim() ? (
          /* No query state */
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <h2 style={{ fontFamily: "'Tenor Sans', sans-serif", fontSize: "2rem", fontWeight: 400, color: "#1A1A1A", margin: "0 0 16px" }}>
              What are you looking for?
            </h2>
            <p style={{ fontSize: "0.88rem", color: "#888", marginBottom: 32 }}>Try searching for a product, collection, or topic.</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              {["Leggings", "Sports Bra", "New Arrivals", "Best Sellers", "Eco-Friendly", "Size Guide"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => { setInputValue(tag); setQuery(tag); window.history.replaceState(null, "", `/search?q=${encodeURIComponent(tag)}`); }}
                  style={{ padding: "8px 18px", border: "1.5px solid #d0ccc7", borderRadius: 2, background: "transparent", color: "#555", fontSize: "0.82rem", cursor: "pointer" }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        ) : searchLoading ? (
          /* Loading state */
          <div style={{ textAlign: "center", padding: "60px 0", color: "#888", fontSize: "0.9rem" }}>
            Searching for &ldquo;{query}&rdquo;…
          </div>
        ) : searchError ? (
          /* Error state */
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <h2 style={{ fontFamily: "'Tenor Sans', sans-serif", fontSize: "2rem", fontWeight: 400, color: "#1A1A1A", margin: "0 0 16px" }}>Search unavailable</h2>
            <p style={{ fontSize: "0.88rem", color: "#888" }}>Something went wrong. Please try again in a moment.</p>
          </div>
        ) : totalCount === 0 ? (
          /* No results */
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <h2 style={{ fontFamily: "'Tenor Sans', sans-serif", fontSize: "2rem", fontWeight: 400, color: "#1A1A1A", margin: "0 0 16px" }}>
              No results found
            </h2>
            <p style={{ fontSize: "0.88rem", color: "#888", marginBottom: 32 }}>
              We couldn't find anything matching &ldquo;{query}&rdquo;. Try a different search term.
            </p>
            <a href="/collections" style={{ display: "inline-block", padding: "12px 32px", background: "#0D3D2B", color: "#fff", borderRadius: 2, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none" }}>
              Browse All Collections
            </a>
          </div>
        ) : (
          <>
            {/* Filter + Sort bar */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 32, paddingBottom: 20, borderBottom: "1px solid #e8e4df" }}>
              {/* Filter tabs */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {([["all", `All (${results.products.length + results.collections.length + results.pages.length})`], ["products", `Products (${results.products.length})`], ["collections", `Collections (${results.collections.length})`], ["pages", `Pages (${results.pages.length})`]] as const).map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => setFilter(id)}
                    style={{
                      padding: "7px 16px",
                      borderRadius: 2,
                      border: `1.5px solid ${filter === id ? "#0D3D2B" : "#d0ccc7"}`,
                      background: filter === id ? "#0D3D2B" : "transparent",
                      color: filter === id ? "#fff" : "#555",
                      fontSize: "0.78rem",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Sort (products only) */}
              {(filter === "all" || filter === "products") && results.products.length > 0 && (
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  style={{ padding: "7px 12px", border: "1px solid #d0ccc7", borderRadius: 2, fontSize: "0.78rem", color: "#555", background: "#fff", cursor: "pointer" }}
                >
                  <option value="relevance">Sort: Relevance</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="newest">Newest</option>
                </select>
              )}
            </div>

            {/* Products section */}
            {(filter === "all" || filter === "products") && sortedProducts.length > 0 && (
              <div style={{ marginBottom: 48 }}>
                {filter === "all" && (
                  <h2 style={{ fontFamily: "'Tenor Sans', sans-serif", fontSize: "1.5rem", fontWeight: 400, margin: "0 0 20px", color: "#1A1A1A" }}>
                    Products
                  </h2>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 }}>
                  {sortedProducts.map((p) => {
                    // Append width=600 for high-res Shopify CDN image
                    const hiResUrl = p.imageUrl
                      ? p.imageUrl.includes("?")
                        ? `${p.imageUrl}&width=600`
                        : `${p.imageUrl}?width=600`
                      : "";
                    return (
                    <div key={p.id} style={{ background: "#fff", borderRadius: 4, overflow: "visible", boxShadow: "0 1px 8px rgba(0,0,0,0.07)" }}>
                      {/* Image — forced 3:4 aspect, full image visible (object-contain) */}
                      <a href={p.url} style={{ display: "block", aspectRatio: "3/4", background: "#F5F3F0", overflow: "hidden", borderRadius: "4px 4px 0 0", position: "relative" }}>
                        {hiResUrl ? (
                          <img src={hiResUrl} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(0,0,0,0.2)", fontSize: "0.75rem" }}>No image</div>
                        )}
                        {p.badge && (
                          <div style={{ position: "absolute", top: 10, left: 10, background: "#175C40", color: "#fff", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", padding: "3px 7px", borderRadius: 2, textTransform: "uppercase" }}>
                            {p.badge}
                          </div>
                        )}
                      </a>
                      <div style={{ padding: "16px 16px 18px" }}>
                        <a href={p.url} style={{ textDecoration: "none", color: "inherit" }}>
                          <div style={{ fontSize: "1rem", fontWeight: 600, color: "#1A1A1A", marginBottom: 8, lineHeight: 1.35 }}>{p.title}</div>
                        </a>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 14 }}>
                          <span style={{ fontSize: "1rem", fontWeight: 700, color: "#175C40" }}>{p.price}</span>
                          {p.colors && p.colors.length > 0 && (
                            <div style={{ display: "flex", gap: 4 }}>
                              {p.colors.slice(0, 4).map((c, ci) => (
                                <div key={ci} style={{ width: 14, height: 14, borderRadius: "50%", background: c, border: "1px solid rgba(0,0,0,0.1)" }} />
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => { addItem({ variantId: (p as any).variantId || p.id, name: p.title, price: p.price, imageUrl: p.imageUrl }); openCart(); }}
                          style={{ width: "100%", padding: "10px 0", background: "#0D3D2B", color: "#fff", border: "none", borderRadius: 2, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Collections section */}
            {(filter === "all" || filter === "collections") && results.collections.length > 0 && (
              <div style={{ marginBottom: 48 }}>
                {filter === "all" && (
                  <h2 style={{ fontFamily: "'Tenor Sans', sans-serif", fontSize: "1.5rem", fontWeight: 400, margin: "0 0 20px", color: "#1A1A1A" }}>
                    Collections
                  </h2>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                  {results.collections.map((c) => (
                    <a
                      key={c.id}
                      href={c.url}
                      style={{ display: "flex", gap: 16, padding: "16px", background: "#fff", borderRadius: 4, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", textDecoration: "none", color: "inherit", alignItems: "center" }}
                    >
                      <div style={{ width: 64, height: 64, borderRadius: 4, background: "#1A3D2B", flexShrink: 0, overflow: "hidden" }}>
                        {c.imageUrl && <img src={c.imageUrl} alt={c.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                      </div>
                      <div>
                        <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1A1A1A", marginBottom: 4 }}>{c.title}</div>
                        {c.desc && <div style={{ fontSize: "0.78rem", color: "#888", lineHeight: 1.5 }}>{c.desc}</div>}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Pages section */}
            {(filter === "all" || filter === "pages") && results.pages.length > 0 && (
              <div>
                {filter === "all" && (
                  <h2 style={{ fontFamily: "'Tenor Sans', sans-serif", fontSize: "1.5rem", fontWeight: 400, margin: "0 0 20px", color: "#1A1A1A" }}>
                    Pages
                  </h2>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {results.pages.map((p) => (
                    <a
                      key={p.id}
                      href={p.url}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "#fff", borderRadius: 4, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", textDecoration: "none", color: "inherit" }}
                    >
                      <div>
                        <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1A1A1A", marginBottom: 4 }}>{p.title}</div>
                        <div style={{ fontSize: "0.78rem", color: "#888" }}>{p.desc}</div>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
                        <polyline points="9,18 15,12 9,6" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <SFFooter />
    </div>
  );
}
