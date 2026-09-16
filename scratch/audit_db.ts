import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {
  roadmapMonths,
  roadmapWeeks,
  roadmapTasks,
} from '../src/db/schema';
import { eq } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || '';
const client = postgres(connectionString, { max: 1, prepare: false });
const db = drizzle(client);

async function fullAudit() {
  const months = await db.select().from(roadmapMonths).orderBy(roadmapMonths.monthNumber);
  console.log('--- ALL 6 MONTHS BREAKDOWN ---');
  let totalWeeks = 0;
  let totalTasks = 0;
  for (const m of months) {
    const weeks = await db.select().from(roadmapWeeks).where(eq(roadmapWeeks.monthId, m.id)).orderBy(roadmapWeeks.weekNumber);
    const tasks = await db.select().from(roadmapTasks).where(eq(roadmapTasks.monthId, m.id)).orderBy(roadmapTasks.orderIndex);
    totalWeeks += weeks.length;
    totalTasks += tasks.length;
    console.log(`Month ${m.monthNumber}: "${m.title}" -> ${weeks.length} weeks, ${tasks.length} tasks`);
    for (const w of weeks) {
      const weekTasks = tasks.filter((t) => t.weekId === w.id);
      console.log(`   Week ${w.weekNumber}: "${w.title}" (${weekTasks.length} tasks)`);
    }
  }
  console.log(`\nTOTAL: ${months.length} Months, ${totalWeeks} Weeks, ${totalTasks} Tasks`);
  await client.end();
}

fullAudit().catch(console.error);
