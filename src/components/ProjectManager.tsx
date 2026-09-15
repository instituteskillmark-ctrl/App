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
          className="bg-[#12161c] border border-[#252b34] rounded-xl p-6 flex flex-col justify-between hover:border-[#374151] transition shadow-sm space-y-4 group"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="px-2.5 py-1 rounded-md bg-[#171c23] border border-[#252b34] text-[#f5f7fa] font-semibold text-xs flex items-center gap-1.5">
                <FolderKanban className="w-3.5 h-3.5 text-emerald-400" />
                Project {p.projectNumber}
              </span>
              <span className="text-[#9aa3af] text-xs flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#66707c]" />
                {p.weekRange}
              </span>
            </div>

            <h3 className="text-lg font-semibold text-[#f5f7fa] group-hover:text-white transition">{p.title}</h3>
            <p className="text-xs text-[#9aa3af] leading-relaxed">{p.description}</p>

            {p.techStack && (
              <div className="pt-2 bg-[#171c23] p-3 rounded-lg border border-[#252b34]">
                <span className="text-[11px] font-semibold text-[#9aa3af] uppercase tracking-wider block flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-[#9aa3af]" />
                  Tech Stack:
                </span>
                <span className="text-xs text-[#f5f7fa] font-medium mt-1 block">{p.techStack}</span>
              </div>
            )}

            {/* Project Stage Flow */}
            <div className="pt-3 border-t border-[#252b34] space-y-2">
              <span className="text-[11px] font-semibold text-[#9aa3af] uppercase tracking-wider block flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#66707c]" />
                Project Stage:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {STAGES.map((stg) => (
                  <button
                    key={stg}
                    disabled={isPending}
                    onClick={() => handleStageChange(p.id, stg)}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                      p.progress.currentStage === stg
                        ? 'bg-[#171c23] text-[#f5f7fa] border border-[#374151]'
                        : 'bg-[#0d1015] text-[#9aa3af] hover:text-[#f5f7fa] border border-[#252b34]'
                    }`}
                  >
                    {stg.charAt(0) + stg.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#252b34] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <StatusBadge status={p.progress.status as any} />
              {p.progress.repoUrl ? (
                <a
                  href={p.progress.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#f5f7fa] hover:text-white flex items-center gap-1.5 font-semibold text-xs"
                >
                  <GitBranch className="w-3.5 h-3.5 text-[#9aa3af]" />
                  <span>Repository</span>
                  <ExternalLink className="w-3 h-3 text-[#66707c]" />
                </a>
              ) : (
                <button
                  onClick={() => {
                    setEditingProjectId(p.id);
                    setRepoUrl(p.progress.repoUrl || '');
                    setNotes(p.progress.notes || '');
                  }}
                  className="text-[#9aa3af] hover:text-[#f5f7fa] text-xs flex items-center gap-1 font-medium"
                >
                  <Plus className="w-3 h-3 text-[#66707c]" />
                  <span>Add Repository Link</span>
                </button>
              )}
            </div>

            {editingProjectId === p.id && (
              <div className="p-3 bg-[#171c23] rounded-lg border border-[#252b34] space-y-2.5">
                <input
                  type="url"
                  placeholder="https://github.com/your-username/repo"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full bg-[#12161c] border border-[#252b34] rounded-lg px-3 py-1.5 text-xs text-[#f5f7fa] focus:outline-none focus:border-[#374151]"
                />
                <input
                  type="text"
                  placeholder="Project notes or live demo URL..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#12161c] border border-[#252b34] rounded-lg px-3 py-1.5 text-xs text-[#f5f7fa] focus:outline-none focus:border-[#374151]"
                />
                <div className="flex justify-end space-x-2 pt-1">
                  <button
                    onClick={() => setEditingProjectId(null)}
                    className="px-3 py-1 text-xs text-[#9aa3af] hover:text-[#f5f7fa]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveDetails(p.id)}
                    disabled={isPending}
                    className="px-3.5 py-1 bg-[#f5f7fa] hover:bg-white text-[#08090c] text-xs font-semibold rounded-md flex items-center gap-1"
                  >
                    {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    <span>Save</span>
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


