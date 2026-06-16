/**
 * Shopify Storefront API 工具
 * 用于从 Shopify 获取商品、系列、元对象等数据
 */

const SHOPIFY_STORE_DOMAIN = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN as string;
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN as string;
const SHOPIFY_API_VERSION = "2024-10";

export const STOREFRONT_API_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

/**
 * 通用 Shopify Storefront API 请求函数
 */
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

/**
 * 获取指定类型的 Metaobjects（元对象）
 * 用于获取 Banner、公告等 CMS 内容
 */
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

/**
 * Banner Slide 数据结构（对应 Shopify Metaobject 字段）
 */
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

/**
 * 从 Shopify 获取首页 Banner 数据
 * Metaobject type: homepage_banner_slide
 */
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
