import React from 'react';
import { Header } from '@/components/Header';
import { getDashboardStats } from '@/lib/services/dashboard';
import { CurrentTaskHero } from '@/components/CurrentTaskHero';
import { db } from '@/db';
import { subtasks, taskProgress, notes } from '@/db/schema';
import { getAuthUserId } from '@/lib/supabase/server';
import { eq, and } from 'drizzle-orm';
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
  const userId = await getAuthUserId();
  const stats = await getDashboardStats(userId);

  let targetTaskWithDetails = null;

  if (stats.currentTask) {
    const subtaskItems = await db.select().from(subtasks).where(eq(subtasks.taskId, stats.currentTask.id));
    const [progress] = await db
      .select()
      .from(taskProgress)
      .where(and(eq(taskProgress.taskId, stats.currentTask.id), eq(taskProgress.userId, userId)));
    const taskNotes = await db
      .select()
      .from(notes)
      .where(and(eq(notes.taskId, stats.currentTask.id), eq(notes.userId, userId)));
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
      <Header title="Today" subtitle="Daily Learning Workspace & Active Execution" />

      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        {/* ── Single merged CurrentTaskHero component ── */}
        {targetTaskWithDetails ? (
          <CurrentTaskHero task={targetTaskWithDetails as any} />
        ) : (
          <div
            className="os-surface p-8 lg:p-12 text-center space-y-4"
          >
            <Target className="w-8 h-8 mx-auto" style={{ color: 'var(--text-muted)' }} />
            <div className="space-y-1">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                No active topic selected
              </h3>
              <p className="text-xs max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
                Choose a topic from your 29-week roadmap to activate today's learning workspace.
              </p>
            </div>
            <Link
              href="/roadmap"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold transition"
              style={{ background: 'var(--accent)', color: '#fff', borderRadius: '4px' }}
            >
              <span>Explore Roadmap Topics</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Weekly Routine Schedule */}
        <div className="os-surface p-5 space-y-4">
          <div
            className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <span className="section-label flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
              Weekly Schedule
            </span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              2–3 hrs/day routine
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
            {dailySchedule.map((s) => {
              const Icon = s.icon;
              const isRest = s.day === 'Sun';
              return (
                <div
                  key={s.day}
                  className="p-3 space-y-2 text-center"
                  style={{
                    background: isRest ? 'rgba(127,119,221,0.06)' : 'var(--surface-0)',
                    border: `1px solid ${isRest ? 'rgba(127,119,221,0.2)' : 'var(--border)'}`,
                    borderRadius: '4px',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] font-semibold uppercase"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                    >
                      {s.day}
                    </span>
                    <Icon
                      className="w-3 h-3"
                      style={{ color: isRest ? 'var(--accent)' : 'var(--text-muted)' }}
                    />
                  </div>
                  <div className="text-[10px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {s.activity}
                  </div>
                  <div
                    className="text-[10px] pt-1"
                    style={{
                      borderTop: '1px solid var(--border)',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
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
