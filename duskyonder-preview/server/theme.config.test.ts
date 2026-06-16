import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the DB helpers to avoid real DB calls in unit tests
vi.mock("./db", () => ({
  getAllThemeConfigs: vi.fn().mockResolvedValue([
    { key: "themeConfig", value: JSON.stringify({ heroHeight: 600, heroBtnShape: "square" }) },
  ]),
  setThemeConfig: vi.fn().mockResolvedValue(undefined),
  getAllUploadedImages: vi.fn().mockResolvedValue([]),
  upsertUploadedImage: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "/manus-storage/test.jpg", key: "test.jpg" }),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("theme.getAll", () => {
  it("returns configs and images", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.theme.getAll();
    expect(result).toHaveProperty("configs");
    expect(result).toHaveProperty("images");
    expect(Array.isArray(result.configs)).toBe(true);
    expect(Array.isArray(result.images)).toBe(true);
  });
});

describe("theme.setConfig", () => {
  it("saves a config key/value and returns success", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.theme.setConfig({ key: "themeConfig", value: '{"heroHeight":700}' });
    expect(result).toEqual({ success: true });
  });
});
