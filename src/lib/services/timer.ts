import { db } from '@/db';
import { studySessions } from '@/db/schema';

export async function logStudySession(data: {
  taskId?: string;
  projectId?: string;
  durationMinutes: number;
  sessionType?: string;
  notes?: string;
  userId?: string;
}) {
  try {
    const now = new Date();
    const startedAt = new Date(now.getTime() - data.durationMinutes * 60 * 1000);

    const [session] = await db
      .insert(studySessions)
      .values({
        userId: data.userId || 'default_user',
        taskId: data.taskId || null,
        projectId: data.projectId || null,
        startedAt,
        endedAt: now,
        durationMinutes: data.durationMinutes,
        sessionType: data.sessionType || 'LEARN',
        notes: data.notes || null,
      })
      .returning();

    return { success: true, session };
  } catch (err) {
    console.error('Error logging study session:', err);
    return { success: false, error: String(err) };
  }
}
