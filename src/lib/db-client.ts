// src/lib/db-client.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

// This will be replaced by Next.js API route at runtime
const connectionString = typeof window !== 'undefined' 
  ? '/api/db'  // will be intercepted by API route
  : process.env.DATABASE_URL!;

const client = postgres(connectionString);
export const db = drizzle(client);