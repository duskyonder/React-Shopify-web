import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("About Us config via theme procedures", () => {
  it("theme.setConfig stores a key-value pair and getAll returns it", async () => {
    const caller = appRouter.createCaller(createPublicCtx());

    // Set a config value representing an About Us field
    const setResult = await caller.theme.setConfig({
      key: "aboutUs_heroHeadline",
      value: "BEYOND THE HORIZON",
    });
    expect(setResult).toEqual({ success: true });

    // Retrieve all configs (Record<string, string>) and verify the stored value
    const { configs } = await caller.theme.getAll();
    expect(configs["aboutUs_heroHeadline"]).toBe("BEYOND THE HORIZON");
  });

  it("theme.setConfig can store JSON-serialised About Us section order", async () => {
    const caller = appRouter.createCaller(createPublicCtx());

    const sectionOrder = [
      { key: "au-hero", visible: true },
      { key: "au-story", visible: false },
    ];

    await caller.theme.setConfig({
      key: "aboutUs_sectionOrder",
      value: JSON.stringify(sectionOrder),
    });

    const { configs } = await caller.theme.getAll();
    expect(configs["aboutUs_sectionOrder"]).toBeDefined();
    const parsed = JSON.parse(configs["aboutUs_sectionOrder"]);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].key).toBe("au-hero");
    expect(parsed[1].visible).toBe(false);
  });

  it("theme.setConfig overwrites an existing key", async () => {
    const caller = appRouter.createCaller(createPublicCtx());

    await caller.theme.setConfig({ key: "aboutUs_ctaTitle", value: "First" });
    await caller.theme.setConfig({ key: "aboutUs_ctaTitle", value: "Updated" });

    const { configs } = await caller.theme.getAll();
    expect(configs["aboutUs_ctaTitle"]).toBe("Updated");
  });

  it("theme.setConfig handles all 7 About Us section keys", async () => {
    const caller = appRouter.createCaller(createPublicCtx());

    const sectionKeys = [
      "au-hero",
      "au-story",
      "au-principles",
      "au-product-philosophy",
      "au-stats",
      "au-universe",
      "au-cta",
    ];

    const setResult = await caller.theme.setConfig({
      key: "aboutUs_allSectionKeys",
      value: JSON.stringify(sectionKeys),
    });
    expect(setResult).toEqual({ success: true });

    const { configs } = await caller.theme.getAll();
    const parsed = JSON.parse(configs["aboutUs_allSectionKeys"]);
    expect(parsed).toHaveLength(7);
    expect(parsed).toContain("au-hero");
    expect(parsed).toContain("au-cta");
  });
});
