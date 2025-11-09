import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Use API route in browser, direct URL in server
const connectionString = typeof window === 'undefined' 
  ? process.env.DATABASE_URL!
  : '/api/db-proxy';

const client = postgres(connectionString);
export const db = drizzle(client);
