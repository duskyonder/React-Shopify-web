/**
 * Vercel Serverless Function entry point
 *
 * This file is intentionally self-contained — it does NOT import from
 * server/_core/trpc.ts because that file uses `@shared/const` path aliases
 * which Vercel's esbuild does not resolve from tsconfig.json paths.
 *
 * Routes exposed (no DB dependency, Shopify-only):
 *   GET  /api/trpc/siteConfig.getAll
 *   GET  /api/trpc/siteConfig.get
 *   POST /api/trpc/siteConfig.set
 *   POST /api/trpc/theme.uploadImage   (Shopify Files API)
 *   GET  /api/trpc/navigation.getMenu
 */

import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";
import path from "path";
import fs from "fs";

// ── Inline tRPC init (avoids @shared/const path alias) ────────────────────────
const t = initTRPC.create({ transformer: superjson });
const router = t.router;
const publicProcedure = t.procedure;

// ── Shopify constants ──────────────────────────────────────────────────────────
const SHOPIFY_DOMAIN = "c81aag-cy.myshopify.com";
const SHOPIFY_API_VERSION = "2024-10";
const METAOBJECT_TYPE = "duskyonder_site_config";

function getAdminToken(): string {
  return process.env.SHOPIFY_ADMIN_TOKEN ?? "";
}

async function shopifyAdminGraphQL(
  query: string,
  variables?: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const token = getAdminToken();
  if (!token) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "SHOPIFY_ADMIN_TOKEN is not configured in Vercel environment variables.",
    });
  }
  const res = await fetch(
    `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({ query, variables }),
    }
  );
  if (!res.ok) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Shopify Admin API error: ${res.status} ${res.statusText}`,
    });
  }
  const json = (await res.json()) as { data?: unknown; errors?: unknown[] };
  if (json.errors) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Shopify GraphQL errors: ${JSON.stringify(json.errors)}`,
    });
  }
  return json.data as Record<string, unknown>;
}

// ── MySQL site-config helpers (replaces Shopify Metaobjects for config storage) ─
async function getDbConn() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return null;
  const mysql2 = await import("mysql2/promise");
  return mysql2.createConnection(dbUrl);
}

async function getAllConfigs(): Promise<Record<string, unknown>> {
  const conn = await getDbConn();
  if (!conn) return {};
  try {
    const [rows] = await conn.execute("SELECT configKey, configValue FROM theme_config") as any;
    const result: Record<string, unknown> = {};
    for (const row of rows as Array<{ configKey: string; configValue: string }>) {
      try { result[row.configKey] = JSON.parse(row.configValue); } catch { result[row.configKey] = row.configValue; }
    }
    return result;
  } finally {
    await conn.end();
  }
}

async function getConfig<T = unknown>(key: string): Promise<T | null> {
  const conn = await getDbConn();
  if (!conn) return null;
  try {
    const [rows] = await conn.execute("SELECT configValue FROM theme_config WHERE configKey = ? LIMIT 1", [key]) as any;
    if (!rows.length) return null;
    try { return JSON.parse(rows[0].configValue) as T; } catch { return rows[0].configValue as T; }
  } finally {
    await conn.end();
  }
}

async function setConfig(key: string, value: unknown): Promise<void> {
  const conn = await getDbConn();
  if (!conn) throw new Error("DATABASE_URL is not configured.");
  try {
    await conn.execute(
      "INSERT INTO theme_config (configKey, configValue) VALUES (?, ?) ON DUPLICATE KEY UPDATE configValue = VALUES(configValue)",
      [key, JSON.stringify(value)]
    );
  } finally {
    await conn.end();
  }
}

// ── Shopify Files upload helper ────────────────────────────────────────────────
async function uploadToShopifyFiles(
  base64: string,
  mimeType: string,
  filename: string
): Promise<string> {
  // Step 1: Get staged upload target
  const stagedData = await shopifyAdminGraphQL(
    `mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets {
          url
          resourceUrl
          parameters { name value }
        }
        userErrors { field message }
      }
    }`,
    {
      input: [{ filename, mimeType, resource: "FILE", httpMethod: "POST" }],
    }
  );

  const userErrors = (stagedData as any)?.stagedUploadsCreate?.userErrors;
  if (userErrors?.length > 0) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Shopify staged upload error: ${JSON.stringify(userErrors)}`,
    });
  }

  const targets = (stagedData as any)?.stagedUploadsCreate?.stagedTargets as Array<{
    url: string;
    resourceUrl: string;
    parameters: Array<{ name: string; value: string }>;
  }>;

  if (!targets?.length) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Shopify staged upload: no target returned",
    });
  }

  const target = targets[0];

  // Step 2: Upload file bytes to staged S3 URL
  const base64Data = base64.replace(/^data:[^;]+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  const boundary = `----FormBoundary${Date.now()}`;
  const parts: Buffer[] = [];
  for (const param of target.parameters) {
    parts.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${param.name}"\r\n\r\n${param.value}\r\n`
      )
    );
  }
  parts.push(
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: ${mimeType}\r\n\r\n`
    )
  );
  parts.push(buffer);
  parts.push(Buffer.from(`\r\n--${boundary}--\r\n`));
  const body = Buffer.concat(parts);

  const uploadRes = await fetch(target.url, {
    method: "POST",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      "Content-Length": String(body.length),
    },
    body,
  });

  if (!uploadRes.ok) {
    const text = await uploadRes.text().catch(() => "");
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `S3 upload failed: ${uploadRes.status} ${uploadRes.statusText}\n${text}`,
    });
  }

  // Step 3: Register file in Shopify Files
  const fileData = await shopifyAdminGraphQL(
    `mutation fileCreate($files: [FileCreateInput!]!) {
      fileCreate(files: $files) {
        files {
          ... on MediaImage { image { url } }
          ... on GenericFile { url }
        }
        userErrors { field message }
      }
    }`,
    {
      files: [
        { originalSource: target.resourceUrl, contentType: "IMAGE", filename },
      ],
    }
  );

  const fileErrors = (fileData as any)?.fileCreate?.userErrors;
  if (fileErrors?.length > 0) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Shopify fileCreate error: ${JSON.stringify(fileErrors)}`,
    });
  }

  const files = (fileData as any)?.fileCreate?.files as Array<{
    image?: { url: string };
    url?: string;
  }>;

  if (!files?.length) {
    // Return resourceUrl as fallback (file may still be processing)
    return target.resourceUrl;
  }

  return files[0].image?.url || files[0].url || target.resourceUrl;
}

// ── tRPC Router ────────────────────────────────────────────────────────────────
const vercelRouter = router({
  theme: router({
    // List images from Shopify Files (for the image picker)
    listFiles: publicProcedure
      .input(
        z.object({
          first: z.number().optional().default(50),
          after: z.string().optional(),
          query: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        const queryStr = input.query
          ? `filename:*${input.query}* media_type:IMAGE`
          : "media_type:IMAGE";
        const data = await shopifyAdminGraphQL(
          `query ListFiles($first: Int!, $after: String, $query: String) {
            files(first: $first, after: $after, query: $query, sortKey: CREATED_AT, reverse: true) {
              pageInfo { hasNextPage endCursor }
              nodes {
                ... on MediaImage {
                  id
                  createdAt
                  image { url altText width height }
                }
              }
            }
          }`,
          { first: input.first, after: input.after ?? null, query: queryStr }
        );
        const files = (data as any)?.files;
        const nodes = (files?.nodes ?? []) as Array<{
          id: string;
          createdAt: string;
          image?: { url: string; altText?: string; width?: number; height?: number };
        }>;
        return {
          files: nodes
            .filter((n) => n.image?.url)
            .map((n) => ({
              id: n.id,
              url: n.image!.url,
              alt: n.image!.altText ?? "",
              width: n.image!.width ?? 0,
              height: n.image!.height ?? 0,
              createdAt: n.createdAt,
            })),
          pageInfo: files?.pageInfo ?? { hasNextPage: false, endCursor: null },
        };
      }),

    uploadImage: publicProcedure
      .input(
        z.object({
          section: z.string(),
          slot: z.string(),
          base64: z.string(),
          mimeType: z.string(),
          originalName: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const ext = input.mimeType.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
        const filename = input.originalName
          ? input.originalName.replace(/[^a-zA-Z0-9._-]/g, "_")
          : `${input.section}-${input.slot}-${Date.now()}.${ext}`;
        const url = await uploadToShopifyFiles(input.base64, input.mimeType, filename);
        return { url, key: `shopify:${filename}` };
      }),
  }),

  siteConfig: router({
    getAll: publicProcedure.query(async () => {
      return await getAllConfigs();
    }),
    get: publicProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        return await getConfig(input.key);
      }),
    set: publicProcedure
      .input(z.object({ key: z.string(), value: z.unknown() }))
      .mutation(async ({ input }) => {
        await setConfig(input.key, input.value);
        return { success: true };
      }),
  }),

  navigation: router({
    getMenu: publicProcedure
      .input(z.object({ handle: z.string() }))
      .query(async ({ input }) => {
        const shopifyDomain =
          process.env.VITE_SHOPIFY_STORE_DOMAIN || "c81aag-cy.myshopify.com";
        const storefrontToken =
          process.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN || "";
        if (!storefrontToken) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN is not configured",
          });
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
        const res = await fetch(
          `https://${shopifyDomain}/api/2024-10/graphql.json`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Storefront-Access-Token": storefrontToken,
            },
            body: JSON.stringify({ query: gql, variables: { handle: input.handle } }),
          }
        );
        const json = (await res.json()) as {
          data?: { menu?: unknown };
          errors?: unknown[];
        };
        if (json.errors) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: JSON.stringify(json.errors),
          });
        }
        return json.data?.menu ?? null;
      }),
  }),

  // ── Shopify Storefront — collection and page fetching ──────────────────────
  shopify: router({
    getCollection: publicProcedure
      .input(z.object({ handle: z.string() }))
      .query(async ({ input }) => {
        const storefrontToken =
          process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ??
          process.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN ??
          "";
        if (!storefrontToken) return null;
        const gql = `
          query GetCollection($handle: String!) {
            collection(handle: $handle) {
              id handle title description
              image { url altText }
              products(first: 250) {
                edges {
                  node {
                    id handle title
                    priceRange { minVariantPrice { amount currencyCode } }
                    compareAtPriceRange { maxVariantPrice { amount currencyCode } }
                    images(first: 3) { edges { node { url altText } } }
                    variants(first: 100) {
                      edges {
                        node {
                          id availableForSale
                          selectedOptions { name value }
                        }
                      }
                    }
                    tags
                  }
                }
              }
            }
          }
        `;
        const res = await fetch(`https://${SHOPIFY_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": storefrontToken,
          },
          body: JSON.stringify({ query: gql, variables: { handle: input.handle } }),
        });
        if (!res.ok) return null;
        const json = (await res.json()) as { data?: { collection?: unknown }; errors?: unknown[] };
        return json.data?.collection ?? null;
      }),

    getPage: publicProcedure
      .input(z.object({ handle: z.string() }))
      .query(async ({ input }) => {
        const storefrontToken =
          process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ??
          process.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN ??
          "";
        if (!storefrontToken) {
          console.error(
            `[getPage] SHOPIFY_STOREFRONT_ACCESS_TOKEN is not set. ` +
            `Cannot fetch page handle="${input.handle}". ` +
            `Set this env var in Vercel project settings.`
          );
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Shopify Storefront token is not configured on this deployment.",
          });
        }
        const gql = `
          query GetPage($handle: String!) {
            page(handle: $handle) {
              id handle title body bodySummary
              createdAt updatedAt
              seo { title description }
            }
          }
        `;
        const res = await fetch(`https://${SHOPIFY_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": storefrontToken,
          },
          body: JSON.stringify({ query: gql, variables: { handle: input.handle } }),
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.error(`[getPage] Shopify HTTP ${res.status} for handle="${input.handle}": ${text.slice(0, 200)}`);
          return null;
        }
        const json = (await res.json()) as { data?: { page?: unknown }; errors?: unknown[] };
        if (json.errors?.length) {
          console.error(`[getPage] Shopify GraphQL errors for handle="${input.handle}":`, JSON.stringify(json.errors));
        }
        if (!json.data?.page) {
          console.warn(`[getPage] Shopify returned null for handle="${input.handle}". Check the page exists in Shopify Admin > Online Store > Pages.`);
        }
        return json.data?.page ?? null;
      }),

    getPolicies: publicProcedure
      .query(async () => {
        // Use REST Admin API /policies.json — more reliable than GraphQL shop.policies
        // which has inconsistent field availability across API versions.
        // REST response: { policies: [{ handle, title, body, url }] }
        const token = getAdminToken();
        console.log(`[getPolicies] token present: ${!!token}, length: ${token.length}, prefix: ${token.slice(0, 6)}...`);
        if (!token) {
          console.error("[getPolicies] SHOPIFY_ADMIN_TOKEN is empty or not set");
          return null;
        }
        try {
          const res = await fetch(
            `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/policies.json`,
            {
              method: "GET",
              headers: { "X-Shopify-Access-Token": token },
            }
          );
          const rawText = await res.text();
          console.log(`[getPolicies] Shopify HTTP ${res.status}, body[:300]: ${rawText.slice(0, 300)}`);
          if (!res.ok) {
            console.error(`[getPolicies] Shopify Admin API HTTP ${res.status} ${res.statusText}: ${rawText.slice(0, 300)}`);
            return null;
          }
          const json = JSON.parse(rawText) as { policies?: Array<{ handle: string; title: string; body: string; url: string }> };
          const policies = json.policies ?? [];
          console.log(`[getPolicies] received ${policies.length} policies:`, policies.map((p: { handle: string }) => p.handle));
          // Map REST array to keyed object: "privacy-policy" -> privacyPolicy
          const result: Record<string, { title: string; body: string; url: string }> = {};
          for (const p of policies) {
            const key = p.handle.replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase());
            result[key] = { title: p.title, body: p.body, url: p.url };
          }
          return result;
        } catch (err) {
          console.error("[getPolicies] fetch threw:", err instanceof Error ? `${err.name}: ${err.message}` : err);
          return null;
        }
      }),

    getBlog: publicProcedure
      .input(z.object({ handle: z.string().default("news") }))
      .query(async ({ input }) => {
        const adminToken = process.env.SHOPIFY_ADMIN_TOKEN ?? "";
        const shopifyDomain = process.env.SHOPIFY_STORE_DOMAIN ?? process.env.VITE_SHOPIFY_STORE_DOMAIN ?? SHOPIFY_DOMAIN;
        console.log(`[getBlog] handle="${input.handle}" domain="${shopifyDomain}" hasAdminToken=${!!adminToken}`);
        if (!adminToken) {
          console.warn("[getBlog] SHOPIFY_ADMIN_TOKEN not set — returning null");
          return null;
        }
        const baseUrl = `https://${shopifyDomain}/admin/api/2024-10`;
        const headers = { "X-Shopify-Access-Token": adminToken, "Content-Type": "application/json" };
        try {
          // Step 1: find the blog ID by handle
          const blogsRes = await fetch(`${baseUrl}/blogs.json?fields=id,handle,title`, { headers });
          if (!blogsRes.ok) {
            console.error(`[getBlog] blogs.json HTTP ${blogsRes.status}`);
            return null;
          }
          const blogsJson = await blogsRes.json() as any;
          const blog = (blogsJson.blogs as any[]).find((b: any) => b.handle === input.handle);
          if (!blog) {
            console.warn(`[getBlog] No blog with handle "${input.handle}". Available: ${(blogsJson.blogs as any[]).map((b: any) => b.handle).join(", ")}`);
            return null;
          }
          console.log(`[getBlog] found blog id=${blog.id} handle="${blog.handle}"`);

          // Step 2: fetch articles for this blog
          const articlesRes = await fetch(
            `${baseUrl}/blogs/${blog.id}/articles.json?limit=50&fields=id,handle,title,excerpt,body_html,published_at,image,author,tags`,
            { headers }
          );
          if (!articlesRes.ok) {
            console.error(`[getBlog] articles.json HTTP ${articlesRes.status}`);
            return null;
          }
          const articlesJson = await articlesRes.json() as any;
          const articles = (articlesJson.articles ?? []) as any[];
          console.log(`[getBlog] fetched ${articles.length} articles`);

          return {
            id: String(blog.id),
            handle: blog.handle,
            title: blog.title,
            articles: {
              edges: articles
                .sort((a: any, b: any) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
                .map((a: any) => ({
                  node: {
                    id: String(a.id),
                    handle: a.handle,
                    title: a.title,
                    excerpt: a.excerpt ?? "",
                    publishedAt: a.published_at,
                    image: a.image ? { url: a.image.src, altText: a.image.alt ?? a.title } : null,
                    author: { name: a.author ?? "Dusk Yonder" },
                    tags: typeof a.tags === "string"
                      ? a.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
                      : (a.tags ?? []),
                  },
                })),
            },
          };
        } catch (err) {
          console.error("[getBlog] fetch error:", err instanceof Error ? err.message : err);
          return null;
        }
      }),
  }),

  newsletter: router({
    subscribe: publicProcedure
      .input(z.object({ email: z.string().email(), source: z.enum(["popup", "footer"]).default("footer") }))
      .mutation(async ({ input }) => {
        // 1. Save to local DB (best-effort)
        const dbUrl = process.env.DATABASE_URL;
        if (dbUrl) {
          try {
            const mysql2 = await import("mysql2/promise");
            const conn = await mysql2.createConnection(dbUrl);
            try {
              await conn.execute(
                "INSERT IGNORE INTO newsletter_subscribers (email, source) VALUES (?, ?)",
                [input.email, input.source]
              );
            } finally {
              await conn.end();
            }
          } catch (err) {
            console.error("[newsletter] DB error:", err);
          }
        }

        // 2. Create or update Shopify customer with email marketing consent = SUBSCRIBED
        // This triggers any welcome email automation set up in Shopify Email / Shopify Flow.
        try {
          // First check if a customer with this email already exists
          const searchData = await shopifyAdminGraphQL(
            `query FindCustomer($query: String!) {
              customers(first: 1, query: $query) {
                edges { node { id emailMarketingConsent { marketingState } } }
              }
            }`,
            { query: `email:${input.email}` }
          ) as any;

          const existing = searchData?.customers?.edges?.[0]?.node;

          if (existing) {
            // Update existing customer to subscribed
            await shopifyAdminGraphQL(
              `mutation UpdateCustomer($input: CustomerInput!) {
                customerUpdate(input: $input) {
                  customer { id }
                  userErrors { field message }
                }
              }`,
              {
                input: {
                  id: existing.id,
                  emailMarketingConsent: {
                    marketingOptInLevel: "SINGLE_OPT_IN",
                    marketingState: "SUBSCRIBED",
                  },
                },
              }
            );
          } else {
            // Create new customer as subscribed
            await shopifyAdminGraphQL(
              `mutation CreateCustomer($input: CustomerInput!) {
                customerCreate(input: $input) {
                  customer { id }
                  userErrors { field message }
                }
              }`,
              {
                input: {
                  email: input.email,
                  emailMarketingConsent: {
                    marketingOptInLevel: "SINGLE_OPT_IN",
                    marketingState: "SUBSCRIBED",
                  },
                },
              }
            );
          }
        } catch (err) {
          console.error("[newsletter] Shopify API error:", err);
          // Don't fail the request — DB save already succeeded
        }

        return { success: true };
      }),
  }),
});

export type VercelRouter = typeof vercelRouter;

// ── Express app ────────────────────────────────────────────────────────────────
const app = express();

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

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
