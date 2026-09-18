import { db } from '@/db';
import {
  roadmapMonths,
  roadmapWeeks,
  roadmapTasks,
  subtasks,
  subtaskProgress,
  taskProgress,
} from '@/db/schema';
import { eq, asc, and, inArray } from 'drizzle-orm';

export type TaskStage = 'LEARN' | 'PRACTICE' | 'BUILD' | 'TEST' | 'VERIFY' | 'COMPLETE';
export type TopicStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'NEEDS_REVISION' | 'COMPLETED' | 'VERIFIED';

export async function getRoadmapOverview(userId: string = 'default_user') {
  try {
    const months = await db.select().from(roadmapMonths).orderBy(asc(roadmapMonths.monthNumber));
    const tasks = await db.select().from(roadmapTasks).orderBy(asc(roadmapTasks.orderIndex));
    const progressList = await db
      .select()
      .from(taskProgress)
      .where(eq(taskProgress.userId, userId));

    const progressMap = new Map(progressList.map((p) => [p.taskId, p]));

    return months.map((m) => {
      const monthTasks = tasks.filter((t) => t.monthId === m.id);
      const completedCount = monthTasks.filter((t) => {
        const p = progressMap.get(t.id);
        return p?.status === 'COMPLETED' || p?.status === 'VERIFIED';
      }).length;
      const verifiedCount = monthTasks.filter((t) => {
        const p = progressMap.get(t.id);
        return p?.status === 'VERIFIED';
      }).length;

      return {
        ...m,
        totalTasks: monthTasks.length,
        completedTasks: completedCount,
        verifiedTasks: verifiedCount,
        percentComplete:
          monthTasks.length > 0 ? Math.round((completedCount / monthTasks.length) * 100) : 0,
      };
    });
  } catch (err) {
    console.error('Error fetching roadmap overview:', err);
    return [];
  }
}

export async function getMonthDetails(monthNumber: number, userId: string = 'default_user') {
  try {
    const [month] = await db
      .select()
      .from(roadmapMonths)
      .where(eq(roadmapMonths.monthNumber, monthNumber));
    if (!month) return null;

    const weeks = await db
      .select()
      .from(roadmapWeeks)
      .where(eq(roadmapWeeks.monthId, month.id))
      .orderBy(asc(roadmapWeeks.weekNumber));

    const tasks = await db
      .select()
      .from(roadmapTasks)
      .where(eq(roadmapTasks.monthId, month.id))
      .orderBy(asc(roadmapTasks.orderIndex));

    const subtaskItems = await db.select().from(subtasks);
    const progressList = await db
      .select()
      .from(taskProgress)
      .where(eq(taskProgress.userId, userId));

    const progressMap = new Map(progressList.map((p) => [p.taskId, p]));
    const subtaskMap = new Map<string, typeof subtaskItems>();

    subtaskItems.forEach((st) => {
      const existing = subtaskMap.get(st.taskId) || [];
      subtaskMap.set(st.taskId, [...existing, st]);
    });

    const tasksWithDetails = tasks.map((t) => ({
      ...t,
      subtasks: subtaskMap.get(t.id) || [],
      progress: progressMap.get(t.id) || { status: 'NOT_STARTED' as const, currentStage: 'LEARN' as const },
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
  status: TopicStatus,
  userId: string = 'default_user'
) {
  try {
    const existing = await db
      .select()
      .from(taskProgress)
      .where(and(eq(taskProgress.taskId, taskId), eq(taskProgress.userId, userId)));

    // Guard: Prevent direct transition from NOT_STARTED to VERIFIED without completing execution/verification
    if (status === 'VERIFIED') {
      const currentStat = existing[0]?.status || 'NOT_STARTED';
      if (currentStat === 'NOT_STARTED') {
        return { success: false, error: 'Cannot directly mark a NOT_STARTED task as VERIFIED.' };
      }
    }

    const now = new Date();
    const updateData: Record<string, unknown> = {
      status,
      updatedAt: now,
    };

    if (status === 'IN_PROGRESS') {
      if (!existing[0] || !existing[0].startedAt) {
        updateData.startedAt = now;
      }
      if (!existing[0] || existing[0].currentStage === 'LEARN') {
        updateData.currentStage = 'LEARN';
      }
    } else if (status === 'COMPLETED' || status === 'VERIFIED') {
      if (!existing[0] || !existing[0].completedAt) {
        updateData.completedAt = now;
      }
      updateData.currentStage = 'COMPLETE';
      if (status === 'VERIFIED') {
        updateData.verifiedAt = now;
      }
    } else if (status === 'NEEDS_REVISION') {
      updateData.currentStage = 'PRACTICE';
    }

    if (existing.length > 0) {
      await db
        .update(taskProgress)
        .set(updateData)
        .where(eq(taskProgress.id, existing[0].id));
    } else {
      await db.insert(taskProgress).values({
        taskId,
        userId,
        status,
        currentStage: (updateData.currentStage as TaskStage) || 'LEARN',
        startedAt: updateData.startedAt as Date | undefined,
        completedAt: updateData.completedAt as Date | undefined,
        verifiedAt: updateData.verifiedAt as Date | undefined,
        updatedAt: now,
      });
    }

    return { success: true };
  } catch (err) {
    console.error('Error updating task status:', err);
    return { success: false, error: String(err) };
  }
}

export async function updateTaskStage(
  taskId: string,
  stage: TaskStage,
  userId: string = 'default_user'
) {
  try {
    const existing = await db
      .select()
      .from(taskProgress)
      .where(and(eq(taskProgress.taskId, taskId), eq(taskProgress.userId, userId)));

    const now = new Date();
    const updateData: Record<string, unknown> = {
      currentStage: stage,
      updatedAt: now,
    };

    // If task is not started and stage moves past LEARN, move status to IN_PROGRESS
    if (!existing[0] || existing[0].status === 'NOT_STARTED') {
      updateData.status = 'IN_PROGRESS';
      if (!existing[0]?.startedAt) {
        updateData.startedAt = now;
      }
    }

    if (stage === 'COMPLETE') {
      updateData.status = existing[0]?.status === 'VERIFIED' ? 'VERIFIED' : 'COMPLETED';
      if (!existing[0]?.completedAt) {
        updateData.completedAt = now;
      }
    }

    if (existing.length > 0) {
      await db
        .update(taskProgress)
        .set(updateData)
        .where(eq(taskProgress.id, existing[0].id));
    } else {
      await db.insert(taskProgress).values({
        taskId,
        userId,
        status: (updateData.status as TopicStatus) || 'IN_PROGRESS',
        currentStage: stage,
        startedAt: now,
        updatedAt: now,
      });
    }

    return { success: true };
  } catch (err) {
    console.error('Error updating task stage:', err);
    return { success: false, error: String(err) };
  }
}

export async function getUserSubtaskProgress(taskId: string, userId: string = 'default_user') {
  try {
    const taskSubtasks = await db.select().from(subtasks).where(eq(subtasks.taskId, taskId));
    if (taskSubtasks.length === 0) return {};

    const subtaskIds = taskSubtasks.map((st) => st.id);
    const progressRecords = await db
      .select()
      .from(subtaskProgress)
      .where(
        and(
          eq(subtaskProgress.userId, userId),
          inArray(subtaskProgress.subtaskId, subtaskIds)
        )
      );

    const map: Record<string, boolean> = {};
    progressRecords.forEach((r) => {
      map[r.subtaskId] = r.isCompleted;
    });

    return map;
  } catch (err) {
    console.error('Error fetching subtask progress:', err);
    return {};
  }
}

export async function toggleSubtaskProgress(
  subtaskId: string,
  isCompleted: boolean,
  userId: string = 'default_user'
) {
  try {
    const existing = await db
      .select()
      .from(subtaskProgress)
      .where(
        and(
          eq(subtaskProgress.subtaskId, subtaskId),
          eq(subtaskProgress.userId, userId)
        )
      );

    const now = new Date();

    if (existing.length > 0) {
      await db
        .update(subtaskProgress)
        .set({
          isCompleted,
          updatedAt: now,
        })
        .where(eq(subtaskProgress.id, existing[0].id));
    } else {
      await db.insert(subtaskProgress).values({
        subtaskId,
        userId,
        isCompleted,
        updatedAt: now,
      });
    }

    return { success: true };
  } catch (err) {
    console.error('Error toggling subtask progress:', err);
    return { success: false, error: String(err) };
  }
}

export async function getNextTaskFor(currentTaskId: string) {
  try {
    const months = await db.select().from(roadmapMonths).orderBy(asc(roadmapMonths.monthNumber));
    const weeks = await db.select().from(roadmapWeeks).orderBy(asc(roadmapWeeks.weekNumber));
    const tasks = await db.select().from(roadmapTasks).orderBy(asc(roadmapTasks.orderIndex));

    const monthMap = new Map(months.map((m) => [m.id, m]));
    const weekMap = new Map(weeks.map((w) => [w.id, w]));

    const sortedTasks = [...tasks].sort((a, b) => {
      const monthA = monthMap.get(a.monthId)?.monthNumber ?? 0;
      const monthB = monthMap.get(b.monthId)?.monthNumber ?? 0;
      if (monthA !== monthB) return monthA - monthB;

      const weekA = a.weekId ? (weekMap.get(a.weekId)?.weekNumber ?? 0) : 0;
      const weekB = b.weekId ? (weekMap.get(b.weekId)?.weekNumber ?? 0) : 0;
      if (weekA !== weekB) return weekA - weekB;

      return a.orderIndex - b.orderIndex;
    });

    const currentIndex = sortedTasks.findIndex((t) => t.id === currentTaskId);
    if (currentIndex === -1 || currentIndex >= sortedTasks.length - 1) {
      return null; // Is last task or not found
    }

    const nextTask = sortedTasks[currentIndex + 1];
    const month = monthMap.get(nextTask.monthId);
    const week = nextTask.weekId ? weekMap.get(nextTask.weekId) : null;

    return {
      ...nextTask,
      monthNumber: month?.monthNumber ?? 1,
      monthTitle: month?.title ?? '',
      weekNumber: week?.weekNumber ?? 1,
      weekTitle: week?.title ?? '',
    };
  } catch (err) {
    console.error('Error fetching next task:', err);
    return null;
  }
}
