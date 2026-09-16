'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PriorityBadge } from '@/components/PriorityBadge';
import { TopicStatusButton } from '@/components/TopicStatusButton';
import { Clock, ArrowRight, ChevronDown, ChevronRight, CheckCircle2 } from 'lucide-react';

interface Task {
  id: string;
  weekId?: string | null;
  title: string;
  priority: string;
  durationLabel?: string | null;
  subtasks: { id: string; title: string }[];
  progress: { status: string };
}

interface Week {
  id: string;
  weekNumber: number;
  title: string;
}

interface Month {
  id: string;
  monthNumber: number;
  title: string;
  keyOutput: string;
  durationWeeks: string;
  totalTasks: number;
  completedTasks: number;
  percentComplete: number;
}

interface RoadmapTabsProps {
  months: Month[];
  tasksByMonth: Record<number, Task[]>;
  weeksByMonth: Record<number, Week[]>;
}

export function RoadmapTabs({ months, tasksByMonth, weeksByMonth }: RoadmapTabsProps) {
  const [selectedMonth, setSelectedMonth] = useState(months[0]?.monthNumber ?? 1);
  const currentMonth = months.find((m) => m.monthNumber === selectedMonth);
  const tasks = tasksByMonth[selectedMonth] ?? [];
  const weeks = weeksByMonth[selectedMonth] ?? [];

  // Determine default expanded week (first week with unverified topics)
  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    let activeWeekFound = false;
    for (const week of weeks) {
      const weekTasks = tasks.filter((t) => t.weekId === week.id);
      const hasUnverified = weekTasks.some((t) => t.progress.status !== 'VERIFIED');
      if (hasUnverified && !activeWeekFound) {
        initial[week.id] = true;
        activeWeekFound = true;
      } else {
        initial[week.id] = false;
      }
    }
    if (!activeWeekFound && weeks.length > 0) {
      initial[weeks[0].id] = true;
    }
    return initial;
  });

  const [lastMonth, setLastMonth] = useState(selectedMonth);
  if (lastMonth !== selectedMonth) {
    setLastMonth(selectedMonth);
    const newExpanded: Record<string, boolean> = {};
    let activeWeekFound = false;
    for (const week of weeks) {
      const weekTasks = tasks.filter((t) => t.weekId === week.id);
      const hasUnverified = weekTasks.some((t) => t.progress.status !== 'VERIFIED');
      if (hasUnverified && !activeWeekFound) {
        newExpanded[week.id] = true;
        activeWeekFound = true;
      } else {
        newExpanded[week.id] = false;
      }
    }
    if (!activeWeekFound && weeks.length > 0) {
      newExpanded[weeks[0].id] = true;
    }
    setExpandedWeeks(newExpanded);
  }

  const toggleWeek = (weekId: string) => {
    setExpandedWeeks((prev) => ({
      ...prev,
      [weekId]: !prev[weekId],
    }));
  };

  // Group tasks by week for rendering
  const tasksByWeekMap = new Map<string, Task[]>();
  const unassignedTasks: Task[] = [];

  for (const task of tasks) {
    if (task.weekId) {
      const existing = tasksByWeekMap.get(task.weekId) ?? [];
      tasksByWeekMap.set(task.weekId, [...existing, task]);
    } else {
      unassignedTasks.push(task);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Month tab strip ── */}
      <div
        className="flex overflow-x-auto"
        style={{
          borderBottom: '1px solid var(--border)',
          gap: 0,
        }}
      >
        {months.map((m) => {
          const isActive = m.monthNumber === selectedMonth;
          return (
            <button
              key={m.monthNumber}
              onClick={() => setSelectedMonth(m.monthNumber)}
              className="shrink-0 px-5 py-2.5 text-xs font-semibold transition relative"
              style={{
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                marginBottom: '-1px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Month {m.monthNumber}
            </button>
          );
        })}
      </div>

      {/* ── Sticky Sub-Header with Selected Month Progress ── */}
      {currentMonth && (
        <div
          className="sticky top-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 shadow-md transition"
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
          }}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}
              >
                MONTH {currentMonth.monthNumber} / 6
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                • {currentMonth.durationWeeks}
              </span>
            </div>
            <h2 className="text-sm font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>
              {currentMonth.title}
            </h2>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Key Output: {currentMonth.keyOutput}
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* Progress Bar & Counter */}
            <div className="w-36 space-y-1">
              <div className="flex justify-between text-[11px]">
                <span style={{ color: 'var(--text-secondary)' }}>Progress</span>
                <span
                  style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
                  className="font-semibold"
                >
                  {currentMonth.percentComplete}%
                </span>
              </div>
              <div className="progress-bar-track" style={{ height: '5px' }}>
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${currentMonth.percentComplete}%`,
                    background: 'var(--accent)',
                    height: '100%',
                  }}
                />
              </div>
            </div>

            <div
              className="text-xs font-semibold px-2.5 py-1 rounded"
              style={{
                background: 'var(--surface-0)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {currentMonth.completedTasks}/{currentMonth.totalTasks} Done
            </div>

            <Link
              href={`/roadmap/${currentMonth.monthNumber}`}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold transition"
              style={{
                background: 'var(--surface-0)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                color: 'var(--text-secondary)',
              }}
            >
              Detail <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* ── Collapsible Weeks Section ── */}
      <div className="space-y-4">
        {weeks.length === 0 && unassignedTasks.length === 0 ? (
          <div
            className="py-12 text-center text-xs"
            style={{
              color: 'var(--text-muted)',
              border: '1px dashed var(--border)',
              borderRadius: '4px',
            }}
          >
            No topics found for this month.
          </div>
        ) : (
          weeks.map((week) => {
            const weekTasks = tasksByWeekMap.get(week.id) ?? [];
            const isExpanded = !!expandedWeeks[week.id];
            const completedCount = weekTasks.filter(
              (t) => t.progress.status === 'COMPLETED' || t.progress.status === 'VERIFIED'
            ).length;
            const totalCount = weekTasks.length;
            const isWeekComplete = totalCount > 0 && completedCount === totalCount;

            const weekTitle = week.title.toLowerCase().startsWith('week')
              ? week.title
              : `Week ${week.weekNumber} — ${week.title}`;

            return (
              <div
                key={week.id}
                className="os-surface overflow-hidden transition"
                style={{
                  border: isExpanded ? '1px solid var(--border-strong)' : '1px solid var(--border)',
                }}
              >
                {/* Collapsible Week Header */}
                <button
                  type="button"
                  onClick={() => toggleWeek(week.id)}
                  className="w-full flex items-center justify-between px-4 py-3 transition text-left"
                  style={{
                    background: isExpanded ? 'var(--surface-1)' : 'var(--surface-0)',
                    cursor: 'pointer',
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                    ) : (
                      <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    )}
                    <span
                      className="text-xs font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {weekTitle}
                    </span>
                    {isWeekComplete && (
                      <CheckCircle2
                        className="w-3.5 h-3.5 ml-1"
                        style={{ color: 'var(--status-completed)' }}
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className="text-[11px] font-medium px-2 py-0.5 rounded"
                      style={{
                        background: 'var(--surface-0)',
                        border: '1px solid var(--border)',
                        color: isWeekComplete ? 'var(--status-completed)' : 'var(--text-muted)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {completedCount} of {totalCount} done
                    </span>
                  </div>
                </button>

                {/* Week Topic Rows (Rendered when expanded) */}
                {isExpanded && (
                  <div>
                    {weekTasks.length === 0 ? (
                      <div
                        className="py-4 px-6 text-xs text-center"
                        style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}
                      >
                        No topics assigned to this week.
                      </div>
                    ) : (
                      <div>
                        {weekTasks.map((task, idx) => (
                          <div
                            key={task.id}
                            className="grid items-center px-4 py-2.5 transition"
                            style={{
                              gridTemplateColumns: '1fr auto auto auto',
                              gap: '16px',
                              borderTop: '1px solid var(--border)',
                              background: 'var(--surface-1)',
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLDivElement).style.background = '#1a1a1d';
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLDivElement).style.background =
                                'var(--surface-1)';
                            }}
                          >
                            {/* Topic title */}
                            <Link
                              href={`/roadmap/task/${task.id}`}
                              className="text-xs font-medium transition truncate"
                              style={{ color: 'var(--text-primary)' }}
                              onMouseEnter={(e) =>
                                ((e.currentTarget as HTMLAnchorElement).style.color =
                                  'var(--accent)')
                              }
                              onMouseLeave={(e) =>
                                ((e.currentTarget as HTMLAnchorElement).style.color =
                                  'var(--text-primary)')
                              }
                            >
                              {task.title}
                            </Link>

                            {/* Priority badge */}
                            <PriorityBadge priority={task.priority as any} />

                            {/* Single compact status control */}
                            <TopicStatusButton
                              taskId={task.id}
                              currentStatus={task.progress.status as any}
                            />

                            {/* Duration label */}
                            <span
                              className="text-[10px] text-right whitespace-nowrap min-w-[50px]"
                              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                            >
                              {task.durationLabel ?? '—'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
