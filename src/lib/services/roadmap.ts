import { db } from '@/db';
import { roadmapMonths, roadmapWeeks, roadmapTasks, subtasks, taskProgress } from '@/db/schema';
import { eq, asc, and } from 'drizzle-orm';

export async function getRoadmapOverview() {
  try {
    const months = await db.select().from(roadmapMonths).orderBy(asc(roadmapMonths.monthNumber));
    const tasks = await db.select().from(roadmapTasks).orderBy(asc(roadmapTasks.orderIndex));
    const progressList = await db.select().from(taskProgress);

    const progressMap = new Map(progressList.map(p => [p.taskId, p]));

    return months.map(m => {
      const monthTasks = tasks.filter(t => t.monthId === m.id);
      const completedCount = monthTasks.filter(t => {
        const p = progressMap.get(t.id);
        return p?.status === 'COMPLETED' || p?.status === 'VERIFIED';
      }).length;
      const verifiedCount = monthTasks.filter(t => {
        const p = progressMap.get(t.id);
        return p?.status === 'VERIFIED';
      }).length;

      return {
        ...m,
        totalTasks: monthTasks.length,
        completedTasks: completedCount,
        verifiedTasks: verifiedCount,
        percentComplete: monthTasks.length > 0 ? Math.round((completedCount / monthTasks.length) * 100) : 0,
      };
    });
  } catch (err) {
    console.error('Error fetching roadmap overview:', err);
    return [];
  }
}

export async function getMonthDetails(monthNumber: number) {
  try {
    const [month] = await db.select().from(roadmapMonths).where(eq(roadmapMonths.monthNumber, monthNumber));
    if (!month) return null;

    const weeks = await db.select().from(roadmapWeeks).where(eq(roadmapWeeks.monthId, month.id)).orderBy(asc(roadmapWeeks.weekNumber));
    const tasks = await db.select().from(roadmapTasks).where(eq(roadmapTasks.monthId, month.id)).orderBy(asc(roadmapTasks.orderIndex));
    const subtaskItems = await db.select().from(subtasks);
    const progressList = await db.select().from(taskProgress);

    const progressMap = new Map(progressList.map(p => [p.taskId, p]));
    const subtaskMap = new Map<string, typeof subtaskItems>();

    subtaskItems.forEach(st => {
      const existing = subtaskMap.get(st.taskId) || [];
      subtaskMap.set(st.taskId, [...existing, st]);
    });

    const tasksWithDetails = tasks.map(t => ({
      ...t,
      subtasks: subtaskMap.get(t.id) || [],
      progress: progressMap.get(t.id) || { status: 'NOT_STARTED' as const },
    }));

    return {
      month,
      weeks,
      tasks: tasksWithDetails,
    };
  } catch (err) {
    console.error('Error fetching month details:', err);
    return null;
  }
}

export async function updateTaskStatus(
  taskId: string,
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED',
  userId: string = 'default_user'
) {
  try {
    const existing = await db.select().from(taskProgress).where(
      and(eq(taskProgress.taskId, taskId), eq(taskProgress.userId, userId))
    );

    const now = new Date();
    const updateData: any = {
      status,
      updatedAt: now,
    };

    if (status === 'IN_PROGRESS' && (!existing[0] || !existing[0].startedAt)) {
      updateData.startedAt = now;
    }
    if ((status === 'COMPLETED' || status === 'VERIFIED') && (!existing[0] || !existing[0].completedAt)) {
      updateData.completedAt = now;
    }
    if (status === 'VERIFIED') {
      updateData.verifiedAt = now;
    }

    if (existing.length > 0) {
      await db.update(taskProgress)
        .set(updateData)
        .where(eq(taskProgress.id, existing[0].id));
    } else {
      await db.insert(taskProgress).values({
        taskId,
        userId,
        ...updateData,
      });
    }

    return { success: true };
  } catch (err) {
    console.error('Error updating task status:', err);
    return { success: false, error: String(err) };
  }
}
