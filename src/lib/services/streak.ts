import { db } from '@/db';
import { studySessions, taskProgress } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function calculateStreak(userId: string = 'default_user') {
  try {
    const sessions = await db
      .select({ createdAt: studySessions.createdAt })
      .from(studySessions)
      .where(eq(studySessions.userId, userId))
      .orderBy(desc(studySessions.createdAt));

    const progress = await db
      .select({ updatedAt: taskProgress.updatedAt, status: taskProgress.status })
      .from(taskProgress)
      .where(eq(taskProgress.userId, userId))
      .orderBy(desc(taskProgress.updatedAt));

    // Collect all active dates (YYYY-MM-DD string)
    const activeDates = new Set<string>();

    sessions.forEach((s) => {
      if (s.createdAt) {
        activeDates.add(new Date(s.createdAt).toISOString().split('T')[0]);
      }
    });

    progress.forEach((p) => {
      if (p.updatedAt && (p.status === 'IN_PROGRESS' || p.status === 'COMPLETED' || p.status === 'VERIFIED')) {
        activeDates.add(new Date(p.updatedAt).toISOString().split('T')[0]);
      }
    });

    if (activeDates.size === 0) {
      return { currentStreak: 0, longestStreak: 0, activeToday: false };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const activeToday = activeDates.has(todayStr);

    // Calculate streak walking backwards from today or yesterday
    let checkDate = new Date();
    let currentStreak = 0;

    // If no activity today, check if yesterday was active or if today is Sunday (rest day)
    let checkStr = checkDate.toISOString().split('T')[0];
    if (!activeDates.has(checkStr)) {
      // If today is Sunday (0), Sunday is a designated rest day and does NOT break the streak
      if (checkDate.getDay() === 0) {
        // Step back to Saturday
        checkDate.setDate(checkDate.getDate() - 1);
        checkStr = checkDate.toISOString().split('T')[0];
      } else {
        // Step back to yesterday
        checkDate.setDate(checkDate.getDate() - 1);
        checkStr = checkDate.toISOString().split('T')[0];
      }
    }

    while (activeDates.has(checkStr) || checkDate.getDay() === 0) {
      if (activeDates.has(checkStr)) {
        currentStreak++;
      }
      // Move to previous day
      checkDate.setDate(checkDate.getDate() - 1);
      checkStr = checkDate.toISOString().split('T')[0];
    }

    return {
      currentStreak,
      longestStreak: Math.max(currentStreak, activeDates.size > 0 ? 1 : 0),
      activeToday,
    };
  } catch (err) {
    console.error('Error calculating streak:', err);
    return { currentStreak: 0, longestStreak: 0, activeToday: false };
  }
}
