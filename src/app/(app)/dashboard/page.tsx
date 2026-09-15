import React from 'react';
import { Header } from '@/components/Header';
import { getDashboardStats } from '@/lib/services/dashboard';
import { getRoadmapOverview } from '@/lib/services/roadmap';
import { getSkillsOverview } from '@/lib/services/skills';
import { getSmartIntelligence } from '@/lib/services/intelligence';
import Link from 'next/link';
import { StatusBadge } from '@/components/StatusBadge';
import { PriorityBadge } from '@/components/PriorityBadge';
import { SmartRecommendations } from '@/components/SmartRecommendations';

export const revalidate = 0;

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const months = await getRoadmapOverview();
  const skillsList = await getSkillsOverview();
  const intel = await getSmartIntelligence();

  return (
    <div className="flex-1 pb-12">
      <Header
        title="AI Automation Developer OS Dashboard"
        subtitle="Personal Learning & Execution Command Center • 26-Week Journey"
      />

      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        {/* Metric Overview Bar */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
            <div className="text-xs text-slate-400 font-medium">Overall Progress</div>
            <div className="text-2xl font-bold text-slate-100 mt-2 font-mono">{stats.overallProgressPercent}%</div>
            <div className="w-full bg-slate-900 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${stats.overallProgressPercent}%` }}></div>
            </div>
            <div className="text-[11px] text-slate-500 mt-2 font-mono">
              {stats.completedTasksCount} / {stats.totalTasks} topics
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
            <div className="text-xs text-slate-400 font-medium">Current Streak</div>
            <div className="text-2xl font-bold text-amber-400 mt-2 font-mono flex items-center space-x-2">
              <span>🔥 {stats.streak.currentStreak}</span>
              <span className="text-xs text-slate-400">days</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-3 font-mono">
              {stats.streak.activeToday ? '✓ Active today' : 'Sunday rest / pending today'}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
            <div className="text-xs text-slate-400 font-medium">Verified Skills</div>
            <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">{stats.verifiedTasksCount}</div>
            <div className="text-[11px] text-slate-500 mt-3 font-mono">
              Assessment verified
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
            <div className="text-xs text-slate-400 font-medium">Study Hours</div>
            <div className="text-2xl font-bold text-indigo-400 mt-2 font-mono">{stats.totalHoursInvested} hrs</div>
            <div className="text-[11px] text-slate-500 mt-3 font-mono">
              Logged focus sessions
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
            <div className="text-xs text-slate-400 font-medium">Projects Built</div>
            <div className="text-2xl font-bold text-cyan-400 mt-2 font-mono">{stats.completedProjectsCount} / {stats.totalProjects}</div>
            <div className="text-[11px] text-slate-500 mt-3 font-mono">
              Roadmap portfolio
            </div>
          </div>
        </div>

        {/* Smart Recommendations & Next Step Engine */}
        {intel && <SmartRecommendations intelligence={intel as any} />}

        {/* Skill Breakdown & Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Skill Matrix */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6">
            <h3 className="font-bold text-slate-100 text-sm font-mono mb-4">Skill Category Proficiency</h3>
            <div className="space-y-3">
              {skillsList.map((sk) => (
                <div key={sk.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300 font-medium">{sk.category}</span>
                    <span className="text-cyan-400 font-bold">{sk.proficiencyPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${sk.proficiencyPercent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6">
            <h3 className="font-bold text-slate-100 text-sm font-mono mb-4">Recent System Activity</h3>
            {stats.recentActivity.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 font-mono">
                No activity logged yet. Start studying or complete a task to populate logs!
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentActivity.map((act, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg border border-slate-800 text-xs font-mono">
                    <div className="flex items-center space-x-2">
                      <span className="text-cyan-400">{act.type === 'TASK' ? '📌' : '⏱️'}</span>
                      <span className="text-slate-200">{act.title}</span>
                    </div>
                    <span className="text-slate-500 text-[10px]">{act.time}</span>
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
