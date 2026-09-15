import React from 'react';
import { Header } from '@/components/Header';
import { getDashboardStats } from '@/lib/services/dashboard';
import { getSkillsOverview } from '@/lib/services/skills';
import { getRoadmapOverview } from '@/lib/services/roadmap';
import {
  TrendingUp,
  Award,
  Flame,
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle2,
  Layers,
} from 'lucide-react';

export const revalidate = 0;

export default async function ProgressPage() {
  const stats = await getDashboardStats();
  const skillsList = await getSkillsOverview();
  const months = await getRoadmapOverview();

  // Identify weak areas: topics completed but not yet assessment verified
  const unverifiedCount = Math.max(0, stats.completedTasksCount - stats.verifiedTasksCount);

  return (
    <div className="flex-1 pb-16">
      <Header
        title="Competency Audit & Analytics"
        subtitle="Skill Matrix • Real Persisted Analytics • Weakness Detection Engine"
      />

      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        {/* Core Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0e1420] border border-slate-800/80 rounded-xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono font-medium uppercase tracking-wider">
                Curriculum Completion
              </span>
              <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-cyan-300 mt-3 font-mono tracking-tight">
              {stats.overallProgressPercent}%
            </div>
            <div className="text-[11px] text-slate-400 mt-3 font-mono border-t border-slate-800/60 pt-2">
              {stats.completedTasksCount} of {stats.totalTasks} topics finished
            </div>
          </div>

          <div className="bg-[#0e1420] border border-slate-800/80 rounded-xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono font-medium uppercase tracking-wider">
                Verified Mastery
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-emerald-400 mt-3 font-mono tracking-tight">
              {stats.verifiedTasksCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-3 font-mono border-t border-slate-800/60 pt-2">
              Passed quiz assessment audit
            </div>
          </div>

          <div className="bg-[#0e1420] border border-slate-800/80 rounded-xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono font-medium uppercase tracking-wider">
                Current Streak
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-950/80 border border-amber-800/50 flex items-center justify-center text-amber-400">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-amber-400 mt-3 font-mono tracking-tight flex items-baseline gap-1.5">
              <span>{stats.streak.currentStreak}</span>
              <span className="text-xs font-normal text-slate-400">Days</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-3 font-mono border-t border-slate-800/60 pt-2">
              Consecutive study days
            </div>
          </div>

          <div className="bg-[#0e1420] border border-slate-800/80 rounded-xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono font-medium uppercase tracking-wider">
                Weakness Audit
              </span>
              <div className="w-7 h-7 rounded-lg bg-rose-950/80 border border-rose-800/50 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-rose-400 mt-3 font-mono tracking-tight">
              {unverifiedCount} <span className="text-xs text-slate-400 font-normal">Topics</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-3 font-mono border-t border-slate-800/60 pt-2">
              Completed without verification
            </div>
          </div>
        </div>

        {/* Skill Matrix */}
        <div className="bg-[#0e1420] border border-slate-800/80 rounded-xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              DETAILED SKILL COMPETENCY MATRIX
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Calculated from completed tasks</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skillsList.map((sk) => (
              <div key={sk.id} className="bg-[#080d19] p-4.5 rounded-xl border border-slate-800/80 space-y-3">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-slate-100 text-sm">{sk.category}</span>
                  <span className="text-cyan-400 font-bold bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-800/50">
                    {sk.proficiencyPercent}%
                  </span>
                </div>

                <p className="text-xs text-slate-400 font-mono leading-relaxed">{sk.description}</p>

                <div className="w-full bg-[#0e1420] rounded-full h-2 overflow-hidden border border-slate-800/80">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${sk.proficiencyPercent}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800/60">
                  <span>Completed: <strong className="text-slate-200">{sk.completedTasks} / {sk.totalTasks}</strong></span>
                  <span>Verified: <strong className="text-emerald-400">{sk.verifiedTasks}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Month Progress Breakdown */}
        <div className="bg-[#0e1420] border border-slate-800/80 rounded-xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              MONTH-BY-MONTH PROGRESS BREAKDOWN
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">26-Week Timeline</span>
          </div>

          <div className="space-y-3">
            {months.map((m) => (
              <div key={m.id} className="bg-[#080d19] p-4 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/50 text-[10px]">
                      Month {m.monthNumber}
                    </span>
                    <span className="font-bold text-slate-200">{m.title}</span>
                    <span className="text-slate-500 text-[11px]">({m.durationWeeks})</span>
                  </div>
                  <span className="text-cyan-400 font-bold">{m.percentComplete}% Finished</span>
                </div>

                <div className="w-full bg-[#0e1420] rounded-full h-2 overflow-hidden border border-slate-800/80">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${m.percentComplete}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

