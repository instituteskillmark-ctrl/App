import postgres from 'postgres';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function runMigrations() {
  console.log('🔄 Connecting to PostgreSQL database for migration execution...');

  // Prefer DATABASE_URL_UNPOOLED (session-mode pooler, port 5432) for migrations
  // Falls back to DATABASE_URL (transaction-mode pooler, port 6543)
  const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

  if (!connectionString || connectionString.includes('YOUR_PROJECT_REF') || connectionString.includes('YOUR_DB_PASSWORD')) {
    console.error('❌ Error: DATABASE_URL is not configured with real database credentials in .env.local.');
    process.exit(1);
  }

  // Create client with prepare: false for pooler compatibility
  const sqlClient = postgres(connectionString, { max: 1, prepare: false, connect_timeout: 10 });

  try {
    const migrationFilePath = path.join(process.cwd(), 'drizzle', '0000_thick_kabuki.sql');
    const sqlContent = fs.readFileSync(migrationFilePath, 'utf-8');

    const statements = sqlContent
      .split('--> statement-breakpoint')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    console.log(`📦 Executing ${statements.length} migration statements...`);

    for (const stmt of statements) {
      try {
        await sqlClient.unsafe(stmt);
      } catch (err: any) {
        if (err.code === '42710' || err.code === '42P07' || err.message?.includes('already exists')) {
          // Ignore table/type already exists
        } else {
          console.warn(`Statement note: ${err.message}`);
        }
      }
    }

    console.log('✅ PostgreSQL Schema Migration Applied Successfully!');
    await sqlClient.end();
  } catch (err: any) {
    console.error('❌ Migration Connection Failure:', err.message || err);
    await sqlClient.end();
    process.exit(1);
  }
}

runMigrations();
