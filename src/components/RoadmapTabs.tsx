'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PriorityBadge } from '@/components/PriorityBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { TopicStatusButton } from '@/components/TopicStatusButton';
import { Clock, ArrowRight } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  priority: string;
  durationLabel?: string | null;
  subtasks: { id: string; title: string }[];
  progress: { status: string };
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
}

export function RoadmapTabs({ months, tasksByMonth }: RoadmapTabsProps) {
  const [selectedMonth, setSelectedMonth] = useState(months[0]?.monthNumber ?? 1);
  const currentMonth = months.find((m) => m.monthNumber === selectedMonth);
  const tasks = tasksByMonth[selectedMonth] ?? [];

  return (
    <div className="space-y-5">
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
                borderBottom: isActive
                  ? '2px solid var(--accent)'
                  : '2px solid transparent',
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

      {/* ── Selected month info bar ── */}
      {currentMonth && (
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3"
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
          }}
        >
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {currentMonth.title}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {currentMonth.keyOutput}
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-center">
              <div
                className="text-lg font-medium"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
              >
                {currentMonth.percentComplete}%
              </div>
              <div className="section-label">Complete</div>
            </div>
            <div className="text-center">
              <div
                className="text-lg font-medium"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
              >
                {currentMonth.completedTasks}/{currentMonth.totalTasks}
              </div>
              <div className="section-label">Topics</div>
            </div>
            <div
              className="flex items-center gap-1 text-[10px]"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              <Clock className="w-3 h-3" />
              {currentMonth.durationWeeks}
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
              Full View <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* ── Flat topic list ── */}
      <div>
        <div
          className="grid text-[10px] font-semibold uppercase tracking-wider px-3 py-2 mb-1"
          style={{
            color: 'var(--text-muted)',
            gridTemplateColumns: '1fr auto auto auto',
            gap: '16px',
          }}
        >
          <span>Topic</span>
          <span>Priority</span>
          <span>Status</span>
          <span style={{ fontFamily: 'var(--font-mono)', textAlign: 'right' }}>Duration</span>
        </div>

        {tasks.length === 0 ? (
          <div
            className="py-8 text-center text-xs"
            style={{
              color: 'var(--text-muted)',
              border: '1px dashed var(--border)',
              borderRadius: '4px',
            }}
          >
            No topics loaded for this month.
          </div>
        ) : (
          <div>
            {tasks.map((task, idx) => (
              <div
                key={task.id}
                className="grid items-center px-3 py-2.5 transition"
                style={{
                  gridTemplateColumns: '1fr auto auto auto',
                  gap: '16px',
                  borderTop: idx === 0 ? '1px solid var(--border)' : 'none',
                  borderBottom: '1px solid var(--border)',
                  borderLeft: '1px solid var(--border)',
                  borderRight: '1px solid var(--border)',
                  borderRadius: idx === 0 ? '4px 4px 0 0' : idx === tasks.length - 1 ? '0 0 4px 4px' : '0',
                  background: 'var(--surface-1)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-strong)';
                  (e.currentTarget as HTMLDivElement).style.background = '#1a1a1d';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLDivElement).style.background = 'var(--surface-1)';
                }}
              >
                {/* Topic name */}
                <Link
                  href={`/roadmap/task/${task.id}`}
                  className="text-xs font-medium transition truncate"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent)')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)')
                  }
                >
                  {task.title}
                </Link>

                {/* Priority tag */}
                <PriorityBadge priority={task.priority as any} />

                {/* Status pill */}
                <div>
                  <TopicStatusButton taskId={task.id} currentStatus={task.progress.status as any} />
                </div>

                {/* Duration (mono, right-aligned) */}
                <span
                  className="text-[10px] text-right whitespace-nowrap"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                >
                  {task.durationLabel ?? '—'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
