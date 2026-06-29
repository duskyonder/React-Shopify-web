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

// ── Inline OAuth token manager (self-contained for Vercel bundling) ────────────────────────
// api/index.ts is intentionally self-contained — Vercel's esbuild cannot
// resolve relative imports from server/ at runtime. All auth logic is inlined.
const _TOKEN_TTL_MS = 23 * 60 * 60 * 1000; // 23 hours
let _tokenCache: { token: string; expiresAt: number } | null = null;

async function _fetchFreshAdminToken(): Promise<string | null> {
  const clientId = process.env.SHOPIFY_CLIENT_ID ?? "";
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET ?? "";
  if (!clientId || !clientSecret) {
    console.warn("[shopifyAdminAuth] SHOPIFY_CLIENT_ID or SHOPIFY_CLIENT_SECRET not set. Skipping OAuth refresh.");
    return null;
  }
  const endpoint = `https://${SHOPIFY_DOMAIN}/admin/oauth/access_token`;
  console.log("[shopifyAdminAuth] Attempting OAuth token refresh:", {
    endpoint, shop: SHOPIFY_DOMAIN,
    clientIdPrefix: clientId.slice(0, 8) + "...",
    grantType: "client_credentials",
    timestamp: new Date().toISOString(),
  });
  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, grant_type: "client_credentials" }),
    });
  } catch (e) {
    console.error("[shopifyAdminAuth] Network error during token refresh:", e);
    return null;
  }
  const rawBody = await res.text();
  console.log("[shopifyAdminAuth] Token refresh response:", { status: res.status, statusText: res.statusText, body: rawBody });
  if (!res.ok) {
    console.error(`[shopifyAdminAuth] Token refresh failed (HTTP ${res.status}). See body above for Shopify's exact error.`);
    return null;
  }
  let json: Record<string, unknown>;
  try { json = JSON.parse(rawBody); } catch { return null; }
  const newToken = (json.access_token as string) ?? null;
  if (!newToken) { console.error("[shopifyAdminAuth] No access_token in response:", json); return null; }
  const expiresIn = typeof json.expires_in === "number" ? json.expires_in * 1000 : _TOKEN_TTL_MS;
  _tokenCache = { token: newToken, expiresAt: Date.now() + expiresIn };
  console.log("[shopifyAdminAuth] Token refresh succeeded. Expires:", new Date(_tokenCache.expiresAt).toISOString());
  return newToken;
}

async function _getAdminToken(): Promise<string> {
  if (_tokenCache && Date.now() < _tokenCache.expiresAt) return _tokenCache.token;
  const refreshed = await _fetchFreshAdminToken();
  if (refreshed) return refreshed;
  const staticToken = process.env.SHOPIFY_ADMIN_TOKEN ?? "";
  if (staticToken) {
    _tokenCache = { token: staticToken, expiresAt: Date.now() + _TOKEN_TTL_MS };
    return staticToken;
  }
  throw new Error("[shopifyAdminAuth] No Admin API token available.");
}

/**
 * Admin API GraphQL helper with OAuth refresh, 401 retry, and diagnostic logging.
 * Inlined here because api/index.ts must be self-contained for Vercel bundling.
 */
async function shopifyAdminGraphQL(
  query: string,
  variables?: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const makeReq = async (token: string) =>
    fetch(`https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
      body: JSON.stringify({ query, variables }),
    });
  let token = await _getAdminToken();
  let res = await makeReq(token);
  if (res.status === 401) {
    console.warn("[shopifyAdminAuth] 401 received — invalidating cache and retrying.");
    _tokenCache = null;
    token = await _getAdminToken();
    res = await makeReq(token);
  }
  if (!res.ok) {
    const errBody = await res.text();
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Shopify Admin API error: ${res.status} ${res.statusText} — ${errBody}` });
  }
  const json = (await res.json()) as { data?: unknown; errors?: unknown[] };
  if (json.errors) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Shopify GraphQL errors: ${JSON.stringify(json.errors)}` });
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
        const shopifyDomain = process.env.SHOPIFY_STORE_DOMAIN ?? process.env.VITE_SHOPIFY_STORE_DOMAIN ?? SHOPIFY_DOMAIN;
        let adminToken: string;
        try { adminToken = await _getAdminToken(); } catch { adminToken = ""; }
        console.log(`[getBlog] handle="${input.handle}" domain="${shopifyDomain}" hasAdminToken=${!!adminToken}`);
        if (!adminToken) {
          console.warn("[getBlog] Could not obtain admin token — returning null");
          return null;
        }
        const baseUrl = `https://${shopifyDomain}/admin/api/2025-01`;
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
                    excerpt: (() => {
                      if (a.excerpt && a.excerpt.trim()) return a.excerpt.trim();
                      // Fallback: strip HTML tags from body_html and take first 150 chars
                      const stripped = (a.body_html ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
                      return stripped.length > 150 ? stripped.slice(0, 150).trimEnd() + "…" : stripped;
                    })(),
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

    getBlogArticle: publicProcedure
      .input(z.object({ blogHandle: z.string().default("news"), articleHandle: z.string() }))
      .query(async ({ input }) => {
        const shopifyDomain = process.env.SHOPIFY_STORE_DOMAIN ?? process.env.VITE_SHOPIFY_STORE_DOMAIN ?? SHOPIFY_DOMAIN;
        let adminToken: string;
        try { adminToken = await _getAdminToken(); } catch { adminToken = ""; }
        console.log(`[getBlogArticle] blogHandle="${input.blogHandle}" articleHandle="${input.articleHandle}" hasAdminToken=${!!adminToken}`);
        if (!adminToken || !input.articleHandle) return null;
        const baseUrl = `https://${shopifyDomain}/admin/api/2025-01`;
        const headers = { "X-Shopify-Access-Token": adminToken, "Content-Type": "application/json" };
        try {
          // Step 1: find blog ID by handle
          const blogsRes = await fetch(`${baseUrl}/blogs.json?fields=id,handle`, { headers });
          if (!blogsRes.ok) return null;
          const blogsJson = await blogsRes.json() as any;
          const blog = (blogsJson.blogs as any[]).find((b: any) => b.handle === input.blogHandle);
          if (!blog) return null;

          // Step 2: find article by handle
          const articlesRes = await fetch(
            `${baseUrl}/blogs/${blog.id}/articles.json?fields=id,handle,title,excerpt,body_html,published_at,image,author,tags`,
            { headers }
          );
          if (!articlesRes.ok) return null;
          const articlesJson = await articlesRes.json() as any;
          const article = (articlesJson.articles as any[]).find((a: any) => a.handle === input.articleHandle);
          if (!article) {
            console.warn(`[getBlogArticle] No article with handle "${input.articleHandle}"`);
            return null;
          }
          console.log(`[getBlogArticle] found article "${article.title}"`);
          return article;
        } catch (err) {
          console.error("[getBlogArticle] error:", err instanceof Error ? err.message : err);
          return null;
        }
      }),
  }),

  contact: router({
    send: publicProcedure
      .input(
        z.object({
          name: z.string().min(1).max(200),
          email: z.string().email(),
          subject: z.string().min(1).max(300),
          message: z.string().min(10).max(5000),
        })
      )
      .mutation(async ({ input }) => {
        const resendApiKey = process.env.RESEND_API_KEY ?? "";
        if (!resendApiKey) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "RESEND_API_KEY is not configured in environment variables.",
          });
        }
        const esc = (s: string) =>
          s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
<tr><td style="background:#175C40;padding:28px 40px;"><p style="margin:0;font-size:18px;font-weight:600;color:#fff;">DUSKYONDER</p><p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:0.08em;">New Contact Form Submission</p></td></tr>
<tr><td style="padding:36px 40px;">
<p style="margin:0 0 4px;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#999;">From</p>
<p style="margin:0 0 2px;font-size:15px;color:#1a1a1a;">${esc(input.name)}</p>
<a href="mailto:${esc(input.email)}" style="font-size:13px;color:#175C40;">${esc(input.email)}</a>
<hr style="border:none;border-top:1px solid #f0ede8;margin:20px 0;">
<p style="margin:0 0 4px;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#999;">Subject</p>
<p style="margin:0 0 20px;font-size:15px;color:#1a1a1a;">${esc(input.subject)}</p>
<p style="margin:0 0 12px;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#999;">Message</p>
<p style="margin:0;font-size:14px;color:#333;line-height:1.7;white-space:pre-wrap;">${esc(input.message)}</p>
</td></tr>
<tr><td style="padding:20px 40px;background:#faf9f7;border-top:1px solid #f0ede8;"><p style="margin:0;font-size:11px;color:#aaa;">Sent via duskyonder.com contact form. Reply to respond to ${esc(input.name)}.</p></td></tr>
</table></td></tr></table></body></html>`;
        const sendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Duskyonder Contact <noreply@duskyonder.com>",
            to: ["support@duskyonder.com"],
            subject: `[Contact Form] ${input.subject}`,
            html,
            text: `Name: ${input.name}\nEmail: ${input.email}\nSubject: ${input.subject}\n\n${input.message}`,
            reply_to: input.email,
          }),
        });
        const resData = (await sendRes.json()) as any;
        if (!sendRes.ok) {
          console.error("[contact] Resend error:", resData);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: resData?.message ?? "Failed to send email. Please try again.",
          });
        }
        console.log("[contact] Email sent id:", resData?.id);
        return { success: true, id: resData?.id as string };
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

  // ── Shopify Customer Account API — order history ───────────────────────────
  customer: router({
    // Fetch authenticated customer's order history
    getOrders: publicProcedure
      .input(z.object({ accessToken: z.string() }))
      .query(async ({ input }) => {
        const SHOP_ID = process.env.SHOPIFY_SHOP_ID ?? "90159776010";
        const CA_API_URL = `https://shopify.com/${SHOP_ID}/account/customer/api/2024-10/graphql`;
        const gql = `
          query GetCustomerOrders {
            customer {
              displayName
              emailAddress { emailAddress }
              orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
                nodes {
                  id
                  name
                  processedAt
                  financialStatus
                  fulfillmentStatus
                  totalPrice { amount currencyCode }
                  lineItems(first: 5) {
                    nodes {
                      title
                      quantity
                      price { amount currencyCode }
                      image { url altText }
                      variantTitle
                    }
                  }
                }
              }
            }
          }
        `;
        // Shopify Customer Account API uses the raw shcat_ token as the Authorization value.
        // DO NOT add "Bearer " prefix — the shcat_ prefix IS the token type indicator.
        // Authorization: shcat_eyJ... (correct)
        // Authorization: Bearer shcat_eyJ... (WRONG — causes 401)
        const rawToken = input.accessToken.startsWith("Bearer ")
          ? input.accessToken.slice(7)
          : input.accessToken;
        console.log(`[customer.getOrders] token prefix: ${rawToken.slice(0, 12)}...`);
        const res = await fetch(CA_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": rawToken,
          },
          body: JSON.stringify({ query: gql }),
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.error(`[customer.getOrders] HTTP ${res.status}: ${text.slice(0, 300)}`);
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired customer token" });
        }
        const json = (await res.json()) as {
          data?: { customer?: unknown };
          errors?: { message: string }[];
        };
        if (json.errors?.length) {
          console.error("[customer.getOrders] GraphQL errors:", json.errors);
          throw new TRPCError({ code: "UNAUTHORIZED", message: json.errors[0].message });
        }
        return json.data?.customer ?? null;
      }),

    // Resolve a Storefront variant GID by product title — used by "Buy Again"
    resolveVariantByTitle: publicProcedure
      .input(z.object({ productTitle: z.string(), variantTitle: z.string().optional() }))
      .query(async ({ input }) => {
        const domain = process.env.SHOPIFY_STORE_DOMAIN ?? process.env.VITE_SHOPIFY_STORE_DOMAIN ?? SHOPIFY_DOMAIN;
        const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? process.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? "";
        const url = `https://${domain}/api/2024-10/graphql.json`;
        const gql = `
          query ResolveVariant($title: String!) {
            products(first: 3, query: $title) {
              nodes {
                title
                variants(first: 10) {
                  nodes {
                    id
                    title
                    availableForSale
                    image { url }
                    price { amount currencyCode }
                  }
                }
              }
            }
          }
        `;
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": token,
          },
          body: JSON.stringify({ query: gql, variables: { title: input.productTitle } }),
        });
        const json = (await res.json()) as { data?: { products?: { nodes?: { title: string; variants: { nodes: { id: string; title: string; availableForSale: boolean; image: { url: string } | null; price: { amount: string; currencyCode: string } }[] } }[] } }; errors?: { message: string }[] };
        if (!res.ok || json.errors?.length) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: json.errors?.[0]?.message ?? "Storefront query failed" });
        }
        const products = json.data?.products?.nodes ?? [];
        const product = products.find(p => p.title.toLowerCase() === input.productTitle.toLowerCase()) ?? products[0];
        if (!product) return null;
        const variants = product.variants.nodes;
        const match = input.variantTitle
          ? (variants.find(v => v.title === input.variantTitle && v.availableForSale) ?? variants.find(v => v.availableForSale) ?? variants[0])
          : (variants.find(v => v.availableForSale) ?? variants[0]);
        return match ? { variantId: match.id, variantTitle: match.title, price: match.price, imageUrl: match.image?.url ?? null, productTitle: product.title } : null;
      }),

    // Exchange OAuth authorization code for access token (PKCE flow)
    exchangeToken: publicProcedure
      .input(z.object({
        code: z.string(),
        codeVerifier: z.string(),
        redirectUri: z.string(),
      }))
      .mutation(async ({ input }) => {
        const SHOP_ID = process.env.SHOPIFY_SHOP_ID ?? "90159776010";
        const CLIENT_ID =
          process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID ??
          process.env.VITE_SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID ?? "";
        const tokenUrl = `https://shopify.com/${SHOP_ID}/auth/oauth/token`;
        const body = new URLSearchParams({
          grant_type: "authorization_code",
          client_id: CLIENT_ID,
          redirect_uri: input.redirectUri,
          code: input.code,
          code_verifier: input.codeVerifier,
        });
        const res = await fetch(tokenUrl, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: body.toString(),
        });
        const json = (await res.json()) as {
          access_token?: string;
          id_token?: string;
          expires_in?: number;
          token_type?: string;
          error?: string;
          error_description?: string;
        };
        if (!res.ok || json.error) {
          console.error("[customer.exchangeToken] Error:", json);
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: json.error_description ?? json.error ?? "Token exchange failed",
          });
        }
        return {
          accessToken: json.access_token!,
          idToken: json.id_token ?? "",
          expiresIn: json.expires_in ?? 3600,
          tokenType: json.token_type ?? "Bearer",
        };
      }),
  }),

  // ── Live Shopify product search (Storefront API) ─────────────────────────────
  search: router({
    products: publicProcedure
      .input(
        z.object({
          query: z.string().min(1).max(200),
          limit: z.number().int().min(1).max(20).optional().default(8),
        })
      )
      .query(async ({ input }) => {
        const domain =
          process.env.SHOPIFY_STORE_DOMAIN ??
          process.env.VITE_SHOPIFY_STORE_DOMAIN ??
          SHOPIFY_DOMAIN;
        const token =
          process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ??
          process.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN ??
          "";
        console.log("[search] Input query:", input.query, "| limit:", input.limit);
        console.log("[search] Storefront domain:", domain, "| tokenPrefix:", token ? token.slice(0, 8) + "..." : "MISSING");
        if (!domain || !token) {
          console.error("[search] Storefront API not configured — domain or token missing");
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Storefront API not configured" });
        }
        const gql = `
          query SearchProducts($query: String!, $limit: Int!) {
            products(first: $limit, query: $query, sortKey: RELEVANCE) {
              nodes {
                id title handle
                priceRange { minVariantPrice { amount currencyCode } }
                featuredImage { url altText }
                variants(first: 1) { nodes { id availableForSale } }
              }
            }
          }
        `;
        const payload = { query: gql, variables: { query: input.query, limit: input.limit } };
        console.log("[search] GraphQL variables:", JSON.stringify(payload.variables));
        try {
          const res = await fetch(`https://${domain}/api/2025-01/graphql.json`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Storefront-Access-Token": token,
            },
            body: JSON.stringify(payload),
          });
          const rawBody = await res.text();
          console.log("[search] Storefront API response status:", res.status, res.statusText);
          console.log("[search] Storefront API raw response body:", rawBody.slice(0, 2000));
          if (!res.ok) {
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Storefront API returned ${res.status}: ${rawBody.slice(0, 500)}` });
          }
          let json: {
            data?: { products?: { nodes?: Array<{ id: string; title: string; handle: string; priceRange: { minVariantPrice: { amount: string; currencyCode: string } }; featuredImage: { url: string; altText: string | null } | null; variants: { nodes: Array<{ id: string; availableForSale: boolean }> } }> } };
            errors?: Array<{ message: string }>;
          };
          try { json = JSON.parse(rawBody); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Invalid JSON from Storefront API" }); }
          if (json.errors?.length) {
            console.error("[search] GraphQL errors:", JSON.stringify(json.errors));
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: json.errors[0].message });
          }
          const nodes = json.data?.products?.nodes ?? [];
          console.log(`[search] Result count: ${nodes.length} products for query "${input.query}"`);
          if (nodes.length === 0) console.warn("[search] Zero products returned — verify query matches products in the store.");
          const mapped = nodes.map((p) => {
            const { amount, currencyCode } = p.priceRange.minVariantPrice;
            const symbol = currencyCode === "USD" ? "$" : currencyCode + " ";
            return { id: p.id, title: p.title, handle: p.handle, price: `${symbol}${parseFloat(amount).toFixed(2)}`, imageUrl: p.featuredImage?.url ?? "", imageAlt: p.featuredImage?.altText ?? p.title, url: `/products/${p.handle}`, variantId: p.variants.nodes[0]?.id ?? "", availableForSale: p.variants.nodes[0]?.availableForSale ?? false };
          });
          if (mapped.length > 0) console.log("[search] First mapped result:", JSON.stringify(mapped[0]));
          return mapped;
        } catch (err) {
          if (err instanceof TRPCError) throw err;
          console.error("[search] Unexpected error:", err instanceof Error ? err.message : err);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: err instanceof Error ? err.message : "Search request failed" });
        }
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
