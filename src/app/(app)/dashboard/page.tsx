import React from 'react';
import { Header } from '@/components/Header';
import { getCurrentPosition } from '@/lib/services/position';
import { getDashboardStats } from '@/lib/services/dashboard';
import { getAuthUserId } from '@/lib/supabase/server';
import { TaskActionButton } from '@/components/TaskActionButton';
import { PriorityBadge } from '@/components/PriorityBadge';
import { StatusBadge } from '@/components/StatusBadge';
import Link from 'next/link';
import {
  TrendingUp,
  Flame,
  Clock,
  Target,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Calendar,
  Activity,
  Layers,
} from 'lucide-react';

export const revalidate = 0;

export default async function DashboardPage() {
  const userId = await getAuthUserId();
  const position = await getCurrentPosition(userId);
  const stats = await getDashboardStats(userId);

  const {
    currentMonth,
    currentWeek,
    currentTask,
    nextTask,
    roadmapProgress,
    currentMonthProgress,
    completionState,
  } = position;

  const isComplete = completionState === 'ROADMAP_COMPLETE';

  return (
    <div className="flex-1 pb-16">
      <Header title="Dashboard" subtitle="Personal Learning System — What should I do right now?" />

      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* ── TOP METRIC SUMMARY BAR ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="os-surface p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="section-label">Roadmap Progress</span>
              <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--status-completed)' }} />
            </div>
            <div className="text-2xl font-medium" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {roadmapProgress.percentComplete}%
            </div>
            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {roadmapProgress.completedTasksCount} of {roadmapProgress.totalTasks} topics done
            </div>
          </div>

          <div className="os-surface p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="section-label">Current Month</span>
              <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
            </div>
            <div className="text-2xl font-medium" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {currentMonthProgress.percentComplete}%
            </div>
            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {currentMonth ? `Month ${currentMonth.monthNumber}: ${currentMonthProgress.completedTasksCount}/${currentMonthProgress.totalTasks}` : 'Roadmap Complete'}
            </div>
          </div>

          <div className="os-surface p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="section-label">Current Streak</span>
              <Flame className="w-3.5 h-3.5" style={{ color: 'var(--priority-important)' }} />
            </div>
            <div className="text-2xl font-medium" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {stats.streak.currentStreak} <span className="text-xs" style={{ color: 'var(--text-muted)' }}>days</span>
            </div>
            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {stats.streak.activeToday ? 'Active today' : 'Pending today'}
            </div>
          </div>

          <div className="os-surface p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="section-label">Study Time</span>
              <Clock className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            </div>
            <div className="text-2xl font-medium" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {stats.totalHoursInvested} <span className="text-xs" style={{ color: 'var(--text-muted)' }}>hrs</span>
            </div>
            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              Logged focus sessions
            </div>
          </div>
        </div>

        {/* ── 1. TODAY'S MISSION (VISUAL CENTER HERO) ── */}
        {isComplete ? (
          <div className="os-surface p-8 lg:p-12 text-center space-y-4 border border-emerald-500/30 bg-emerald-950/10">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <span className="section-label text-emerald-400 font-mono tracking-widest uppercase">
                ROADMAP COMPLETE
              </span>
              <h3 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                All 52 Roadmap Tasks Completed!
              </h3>
              <p className="text-xs max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
                Congratulations! You have completed all 6 months and 29 weeks of the AI Automation Developer OS curriculum.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                href="/projects"
                className="px-5 py-2.5 text-xs font-semibold rounded bg-[#7f77dd] text-white hover:bg-[#6c64c7] transition"
              >
                Review Projects Portfolio
              </Link>
              <Link
                href="/progress"
                className="px-5 py-2.5 text-xs font-semibold rounded border border-[#26262a] text-[#f2f2f0] hover:bg-[#141416] transition"
              >
                View Skill Matrix
              </Link>
            </div>
          </div>
        ) : currentTask ? (
          <div className="os-surface p-6 lg:p-8 relative overflow-hidden space-y-6 border-l-4 border-l-[#7f77dd]">
            
            {/* Header / Location Breadcrumb */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded"
                    style={{ background: 'var(--accent-bg)', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}
                  >
                    TODAY'S MISSION
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    • Month {currentMonth?.monthNumber} / 6
                  </span>
                </div>
                <h3 className="text-xl lg:text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  {currentTask.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <PriorityBadge priority={currentTask.priority} />
                <StatusBadge status={currentTask.status} />
              </div>
            </div>

            {/* Context Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded bg-[var(--surface-0)] border border-[var(--border)] space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                  Current Month
                </span>
                <span className="text-xs font-semibold block truncate" style={{ color: 'var(--text-primary)' }}>
                  Month {currentMonth?.monthNumber}: {currentMonth?.title}
                </span>
              </div>

              <div className="p-3 rounded bg-[var(--surface-0)] border border-[var(--border)] space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                  Current Week
                </span>
                <span className="text-xs font-semibold block truncate" style={{ color: 'var(--text-primary)' }}>
                  {currentWeek?.title || `Week ${currentTask.weekId}`}
                </span>
              </div>

              <div className="p-3 rounded bg-[var(--surface-0)] border border-[var(--border)] space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                  Estimated Time
                </span>
                <span className="text-xs font-semibold font-mono block truncate" style={{ color: 'var(--text-primary)' }}>
                  {currentTask.durationLabel || '1 day'} (~2–3 hrs)
                </span>
              </div>
            </div>

            {/* Task Description (What To Do) */}
            <div className="space-y-2">
              <span className="section-label flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                WHAT TO DO
              </span>
              <p className="text-xs leading-relaxed max-w-3xl" style={{ color: 'var(--text-secondary)' }}>
                {currentTask.description}
              </p>
            </div>

            {/* Primary Action Button (START TASK or CONTINUE TASK) */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <TaskActionButton taskId={currentTask.id} status={currentTask.status} size="large" />

              <Link
                href="/roadmap"
                className="text-xs flex items-center gap-1 transition"
                style={{ color: 'var(--text-muted)' }}
              >
                <span>View Full 29-Week Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        ) : null}

        {/* ── 2. CURRENT MONTH PROGRESS & NEXT TASK ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Current Month Progress Bar & Breakdown */}
          {currentMonth && (
            <div className="lg:col-span-2 os-surface p-5 space-y-4">
              <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="section-label flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                  Current Month Breakdown — Month {currentMonth.monthNumber}
                </span>
                <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                  {currentMonth.durationWeeks}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: 'var(--text-secondary)' }}>
                    <span className="font-semibold text-white font-mono">{currentMonthProgress.completedTasksCount}</span> of{' '}
                    <span className="font-semibold text-white font-mono">{currentMonthProgress.totalTasks}</span> topics completed
                  </span>
                  <span className="font-mono text-xs text-[#a3a3a8]">{currentMonthProgress.percentComplete}%</span>
                </div>
                <div className="progress-bar-track" style={{ height: '6px' }}>
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${currentMonthProgress.percentComplete}%`, background: 'var(--accent)', height: '100%' }}
                  />
                </div>
              </div>

              {currentMonth.keyOutput && (
                <div className="p-3 rounded bg-[var(--surface-0)] border border-[var(--border)] text-xs space-y-1">
                  <span className="section-label block text-[10px]">Month Key Output</span>
                  <span className="font-medium text-white block">{currentMonth.keyOutput}</span>
                </div>
              )}
            </div>
          )}

          {/* Next Task (Informational Card) */}
          <div className="os-surface p-5 space-y-3">
            <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="section-label flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                Next Task in Roadmap
              </span>
            </div>

            {nextTask ? (
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold block text-white truncate">{nextTask.title}</span>
                  <PriorityBadge priority={nextTask.priority} />
                </div>
                <p className="text-[11px] line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                  {nextTask.description}
                </p>
                <div className="flex items-center justify-between text-[10px] pt-2" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  <span>Duration: {nextTask.durationLabel || '1 day'}</span>
                  <span>Sequential Task #{nextTask.orderIndex}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>
                {isComplete ? 'All 52 tasks completed!' : 'Current task is the final task in this section.'}
              </p>
            )}
          </div>

        </div>

        {/* ── 3. RECENT ACTIVITY FEED ── */}
        <div className="os-surface p-5 space-y-4">
          <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="section-label flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
              Recent Activity Log
            </span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              Real User Activity
            </span>
          </div>

          {stats.recentActivity.length > 0 ? (
            <div className="space-y-2">
              {stats.recentActivity.map((act, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded bg-[var(--surface-0)] border border-[var(--border)] text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {act.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono shrink-0" style={{ color: 'var(--text-muted)' }}>
                    {act.time}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
              No learning activity recorded yet. Click <strong className="text-white">START TASK</strong> on Today's Mission to begin!
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
