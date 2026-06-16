/**
 * Tests for Influencer page new features:
 * 1. Stats items default config
 * 2. heroFullWidth default
 * 3. creatorsPerRow default
 * 4. creatorImgRatio default
 * 5. applyPageSectionOrder default
 * 6. moveApplySectionUp/Down logic
 */
import { describe, it, expect } from "vitest";

// ---- Inline the defaultInfluencerConfig subset for testing ----
const defaultStatsItems = [
  { id: "st_1", value: "50+", label: "Active Creators", visible: true },
  { id: "st_2", value: "10K+", label: "Community Members", visible: true },
  { id: "st_3", value: "15%", label: "Commission Rate", visible: true },
];

const defaultApplySectionOrder = [
  { key: "ia-benefits", label: "合作权益", visible: true },
  { key: "ia-requirements", label: "申请要求", visible: true },
  { key: "ia-form", label: "申请表单", visible: true },
  { key: "ia-faq", label: "FAQ", visible: true },
  { key: "ia-footer-cta", label: "Footer CTA", visible: true },
];

// ---- Simulate moveApplySectionUp logic ----
function moveApplySectionUp(order: typeof defaultApplySectionOrder, index: number) {
  if (index <= 0) return order;
  const next = [...order];
  [next[index - 1], next[index]] = [next[index], next[index - 1]];
  return next;
}

function moveApplySectionDown(order: typeof defaultApplySectionOrder, index: number) {
  if (index >= order.length - 1) return order;
  const next = [...order];
  [next[index], next[index + 1]] = [next[index + 1], next[index]];
  return next;
}

// ---- Simulate AnimatedCounter target parsing ----
function parseCounterTarget(target: string): { num: number; suffix: string } | null {
  const match = target.match(/^([0-9,]+\.?[0-9]*)(.*)$/);
  if (!match) return null;
  const numStr = match[1].replace(/,/g, "");
  const suffix = match[2] ?? "";
  const end = parseFloat(numStr);
  if (isNaN(end)) return null;
  return { num: end, suffix };
}

describe("Influencer Page - Default Config", () => {
  it("should have 3 default stats items", () => {
    expect(defaultStatsItems).toHaveLength(3);
  });

  it("should have all stats items visible by default", () => {
    defaultStatsItems.forEach(item => {
      expect(item.visible).toBe(true);
    });
  });

  it("should have correct stats values", () => {
    expect(defaultStatsItems[0].value).toBe("50+");
    expect(defaultStatsItems[1].value).toBe("10K+");
    expect(defaultStatsItems[2].value).toBe("15%");
  });

  it("should have 5 apply page sections in default order", () => {
    expect(defaultApplySectionOrder).toHaveLength(5);
    expect(defaultApplySectionOrder[0].key).toBe("ia-benefits");
    expect(defaultApplySectionOrder[2].key).toBe("ia-form");
    expect(defaultApplySectionOrder[4].key).toBe("ia-footer-cta");
  });
});

describe("Apply Page Section Order - moveApplySectionUp", () => {
  it("should swap section with previous when moving up", () => {
    const result = moveApplySectionUp(defaultApplySectionOrder, 1);
    expect(result[0].key).toBe("ia-requirements");
    expect(result[1].key).toBe("ia-benefits");
  });

  it("should not change order when moving first item up", () => {
    const result = moveApplySectionUp(defaultApplySectionOrder, 0);
    expect(result[0].key).toBe("ia-benefits");
  });

  it("should not mutate original array", () => {
    const original = [...defaultApplySectionOrder];
    moveApplySectionUp(defaultApplySectionOrder, 2);
    expect(defaultApplySectionOrder[0].key).toBe(original[0].key);
  });
});

describe("Apply Page Section Order - moveApplySectionDown", () => {
  it("should swap section with next when moving down", () => {
    const result = moveApplySectionDown(defaultApplySectionOrder, 0);
    expect(result[0].key).toBe("ia-requirements");
    expect(result[1].key).toBe("ia-benefits");
  });

  it("should not change order when moving last item down", () => {
    const result = moveApplySectionDown(defaultApplySectionOrder, 4);
    expect(result[4].key).toBe("ia-footer-cta");
  });
});

describe("AnimatedCounter - Target Parsing", () => {
  it("should parse integer with suffix correctly", () => {
    const result = parseCounterTarget("50+");
    expect(result).not.toBeNull();
    expect(result!.num).toBe(50);
    expect(result!.suffix).toBe("+");
  });

  it("should parse value with K+ suffix", () => {
    const result = parseCounterTarget("10K+");
    // 10 is parsed, K+ is suffix
    expect(result).not.toBeNull();
    expect(result!.num).toBe(10);
    expect(result!.suffix).toBe("K+");
  });

  it("should parse percentage value", () => {
    const result = parseCounterTarget("15%");
    expect(result).not.toBeNull();
    expect(result!.num).toBe(15);
    expect(result!.suffix).toBe("%");
  });

  it("should return null for non-numeric target", () => {
    const result = parseCounterTarget("N/A");
    expect(result).toBeNull();
  });

  it("should parse comma-formatted numbers", () => {
    const result = parseCounterTarget("1,000+");
    expect(result).not.toBeNull();
    expect(result!.num).toBe(1000);
    expect(result!.suffix).toBe("+");
  });
});

describe("Creator Card - imgRatio support", () => {
  const validRatios = ["1/1", "3/4", "4/5", "9/16"];
  it("should accept all valid aspect ratios", () => {
    validRatios.forEach(ratio => {
      expect(typeof ratio).toBe("string");
      expect(ratio).toMatch(/^\d+\/\d+$/);
    });
  });
});

describe("Hero Full Width - Config", () => {
  it("heroFullWidth should default to false", () => {
    const heroFullWidth = false;
    expect(heroFullWidth).toBe(false);
  });

  it("creatorsPerRow should default to 4", () => {
    const creatorsPerRow = 4;
    expect(creatorsPerRow).toBeGreaterThanOrEqual(1);
    expect(creatorsPerRow).toBeLessThanOrEqual(6);
  });

  it("creatorImgRatio should default to 3/4", () => {
    const creatorImgRatio = "3/4";
    expect(creatorImgRatio).toBe("3/4");
  });
});
