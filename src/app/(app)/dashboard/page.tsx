import React from 'react';
import { Header } from '@/components/Header';
import { getDashboardStats } from '@/lib/services/dashboard';
import { getRoadmapOverview } from '@/lib/services/roadmap';
import { getSkillsOverview } from '@/lib/services/skills';
import { getSmartIntelligence } from '@/lib/services/intelligence';
import Link from 'next/link';
import { SmartRecommendations } from '@/components/SmartRecommendations';
import {
  Flame,
  CheckCircle2,
  Award,
  Clock,
  FolderKanban,
  TrendingUp,
  Activity,
  Pin,
  Target,
  ArrowUpRight,
} from 'lucide-react';

export const revalidate = 0;

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const months = await getRoadmapOverview();
  const skillsList = await getSkillsOverview();
  const intel = await getSmartIntelligence();

  return (
    <div className="flex-1 pb-16">
      <Header
        title="Personal Command Center"
        subtitle="AI Automation Developer OS • 26-Week Production Curriculum"
      />

      <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Metric Overview Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Tile 1: Overall Progress */}
          <div className="bg-[#0e1420] border border-slate-800/80 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700/80 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono font-medium uppercase tracking-wider">
                Overall Progress
              </span>
              <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-slate-100 mt-3 font-mono tracking-tight">
              {stats.overallProgressPercent}%
            </div>
            <div className="w-full bg-[#080d19] rounded-full h-1.5 mt-3 overflow-hidden border border-slate-800/60">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${stats.overallProgressPercent}%` }}
              ></div>
            </div>
            <div className="text-[11px] text-slate-400 mt-2.5 font-mono flex items-center justify-between">
              <span>{stats.completedTasksCount} / {stats.totalTasks} topics</span>
              <span className="text-cyan-400 font-semibold">Active</span>
            </div>
          </div>

          {/* Tile 2: Streak */}
          <div className="bg-[#0e1420] border border-slate-800/80 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700/80 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono font-medium uppercase tracking-wider">
                Current Streak
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-950/80 border border-amber-800/50 flex items-center justify-center text-amber-400">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-amber-400 mt-3 font-mono tracking-tight flex items-baseline gap-2">
              <span>{stats.streak.currentStreak}</span>
              <span className="text-xs font-normal text-slate-400">Days</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-4 font-mono flex items-center gap-1.5 border-t border-slate-800/60 pt-2">
              <span className={`w-2 h-2 rounded-full ${stats.streak.activeToday ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span>{stats.streak.activeToday ? 'Logged study today' : 'Sunday rest / pending'}</span>
            </div>
          </div>

          {/* Tile 3: Verified Skills */}
          <div className="bg-[#0e1420] border border-slate-800/80 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700/80 transition">
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
            <div className="text-[11px] text-slate-400 mt-4 font-mono border-t border-slate-800/60 pt-2 flex items-center justify-between">
              <span>Quiz verified</span>
              <span className="text-emerald-400 font-bold">100% Audit</span>
            </div>
          </div>

          {/* Tile 4: Study Hours */}
          <div className="bg-[#0e1420] border border-slate-800/80 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700/80 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono font-medium uppercase tracking-wider">
                Focus Hours
              </span>
              <div className="w-7 h-7 rounded-lg bg-indigo-950/80 border border-indigo-800/50 flex items-center justify-center text-indigo-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-indigo-300 mt-3 font-mono tracking-tight">
              {stats.totalHoursInvested} <span className="text-xs text-slate-400">hrs</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-4 font-mono border-t border-slate-800/60 pt-2">
              Logged timer sessions
            </div>
          </div>

          {/* Tile 5: Projects Built */}
          <div className="bg-[#0e1420] border border-slate-800/80 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700/80 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono font-medium uppercase tracking-wider">
                Projects Built
              </span>
              <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
                <FolderKanban className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-cyan-300 mt-3 font-mono tracking-tight">
              {stats.completedProjectsCount} / {stats.totalProjects}
            </div>
            <div className="text-[11px] text-slate-400 mt-4 font-mono border-t border-slate-800/60 pt-2 flex items-center justify-between">
              <span>Roadmap portfolio</span>
              <Link href="/projects" className="text-cyan-400 hover:underline flex items-center gap-0.5">
                <span>View</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Smart Recommendations Engine */}
        {intel && <SmartRecommendations intelligence={intel as any} />}

        {/* Skill Matrix & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Skill Category Proficiency */}
          <div className="bg-[#0e1420] border border-slate-800/80 rounded-xl p-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <h3 className="font-bold text-slate-100 text-xs font-mono uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                SKILL CATEGORY PROFICIENCY MATRIX
              </h3>
              <Link href="/progress" className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center gap-1">
                <span>Full Audit</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-4">
              {skillsList.map((sk) => (
                <div key={sk.id} className="space-y-1.5 bg-[#090d18] p-3 rounded-lg border border-slate-800/60">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-200 font-semibold">{sk.category}</span>
                    <span className="text-cyan-400 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/50">
                      {sk.proficiencyPercent}%
                    </span>
                  </div>
                  <div className="w-full bg-[#070b14] rounded-full h-2 overflow-hidden border border-slate-800/80">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${sk.proficiencyPercent}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1">
                    <span>{sk.completedTasks} of {sk.totalTasks} topics</span>
                    <span>Verified: {sk.verifiedTasks}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Log */}
          <div className="bg-[#0e1420] border border-slate-800/80 rounded-xl p-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <h3 className="font-bold text-slate-100 text-xs font-mono uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                RECENT SYSTEM ACTIVITY LOG
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Persisted Log</span>
            </div>

            {stats.recentActivity.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400 font-mono bg-[#090d18] rounded-lg border border-dashed border-slate-800/80 p-6 space-y-2">
                <Clock className="w-6 h-6 text-slate-500 mx-auto" />
                <p>No activity logged yet.</p>
                <p className="text-[11px] text-slate-400">Complete a topic or log a focus session to populate system logs!</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {stats.recentActivity.map((act, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-[#090d18] p-3 rounded-lg border border-slate-800/80 text-xs font-mono hover:border-slate-700/80 transition"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 shrink-0">
                        {act.type === 'TASK' ? (
                          <Pin className="w-3.5 h-3.5 text-cyan-400" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        )}
                      </div>
                      <span className="text-slate-200 font-medium">{act.title}</span>
                    </div>
                    <span className="text-slate-400 text-[10px] bg-slate-900 px-2 py-1 rounded border border-slate-800 shrink-0 ml-2">
                      {act.time}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

