import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

declare global {
  // eslint-disable-next-line no-var
  var __db__: ReturnType<typeof drizzle> | undefined;
}

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  // Reuse across hot reloads in dev
  if (!global.__db__) {
    const sql = neon(process.env.DATABASE_URL);
    global.__db__ = drizzle(sql);
  }
  return global.__db__;
}