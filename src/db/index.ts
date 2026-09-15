import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// At runtime, Next.js loads .env.local automatically.
// For the app server, we use the pooled connection (transaction mode).
// The seed script uses its own unpooled client for bulk operations.
const connectionString = process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED || '';

// Disable prepared statements — required for Supabase transaction-mode pooler
export const client = postgres(connectionString, { prepare: false, max: 10 });
export const db = drizzle(client, { schema });

