import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { client } from './index';

async function runPhase5Migration() {
  console.log('Running Phase 5 DB migrations...');

  try {
    await client`
      ALTER TABLE study_sessions 
      ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'COMPLETED',
      ADD COLUMN IF NOT EXISTS paused_at timestamp,
      ADD COLUMN IF NOT EXISTS total_paused_seconds integer NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS duration_seconds integer NOT NULL DEFAULT 0;
    `;
    console.log('✓ Added status, paused_at, total_paused_seconds, and duration_seconds to study_sessions table');
  } catch (err: any) {
    console.log('Note on study_sessions migration:', err.message);
  }

  console.log('Phase 5 DB Migration Completed Successfully!');
  await client.end();
}

runPhase5Migration().catch((e) => {
  console.error('Phase 5 Migration failed:', e);
  process.exit(1);
});
