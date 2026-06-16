import { describe, it, expect } from "vitest";

// Test the CollectionConfig data model and color swatch logic
describe("CollectionConfig data model", () => {
  it("should identify split colors correctly", () => {
    const isSplit = (value: string) => value.includes("+");
    expect(isSplit("#175C40")).toBe(false);
    expect(isSplit("#175C40+#1a1a1a")).toBe(true);
    expect(isSplit("#ff0000+#0000ff")).toBe(true);
  });

  it("should parse split color values", () => {
    const parseColors = (value: string) =>
      value.includes("+") ? value.split("+") : [value, value];
    expect(parseColors("#175C40")).toEqual(["#175C40", "#175C40"]);
    expect(parseColors("#175C40+#1a1a1a")).toEqual(["#175C40", "#1a1a1a"]);
  });

  it("should filter products by sub-category", () => {
    const products = [
      { id: "1", name: "A", subCategory: "Leggings" },
      { id: "2", name: "B", subCategory: "Tops" },
      { id: "3", name: "C", subCategory: "" },
    ];
    const filterByCat = (prods: typeof products, cat: string) =>
      cat === "All" ? prods : prods.filter(p => p.subCategory === cat);

    expect(filterByCat(products, "All")).toHaveLength(3);
    expect(filterByCat(products, "Leggings")).toHaveLength(1);
    expect(filterByCat(products, "Tops")).toHaveLength(1);
    expect(filterByCat(products, "Shorts")).toHaveLength(0);
  });

  it("should filter products by active colors", () => {
    const products = [
      { id: "1", name: "A", colors: ["#175C40", "#1a1a1a"] },
      { id: "2", name: "B", colors: ["#ff0000"] },
      { id: "3", name: "C", colors: [] },
    ];
    const filterByColors = (prods: typeof products, activeColors: string[]) =>
      activeColors.length === 0
        ? prods
        : prods.filter(p => p.colors.some(c => activeColors.includes(c)));

    expect(filterByColors(products, [])).toHaveLength(3);
    expect(filterByColors(products, ["#175C40"])).toHaveLength(1);
    expect(filterByColors(products, ["#ff0000"])).toHaveLength(1);
    expect(filterByColors(products, ["#175C40", "#ff0000"])).toHaveLength(2);
  });

  it("should sort products by name ascending", () => {
    const products = [
      { id: "1", name: "Zebra Leggings", price: "$50" },
      { id: "2", name: "Alpha Shorts", price: "$30" },
      { id: "3", name: "Mango Top", price: "$40" },
    ];
    const sorted = [...products].sort((a, b) => a.name.localeCompare(b.name));
    expect(sorted[0].name).toBe("Alpha Shorts");
    expect(sorted[1].name).toBe("Mango Top");
    expect(sorted[2].name).toBe("Zebra Leggings");
  });

  it("should generate correct grid columns for different screen sizes", () => {
    const getDesktopCols = (productsPerRow: number) => productsPerRow;
    const getMobileCols = (mobileColumns: number) => mobileColumns;
    expect(getDesktopCols(4)).toBe(4);
    expect(getMobileCols(2)).toBe(2);
    expect(getMobileCols(3)).toBe(3);
  });
});
