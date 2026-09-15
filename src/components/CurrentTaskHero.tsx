'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { PriorityBadge } from '@/components/PriorityBadge';
import { StudyTimer } from '@/components/StudyTimer';
import { AssessmentQuiz } from '@/components/AssessmentQuiz';
import { actionUpdateTaskStatus, actionCreateNote } from '@/lib/actions/app-actions';
import {
  CheckCircle2,
  Clock,
  BookOpen,
  FileText,
  HelpCircle,
  CheckSquare,
  Plus,
  Loader2,
  ArrowRight,
  FolderKanban,
} from 'lucide-react';

interface CurrentTaskHeroProps {
  task: {
    id: string;
    title: string;
    durationLabel?: string | null;
    priority: 'MASTER' | 'IMPORTANT' | 'BASICS_ENOUGH';
    description?: string | null;
    monthName?: string;
    monthNumber?: number;
    subtasks: { id: string; title: string; orderIndex: number }[];
    progress: { status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED' };
    assessment?: any;
    notes?: any[];
  };
  stats?: {
    overallProgressPercent: number;
    completedTasksCount: number;
    totalTasks: number;
    streak: { currentStreak: number; activeToday: boolean };
    totalHoursInvested: number;
    verifiedTasksCount: number;
  };
  activeProject?: {
    title: string;
    description: string;
    techStack?: string | null;
    projectNumber?: number;
  };
  topSkills?: { category: string; proficiencyPercent: number }[];
}

const LIFECYCLE_STAGES = ['Learn', 'Practice', 'Build', 'Review', 'Assess', 'Verified'];

function getStageIndex(status: string) {
  switch (status) {
    case 'VERIFIED': return 5;
    case 'COMPLETED': return 3;
    case 'IN_PROGRESS': return 1;
    default: return 0;
  }
}

export function CurrentTaskHero({ task, stats, activeProject, topSkills }: CurrentTaskHeroProps) {
  const [activeTab, setActiveTab] = useState<'CHECKLIST' | 'TIMER' | 'ASSESSMENT' | 'NOTES'>('CHECKLIST');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isPending, startTransition] = useTransition();

  const currentStageIdx = getStageIndex(task.progress.status);

  const handleStatusChange = (newStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED') => {
    startTransition(async () => {
      await actionUpdateTaskStatus(task.id, newStatus);
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

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* ── Left column: task content (65%) ── */}
      <div className="flex-1 min-w-0" style={{ flexBasis: '65%' }}>
        <div
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
          }}
          className="h-full"
        >
          {/* Task Header */}
          <div
            style={{ borderBottom: '1px solid var(--border)' }}
            className="px-5 py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
          >
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <PriorityBadge priority={task.priority} />
                {task.durationLabel && (
                  <span
                    className="text-[10px] font-medium"
                    style={{
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {task.durationLabel}
                  </span>
                )}
                {task.monthName && (
                  <span
                    className="text-[10px]"
                    style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                  >
                    {task.monthName}
                  </span>
                )}
              </div>
              <h2
                className="text-base font-semibold leading-snug"
                style={{ color: 'var(--text-primary)' }}
              >
                {task.title}
              </h2>
              {task.description && (
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {task.description}
                </p>
              )}
            </div>

            {/* Status buttons + CTA */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              {/* Status toggle strip */}
              <div
                className="flex items-center gap-0.5 p-0.5"
                style={{
                  background: 'var(--surface-0)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                }}
              >
                {(
                  [
                    { label: 'In Progress', value: 'IN_PROGRESS' as const },
                    { label: 'Done', value: 'COMPLETED' as const },
                    { label: 'Verified', value: 'VERIFIED' as const },
                  ] as const
                ).map((s) => {
                  const isActive = task.progress.status === s.value;
                  return (
                    <button
                      key={s.value}
                      disabled={isPending}
                      onClick={() => handleStatusChange(s.value)}
                      className="px-2.5 py-1 text-[10px] font-semibold transition"
                      style={{
                        borderRadius: '3px',
                        background: isActive ? 'var(--surface-1)' : 'transparent',
                        color: isActive
                          ? s.value === 'IN_PROGRESS'
                            ? 'var(--status-in-progress)'
                            : 'var(--status-completed)'
                          : 'var(--text-muted)',
                        border: isActive ? '1px solid var(--border-strong)' : '1px solid transparent',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {isPending && isActive ? (
                        <span className="flex items-center gap-1">
                          <Loader2 className="w-2.5 h-2.5 animate-spin" />
                          {s.label}
                        </span>
                      ) : s.label}
                    </button>
                  );
                })}
              </div>

              {/* Primary CTA */}
              <Link
                href={`/roadmap/task/${task.id}`}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold transition"
                style={{
                  background: 'var(--accent)',
                  color: '#fff',
                  borderRadius: '4px',
                  textDecoration: 'none',
                }}
              >
                <span>Continue Task</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 6-Stage Lifecycle Progress Bar */}
          <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="section-label mb-2">Learning Stage</div>
            <div className="flex gap-1">
              {LIFECYCLE_STAGES.map((stage, idx) => {
                const isActive = idx === currentStageIdx;
                const isDone = idx < currentStageIdx;
                return (
                  <div
                    key={stage}
                    className="flex-1 py-1 text-center text-[9px] font-semibold transition"
                    style={{
                      borderRadius: '3px',
                      fontFamily: 'var(--font-mono)',
                      background: isActive
                        ? 'var(--accent)'
                        : isDone
                        ? 'rgba(127,119,221,0.15)'
                        : 'var(--surface-0)',
                      color: isActive
                        ? '#fff'
                        : isDone
                        ? 'var(--accent)'
                        : 'var(--text-muted)',
                      border: isActive
                        ? '1px solid var(--accent)'
                        : isDone
                        ? '1px solid rgba(127,119,221,0.3)'
                        : '1px solid var(--border)',
                    }}
                  >
                    {stage}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tab strip */}
          <div
            className="flex border-b"
            style={{ borderColor: 'var(--border)', paddingLeft: '20px', paddingRight: '20px' }}
          >
            {(
              [
                { id: 'CHECKLIST', label: 'Checklist', Icon: CheckSquare },
                { id: 'TIMER', label: 'Timer', Icon: Clock },
                ...(task.priority !== 'BASICS_ENOUGH' ? [{ id: 'ASSESSMENT', label: 'Quiz', Icon: HelpCircle }] : []),
                { id: 'NOTES', label: `Notes (${task.notes?.length ?? 0})`, Icon: FileText },
              ] as { id: string; label: string; Icon: React.ElementType }[]
            ).map(({ id, label, Icon }) => {
              const isActive = activeTab === (id as any);
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className="flex items-center gap-1.5 py-2.5 mr-5 text-[11px] font-medium transition"
                  style={{
                    color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                    borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                    marginBottom: '-1px',
                    cursor: 'pointer',
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="p-5">
            {activeTab === 'CHECKLIST' && (
              <div className="space-y-2">
                {task.subtasks.length === 0 ? (
                  <div
                    className="py-6 text-center text-xs"
                    style={{
                      color: 'var(--text-muted)',
                      border: '1px dashed var(--border)',
                      borderRadius: '4px',
                    }}
                  >
                    No subtasks — follow main curriculum objectives.
                  </div>
                ) : (
                  task.subtasks.map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center gap-3 px-3 py-2.5 transition"
                      style={{
                        background: 'var(--surface-0)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                      }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
                      <span className="text-xs" style={{ color: 'var(--text-primary)' }}>
                        {st.title}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'TIMER' && <StudyTimer taskId={task.id} taskTitle={task.title} />}

            {activeTab === 'ASSESSMENT' && task.assessment && (
              <AssessmentQuiz
                assessmentId={task.assessment.id}
                taskId={task.id}
                title={task.title}
                questions={task.assessment.questions}
              />
            )}

            {activeTab === 'NOTES' && (
              <div className="space-y-4">
                <form onSubmit={handleSaveNote} className="space-y-2.5">
                  <input
                    type="text"
                    placeholder="Note title…"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs"
                    style={{
                      background: 'var(--surface-0)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                  />
                  <textarea
                    placeholder="Key learnings, code snippets, debugging notes…"
                    rows={3}
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs leading-relaxed resize-none"
                    style={{
                      background: 'var(--surface-0)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition"
                    style={{
                      background: 'var(--surface-0)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Save Note
                  </button>
                </form>

                {task.notes && task.notes.length > 0 && (
                  <div className="space-y-2">
                    {task.notes.map((n: any) => (
                      <div
                        key={n.id}
                        className="px-3 py-2.5 space-y-1 text-xs"
                        style={{
                          background: 'var(--surface-0)',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                        }}
                      >
                        <div
                          className="font-semibold flex items-center gap-1.5"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          <BookOpen className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                          {n.title}
                        </div>
                        <p
                          className="whitespace-pre-wrap leading-relaxed"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {n.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Right column: stats + skills + project (35%) ── */}
      {(stats || topSkills || activeProject) && (
        <div className="flex flex-col gap-4" style={{ flexBasis: '35%', minWidth: 0 }}>
          {/* 4-stat mini-grid */}
          {stats && (
            <div
              style={{
                background: 'var(--surface-1)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                padding: '16px',
              }}
            >
              <div className="section-label mb-3">Your Stats</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Progress', value: `${stats.overallProgressPercent}%`, unit: '' },
                  {
                    label: 'Streak',
                    value: `${stats.streak.currentStreak}`,
                    unit: 'days',
                  },
                  { label: 'Verified', value: `${stats.verifiedTasksCount}`, unit: 'topics' },
                  {
                    label: 'Hours',
                    value: `${stats.totalHoursInvested}`,
                    unit: 'hrs',
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    style={{
                      background: 'var(--surface-0)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      padding: '10px',
                    }}
                  >
                    <div className="section-label">{s.label}</div>
                    <div
                      className="text-xl font-medium leading-tight mt-1"
                      style={{
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {s.value}
                      {s.unit && (
                        <span
                          className="text-[10px] ml-1"
                          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                        >
                          {s.unit}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top skills snapshot */}
          {topSkills && topSkills.length > 0 && (
            <div
              style={{
                background: 'var(--surface-1)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                padding: '16px',
              }}
            >
              <div className="section-label mb-3">Skill Snapshot</div>
              <div className="space-y-3">
                {topSkills.slice(0, 3).map((sk) => (
                  <div key={sk.category}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {sk.category}
                      </span>
                      <span
                        className="text-[10px] font-medium"
                        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                      >
                        {sk.proficiencyPercent}%
                      </span>
                    </div>
                    <div className="progress-bar-track">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${sk.proficiencyPercent}%`,
                          background: 'var(--accent)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active project card */}
          {activeProject && (
            <div
              style={{
                background: 'var(--surface-1)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                padding: '16px',
              }}
            >
              <div className="section-label mb-2">Active Project</div>
              <div className="flex items-start gap-2">
                <FolderKanban className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }} />
                <div className="space-y-1 min-w-0">
                  <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {activeProject.title}
                  </div>
                  <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {activeProject.description}
                  </p>
                  {activeProject.techStack && (
                    <div
                      className="text-[10px]"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                    >
                      {activeProject.techStack}
                    </div>
                  )}
                  <Link
                    href="/projects"
                    className="flex items-center gap-1 text-[10px] font-semibold mt-2 transition"
                    style={{ color: 'var(--accent)' }}
                  >
                    <span>View Projects</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
