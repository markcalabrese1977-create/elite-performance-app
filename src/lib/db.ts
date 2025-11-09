// src/lib/db.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Load DATABASE_URL from .env.local
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set in .env.local');
}

const client = postgres(connectionString, {
  max: 1, // Important for scripts
});

export const db = drizzle(client);