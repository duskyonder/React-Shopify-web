export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // Use a getter so the token is read from process.env at call time, not at module
  // initialization. This prevents Vercel serverless cold-start races where the env
  // var may not be injected yet when the module is first evaluated.
  get shopifyAdminToken(): string {
    return process.env.SHOPIFY_ADMIN_TOKEN ?? "";
  },
  // Shopify Storefront API (public) — used for collection/product/page queries.
  // The server process has access to ALL env vars at runtime (VITE_ prefix is only
  // stripped from the client bundle by Vite, not from the server process.env).
  shopifyStoreDomain:
    process.env.SHOPIFY_STORE_DOMAIN ??
    process.env.VITE_SHOPIFY_STORE_DOMAIN ??
    "c81aag-cy.myshopify.com",
  shopifyStorefrontToken:
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ??
    process.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN ??
    "",
  // Resend — transactional email (contact form)
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  // Admin panel secret — must match VITE_ADMIN_PASSWORD on the client
  get adminSecret(): string {
    return process.env.VITE_ADMIN_PASSWORD ?? "duskyonder2024";
  },
};
