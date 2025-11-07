// src/db/client.ts
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

/**
 * We support both:
 *   - import { db } from "@/db/client"        // eager singleton
 *   - import { getDb } from "@/db/client"     // lazy getter (for SSR hot reload)
 */

let _db: NeonHttpDatabase | null = null;

export function getDb(): NeonHttpDatabase {
  if (_db) return _db;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  const sql = neon(url);
  _db = drizzle(sql);
  return _db;
}

// Eager singleton for routes/components that just want a db
export const db: NeonHttpDatabase = getDb();