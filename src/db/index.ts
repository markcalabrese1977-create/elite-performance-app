// src/db/index.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// This will now be loaded via next.config.ts
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is missing — check .env.local and next.config.ts");
}

const sql = neon(DATABASE_URL);
export const db = drizzle(sql);