import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { getAllThemeConfigs, setThemeConfig, getAllUploadedImages, upsertUploadedImage } from "./db";
import { storagePut } from "./storage";
import { getShopifyConfig, setShopifyConfig, getAllShopifyConfigs, uploadToShopifyFiles, listShopifyFiles } from "./shopifyConfig";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Theme configuration
  theme: router({
    getAll: publicProcedure.query(async () => {
      const configs = await getAllThemeConfigs();
      const images = await getAllUploadedImages();
      return { configs, images };
    }),

    setConfig: publicProcedure
      .input(z.object({ key: z.string(), value: z.string() }))
      .mutation(async ({ input }) => {
        await setThemeConfig(input.key, input.value);
        return { success: true };
      }),

    // List images from Shopify Files (for the image picker dialog)
    listFiles: publicProcedure
      .input(z.object({
        first: z.number().optional().default(50),
        after: z.string().optional(),
        query: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await listShopifyFiles(input);
      }),

    uploadImage: publicProcedure
      .input(z.object({
        section: z.string(),
        slot: z.string(),
        base64: z.string(),
        mimeType: z.string(),
        originalName: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const ext = input.mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
        const filename = input.originalName
          ? input.originalName.replace(/[^a-zA-Z0-9._-]/g, '_')
          : `${input.section}-${input.slot}-${Date.now()}.${ext}`;
        // Upload to Shopify Files (CDN) instead of Manus storage
        const url = await uploadToShopifyFiles(input.base64, input.mimeType, filename);
        // Also record in local DB for reference (non-blocking)
        upsertUploadedImage({
          section: input.section,
          slot: input.slot,
          s3Key: `shopify:${filename}`,
          url,
          originalName: input.originalName,
        }).catch((err) => console.warn('DB record failed (non-fatal):', err));
        return { url, key: `shopify:${filename}` };
      }),
  }),

  // Site configuration via Shopify Metaobjects
  siteConfig: router({
    // Get all config sections at once (used by storefront)
    getAll: publicProcedure.query(async () => {
      return await getAllShopifyConfigs();
    }),

    // Get a single config section by key
    get: publicProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        return await getShopifyConfig(input.key);
      }),

    // Save a config section (used by admin editor)
    set: publicProcedure
      .input(z.object({ key: z.string(), value: z.unknown() }))
      .mutation(async ({ input }) => {
        await setShopifyConfig(input.key, input.value);
        return { success: true };
      }),
  }),

  // Shopify navigation menus
  navigation: router({
    getMenu: publicProcedure
      .input(z.object({ handle: z.string() }))
      .query(async ({ input }) => {
        const shopifyDomain = process.env.VITE_SHOPIFY_STORE_DOMAIN || "";
        const storefrontToken = process.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN || "";
        if (!shopifyDomain || !storefrontToken) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Shopify credentials not configured" });
        }
        const gql = `
          query GetMenu($handle: String!) {
            menu(handle: $handle) {
              handle title
              items {
                id title url type
                items {
                  id title url type
                  items { id title url type }
                }
              }
            }
          }
        `;
        const res = await fetch(`https://${shopifyDomain}/api/2024-10/graphql.json`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": storefrontToken,
          },
          body: JSON.stringify({ query: gql, variables: { handle: input.handle } }),
        });
        const json = await res.json() as any;
        if (json.errors) {
          throw new TRPCError({ code: "BAD_REQUEST", message: json.errors[0]?.message ?? "Shopify API error" });
        }
        return json.data?.menu ?? null;
      }),
  }),
});

export type AppRouter = typeof appRouter;
