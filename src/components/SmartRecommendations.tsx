'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { actionGetTimeBlockPlan } from '@/lib/actions/ai-actions';
import {
  Zap,
  ArrowRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FolderKanban,
  Target,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

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
      {/* What Next Recommendation Hero Banner */}
      <div className="bg-gradient-to-r from-[#0c1527] via-[#0f1b33] to-[#0c1527] border border-cyan-800/60 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-cyan-300 font-bold text-xs font-mono tracking-wider">
              SMART NEXT STEP ENGINE
            </span>
          </div>
          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded-md border border-cyan-800 font-bold uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            HIGH CONFIDENCE ACTION
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <h4 className="text-base lg:text-lg font-bold text-slate-100 tracking-tight">{whatNext.title}</h4>
            <p className="text-xs text-slate-400 font-mono leading-relaxed">{whatNext.description}</p>
          </div>

          <Link
            href={whatNext.taskId ? `/roadmap/task/${whatNext.taskId}` : '/roadmap'}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold rounded-lg transition shadow-lg shadow-cyan-950/60 whitespace-nowrap flex items-center justify-center gap-2 shrink-0 border border-cyan-400/30"
          >
            <span>Execute Next Action</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Grid: Today's Focus & Study Time Planner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Focus 4-Step Plan */}
        <div className="bg-[#0e1420] border border-slate-800/80 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              TODAY'S ROADMAP FOCUS
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">Curriculum Position</span>
          </div>

          <div className="space-y-2.5">
            {todaysFocus.map((f, idx) => (
              <div key={idx} className="p-3 bg-[#090d18] rounded-lg border border-slate-800/80 flex items-start space-x-3">
                <span className="text-xs font-mono font-bold text-cyan-400 whitespace-nowrap mt-0.5 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                  {f.stage}
                </span>
                <span className="text-xs text-slate-200 font-mono leading-relaxed">{f.detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Optional Study-Time Session Planner */}
        <div className="bg-[#0e1420] border border-slate-800/80 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              SESSION TIME-BLOCK PLANNER
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">Available Time</span>
          </div>

          <div className="flex items-center space-x-2">
            {[30, 60, 120].map((mins) => (
              <button
                key={mins}
                onClick={() => handleSelectTime(mins)}
                disabled={isPending}
                className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold transition border ${
                  selectedMinutes === mins
                    ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-950'
                    : 'bg-[#090d18] text-slate-300 border-slate-800 hover:bg-[#111827]'
                }`}
              >
                {mins} Mins
              </button>
            ))}
          </div>

          {timePlan ? (
            <div className="space-y-2 pt-2 border-t border-slate-800/60">
              <span className="text-[11px] font-mono text-cyan-300 font-semibold block">
                {timePlan.availableMinutes}-Minute Time-Blocked Agenda:
              </span>
              <div className="space-y-1.5">
                {timePlan.blocks.map((b, idx) => (
                  <div key={idx} className="p-2.5 bg-[#090d18] rounded-lg border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-200">{b.activity}</span>
                    <span className="text-cyan-400 font-bold whitespace-nowrap ml-2">{b.time}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400 font-mono border border-dashed border-slate-800/80 rounded-lg bg-[#090d18]/50">
              Click a time block above (30m, 60m, 120m) to generate an AI-optimized focus session plan.
            </div>
          )}
        </div>
      </div>

      {/* Weakness Audit & Project Integration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weakness Detection */}
        <div className="bg-[#0e1420] border border-slate-800/80 rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              WEAKNESS DETECTION AUDIT
            </h4>
            <span className="text-[10px] font-mono text-amber-400 font-semibold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
              Evidence-Based
            </span>
          </div>

          {confirmedWeaknesses.length === 0 && possibleWeaknesses.length === 0 ? (
            <div className="p-4 bg-emerald-950/30 border border-emerald-800/60 rounded-lg text-xs font-mono text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>✓ Zero confirmed weaknesses. All completed topics are assessment verified!</span>
            </div>
          ) : (
            <div className="space-y-2">
              {confirmedWeaknesses.map((w) => (
                <div key={w.taskId} className="p-3 bg-rose-950/30 border border-rose-800/60 rounded-lg text-xs font-mono space-y-1">
                  <div className="flex items-center justify-between font-bold text-rose-300">
                    <span className="flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                      CONFIRMED WEAKNESS: {w.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-400/90 pl-5">{w.reason}</p>
                </div>
              ))}

              {possibleWeaknesses.map((w) => (
                <div key={w.taskId} className="p-3 bg-amber-950/30 border border-amber-800/60 rounded-lg text-xs font-mono space-y-1">
                  <div className="flex items-center justify-between font-bold text-amber-300">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      POSSIBLE WEAKNESS: {w.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-400/90 pl-5">{w.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Project-Aware Learning Link */}
        <div className="bg-[#0e1420] border border-slate-800/80 rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-cyan-400" />
              PROJECT-AWARE INTEGRATION
            </h4>
            <span className="text-[10px] font-mono text-cyan-400 font-semibold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
              Project {relevantProject.projectNumber}
            </span>
          </div>

          <div className="bg-[#090d18] p-4 rounded-xl border border-slate-800/80 space-y-2">
            <h5 className="font-bold text-sm text-slate-100">{relevantProject.title}</h5>
            <p className="text-xs text-slate-400 leading-relaxed">{relevantProject.description}</p>
            {relevantProject.techStack && (
              <span className="text-[11px] font-mono text-cyan-300 block mt-1">
                Tech: {relevantProject.techStack}
              </span>
            )}
            <div className="pt-2 border-t border-slate-800/60 mt-3">
              <Link href="/projects" className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold">
                <span>View Portfolio Project Stage Flow</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

