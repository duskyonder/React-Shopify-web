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

const SHOPIFY_DOMAIN = "c81aag-cy.myshopify.com";
const SHOPIFY_API_VERSION = "2024-10";
const METAOBJECT_TYPE = "duskyonder_site_config";

/**
 * Returns the Shopify Admin API headers with the token read dynamically from
 * process.env at call time. This avoids Vercel serverless cold-start races
 * where a static ENV object may have captured an undefined value at module init.
 */
export function getShopifyAdminHeaders(): Record<string, string> {
  // Read directly from process.env every time — never cache at module scope
  const token = process.env.SHOPIFY_ADMIN_TOKEN;
  if (!token) {
    throw new Error(
      "Vercel Runtime Error: SHOPIFY_ADMIN_TOKEN is undefined or missing from process.env. " +
      "Ensure the variable is set in Vercel Project Settings → Environment Variables and " +
      "that the deployment has been redeployed after the variable was added."
    );
  }
  return {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": token,
  };
}

async function shopifyAdminGraphQL(query: string, variables?: Record<string, unknown>) {
  const headers = getShopifyAdminHeaders();
  const res = await fetch(
    `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
    }
  );
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error(
        `Shopify Admin API 401 Unauthorized. Token was present in process.env at request time ` +
        `but Shopify rejected it. Verify the token value in Vercel env vars matches the ` +
        `active Custom App token in the Shopify Admin (Apps → Develop apps → your app → API credentials).`
      );
    }
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
    const updateData = await shopifyAdminGraphQL(
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
    const updateErrors = (updateData as any)?.metaobjectUpdate?.userErrors;
    if (updateErrors && updateErrors.length > 0) {
      throw new Error(`Shopify metaobjectUpdate userErrors: ${JSON.stringify(updateErrors)}`);
    }
  } else {
    // Create new Metaobject
    const createData = await shopifyAdminGraphQL(
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
    const createErrors = (createData as any)?.metaobjectCreate?.userErrors;
    if (createErrors && createErrors.length > 0) {
      throw new Error(`Shopify metaobjectCreate userErrors: ${JSON.stringify(createErrors)}`);
    }
  }
}

/**
 * Upload a file to Shopify Files (CDN) using the Admin API.
 * Returns the public CDN URL of the uploaded file.
 *
 * Flow:
 *   1. stagedUploadsCreate  → get a pre-signed S3 target
 *   2. POST file to S3 target
 *   3. fileCreate           → register the file in Shopify Files
 */
export async function uploadToShopifyFiles(
  base64: string,
  mimeType: string,
  filename: string
): Promise<string> {
  // Step 1: Request a staged upload target
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
      input: [
        {
          filename,
          mimeType,
          resource: "FILE",
          httpMethod: "POST",
        },
      ],
    }
  );

  const userErrors = (stagedData as any)?.stagedUploadsCreate?.userErrors;
  if (userErrors && userErrors.length > 0) {
    throw new Error(`Shopify staged upload error: ${JSON.stringify(userErrors)}`);
  }

  const targets = (stagedData as any)?.stagedUploadsCreate?.stagedTargets as Array<{
    url: string;
    resourceUrl: string;
    parameters: Array<{ name: string; value: string }>;
  }>;

  if (!targets || targets.length === 0) {
    throw new Error("Shopify staged upload: no target returned");
  }

  const target = targets[0];

  // Step 2: Upload the file bytes to the staged S3 URL
  const base64Data = base64.replace(/^data:[^;]+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  // Build multipart form
  const boundary = `----FormBoundary${Date.now()}`;
  const parts: Buffer[] = [];

  for (const param of target.parameters) {
    parts.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${param.name}"\r\n\r\n${param.value}\r\n`
      )
    );
  }

  // File field must be last
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
    throw new Error(`Staged upload to S3 failed: ${uploadRes.status} ${uploadRes.statusText}\n${text}`);
  }

  // Step 3: Register the file in Shopify Files
  const fileData = await shopifyAdminGraphQL(
    `mutation fileCreate($files: [FileCreateInput!]!) {
      fileCreate(files: $files) {
        files {
          ... on MediaImage {
            id
            image { url }
          }
          ... on GenericFile {
            id
            url
          }
        }
        userErrors { field message }
      }
    }`,
    {
      files: [
        {
          originalSource: target.resourceUrl,
          contentType: "IMAGE",
          filename,
        },
      ],
    }
  );

  const fileErrors = (fileData as any)?.fileCreate?.userErrors;
  if (fileErrors && fileErrors.length > 0) {
    throw new Error(`Shopify fileCreate error: ${JSON.stringify(fileErrors)}`);
  }

  const files = (fileData as any)?.fileCreate?.files as Array<{
    image?: { url: string };
    url?: string;
  }>;

  if (!files || files.length === 0) {
    throw new Error("Shopify fileCreate: no file returned");
  }

  const cdnUrl = files[0].image?.url || files[0].url;
  if (!cdnUrl) {
    // File may still be processing — return resourceUrl as fallback
    return target.resourceUrl;
  }

  return cdnUrl;
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

/**
 * List images from Shopify Files (Admin API).
 * Returns a paginated list of MediaImage files.
 */
export async function listShopifyFiles(options?: {
  first?: number;
  after?: string;
  query?: string;
}): Promise<{
  files: Array<{
    id: string;
    url: string;
    alt: string;
    width: number;
    height: number;
    createdAt: string;
  }>;
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
}> {
  const first = options?.first ?? 50;
  const queryStr = options?.query
    ? `filename:*${options.query}* media_type:IMAGE`
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
    { first, after: options?.after ?? null, query: queryStr }
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
}
