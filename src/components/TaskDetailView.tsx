'use client';

import React, { useState, useTransition } from 'react';
import { PriorityBadge } from '@/components/PriorityBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { StudyTimer } from '@/components/StudyTimer';
import { AssessmentQuiz } from '@/components/AssessmentQuiz';
import { actionUpdateTaskStatus, actionCreateNote } from '@/lib/actions/app-actions';

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
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-6">
      {/* Task Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-3">
            <PriorityBadge priority={task.priority} />
            {task.durationLabel && (
              <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                Duration: {task.durationLabel}
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-100">{task.title}</h2>
          {task.description && <p className="text-xs text-slate-400">{task.description}</p>}
        </div>

        <div className="flex flex-col items-end space-y-3">
          <StatusBadge status={task.progress.status} />
          <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => handleStatusChange('IN_PROGRESS')}
              disabled={isPending}
              className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                task.progress.status === 'IN_PROGRESS' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => handleStatusChange('COMPLETED')}
              disabled={isPending}
              className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                task.progress.status === 'COMPLETED' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => handleStatusChange('VERIFIED')}
              disabled={isPending}
              className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                task.progress.status === 'VERIFIED' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ✓ Verified
            </button>
          </div>
        </div>
      </div>

      {/* 6-Stage Learning Lifecycle bar */}
      <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
        <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider block mb-2">
          6-STAGE LEARNING LIFECYCLE
        </span>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {lifecycleStages.map((stage, idx) => {
            const currentActiveIdx = getActiveLifecycleStageIndex();
            const isCompleted = idx <= currentActiveIdx;
            return (
              <div
                key={stage}
                className={`p-2 rounded text-center text-xs font-mono font-semibold border transition ${
                  isCompleted
                    ? 'bg-cyan-950/80 border-cyan-800 text-cyan-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-500'
                }`}
              >
                {idx + 1}. {stage}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-6 text-xs font-mono font-semibold">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`pb-2 transition ${activeTab === 'OVERVIEW' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Overview & Subtasks
        </button>
        <button
          onClick={() => setActiveTab('TIMER')}
          className={`pb-2 transition ${activeTab === 'TIMER' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Study Timer
        </button>
        {(task.priority === 'MASTER' || task.priority === 'IMPORTANT') && (
          <button
            onClick={() => setActiveTab('ASSESSMENT')}
            className={`pb-2 transition ${activeTab === 'ASSESSMENT' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Verification Quiz
          </button>
        )}
        <button
          onClick={() => setActiveTab('NOTES')}
          className={`pb-2 transition ${activeTab === 'NOTES' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Personal Notes ({task.notes?.length || 0})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-4">
          <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">Subtasks Checklist</h4>
          {task.subtasks.length === 0 ? (
            <p className="text-xs text-slate-500 font-mono">No subtasks defined for this topic. Follow main curriculum objectives.</p>
          ) : (
            <div className="space-y-2">
              {task.subtasks.map((st) => (
                <div key={st.id} className="flex items-center space-x-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <span className="w-4 h-4 rounded border border-slate-700 bg-slate-950 flex items-center justify-center text-[10px] text-cyan-400 font-bold">
                    ✓
                  </span>
                  <span className="text-xs text-slate-200 font-mono">{st.title}</span>
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
          <form onSubmit={handleSaveNote} className="space-y-3 bg-slate-900/60 p-4 rounded-lg border border-slate-800">
            <input
              type="text"
              placeholder="Note title..."
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none"
            />
            <textarea
              placeholder="Write your personal study note or code snippet..."
              rows={3}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none"
            ></textarea>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs rounded transition"
            >
              Save Task Note
            </button>
          </form>

          {task.notes && task.notes.length > 0 && (
            <div className="space-y-2">
              {task.notes.map((n: any) => (
                <div key={n.id} className="bg-slate-900/40 p-3 rounded-lg border border-slate-800 text-xs font-mono space-y-1">
                  <h5 className="font-bold text-slate-200">{n.title}</h5>
                  <p className="text-slate-400 whitespace-pre-wrap">{n.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
