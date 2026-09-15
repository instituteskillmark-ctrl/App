'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { actionGetTimeBlockPlan } from '@/lib/actions/ai-actions';
import {
  Compass,
  ArrowRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FolderKanban,
  Target,
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

  const { whatNext, todaysFocus, confirmedWeaknesses, possibleWeaknesses, relevantProject } = intelligence;

  return (
    <div className="space-y-6">
      {/* Today's Recommended Action Banner */}
      <div className="bg-[#171c23] border border-[#252b34] rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#252b34] pb-3.5 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-[#12161c] border border-[#252b34] flex items-center justify-center">
              <Compass className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-[#f5f7fa] font-semibold text-xs uppercase tracking-wider">
              Today's Recommended Action
            </span>
          </div>
          <span className="text-[11px] text-[#9aa3af] bg-[#12161c] px-2.5 py-1 rounded-md border border-[#252b34] font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Recommended Step
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <h4 className="text-base lg:text-lg font-semibold text-[#f5f7fa] tracking-tight">{whatNext.title}</h4>
            <p className="text-xs text-[#9aa3af] leading-relaxed">{whatNext.description}</p>
          </div>

          <Link
            href={whatNext.taskId ? `/roadmap/task/${whatNext.taskId}` : '/roadmap'}
            className="px-5 py-2.5 bg-[#f5f7fa] hover:bg-white text-[#08090c] text-xs font-semibold rounded-lg transition whitespace-nowrap flex items-center justify-center gap-2 shrink-0 border border-white/20"
          >
            <span>Continue Learning</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Grid: Today's Roadmap Focus & Study Time Planner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Focus Step Plan */}
        <div className="bg-[#12161c] border border-[#252b34] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#252b34] pb-3">
            <h4 className="text-xs font-semibold text-[#f5f7fa] uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              Today's Focus
            </h4>
            <span className="text-[11px] text-[#66707c]">Curriculum Stage</span>
          </div>

          <div className="space-y-2.5">
            {todaysFocus.map((f, idx) => (
              <div key={idx} className="p-3 bg-[#171c23] rounded-lg border border-[#252b34] flex items-start space-x-3">
                <span className="text-xs font-semibold text-[#f5f7fa] whitespace-nowrap mt-0.5 bg-[#12161c] px-2 py-0.5 rounded border border-[#252b34]">
                  {f.stage}
                </span>
                <span className="text-xs text-[#9aa3af] leading-relaxed">{f.detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Study-Time Session Planner */}
        <div className="bg-[#12161c] border border-[#252b34] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#252b34] pb-3">
            <h4 className="text-xs font-semibold text-[#f5f7fa] uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#9aa3af]" />
              Session Planner
            </h4>
            <span className="text-[11px] text-[#66707c]">Available Time</span>
          </div>

          <div className="flex items-center space-x-2">
            {[30, 60, 120].map((mins) => (
              <button
                key={mins}
                onClick={() => handleSelectTime(mins)}
                disabled={isPending}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition border ${
                  selectedMinutes === mins
                    ? 'bg-[#171c23] text-[#f5f7fa] border-[#374151]'
                    : 'bg-[#0d1015] text-[#9aa3af] border-[#252b34] hover:bg-[#171c23]'
                }`}
              >
                {mins} Mins
              </button>
            ))}
          </div>

          {timePlan ? (
            <div className="space-y-2 pt-2 border-t border-[#252b34]">
              <span className="text-[11px] text-[#f5f7fa] font-medium block">
                {timePlan.availableMinutes}-Minute Time-Blocked Agenda:
              </span>
              <div className="space-y-1.5">
                {timePlan.blocks.map((b, idx) => (
                  <div key={idx} className="p-2.5 bg-[#171c23] rounded-lg border border-[#252b34] flex items-center justify-between text-xs">
                    <span className="text-[#9aa3af]">{b.activity}</span>
                    <span className="text-[#f5f7fa] font-semibold whitespace-nowrap ml-2">{b.time}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-[#66707c] border border-dashed border-[#252b34] rounded-lg bg-[#0d1015]/50">
              Select a time block (30m, 60m, 120m) to view a recommended study session agenda.
            </div>
          )}
        </div>
      </div>

      {/* Topics to Review & Active Project Integration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Topics to Review */}
        <div className="bg-[#12161c] border border-[#252b34] rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between border-b border-[#252b34] pb-3">
            <h4 className="text-xs font-semibold text-[#f5f7fa] uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Topics to Review
            </h4>
            <span className="text-[11px] text-[#9aa3af]">Assessment Audit</span>
          </div>

          {confirmedWeaknesses.length === 0 && possibleWeaknesses.length === 0 ? (
            <div className="p-4 bg-[#171c23] border border-[#252b34] rounded-lg text-xs text-[#9aa3af] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>All completed topics are assessment verified!</span>
            </div>
          ) : (
            <div className="space-y-2">
              {confirmedWeaknesses.map((w) => (
                <div key={w.taskId} className="p-3 bg-[#171c23] border border-rose-900/40 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-rose-300">
                    <span className="flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                      Needs Review: {w.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9aa3af] pl-5">{w.reason}</p>
                </div>
              ))}

              {possibleWeaknesses.map((w) => (
                <div key={w.taskId} className="p-3 bg-[#171c23] border border-amber-900/40 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-amber-300">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      Recommended Review: {w.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9aa3af] pl-5">{w.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Project Integration */}
        <div className="bg-[#12161c] border border-[#252b34] rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between border-b border-[#252b34] pb-3">
            <h4 className="text-xs font-semibold text-[#f5f7fa] uppercase tracking-wider flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-emerald-400" />
              Active Project Integration
            </h4>
            <span className="text-[11px] text-[#9aa3af]">
              Project {relevantProject.projectNumber}
            </span>
          </div>

          <div className="bg-[#171c23] p-4 rounded-lg border border-[#252b34] space-y-2">
            <h5 className="font-semibold text-sm text-[#f5f7fa]">{relevantProject.title}</h5>
            <p className="text-xs text-[#9aa3af] leading-relaxed">{relevantProject.description}</p>
            {relevantProject.techStack && (
              <span className="text-[11px] text-[#66707c] block mt-1">
                Tech: {relevantProject.techStack}
              </span>
            )}
            <div className="pt-2 border-t border-[#252b34] mt-3">
              <Link href="/projects" className="text-xs text-[#f5f7fa] hover:text-white flex items-center gap-1 font-semibold">
                <span>View Portfolio Projects</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#9aa3af]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


