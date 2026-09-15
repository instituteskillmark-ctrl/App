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
    <div className="space-y-5">
      {/* Grid: Focus Steps + Session Planner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Today's Focus Steps */}
        <div
          className="p-5 space-y-3"
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
          }}
        >
          <div
            className="flex items-center justify-between pb-3"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <span className="section-label flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
              Today's Focus
            </span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              Curriculum Stage
            </span>
          </div>

          <div className="space-y-2">
            {todaysFocus.map((f, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 px-3 py-2.5"
                style={{
                  background: 'var(--surface-0)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                }}
              >
                <span
                  className="text-[10px] font-semibold mt-0.5 whitespace-nowrap px-1.5 py-0.5"
                  style={{
                    background: 'var(--accent-bg)',
                    color: 'var(--accent)',
                    borderRadius: '3px',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {f.stage}
                </span>
                <span className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {f.detail}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Session Planner */}
        <div
          className="p-5 space-y-3"
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
          }}
        >
          <div
            className="flex items-center justify-between pb-3"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <span className="section-label flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              Session Planner
            </span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              Pick available time
            </span>
          </div>

          <div className="flex items-center gap-2">
            {[30, 60, 120].map((mins) => (
              <button
                key={mins}
                onClick={() => handleSelectTime(mins)}
                disabled={isPending}
                className="flex-1 py-2 text-xs font-semibold transition"
                style={{
                  borderRadius: '4px',
                  background: selectedMinutes === mins ? 'var(--accent-bg)' : 'var(--surface-0)',
                  color: selectedMinutes === mins ? 'var(--accent)' : 'var(--text-muted)',
                  border: `1px solid ${selectedMinutes === mins ? 'var(--accent)' : 'var(--border)'}`,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {mins}m
              </button>
            ))}
          </div>

          {timePlan ? (
            <div className="space-y-1.5 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
              <span className="text-[10px] font-medium block" style={{ color: 'var(--text-secondary)' }}>
                {timePlan.availableMinutes}-min time-blocked plan:
              </span>
              {timePlan.blocks.map((b, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-2.5 py-2 text-xs"
                  style={{
                    background: 'var(--surface-0)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>{b.activity}</span>
                  <span
                    className="font-semibold ml-2"
                    style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
                  >
                    {b.time}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="py-5 text-center text-[10px]"
              style={{
                color: 'var(--text-muted)',
                border: '1px dashed var(--border)',
                borderRadius: '4px',
              }}
            >
              Select 30m, 60m, or 120m to generate a study agenda.
            </div>
          )}
        </div>
      </div>

      {/* Topics to Review + Active Project */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Topics to Review */}
        <div
          className="p-5 space-y-3"
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
          }}
        >
          <div
            className="flex items-center justify-between pb-3"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <span className="section-label flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" style={{ color: 'var(--priority-important)' }} />
              Topics to Review
            </span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              Assessment Audit
            </span>
          </div>

          {confirmedWeaknesses.length === 0 && possibleWeaknesses.length === 0 ? (
            <div
              className="px-3 py-2.5 flex items-center gap-2 text-xs"
              style={{
                background: 'var(--surface-0)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
              }}
            >
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--status-completed)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>All completed topics are verified!</span>
            </div>
          ) : (
            <div className="space-y-2">
              {confirmedWeaknesses.map((w) => (
                <div
                  key={w.taskId}
                  className="px-3 py-2.5 text-xs space-y-1"
                  style={{
                    background: 'var(--priority-master-bg)',
                    border: '1px solid rgba(226,75,74,0.2)',
                    borderRadius: '4px',
                  }}
                >
                  <div className="flex items-center gap-1.5 font-semibold" style={{ color: 'var(--priority-master)' }}>
                    <AlertCircle className="w-3.5 h-3.5" />
                    Needs Review: {w.title}
                  </div>
                  <p className="pl-5 text-[10px]" style={{ color: 'var(--text-secondary)' }}>{w.reason}</p>
                </div>
              ))}
              {possibleWeaknesses.map((w) => (
                <div
                  key={w.taskId}
                  className="px-3 py-2.5 text-xs space-y-1"
                  style={{
                    background: 'var(--priority-important-bg)',
                    border: '1px solid rgba(239,159,39,0.2)',
                    borderRadius: '4px',
                  }}
                >
                  <div className="flex items-center gap-1.5 font-semibold" style={{ color: 'var(--priority-important)' }}>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Recommended Review: {w.title}
                  </div>
                  <p className="pl-5 text-[10px]" style={{ color: 'var(--text-secondary)' }}>{w.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Project */}
        <div
          className="p-5 space-y-3"
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
          }}
        >
          <div
            className="flex items-center justify-between pb-3"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <span className="section-label flex items-center gap-1.5">
              <FolderKanban className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              Active Project
            </span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Project {relevantProject.projectNumber}
            </span>
          </div>

          <div
            className="p-4 space-y-2"
            style={{
              background: 'var(--surface-0)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
            }}
          >
            <h5 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              {relevantProject.title}
            </h5>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {relevantProject.description}
            </p>
            {relevantProject.techStack && (
              <span
                className="text-[10px] block mt-1"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
              >
                {relevantProject.techStack}
              </span>
            )}
            <div className="pt-2" style={{ borderTop: '1px solid var(--border)', marginTop: '8px' }}>
              <Link
                href="/projects"
                className="flex items-center gap-1 text-xs font-semibold transition"
                style={{ color: 'var(--accent)' }}
              >
                View Portfolio Projects
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
