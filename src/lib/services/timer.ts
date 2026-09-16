import { db } from '@/db';
import { studySessions, roadmapTasks, roadmapMonths, roadmapWeeks } from '@/db/schema';
import { eq, and, inArray, desc, sql } from 'drizzle-orm';

export interface ActiveSessionResult {
  id: string;
  taskId?: string | null;
  projectId?: string | null;
  startedAt: Date;
  status: 'RUNNING' | 'PAUSED' | 'COMPLETED';
  sessionType: string;
  notes?: string | null;
  elapsedSeconds: number;
  totalPausedSeconds: number;
}

export async function getActiveStudySession(
  userId: string = 'default_user',
  taskId?: string
): Promise<ActiveSessionResult | null> {
  try {
    const query = taskId
      ? and(
          eq(studySessions.userId, userId),
          inArray(studySessions.status, ['RUNNING', 'PAUSED']),
          eq(studySessions.taskId, taskId)
        )
      : and(
          eq(studySessions.userId, userId),
          inArray(studySessions.status, ['RUNNING', 'PAUSED'])
        );

    const activeList = await db.select().from(studySessions).where(query).orderBy(desc(studySessions.startedAt));
    const session = activeList[0];

    if (!session) return null;

    const now = new Date();
    let currentTotalPaused = session.totalPausedSeconds || 0;

    if (session.status === 'PAUSED' && session.pausedAt) {
      const currentPauseDuration = Math.floor((now.getTime() - new Date(session.pausedAt).getTime()) / 1000);
      currentTotalPaused += Math.max(0, currentPauseDuration);
    }

    const totalTimeSpanSeconds = Math.floor((now.getTime() - new Date(session.startedAt).getTime()) / 1000);
    const elapsedSeconds = Math.max(0, totalTimeSpanSeconds - currentTotalPaused);

    return {
      id: session.id,
      taskId: session.taskId,
      projectId: session.projectId,
      startedAt: session.startedAt,
      status: session.status as 'RUNNING' | 'PAUSED' | 'COMPLETED',
      sessionType: session.sessionType || 'LEARN',
      notes: session.notes,
      elapsedSeconds,
      totalPausedSeconds: currentTotalPaused,
    };
  } catch (err) {
    console.error('Error fetching active study session:', err);
    return null;
  }
}

export async function startStudySession(
  data: {
    taskId?: string;
    projectId?: string;
    sessionType?: string;
  },
  userId: string = 'default_user'
) {
  try {
    // 1. Check if user already has an active session
    const existingActive = await getActiveStudySession(userId);

    if (existingActive) {
      // If active session is for the SAME task/project, return it
      if (
        (data.taskId && existingActive.taskId === data.taskId) ||
        (data.projectId && existingActive.projectId === data.projectId)
      ) {
        return { success: true, session: existingActive };
      }

      // If for a different task, complete/close the previous session first
      await finishStudySession({ sessionId: existingActive.id }, userId);
    }

    // 2. Insert new active session
    const now = new Date();
    const [newSession] = await db
      .insert(studySessions)
      .values({
        userId,
        taskId: data.taskId || null,
        projectId: data.projectId || null,
        startedAt: now,
        status: 'RUNNING',
        totalPausedSeconds: 0,
        durationSeconds: 0,
        durationMinutes: 0,
        sessionType: data.sessionType || 'LEARN',
      })
      .returning();

    return {
      success: true,
      session: {
        ...newSession,
        elapsedSeconds: 0,
        status: 'RUNNING' as const,
      },
    };
  } catch (err) {
    console.error('Error starting study session:', err);
    return { success: false, error: String(err) };
  }
}

export async function pauseStudySession(sessionId: string, userId: string = 'default_user') {
  try {
    const [session] = await db
      .select()
      .from(studySessions)
      .where(and(eq(studySessions.id, sessionId), eq(studySessions.userId, userId)));

    if (!session || session.status !== 'RUNNING') {
      return { success: false, error: 'No running session found to pause.' };
    }

    const now = new Date();
    await db
      .update(studySessions)
      .set({
        status: 'PAUSED',
        pausedAt: now,
      })
      .where(eq(studySessions.id, sessionId));

    return { success: true };
  } catch (err) {
    console.error('Error pausing study session:', err);
    return { success: false, error: String(err) };
  }
}

export async function resumeStudySession(sessionId: string, userId: string = 'default_user') {
  try {
    const [session] = await db
      .select()
      .from(studySessions)
      .where(and(eq(studySessions.id, sessionId), eq(studySessions.userId, userId)));

    if (!session || session.status !== 'PAUSED') {
      return { success: false, error: 'No paused session found to resume.' };
    }

    const now = new Date();
    let accumulatedPaused = session.totalPausedSeconds || 0;

    if (session.pausedAt) {
      const pauseDuration = Math.floor((now.getTime() - new Date(session.pausedAt).getTime()) / 1000);
      accumulatedPaused += Math.max(0, pauseDuration);
    }

    await db
      .update(studySessions)
      .set({
        status: 'RUNNING',
        pausedAt: null,
        totalPausedSeconds: accumulatedPaused,
      })
      .where(eq(studySessions.id, sessionId));

    return { success: true };
  } catch (err) {
    console.error('Error resuming study session:', err);
    return { success: false, error: String(err) };
  }
}

export async function finishStudySession(
  data: {
    sessionId: string;
    notes?: string;
    sessionType?: string;
  },
  userId: string = 'default_user'
) {
  try {
    const [session] = await db
      .select()
      .from(studySessions)
      .where(and(eq(studySessions.id, data.sessionId), eq(studySessions.userId, userId)));

    if (!session) {
      return { success: false, error: 'Study session not found.' };
    }

    const now = new Date();
    let totalPaused = session.totalPausedSeconds || 0;

    if (session.status === 'PAUSED' && session.pausedAt) {
      const pauseDuration = Math.floor((now.getTime() - new Date(session.pausedAt).getTime()) / 1000);
      totalPaused += Math.max(0, pauseDuration);
    }

    const totalSpanSeconds = Math.floor((now.getTime() - new Date(session.startedAt).getTime()) / 1000);
    const durationSeconds = Math.max(1, totalSpanSeconds - totalPaused);
    const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));

    await db
      .update(studySessions)
      .set({
        endedAt: now,
        durationSeconds,
        durationMinutes,
        status: 'COMPLETED',
        pausedAt: null,
        totalPausedSeconds: totalPaused,
        notes: data.notes ?? session.notes,
        sessionType: data.sessionType ?? session.sessionType,
      })
      .where(eq(studySessions.id, data.sessionId));

    return {
      success: true,
      durationMinutes,
      durationSeconds,
    };
  } catch (err) {
    console.error('Error finishing study session:', err);
    return { success: false, error: String(err) };
  }
}

export async function getTaskStudyTime(taskId: string, userId: string = 'default_user') {
  try {
    const sessions = await db
      .select()
      .from(studySessions)
      .where(
        and(
          eq(studySessions.taskId, taskId),
          eq(studySessions.userId, userId),
          eq(studySessions.status, 'COMPLETED')
        )
      );

    const totalMinutes = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    const totalSeconds = sessions.reduce((sum, s) => sum + (s.durationSeconds || Math.max(0, (s.durationMinutes || 0) * 60)), 0);

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    const formatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    return {
      totalMinutes,
      totalSeconds,
      formattedTime: formatted,
      sessionCount: sessions.length,
    };
  } catch (err) {
    console.error('Error fetching task study time:', err);
    return { totalMinutes: 0, totalSeconds: 0, formattedTime: '0m', sessionCount: 0 };
  }
}

export async function getRecentStudySessions(userId: string = 'default_user', limit: number = 10) {
  try {
    const sessions = await db
      .select()
      .from(studySessions)
      .where(
        and(
          eq(studySessions.userId, userId),
          eq(studySessions.status, 'COMPLETED')
        )
      )
      .orderBy(desc(studySessions.endedAt))
      .limit(limit);

    if (sessions.length === 0) return [];

    const taskIds = sessions.map((s) => s.taskId).filter(Boolean) as string[];
    const tasksMap = new Map();

    if (taskIds.length > 0) {
      const taskRecords = await db
        .select()
        .from(roadmapTasks)
        .where(inArray(roadmapTasks.id, taskIds));

      const monthIds = taskRecords.map((t) => t.monthId);
      const weekIds = taskRecords.map((t) => t.weekId).filter(Boolean) as string[];

      const monthRecords = monthIds.length > 0
        ? await db.select().from(roadmapMonths).where(inArray(roadmapMonths.id, monthIds))
        : [];
      const weekRecords = weekIds.length > 0
        ? await db.select().from(roadmapWeeks).where(inArray(roadmapWeeks.id, weekIds))
        : [];

      const monthMap = new Map(monthRecords.map((m) => [m.id, m]));
      const weekMap = new Map(weekRecords.map((w) => [w.id, w]));

      taskRecords.forEach((t) => {
        const m = monthMap.get(t.monthId);
        const w = t.weekId ? weekMap.get(t.weekId) : null;
        tasksMap.set(t.id, {
          title: t.title,
          monthNumber: m?.monthNumber ?? 1,
          weekNumber: w?.weekNumber ?? 1,
        });
      });
    }

    return sessions.map((s) => {
      const taskInfo = s.taskId ? tasksMap.get(s.taskId) : null;
      return {
        id: s.id,
        taskId: s.taskId,
        taskTitle: taskInfo?.title || 'General Automation Study',
        monthNumber: taskInfo?.monthNumber,
        weekNumber: taskInfo?.weekNumber,
        durationMinutes: s.durationMinutes,
        sessionType: s.sessionType || 'LEARN',
        notes: s.notes,
        startedAt: s.startedAt,
        endedAt: s.endedAt,
      };
    });
  } catch (err) {
    console.error('Error fetching recent study sessions:', err);
    return [];
  }
}

export async function logStudySession(
  data: {
    taskId?: string;
    projectId?: string;
    durationMinutes: number;
    sessionType?: string;
    notes?: string;
  },
  userId: string = 'default_user'
) {
  try {
    const now = new Date();
    const durationSeconds = data.durationMinutes * 60;
    const startedAt = new Date(now.getTime() - durationSeconds * 1000);

    const [session] = await db
      .insert(studySessions)
      .values({
        userId,
        taskId: data.taskId || null,
        projectId: data.projectId || null,
        startedAt,
        endedAt: now,
        durationMinutes: data.durationMinutes,
        durationSeconds,
        status: 'COMPLETED',
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
