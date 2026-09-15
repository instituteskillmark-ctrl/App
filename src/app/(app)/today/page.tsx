import React from 'react';
import { Header } from '@/components/Header';
import { getDashboardStats } from '@/lib/services/dashboard';
import { TaskDetailView } from '@/components/TaskDetailView';
import { db } from '@/db';
import { subtasks, taskProgress, notes } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { getAssessmentForTask } from '@/lib/services/assessments';
import {
  Target,
  ArrowRight,
  Calendar,
  BookOpen,
  Wrench,
  Compass,
  Bug,
  CheckSquare,
  Sun,
} from 'lucide-react';

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
    { day: 'Mon', activity: 'Learn (theory)', duration: '30–45 min', icon: BookOpen },
    { day: 'Tue', activity: 'Build / Practice', duration: '60–90 min', icon: Wrench },
    { day: 'Wed', activity: 'Docs & Notes', duration: '30–45 min', icon: Compass },
    { day: 'Thu', activity: 'Build & Debug', duration: '60–90 min', icon: Bug },
    { day: 'Fri', activity: 'Project Work', duration: '60–90 min', icon: CheckSquare },
    { day: 'Sat', activity: 'Review & Test', duration: '45–60 min', icon: Target },
    { day: 'Sun', activity: 'Rest & Recharge', duration: 'Off Day', icon: Sun },
  ];

  return (
    <div className="flex-1 pb-16">
      <Header
        title="Today's Focus"
        subtitle="Daily Execution & Active Learning Task"
      />

      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        {targetTaskWithDetails ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#252b34] pb-3">
              <h3 className="text-xs font-semibold text-[#f5f7fa] uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                Active Roadmap Task
              </h3>
              <Link
                href={`/roadmap/task/${targetTaskWithDetails.id}`}
                className="text-xs text-[#f5f7fa] hover:text-white flex items-center gap-1 font-semibold"
              >
                <span>Full Task View</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#9aa3af]" />
              </Link>
            </div>

            <TaskDetailView task={targetTaskWithDetails as any} />
          </div>
        ) : (
          <div className="bg-[#12161c] border border-[#252b34] rounded-xl p-8 lg:p-12 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#171c23] border border-[#252b34] flex items-center justify-center text-emerald-400 mx-auto">
              <Target className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-[#f5f7fa]">No active topic selected</h3>
              <p className="text-xs text-[#9aa3af] max-w-md mx-auto">
                Choose a topic from your 26-week roadmap to activate today's learning workspace.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/roadmap"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#f5f7fa] hover:bg-white text-[#08090c] text-xs font-semibold rounded-lg transition"
              >
                <span>Explore Roadmap Topics</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Weekly Routine Schedule */}
        <div className="bg-[#12161c] border border-[#252b34] rounded-xl p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#252b34] pb-3 gap-2">
            <h3 className="text-xs font-semibold text-[#f5f7fa] uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Weekly Schedule (2–3 hrs/day routine)
            </h3>
            <span className="text-[11px] text-[#66707c]">Consistent Study Plan</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
            {dailySchedule.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.day}
                  className={`p-3.5 rounded-xl border text-center space-y-2 transition ${
                    s.day === 'Sun'
                      ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                      : 'bg-[#171c23] border-[#252b34] text-[#f5f7fa] hover:border-[#374151]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase text-[#9aa3af]">{s.day}</span>
                    <Icon className={`w-3.5 h-3.5 ${s.day === 'Sun' ? 'text-emerald-400' : 'text-[#9aa3af]'}`} />
                  </div>
                  <div className="text-xs font-semibold tracking-tight text-[#f5f7fa]">{s.activity}</div>
                  <div className="text-[11px] text-[#66707c] pt-1 border-t border-[#252b34]">
                    {s.duration}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}


