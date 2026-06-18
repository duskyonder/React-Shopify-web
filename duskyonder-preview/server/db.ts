import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, themeConfig, uploadedImages, InsertUploadedImage, newsletterSubscribers } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Theme config helpers
export async function getThemeConfig(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(themeConfig).where(eq(themeConfig.configKey, key)).limit(1);
  return result.length > 0 ? result[0].configValue : null;
}

export async function setThemeConfig(key: string, value: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(themeConfig)
    .values({ configKey: key, configValue: value })
    .onDuplicateKeyUpdate({ set: { configValue: value } });
}

export async function getAllThemeConfigs(): Promise<Record<string, string>> {
  const db = await getDb();
  if (!db) return {};
  const rows = await db.select().from(themeConfig);
  const result: Record<string, string> = {};
  for (const row of rows) {
    result[row.configKey] = row.configValue;
  }
  return result;
}

// Uploaded images helpers
export async function upsertUploadedImage(data: InsertUploadedImage): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(uploadedImages)
    .values(data)
    .onDuplicateKeyUpdate({ set: { s3Key: data.s3Key, url: data.url, originalName: data.originalName } });
}

export async function getUploadedImages(section: string): Promise<Array<{ slot: string; url: string; s3Key: string }>> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(uploadedImages).where(eq(uploadedImages.section, section));
  return rows.map(r => ({ slot: r.slot, url: r.url, s3Key: r.s3Key }));
}

export async function getAllUploadedImages(): Promise<Record<string, Record<string, string>>> {
  const db = await getDb();
  if (!db) return {};
  const rows = await db.select().from(uploadedImages);
  const result: Record<string, Record<string, string>> = {};
  for (const row of rows) {
    if (!result[row.section]) result[row.section] = {};
    result[row.section][row.slot] = row.url;
  }
  return result;
}

/** Insert a newsletter subscriber; returns false if the email is already subscribed. */
export async function addNewsletterSubscriber(email: string, source: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  try {
    await db.insert(newsletterSubscribers).values({ email, source });
    return true;
  } catch {
    // Duplicate entry → already subscribed
    return false;
  }
}
