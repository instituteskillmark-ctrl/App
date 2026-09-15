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
  await getRoadmapOverview();
  const skillsList = await getSkillsOverview();
  const intel = await getSmartIntelligence();

  return (
    <div className="flex-1 pb-16">
      <Header
        title="Dashboard"
        subtitle="AI Automation Developer Learning System"
      />

      <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Metric Overview Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Tile 1: Course Progress */}
          <div className="bg-[#12161c] border border-[#252b34] rounded-xl p-5 shadow-sm relative overflow-hidden group hover:border-[#374151] transition">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#9aa3af] font-medium uppercase tracking-wider">
                Course Progress
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#171c23] border border-[#252b34] flex items-center justify-center text-[#f5f7fa]">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-[#f5f7fa] mt-3 tracking-tight">
              {stats.overallProgressPercent}%
            </div>
            <div className="w-full bg-[#0d1015] rounded-full h-1.5 mt-3 overflow-hidden border border-[#252b34]">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${stats.overallProgressPercent}%` }}
              ></div>
            </div>
            <div className="text-[11px] text-[#9aa3af] mt-2.5 flex items-center justify-between">
              <span>{stats.completedTasksCount} of {stats.totalTasks} topics</span>
              <span className="text-emerald-400 font-medium">Active</span>
            </div>
          </div>

          {/* Tile 2: Streak */}
          <div className="bg-[#12161c] border border-[#252b34] rounded-xl p-5 shadow-sm relative overflow-hidden group hover:border-[#374151] transition">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#9aa3af] font-medium uppercase tracking-wider">
                Current Streak
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#171c23] border border-[#252b34] flex items-center justify-center text-amber-400">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-amber-400 mt-3 tracking-tight flex items-baseline gap-2">
              <span>{stats.streak.currentStreak}</span>
              <span className="text-xs font-normal text-[#9aa3af]">Days</span>
            </div>
            <div className="text-[11px] text-[#9aa3af] mt-4 flex items-center gap-1.5 border-t border-[#252b34] pt-2">
              <span className={`w-2 h-2 rounded-full ${stats.streak.activeToday ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span>{stats.streak.activeToday ? 'Logged study today' : 'Pending study today'}</span>
            </div>
          </div>

          {/* Tile 3: Verified Skills */}
          <div className="bg-[#12161c] border border-[#252b34] rounded-xl p-5 shadow-sm relative overflow-hidden group hover:border-[#374151] transition">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#9aa3af] font-medium uppercase tracking-wider">
                Verified Skills
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#171c23] border border-[#252b34] flex items-center justify-center text-emerald-400">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-[#f5f7fa] mt-3 tracking-tight">
              {stats.verifiedTasksCount}
            </div>
            <div className="text-[11px] text-[#9aa3af] mt-4 border-t border-[#252b34] pt-2 flex items-center justify-between">
              <span>Quiz verified</span>
              <span className="text-emerald-400 font-medium">Passed</span>
            </div>
          </div>

          {/* Tile 4: Study Hours */}
          <div className="bg-[#12161c] border border-[#252b34] rounded-xl p-5 shadow-sm relative overflow-hidden group hover:border-[#374151] transition">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#9aa3af] font-medium uppercase tracking-wider">
                Focus Hours
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#171c23] border border-[#252b34] flex items-center justify-center text-[#9aa3af]">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-[#f5f7fa] mt-3 tracking-tight">
              {stats.totalHoursInvested} <span className="text-xs text-[#9aa3af]">hrs</span>
            </div>
            <div className="text-[11px] text-[#9aa3af] mt-4 border-t border-[#252b34] pt-2">
              Logged timer sessions
            </div>
          </div>

          {/* Tile 5: Projects Built */}
          <div className="bg-[#12161c] border border-[#252b34] rounded-xl p-5 shadow-sm relative overflow-hidden group hover:border-[#374151] transition">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#9aa3af] font-medium uppercase tracking-wider">
                Projects Built
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#171c23] border border-[#252b34] flex items-center justify-center text-emerald-400">
                <FolderKanban className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-[#f5f7fa] mt-3 tracking-tight">
              {stats.completedProjectsCount} / {stats.totalProjects}
            </div>
            <div className="text-[11px] text-[#9aa3af] mt-4 border-t border-[#252b34] pt-2 flex items-center justify-between">
              <span>Roadmap portfolio</span>
              <Link href="/projects" className="text-[#f5f7fa] hover:text-white flex items-center gap-0.5 font-medium">
                <span>View</span>
                <ArrowUpRight className="w-3 h-3 text-[#9aa3af]" />
              </Link>
            </div>
          </div>
        </div>

        {/* Smart Recommendations Engine */}
        {intel && <SmartRecommendations intelligence={intel as any} />}

        {/* Skill Progress & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Skill Category Progress */}
          <div className="bg-[#12161c] border border-[#252b34] rounded-xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#252b34] pb-3">
              <h3 className="font-semibold text-[#f5f7fa] text-xs uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                Skill Progress
              </h3>
              <Link href="/progress" className="text-xs text-[#f5f7fa] hover:text-white flex items-center gap-1 font-medium">
                <span>View All</span>
                <ArrowUpRight className="w-3 h-3 text-[#9aa3af]" />
              </Link>
            </div>

            <div className="space-y-3.5">
              {skillsList.map((sk) => (
                <div key={sk.id} className="space-y-1.5 bg-[#171c23] p-3 rounded-lg border border-[#252b34]">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#f5f7fa] font-medium">{sk.category}</span>
                    <span className="text-emerald-400 font-semibold bg-[#12161c] px-2 py-0.5 rounded border border-[#252b34]">
                      {sk.proficiencyPercent}%
                    </span>
                  </div>
                  <div className="w-full bg-[#0d1015] rounded-full h-1.5 overflow-hidden border border-[#252b34]">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${sk.proficiencyPercent}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-[#9aa3af] pt-1">
                    <span>{sk.completedTasks} of {sk.totalTasks} topics</span>
                    <span>Verified: {sk.verifiedTasks}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-[#12161c] border border-[#252b34] rounded-xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#252b34] pb-3">
              <h3 className="font-semibold text-[#f5f7fa] text-xs uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Recent Activity
              </h3>
              <span className="text-[11px] text-[#66707c]">Session History</span>
            </div>

            {stats.recentActivity.length === 0 ? (
              <div className="text-center py-12 text-xs text-[#9aa3af] bg-[#171c23] rounded-lg border border-dashed border-[#252b34] p-6 space-y-2">
                <Clock className="w-6 h-6 text-[#66707c] mx-auto" />
                <p className="font-medium text-[#f5f7fa]">No activity logged yet</p>
                <p className="text-[11px] text-[#9aa3af]">Complete a topic or log a focus session to see your progress here.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {stats.recentActivity.map((act, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-[#171c23] p-3 rounded-lg border border-[#252b34] text-xs hover:border-[#374151] transition"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-md bg-[#12161c] border border-[#252b34] flex items-center justify-center text-[#9aa3af] shrink-0">
                        {act.type === 'TASK' ? (
                          <Pin className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-[#9aa3af]" />
                        )}
                      </div>
                      <span className="text-[#f5f7fa] font-medium">{act.title}</span>
                    </div>
                    <span className="text-[#9aa3af] text-[11px] bg-[#12161c] px-2 py-1 rounded border border-[#252b34] shrink-0 ml-2">
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


