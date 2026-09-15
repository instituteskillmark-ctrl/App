'use client';

import React, { useState, useTransition } from 'react';
import { StatusBadge } from '@/components/StatusBadge';
import { actionUpdateProjectProgress } from '@/lib/actions/app-actions';
import { FolderKanban, GitBranch, ExternalLink, Layers, Plus, Check, Loader2, Code, Calendar } from 'lucide-react';

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
          className="bg-[#0e1420] border border-slate-800/80 rounded-xl p-6 flex flex-col justify-between hover:border-slate-700/80 transition shadow-lg space-y-4 group"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="px-2.5 py-1 rounded-md bg-[#080d19] border border-cyan-800/60 text-cyan-400 font-bold text-[11px] flex items-center gap-1.5">
                <FolderKanban className="w-3.5 h-3.5" />
                PROJECT {p.projectNumber}
              </span>
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" />
                {p.weekRange}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-300 transition">{p.title}</h3>
            <p className="text-xs text-slate-400 font-mono leading-relaxed">{p.description}</p>

            {p.techStack && (
              <div className="pt-2 bg-[#080d19] p-3 rounded-lg border border-slate-800/80">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block flex items-center gap-1">
                  <Code className="w-3 h-3 text-cyan-400" />
                  TECH STACK & ARCHITECTURE:
                </span>
                <span className="text-xs text-cyan-300 font-mono mt-1 block font-medium">{p.techStack}</span>
              </div>
            )}

            {/* Project Stage Flow */}
            <div className="pt-3 border-t border-slate-800/60 space-y-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block flex items-center gap-1">
                <Layers className="w-3 h-3 text-slate-400" />
                PROJECT STAGE FLOW:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {STAGES.map((stg) => (
                  <button
                    key={stg}
                    disabled={isPending}
                    onClick={() => handleStageChange(p.id, stg)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase transition ${
                      p.progress.currentStage === stg
                        ? 'bg-cyan-600/90 text-white border border-cyan-400 shadow-xs'
                        : 'bg-[#080d19] text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {stg}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/60 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <StatusBadge status={p.progress.status as any} />
              {p.progress.repoUrl ? (
                <a
                  href={p.progress.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 font-semibold text-xs"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>Repository Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <button
                  onClick={() => {
                    setEditingProjectId(p.id);
                    setRepoUrl(p.progress.repoUrl || '');
                    setNotes(p.progress.notes || '');
                  }}
                  className="text-slate-400 hover:text-cyan-300 text-xs font-mono flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 text-cyan-400" />
                  <span>Add Repository URL</span>
                </button>
              )}
            </div>

            {editingProjectId === p.id && (
              <div className="p-3 bg-[#080d19] rounded-xl border border-slate-800/80 space-y-2.5">
                <input
                  type="url"
                  placeholder="https://github.com/your-username/repo"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full bg-[#0e1420] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="text"
                  placeholder="Project notes or live demo URL..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#0e1420] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
                <div className="flex justify-end space-x-2 pt-1">
                  <button
                    onClick={() => setEditingProjectId(null)}
                    className="px-3 py-1 text-[11px] font-mono text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveDetails(p.id)}
                    disabled={isPending}
                    className="px-3.5 py-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-[11px] font-bold rounded-md shadow-xs flex items-center gap-1"
                  >
                    {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    <span>Save Details</span>
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

