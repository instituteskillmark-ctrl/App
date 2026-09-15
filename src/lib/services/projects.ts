import { db } from '@/db';
import { projects, projectTasks, projectProgress } from '@/db/schema';
import { eq, asc, and } from 'drizzle-orm';

export async function getAllProjects(userId: string = 'default_user') {
  try {
    const projectList = await db.select().from(projects).orderBy(asc(projects.projectNumber));
    const progressList = await db.select().from(projectProgress).where(eq(projectProgress.userId, userId));

    const progressMap = new Map(progressList.map(p => [p.projectId, p]));

    return projectList.map(p => ({
      ...p,
      progress: progressMap.get(p.id) || {
        status: 'NOT_STARTED' as const,
        currentStage: 'PLANNING' as const,
        repoUrl: null,
        demoUrl: null,
        notes: null,
      },
    }));
  } catch (err) {
    console.error('Error fetching projects:', err);
    return [];
  }
}

export async function updateProjectProgress(
  projectId: string,
  data: {
    status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    currentStage?: 'PLANNING' | 'BUILD' | 'TESTING' | 'DEPLOYMENT' | 'DOCUMENTATION' | 'COMPLETE';
    repoUrl?: string;
    demoUrl?: string;
    notes?: string;
  },
  userId: string = 'default_user'
) {
  try {
    const existing = await db.select().from(projectProgress).where(
      and(eq(projectProgress.projectId, projectId), eq(projectProgress.userId, userId))
    );

    const now = new Date();
    const updatePayload: any = { ...data, updatedAt: now };

    if (data.status === 'IN_PROGRESS' && (!existing[0] || !existing[0].startedAt)) {
      updatePayload.startedAt = now;
    }
    if (data.status === 'COMPLETED' && (!existing[0] || !existing[0].completedAt)) {
      updatePayload.completedAt = now;
    }

    if (existing.length > 0) {
      await db.update(projectProgress)
        .set(updatePayload)
        .where(eq(projectProgress.id, existing[0].id));
    } else {
      await db.insert(projectProgress).values({
        projectId,
        userId,
        ...updatePayload,
      });
    }

    return { success: true };
  } catch (err) {
    console.error('Error updating project progress:', err);
    return { success: false, error: String(err) };
  }
}
