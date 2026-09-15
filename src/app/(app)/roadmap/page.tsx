import React from 'react';
import { Header } from '@/components/Header';
import { getRoadmapOverview } from '@/lib/services/roadmap';
import Link from 'next/link';

export const revalidate = 0;

export default async function RoadmapPage() {
  const months = await getRoadmapOverview();

  return (
    <div className="flex-1 pb-12">
      <Header
        title="AI Automation Developer Roadmap"
        subtitle="Upgraded & Complete Guide • 26 Weeks • Single Source of Truth"
      />

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Roadmap Legend */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Priority Levels</span>
            <div className="flex items-center space-x-4 text-xs font-mono">
              <span className="flex items-center text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></span> MASTER (Deeply learn & practice)
              </span>
              <span className="flex items-center text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5"></span> IMPORTANT (Usable in real projects)
              </span>
              <span className="flex items-center text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span> BASICS ENOUGH (Just enough to get by)
              </span>
            </div>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Total Duration: <span className="text-slate-200 font-bold">26 Weeks (~6 Months)</span>
          </div>
        </div>

        {/* Month Grid */}
        <div className="space-y-6">
          {months.map((m) => (
            <div
              key={m.id}
              className="bg-slate-950 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-slate-900 pb-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 text-xs font-mono font-semibold border border-cyan-800">
                      MONTH {m.monthNumber}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">{m.durationWeeks}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 mt-1">{m.title}</h3>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-xs text-slate-400 font-mono">{m.completedTasks} / {m.totalTasks} Done</div>
                    <div className="text-sm font-bold text-cyan-400 font-mono">{m.percentComplete}%</div>
                  </div>
                  <Link
                    href={`/roadmap/${m.monthNumber}`}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 transition"
                  >
                    Explore Month →
                  </Link>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-3 text-xs border border-slate-900">
                <span className="font-semibold text-slate-400 uppercase tracking-wider font-mono mr-2">Key Output:</span>
                <span className="text-slate-200 font-medium">{m.keyOutput}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
