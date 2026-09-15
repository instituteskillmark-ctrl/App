'use client';

import React, { useState, useTransition } from 'react';
import { PriorityBadge } from '@/components/PriorityBadge';
import { StatusBadge } from '@/components/StatusBadge';
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
  Layers,
} from 'lucide-react';

interface TaskDetailViewProps {
  task: {
    id: string;
    title: string;
    durationLabel?: string | null;
    priority: 'MASTER' | 'IMPORTANT' | 'BASICS_ENOUGH';
    description?: string | null;
    monthName?: string;
    weekTitle?: string;
    subtasks: { id: string; title: string; orderIndex: number }[];
    progress: { status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED' };
    assessment?: any;
    notes?: any[];
  };
}

const LIFECYCLE_STAGES = ['Learn', 'Practice', 'Build', 'Review', 'Assessment', 'Verified'];

function getStageIndex(status: string) {
  switch (status) {
    case 'VERIFIED': return 5;
    case 'COMPLETED': return 3;
    case 'IN_PROGRESS': return 1;
    default: return 0;
  }
}

export function TaskDetailView({ task }: TaskDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TIMER' | 'ASSESSMENT' | 'NOTES'>('OVERVIEW');
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
    <div
      className="space-y-5"
      style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--border)',
        borderRadius: '4px',
        padding: '24px',
      }}
    >
      {/* Task Header */}
      <div
        className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-5"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <PriorityBadge priority={task.priority} />
            {task.durationLabel && (
              <span
                className="text-[10px] font-medium"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
              >
                {task.durationLabel}
              </span>
            )}
          </div>
          <h2
            className="text-xl lg:text-2xl font-semibold tracking-tight"
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

        <div className="flex flex-col md:items-end gap-3 shrink-0">
          <StatusBadge status={task.progress.status} />
          <div
            className="flex items-center gap-0.5 p-0.5"
            style={{
              background: 'var(--surface-0)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
            }}
          >
            {([
              { label: 'In Progress', value: 'IN_PROGRESS' as const, color: 'var(--status-in-progress)' },
              { label: 'Completed', value: 'COMPLETED' as const, color: 'var(--status-completed)' },
              { label: 'Verified', value: 'VERIFIED' as const, color: 'var(--status-completed)' },
            ]).map((s) => {
              const isActive = task.progress.status === s.value;
              return (
                <button
                  key={s.value}
                  onClick={() => handleStatusChange(s.value)}
                  disabled={isPending}
                  className="px-2.5 py-1.5 text-[10px] font-semibold transition flex items-center gap-1"
                  style={{
                    borderRadius: '3px',
                    background: isActive ? 'var(--surface-1)' : 'transparent',
                    color: isActive ? s.color : 'var(--text-muted)',
                    border: isActive ? '1px solid var(--border-strong)' : '1px solid transparent',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {isPending && isActive && <Loader2 className="w-3 h-3 animate-spin" />}
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Learning Lifecycle */}
      <div
        className="p-4 space-y-2"
        style={{
          background: 'var(--surface-0)',
          border: '1px solid var(--border)',
          borderRadius: '4px',
        }}
      >
        <span className="section-label flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          Learning Stage
        </span>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-1.5 pt-1">
          {LIFECYCLE_STAGES.map((stage, idx) => {
            const isActive = idx === currentStageIdx;
            const isDone = idx < currentStageIdx;
            return (
              <div
                key={stage}
                className="py-1.5 text-center text-[9px] font-semibold"
                style={{
                  borderRadius: '3px',
                  fontFamily: 'var(--font-mono)',
                  background: isActive
                    ? 'var(--accent)'
                    : isDone
                    ? 'rgba(127,119,221,0.12)'
                    : 'var(--surface-1)',
                  color: isActive ? '#fff' : isDone ? 'var(--accent)' : 'var(--text-muted)',
                  border: isActive
                    ? '1px solid var(--accent)'
                    : isDone
                    ? '1px solid rgba(127,119,221,0.25)'
                    : '1px solid var(--border)',
                }}
              >
                {idx + 1}. {stage}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        className="flex"
        style={{ borderBottom: '1px solid var(--border)', gap: 0 }}
      >
        {(
          [
            { id: 'OVERVIEW', label: 'Checklist', Icon: BookOpen },
            { id: 'TIMER', label: 'Study Timer', Icon: Clock },
            ...(task.priority !== 'BASICS_ENOUGH'
              ? [{ id: 'ASSESSMENT', label: 'Verification Quiz', Icon: HelpCircle }]
              : []),
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
                background: 'none',
                border: 'none',
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

      {/* Tab Content */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-3">
          <div
            className="flex items-center justify-between pb-2"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <span className="section-label flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
              Subtasks Checklist
            </span>
            <span
              className="text-[10px]"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              {task.subtasks.length} subtasks
            </span>
          </div>

          {task.subtasks.length === 0 ? (
            <div
              className="py-6 text-center text-xs"
              style={{
                color: 'var(--text-muted)',
                border: '1px dashed var(--border)',
                borderRadius: '4px',
              }}
            >
              No subtasks specified. Follow main curriculum objectives.
            </div>
          ) : (
            <div className="space-y-1.5">
              {task.subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center gap-3 px-3 py-2.5 os-surface-hover transition"
                  style={{
                    background: 'var(--surface-0)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                  }}
                >
                  <CheckCircle2
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: 'var(--text-muted)' }}
                  />
                  <span className="text-xs" style={{ color: 'var(--text-primary)' }}>
                    {st.title}
                  </span>
                </div>
              ))}
            </div>
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
              placeholder="Note title (e.g. n8n Node Configuration)…"
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
              rows={4}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              required
              className="w-full px-3 py-2.5 text-xs leading-relaxed resize-none"
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
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold transition"
              style={{
                background: 'var(--surface-0)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
              }}
            >
              <Plus className="w-4 h-4" />
              Save Note
            </button>
          </form>

          {task.notes && task.notes.length > 0 && (
            <div className="space-y-2">
              {task.notes.map((n: any) => (
                <div
                  key={n.id}
                  className="px-4 py-3 space-y-1.5 text-xs"
                  style={{
                    background: 'var(--surface-0)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                  }}
                >
                  <h5
                    className="font-semibold flex items-center gap-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <FileText className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                    {n.title}
                  </h5>
                  <p
                    className="whitespace-pre-wrap leading-relaxed pl-5"
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
  );
}
