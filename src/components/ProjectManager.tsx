'use client';

import React, { useState, useTransition } from 'react';
import { StatusBadge } from '@/components/StatusBadge';
import { actionUpdateProjectProgress } from '@/lib/actions/app-actions';

interface Project {
  id: string;
  projectNumber: number;
  title: string;
  weekRange: string;
  description: string;
  techStack?: string | null;
  progress: {
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    currentStage: 'PLANNING' | 'BUILD' | 'TESTING' | 'DEPLOYMENT' | 'DOCUMENTATION' | 'COMPLETE';
    repoUrl?: string | null;
    demoUrl?: string | null;
    notes?: string | null;
  };
}

const STAGES = ['PLANNING', 'BUILD', 'TESTING', 'DEPLOYMENT', 'DOCUMENTATION', 'COMPLETE'];

export function ProjectManager({ initialProjects }: { initialProjects: Project[] }) {
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [repoUrl, setRepoUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleStageChange = (projectId: string, newStage: any) => {
    const isComplete = newStage === 'COMPLETE';
    startTransition(async () => {
      await actionUpdateProjectProgress(projectId, {
        currentStage: newStage,
        status: isComplete ? 'COMPLETED' : 'IN_PROGRESS',
      });
    });
  };

  const handleSaveDetails = (projectId: string) => {
    startTransition(async () => {
      await actionUpdateProjectProgress(projectId, {
        repoUrl: repoUrl || undefined,
        notes: notes || undefined,
      });
      setEditingProjectId(null);
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {initialProjects.map((p) => (
        <div
          key={p.id}
          className="bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col justify-between hover:border-slate-700 transition space-y-4"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500">
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400 font-bold">
                PROJECT {p.projectNumber}
              </span>
              <span>{p.weekRange}</span>
            </div>

            <h3 className="text-base font-bold text-slate-100">{p.title}</h3>
            <p className="text-xs text-slate-400">{p.description}</p>

            {p.techStack && (
              <div className="pt-2">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block font-mono">
                  Tech Stack:
                </span>
                <span className="text-xs text-cyan-300 font-mono mt-0.5 block">{p.techStack}</span>
              </div>
            )}

            {/* Project Stage Flow */}
            <div className="pt-3 border-t border-slate-900 space-y-2">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block font-mono">
                Project Stage Flow:
              </span>
              <div className="flex flex-wrap gap-1">
                {STAGES.map((stg) => (
                  <button
                    key={stg}
                    disabled={isPending}
                    onClick={() => handleStageChange(p.id, stg)}
                    className={`px-2 py-1 rounded text-[10px] font-mono transition ${
                      p.progress.currentStage === stg
                        ? 'bg-cyan-600 text-white font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {stg}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-900 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <StatusBadge status={p.progress.status} />
              {p.progress.repoUrl ? (
                <a href={p.progress.repoUrl} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">
                  🔗 Repository →
                </a>
              ) : (
                <button
                  onClick={() => {
                    setEditingProjectId(p.id);
                    setRepoUrl(p.progress.repoUrl || '');
                    setNotes(p.progress.notes || '');
                  }}
                  className="text-slate-400 hover:text-slate-200 text-xs text-underline"
                >
                  + Add Repo Link
                </button>
              )}
            </div>

            {editingProjectId === p.id && (
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                <input
                  type="url"
                  placeholder="https://github.com/your-username/repo"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-100 font-mono focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Project notes / deployment URL..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-100 font-mono focus:outline-none"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setEditingProjectId(null)}
                    className="px-2 py-1 text-[11px] font-mono text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveDetails(p.id)}
                    disabled={isPending}
                    className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-[11px] rounded"
                  >
                    Save Details
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
