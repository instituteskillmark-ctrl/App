'use client';

import React, { useState, useTransition } from 'react';
import { PriorityBadge } from '@/components/PriorityBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { StudyTimer } from '@/components/StudyTimer';
import { AssessmentQuiz } from '@/components/AssessmentQuiz';
import {
  actionUpdateTaskStatus,
  actionUpdateTaskStage,
  actionToggleSubtask,
  actionCreateNote,
} from '@/lib/actions/app-actions';
import {
  CheckCircle2,
  Clock,
  BookOpen,
  FileText,
  HelpCircle,
  CheckSquare,
  Plus,
  Loader2,
  Layers,
  ArrowRight,
  AlertTriangle,
  Award,
  Sparkles,
  Code2,
  Hammer,
  Play,
  RotateCcw,
} from 'lucide-react';
import Link from 'next/link';

export type TaskStage = 'LEARN' | 'PRACTICE' | 'BUILD' | 'TEST' | 'VERIFY' | 'COMPLETE';
export type TopicStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'NEEDS_REVISION' | 'COMPLETED' | 'VERIFIED';

interface Subtask {
  id: string;
  title: string;
  orderIndex: number;
}

interface NextTaskData {
  id: string;
  title: string;
  monthNumber: number;
  monthTitle: string;
  weekNumber: number;
  weekTitle: string;
  priority: 'MASTER' | 'IMPORTANT' | 'BASICS_ENOUGH';
  durationLabel?: string | null;
}

interface TaskDetailViewProps {
  task: {
    id: string;
    title: string;
    durationLabel?: string | null;
    priority: 'MASTER' | 'IMPORTANT' | 'BASICS_ENOUGH';
    description?: string | null;
    monthNumber: number;
    monthTitle: string;
    weekNumber: number;
    weekTitle: string;
    subtasks: Subtask[];
    subtaskProgressMap: Record<string, boolean>;
    progress: {
      status: TopicStatus;
      currentStage: TaskStage;
    };
    assessment?: any;
    notes?: any[];
    nextTask?: NextTaskData | null;
  };
}

const STAGES: { id: TaskStage; label: string; description: string; icon: React.ElementType }[] = [
  { id: 'LEARN', label: '1. Learn', description: 'Understand core concepts', icon: BookOpen },
  { id: 'PRACTICE', label: '2. Practice', description: 'Complete subtasks checklist', icon: CheckSquare },
  { id: 'BUILD', label: '3. Build', description: 'Apply concepts hands-on', icon: Hammer },
  { id: 'TEST', label: '4. Test', description: 'Pre-verification self check', icon: Code2 },
  { id: 'VERIFY', label: '5. Verify', description: 'Pass assessment test', icon: Award },
];

function getStageIndex(stage?: TaskStage): number {
  switch (stage) {
    case 'LEARN': return 0;
    case 'PRACTICE': return 1;
    case 'BUILD': return 2;
    case 'TEST': return 3;
    case 'VERIFY': return 4;
    case 'COMPLETE': return 5;
    default: return 0;
  }
}

export function TaskDetailView({ task }: TaskDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'WORKSPACE' | 'TIMER' | 'NOTES'>('WORKSPACE');
  const [subtaskState, setSubtaskState] = useState<Record<string, boolean>>(
    task.subtaskProgressMap || {}
  );

  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isPending, startTransition] = useTransition();

  const currentStatus = task.progress?.status || 'NOT_STARTED';
  const currentStage = task.progress?.currentStage || 'LEARN';
  const currentStageIdx = getStageIndex(currentStage);

  const handleStartTask = () => {
    startTransition(async () => {
      await actionUpdateTaskStatus(task.id, 'IN_PROGRESS');
      await actionUpdateTaskStage(task.id, 'LEARN');
    });
  };

  const handleSetStage = (targetStage: TaskStage) => {
    if (currentStatus === 'NOT_STARTED') {
      handleStartTask();
      return;
    }
    startTransition(async () => {
      await actionUpdateTaskStage(task.id, targetStage);
    });
  };

  const handleToggleSubtask = (subtaskId: string) => {
    const nextVal = !subtaskState[subtaskId];
    setSubtaskState((prev) => ({ ...prev, [subtaskId]: nextVal }));

    startTransition(async () => {
      await actionToggleSubtask(subtaskId, task.id, nextVal);
    });
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;
    startTransition(async () => {
      await actionCreateNote(noteTitle, noteContent, 'task-note', task.id);
      setNoteTitle('');
      setNoteContent('');
    });
  };

  const completedSubtasksCount = task.subtasks.filter((st) => subtaskState[st.id]).length;
  const isAllSubtasksDone = task.subtasks.length > 0 && completedSubtasksCount === task.subtasks.length;

  return (
    <div className="space-y-6">
      {/* 1. TASK HEADER CARD */}
      <div
        className="p-5 sm:p-6 space-y-4"
        style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--border)',
          borderRadius: '4px',
        }}
      >
        {/* Hierarchy Context */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono border-b pb-3" style={{ borderColor: 'var(--border)' }}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded font-semibold text-[11px]" style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', color: 'var(--accent)' }}>
              MONTH {task.monthNumber}
            </span>
            <span className="text-slate-400">•</span>
            <span className="font-semibold text-slate-300">
              WEEK {task.weekNumber}: {task.weekTitle}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <PriorityBadge priority={task.priority} />
            {task.durationLabel && (
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                {task.durationLabel}
              </span>
            )}
          </div>
        </div>

        {/* Title & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {task.title}
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Official Roadmap Execution Unit
            </p>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={currentStatus} />
            {currentStatus === 'NOT_STARTED' && (
              <button
                onClick={handleStartTask}
                disabled={isPending}
                className="px-4 py-2 text-xs font-semibold rounded bg-purple-600 hover:bg-purple-500 text-white transition flex items-center gap-1.5 shadow-md"
              >
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                START TASK
              </button>
            )}
          </div>
        </div>

        {/* Task Objective Description */}
        {task.description && (
          <div
            className="p-3.5 text-xs leading-relaxed rounded text-slate-300"
            style={{
              background: 'var(--surface-0)',
              border: '1px solid var(--border)',
            }}
          >
            <span className="font-semibold text-slate-200 block mb-1 font-mono uppercase tracking-wider text-[10px]">
              Task Objective & Scope:
            </span>
            {task.description}
          </div>
        )}
      </div>

      {/* 2. NEEDS REVISION ALERT BANNER */}
      {currentStatus === 'NEEDS_REVISION' && (
        <div
          className="p-4 rounded border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 0.3)',
            color: '#f87171',
          }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
            <div className="space-y-0.5 text-xs">
              <h4 className="font-bold text-red-300">REVISION REQUIRED</h4>
              <p className="text-red-400/90 leading-relaxed">
                Verification score did not meet the 80% passing threshold. Please return to the Learn and Practice stages to review key concepts before attempting verification again.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleSetStage('PRACTICE')}
            disabled={isPending}
            className="px-3.5 py-1.5 text-xs font-semibold rounded bg-red-950/80 hover:bg-red-900 border border-red-700/50 text-red-200 transition shrink-0 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Return to Practice
          </button>
        </div>
      )}

      {/* 3. TASK COMPLETED / VERIFIED BANNER */}
      {(currentStatus === 'COMPLETED' || currentStatus === 'VERIFIED') && (
        <div
          className="p-5 rounded border space-y-4"
          style={{
            background: 'rgba(16, 185, 129, 0.08)',
            borderColor: 'rgba(16, 185, 129, 0.25)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-950/80 border border-emerald-600/50 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wide">
                  TASK {currentStatus === 'VERIFIED' ? 'VERIFIED' : 'COMPLETED'}
                </span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-white">
                Great job! You have satisfied all requirements for this task.
              </h3>
            </div>
          </div>

          {/* Next Task Connection Card */}
          {task.nextTask ? (
            <div
              className="p-4 rounded border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition"
              style={{
                background: 'var(--surface-1)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-purple-400 uppercase tracking-wider font-semibold">
                  Up Next in Roadmap • Month {task.nextTask.monthNumber} (Week {task.nextTask.weekNumber})
                </div>
                <h4 className="text-sm font-bold text-white">
                  {task.nextTask.title}
                </h4>
                <div className="flex items-center gap-2 pt-0.5">
                  <PriorityBadge priority={task.nextTask.priority} />
                  {task.nextTask.durationLabel && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {task.nextTask.durationLabel}
                    </span>
                  )}
                </div>
              </div>

              <Link
                href={`/roadmap/task/${task.nextTask.id}`}
                className="px-5 py-2.5 text-xs font-semibold rounded bg-purple-600 hover:bg-purple-500 text-white transition flex items-center gap-2 shrink-0 shadow"
              >
                CONTINUE TO NEXT TASK
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="p-4 rounded bg-purple-950/30 border border-purple-800/40 text-center space-y-1">
              <span className="text-lg">🎉</span>
              <h4 className="text-sm font-bold text-purple-200">
                ROADMAP COMPLETE!
              </h4>
              <p className="text-xs text-purple-300/80">
                You have reached the final task of the 6-Month AI Automation Developer Roadmap!
              </p>
            </div>
          )}
        </div>
      )}

      {/* 4. LEARNING STAGE STEPPER BAR */}
      <div
        className="p-4 space-y-3"
        style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--border)',
          borderRadius: '4px',
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 font-mono flex items-center gap-2 uppercase tracking-wider">
            <Layers className="w-4 h-4 text-purple-400" />
            Learning Workflow Stages
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            Current Stage: <span className="text-purple-300 font-bold">{currentStage}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {STAGES.map((s, idx) => {
            const isActive = currentStage === s.id;
            const isDone = currentStageIdx > idx || currentStatus === 'COMPLETED' || currentStatus === 'VERIFIED';
            const Icon = s.icon;

            return (
              <button
                key={s.id}
                onClick={() => handleSetStage(s.id)}
                disabled={isPending}
                className="p-3 text-left rounded transition flex flex-col justify-between gap-2 relative overflow-hidden"
                style={{
                  background: isActive
                    ? 'rgba(147, 51, 234, 0.15)'
                    : isDone
                    ? 'var(--surface-0)'
                    : 'var(--surface-0)',
                  border: isActive
                    ? '1px solid rgba(147, 51, 234, 0.6)'
                    : isDone
                    ? '1px solid rgba(16, 185, 129, 0.3)'
                    : '1px solid var(--border)',
                  opacity: currentStatus === 'NOT_STARTED' && idx > 0 ? 0.6 : 1,
                }}
              >
                <div className="flex items-center justify-between">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? 'text-purple-400'
                        : isDone
                        ? 'text-emerald-400'
                        : 'text-slate-500'
                    }`}
                  />
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div>
                  <div
                    className={`text-xs font-semibold ${
                      isActive ? 'text-purple-300' : isDone ? 'text-slate-200' : 'text-slate-400'
                    }`}
                  >
                    {s.label}
                  </div>
                  <div className="text-[10px] text-slate-500 line-clamp-1">
                    {s.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. MAIN NAVIGATION TABS */}
      <div
        className="flex gap-4 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        {[
          { id: 'WORKSPACE', label: 'Guided Execution Workspace', icon: BookOpen },
          { id: 'TIMER', label: 'Study Timer', icon: Clock },
          { id: 'NOTES', label: `Task Notes (${task.notes?.length ?? 0})`, icon: FileText },
        ].map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className="flex items-center gap-2 pb-2.5 text-xs font-semibold transition border-b-2 font-mono"
              style={{
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                borderColor: isActive ? 'var(--accent)' : 'transparent',
                marginBottom: '-1px',
              }}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          );
        })}
      </div>

      {/* 6. TAB CONTENT */}
      {activeTab === 'WORKSPACE' && (
        <div className="space-y-6">
          {/* STAGE 1 — LEARN */}
          {currentStage === 'LEARN' && (
            <div
              className="p-5 sm:p-6 space-y-4 rounded"
              style={{
                background: 'var(--surface-1)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-purple-950/80 border border-purple-700/40 flex items-center justify-center text-purple-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">STEP 1 — LEARN</h3>
                    <p className="text-xs text-slate-400">Understand the foundational theory and domain concepts.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-slate-300">
                <p>
                  Before diving into practice or building, carefully study the topic objectives and review the core principles required for <strong className="text-white">{task.title}</strong>.
                </p>
                {task.description && (
                  <div className="p-4 rounded bg-[#0b0e14] border border-[#1b202a] text-slate-300 font-mono text-[11px]">
                    <div className="text-purple-400 font-bold uppercase mb-1">Curriculum Topic Focus:</div>
                    {task.description}
                  </div>
                )}
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  onClick={() => handleSetStage('PRACTICE')}
                  disabled={isPending}
                  className="px-5 py-2.5 text-xs font-semibold rounded bg-purple-600 hover:bg-purple-500 text-white transition flex items-center gap-2"
                >
                  Complete Learn → Move to Practice
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 2 — PRACTICE */}
          {currentStage === 'PRACTICE' && (
            <div
              className="p-5 sm:p-6 space-y-5 rounded"
              style={{
                background: 'var(--surface-1)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-purple-950/80 border border-purple-700/40 flex items-center justify-center text-purple-400">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">STEP 2 — PRACTICE</h3>
                    <p className="text-xs text-slate-400">Execute and check off official roadmap subtasks.</p>
                  </div>
                </div>

                {task.subtasks.length > 0 && (
                  <div className="text-xs font-mono text-purple-300 bg-purple-950/60 border border-purple-800/40 px-3 py-1 rounded">
                    {completedSubtasksCount} / {task.subtasks.length} Subtasks Done
                  </div>
                )}
              </div>

              {task.subtasks.length === 0 ? (
                <div
                  className="py-8 text-center space-y-2 text-xs rounded"
                  style={{
                    color: 'var(--text-muted)',
                    border: '1px dashed var(--border)',
                  }}
                >
                  <CheckSquare className="w-6 h-6 mx-auto text-slate-500" />
                  <p>No explicit subtasks listed for this roadmap task.</p>
                  <p className="text-slate-400">You may proceed directly to hands-on building.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {task.subtasks.map((st) => {
                    const isChecked = !!subtaskState[st.id];
                    return (
                      <label
                        key={st.id}
                        onClick={() => handleToggleSubtask(st.id)}
                        className={`flex items-start gap-3 p-3.5 rounded border text-xs cursor-pointer transition ${
                          isChecked
                            ? 'bg-purple-950/20 border-purple-800/40 text-slate-200'
                            : 'bg-zinc-900/60 border-zinc-800 text-slate-300 hover:bg-zinc-800/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by parent onClick
                          className="w-4 h-4 mt-0.5 rounded accent-purple-500 shrink-0 cursor-pointer"
                        />
                        <span className={`leading-relaxed ${isChecked ? 'line-through text-slate-400' : ''}`}>
                          {st.title}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}

              <div className="pt-3 flex items-center justify-between">
                <button
                  onClick={() => handleSetStage('LEARN')}
                  disabled={isPending}
                  className="px-4 py-2 text-xs font-semibold rounded text-slate-400 hover:text-white transition"
                >
                  ← Back to Learn
                </button>

                <button
                  onClick={() => handleSetStage('BUILD')}
                  disabled={isPending}
                  className="px-5 py-2.5 text-xs font-semibold rounded bg-purple-600 hover:bg-purple-500 text-white transition flex items-center gap-2"
                >
                  Complete Practice → Move to Build
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 3 — BUILD */}
          {currentStage === 'BUILD' && (
            <div
              className="p-5 sm:p-6 space-y-5 rounded"
              style={{
                background: 'var(--surface-1)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-purple-950/80 border border-purple-700/40 flex items-center justify-center text-purple-400">
                    <Hammer className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">STEP 3 — BUILD</h3>
                    <p className="text-xs text-slate-400">Build, configure, or construct practical artifacts for this task.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <p>
                  Put concepts into real execution. Construct workflows, set up local environments, test APIs, or write automation scripts for <strong className="text-white">{task.title}</strong>.
                </p>

                <div className="p-4 rounded bg-[#0b0e14] border border-[#1b202a] space-y-2">
                  <div className="flex items-center gap-2 text-purple-400 font-mono text-[11px] font-bold">
                    <Code2 className="w-3.5 h-3.5" />
                    Practical Implementation Checklist:
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-slate-300 font-mono text-[11px]">
                    <li>Construct or execute practical setup for this topic.</li>
                    <li>Record debugging notes or code snippets in Task Notes if needed.</li>
                    <li>Verify configuration inputs and system outputs locally.</li>
                  </ul>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <button
                  onClick={() => handleSetStage('PRACTICE')}
                  disabled={isPending}
                  className="px-4 py-2 text-xs font-semibold rounded text-slate-400 hover:text-white transition"
                >
                  ← Back to Practice
                </button>

                <button
                  onClick={() => handleSetStage('TEST')}
                  disabled={isPending}
                  className="px-5 py-2.5 text-xs font-semibold rounded bg-purple-600 hover:bg-purple-500 text-white transition flex items-center gap-2"
                >
                  Complete Build → Move to Self-Test
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 4 — TEST */}
          {currentStage === 'TEST' && (
            <div
              className="p-5 sm:p-6 space-y-5 rounded"
              style={{
                background: 'var(--surface-1)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-purple-950/80 border border-purple-700/40 flex items-center justify-center text-purple-400">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">STEP 4 — TEST</h3>
                    <p className="text-xs text-slate-400">Self-check work and verify topic readiness before assessment.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  Perform final checks on your implementation and readiness for assessment verification.
                </p>

                <div className="p-4 rounded bg-[#0b0e14] border border-[#1b202a] space-y-2">
                  <div className="text-emerald-400 font-mono font-bold text-[11px]">Readiness Verification Criteria:</div>
                  <div className="space-y-1.5 text-slate-300 text-[11px]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>All subtasks completed and verified.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Key concepts and error mechanisms understood.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Ready to undertake knowledge verification test.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <button
                  onClick={() => handleSetStage('BUILD')}
                  disabled={isPending}
                  className="px-4 py-2 text-xs font-semibold rounded text-slate-400 hover:text-white transition"
                >
                  ← Back to Build
                </button>

                <button
                  onClick={() => handleSetStage('VERIFY')}
                  disabled={isPending}
                  className="px-5 py-2.5 text-xs font-semibold rounded bg-purple-600 hover:bg-purple-500 text-white transition flex items-center gap-2"
                >
                  Proceed to Verification
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 5 — VERIFY */}
          {currentStage === 'VERIFY' && (
            <div
              className="p-5 sm:p-6 space-y-5 rounded"
              style={{
                background: 'var(--surface-1)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-emerald-950/80 border border-emerald-700/40 flex items-center justify-center text-emerald-400">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">STEP 5 — VERIFY</h3>
                    <p className="text-xs text-slate-400">Complete formal knowledge assessment to confirm topic mastery.</p>
                  </div>
                </div>
              </div>

              {task.assessment && task.assessment.questions?.length > 0 ? (
                <AssessmentQuiz
                  assessmentId={task.assessment.assessment.id}
                  taskId={task.id}
                  title={task.title}
                  questions={task.assessment.questions}
                />
              ) : (
                <div className="space-y-4 text-xs text-slate-300">
                  <div className="p-4 rounded bg-[#0b0e14] border border-[#1b202a] space-y-2">
                    <div className="text-emerald-400 font-mono font-bold text-[11px]">Self-Verification Confirmation</div>
                    <p className="text-slate-300">
                      No automated quiz questions exist for this specific task. Confirm that you have reviewed the core concepts and completed all practical work.
                    </p>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        startTransition(async () => {
                          await actionUpdateTaskStatus(task.id, 'VERIFIED');
                          await actionUpdateTaskStage(task.id, 'COMPLETE');
                        });
                      }}
                      disabled={isPending}
                      className="px-6 py-3 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-2 shadow-lg"
                    >
                      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                      CONFIRM TASK VERIFIED & COMPLETE
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STAGE COMPLETE */}
          {currentStage === 'COMPLETE' && currentStatus !== 'NEEDS_REVISION' && (
            <div
              className="p-5 sm:p-6 space-y-4 rounded text-center"
              style={{
                background: 'var(--surface-1)',
                border: '1px solid var(--border)',
              }}
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">
                Task Workspace Finished
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                You have completed all 5 learning stages for this task. Use the Next Task button above to advance through the roadmap.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TIMER TAB */}
      {activeTab === 'TIMER' && <StudyTimer taskId={task.id} taskTitle={task.title} />}

      {/* NOTES TAB */}
      {activeTab === 'NOTES' && (
        <div
          className="p-5 sm:p-6 space-y-5 rounded"
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
          }}
        >
          <form onSubmit={handleSaveNote} className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              Add Task Learning Note
            </h4>
            <input
              type="text"
              placeholder="Note title (e.g. key implementation details)…"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded outline-none text-white"
              style={{
                background: 'var(--surface-0)',
                border: '1px solid var(--border)',
              }}
            />
            <textarea
              placeholder="Record notes, code snippets, debugging solutions…"
              rows={4}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              required
              className="w-full px-3 py-2.5 text-xs leading-relaxed resize-none rounded outline-none text-white font-mono"
              style={{
                background: 'var(--surface-0)',
                border: '1px solid var(--border)',
              }}
            />
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded text-white bg-purple-600 hover:bg-purple-500 transition"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Save Note
            </button>
          </form>

          {task.notes && task.notes.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">
                Saved Notes ({task.notes.length})
              </h4>
              {task.notes.map((n: any) => (
                <div
                  key={n.id}
                  className="p-4 space-y-2 text-xs rounded"
                  style={{
                    background: 'var(--surface-0)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <h5 className="font-bold text-white flex items-center gap-2 font-mono">
                    <FileText className="w-3.5 h-3.5 text-purple-400" />
                    {n.title}
                  </h5>
                  <p className="whitespace-pre-wrap leading-relaxed text-slate-300 font-mono text-[11px] pl-5">
                    {n.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
