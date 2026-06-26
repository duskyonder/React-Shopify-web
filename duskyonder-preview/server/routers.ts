import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { getAllThemeConfigs, setThemeConfig, getThemeConfig, getAllUploadedImages, upsertUploadedImage, addNewsletterSubscriber } from "./db";
import { notifyOwner } from "./_core/notification";
import { storagePut } from "./storage";
import { uploadToShopifyFiles, listShopifyFiles } from "./shopifyConfig";
import { ENV } from "./_core/env";

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

  // Site configuration — stored in MySQL theme_config table
  siteConfig: router({
    // Get all config sections at once (used by storefront)
    getAll: publicProcedure.query(async () => {
      const rows = await getAllThemeConfigs();
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(rows)) {
        try { result[key] = JSON.parse(value); } catch { result[key] = value; }
      }
      return result;
    }),

    // Get a single config section by key
    get: publicProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        const raw = await getThemeConfig(input.key);
        if (!raw) return null;
        try { return JSON.parse(raw); } catch { return raw; }
      }),

    // Save a config section (used by admin editor)
    set: publicProcedure
      .input(z.object({ key: z.string(), value: z.unknown() }))
      .mutation(async ({ input }) => {
        await setThemeConfig(input.key, JSON.stringify(input.value));
        return { success: true };
      }),
  }),

  // Shopify navigation menus
  navigation: router({
    getMenu: publicProcedure
      .input(z.object({ handle: z.string() }))
      .query(async ({ input }) => {
        const shopifyDomain = ENV.shopifyStoreDomain;
        const storefrontToken = ENV.shopifyStorefrontToken;
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

  // Shopify Storefront data — collection and page fetching
  shopify: router({
    getCollection: publicProcedure
      .input(z.object({ handle: z.string() }))
      .query(async ({ input }) => {
        const shopifyDomain = ENV.shopifyStoreDomain;
        const storefrontToken = ENV.shopifyStorefrontToken;
        if (!shopifyDomain || !storefrontToken) return null;
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
        const res = await fetch(`https://${shopifyDomain}/api/2024-10/graphql.json`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": storefrontToken,
          },
          body: JSON.stringify({ query: gql, variables: { handle: input.handle } }),
        });
        if (!res.ok) return null;
        const json = await res.json() as any;
        return json.data?.collection ?? null;
      }),

    getPage: publicProcedure
      .input(z.object({ handle: z.string() }))
      .query(async ({ input }) => {
        const shopifyDomain = ENV.shopifyStoreDomain;
        const storefrontToken = ENV.shopifyStorefrontToken;
        if (!shopifyDomain || !storefrontToken) return null;
        const gql = `
          query GetPage($handle: String!) {
            page(handle: $handle) {
              id handle title body bodySummary
              createdAt updatedAt
              seo { title description }
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
                if (!res.ok) return null;
        const json = await res.json() as any;
        return json.data?.page ?? null;
      }),

    getPolicies: publicProcedure
      .query(async () => {
        // shop.policies fields are ONLY available on the Admin API — not the Storefront API.
        // The Storefront API returns 503 for these fields, causing the request to hang.
        const adminToken = ENV.shopifyAdminToken;
        const shopifyDomain = ENV.shopifyStoreDomain;
        if (!adminToken || !shopifyDomain) {
          console.warn("[getPolicies] SHOPIFY_ADMIN_TOKEN or domain not configured");
          return null;
        }
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 8000);
          // Use REST /policies.json — GraphQL shop.privacyPolicy etc. are not available in API 2024-10
          const res = await fetch(`https://${shopifyDomain}/admin/api/2024-10/policies.json`, {
            method: "GET",
            headers: { "X-Shopify-Access-Token": adminToken },
            signal: controller.signal,
          }).finally(() => clearTimeout(timeout));
          if (!res.ok) {
            console.error(`[getPolicies] Admin API HTTP ${res.status}`);
            return null;
          }
          const json = await res.json() as { policies?: Array<{ handle: string; title: string; body: string; url: string }> };
          const policies = json.policies ?? [];
          // Map REST array to keyed object: "privacy-policy" -> privacyPolicy
          const result: Record<string, { title: string; body: string; url: string }> = {};
          for (const p of policies) {
            const key = p.handle.replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase());
            result[key] = { title: p.title, body: p.body, url: p.url };
          }
          return result;
        } catch (err) {
          console.error("[getPolicies] fetch error:", err instanceof Error ? err.message : err);
          return null;
        }
      }),

    getBlog: publicProcedure
      .input(z.object({ handle: z.string().default("news") }))
      .query(async ({ input }) => {
        const shopifyDomain = ENV.shopifyStoreDomain;
        const adminToken = ENV.shopifyAdminToken;
        console.log(`[getBlog] handle="${input.handle}" domain="${shopifyDomain}" hasAdminToken=${!!adminToken}`);
        if (!shopifyDomain || !adminToken) {
          console.warn("[getBlog] Missing Shopify Admin credentials — returning null");
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
            console.warn(`[getBlog] No blog found with handle "${input.handle}". Available: ${(blogsJson.blogs as any[]).map((b: any) => b.handle).join(", ")}`);
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
          const articles = articlesJson.articles as any[];
          console.log(`[getBlog] fetched ${articles.length} articles`);

          // Return in a shape compatible with the existing BlogIndex adapter
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
                      const stripped = (a.body_html ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
                      return stripped.length > 150 ? stripped.slice(0, 150).trimEnd() + "…" : stripped;
                    })(),
                    publishedAt: a.published_at,
                    image: a.image ? { url: a.image.src, altText: a.image.alt ?? a.title } : null,
                    author: { name: a.author ?? "Dusk Yonder" },
                    tags: typeof a.tags === "string" ? a.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : (a.tags ?? []),
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
        const adminToken = ENV.shopifyAdminToken;
        const shopifyDomain = ENV.shopifyStoreDomain;
        if (!adminToken || !input.articleHandle) return null;
        const baseUrl = `https://${shopifyDomain}/admin/api/2024-10`;
        const headers = { "X-Shopify-Access-Token": adminToken, "Content-Type": "application/json" };
        try {
          const blogsRes = await fetch(`${baseUrl}/blogs.json?fields=id,handle`, { headers });
          if (!blogsRes.ok) return null;
          const blogsJson = await blogsRes.json() as any;
          const blog = (blogsJson.blogs as any[]).find((b: any) => b.handle === input.blogHandle);
          if (!blog) return null;
          const articlesRes = await fetch(
            `${baseUrl}/blogs/${blog.id}/articles.json?fields=id,handle,title,excerpt,body_html,published_at,image,author,tags`,
            { headers }
          );
          if (!articlesRes.ok) return null;
          const articlesJson = await articlesRes.json() as any;
          const article = (articlesJson.articles as any[]).find((a: any) => a.handle === input.articleHandle);
          return article ?? null;
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
        const { sendEmail, buildContactEmailHtml } = await import("./email");
        const result = await sendEmail({
          from: "Duskyonder Contact <noreply@duskyonder.com>",
          to: "support@duskyonder.com",
          subject: `[Contact Form] ${input.subject}`,
          html: buildContactEmailHtml(input),
          text: `Name: ${input.name}\nEmail: ${input.email}\nSubject: ${input.subject}\n\n${input.message}`,
          replyTo: input.email,
        });
        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: result.error ?? "Failed to send email. Please try again.",
          });
        }
        return { success: true, id: result.id };
      }),
  }),

  newsletter: router({
    subscribe: publicProcedure
      .input(z.object({ email: z.string().email(), source: z.enum(["popup", "footer"]).default("footer") }))
      .mutation(async ({ input }) => {
        const isNew = await addNewsletterSubscriber(input.email, input.source);
        if (isNew) {
          // Notify owner of new subscriber (fire-and-forget)
          notifyOwner({
            title: "New Newsletter Subscriber",
            content: `${input.email} subscribed via ${input.source}.`,
          }).catch(() => {});
        }
        return { success: true, alreadySubscribed: !isNew };
      }),
  }),

  // ── Shopify Customer Account API — order history ───────────────────────────
  customer: router({
    getOrders: publicProcedure
      .input(z.object({ accessToken: z.string() }))
      .query(async ({ input }) => {
        const SHOP_ID = process.env.SHOPIFY_SHOP_ID ?? "90159776010";
        const CA_API_URL = `https://shopify.com/${SHOP_ID}/account/customer/api/2024-10/graphql`;
        console.log("FINAL DEBUG: API URL:", CA_API_URL);
        console.log("FINAL DEBUG: Full Authorization Header:", "Bearer " + input.accessToken);
        console.log("FINAL DEBUG: Is input.accessToken containing shcat_:", input.accessToken.includes('shcat_'));
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
                      image(width: 400) { url altText }
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
        console.log(`[customer.getOrders] token: ${rawToken.slice(0, 12)}...`);
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
        const domain = process.env.SHOPIFY_STORE_DOMAIN ?? process.env.VITE_SHOPIFY_STORE_DOMAIN ?? "";
        const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? process.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? "";
        if (!domain || !token) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Storefront API not configured" });
        }
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
        // Find the best-matching product (case-insensitive title match)
        const product = products.find(p => p.title.toLowerCase() === input.productTitle.toLowerCase()) ?? products[0];
        if (!product) return null;
        const variants = product.variants.nodes;
        // Try to match the specific variantTitle, otherwise return first available
        const match = input.variantTitle
          ? (variants.find(v => v.title === input.variantTitle && v.availableForSale) ?? variants.find(v => v.availableForSale) ?? variants[0])
          : (variants.find(v => v.availableForSale) ?? variants[0]);
        return match ? { variantId: match.id, variantTitle: match.title, price: match.price, imageUrl: match.image?.url ?? null, productTitle: product.title } : null;
      }),

    exchangeToken: publicProcedure
      .input(z.object({
        code: z.string(),
        codeVerifier: z.string(),
        redirectUri: z.string(),
      }))
      .mutation(async ({ input }) => {
        const SHOP_ID = process.env.SHOPIFY_SHOP_ID ?? "90159776010";
        // VITE_SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID is the only env var set in Vercel for this value.
        // Server-side process.env can read VITE_ prefixed vars on Vercel (they are not stripped server-side).
        const CLIENT_ID =
          process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID ??
          process.env.VITE_SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID ?? "";
        console.log("[customer.exchangeToken] CLIENT_ID being used:", CLIENT_ID ? CLIENT_ID.slice(0, 8) + "..." : "EMPTY — TOKEN WILL BE INVALID");
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
});
export type AppRouter = typeof appRouter;
