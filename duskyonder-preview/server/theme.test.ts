import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock the db module
vi.mock("./db", () => ({
  getAllThemeConfigs: vi.fn().mockResolvedValue({}),
  setThemeConfig: vi.fn().mockResolvedValue(undefined),
  getAllUploadedImages: vi.fn().mockResolvedValue({}),
  upsertUploadedImage: vi.fn().mockResolvedValue(undefined),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
}));

// Mock storage
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "/manus-storage/test.jpg", key: "test.jpg" }),
}));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("theme.getAll", () => {
  it("returns configs and images objects", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.theme.getAll();
    expect(result).toHaveProperty("configs");
    expect(result).toHaveProperty("images");
    expect(typeof result.configs).toBe("object");
    expect(typeof result.images).toBe("object");
  });
});

describe("theme.setConfig", () => {
  it("saves a config key/value pair", async () => {
    const { setThemeConfig } = await import("./db");
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.theme.setConfig({ key: "testKey", value: "testValue" });
    expect(result.success).toBe(true);
    expect(setThemeConfig).toHaveBeenCalledWith("testKey", "testValue");
  });
});

describe("theme.uploadImage", () => {
  it("uploads an image and returns url", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.theme.uploadImage({
      section: "slideshow",
      slot: "slide_1",
      base64: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJQAB/9k=",
      mimeType: "image/jpeg",
      originalName: "test.jpg",
    });
    expect(result).toHaveProperty("url");
    expect(result).toHaveProperty("key");
    expect(result.url).toBe("/manus-storage/test.jpg");
  });
});

describe("auth.logout", () => {
  it("clears session cookie", async () => {
    const clearedCookies: any[] = [];
    const ctx: TrpcContext = {
      user: {
        id: 1, openId: "test", email: "t@t.com", name: "Test",
        loginMethod: "manus", role: "user",
        createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
      },
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: (name: string, opts: any) => clearedCookies.push({ name, opts }) } as unknown as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
    expect(clearedCookies).toHaveLength(1);
  });
});
