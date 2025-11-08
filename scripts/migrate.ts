// scripts/migrate.ts
// Run Drizzle SQL migrations without top-level await (CJS-safe)
// and explicitly load .env.local.

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); // ← important

import path from "path";
import { fileURLToPath } from "url";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("❌ DATABASE_URL is not set. Put it in .env.local");
    process.exit(1);
  }

  // Neon typically needs SSL; local Postgres ignores it.
  const client = postgres(url, { max: 1, ssl: "require" as any });
  const db = drizzle(client, { logger: true });

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const migrationsFolder = path.resolve(__dirname, "../drizzle");

  console.log("🚀 Running migrations from:", migrationsFolder);
  await migrate(db, { migrationsFolder });
  await client.end();
  console.log("✅ Migrations complete.");
}

main().catch((err) => {
  console.error("❌ Migration failed:\n", err);
  process.exit(1);
});