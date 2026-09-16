'use server';

import { revalidatePath } from 'next/cache';
import {
  updateTaskStatus,
  updateTaskStage,
  toggleSubtaskProgress,
  TaskStage,
  TopicStatus,
} from '@/lib/services/roadmap';
import { updateProjectProgress } from '@/lib/services/projects';
import { createNote, deleteNote } from '@/lib/services/notes';
import {
  logStudySession,
  startStudySession,
  pauseStudySession,
  resumeStudySession,
  finishStudySession,
  getActiveStudySession,
  getTaskStudyTime,
  getRecentStudySessions,
} from '@/lib/services/timer';
import { submitAssessmentAttempt } from '@/lib/services/assessments';
import { getAuthUserId } from '@/lib/supabase/server';

export async function actionUpdateTaskStatus(taskId: string, status: TopicStatus) {
  const userId = await getAuthUserId();
  const res = await updateTaskStatus(taskId, status, userId);
  revalidatePath('/roadmap');
  revalidatePath(`/roadmap/task/${taskId}`);
  revalidatePath('/today');
  revalidatePath('/dashboard');
  revalidatePath('/progress');
  return res;
}

export async function actionUpdateTaskStage(taskId: string, stage: TaskStage) {
  const userId = await getAuthUserId();
  const res = await updateTaskStage(taskId, stage, userId);
  revalidatePath('/roadmap');
  revalidatePath(`/roadmap/task/${taskId}`);
  revalidatePath('/today');
  revalidatePath('/dashboard');
  revalidatePath('/progress');
  return res;
}

export async function actionToggleSubtask(subtaskId: string, taskId: string, isCompleted: boolean) {
  const userId = await getAuthUserId();
  const res = await toggleSubtaskProgress(subtaskId, isCompleted, userId);
  revalidatePath(`/roadmap/task/${taskId}`);
  revalidatePath('/roadmap');
  revalidatePath('/dashboard');
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
  const userId = await getAuthUserId();
  const res = await updateProjectProgress(projectId, data, userId);
  revalidatePath('/projects');
  revalidatePath('/dashboard');
  revalidatePath('/progress');
  return res;
}

export async function actionStartStudySession(data: {
  taskId?: string;
  projectId?: string;
  sessionType?: string;
}) {
  const userId = await getAuthUserId();
  const res = await startStudySession(data, userId);
  if (data.taskId) {
    revalidatePath(`/roadmap/task/${data.taskId}`);
  }
  revalidatePath('/dashboard');
  revalidatePath('/today');
  revalidatePath('/progress');
  return res;
}

export async function actionPauseStudySession(sessionId: string, taskId?: string) {
  const userId = await getAuthUserId();
  const res = await pauseStudySession(sessionId, userId);
  if (taskId) {
    revalidatePath(`/roadmap/task/${taskId}`);
  }
  revalidatePath('/dashboard');
  return res;
}

export async function actionResumeStudySession(sessionId: string, taskId?: string) {
  const userId = await getAuthUserId();
  const res = await resumeStudySession(sessionId, userId);
  if (taskId) {
    revalidatePath(`/roadmap/task/${taskId}`);
  }
  revalidatePath('/dashboard');
  return res;
}

export async function actionFinishStudySession(data: {
  sessionId: string;
  notes?: string;
  sessionType?: string;
  taskId?: string;
}) {
  const userId = await getAuthUserId();
  const res = await finishStudySession(data, userId);
  if (data.taskId) {
    revalidatePath(`/roadmap/task/${data.taskId}`);
  }
  revalidatePath('/dashboard');
  revalidatePath('/today');
  revalidatePath('/progress');
  return res;
}

export async function actionGetActiveStudySession(taskId?: string) {
  const userId = await getAuthUserId();
  return await getActiveStudySession(userId, taskId);
}

export async function actionGetTaskStudyTime(taskId: string) {
  const userId = await getAuthUserId();
  return await getTaskStudyTime(taskId, userId);
}

export async function actionGetRecentStudySessions(limit?: number) {
  const userId = await getAuthUserId();
  return await getRecentStudySessions(userId, limit);
}

export async function actionLogStudySession(data: {
  taskId?: string;
  projectId?: string;
  durationMinutes: number;
  sessionType?: string;
  notes?: string;
}) {
  const userId = await getAuthUserId();
  const res = await logStudySession(data, userId);
  if (data.taskId) {
    revalidatePath(`/roadmap/task/${data.taskId}`);
  }
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
  const userId = await getAuthUserId();
  const res = await submitAssessmentAttempt({ ...data, userId });
  revalidatePath('/roadmap');
  revalidatePath(`/roadmap/task/${data.taskId}`);
  revalidatePath('/today');
  revalidatePath('/dashboard');
  revalidatePath('/progress');
  return res;
}

export async function actionCreateNote(
  title: string,
  content: string,
  tags?: string,
  taskId?: string,
  projectId?: string
) {
  const userId = await getAuthUserId();
  const res = await createNote(title, content, tags, taskId, projectId, userId);
  revalidatePath('/notes');
  if (taskId) {
    revalidatePath(`/roadmap/task/${taskId}`);
  }
  return res;
}

export async function actionDeleteNote(id: string) {
  const userId = await getAuthUserId();
  const res = await deleteNote(id, userId);
  revalidatePath('/notes');
  return res;
}
