/**
 * shopifyAdminAuth.ts
 *
 * Defensive OAuth token manager for the Shopify Admin API.
 * Treats the app as a Shopify Partner/Public App that issues short-lived
 * OAuth access tokens refreshable via CLIENT_ID + CLIENT_SECRET.
 *
 * Strategy:
 *   1. On every Admin API call, check whether the cached token is still valid
 *      (we consider it valid for TOKEN_TTL_MS after it was last fetched).
 *   2. If the token is missing, expired, or the caller signals a 401, attempt
 *      an OAuth token refresh using the Partner App credentials.
 *   3. Log the full Shopify response on every refresh attempt so we can see
 *      exactly what the API accepts or rejects — this is intentionally verbose
 *      for diagnostic purposes.
 *   4. Fall back to the static SHOPIFY_ADMIN_TOKEN env var if the refresh
 *      endpoint returns an error, so existing behaviour is preserved.
 *
 * Files changed:
 *   NEW  server/lib/shopifyAdminAuth.ts   ← this file
 *   MOD  server/shopifyConfig.ts          ← getShopifyAdminHeaders() updated
 *   MOD  api/index.ts                     ← getAdminToken() + shopifyAdminGraphQL() updated
 */

const SHOPIFY_DOMAIN =
  process.env.SHOPIFY_STORE_DOMAIN ??
  process.env.VITE_SHOPIFY_STORE_DOMAIN ??
  "c81aag-cy.myshopify.com";

const SHOPIFY_API_VERSION = "2024-10";

/**
 * How long (ms) we trust a freshly-fetched token before re-checking.
 * Shopify Partner App tokens are valid for ~24 h; we refresh at 23 h to
 * stay ahead of expiry. Adjust if your token lifetime differs.
 */
const TOKEN_TTL_MS = 23 * 60 * 60 * 1000; // 23 hours

// ── In-memory token cache (survives within a single serverless instance) ──────
interface TokenCache {
  token: string;
  fetchedAt: number; // Date.now() when the token was obtained
  expiresAt: number; // fetchedAt + TOKEN_TTL_MS (or Shopify-reported expiry)
}

let _cache: TokenCache | null = null;

function isCacheValid(): boolean {
  if (!_cache) return false;
  return Date.now() < _cache.expiresAt;
}

// ── OAuth token refresh ────────────────────────────────────────────────────────

/**
 * Attempts to obtain a fresh Admin API access token from Shopify using the
 * Partner App OAuth credential exchange.
 *
 * Shopify Partner App token endpoint (offline access mode):
 *   POST https://{shop}/admin/oauth/access_token
 *   Body: { client_id, client_secret, grant_type: "client_credentials" }
 *
 * NOTE: If the app is actually a Custom App (permanent shpat_ token), Shopify
 * will return a 4xx error here. The full response body is logged so you can
 * see exactly what Shopify says and we fall back to the static env var token.
 */
async function fetchFreshToken(): Promise<string | null> {
  const clientId = process.env.SHOPIFY_CLIENT_ID ?? "";
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET ?? "";

  if (!clientId || !clientSecret) {
    console.warn(
      "[shopifyAdminAuth] SHOPIFY_CLIENT_ID or SHOPIFY_CLIENT_SECRET is not set. " +
        "Cannot attempt OAuth refresh. Falling back to static SHOPIFY_ADMIN_TOKEN."
    );
    return null;
  }

  const endpoint = `https://${SHOPIFY_DOMAIN}/admin/oauth/access_token`;

  // ── DIAGNOSTIC: log what we are about to send ──────────────────────────────
  console.log("[shopifyAdminAuth] Attempting OAuth token refresh:", {
    endpoint,
    shop: SHOPIFY_DOMAIN,
    clientIdPrefix: clientId.slice(0, 8) + "...",
    clientSecretPrefix: clientSecret.slice(0, 4) + "...",
    grantType: "client_credentials",
    timestamp: new Date().toISOString(),
  });

  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
      }),
    });
  } catch (networkErr) {
    console.error("[shopifyAdminAuth] Network error during token refresh:", networkErr);
    return null;
  }

  // ── DIAGNOSTIC: log the full raw response ──────────────────────────────────
  const rawBody = await res.text();
  console.log("[shopifyAdminAuth] Token refresh response:", {
    status: res.status,
    statusText: res.statusText,
    headers: Object.fromEntries(res.headers.entries()),
    body: rawBody,
  });

  if (!res.ok) {
    console.error(
      `[shopifyAdminAuth] Token refresh failed (HTTP ${res.status}). ` +
        "This confirms whether Shopify accepts client_credentials for this app type. " +
        "See the 'body' field above for the exact Shopify error message."
    );
    return null;
  }

  let json: Record<string, unknown>;
  try {
    json = JSON.parse(rawBody);
  } catch {
    console.error("[shopifyAdminAuth] Could not parse token refresh response as JSON:", rawBody);
    return null;
  }

  const newToken = (json.access_token as string) ?? null;
  if (!newToken) {
    console.error(
      "[shopifyAdminAuth] Token refresh response did not contain access_token field:",
      json
    );
    return null;
  }

  // Shopify may return expires_in (seconds); use it if present, else use TTL
  const expiresIn =
    typeof json.expires_in === "number" ? json.expires_in * 1000 : TOKEN_TTL_MS;

  const now = Date.now();
  _cache = { token: newToken, fetchedAt: now, expiresAt: now + expiresIn };

  console.log("[shopifyAdminAuth] Token refresh succeeded.", {
    tokenPrefix: newToken.slice(0, 8) + "...",
    expiresAt: new Date(_cache.expiresAt).toISOString(),
  });

  return newToken;
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Returns a valid Admin API token.
 *
 * Resolution order:
 *   1. In-memory cache (if not expired)
 *   2. OAuth refresh via CLIENT_ID + CLIENT_SECRET
 *   3. Static SHOPIFY_ADMIN_TOKEN env var (fallback / Custom App permanent token)
 */
export async function getAdminToken(): Promise<string> {
  // 1. Cache hit
  if (isCacheValid()) {
    return _cache!.token;
  }

  // 2. OAuth refresh attempt
  const refreshed = await fetchFreshToken();
  if (refreshed) return refreshed;

  // 3. Static fallback
  const staticToken = process.env.SHOPIFY_ADMIN_TOKEN ?? "";
  if (staticToken) {
    console.log(
      "[shopifyAdminAuth] Using static SHOPIFY_ADMIN_TOKEN as fallback. " +
        "Token prefix: " +
        staticToken.slice(0, 8) +
        "..."
    );
    // Cache the static token too so we don't spam refresh attempts
    const now = Date.now();
    _cache = { token: staticToken, fetchedAt: now, expiresAt: now + TOKEN_TTL_MS };
    return staticToken;
  }

  throw new Error(
    "[shopifyAdminAuth] No Admin API token available. " +
      "OAuth refresh failed and SHOPIFY_ADMIN_TOKEN is not set."
  );
}

/**
 * Invalidates the in-memory cache, forcing the next getAdminToken() call to
 * attempt a fresh OAuth refresh. Call this when a 401 is received.
 */
export function invalidateTokenCache(): void {
  console.log("[shopifyAdminAuth] Token cache invalidated (401 received). Will refresh on next call.");
  _cache = null;
}

/**
 * Drop-in replacement for the Admin API GraphQL fetch that automatically
 * handles token acquisition and 401 retry (one retry per request).
 */
export async function shopifyAdminFetch(
  query: string,
  variables?: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const makeRequest = async (token: string) =>
    fetch(`https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({ query, variables }),
    });

  let token = await getAdminToken();
  let res = await makeRequest(token);

  // On 401, invalidate cache and retry once with a fresh token
  if (res.status === 401) {
    console.warn("[shopifyAdminAuth] Received 401 on Admin API call. Invalidating cache and retrying.");
    invalidateTokenCache();
    token = await getAdminToken();
    res = await makeRequest(token);
  }

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(
      `[shopifyAdminAuth] Shopify Admin API error: ${res.status} ${res.statusText} — ${errBody}`
    );
  }

  const json = (await res.json()) as { data?: unknown; errors?: unknown[] };
  if (json.errors) {
    throw new Error(
      `[shopifyAdminAuth] Shopify GraphQL errors: ${JSON.stringify(json.errors)}`
    );
  }
  return json.data as Record<string, unknown>;
}
