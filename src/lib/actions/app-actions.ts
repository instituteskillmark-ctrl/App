'use server';

import { revalidatePath } from 'next/cache';
import { updateTaskStatus } from '@/lib/services/roadmap';
import { updateProjectProgress } from '@/lib/services/projects';
import { createNote, deleteNote } from '@/lib/services/notes';
import { logStudySession } from '@/lib/services/timer';
import { submitAssessmentAttempt } from '@/lib/services/assessments';

export async function actionUpdateTaskStatus(taskId: string, status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED') {
  const res = await updateTaskStatus(taskId, status);
  revalidatePath('/roadmap');
  revalidatePath('/today');
  revalidatePath('/dashboard');
  revalidatePath('/progress');
  return res;
}

export async function actionUpdateProjectProgress(
  projectId: string,
  data: {
    status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    currentStage?: 'PLANNING' | 'BUILD' | 'TESTING' | 'DEPLOYMENT' | 'DOCUMENTATION' | 'COMPLETE';
    repoUrl?: string;
    demoUrl?: string;
    notes?: string;
  }
) {
  const res = await updateProjectProgress(projectId, data);
  revalidatePath('/projects');
  revalidatePath('/dashboard');
  revalidatePath('/progress');
  return res;
}

export async function actionLogStudySession(data: {
  taskId?: string;
  projectId?: string;
  durationMinutes: number;
  sessionType?: string;
  notes?: string;
}) {
  const res = await logStudySession(data);
  revalidatePath('/dashboard');
  revalidatePath('/today');
  revalidatePath('/progress');
  return res;
}

export async function actionSubmitAssessment(data: {
  assessmentId: string;
  taskId: string;
  userAnswers: number[];
}) {
  const res = await submitAssessmentAttempt(data);
  revalidatePath('/roadmap');
  revalidatePath('/today');
  revalidatePath('/dashboard');
  revalidatePath('/progress');
  return res;
}

export async function actionCreateNote(title: string, content: string, tags?: string, taskId?: string, projectId?: string) {
  const res = await createNote(title, content, tags, taskId, projectId);
  revalidatePath('/notes');
  return res;
}

export async function actionDeleteNote(id: string) {
  const res = await deleteNote(id);
  revalidatePath('/notes');
  return res;
}
