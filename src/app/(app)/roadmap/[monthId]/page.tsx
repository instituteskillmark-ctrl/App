import React from 'react';
import { Header } from '@/components/Header';
import { getMonthDetails } from '@/lib/services/roadmap';
import { PriorityBadge } from '@/components/PriorityBadge';
import { StatusBadge } from '@/components/StatusBadge';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TopicStatusButton } from '@/components/TopicStatusButton';

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

  const { month, weeks, tasks } = data;

  return (
    <div className="flex-1 pb-12">
      <Header
        title={`Month ${month.monthNumber}: ${month.title}`}
        subtitle={`Target Output: ${month.keyOutput}`}
      />

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/roadmap" className="text-xs text-slate-400 hover:text-slate-200 font-mono">
            ← Back to All Months
          </Link>
          <div className="text-xs text-slate-400 font-mono">
            Duration: <span className="text-slate-200 font-semibold">{month.durationWeeks}</span>
          </div>
        </div>

        {/* Topics List */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider font-mono">
            Curriculum Topics & Tasks ({tasks.length})
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-3">
                    <PriorityBadge priority={task.priority as any} />
                    {task.durationLabel && (
                      <span className="text-xs text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {task.durationLabel}
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-slate-100">{task.title}</h4>

                  {task.subtasks.length > 0 && (
                    <div className="mt-3 pl-3 border-l-2 border-slate-800 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                        Subtasks / Subtopics:
                      </span>
                      <ul className="text-xs text-slate-300 space-y-1 font-mono">
                        {task.subtasks.map((st) => (
                          <li key={st.id} className="flex items-center space-x-2">
                            <span className="text-cyan-500">•</span>
                            <span>{st.title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end space-y-3">
                  <StatusBadge status={task.progress.status as any} />
                  <TopicStatusButton taskId={task.id} currentStatus={task.progress.status as any} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
