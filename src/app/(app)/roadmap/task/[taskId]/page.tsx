import React from 'react';
import { Header } from '@/components/Header';
import { db } from '@/db';
import { roadmapTasks, roadmapMonths, roadmapWeeks, subtasks, taskProgress, notes } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { TaskDetailView } from '@/components/TaskDetailView';
import { getAssessmentForTask } from '@/lib/services/assessments';
import Link from 'next/link';

export const revalidate = 0;

interface TaskPageProps {
  params: Promise<{ taskId: string }>;
}

export default async function TaskDetailPage({ params }: TaskPageProps) {
  const resolvedParams = await params;
  const taskId = resolvedParams.taskId;

  const [task] = await db.select().from(roadmapTasks).where(eq(roadmapTasks.id, taskId));
  if (!task) return notFound();

  const [month] = await db.select().from(roadmapMonths).where(eq(roadmapMonths.id, task.monthId));
  const subtaskItems = await db.select().from(subtasks).where(eq(subtasks.taskId, task.id));
  const [progress] = await db.select().from(taskProgress).where(eq(taskProgress.taskId, task.id));
  const taskNotes = await db.select().from(notes).where(eq(notes.taskId, task.id));
  const assessmentData = await getAssessmentForTask(task.id);

  const formattedTask = {
    ...task,
    monthName: month ? `Month ${month.monthNumber}: ${month.title}` : 'Roadmap Topic',
    subtasks: subtaskItems,
    progress: progress || { status: 'NOT_STARTED' as const },
    assessment: assessmentData,
    notes: taskNotes,
  };

  return (
    <div className="flex-1 pb-12">
      <Header
        title={task.title}
        subtitle={month ? `Month ${month.monthNumber} • ${month.title}` : 'Roadmap Task Detail'}
      />

      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <Link href="/roadmap" className="text-xs text-slate-400 hover:text-slate-200 font-mono inline-block">
          ← Back to Complete Roadmap
        </Link>

        <TaskDetailView task={formattedTask as any} />
      </div>
    </div>
  );
}
