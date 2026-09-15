import React from 'react';
import { Header } from '@/components/Header';
import { getMonthDetails } from '@/lib/services/roadmap';
import { PriorityBadge } from '@/components/PriorityBadge';
import { StatusBadge } from '@/components/StatusBadge';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TopicStatusButton } from '@/components/TopicStatusButton';
import { ArrowLeft, Clock, Target, CheckSquare, ChevronRight, ArrowRight } from 'lucide-react';

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
    <div className="flex-1 pb-16">
      <Header
        title={`Month ${month.monthNumber}: ${month.title}`}
        subtitle={`Target Deliverable: ${month.keyOutput}`}
      />

      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/roadmap"
            className="text-xs text-[#9aa3af] hover:text-[#f5f7fa] flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Roadmap Months</span>
          </Link>
          <div className="text-xs text-[#9aa3af] flex items-center gap-1.5 bg-[#12161c] px-3 py-1.5 rounded-lg border border-[#252b34]">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Duration: <strong className="text-[#f5f7fa]">{month.durationWeeks}</strong></span>
          </div>
        </div>

        {/* Topics List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#252b34] pb-3">
            <h3 className="text-xs font-semibold text-[#f5f7fa] uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              CURRICULUM TOPICS & TASK SPECIFICATIONS ({tasks.length})
            </h3>
            <span className="text-xs text-[#66707c]">Select topic to view or update status</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-[#12161c] border border-[#252b34] rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#384150] transition"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex items-center space-x-3">
                    <PriorityBadge priority={task.priority as any} />
                    {task.durationLabel && (
                      <span className="text-xs text-[#9aa3af] bg-[#0d1015] px-2.5 py-0.5 rounded-md border border-[#252b34]">
                        {task.durationLabel}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Link
                      href={`/roadmap/task/${task.id}`}
                      className="text-base font-bold text-[#f5f7fa] hover:text-emerald-400 transition flex items-center gap-2"
                    >
                      <span>{task.title}</span>
                      <ArrowRight className="w-4 h-4 text-[#66707c] hover:text-emerald-400" />
                    </Link>
                  </div>

                  {task.subtasks.length > 0 && (
                    <div className="mt-3 pl-3 border-l-2 border-[#252b34] space-y-1.5 bg-[#0d1015] p-3 rounded-r-lg">
                      <span className="text-[10px] font-semibold text-[#9aa3af] uppercase tracking-wider flex items-center gap-1">
                        <CheckSquare className="w-3 h-3 text-emerald-400" />
                        SUBTOPICS & PRACTICAL TASKS:
                      </span>
                      <ul className="text-xs text-[#9aa3af] space-y-1">
                        {task.subtasks.map((st) => (
                          <li key={st.id} className="flex items-center space-x-2">
                            <span className="text-emerald-400">•</span>
                            <span>{st.title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex flex-col md:items-end space-y-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#252b34]">
                  <StatusBadge status={task.progress.status as any} />
                  <TopicStatusButton taskId={task.id} currentStatus={task.progress.status as any} />
                  <Link
                    href={`/roadmap/task/${task.id}`}
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-1 pt-1"
                  >
                    <span>Open Task Workspace</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

