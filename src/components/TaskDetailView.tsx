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

export function TaskDetailView({ task }: TaskDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TIMER' | 'ASSESSMENT' | 'NOTES'>('OVERVIEW');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isPending, startTransition] = useTransition();

  const lifecycleStages = ['Learn', 'Practice', 'Build', 'Review', 'Assessment', 'Verified'];

  const getActiveLifecycleStageIndex = () => {
    switch (task.progress.status) {
      case 'VERIFIED':
        return 5;
      case 'COMPLETED':
        return 3;
      case 'IN_PROGRESS':
        return 1;
      case 'NOT_STARTED':
      default:
        return 0;
    }
  };

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
    <div className="bg-[#12161c] border border-[#252b34] rounded-xl p-6 lg:p-8 space-y-6 shadow-sm">
      {/* Task Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#252b34] pb-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <PriorityBadge priority={task.priority} />
            {task.durationLabel && (
              <span className="text-xs text-[#9aa3af] bg-[#171c23] px-2.5 py-0.5 rounded border border-[#252b34]">
                Duration: {task.durationLabel}
              </span>
            )}
          </div>
          <h2 className="text-xl lg:text-2xl font-semibold text-[#f5f7fa] tracking-tight">{task.title}</h2>
          {task.description && <p className="text-xs text-[#9aa3af] leading-relaxed">{task.description}</p>}
        </div>

        <div className="flex flex-col md:items-end space-y-3 shrink-0">
          <StatusBadge status={task.progress.status} />
          <div className="flex items-center space-x-1 bg-[#171c23] p-1 rounded-lg border border-[#252b34] text-xs">
            <button
              onClick={() => handleStatusChange('IN_PROGRESS')}
              disabled={isPending}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                task.progress.status === 'IN_PROGRESS'
                  ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                  : 'text-[#9aa3af] hover:text-[#f5f7fa] hover:bg-[#12161c]'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => handleStatusChange('COMPLETED')}
              disabled={isPending}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                task.progress.status === 'COMPLETED'
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                  : 'text-[#9aa3af] hover:text-[#f5f7fa] hover:bg-[#12161c]'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => handleStatusChange('VERIFIED')}
              disabled={isPending}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition flex items-center gap-1 ${
                task.progress.status === 'VERIFIED'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-[#9aa3af] hover:text-[#f5f7fa] hover:bg-[#12161c]'
              }`}
            >
              {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
              <span>Verify</span>
            </button>
          </div>
        </div>
      </div>

      {/* Learning Lifecycle Bar */}
      <div className="bg-[#171c23] p-4 rounded-xl border border-[#252b34] space-y-2">
        <span className="text-xs font-semibold text-[#9aa3af] uppercase tracking-wider block flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          Learning Stage Timeline
        </span>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 pt-1">
          {lifecycleStages.map((stage, idx) => {
            const currentActiveIdx = getActiveLifecycleStageIndex();
            const isCompleted = idx <= currentActiveIdx;
            return (
              <div
                key={stage}
                className={`p-2 rounded-lg text-center text-xs font-semibold border transition ${
                  isCompleted
                    ? 'bg-[#12161c] border-[#374151] text-[#f5f7fa]'
                    : 'bg-[#0d1015] border-[#252b34] text-[#66707c]'
                }`}
              >
                {idx + 1}. {stage}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#252b34] space-x-6 text-xs font-semibold pt-2">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`pb-3 transition flex items-center gap-2 ${
            activeTab === 'OVERVIEW'
              ? 'text-[#f5f7fa] border-b-2 border-[#f5f7fa]'
              : 'text-[#9aa3af] hover:text-[#f5f7fa]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Checklist</span>
        </button>
        <button
          onClick={() => setActiveTab('TIMER')}
          className={`pb-3 transition flex items-center gap-2 ${
            activeTab === 'TIMER'
              ? 'text-[#f5f7fa] border-b-2 border-[#f5f7fa]'
              : 'text-[#9aa3af] hover:text-[#f5f7fa]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Study Timer</span>
        </button>
        {(task.priority === 'MASTER' || task.priority === 'IMPORTANT') && (
          <button
            onClick={() => setActiveTab('ASSESSMENT')}
            className={`pb-3 transition flex items-center gap-2 ${
              activeTab === 'ASSESSMENT'
                ? 'text-[#f5f7fa] border-b-2 border-[#f5f7fa]'
                : 'text-[#9aa3af] hover:text-[#f5f7fa]'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Verification Quiz</span>
          </button>
        )}
        <button
          onClick={() => setActiveTab('NOTES')}
          className={`pb-3 transition flex items-center gap-2 ${
            activeTab === 'NOTES'
              ? 'text-[#f5f7fa] border-b-2 border-[#f5f7fa]'
              : 'text-[#9aa3af] hover:text-[#f5f7fa]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Notes ({task.notes?.length || 0})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#252b34] pb-2">
            <h4 className="text-xs font-semibold text-[#f5f7fa] uppercase tracking-wider flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              Subtasks Checklist
            </h4>
            <span className="text-[11px] text-[#9aa3af]">{task.subtasks.length} subtasks</span>
          </div>

          {task.subtasks.length === 0 ? (
            <div className="text-xs text-[#66707c] py-6 text-center border border-dashed border-[#252b34] rounded-lg bg-[#171c23]">
              No subtasks specified for this topic. Follow main curriculum objectives.
            </div>
          ) : (
            <div className="space-y-2">
              {task.subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center space-x-3 bg-[#171c23] p-3.5 rounded-lg border border-[#252b34] hover:border-[#374151] transition"
                >
                  <span className="w-5 h-5 rounded-md border border-[#252b34] bg-[#12161c] flex items-center justify-center text-xs text-emerald-400 font-bold shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs text-[#f5f7fa] leading-relaxed">{st.title}</span>
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
        <div className="space-y-6">
          <form onSubmit={handleSaveNote} className="space-y-3 bg-[#171c23] p-5 rounded-xl border border-[#252b34]">
            <input
              type="text"
              placeholder="Note title (e.g. n8n Node Configuration, API Key handling)..."
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              required
              className="w-full bg-[#12161c] border border-[#252b34] rounded-lg px-3.5 py-2 text-xs text-[#f5f7fa] focus:outline-none focus:border-[#374151]"
            />
            <textarea
              placeholder="Write key learnings, code snippets, or debugging notes..."
              rows={4}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              required
              className="w-full bg-[#12161c] border border-[#252b34] rounded-lg px-3.5 py-2.5 text-xs text-[#f5f7fa] focus:outline-none focus:border-[#374151] leading-relaxed"
            ></textarea>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-[#f5f7fa] hover:bg-white text-[#08090c] text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Save Note</span>
            </button>
          </form>

          {task.notes && task.notes.length > 0 && (
            <div className="space-y-3">
              {task.notes.map((n: any) => (
                <div key={n.id} className="bg-[#171c23] p-4 rounded-xl border border-[#252b34] text-xs space-y-1.5">
                  <h5 className="font-semibold text-[#f5f7fa] text-xs flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-[#9aa3af]" />
                    <span>{n.title}</span>
                  </h5>
                  <p className="text-[#9aa3af] whitespace-pre-wrap leading-relaxed pl-5.5">{n.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


