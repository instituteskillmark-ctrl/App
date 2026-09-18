import { db } from '@/db';
import {
  roadmapMonths,
  roadmapWeeks,
  roadmapTasks,
  taskProgress,
  projects,
  projectProgress,
  studySessions,
  notes,
} from '@/db/schema';
import { calculateStreak } from './streak';
import { getCurrentPosition } from './position';
import { desc, eq } from 'drizzle-orm';

export async function getDashboardStats(userId: string = 'default_user') {
  try {
    const allMonths = await db.select().from(roadmapMonths);
    const allWeeks = await db.select().from(roadmapWeeks);
    const allTasks = await db.select().from(roadmapTasks);
    const allTaskProgress = await db
      .select()
      .from(taskProgress)
      .where(eq(taskProgress.userId, userId));
    const allProjects = await db.select().from(projects);
    const allProjectProgress = await db
      .select()
      .from(projectProgress)
      .where(eq(projectProgress.userId, userId));
    const allSessions = await db
      .select()
      .from(studySessions)
      .where(eq(studySessions.userId, userId));
    const allNotes = await db
      .select()
      .from(notes)
      .where(eq(notes.userId, userId))
      .orderBy(desc(notes.updatedAt));

    const streakInfo = await calculateStreak(userId);
    const position = await getCurrentPosition(userId);

    const completedTasks = allTaskProgress.filter(
      (t) => t.status === 'COMPLETED' || t.status === 'VERIFIED'
    );
    const verifiedTasks = allTaskProgress.filter((t) => t.status === 'VERIFIED');
    const completedProjects = allProjectProgress.filter((p) => p.status === 'COMPLETED');

    const completedSessions = allSessions.filter((s) => s.status === 'COMPLETED');
    const totalMinutes = completedSessions.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

    const todayDate = new Date();
    const todayStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;

    const todaySessions = completedSessions.filter((s) => {
      if (!s.startedAt) return false;
      const d = new Date(s.startedAt);
      const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return dStr === todayStr;
    });

    const todayMinutes = todaySessions.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
    const todayHours = Math.round((todayMinutes / 60) * 10) / 10;

    // Use single source of truth from shared position service
    const currentTask = position.currentTask
      ? allTasks.find((t) => t.id === position.currentTask!.id) || null
      : null;

    const currentMonthName = position.currentMonth
      ? `Month ${position.currentMonth.monthNumber}: ${position.currentMonth.title}`
      : 'Month 1';

    const currentWeekNumber = position.currentWeek
      ? position.currentWeek.weekNumber
      : 1;

    const currentMonthInfo = position.currentMonth
      ? {
          id: position.currentMonth.id,
          monthNumber: position.currentMonth.monthNumber,
          title: position.currentMonth.title,
          subtitle: position.currentMonth.subtitle,
          keyOutput: position.currentMonth.keyOutput,
          durationWeeks: position.currentMonth.durationWeeks,
          totalTasks: position.currentMonthProgress.totalTasks,
          completedTasks: position.currentMonthProgress.completedTasksCount,
          verifiedTasks: position.currentMonthProgress.verifiedTasksCount,
          percentComplete: position.currentMonthProgress.percentComplete,
        }
      : null;

    // Recent Activity feed
    const recentActivity: { title: string; time: string; type: string }[] = [];

    allTaskProgress.slice(0, 3).forEach((p) => {
      const t = allTasks.find((task) => task.id === p.taskId);
      if (t) {
        recentActivity.push({
          title: `Task Status: ${t.title} → ${p.status}`,
          time: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : 'Recently',
          type: 'TASK',
        });
      }
    });

    allSessions.slice(0, 3).forEach((s) => {
      recentActivity.push({
        title: `Logged Study Session: ${s.durationMinutes} mins (${s.sessionType || 'LEARN'})`,
        time: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'Recently',
        type: 'TIMER',
      });
    });

    return {
      totalMonths: allMonths.length,
      totalTasks: allTasks.length,
      completedTasksCount: completedTasks.length,
      verifiedTasksCount: verifiedTasks.length,
      totalProjects: allProjects.length,
      completedProjectsCount: completedProjects.length,
      totalHoursInvested: totalHours,
      todayMinutes,
      todayHours,
      currentTask,
      currentMonthName,
      currentWeekNumber,
      currentMonthInfo,
      streak: streakInfo,
      recentActivity,
      notesCount: allNotes.length,
      overallProgressPercent:
        allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0,
    };
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    // Error fallback — DB unavailable. Use 0 for counts so no false data is shown.
    return {
      totalMonths: 0,
      totalTasks: 0,
      completedTasksCount: 0,
      verifiedTasksCount: 0,
      totalProjects: 0,
      completedProjectsCount: 0,
      totalHoursInvested: 0,
      todayMinutes: 0,
      todayHours: 0,
      currentTask: null,
      currentMonthName: 'Month 1',
      currentWeekNumber: 1,
      currentMonthInfo: null,
      streak: { currentStreak: 0, longestStreak: 0, activeToday: false },
      recentActivity: [],
      notesCount: 0,
      overallProgressPercent: 0,
    };
  }
}
