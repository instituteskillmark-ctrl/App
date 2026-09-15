import React from 'react';
import { Header } from '@/components/Header';
import { getDashboardStats } from '@/lib/services/dashboard';
import { PriorityBadge } from '@/components/PriorityBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { StudyTimer } from '@/components/StudyTimer';
import Link from 'next/link';
import { getAssessmentForTask } from '@/lib/services/assessments';
import { TaskDetailView } from '@/components/TaskDetailView';
import { db } from '@/db';
import { subtasks, taskProgress, notes } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const revalidate = 0;

export default async function TodayPage() {
  const stats = await getDashboardStats();

  let targetTaskWithDetails = null;

  if (stats.currentTask) {
    const subtaskItems = await db.select().from(subtasks).where(eq(subtasks.taskId, stats.currentTask.id));
    const [progress] = await db.select().from(taskProgress).where(eq(taskProgress.taskId, stats.currentTask.id));
    const taskNotes = await db.select().from(notes).where(eq(notes.taskId, stats.currentTask.id));
    const assessmentData = await getAssessmentForTask(stats.currentTask.id);

    targetTaskWithDetails = {
      ...stats.currentTask,
      monthName: stats.currentMonthName,
      subtasks: subtaskItems,
      progress: progress || { status: 'NOT_STARTED' as const },
      assessment: assessmentData,
      notes: taskNotes,
    };
  }

  const dailySchedule = [
    { day: 'Mon', activity: 'Learn (theory)', duration: '30–45 min' },
    { day: 'Tue', activity: 'Build / Practice', duration: '60–90 min' },
    { day: 'Wed', activity: 'Learn (docs) + Notes', duration: '30–45 min' },
    { day: 'Thu', activity: 'Build / Debug', duration: '60–90 min' },
    { day: 'Fri', activity: 'Project Work', duration: '60–90 min' },
    { day: 'Sat', activity: 'Review + Improve', duration: '45–60 min' },
    { day: 'Sun', activity: 'Rest & Recharge', duration: 'Off' },
  ];

  return (
    <div className="flex-1 pb-12">
      <Header
        title="Today's Learning Workspace"
        subtitle="Focused Daily Execution Engine • Real Roadmap Progress"
      />

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {targetTaskWithDetails ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                ACTIVE TARGET ROADMAP TASK
              </h3>
              <Link href={`/roadmap/task/${targetTaskWithDetails.id}`} className="text-xs text-cyan-400 font-mono hover:underline">
                Full Task Workspace →
              </Link>
            </div>

            <TaskDetailView task={targetTaskWithDetails as any} />
          </div>
        ) : (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 text-center space-y-4">
            <h3 className="text-lg font-bold text-slate-100">No active focus selected</h3>
            <p className="text-xs text-slate-400">Select a topic from your 26-week curriculum to activate today's workspace.</p>
            <Link href="/roadmap" className="inline-block px-5 py-2.5 bg-cyan-600 text-white text-xs font-mono rounded-lg">
              Explore Roadmap →
            </Link>
          </div>
        )}

        {/* Weekly Sample Routine Schedule */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6">
          <h3 className="text-xs font-semibold text-slate-400 mb-4 font-mono uppercase tracking-wider">
            WEEKLY SAMPLE ROUTINE (2–3 hours/day)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {dailySchedule.map((s) => (
              <div
                key={s.day}
                className={`p-3 rounded-lg border text-center ${
                  s.day === 'Sun'
                    ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-300'
                    : 'bg-slate-900/80 border-slate-800 text-slate-200'
                }`}
              >
                <div className="text-xs font-bold font-mono uppercase text-slate-400">{s.day}</div>
                <div className="text-xs font-semibold mt-1 text-slate-100">{s.activity}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-1">{s.duration}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
