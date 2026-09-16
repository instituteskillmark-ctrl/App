import React from 'react';
import { Header } from '@/components/Header';
import { getAuthUserId } from '@/lib/supabase/server';
import { getComprehensiveProgress } from '@/lib/services/progress';
import Link from 'next/link';
import {
  TrendingUp,
  Award,
  Flame,
  AlertTriangle,
  BarChart3,
  Calendar,
  Clock,
  History,
  Zap,
  Target,
  CheckCircle2,
  BookOpen,
  Activity,
  ChevronRight,
} from 'lucide-react';

export const revalidate = 0;

function formatMinutes(minutes: number): string {
  if (minutes === 0) return '0m';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
}

function ProgressBar({ percent, color = 'var(--accent)' }: { percent: number; color?: string }) {
  return (
    <div
      className="w-full h-1.5 rounded-full overflow-hidden"
      style={{ background: 'var(--surface-0)' }}
    >
      <div
        className="h-full rounded-full transition-all"
        style={{
          width: `${Math.min(100, percent)}%`,
          background: color,
        }}
      />
    </div>
  );
}

export default async function ProgressPage() {
  const userId = await getAuthUserId();
  const data = await getComprehensiveProgress(userId);

  if (!data) {
    return (
      <div className="flex-1 pb-16">
        <Header title="Progress" subtitle="Real Learning Progress Analytics" />
        <div className="p-8 text-center text-xs text-slate-400 font-mono">
          Unable to load progress data. Check database connection.
        </div>
      </div>
    );
  }

  const { overall, monthlyProgress, weeklyProgress, studyTime, streak, assessments, skills, currentPosition, recentActivities } = data;
  const currentWeekId = currentPosition.currentWeek?.id;
  const currentMonthId = currentPosition.currentMonth?.id;

  return (
    <div className="flex-1 pb-16">
      <Header title="Progress" subtitle="Real Learning Analytics — Based on Actual Database Records" />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">

        {/* ── ROADMAP COMPLETE BANNER ── */}
        {overall.isRoadmapComplete && (
          <div
            className="p-5 rounded border text-center space-y-2"
            style={{
              background: 'rgba(16,185,129,0.08)',
              borderColor: 'rgba(16,185,129,0.3)',
            }}
          >
            <div className="text-2xl">🎉</div>
            <h2 className="text-lg font-bold text-emerald-300">ROADMAP COMPLETE!</h2>
            <p className="text-xs text-emerald-400/80">
              You have completed all {overall.totalTasks} tasks in the 6-Month AI Automation Developer Roadmap!
            </p>
          </div>
        )}

        {/* ── SECTION 1: OVERALL PROGRESS ── */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            Overall Roadmap Progress
          </h2>

          {/* Main Progress Bar */}
          <div
            className="p-5 sm:p-6 space-y-4 rounded"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="text-3xl font-bold font-mono text-white">
                  {overall.overallProgressPercent}%
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  {overall.completedTasksCount} of {overall.totalTasks} topics completed
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono text-slate-400">
                  <span className="text-emerald-400 font-bold">{overall.completedTasksCount}</span> completed ·{' '}
                  <span className="text-purple-400 font-bold">{overall.verifiedTasksCount}</span> verified ·{' '}
                  <span className="text-slate-300 font-bold">{overall.remainingTasksCount}</span> remaining
                </div>
              </div>
            </div>
            <ProgressBar percent={overall.overallProgressPercent} />
          </div>

          {/* Key Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              {
                label: 'Completed',
                value: overall.completedTasksCount,
                sub: 'done or verified',
                icon: CheckCircle2,
                color: '#10b981',
              },
              {
                label: 'Verified',
                value: overall.verifiedTasksCount,
                sub: 'quiz passed',
                icon: Award,
                color: '#a855f7',
              },
              {
                label: 'Remaining',
                value: overall.remainingTasksCount,
                sub: 'to complete',
                icon: Target,
                color: '#94a3b8',
              },
              {
                label: 'In Progress',
                value: overall.inProgressTasksCount,
                sub: 'active tasks',
                icon: Activity,
                color: '#38bdf8',
              },
              {
                label: 'Needs Revision',
                value: overall.needsRevisionTasksCount,
                sub: 'quiz failed',
                icon: AlertTriangle,
                color: '#f87171',
              },
              {
                label: 'Total Tasks',
                value: overall.totalTasks,
                sub: 'in roadmap',
                icon: BookOpen,
                color: '#64748b',
              },
            ].map((tile) => {
              const Icon = tile.icon;
              return (
                <div
                  key={tile.label}
                  className="p-4 space-y-1.5 rounded"
                  style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      {tile.label}
                    </span>
                    <Icon className="w-3.5 h-3.5" style={{ color: tile.color }} />
                  </div>
                  <div
                    className="text-2xl font-bold font-mono"
                    style={{ color: tile.color }}
                  >
                    {tile.value}
                  </div>
                  <div className="text-[10px] text-slate-500">{tile.sub}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── SECTION 2: STUDY TIME + STREAK ── */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            Study Time & Streak Analytics
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              {
                label: 'Total Study Time',
                value: formatMinutes(studyTime.totalStudyTimeMinutes),
                sub: 'all recorded sessions',
                icon: Clock,
                color: '#38bdf8',
              },
              {
                label: "Today's Study",
                value: formatMinutes(studyTime.todayStudyTimeMinutes),
                sub: "completed today",
                icon: Calendar,
                color: '#a855f7',
              },
              {
                label: 'This Week',
                value: formatMinutes(studyTime.thisWeekStudyTimeMinutes),
                sub: 'Mon–Sun calendar week',
                icon: BarChart3,
                color: '#10b981',
              },
              {
                label: 'Current Streak',
                value: `${streak.currentStreak}`,
                sub: streak.activeToday ? 'Active today 🔥' : 'Pending today',
                unit: 'days',
                icon: Flame,
                color: '#f97316',
              },
              {
                label: 'Longest Streak',
                value: `${streak.longestStreak}`,
                sub: 'all-time best',
                unit: 'days',
                icon: Zap,
                color: '#eab308',
              },
            ].map((tile) => {
              const Icon = tile.icon;
              return (
                <div
                  key={tile.label}
                  className="p-4 space-y-1.5 rounded"
                  style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      {tile.label}
                    </span>
                    <Icon className="w-3.5 h-3.5" style={{ color: tile.color }} />
                  </div>
                  <div className="text-2xl font-bold font-mono" style={{ color: tile.color }}>
                    {tile.value}
                    {tile.unit && (
                      <span className="text-xs ml-1 text-slate-400">{tile.unit}</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500">{tile.sub}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── SECTION 3: CURRENT ROADMAP POSITION ── */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" />
            Current Roadmap Position
          </h2>

          <div
            className="p-5 rounded space-y-4"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
          >
            {currentPosition.currentTask ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/40 text-purple-300 font-semibold">
                    MONTH {currentPosition.currentMonth?.monthNumber}
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-500" />
                  <span className="text-slate-300">
                    WEEK {currentPosition.currentWeek?.weekNumber}: {currentPosition.currentWeek?.title}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                      Active Task
                    </div>
                    <h3 className="text-base font-bold text-white">
                      {currentPosition.currentTask.title}
                    </h3>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      Status: {currentPosition.currentTask.status.replace('_', ' ')}
                      {currentPosition.currentTask.durationLabel && ` · ${currentPosition.currentTask.durationLabel}`}
                    </div>
                  </div>

                  <Link
                    href={`/roadmap/task/${currentPosition.currentTask.id}`}
                    className="px-4 py-2 text-xs font-semibold rounded bg-purple-600 hover:bg-purple-500 text-white transition flex items-center gap-2 shrink-0 self-start sm:self-center"
                  >
                    Open Task Workspace
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {currentPosition.nextTask && (
                  <div
                    className="px-3 py-2.5 rounded text-xs text-slate-400 font-mono"
                    style={{ background: 'var(--surface-0)', border: '1px solid var(--border)' }}
                  >
                    <span className="text-slate-500">Next Up: </span>
                    <span className="text-slate-300">{currentPosition.nextTask.title}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-sm font-bold text-white">All tasks completed!</p>
                <p className="text-xs text-slate-400">Roadmap is fully complete.</p>
              </div>
            )}
          </div>
        </section>

        {/* ── SECTION 4: MONTHLY PROGRESS ── */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            Monthly Progress
          </h2>

          <div className="space-y-2">
            {monthlyProgress.map((m) => {
              const isCurrent = m.id === currentMonthId;
              return (
                <div
                  key={m.id}
                  className="p-4 sm:p-5 rounded space-y-3"
                  style={{
                    background: isCurrent ? 'rgba(147,51,234,0.07)' : 'var(--surface-1)',
                    border: isCurrent
                      ? '1px solid rgba(147,51,234,0.35)'
                      : '1px solid var(--border)',
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {isCurrent && (
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-purple-600/30 border border-purple-500/40 text-purple-300 uppercase tracking-wider">
                          CURRENT
                        </span>
                      )}
                      <h3
                        className="text-sm font-bold"
                        style={{ color: isCurrent ? 'var(--accent)' : 'var(--text-primary)' }}
                      >
                        Month {m.monthNumber}: {m.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono shrink-0">
                      <span
                        className="text-xl font-bold"
                        style={{ color: m.percentComplete === 100 ? '#10b981' : 'var(--text-primary)' }}
                      >
                        {m.percentComplete}%
                      </span>
                      <span className="text-slate-400">
                        {m.completedTasks}/{m.totalTasks}
                      </span>
                    </div>
                  </div>

                  <ProgressBar
                    percent={m.percentComplete}
                    color={m.percentComplete === 100 ? '#10b981' : 'var(--accent)'}
                  />

                  <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-slate-400">
                    <span>
                      <span className="text-emerald-400">{m.completedTasks}</span> completed
                    </span>
                    <span>·</span>
                    <span>
                      <span className="text-purple-400">{m.verifiedTasks}</span> verified
                    </span>
                    {m.needsRevisionTasks > 0 && (
                      <>
                        <span>·</span>
                        <span>
                          <span className="text-red-400">{m.needsRevisionTasks}</span> needs revision
                        </span>
                      </>
                    )}
                    <span>·</span>
                    <span>
                      <span className="text-slate-300">{m.remainingTasks}</span> remaining
                    </span>
                    <span>·</span>
                    <span className="text-slate-500">{m.durationWeeks}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── SECTION 5: WEEKLY PROGRESS ── */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            Weekly Roadmap Progress
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {weeklyProgress.map((w) => (
              <div
                key={w.id}
                className="p-4 rounded space-y-2.5"
                style={{
                  background: w.isCurrentWeek ? 'rgba(147,51,234,0.07)' : 'var(--surface-1)',
                  border: w.isCurrentWeek
                    ? '1px solid rgba(147,51,234,0.35)'
                    : '1px solid var(--border)',
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-mono text-slate-500">
                        M{w.monthNumber} · W{w.weekNumber}
                      </span>
                      {w.isCurrentWeek && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-600/30 border border-purple-500/40 text-purple-300 uppercase">
                          CURRENT
                        </span>
                      )}
                    </div>
                    <h4
                      className="text-xs font-semibold leading-snug"
                      style={{ color: w.isCurrentWeek ? '#c084fc' : 'var(--text-primary)' }}
                    >
                      {w.title}
                    </h4>
                  </div>
                  <span
                    className="text-sm font-bold font-mono shrink-0"
                    style={{
                      color: w.percentComplete === 100 ? '#10b981' : 'var(--text-primary)',
                    }}
                  >
                    {w.percentComplete}%
                  </span>
                </div>

                <ProgressBar
                  percent={w.percentComplete}
                  color={w.percentComplete === 100 ? '#10b981' : 'var(--accent)'}
                />

                <div className="text-[10px] font-mono text-slate-400">
                  {w.completedTasks}/{w.totalTasks} tasks ·{' '}
                  <span className="text-purple-400">{w.verifiedTasks}</span> verified
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION 6: TASK-SPECIFIC STUDY TIME ── */}
        {studyTime.taskStudyTimes.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              Study Time by Task
            </h2>

            <div
              className="p-5 rounded space-y-3"
              style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
            >
              <p className="text-xs text-slate-400 font-mono">
                Study time ≠ task completion. These are actual timer sessions per task.
              </p>
              <div className="space-y-2.5">
                {studyTime.taskStudyTimes.slice(0, 10).map((t) => (
                  <div
                    key={t.taskId}
                    className="flex items-center justify-between gap-3 py-2 border-b last:border-b-0"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white truncate">
                        {t.taskTitle}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        M{t.monthNumber} · W{t.weekNumber} ·{' '}
                        <span
                          className={
                            t.status === 'VERIFIED'
                              ? 'text-purple-400'
                              : t.status === 'COMPLETED'
                              ? 'text-emerald-400'
                              : t.status === 'NEEDS_REVISION'
                              ? 'text-red-400'
                              : 'text-slate-400'
                          }
                        >
                          {t.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-bold font-mono text-emerald-400 shrink-0">
                      {t.formattedTime}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── SECTION 7: ASSESSMENT & VERIFICATION ── */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-400" />
            Assessment & Verification Insight
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: 'Verified Tasks',
                value: overall.verifiedTasksCount,
                sub: 'Quiz passed (≥80%)',
                color: '#a855f7',
              },
              {
                label: 'Completed (unverified)',
                value: overall.unverifiedCompletedCount,
                sub: 'Done, no quiz attempt',
                color: '#10b981',
              },
              {
                label: 'Needs Revision',
                value: overall.needsRevisionTasksCount,
                sub: 'Quiz failed (<80%)',
                color: '#f87171',
              },
              {
                label: 'Quiz Pass Rate',
                value: `${assessments.passRatePercent}%`,
                sub: `${assessments.passedAttempts} of ${assessments.totalAssessmentAttempts} attempts`,
                color: '#38bdf8',
              },
            ].map((tile) => (
              <div
                key={tile.label}
                className="p-4 space-y-1.5 rounded"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
              >
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  {tile.label}
                </div>
                <div
                  className="text-2xl font-bold font-mono"
                  style={{ color: tile.color }}
                >
                  {tile.value}
                </div>
                <div className="text-[10px] text-slate-500">{tile.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION 8: SKILL BREAKDOWN ── */}
        {skills.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              Skill Proficiency Breakdown
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {skills.map((sk) => (
                <div
                  key={sk.id}
                  className="p-4 space-y-3 rounded"
                  style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">{sk.category}</h4>
                    <span className="text-sm font-bold font-mono text-purple-300">
                      {sk.proficiencyPercent}%
                    </span>
                  </div>
                  <ProgressBar percent={sk.proficiencyPercent} color="var(--accent)" />
                  <div className="text-[10px] font-mono text-slate-400">
                    {sk.completedTasks}/{sk.totalTasks} tasks ·{' '}
                    <span className="text-purple-400">{sk.verifiedTasks}</span> verified
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── SECTION 9: RECENT ACTIVITY ── */}
        {recentActivities.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400" />
              Recent Activity Feed
            </h2>

            <div
              className="p-5 rounded space-y-2"
              style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
            >
              {recentActivities.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 py-2.5 border-b last:border-b-0"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div
                    className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                    style={{
                      background:
                        item.type === 'TIMER'
                          ? '#10b981'
                          : item.type === 'ASSESSMENT'
                          ? '#a855f7'
                          : '#38bdf8',
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white truncate">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">{item.detail}</div>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 shrink-0">
                    {item.timestamp.toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty state if no activity at all */}
        {recentActivities.length === 0 &&
          overall.completedTasksCount === 0 &&
          studyTime.totalStudyTimeMinutes === 0 && (
            <div
              className="p-8 text-center space-y-2 rounded"
              style={{
                background: 'var(--surface-1)',
                border: '1px dashed var(--border)',
              }}
            >
              <BookOpen className="w-8 h-8 text-slate-500 mx-auto" />
              <h3 className="text-sm font-bold text-white">No activity yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Start working through your roadmap tasks. Complete tasks, log study sessions,
                and pass assessments to see your progress here.
              </p>
              <Link
                href="/roadmap"
                className="inline-flex items-center gap-2 mt-2 px-4 py-2 text-xs font-semibold rounded bg-purple-600 hover:bg-purple-500 text-white transition"
              >
                View Roadmap
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
      </div>
    </div>
  );
}
