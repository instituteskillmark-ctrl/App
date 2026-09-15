import { db } from '@/db';
import { roadmapMonths, roadmapWeeks, roadmapTasks, taskProgress, assessmentAttempts, projects, projectProgress, studySessions } from '@/db/schema';
import { eq, desc, asc, and, lt } from 'drizzle-orm';
import { calculateStreak } from './streak';

export async function getSmartIntelligence(userId: string = 'default_user') {
  try {
    const allMonths = await db.select().from(roadmapMonths).orderBy(asc(roadmapMonths.monthNumber));
    const allWeeks = await db.select().from(roadmapWeeks).orderBy(asc(roadmapWeeks.weekNumber));
    const allTasks = await db.select().from(roadmapTasks).orderBy(asc(roadmapTasks.orderIndex));
    const allProgress = await db.select().from(taskProgress).where(eq(taskProgress.userId, userId));
    const allAttempts = await db.select().from(assessmentAttempts).where(eq(assessmentAttempts.userId, userId)).orderBy(desc(assessmentAttempts.startedAt));
    const allProjects = await db.select().from(projects).orderBy(asc(projects.projectNumber));
    const allProjectProgress = await db.select().from(projectProgress).where(eq(projectProgress.userId, userId));
    const streakInfo = await calculateStreak(userId);

    const progressMap = new Map(allProgress.map(p => [p.taskId, p]));
    const weekMap = new Map(allWeeks.map(w => [w.id, w.weekNumber]));
    const monthMap = new Map(allMonths.map(m => [m.id, m]));

    // Compute lowest incomplete month (month with at least one topic NOT VERIFIED)
    let computedCurrentMonth = allMonths[0];
    for (const m of allMonths) {
      const mTasks = allTasks.filter(t => t.monthId === m.id);
      const hasUnverified = mTasks.some(t => {
        const p = progressMap.get(t.id);
        return !p || p.status !== 'VERIFIED';
      });
      if (hasUnverified) {
        computedCurrentMonth = m;
        break;
      }
    }
    if (!computedCurrentMonth && allMonths.length > 0) {
      computedCurrentMonth = allMonths[allMonths.length - 1];
    }

    const currentMonthTasks = computedCurrentMonth
      ? allTasks.filter(t => t.monthId === computedCurrentMonth.id)
      : [];

    currentMonthTasks.sort((a, b) => {
      const weekA = a.weekId ? (weekMap.get(a.weekId) ?? 0) : 0;
      const weekB = b.weekId ? (weekMap.get(b.weekId) ?? 0) : 0;
      if (weekA !== weekB) return weekA - weekB;
      return a.orderIndex - b.orderIndex;
    });

    let currentTask = currentMonthTasks.find(t => {
      const p = progressMap.get(t.id);
      return p?.status === 'IN_PROGRESS';
    });

    if (!currentTask) {
      currentTask = currentMonthTasks.find(t => {
        const p = progressMap.get(t.id);
        return !p || p.status === 'NOT_STARTED';
      });
    }

    if (!currentTask && currentMonthTasks.length > 0) {
      currentTask = currentMonthTasks.find(t => {
        const p = progressMap.get(t.id);
        return p?.status !== 'VERIFIED';
      }) || currentMonthTasks[0];
    }

    if (!currentTask && allTasks.length > 0) {
      currentTask = allTasks[0];
    }

    if (!currentTask) {
      return null;
    }

    const currentMonth = monthMap.get(currentTask.monthId) || computedCurrentMonth;

    // Identify corresponding project (1 to 6) based on month
    const relevantProject = allProjects.find(p => p.monthId === (currentTask.monthId || computedCurrentMonth?.id)) || allProjects[0];

    // Weakness Detection Engine
    const confirmedWeaknesses: { taskId: string; title: string; reason: string }[] = [];
    const possibleWeaknesses: { taskId: string; title: string; reason: string }[] = [];

    // Signal 1: Failed assessment attempts (<80%)
    allAttempts.forEach(att => {
      if (!att.passed && att.assessmentId) {
        const task = allTasks.find(t => t.id === att.assessmentId || t.title.toLowerCase().includes('check'));
        if (task && !confirmedWeaknesses.some(w => w.taskId === task.id)) {
          confirmedWeaknesses.push({
            taskId: task.id,
            title: task.title,
            reason: `Assessment attempt failed with ${att.scorePercent}% score (Passing: 80%)`,
          });
        }
      }
    });

    // Signal 2: Completed tasks that have not been verified
    allProgress.forEach(p => {
      if (p.status === 'COMPLETED') {
        const task = allTasks.find(t => t.id === p.taskId);
        if (task && (task.priority === 'MASTER' || task.priority === 'IMPORTANT')) {
          if (!possibleWeaknesses.some(w => w.taskId === task.id)) {
            possibleWeaknesses.push({
              taskId: task.id,
              title: task.title,
              reason: `Task marked COMPLETED but verification assessment has not been passed yet.`,
            });
          }
        }
      }
    });

    // Signal 3: Long gaps in study (stale topics >14 days)
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    allProgress.forEach(p => {
      if (p.status === 'IN_PROGRESS' && p.updatedAt && new Date(p.updatedAt) < fourteenDaysAgo) {
        const task = allTasks.find(t => t.id === p.taskId);
        if (task && !possibleWeaknesses.some(w => w.taskId === task.id)) {
          possibleWeaknesses.push({
            taskId: task.id,
            title: task.title,
            reason: `In progress for over 14 days without recent study activity.`,
          });
        }
      }
    });

    // Determine "What Next?" Recommendation
    let whatNextRecommendation = {
      action: 'CONTINUE_TASK',
      title: `Continue Task: ${currentTask.title}`,
      description: `Work on "${currentTask.title}" (${currentTask.durationLabel}) in Month ${currentMonth?.monthNumber}.`,
      taskId: currentTask.id,
    };

    const currentProgressStatus = progressMap.get(currentTask.id)?.status || 'NOT_STARTED';

    if (currentProgressStatus === 'COMPLETED' && (currentTask.priority === 'MASTER' || currentTask.priority === 'IMPORTANT')) {
      whatNextRecommendation = {
        action: 'TAKE_ASSESSMENT',
        title: `Take Verification Quiz: ${currentTask.title}`,
        description: `Verify your functional mastery to upgrade status from COMPLETED to VERIFIED.`,
        taskId: currentTask.id,
      };
    } else if (confirmedWeaknesses.length > 0) {
      whatNextRecommendation = {
        action: 'REVISE_WEAKNESS',
        title: `Revise Weak Topic: ${confirmedWeaknesses[0].title}`,
        description: confirmedWeaknesses[0].reason,
        taskId: confirmedWeaknesses[0].taskId,
      };
    }

    // Today's Focus (4 practical action steps)
    const todaysFocus = [
      { stage: '1. LEARN', detail: `Study theory & concepts for "${currentTask.title}" (${currentTask.durationLabel || '30-45 min'})` },
      { stage: '2. PRACTICE', detail: `Execute hands-on exercises for ${currentTask.title} in n8n / Node.js` },
      { stage: '3. BUILD', detail: `Apply learning to Project ${relevantProject.projectNumber}: ${relevantProject.title}` },
      { stage: '4. REVIEW', detail: confirmedWeaknesses.length > 0 ? `Review weak area: ${confirmedWeaknesses[0].title}` : `Self-check subtasks for ${currentTask.title}` },
    ];

    return {
      currentTask: {
        ...currentTask,
        monthNumber: currentMonth?.monthNumber || 1,
        monthTitle: currentMonth?.title || '',
      },
      relevantProject,
      todaysFocus,
      whatNext: whatNextRecommendation,
      confirmedWeaknesses,
      possibleWeaknesses,
      revisionsNeeded: [...confirmedWeaknesses, ...possibleWeaknesses],
      streak: streakInfo,
    };
  } catch (err) {
    console.error('Error computing smart intelligence:', err);
    return null;
  }
}

export async function planStudySessionTime(availableMinutes: number, userId: string = 'default_user') {
  const intel = await getSmartIntelligence(userId);
  if (!intel || !intel.currentTask) {
    return {
      availableMinutes,
      blocks: [{ time: `${availableMinutes} mins`, activity: 'Explore Roadmap & Select Task' }],
    };
  }

  const taskTitle = intel.currentTask.title;

  if (availableMinutes <= 30) {
    return {
      availableMinutes: 30,
      blocks: [
        { time: '20 mins', activity: `LEARN — Study core concepts & docs for "${taskTitle}"` },
        { time: '10 mins', activity: `REVIEW — Write personal notes & key takeaways` },
      ],
    };
  } else if (availableMinutes <= 60) {
    return {
      availableMinutes: 60,
      blocks: [
        { time: '25 mins', activity: `LEARN — Study theory & documentation for "${taskTitle}"` },
        { time: '25 mins', activity: `PRACTICE — Build hands-on workflow node / test script` },
        { time: '10 mins', activity: `REVIEW — Self-check subtasks & log session` },
      ],
    };
  } else {
    return {
      availableMinutes: 120,
      blocks: [
        { time: '35 mins', activity: `LEARN — In-depth concept study & API docs for "${taskTitle}"` },
        { time: '40 mins', activity: `PRACTICE — Build & debug workflow/code implementations` },
        { time: '30 mins', activity: `BUILD — Integrate into Project ${intel.relevantProject.projectNumber}: ${intel.relevantProject.title}` },
        { time: '15 mins', activity: `REVIEW & QUIZ — Take verification assessment & write notes` },
      ],
    };
  }
}
