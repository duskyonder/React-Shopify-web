/**
 * DUSKYONDER — Shopify Storefront API Blog Queries
 *
 * These GraphQL queries are ready to use with the Shopify Storefront API.
 * To switch from mock data to live Shopify data:
 *
 * 1. Set environment variables:
 *    SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
 *    SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-public-token
 *
 * 2. Replace imports of `mockArticles` / `mockBlogMeta` with calls to
 *    `fetchBlogArticles()` / `fetchArticleByHandle()` below.
 *
 * 3. Component code (BlogIndex.tsx, BlogArticle.tsx) requires NO changes —
 *    the data shape is identical.
 */

// ---------------------------------------------------------------------------
// GraphQL Fragments
// ---------------------------------------------------------------------------

export const ARTICLE_CARD_FRAGMENT = /* GraphQL */ `
  fragment ArticleCard on Article {
    id
    title
    handle
    excerpt
    publishedAt
    tags
    author { name }
    image {
      url(transform: { maxWidth: 800, preferredContentType: WEBP })
      altText
    }
  }
`;

export const ARTICLE_FULL_FRAGMENT = /* GraphQL */ `
  fragment ArticleFull on Article {
    id
    title
    handle
    excerpt
    contentHtml
    publishedAt
    tags
    author { name }
    image {
      url(transform: { maxWidth: 1200, preferredContentType: WEBP })
      altText
    }
  }
`;

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch paginated article list for the blog index page */
export const GET_BLOG_ARTICLES = /* GraphQL */ `
  ${ARTICLE_CARD_FRAGMENT}
  query GetBlogArticles($blogHandle: String!, $first: Int!, $after: String) {
    blog(handle: $blogHandle) {
      title
      handle
      articles(first: $first, after: $after, sortKey: PUBLISHED_AT, reverse: true) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            ...ArticleCard
          }
        }
      }
    }
  }
`;

/** Fetch a single article by handle for the detail page */
export const GET_ARTICLE_BY_HANDLE = /* GraphQL */ `
  ${ARTICLE_FULL_FRAGMENT}
  query GetArticleByHandle($blogHandle: String!, $articleHandle: String!) {
    blog(handle: $blogHandle) {
      articleByHandle(handle: $articleHandle) {
        ...ArticleFull
      }
    }
  }
`;

/** Fetch articles filtered by tag */
export const GET_ARTICLES_BY_TAG = /* GraphQL */ `
  ${ARTICLE_CARD_FRAGMENT}
  query GetArticlesByTag($blogHandle: String!, $tag: String!, $first: Int!) {
    blog(handle: $blogHandle) {
      articles(first: $first, query: $tag, sortKey: PUBLISHED_AT, reverse: true) {
        edges {
          node {
            ...ArticleCard
          }
        }
      }
    }
  }
`;

// ---------------------------------------------------------------------------
// Fetch helpers (uncomment and configure when ready to use live data)
// ---------------------------------------------------------------------------

/*
const SHOPIFY_DOMAIN = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN;
const STOREFRONT_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN;
const STOREFRONT_URL = `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`;

async function storefrontFetch<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data as T;
}

export async function fetchBlogArticles(blogHandle: string, first = 12, after?: string) {
  return storefrontFetch(GET_BLOG_ARTICLES, { blogHandle, first, after });
}

export async function fetchArticleByHandle(blogHandle: string, articleHandle: string) {
  return storefrontFetch(GET_ARTICLE_BY_HANDLE, { blogHandle, articleHandle });
}
*/
