import React from 'react';
import { Header } from '@/components/Header';
import { db } from '@/db';
import { roadmapTasks, roadmapMonths, roadmapWeeks, subtasks, taskProgress, notes } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { TaskDetailView } from '@/components/TaskDetailView';
import { getAssessmentForTask } from '@/lib/services/assessments';
import { getUserSubtaskProgress, getNextTaskFor } from '@/lib/services/roadmap';
import { getAuthUserId } from '@/lib/supabase/server';
import Link from 'next/link';

export const revalidate = 0;

interface TaskPageProps {
  params: Promise<{ taskId: string }>;
}

export default async function TaskDetailPage({ params }: TaskPageProps) {
  const resolvedParams = await params;
  const taskId = resolvedParams.taskId;
  const userId = await getAuthUserId();

  const [task] = await db.select().from(roadmapTasks).where(eq(roadmapTasks.id, taskId));
  if (!task) return notFound();

  const [month] = await db.select().from(roadmapMonths).where(eq(roadmapMonths.id, task.monthId));
  const [week] = task.weekId
    ? await db.select().from(roadmapWeeks).where(eq(roadmapWeeks.id, task.weekId))
    : [null];

  const subtaskItems = await db
    .select()
    .from(subtasks)
    .where(eq(subtasks.taskId, task.id));

  const subtaskProgressMap = await getUserSubtaskProgress(task.id, userId);

  const [progress] = await db
    .select()
    .from(taskProgress)
    .where(and(eq(taskProgress.taskId, task.id), eq(taskProgress.userId, userId)));

  const taskNotes = await db
    .select()
    .from(notes)
    .where(and(eq(notes.taskId, task.id), eq(notes.userId, userId)));

  const assessmentData = await getAssessmentForTask(task.id);
  const nextTaskData = await getNextTaskFor(task.id);

  const formattedTask = {
    ...task,
    monthNumber: month?.monthNumber ?? 1,
    monthTitle: month?.title ?? 'Roadmap Topic',
    weekNumber: week?.weekNumber ?? 1,
    weekTitle: week?.title ?? 'General Topic',
    subtasks: subtaskItems,
    subtaskProgressMap,
    progress: progress || {
      status: 'NOT_STARTED' as const,
      currentStage: 'LEARN' as const,
    },
    assessment: assessmentData,
    notes: taskNotes,
    nextTask: nextTaskData,
  };

  return (
    <div className="flex-1 pb-12">
      <Header
        title={task.title}
        subtitle={`Month ${formattedTask.monthNumber} • Week ${formattedTask.weekNumber}: ${formattedTask.weekTitle}`}
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <Link href="/roadmap" className="text-xs text-slate-400 hover:text-slate-200 font-mono inline-block">
          ← Back to Complete Roadmap
        </Link>

        <TaskDetailView task={formattedTask as any} />
      </div>
    </div>
  );
}
