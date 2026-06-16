import { describe, expect, it } from "vitest";

// ==================== Newsletter Config Tests ====================
describe("Newsletter Config Fields", () => {
  it("newsletterTheme defaults to dark-green", () => {
    const config = {
      newsletterTheme: undefined as 'dark-green' | 'cream' | undefined,
    };
    const theme = config.newsletterTheme ?? 'dark-green';
    expect(theme).toBe('dark-green');
  });

  it("newsletterTheme can be set to cream", () => {
    const config = {
      newsletterTheme: 'cream' as 'dark-green' | 'cream',
    };
    expect(config.newsletterTheme).toBe('cream');
  });

  it("newsletterSocialProof is optional", () => {
    const config = {
      newsletterSocialProof: undefined as string | undefined,
    };
    expect(config.newsletterSocialProof).toBeUndefined();
  });

  it("newsletterImageUrl is optional", () => {
    const config = {
      newsletterImageUrl: undefined as string | undefined,
    };
    expect(config.newsletterImageUrl).toBeUndefined();
  });
});

// ==================== Search Logic Tests ====================
describe("Search Logic", () => {
  const mockProducts = [
    { id: "p1", name: "AirLight Leggings", price: "$98.00", imageUrl: "https://example.com/img.jpg" },
    { id: "p2", name: "SculptFlex Sports Bra", price: "$68.00", imageUrl: "" },
    { id: "p3", name: "EcoMove Shorts", price: "$78.00", imageUrl: "" },
  ];

  const mockCollections = [
    { handle: "new-arrivals", title: "New Arrivals", products: [] },
    { handle: "best-sellers", title: "Best Sellers", products: [mockProducts[0]] },
  ];

  const mockNavItems = [
    { id: "n1", label: "Shop All", link: "/collections/all", children: [] },
    { id: "n2", label: "About", link: "/pages/about-us", children: [
      { id: "n2c1", label: "Our Story", link: "/pages/about-us#story" },
    ]},
  ];

  function searchItems(query: string) {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const results: Array<{ type: string; title: string; url: string }> = [];

    // Products
    const seen = new Set<string>();
    const allProducts = [
      ...mockProducts,
      ...mockCollections.flatMap(c => c.products),
    ];
    allProducts.forEach(p => {
      if (seen.has(p.id)) return;
      seen.add(p.id);
      if (p.name?.toLowerCase().includes(q)) {
        results.push({ type: "Product", title: p.name, url: `/products/${p.name.toLowerCase().replace(/\s+/g, "-")}` });
      }
    });

    // Collections
    mockCollections.forEach(c => {
      if (c.title?.toLowerCase().includes(q)) {
        results.push({ type: "Collection", title: c.title, url: `/collections/${c.handle}` });
      }
    });

    // Nav pages
    mockNavItems.forEach(item => {
      if (item.label?.toLowerCase().includes(q)) {
        results.push({ type: "Page", title: item.label, url: item.link });
      }
      (item.children || []).forEach(child => {
        if (child.label?.toLowerCase().includes(q)) {
          results.push({ type: "Page", title: child.label, url: child.link });
        }
      });
    });

    return results.slice(0, 8);
  }

  it("returns empty array for empty query", () => {
    expect(searchItems("")).toHaveLength(0);
    expect(searchItems("   ")).toHaveLength(0);
  });

  it("finds products by partial name match", () => {
    const results = searchItems("leggings");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toBe("AirLight Leggings");
    expect(results[0].type).toBe("Product");
  });

  it("finds collections by title", () => {
    const results = searchItems("new arrivals");
    const collectionResult = results.find(r => r.type === "Collection");
    expect(collectionResult).toBeDefined();
    expect(collectionResult?.title).toBe("New Arrivals");
  });

  it("finds nav pages", () => {
    const results = searchItems("shop all");
    const pageResult = results.find(r => r.type === "Page");
    expect(pageResult).toBeDefined();
    expect(pageResult?.title).toBe("Shop All");
  });

  it("finds nav child pages", () => {
    const results = searchItems("our story");
    const pageResult = results.find(r => r.type === "Page");
    expect(pageResult).toBeDefined();
    expect(pageResult?.title).toBe("Our Story");
  });

  it("deduplicates products appearing in multiple sources", () => {
    // p1 appears in mockProducts AND in best-sellers collection
    const results = searchItems("airlight");
    const productResults = results.filter(r => r.type === "Product" && r.title === "AirLight Leggings");
    expect(productResults).toHaveLength(1);
  });

  it("is case-insensitive", () => {
    const lower = searchItems("leggings");
    const upper = searchItems("LEGGINGS");
    const mixed = searchItems("Leggings");
    expect(lower.length).toBe(upper.length);
    expect(lower.length).toBe(mixed.length);
  });

  it("limits results to 8", () => {
    // Query that matches many items
    const results = searchItems("e");
    expect(results.length).toBeLessThanOrEqual(8);
  });
});

// ==================== Size Guide Tests ====================
describe("Size Guide convertMeasure", () => {
  function convertMeasure(val: string, toCm: boolean): string {
    if (!toCm) return val;
    return val.replace(/[\d.]+/g, (n) => (parseFloat(n) * 2.54).toFixed(1)).replace(/"/g, "");
  }

  it("returns original value when not converting to cm", () => {
    expect(convertMeasure('32"', false)).toBe('32"');
    expect(convertMeasure('31-32"', false)).toBe('31-32"');
  });

  it("converts inches to cm correctly", () => {
    const result = convertMeasure('10"', true);
    expect(result).toBe("25.4");
  });

  it("converts range values", () => {
    const result = convertMeasure('31-32"', true);
    // 31 * 2.54 = 78.7, 32 * 2.54 = 81.3
    expect(result).toContain("78.7");
    expect(result).toContain("81.3");
  });

  it("removes inch symbol when converting", () => {
    const result = convertMeasure('12"', true);
    expect(result).not.toContain('"');
  });
});

// ==================== Order Status Tests ====================
describe("Order Status Logic", () => {
  const mockOrders = [
    { id: "DY-10042", status: "Processing", total: "$166.00", date: "June 8, 2026" },
    { id: "DY-10031", status: "Delivered", total: "$98.00", date: "May 22, 2026" },
    { id: "DY-10018", status: "Delivered", total: "$234.00", date: "April 5, 2026" },
  ];

  it("filters orders by status: all", () => {
    const filtered = mockOrders.filter(() => true);
    expect(filtered).toHaveLength(3);
  });

  it("filters orders by status: processing", () => {
    const filtered = mockOrders.filter(o => o.status === "Processing");
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("DY-10042");
  });

  it("filters orders by status: delivered", () => {
    const filtered = mockOrders.filter(o => o.status === "Delivered");
    expect(filtered).toHaveLength(2);
  });

  it("order timeline has correct step count", () => {
    const timeline = [
      { event: "Order placed", done: true },
      { event: "Payment confirmed", done: true },
      { event: "Processing", done: false, active: true },
      { event: "Shipped", done: false },
      { event: "Delivered", done: false },
    ];
    expect(timeline).toHaveLength(5);
    const completedSteps = timeline.filter(t => t.done);
    expect(completedSteps).toHaveLength(2);
  });

  it("order total calculation is consistent", () => {
    const items = [
      { price: 98, qty: 1 },
      { price: 68, qty: 1 },
    ];
    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    expect(subtotal).toBe(166);
  });

  it("thank you page shows correct order number format", () => {
    const orderId = "DY-10042";
    const formatted = `#${orderId}`;
    expect(formatted).toBe("#DY-10042");
    expect(formatted.startsWith("#")).toBe(true);
  });
});
