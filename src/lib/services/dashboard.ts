import { db } from '@/db';
import { roadmapMonths, roadmapTasks, taskProgress, projects, projectProgress, studySessions, notes } from '@/db/schema';
import { calculateStreak } from './streak';
import { desc, eq } from 'drizzle-orm';

export async function getDashboardStats(userId: string = 'default_user') {
  try {
    const allMonths = await db.select().from(roadmapMonths);
    const allTasks = await db.select().from(roadmapTasks);
    const allTaskProgress = await db.select().from(taskProgress).where(eq(taskProgress.userId, userId));
    const allProjects = await db.select().from(projects);
    const allProjectProgress = await db.select().from(projectProgress).where(eq(projectProgress.userId, userId));
    const allSessions = await db.select().from(studySessions).where(eq(studySessions.userId, userId));
    const allNotes = await db.select().from(notes).where(eq(notes.userId, userId)).orderBy(desc(notes.updatedAt));

    const streakInfo = await calculateStreak(userId);

    const completedTasks = allTaskProgress.filter(t => t.status === 'COMPLETED' || t.status === 'VERIFIED');
    const verifiedTasks = allTaskProgress.filter(t => t.status === 'VERIFIED');
    const completedProjects = allProjectProgress.filter(p => p.status === 'COMPLETED');

    const totalMinutes = allSessions.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

    // Find active or next task
    let activeProgress = allTaskProgress.find(t => t.status === 'IN_PROGRESS');
    let currentTask = null;

    if (activeProgress) {
      currentTask = allTasks.find(t => t.id === activeProgress.taskId) || null;
    }

    // If no task is marked IN_PROGRESS, pick the first NOT_STARTED task in order
    if (!currentTask && allTasks.length > 0) {
      const completedIds = new Set(completedTasks.map(t => t.taskId));
      const nextTask = allTasks.find(t => !completedIds.has(t.id));
      if (nextTask) {
        currentTask = nextTask;
      } else {
        currentTask = allTasks[0];
      }
    }

    let currentMonthName = 'Month 1';
    let currentWeekNumber = 1;

    if (currentTask) {
      const m = allMonths.find(m => m.id === currentTask.monthId);
      if (m) {
        currentMonthName = `Month ${m.monthNumber}: ${m.title}`;
        currentWeekNumber = m.monthNumber * 4; // approximate current week
      }
    }

    // Recent Activity feed
    const recentActivity: { title: string; time: string; type: string }[] = [];

    allTaskProgress.slice(0, 3).forEach(p => {
      const t = allTasks.find(task => task.id === p.taskId);
      if (t) {
        recentActivity.push({
          title: `Task Status: ${t.title} → ${p.status}`,
          time: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : 'Recently',
          type: 'TASK',
        });
      }
    });

    allSessions.slice(0, 3).forEach(s => {
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
      currentTask,
      currentMonthName,
      currentWeekNumber,
      streak: streakInfo,
      recentActivity,
      notesCount: allNotes.length,
      overallProgressPercent: allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0,
    };
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    return {
      totalMonths: 6,
      totalTasks: 35,
      completedTasksCount: 0,
      verifiedTasksCount: 0,
      totalProjects: 6,
      completedProjectsCount: 0,
      totalHoursInvested: 0,
      currentTask: null,
      currentMonthName: 'Month 1',
      currentWeekNumber: 1,
      streak: { currentStreak: 0, longestStreak: 0, activeToday: false },
      recentActivity: [],
      notesCount: 0,
      overallProgressPercent: 0,
    };
  }
}
