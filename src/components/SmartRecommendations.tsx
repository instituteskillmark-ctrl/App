'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { actionGetTimeBlockPlan } from '@/lib/actions/ai-actions';

interface SmartRecommendationsProps {
  intelligence: {
    currentTask: {
      id: string;
      title: string;
      durationLabel?: string | null;
      priority: string;
      monthNumber: number;
    };
    relevantProject: {
      projectNumber: number;
      title: string;
      description: string;
      techStack?: string | null;
    };
    todaysFocus: { stage: string; detail: string }[];
    whatNext: {
      action: string;
      title: string;
      description: string;
      taskId?: string;
    };
    confirmedWeaknesses: { taskId: string; title: string; reason: string }[];
    possibleWeaknesses: { taskId: string; title: string; reason: string }[];
  };
}

export function SmartRecommendations({ intelligence }: SmartRecommendationsProps) {
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null);
  const [timePlan, setTimePlan] = useState<{ availableMinutes: number; blocks: { time: string; activity: string }[] } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSelectTime = (minutes: number) => {
    setSelectedMinutes(minutes);
    startTransition(async () => {
      const plan = await actionGetTimeBlockPlan(minutes);
      setTimePlan(plan);
    });
  };

  const { whatNext, todaysFocus, confirmedWeaknesses, possibleWeaknesses, relevantProject, currentTask } = intelligence;

  return (
    <div className="space-y-6">
      {/* What Next Recommendation Bar */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-cyan-900/60 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-cyan-400 font-bold">⚡ SMART NEXT STEP ENGINE</span>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2.5 py-0.5 rounded border border-cyan-800 font-bold">
            HIGH CONFIDENCE RECOMMENDATION
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-100">{whatNext.title}</h4>
            <p className="text-xs text-slate-400 font-mono">{whatNext.description}</p>
          </div>

          <Link
            href={whatNext.taskId ? `/roadmap/task/${whatNext.taskId}` : '/roadmap'}
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold rounded-lg transition shadow-md shadow-cyan-950 whitespace-nowrap"
          >
            Execute Next Action →
          </Link>
        </div>
      </div>

      {/* Grid: Today's Focus & Study Time Planner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Focus 4-Step Plan */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4">
          <h4 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
            TODAY'S PERSONALIZED FOCUS (ROADMAP POSITION)
          </h4>

          <div className="space-y-2.5">
            {todaysFocus.map((f, idx) => (
              <div key={idx} className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 flex items-start space-x-3">
                <span className="text-xs font-mono font-bold text-cyan-400 whitespace-nowrap mt-0.5">
                  {f.stage}
                </span>
                <span className="text-xs text-slate-200 font-mono">{f.detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Optional Study-Time Session Planner */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
              STUDY-TIME SESSION PLANNER
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">Select Available Time</span>
          </div>

          <div className="flex items-center space-x-2">
            {[30, 60, 120].map((mins) => (
              <button
                key={mins}
                onClick={() => handleSelectTime(mins)}
                disabled={isPending}
                className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold transition border ${
                  selectedMinutes === mins
                    ? 'bg-cyan-600 text-white border-cyan-500'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {mins} Mins
              </button>
            ))}
          </div>

          {timePlan ? (
            <div className="space-y-2 pt-2 border-t border-slate-900">
              <span className="text-[11px] font-mono text-cyan-400 font-semibold block">
                {timePlan.availableMinutes}-Minute Time-Blocked Session Plan:
              </span>
              <div className="space-y-1.5">
                {timePlan.blocks.map((b, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-900/80 rounded border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-200">{b.activity}</span>
                    <span className="text-slate-400 font-bold whitespace-nowrap ml-2">{b.time}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-500 font-mono border border-dashed border-slate-800 rounded-lg">
              Click a time block above (30m, 60m, 120m) to generate your structured session plan.
            </div>
          )}
        </div>
      </div>

      {/* Weakness Audit & Project Integration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weakness Detection */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
              WEAKNESS DETECTION ENGINE
            </h4>
            <span className="text-[10px] font-mono text-red-400 font-semibold">Evidence-Based</span>
          </div>

          {confirmedWeaknesses.length === 0 && possibleWeaknesses.length === 0 ? (
            <div className="p-4 bg-emerald-950/20 border border-emerald-900/50 rounded-lg text-xs font-mono text-emerald-300">
              ✓ Zero confirmed weaknesses detected. All completed topics are verified!
            </div>
          ) : (
            <div className="space-y-2">
              {confirmedWeaknesses.map((w) => (
                <div key={w.taskId} className="p-3 bg-red-950/40 border border-red-800/80 rounded-lg text-xs font-mono space-y-1">
                  <div className="flex items-center justify-between font-bold text-red-300">
                    <span>🔴 CONFIRMED WEAKNESS: {w.title}</span>
                  </div>
                  <p className="text-[11px] text-red-400">{w.reason}</p>
                </div>
              ))}

              {possibleWeaknesses.map((w) => (
                <div key={w.taskId} className="p-3 bg-amber-950/30 border border-amber-800/60 rounded-lg text-xs font-mono space-y-1">
                  <div className="flex items-center justify-between font-bold text-amber-300">
                    <span>🟡 POSSIBLE WEAKNESS: {w.title}</span>
                  </div>
                  <p className="text-[11px] text-amber-400">{w.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Project-Aware Learning Link */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
              PROJECT-AWARE LEARNING LINK
            </h4>
            <span className="text-[10px] font-mono text-cyan-400 font-semibold">
              Project {relevantProject.projectNumber}
            </span>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <h5 className="font-bold text-sm text-slate-100">{relevantProject.title}</h5>
            <p className="text-xs text-slate-400">{relevantProject.description}</p>
            {relevantProject.techStack && (
              <span className="text-[11px] font-mono text-cyan-300 block mt-1">
                Tech: {relevantProject.techStack}
              </span>
            )}
            <div className="pt-2">
              <Link href="/projects" className="text-xs font-mono text-cyan-400 hover:underline">
                View Project Stage Flow →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
