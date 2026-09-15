import React from 'react';
import { Header } from '@/components/Header';
import { getMonthDetails } from '@/lib/services/roadmap';
import { PriorityBadge } from '@/components/PriorityBadge';
import { StatusBadge } from '@/components/StatusBadge';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TopicStatusButton } from '@/components/TopicStatusButton';
import { ArrowLeft, Clock, Target, CheckSquare, ArrowRight } from 'lucide-react';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ monthId: string }>;
}

export default async function MonthDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const monthNumber = parseInt(resolvedParams.monthId, 10);
  if (isNaN(monthNumber)) return notFound();

  const data = await getMonthDetails(monthNumber);
  if (!data) return notFound();

  const { month, tasks } = data;

  return (
    <div className="flex-1 pb-16">
      <Header
        title={`Month ${month.monthNumber}: ${month.title}`}
        subtitle={`Target Deliverable: ${month.keyOutput}`}
      />

      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Back + duration bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/roadmap"
            className="flex items-center gap-1.5 text-xs font-medium transition"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Roadmap
          </Link>
          <div
            className="flex items-center gap-1.5 text-xs px-3 py-1.5"
            style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              color: 'var(--text-secondary)',
            }}
          >
            <Clock className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            <span>
              Duration:{' '}
              <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {month.durationWeeks}
              </strong>
            </span>
          </div>
        </div>

        {/* Topics header */}
        <div
          className="flex items-center justify-between pb-3"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <span className="section-label flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
            Curriculum Topics ({tasks.length})
          </span>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Select topic to view or update status
          </span>
        </div>

        {/* Flat topic rows */}
        <div>
          {tasks.map((task, idx) => (
            <div
              key={task.id}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 py-4 transition"
              style={{
                background: 'var(--surface-1)',
                borderTop: idx === 0 ? '1px solid var(--border)' : 'none',
                borderBottom: '1px solid var(--border)',
                borderLeft: '1px solid var(--border)',
                borderRight: '1px solid var(--border)',
                borderRadius:
                  idx === 0
                    ? '4px 4px 0 0'
                    : idx === tasks.length - 1
                    ? '0 0 4px 4px'
                    : '0',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = '#1a1a1d';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = 'var(--surface-1)';
              }}
            >
              {/* Left: meta + title + subtasks */}
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <PriorityBadge priority={task.priority as any} />
                  {task.durationLabel && (
                    <span
                      className="text-[10px]"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                    >
                      {task.durationLabel}
                    </span>
                  )}
                </div>

                <Link
                  href={`/roadmap/task/${task.id}`}
                  className="text-sm font-semibold leading-tight flex items-center gap-1.5 transition"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {task.title}
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
                </Link>

                {task.subtasks.length > 0 && (
                  <div
                    className="mt-2 pl-3 py-2 pr-3 space-y-1"
                    style={{
                      borderLeft: '2px solid var(--border)',
                      background: 'var(--surface-0)',
                      borderRadius: '0 4px 4px 0',
                    }}
                  >
                    <span className="section-label flex items-center gap-1">
                      <CheckSquare className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                      Subtopics
                    </span>
                    <ul className="space-y-1">
                      {task.subtasks.map((st) => (
                        <li key={st.id} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                          <span style={{ color: 'var(--accent)' }}>•</span>
                          {st.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Right: status badge + status buttons + link */}
              <div
                className="flex flex-col md:items-end gap-2 shrink-0 pt-3 md:pt-0"
                style={{ borderTop: 'none' }}
              >
                <StatusBadge status={task.progress.status as any} />
                <TopicStatusButton taskId={task.id} currentStatus={task.progress.status as any} />
                <Link
                  href={`/roadmap/task/${task.id}`}
                  className="flex items-center gap-1 text-[10px] font-semibold transition"
                  style={{ color: 'var(--accent)' }}
                >
                  Open Task Workspace
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
