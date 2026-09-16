import { db } from '@/db';
import {
  roadmapMonths,
  roadmapWeeks,
  roadmapTasks,
  taskProgress,
} from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { getAuthUserId } from '@/lib/supabase/server';

export interface TaskPositionItem {
  id: string;
  monthId: string;
  weekId: string | null;
  title: string;
  durationLabel: string | null;
  priority: 'MASTER' | 'IMPORTANT' | 'BASICS_ENOUGH';
  orderIndex: number;
  description: string | null;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'NEEDS_REVISION' | 'COMPLETED' | 'VERIFIED';
  startedAt?: Date | null;
  completedAt?: Date | null;
  updatedAt?: Date | null;
}

export interface CurrentPositionData {
  currentMonth: {
    id: string;
    monthNumber: number;
    title: string;
    subtitle: string | null;
    durationWeeks: string;
    keyOutput: string | null;
  } | null;
  currentWeek: {
    id: string;
    monthId: string;
    weekNumber: number;
    title: string;
  } | null;
  currentTask: TaskPositionItem | null;
  nextTask: TaskPositionItem | null;
  roadmapProgress: {
    totalTasks: number; // 52
    completedTasksCount: number;
    verifiedTasksCount: number;
    inProgressTasksCount: number;
    percentComplete: number;
  };
  currentMonthProgress: {
    totalTasks: number;
    completedTasksCount: number;
    verifiedTasksCount: number;
    percentComplete: number;
  };
  completionState: 'IN_PROGRESS' | 'ROADMAP_COMPLETE';
}

export async function getCurrentPosition(targetUserId?: string): Promise<CurrentPositionData> {
  try {
    const userId = targetUserId || (await getAuthUserId());

    // 1. Fetch all months ordered by monthNumber
    const months = await db
      .select()
      .from(roadmapMonths)
      .orderBy(asc(roadmapMonths.monthNumber));

  // 2. Fetch all weeks ordered by weekNumber
  const weeks = await db
    .select()
    .from(roadmapWeeks)
    .orderBy(asc(roadmapWeeks.weekNumber));

  // 3. Fetch all tasks ordered by orderIndex
  const tasks = await db
    .select()
    .from(roadmapTasks)
    .orderBy(asc(roadmapTasks.orderIndex));

  // 4. Fetch user's task progress
  const progressList = await db
    .select()
    .from(taskProgress)
    .where(eq(taskProgress.userId, userId));

  const progressMap = new Map(progressList.map((p) => [p.taskId, p]));
  const weekMap = new Map(weeks.map((w) => [w.id, w]));
  const monthMap = new Map(months.map((m) => [m.id, m]));

  // Build canonical sorted task list (Month asc -> Week asc -> Task orderIndex asc)
  const sortedTasks = [...tasks].sort((a, b) => {
    const monthA = monthMap.get(a.monthId)?.monthNumber ?? 0;
    const monthB = monthMap.get(b.monthId)?.monthNumber ?? 0;
    if (monthA !== monthB) return monthA - monthB;

    const weekA = a.weekId ? (weekMap.get(a.weekId)?.weekNumber ?? 0) : 0;
    const weekB = b.weekId ? (weekMap.get(b.weekId)?.weekNumber ?? 0) : 0;
    if (weekA !== weekB) return weekA - weekB;

    return a.orderIndex - b.orderIndex;
  });

  // Attach progress status to each task
  const decoratedTasks: TaskPositionItem[] = sortedTasks.map((t) => {
    const p = progressMap.get(t.id);
    return {
      id: t.id,
      monthId: t.monthId,
      weekId: t.weekId,
      title: t.title,
      durationLabel: t.durationLabel,
      priority: t.priority as 'MASTER' | 'IMPORTANT' | 'BASICS_ENOUGH',
      orderIndex: t.orderIndex,
      description: t.description,
      status: (p?.status as 'NOT_STARTED' | 'IN_PROGRESS' | 'NEEDS_REVISION' | 'COMPLETED' | 'VERIFIED') || 'NOT_STARTED',
      startedAt: p?.startedAt ?? null,
      completedAt: p?.completedAt ?? null,
      updatedAt: p?.updatedAt ?? null,
    };
  });

  // 5. Find FIRST task where status is NOT COMPLETED and NOT VERIFIED
  let currentTaskIdx = -1;
  for (let i = 0; i < decoratedTasks.length; i++) {
    const st = decoratedTasks[i].status;
    if (st !== 'COMPLETED' && st !== 'VERIFIED') {
      currentTaskIdx = i;
      break;
    }
  }

  // Calculate overall stats
  const completedTasksCount = decoratedTasks.filter(
    (t) => t.status === 'COMPLETED' || t.status === 'VERIFIED'
  ).length;
  const verifiedTasksCount = decoratedTasks.filter((t) => t.status === 'VERIFIED').length;
  const inProgressTasksCount = decoratedTasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const totalTasks = decoratedTasks.length;
  const roadmapPercent = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  // Check completion state
  if (currentTaskIdx === -1 && decoratedTasks.length > 0) {
    // All tasks completed/verified!
    const lastMonth = months[months.length - 1] || null;
    const lastWeek = weeks[weeks.length - 1] || null;

    const lastMonthTasks = decoratedTasks.filter((t) => t.monthId === lastMonth?.id);
    const lastMonthCompleted = lastMonthTasks.filter(
      (t) => t.status === 'COMPLETED' || t.status === 'VERIFIED'
    ).length;

    return {
      currentMonth: lastMonth,
      currentWeek: lastWeek,
      currentTask: null,
      nextTask: null,
      roadmapProgress: {
        totalTasks,
        completedTasksCount,
        verifiedTasksCount,
        inProgressTasksCount,
        percentComplete: 100,
      },
      currentMonthProgress: {
        totalTasks: lastMonthTasks.length,
        completedTasksCount: lastMonthCompleted,
        verifiedTasksCount: lastMonthTasks.filter((t) => t.status === 'VERIFIED').length,
        percentComplete: 100,
      },
      completionState: 'ROADMAP_COMPLETE',
    };
  }

  // In-progress position
  const currentTask = currentTaskIdx >= 0 ? decoratedTasks[currentTaskIdx] : null;
  const nextTask = currentTaskIdx >= 0 && currentTaskIdx + 1 < decoratedTasks.length ? decoratedTasks[currentTaskIdx + 1] : null;

  const currentMonth = currentTask ? monthMap.get(currentTask.monthId) || null : months[0] || null;
  const currentWeek = currentTask && currentTask.weekId ? weekMap.get(currentTask.weekId) || null : weeks[0] || null;

  // Current month progress
  const currentMonthTasks = currentMonth
    ? decoratedTasks.filter((t) => t.monthId === currentMonth.id)
    : [];
  const currentMonthCompleted = currentMonthTasks.filter(
    (t) => t.status === 'COMPLETED' || t.status === 'VERIFIED'
  ).length;
  const currentMonthVerified = currentMonthTasks.filter((t) => t.status === 'VERIFIED').length;
  const currentMonthPercent =
    currentMonthTasks.length > 0
      ? Math.round((currentMonthCompleted / currentMonthTasks.length) * 100)
      : 0;

    return {
      currentMonth,
      currentWeek,
      currentTask,
      nextTask,
      roadmapProgress: {
        totalTasks,
        completedTasksCount,
        verifiedTasksCount,
        inProgressTasksCount,
        percentComplete: roadmapPercent,
      },
      currentMonthProgress: {
        totalTasks: currentMonthTasks.length,
        completedTasksCount: currentMonthCompleted,
        verifiedTasksCount: currentMonthVerified,
        percentComplete: currentMonthPercent,
      },
      completionState: 'IN_PROGRESS',
    };
  } catch (err) {
    console.error('Error fetching current position:', err);
    return {
      currentMonth: null,
      currentWeek: null,
      currentTask: null,
      nextTask: null,
      roadmapProgress: {
        totalTasks: 52,
        completedTasksCount: 0,
        verifiedTasksCount: 0,
        inProgressTasksCount: 0,
        percentComplete: 0,
      },
      currentMonthProgress: {
        totalTasks: 0,
        completedTasksCount: 0,
        verifiedTasksCount: 0,
        percentComplete: 0,
      },
      completionState: 'IN_PROGRESS',
    };
  }
}
