/**
 * generate-sitemap.mjs
 *
 * Build-time sitemap generator for the Dusk Yonder headless Shopify storefront.
 * Reads Shopify credentials from environment variables (VITE_SHOPIFY_STORE_DOMAIN
 * and VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN), queries all active product and
 * collection handles, and writes a standard XML sitemap to client/public/sitemap.xml.
 *
 * Run via: node scripts/generate-sitemap.mjs
 * Integrated into the build via package.json "build" script.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ── Resolve __dirname in ESM ──────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");

// ── Config ────────────────────────────────────────────────────────────────────
const BASE_URL = "https://www.duskyonder.com";
const SHOPIFY_STORE_DOMAIN = process.env.VITE_SHOPIFY_STORE_DOMAIN;
const SHOPIFY_STOREFRONT_TOKEN = process.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const SHOPIFY_API_VERSION = "2024-10";

// ── Static routes ─────────────────────────────────────────────────────────────
const STATIC_ROUTES = [
  { loc: "/",                  changefreq: "weekly",  priority: "1.0" },
  { loc: "/collections",       changefreq: "weekly",  priority: "0.9" },
  { loc: "/pages/about-us",    changefreq: "monthly", priority: "0.7" },
  { loc: "/pages/contact",     changefreq: "monthly", priority: "0.7" },
  { loc: "/pages/influencer",  changefreq: "monthly", priority: "0.7" },
  { loc: "/search",            changefreq: "weekly",  priority: "0.6" },
  { loc: "/pages/returns",     changefreq: "monthly", priority: "0.5" },
  { loc: "/pages/privacy-policy", changefreq: "yearly", priority: "0.4" },
  { loc: "/pages/terms-of-service", changefreq: "yearly", priority: "0.4" },
  { loc: "/pages/shipping-policy", changefreq: "monthly", priority: "0.5" },
];

// ── GraphQL queries ───────────────────────────────────────────────────────────
const PRODUCTS_QUERY = `
  query GetAllProductHandles($cursor: String) {
    products(first: 250, after: $cursor, sortKey: UPDATED_AT, reverse: true) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          handle
          updatedAt
          status
        }
      }
    }
  }
`;

const COLLECTIONS_QUERY = `
  query GetAllCollectionHandles($cursor: String) {
    collections(first: 250, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          handle
          updatedAt
        }
      }
    }
  }
`;

// ── Shopify Storefront fetch helper ───────────────────────────────────────────
async function shopifyFetch(query, variables = {}) {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_TOKEN) {
    throw new Error(
      "Missing Shopify credentials. Set VITE_SHOPIFY_STORE_DOMAIN and " +
      "VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN environment variables."
    );
  }

  const url = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`Shopify API HTTP error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  if (json.errors?.length) {
    const msgs = json.errors.map((e) => e.message).join("; ");
    throw new Error(`Shopify GraphQL errors: ${msgs}`);
  }
  return json.data;
}

// ── Paginated fetcher ─────────────────────────────────────────────────────────
async function fetchAllPages(query, dataKey) {
  const results = [];
  let cursor = null;
  let page = 1;

  while (true) {
    console.log(`  Fetching ${dataKey} page ${page}…`);
    const data = await shopifyFetch(query, cursor ? { cursor } : {});
    const connection = data[dataKey];
    const edges = connection.edges ?? [];

    for (const edge of edges) {
      results.push(edge.node);
    }

    if (!connection.pageInfo.hasNextPage) break;
    cursor = connection.pageInfo.endCursor;
    page++;
  }

  return results;
}

// ── XML helpers ───────────────────────────────────────────────────────────────
function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toISODate(dateStr) {
  try {
    return new Date(dateStr).toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

function buildUrlEntry({ loc, lastmod, changefreq, priority }) {
  const lines = [`  <url>`, `    <loc>${escapeXml(BASE_URL + loc)}</loc>`];
  if (lastmod) lines.push(`    <lastmod>${lastmod}</lastmod>`);
  if (changefreq) lines.push(`    <changefreq>${changefreq}</changefreq>`);
  if (priority) lines.push(`    <priority>${priority}</priority>`);
  lines.push(`  </url>`);
  return lines.join("\n");
}

function buildSitemapXml(entries) {
  const header = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
  ].join("\n");
  const body = entries.map(buildUrlEntry).join("\n");
  return `${header}\n${body}\n</urlset>\n`;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🗺  Generating sitemap…");
  const today = new Date().toISOString().split("T")[0];

  // 1. Static routes
  const entries = STATIC_ROUTES.map((r) => ({ ...r, lastmod: today }));

  // 2. Shopify products
  let products = [];
  let collections = [];

  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_TOKEN) {
    console.warn(
      "⚠  VITE_SHOPIFY_STORE_DOMAIN or VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN not set. " +
      "Skipping dynamic Shopify routes — only static routes will be included in the sitemap."
    );
  } else {
    try {
      console.log("📦 Fetching products…");
      products = await fetchAllPages(PRODUCTS_QUERY, "products");
      // Filter to only ACTIVE products (status field is only available on admin API;
      // Storefront API returns all published products by default, so no filter needed)
      console.log(`   ✓ ${products.length} products fetched`);
    } catch (err) {
      console.error(`❌ Failed to fetch products: ${err.message}`);
      console.error("   Product URLs will be omitted from the sitemap.");
    }

    try {
      console.log("🗂  Fetching collections…");
      collections = await fetchAllPages(COLLECTIONS_QUERY, "collections");
      console.log(`   ✓ ${collections.length} collections fetched`);
    } catch (err) {
      console.error(`❌ Failed to fetch collections: ${err.message}`);
      console.error("   Collection URLs will be omitted from the sitemap.");
    }
  }

  // 3. Product entries
  for (const product of products) {
    entries.push({
      loc: `/products/${product.handle}`,
      lastmod: product.updatedAt ? toISODate(product.updatedAt) : today,
      changefreq: "weekly",
      priority: "0.8",
    });
  }

  // 4. Collection entries
  for (const collection of collections) {
    // Skip the catch-all "all" collection Shopify auto-creates
    if (collection.handle === "all") continue;
    entries.push({
      loc: `/collections/${collection.handle}`,
      lastmod: collection.updatedAt ? toISODate(collection.updatedAt) : today,
      changefreq: "weekly",
      priority: "0.8",
    });
  }

  // 5. Write output
  const outputPath = path.resolve(PROJECT_ROOT, "client", "public", "sitemap.xml");
  const xml = buildSitemapXml(entries);
  fs.writeFileSync(outputPath, xml, "utf-8");

  console.log(`\n✅ Sitemap written to: ${outputPath}`);
  console.log(`   Total URLs: ${entries.length}`);
  console.log(`   - Static routes:  ${STATIC_ROUTES.length}`);
  console.log(`   - Products:       ${products.length}`);
  console.log(`   - Collections:    ${collections.length}`);
}

main().catch((err) => {
  console.error(`\n💥 Sitemap generation failed: ${err.message}`);
  // Exit with code 0 so a sitemap failure does NOT block the Vite build.
  // The build will proceed; the sitemap will simply be missing or stale.
  process.exit(0);
});
