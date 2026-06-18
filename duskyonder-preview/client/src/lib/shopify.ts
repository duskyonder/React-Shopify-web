/**
 * Shopify Storefront API 工具
 * 用于从 Shopify 获取商品、系列、元对象等数据，以及购物车和用户账号操作
 */

const SHOPIFY_STORE_DOMAIN = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN as string;
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN as string;
const SHOPIFY_API_VERSION = "2024-10";

export const STOREFRONT_API_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

// =====================================================
// 通用请求函数
// =====================================================

export async function shopifyFetch<T = any>({
  query,
  variables,
}: {
  query: string;
  variables?: Record<string, any>;
}): Promise<{ data: T; errors?: any[] }> {
  const response = await fetch(STOREFRONT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// =====================================================
// 元对象（Metaobjects）- Banner 等 CMS 内容
// =====================================================

export const GET_METAOBJECTS_BY_TYPE = `
  query GetMetaobjectsByType($type: String!, $first: Int!) {
    metaobjects(type: $type, first: $first) {
      nodes {
        id
        handle
        fields {
          key
          value
          reference {
            ... on MediaImage {
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    }
  }
`;

export interface ShopifyBannerSlide {
  id: string;
  handle: string;
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
  buttonLink?: string;
  imageUrl?: string;
  mobileImageUrl?: string;
  contentPosition?: string;
}

export async function fetchHomepageBanners(): Promise<ShopifyBannerSlide[]> {
  try {
    const { data, errors } = await shopifyFetch({
      query: GET_METAOBJECTS_BY_TYPE,
      variables: { type: "homepage_banner_slide", first: 10 },
    });

    if (errors?.length) {
      console.error("Shopify GraphQL errors:", errors);
      return [];
    }

    const nodes = data?.metaobjects?.nodes ?? [];

    return nodes.map((node: any) => {
      const fields: Record<string, any> = {};
      for (const field of node.fields) {
        if (field.reference?.image) {
          fields[field.key] = field.reference.image.url;
        } else {
          fields[field.key] = field.value;
        }
      }

      return {
        id: node.id,
        handle: node.handle,
        title: fields["title"] ?? "",
        subtitle: fields["subtitle"] ?? "",
        buttonLabel: fields["button_label"] ?? "",
        buttonLink: fields["button_link"] ?? "/",
        imageUrl: fields["image"] ?? "",
        mobileImageUrl: fields["mobile_image"] ?? fields["image"] ?? "",
        contentPosition: fields["content_position"] ?? "middle-center",
      };
    });
  } catch (err) {
    console.error("Failed to fetch Shopify banners:", err);
    return [];
  }
}

// =====================================================
// 产品详情（Product Detail）
// =====================================================

export const GET_PRODUCT_BY_HANDLE = `
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      descriptionHtml
      description
      vendor
      productType
      tags
      options {
        id
        name
        optionValues {
          id
          name
          swatch {
            color
          }
        }
      }
      variants(first: 100) {
        nodes {
          id
          title
          availableForSale
          quantityAvailable
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
          image {
            url
            altText
          }
        }
      }
      images(first: 20) {
        nodes {
          url
          altText
        }
      }
    }
  }
`;

export interface ShopifyProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable?: number;
  price: { amount: string; currencyCode: string };
  compareAtPrice?: { amount: string; currencyCode: string } | null;
  selectedOptions: { name: string; value: string }[];
  image?: { url: string; altText?: string } | null;
}

export interface ShopifyProductOptionValue {
  id: string;
  name: string;
  swatch?: { color?: string | null } | null;
}

export interface ShopifyProductOption {
  id: string;
  name: string;
  optionValues: ShopifyProductOptionValue[];
  /** @deprecated use optionValues */
  values: string[];
}

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  descriptionHtml: string;
  description: string;
  vendor: string;
  productType: string;
  tags: string[];
  options: ShopifyProductOption[];
  variants: ShopifyProductVariant[];
  images: { url: string; altText?: string }[];
}

export async function fetchProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  try {
    const { data, errors } = await shopifyFetch({
      query: GET_PRODUCT_BY_HANDLE,
      variables: { handle },
    });

    if (errors?.length) {
      console.error("Shopify product fetch errors:", errors);
      return null;
    }

    const product = data?.product;
    if (!product) return null;

    return {
      id: product.id,
      title: product.title,
      handle: product.handle,
      descriptionHtml: product.descriptionHtml,
      description: product.description,
      vendor: product.vendor,
      productType: product.productType,
      tags: product.tags,
      options: product.options.map((opt: any) => ({
        id: opt.id,
        name: opt.name,
        // Keep legacy `values` for backwards compat
        values: (opt.optionValues ?? []).map((v: any) => v.name),
        optionValues: (opt.optionValues ?? []).map((v: any) => ({
          id: v.id,
          name: v.name,
          swatch: v.swatch ?? null,
        })),
      })),
      variants: product.variants.nodes,
      images: product.images.nodes,
    };
  } catch (err) {
    console.error("Failed to fetch product:", err);
    return null;
  }
}

// =====================================================
// 购物车（Cart API）
// =====================================================

const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      totalAmount {
        amount
        currencyCode
      }
      subtotalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            image {
              url
              altText
            }
            product {
              title
              handle
            }
            selectedOptions {
              name
              value
            }
          }
        }
      }
    }
  }
`;

const CREATE_CART = `
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

const ADD_TO_CART = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

const UPDATE_CART_LINES = `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

const REMOVE_CART_LINES = `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

const GET_CART = `
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFields
    }
  }
  ${CART_FRAGMENT}
`;

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  cost: { totalAmount: { amount: string; currencyCode: string } };
  merchandise: {
    id: string;
    title: string;
    price: { amount: string; currencyCode: string };
    compareAtPrice?: { amount: string; currencyCode: string } | null;
    image?: { url: string; altText?: string } | null;
    product: { title: string; handle: string };
    selectedOptions: { name: string; value: string }[];
  };
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    totalAmount: { amount: string; currencyCode: string };
    subtotalAmount: { amount: string; currencyCode: string };
  };
  lines: ShopifyCartLine[];
}

function parseCart(cart: any): ShopifyCart {
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity,
    cost: cart.cost,
    lines: cart.lines.nodes,
  };
}

export async function createCart(variantId: string, quantity: number = 1): Promise<ShopifyCart | null> {
  try {
    const { data, errors } = await shopifyFetch({
      query: CREATE_CART,
      variables: {
        input: {
          lines: [{ merchandiseId: variantId, quantity }],
        },
      },
    });

    if (errors?.length || data?.cartCreate?.userErrors?.length) {
      console.error("Cart create errors:", errors || data?.cartCreate?.userErrors);
      return null;
    }

    return parseCart(data.cartCreate.cart);
  } catch (err) {
    console.error("Failed to create cart:", err);
    return null;
  }
}

export async function addToCart(cartId: string, variantId: string, quantity: number = 1): Promise<ShopifyCart | null> {
  try {
    const { data, errors } = await shopifyFetch({
      query: ADD_TO_CART,
      variables: {
        cartId,
        lines: [{ merchandiseId: variantId, quantity }],
      },
    });

    if (errors?.length || data?.cartLinesAdd?.userErrors?.length) {
      console.error("Add to cart errors:", errors || data?.cartLinesAdd?.userErrors);
      return null;
    }

    return parseCart(data.cartLinesAdd.cart);
  } catch (err) {
    console.error("Failed to add to cart:", err);
    return null;
  }
}

export async function updateCartLine(cartId: string, lineId: string, quantity: number): Promise<ShopifyCart | null> {
  try {
    const { data, errors } = await shopifyFetch({
      query: UPDATE_CART_LINES,
      variables: {
        cartId,
        lines: [{ id: lineId, quantity }],
      },
    });

    if (errors?.length || data?.cartLinesUpdate?.userErrors?.length) {
      console.error("Update cart errors:", errors || data?.cartLinesUpdate?.userErrors);
      return null;
    }

    return parseCart(data.cartLinesUpdate.cart);
  } catch (err) {
    console.error("Failed to update cart:", err);
    return null;
  }
}

export async function removeCartLine(cartId: string, lineId: string): Promise<ShopifyCart | null> {
  try {
    const { data, errors } = await shopifyFetch({
      query: REMOVE_CART_LINES,
      variables: {
        cartId,
        lineIds: [lineId],
      },
    });

    if (errors?.length || data?.cartLinesRemove?.userErrors?.length) {
      console.error("Remove cart line errors:", errors || data?.cartLinesRemove?.userErrors);
      return null;
    }

    return parseCart(data.cartLinesRemove.cart);
  } catch (err) {
    console.error("Failed to remove cart line:", err);
    return null;
  }
}

export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  try {
    const { data, errors } = await shopifyFetch({
      query: GET_CART,
      variables: { cartId },
    });

    if (errors?.length) {
      console.error("Get cart errors:", errors);
      return null;
    }

    if (!data?.cart) return null;
    return parseCart(data.cart);
  } catch (err) {
    console.error("Failed to get cart:", err);
    return null;
  }
}

// =====================================================
// 用户账号（Customer Account API）
// Shopify Customer Account API 使用 OAuth2 流程
// =====================================================

const CUSTOMER_ACCOUNT_API_CLIENT_ID = import.meta.env.VITE_SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID as string;

// Shopify Customer Account API endpoints (from OpenID discovery)
// Discovery: https://{store}.myshopify.com/.well-known/openid-configuration
// Shop ID: 90159776010 (from issuer URL)
const SHOPIFY_CUSTOMER_AUTH_DOMAIN = "https://account.duskyonder.com";
const SHOPIFY_AUTH_AUTHORIZE_URL = `${SHOPIFY_CUSTOMER_AUTH_DOMAIN}/authentication/oauth/authorize`;
const SHOPIFY_AUTH_LOGOUT_URL = `${SHOPIFY_CUSTOMER_AUTH_DOMAIN}/authentication/logout`;

/**
 * Generate PKCE code verifier and challenge (required for public clients)
 */
async function generatePKCE(): Promise<{ codeVerifier: string; codeChallenge: string }> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const codeVerifier = base64UrlEncode(array);

  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const codeChallenge = base64UrlEncode(new Uint8Array(digest));

  return { codeVerifier, codeChallenge };
}

function base64UrlEncode(buffer: Uint8Array): string {
  let str = "";
  buffer.forEach((b) => (str += String.fromCharCode(b)));
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * 生成 Shopify Customer Account 登录 URL
 * 使用 Shopify 的 OAuth2 PKCE 授权码流程（适用于 public client / SPA）
 */
export async function getCustomerLoginUrlAsync(redirectUri: string): Promise<string> {
  const { codeVerifier, codeChallenge } = await generatePKCE();
  const state = generateRandomState();
  const nonce = generateRandomNonce();

  // Store PKCE verifier and state in sessionStorage for callback verification
  sessionStorage.setItem("shopify_code_verifier", codeVerifier);
  sessionStorage.setItem("shopify_auth_state", state);
  sessionStorage.setItem("shopify_auth_nonce", nonce);

  const params = new URLSearchParams({
    client_id: CUSTOMER_ACCOUNT_API_CLIENT_ID,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: "openid email customer-account-api:full",
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  return `${SHOPIFY_AUTH_AUTHORIZE_URL}?${params.toString()}`;
}

/**
 * 同步版本（向后兼容）- 不含 PKCE，仅用于简单重定向
 */
export function getCustomerLoginUrl(redirectUri: string): string {
  const state = generateRandomState();
  const nonce = generateRandomNonce();

  sessionStorage.setItem("shopify_auth_state", state);
  sessionStorage.setItem("shopify_auth_nonce", nonce);

  const params = new URLSearchParams({
    client_id: CUSTOMER_ACCOUNT_API_CLIENT_ID,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: "openid email customer-account-api:full",
    state,
    nonce,
  });

  return `${SHOPIFY_AUTH_AUTHORIZE_URL}?${params.toString()}`;
}

/**
 * 生成 Shopify Customer Account 注册 URL（同一个 OAuth 流程，Shopify 会显示注册选项）
 */
export function getCustomerRegisterUrl(redirectUri: string): string {
  return getCustomerLoginUrl(redirectUri);
}

/**
 * 生成 Shopify Customer Account 登出 URL
 */
export function getCustomerLogoutUrl(redirectUri: string): string {
  return `${SHOPIFY_AUTH_LOGOUT_URL}?return_to=${encodeURIComponent(redirectUri)}`;
}

// Utility: generate random state for OAuth
function generateRandomState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

// Utility: generate random nonce for OAuth
function generateRandomNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}


// =====================================================
// Best Selling Products (Storefront API)
// =====================================================

const GET_BEST_SELLING_PRODUCTS = `
  query GetBestSellingProducts($first: Int!) {
    products(first: $first, sortKey: BEST_SELLING) {
      nodes {
        id
        title
        handle
        images(first: 2) {
          nodes {
            url
            altText
          }
        }
        variants(first: 1) {
          nodes {
            price {
              amount
              currencyCode
            }
          }
        }
        options {
          name
          values
        }
      }
    }
  }
`;

const GET_COLLECTION_PRODUCTS = `
  query GetCollectionProducts($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      products(first: $first) {
        nodes {
          id
          title
          handle
          images(first: 2) {
            nodes {
              url
              altText
            }
          }
          variants(first: 1) {
            nodes {
              price {
                amount
                currencyCode
              }
            }
          }
          options {
            name
            values
          }
        }
      }
    }
  }
`;

export interface StorefrontProductSimple {
  id: string;
  title: string;
  handle: string;
  imageUrl: string;
  hoverImageUrl?: string;
  price: string;
  colors: string[];
  detailUrl: string;
}

function mapStorefrontProducts(nodes: any[]): StorefrontProductSimple[] {
  return nodes.map((node: any) => {
    const images = node.images?.nodes || [];
    const price = node.variants?.nodes?.[0]?.price;
    const colorOption = node.options?.find((o: any) => o.name.toLowerCase() === 'color');
    return {
      id: node.id,
      title: node.title,
      handle: node.handle,
      imageUrl: images[0]?.url || '',
      hoverImageUrl: images[1]?.url || undefined,
      price: price ? `$${parseFloat(price.amount).toFixed(0)}` : '',
      colors: colorOption?.values || [],
      detailUrl: `/products/${node.handle}`,
    };
  });
}

export async function fetchBestSellingProducts(count: number = 12): Promise<StorefrontProductSimple[]> {
  try {
    const { data } = await shopifyFetch<{ products: { nodes: any[] } }>({
      query: GET_BEST_SELLING_PRODUCTS,
      variables: { first: count },
    });
    return mapStorefrontProducts(data.products?.nodes || []);
  } catch (e) {
    console.error('Failed to fetch best selling products:', e);
    return [];
  }
}

export async function fetchCollectionProducts(handle: string, count: number = 12): Promise<StorefrontProductSimple[]> {
  try {
    const { data } = await shopifyFetch<{ collection: { products: { nodes: any[] } } }>({
      query: GET_COLLECTION_PRODUCTS,
      variables: { handle, first: count },
    });
    return mapStorefrontProducts(data.collection?.products?.nodes || []);
  } catch (e) {
    console.error(`Failed to fetch collection "${handle}" products:`, e);
    return [];
  }
}

const GET_PRODUCTS_BY_TAG = `
  query GetProductsByTag($query: String!, $first: Int!) {
    products(first: $first, query: $query, sortKey: BEST_SELLING) {
      nodes {
        id
        title
        handle
        images(first: 2) {
          nodes {
            url
            altText
          }
        }
        variants(first: 1) {
          nodes {
            price {
              amount
              currencyCode
            }
          }
        }
        options {
          name
          values
        }
      }
    }
  }
`;

export async function fetchProductsByTag(tag: string, count: number = 12): Promise<StorefrontProductSimple[]> {
  try {
    const { data } = await shopifyFetch<{ products: { nodes: any[] } }>({
      query: GET_PRODUCTS_BY_TAG,
      variables: { query: `tag:${tag}`, first: count },
    });
    return mapStorefrontProducts(data.products?.nodes || []);
  } catch (e) {
    console.error(`Failed to fetch products by tag "${tag}":`, e);
    return [];
  }
}
