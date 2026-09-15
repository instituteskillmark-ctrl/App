import { db } from '@/db';
import { skills, roadmapTasks, taskProgress, roadmapMonths } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function getSkillsOverview(userId: string = 'default_user') {
  try {
    const allSkills = await db.select().from(skills).orderBy(asc(skills.orderIndex));
    const allTasks = await db.select().from(roadmapTasks);
    const allProgress = await db.select().from(taskProgress).where(eq(taskProgress.userId, userId));
    const months = await db.select().from(roadmapMonths);

    const progressMap = new Map(allProgress.map(p => [p.taskId, p]));
    const monthMap = new Map(months.map(m => [m.id, m]));

    // Map tasks to skills based on Category matching
    return allSkills.map((sk) => {
      // Find tasks related to this skill category
      let categoryTasks: typeof allTasks = [];

      if (sk.category === 'Automation & n8n') {
        categoryTasks = allTasks.filter(t => {
          const m = monthMap.get(t.monthId);
          return m?.monthNumber === 1 || t.title.toLowerCase().includes('n8n');
        });
      } else if (sk.category === 'APIs & Security') {
        categoryTasks = allTasks.filter(t => {
          const m = monthMap.get(t.monthId);
          return m?.monthNumber === 2 || t.title.toLowerCase().includes('api');
        });
      } else if (sk.category === 'Databases & Data') {
        categoryTasks = allTasks.filter(t => {
          const m = monthMap.get(t.monthId);
          return m?.monthNumber === 3 || t.title.toLowerCase().includes('database') || t.title.toLowerCase().includes('schema');
        });
      } else if (sk.category === 'JavaScript') {
        categoryTasks = allTasks.filter(t => {
          const m = monthMap.get(t.monthId);
          return m?.monthNumber === 4 || t.title.toLowerCase().includes('js');
        });
      } else if (sk.category === 'AI & RAG') {
        categoryTasks = allTasks.filter(t => {
          const m = monthMap.get(t.monthId);
          return m?.monthNumber === 5 || t.title.toLowerCase().includes('ai') || t.title.toLowerCase().includes('rag');
        });
      } else if (sk.category === 'Testing & DevOps') {
        categoryTasks = allTasks.filter(t => {
          const m = monthMap.get(t.monthId);
          return m?.monthNumber === 6 || t.title.toLowerCase().includes('testing') || t.title.toLowerCase().includes('deployment');
        });
      }

      const totalCount = categoryTasks.length || 1;
      let completedCount = 0;
      let verifiedCount = 0;

      categoryTasks.forEach((t) => {
        const p = progressMap.get(t.id);
        if (p?.status === 'COMPLETED' || p?.status === 'VERIFIED') completedCount++;
        if (p?.status === 'VERIFIED') verifiedCount++;
      });

      const proficiencyPercent = Math.round((completedCount / totalCount) * 100);

      return {
        ...sk,
        totalTasks: categoryTasks.length,
        completedTasks: completedCount,
        verifiedTasks: verifiedCount,
        proficiencyPercent,
      };
    });
  } catch (err) {
    console.error('Error fetching skills overview:', err);
    return [];
  }
}
