import { db } from '@/db';
import {
  roadmapMonths,
  roadmapWeeks,
  roadmapTasks,
  taskProgress,
  studySessions,
  assessmentAttempts,
  notes,
} from '@/db/schema';
import { eq, asc, desc, and, inArray } from 'drizzle-orm';
import { calculateStreak } from './streak';
import { getCurrentPosition } from './position';
import { getSkillsOverview } from './skills';

function toLocalDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface MonthlyProgressItem {
  id: string;
  monthNumber: number;
  title: string;
  subtitle: string | null;
  durationWeeks: string;
  keyOutput: string;
  totalTasks: number;
  completedTasks: number;
  verifiedTasks: number;
  needsRevisionTasks: number;
  remainingTasks: number;
  percentComplete: number;
}

export interface WeeklyProgressItem {
  id: string;
  monthId: string;
  monthNumber: number;
  weekNumber: number;
  title: string;
  totalTasks: number;
  completedTasks: number;
  verifiedTasks: number;
  remainingTasks: number;
  percentComplete: number;
  isCurrentWeek: boolean;
}

export interface TaskStudyTimeItem {
  taskId: string;
  taskTitle: string;
  monthNumber: number;
  weekNumber: number;
  durationMinutes: number;
  formattedTime: string;
  status: string;
}

export interface ActivityFeedItem {
  id: string;
  title: string;
  detail: string;
  timestamp: Date;
  type: 'TASK' | 'TIMER' | 'ASSESSMENT';
}

export async function getComprehensiveProgress(targetUserId?: string) {
  try {
    const userId = targetUserId || 'default_user';

    // 1. Fetch all core database entities
    const months = await db.select().from(roadmapMonths).orderBy(asc(roadmapMonths.monthNumber));
    const weeks = await db.select().from(roadmapWeeks).orderBy(asc(roadmapWeeks.weekNumber));
    const tasks = await db.select().from(roadmapTasks).orderBy(asc(roadmapTasks.orderIndex));
    const progressList = await db
      .select()
      .from(taskProgress)
      .where(eq(taskProgress.userId, userId));
    const sessions = await db
      .select()
      .from(studySessions)
      .where(and(eq(studySessions.userId, userId), eq(studySessions.status, 'COMPLETED')));
    const attempts = await db
      .select()
      .from(assessmentAttempts)
      .where(eq(assessmentAttempts.userId, userId));

    const position = await getCurrentPosition(userId);
    const streak = await calculateStreak(userId);
    const skillsList = await getSkillsOverview(userId);

    const progressMap = new Map(progressList.map((p) => [p.taskId, p]));
    const monthMap = new Map(months.map((m) => [m.id, m]));
    const weekMap = new Map(weeks.map((w) => [w.id, w]));

    // 2. Calculate Overall Progress
    const totalTasks = tasks.length; // 52
    const completedTasksCount = progressList.filter(
      (p) => p.status === 'COMPLETED' || p.status === 'VERIFIED'
    ).length;
    const verifiedTasksCount = progressList.filter((p) => p.status === 'VERIFIED').length;
    const unverifiedCompletedCount = progressList.filter((p) => p.status === 'COMPLETED').length;
    const inProgressTasksCount = progressList.filter((p) => p.status === 'IN_PROGRESS').length;
    const needsRevisionTasksCount = progressList.filter((p) => p.status === 'NEEDS_REVISION').length;
    const remainingTasksCount = Math.max(0, totalTasks - completedTasksCount);
    const overallProgressPercent =
      totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

    // 3. Calculate Monthly Progress
    const monthlyProgress: MonthlyProgressItem[] = months.map((m) => {
      const monthTasks = tasks.filter((t) => t.monthId === m.id);
      const completed = monthTasks.filter((t) => {
        const p = progressMap.get(t.id);
        return p?.status === 'COMPLETED' || p?.status === 'VERIFIED';
      }).length;
      const verified = monthTasks.filter((t) => {
        const p = progressMap.get(t.id);
        return p?.status === 'VERIFIED';
      }).length;
      const needsRevision = monthTasks.filter((t) => {
        const p = progressMap.get(t.id);
        return p?.status === 'NEEDS_REVISION';
      }).length;

      return {
        id: m.id,
        monthNumber: m.monthNumber,
        title: m.title,
        subtitle: m.subtitle,
        durationWeeks: m.durationWeeks,
        keyOutput: m.keyOutput,
        totalTasks: monthTasks.length,
        completedTasks: completed,
        verifiedTasks: verified,
        needsRevisionTasks: needsRevision,
        remainingTasks: Math.max(0, monthTasks.length - completed),
        percentComplete:
          monthTasks.length > 0 ? Math.round((completed / monthTasks.length) * 100) : 0,
      };
    });

    // 4. Calculate Weekly Progress
    const weeklyProgress: WeeklyProgressItem[] = weeks.map((w) => {
      const weekTasks = tasks.filter((t) => t.weekId === w.id);
      const m = monthMap.get(w.monthId);
      const completed = weekTasks.filter((t) => {
        const p = progressMap.get(t.id);
        return p?.status === 'COMPLETED' || p?.status === 'VERIFIED';
      }).length;
      const verified = weekTasks.filter((t) => {
        const p = progressMap.get(t.id);
        return p?.status === 'VERIFIED';
      }).length;

      const isCurrentWeek = position.currentWeek?.id === w.id;

      return {
        id: w.id,
        monthId: w.monthId,
        monthNumber: m?.monthNumber ?? 1,
        weekNumber: w.weekNumber,
        title: w.title,
        totalTasks: weekTasks.length,
        completedTasks: completed,
        verifiedTasks: verified,
        remainingTasks: Math.max(0, weekTasks.length - completed),
        percentComplete:
          weekTasks.length > 0 ? Math.round((completed / weekTasks.length) * 100) : 0,
        isCurrentWeek,
      };
    });

    // 5. Calculate Study Time Analytics
    const totalStudyTimeMinutes = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    const totalStudyHours = Math.round((totalStudyTimeMinutes / 60) * 10) / 10;

    const todayDate = new Date();
    const todayStr = toLocalDateString(todayDate);

    const todaySessions = sessions.filter((s) => {
      if (!s.startedAt) return false;
      return toLocalDateString(new Date(s.startedAt)) === todayStr;
    });
    const todayStudyTimeMinutes = todaySessions.reduce(
      (sum, s) => sum + (s.durationMinutes || 0),
      0
    );

    // Current Calendar Week Calculation (Monday to Sunday)
    const currentDay = todayDate.getDay();
    const diffToMonday = (currentDay === 0 ? -6 : 1) - currentDay;
    const mondayDate = new Date(todayDate);
    mondayDate.setDate(todayDate.getDate() + diffToMonday);
    mondayDate.setHours(0, 0, 0, 0);

    const thisWeekSessions = sessions.filter((s) => {
      if (!s.startedAt) return false;
      return new Date(s.startedAt).getTime() >= mondayDate.getTime();
    });
    const thisWeekStudyTimeMinutes = thisWeekSessions.reduce(
      (sum, s) => sum + (s.durationMinutes || 0),
      0
    );

    // Task-specific Study Time breakdown
    const taskStudyMap = new Map<string, number>();
    sessions.forEach((s) => {
      if (s.taskId) {
        const prev = taskStudyMap.get(s.taskId) || 0;
        taskStudyMap.set(s.taskId, prev + (s.durationMinutes || 0));
      }
    });

    const taskStudyTimes: TaskStudyTimeItem[] = [];
    taskStudyMap.forEach((mins, tId) => {
      const t = tasks.find((task) => task.id === tId);
      if (t) {
        const m = monthMap.get(t.monthId);
        const w = t.weekId ? weekMap.get(t.weekId) : null;
        const p = progressMap.get(t.id);
        const hrs = Math.floor(mins / 60);
        const remainingMins = mins % 60;
        const formattedTime = hrs > 0 ? `${hrs}h ${remainingMins}m` : `${mins}m`;

        taskStudyTimes.push({
          taskId: t.id,
          taskTitle: t.title,
          monthNumber: m?.monthNumber ?? 1,
          weekNumber: w?.weekNumber ?? 1,
          durationMinutes: mins,
          formattedTime,
          status: p?.status || 'NOT_STARTED',
        });
      }
    });
    taskStudyTimes.sort((a, b) => b.durationMinutes - a.durationMinutes);

    // 6. Assessment & Verification Insights
    const totalAssessmentAttempts = attempts.length;
    const passedAttempts = attempts.filter((a) => a.passed).length;
    const failedAttempts = attempts.filter((a) => !a.passed).length;
    const passRatePercent =
      totalAssessmentAttempts > 0
        ? Math.round((passedAttempts / totalAssessmentAttempts) * 100)
        : 0;

    // 7. Recent Activity Feed
    const activityFeed: ActivityFeedItem[] = [];

    progressList.forEach((p) => {
      if (p.updatedAt) {
        const t = tasks.find((task) => task.id === p.taskId);
        if (t) {
          activityFeed.push({
            id: `progress-${p.id}`,
            title: t.title,
            detail: `Status updated to ${p.status.replace('_', ' ')}`,
            timestamp: new Date(p.updatedAt),
            type: 'TASK',
          });
        }
      }
    });

    sessions.forEach((s) => {
      if (s.endedAt) {
        const t = s.taskId ? tasks.find((task) => task.id === s.taskId) : null;
        activityFeed.push({
          id: `session-${s.id}`,
          title: t?.title || 'General Automation Study',
          detail: `Completed ${s.durationMinutes} min study session (${s.sessionType || 'LEARN'})`,
          timestamp: new Date(s.endedAt),
          type: 'TIMER',
        });
      }
    });

    attempts.forEach((a) => {
      if (a.completedAt) {
        activityFeed.push({
          id: `attempt-${a.id}`,
          title: 'Skill Verification Quiz',
          detail: `${a.passed ? 'Passed' : 'Failed'} with ${a.scorePercent}% score`,
          timestamp: new Date(a.completedAt),
          type: 'ASSESSMENT',
        });
      }
    });

    activityFeed.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    const recentActivities = activityFeed.slice(0, 10);

    return {
      overall: {
        totalTasks,
        completedTasksCount,
        verifiedTasksCount,
        unverifiedCompletedCount,
        inProgressTasksCount,
        needsRevisionTasksCount,
        remainingTasksCount,
        overallProgressPercent,
        isRoadmapComplete: completedTasksCount === totalTasks && totalTasks > 0,
      },
      monthlyProgress,
      weeklyProgress,
      studyTime: {
        totalStudyTimeMinutes,
        totalStudyHours,
        todayStudyTimeMinutes,
        thisWeekStudyTimeMinutes,
        taskStudyTimes,
      },
      streak,
      assessments: {
        totalAssessmentAttempts,
        passedAttempts,
        failedAttempts,
        passRatePercent,
      },
      skills: skillsList,
      currentPosition: position,
      recentActivities,
    };
  } catch (err) {
    console.error('Error fetching comprehensive progress:', err);
    return null;
  }
}
