import { db } from '@/db';
import { studySessions, taskProgress } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

function toLocalDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function calculateStreak(userId: string = 'default_user') {
  try {
    const sessions = await db
      .select({ createdAt: studySessions.startedAt, status: studySessions.status, duration: studySessions.durationMinutes })
      .from(studySessions)
      .where(and(eq(studySessions.userId, userId), eq(studySessions.status, 'COMPLETED')))
      .orderBy(desc(studySessions.startedAt));

    const progress = await db
      .select({ updatedAt: taskProgress.updatedAt, status: taskProgress.status })
      .from(taskProgress)
      .where(eq(taskProgress.userId, userId))
      .orderBy(desc(taskProgress.updatedAt));

    const activeDates = new Set<string>();

    sessions.forEach((s) => {
      if (s.createdAt && (s.duration || 0) > 0) {
        activeDates.add(toLocalDateString(new Date(s.createdAt)));
      }
    });

    progress.forEach((p) => {
      if (p.updatedAt && (p.status === 'IN_PROGRESS' || p.status === 'COMPLETED' || p.status === 'VERIFIED')) {
        activeDates.add(toLocalDateString(new Date(p.updatedAt)));
      }
    });

    if (activeDates.size === 0) {
      return { currentStreak: 0, longestStreak: 0, activeToday: false };
    }

    const todayStr = toLocalDateString(new Date());
    const activeToday = activeDates.has(todayStr);

    // 1. Calculate Historical Longest Streak
    const sortedDates = Array.from(activeDates)
      .map((dStr) => new Date(dStr + 'T00:00:00'))
      .sort((a, b) => a.getTime() - b.getTime());

    let longestStreak = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    for (const d of sortedDates) {
      if (!prevDate) {
        tempStreak = 1;
      } else {
        const diffMs = d.getTime() - prevDate.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak += 1;
        } else if (diffDays === 2 && prevDate.getDay() === 6 && d.getDay() === 1) {
          // Sunday was skipped as rest day between Saturday and Monday
          tempStreak += 1;
        } else if (diffDays === 0) {
          // same day
        } else {
          tempStreak = 1;
        }
      }
      prevDate = d;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    }

    // 2. Calculate Current Streak
    const checkDate = new Date();
    let currentStreak = 0;
    let checkStr = toLocalDateString(checkDate);

    // If today has no activity, check yesterday (or Sunday rest day)
    if (!activeDates.has(checkStr)) {
      if (checkDate.getDay() === 0) {
        // Step back to Saturday
        checkDate.setDate(checkDate.getDate() - 1);
        checkStr = toLocalDateString(checkDate);
      } else {
        // Step back to yesterday
        checkDate.setDate(checkDate.getDate() - 1);
        checkStr = toLocalDateString(checkDate);
      }
    }

    while (activeDates.has(checkStr) || checkDate.getDay() === 0) {
      if (activeDates.has(checkStr)) {
        currentStreak++;
      }
      checkDate.setDate(checkDate.getDate() - 1);
      checkStr = toLocalDateString(checkDate);
    }

    return {
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      activeToday,
    };
  } catch (err) {
    console.error('Error calculating streak:', err);
    return { currentStreak: 0, longestStreak: 0, activeToday: false };
  }
}
