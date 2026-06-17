/**
 * Shopify Metaobjects-based site configuration storage.
 *
 * Each configuration section is stored as a separate Metaobject of type
 * `duskyonder_site_config` with two fields:
 *   - config_key: unique string key (e.g. "hero", "promoBar", "sectionOrder")
 *   - config_value: JSON-stringified configuration data
 *
 * This allows the admin editor to persist changes to Shopify, and the
 * storefront to read configuration directly from Shopify without a separate DB.
 */

import { ENV } from "./_core/env";

const SHOPIFY_DOMAIN = "c81aag-cy.myshopify.com";
const SHOPIFY_API_VERSION = "2024-10";
const METAOBJECT_TYPE = "duskyonder_site_config";

function getAdminToken() {
  return ENV.shopifyAdminToken;
}

async function shopifyAdminGraphQL(query: string, variables?: Record<string, unknown>) {
  const res = await fetch(
    `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": getAdminToken(),
      },
      body: JSON.stringify({ query, variables }),
    }
  );
  if (!res.ok) {
    throw new Error(`Shopify Admin API error: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as { data?: unknown; errors?: unknown[] };
  if (json.errors) {
    throw new Error(`Shopify GraphQL errors: ${JSON.stringify(json.errors)}`);
  }
  return json.data as Record<string, unknown>;
}

/**
 * Read a config value from Shopify Metaobjects by key.
 * Returns parsed JSON or null if not found.
 */
export async function getShopifyConfig<T = unknown>(key: string): Promise<T | null> {
  const data = await shopifyAdminGraphQL(
    `query GetConfig($type: String!, $first: Int!) {
      metaobjects(type: $type, first: $first) {
        nodes {
          id
          fields {
            key
            value
          }
        }
      }
    }`,
    { type: METAOBJECT_TYPE, first: 250 }
  );

  const nodes = (data as any)?.metaobjects?.nodes as Array<{
    id: string;
    fields: Array<{ key: string; value: string }>;
  }>;

  if (!nodes) return null;

  const match = nodes.find((node) => {
    const keyField = node.fields.find((f) => f.key === "config_key");
    return keyField?.value === key;
  });

  if (!match) return null;

  const valueField = match.fields.find((f) => f.key === "config_value");
  if (!valueField?.value) return null;

  try {
    return JSON.parse(valueField.value) as T;
  } catch {
    return null;
  }
}

/**
 * Write a config value to Shopify Metaobjects.
 * Creates a new Metaobject if it doesn't exist, or updates the existing one.
 */
export async function setShopifyConfig(key: string, value: unknown): Promise<void> {
  const jsonValue = JSON.stringify(value);

  // First, find if a Metaobject with this key already exists
  const data = await shopifyAdminGraphQL(
    `query FindConfig($type: String!, $first: Int!) {
      metaobjects(type: $type, first: 250) {
        nodes {
          id
          fields {
            key
            value
          }
        }
      }
    }`,
    { type: METAOBJECT_TYPE, first: 250 }
  );

  const nodes = (data as any)?.metaobjects?.nodes as Array<{
    id: string;
    fields: Array<{ key: string; value: string }>;
  }>;

  const existing = nodes?.find((node) => {
    const keyField = node.fields.find((f) => f.key === "config_key");
    return keyField?.value === key;
  });

  if (existing) {
    // Update existing Metaobject
    await shopifyAdminGraphQL(
      `mutation UpdateConfig($id: ID!, $metaobject: MetaobjectUpdateInput!) {
        metaobjectUpdate(id: $id, metaobject: $metaobject) {
          metaobject { id }
          userErrors { field message }
        }
      }`,
      {
        id: existing.id,
        metaobject: {
          fields: [
            { key: "config_key", value: key },
            { key: "config_value", value: jsonValue },
          ],
        },
      }
    );
  } else {
    // Create new Metaobject
    await shopifyAdminGraphQL(
      `mutation CreateConfig($metaobject: MetaobjectCreateInput!) {
        metaobjectCreate(metaobject: $metaobject) {
          metaobject { id }
          userErrors { field message }
        }
      }`,
      {
        metaobject: {
          type: METAOBJECT_TYPE,
          fields: [
            { key: "config_key", value: key },
            { key: "config_value", value: jsonValue },
          ],
        },
      }
    );
  }
}

/**
 * Get all config entries as a key-value map.
 */
export async function getAllShopifyConfigs(): Promise<Record<string, unknown>> {
  const data = await shopifyAdminGraphQL(
    `query GetAllConfigs($type: String!) {
      metaobjects(type: $type, first: 250) {
        nodes {
          fields {
            key
            value
          }
        }
      }
    }`,
    { type: METAOBJECT_TYPE }
  );

  const nodes = (data as any)?.metaobjects?.nodes as Array<{
    fields: Array<{ key: string; value: string }>;
  }>;

  if (!nodes) return {};

  const result: Record<string, unknown> = {};
  for (const node of nodes) {
    const keyField = node.fields.find((f) => f.key === "config_key");
    const valueField = node.fields.find((f) => f.key === "config_value");
    if (keyField?.value && valueField?.value) {
      try {
        result[keyField.value] = JSON.parse(valueField.value);
      } catch {
        result[keyField.value] = valueField.value;
      }
    }
  }
  return result;
}
