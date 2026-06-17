// Vercel Serverless Function entry point
// Exposes only the routes needed by the storefront and admin editor:
//   - /api/trpc/siteConfig.*  (Shopify Metaobjects-based config, no DB needed)
//   - /api/trpc/navigation.*  (Shopify Storefront menu queries, no DB needed)
// All other routes (auth, theme, storage) require Manus platform env vars
// and are intentionally excluded from this Vercel deployment.

import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { z } from "zod";
import { router, publicProcedure } from "../server/_core/trpc";
import { getShopifyConfig, setShopifyConfig, getAllShopifyConfigs } from "../server/shopifyConfig";
import { TRPCError } from "@trpc/server";
import path from "path";
import fs from "fs";

// Minimal router with only Shopify-backed routes (no DB dependency)
const vercelRouter = router({
  siteConfig: router({
    getAll: publicProcedure.query(async () => {
      return await getAllShopifyConfigs();
    }),
    get: publicProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        return await getShopifyConfig(input.key);
      }),
    set: publicProcedure
      .input(z.object({ key: z.string(), value: z.unknown() }))
      .mutation(async ({ input }) => {
        await setShopifyConfig(input.key, input.value);
        return { success: true };
      }),
  }),
  navigation: router({
    getMenu: publicProcedure
      .input(z.object({ handle: z.string() }))
      .query(async ({ input }) => {
        const shopifyDomain = process.env.VITE_SHOPIFY_STORE_DOMAIN || "c81aag-cy.myshopify.com";
        const storefrontToken = process.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN || "";
        if (!storefrontToken) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Shopify Storefront token not configured" });
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
        const json = (await res.json()) as { data?: { menu?: unknown }; errors?: unknown[] };
        if (json.errors) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: JSON.stringify(json.errors) });
        }
        return json.data?.menu ?? null;
      }),
  }),
});

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// CORS — allow requests from any origin (storefront + admin editor)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: vercelRouter,
    createContext: () => ({}),
  })
);

// Serve built frontend from dist/public
const distPath = path.resolve(process.cwd(), "dist/public");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

export default app;
