import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { client } from './index';

async function runPhase4Migration() {
  console.log('Running Phase 4 DB migrations...');

  // 1. Add NEEDS_REVISION to topic_status enum if not existing
  try {
    await client`ALTER TYPE topic_status ADD VALUE IF NOT EXISTS 'NEEDS_REVISION';`;
    console.log('✓ Added NEEDS_REVISION to topic_status enum');
  } catch (err: any) {
    console.log('Note on topic_status enum:', err.message);
  }

  // 2. Create task_stage enum if not existing
  try {
    await client`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_stage') THEN 
          CREATE TYPE task_stage AS ENUM ('LEARN', 'PRACTICE', 'BUILD', 'TEST', 'VERIFY', 'COMPLETE'); 
        END IF; 
      END $$;
    `;
    console.log('✓ Ensured task_stage enum exists');
  } catch (err: any) {
    console.log('Note on task_stage enum:', err.message);
  }

  // 3. Add current_stage column to task_progress if missing
  try {
    await client`
      ALTER TABLE task_progress 
      ADD COLUMN IF NOT EXISTS current_stage task_stage NOT NULL DEFAULT 'LEARN';
    `;
    console.log('✓ Added current_stage column to task_progress');
  } catch (err: any) {
    console.log('Note on current_stage column:', err.message);
  }

  // 4. Ensure UNIQUE constraint on task_progress(user_id, task_id)
  try {
    await client`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'task_progress_user_id_task_id_key'
        ) THEN
          ALTER TABLE task_progress ADD CONSTRAINT task_progress_user_id_task_id_key UNIQUE (user_id, task_id);
        END IF;
      END $$;
    `;
    console.log('✓ Ensured UNIQUE constraint on task_progress(user_id, task_id)');
  } catch (err: any) {
    console.log('Note on UNIQUE constraint for task_progress:', err.message);
  }

  // 5. Create subtask_progress table if missing
  try {
    await client`
      CREATE TABLE IF NOT EXISTS subtask_progress (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id text NOT NULL DEFAULT 'default_user',
        subtask_id uuid NOT NULL REFERENCES subtasks(id) ON DELETE CASCADE,
        is_completed boolean NOT NULL DEFAULT false,
        updated_at timestamp NOT NULL DEFAULT now(),
        CONSTRAINT subtask_progress_user_subtask_unique UNIQUE(user_id, subtask_id)
      );
    `;
    console.log('✓ Created subtask_progress table with UNIQUE(user_id, subtask_id)');
  } catch (err: any) {
    console.log('Note on subtask_progress table:', err.message);
  }

  console.log('Phase 4 DB Migration Completed Successfully!');
  await client.end();
}

runPhase4Migration().catch((e) => {
  console.error('Migration failed:', e);
  process.exit(1);
});
