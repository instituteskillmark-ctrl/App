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
  Clock,
  BookOpen,
  Wrench,
  Sparkles,
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
    { day: 'Wed', activity: 'Learn (docs) + Notes', duration: '30–45 min', icon: Sparkles },
    { day: 'Thu', activity: 'Build / Debug', duration: '60–90 min', icon: Bug },
    { day: 'Fri', activity: 'Project Work', duration: '60–90 min', icon: CheckSquare },
    { day: 'Sat', activity: 'Review + Improve', duration: '45–60 min', icon: Target },
    { day: 'Sun', activity: 'Rest & Recharge', duration: 'Off / Rest', icon: Sun },
  ];

  return (
    <div className="flex-1 pb-16">
      <Header
        title="Today's Learning Workspace"
        subtitle="Focused Daily Execution Engine • Real Roadmap Progress & Focus Agenda"
      />

      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        {targetTaskWithDetails ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                ACTIVE TARGET ROADMAP TASK
              </h3>
              <Link
                href={`/roadmap/task/${targetTaskWithDetails.id}`}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 font-semibold"
              >
                <span>Full Task Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <TaskDetailView task={targetTaskWithDetails as any} />
          </div>
        ) : (
          <div className="bg-[#0e1420] border border-slate-800/80 rounded-xl p-8 lg:p-12 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-800/50 flex items-center justify-center text-cyan-400 mx-auto">
              <Target className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-100">No active focus task selected</h3>
              <p className="text-xs text-slate-400 font-mono max-w-md mx-auto">
                Select a topic from your 26-week curriculum to activate today's dedicated execution workspace.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/roadmap"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-mono font-bold rounded-lg transition shadow-lg shadow-cyan-950/60"
              >
                <span>Explore Roadmap Topics</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Weekly Routine Schedule directly matching the Reference Infographic */}
        <div className="bg-[#0e1420] border border-slate-800/80 rounded-xl p-6 space-y-4 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/60 pb-3 gap-2">
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              WEEKLY SAMPLE PLAN (2–3 HOURS/DAY ROUTINE)
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Structured Consistency Engine</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
            {dailySchedule.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.day}
                  className={`p-3.5 rounded-xl border text-center space-y-2 transition ${
                    s.day === 'Sun'
                      ? 'bg-emerald-950/20 border-emerald-800/50 text-emerald-300'
                      : 'bg-[#080d19] border-slate-800/80 text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono uppercase text-slate-400">{s.day}</span>
                    <Icon className={`w-3.5 h-3.5 ${s.day === 'Sun' ? 'text-emerald-400' : 'text-cyan-400'}`} />
                  </div>
                  <div className="text-xs font-bold tracking-tight text-slate-100">{s.activity}</div>
                  <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800/60">
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

