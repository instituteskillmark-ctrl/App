import React from 'react';
import { Header } from '@/components/Header';
import { getDashboardStats } from '@/lib/services/dashboard';
import { getSkillsOverview } from '@/lib/services/skills';
import { getRoadmapOverview } from '@/lib/services/roadmap';

export const revalidate = 0;

export default async function ProgressPage() {
  const stats = await getDashboardStats();
  const skillsList = await getSkillsOverview();
  const months = await getRoadmapOverview();

  // Identify weak areas: topics completed but not yet assessment verified
  const unverifiedCount = Math.max(0, stats.completedTasksCount - stats.verifiedTasksCount);

  return (
    <div className="flex-1 pb-12">
      <Header
        title="Learning Progress & Weakness Detection"
        subtitle="Competency Audit • Skill Matrix • Real Persisted Analytics"
      />

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Core Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
            <div className="text-xs text-slate-400 font-medium">Curriculum Completion</div>
            <div className="text-2xl font-bold text-cyan-400 mt-2 font-mono">{stats.overallProgressPercent}%</div>
            <div className="text-[11px] text-slate-500 mt-2 font-mono">
              {stats.completedTasksCount} of {stats.totalTasks} topics finished
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
            <div className="text-xs text-slate-400 font-medium">Verified Mastery</div>
            <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">{stats.verifiedTasksCount}</div>
            <div className="text-[11px] text-slate-500 mt-2 font-mono">
              Passed quiz assessment
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
            <div className="text-xs text-slate-400 font-medium font-mono">Current Streak</div>
            <div className="text-2xl font-bold text-amber-400 mt-2 font-mono">🔥 {stats.streak.currentStreak} days</div>
            <div className="text-[11px] text-slate-500 mt-2 font-mono">
              Consecutive study days
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
            <div className="text-xs text-slate-400 font-medium">Weakness Audit</div>
            <div className="text-2xl font-bold text-red-400 mt-2 font-mono">{unverifiedCount} topics</div>
            <div className="text-[11px] text-slate-500 mt-2 font-mono">
              Completed without verification
            </div>
          </div>
        </div>

        {/* Skill Matrix */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-bold text-slate-100 font-mono mb-4 uppercase tracking-wider">
            Detailed Skill Competency Matrix
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skillsList.map((sk) => (
              <div key={sk.id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-slate-200">{sk.category}</span>
                  <span className="text-cyan-400 font-bold">{sk.proficiencyPercent}%</span>
                </div>

                <p className="text-xs text-slate-400">{sk.description}</p>

                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800 mt-2">
                  <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${sk.proficiencyPercent}%` }}></div>
                </div>

                <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1">
                  <span>Completed: {sk.completedTasks} / {sk.totalTasks}</span>
                  <span>Verified: {sk.verifiedTasks}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Month Progress Breakdown */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-bold text-slate-100 font-mono mb-4 uppercase tracking-wider">
            Month-by-Month Progress Breakdown
          </h3>

          <div className="space-y-3">
            {months.map((m) => (
              <div key={m.id} className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs font-mono">
                  <div>
                    <span className="font-bold text-cyan-400">Month {m.monthNumber}: {m.title}</span>
                    <span className="text-slate-500 ml-2">({m.durationWeeks})</span>
                  </div>
                  <span className="text-slate-300 font-semibold">{m.percentComplete}% Finished</span>
                </div>

                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${m.percentComplete}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
