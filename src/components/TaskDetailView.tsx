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

  const lifecycleStages = ['LEARN', 'PRACTICE', 'BUILD', 'REVIEW', 'ASSESSMENT', 'VERIFIED'];

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
    <div className="bg-[#0e1420] border border-slate-800/80 rounded-xl p-6 lg:p-8 space-y-6 shadow-xl">
      {/* Task Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <PriorityBadge priority={task.priority} />
            {task.durationLabel && (
              <span className="text-xs font-mono text-slate-400 bg-[#080d19] px-2.5 py-0.5 rounded-md border border-slate-800">
                Duration: {task.durationLabel}
              </span>
            )}
          </div>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-100 tracking-tight">{task.title}</h2>
          {task.description && <p className="text-xs text-slate-400 font-mono leading-relaxed">{task.description}</p>}
        </div>

        <div className="flex flex-col md:items-end space-y-3 shrink-0">
          <StatusBadge status={task.progress.status} />
          <div className="flex items-center space-x-1 bg-[#080d19] p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => handleStatusChange('IN_PROGRESS')}
              disabled={isPending}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition ${
                task.progress.status === 'IN_PROGRESS'
                  ? 'bg-indigo-600/90 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => handleStatusChange('COMPLETED')}
              disabled={isPending}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition ${
                task.progress.status === 'COMPLETED'
                  ? 'bg-cyan-600/90 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => handleStatusChange('VERIFIED')}
              disabled={isPending}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition flex items-center gap-1 ${
                task.progress.status === 'VERIFIED'
                  ? 'bg-emerald-600/90 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
              <span>Verify</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6-Stage Learning Lifecycle bar */}
      <div className="bg-[#080d19] p-4 rounded-xl border border-slate-800/80 space-y-2">
        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          6-STAGE CURRICULUM LEARNING LIFECYCLE
        </span>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 pt-1">
          {lifecycleStages.map((stage, idx) => {
            const currentActiveIdx = getActiveLifecycleStageIndex();
            const isCompleted = idx <= currentActiveIdx;
            return (
              <div
                key={stage}
                className={`p-2 rounded-lg text-center text-xs font-mono font-semibold border transition ${
                  isCompleted
                    ? 'bg-cyan-950/80 border-cyan-800/80 text-cyan-300 shadow-xs'
                    : 'bg-[#0e1420] border-slate-800/80 text-slate-500'
                }`}
              >
                {idx + 1}. {stage}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800/80 space-x-6 text-xs font-mono font-bold pt-2">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`pb-3 transition flex items-center gap-2 ${
            activeTab === 'OVERVIEW'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Overview & Checklist</span>
        </button>
        <button
          onClick={() => setActiveTab('TIMER')}
          className={`pb-3 transition flex items-center gap-2 ${
            activeTab === 'TIMER'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-slate-400 hover:text-slate-200'
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
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
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
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Personal Notes ({task.notes?.length || 0})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-cyan-400" />
              PRACTICAL SUBTASKS CHECKLIST
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">{task.subtasks.length} subtasks</span>
          </div>

          {task.subtasks.length === 0 ? (
            <p className="text-xs text-slate-400 font-mono py-4 text-center border border-dashed border-slate-800 rounded-lg">
              No subtasks defined for this topic. Follow main curriculum objectives.
            </p>
          ) : (
            <div className="space-y-2">
              {task.subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center space-x-3 bg-[#080d19] p-3.5 rounded-lg border border-slate-800/80 hover:border-slate-700 transition"
                >
                  <span className="w-5 h-5 rounded-md border border-cyan-800/60 bg-cyan-950/60 flex items-center justify-center text-xs text-cyan-400 font-bold shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs text-slate-200 font-mono leading-relaxed">{st.title}</span>
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
          <form onSubmit={handleSaveNote} className="space-y-3 bg-[#080d19] p-5 rounded-xl border border-slate-800/80">
            <input
              type="text"
              placeholder="Note title (e.g. n8n Node Configuration, API Key handling)..."
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              required
              className="w-full bg-[#0e1420] border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
            />
            <textarea
              placeholder="Write code snippets, key learnings, or debugging notes..."
              rows={4}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              required
              className="w-full bg-[#0e1420] border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500 leading-relaxed"
            ></textarea>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold rounded-lg transition shadow-md shadow-cyan-950 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Save Task Note</span>
            </button>
          </form>

          {task.notes && task.notes.length > 0 && (
            <div className="space-y-3">
              {task.notes.map((n: any) => (
                <div key={n.id} className="bg-[#080d19] p-4 rounded-xl border border-slate-800/80 text-xs font-mono space-y-1.5">
                  <h5 className="font-bold text-slate-200 text-xs flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{n.title}</span>
                  </h5>
                  <p className="text-slate-400 whitespace-pre-wrap leading-relaxed pl-5.5">{n.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

