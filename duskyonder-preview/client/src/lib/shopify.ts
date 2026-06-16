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
        name
        values
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

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  descriptionHtml: string;
  description: string;
  vendor: string;
  productType: string;
  tags: string[];
  options: { name: string; values: string[] }[];
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
      options: product.options,
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

/**
 * 生成 Shopify Customer Account 登录 URL
 * 使用 Shopify 的 OAuth2 授权码流程
 */
export function getCustomerLoginUrl(redirectUri: string): string {
  const shopId = SHOPIFY_STORE_DOMAIN.replace(".myshopify.com", "");
  const authUrl = `https://shopify.com/${shopId}/auth/oauth/authorize`;

  const params = new URLSearchParams({
    client_id: CUSTOMER_ACCOUNT_API_CLIENT_ID,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: "openid email customer-account-api:full",
    state: generateRandomState(),
    nonce: generateRandomNonce(),
  });

  return `${authUrl}?${params.toString()}`;
}

/**
 * 生成 Shopify Customer Account 注册 URL（同一个 OAuth 流程，Shopify 会显示注册选项）
 */
export function getCustomerRegisterUrl(redirectUri: string): string {
  // Shopify Customer Account API 的注册和登录使用同一个 OAuth 端点
  // 用户在 Shopify 的登录页面可以选择注册
  return getCustomerLoginUrl(redirectUri);
}

/**
 * 生成 Shopify Customer Account 登出 URL
 */
export function getCustomerLogoutUrl(redirectUri: string): string {
  const shopId = SHOPIFY_STORE_DOMAIN.replace(".myshopify.com", "");
  return `https://shopify.com/${shopId}/auth/logout?return_to=${encodeURIComponent(redirectUri)}`;
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
