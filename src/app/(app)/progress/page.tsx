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
} from 'lucide-react';

export const revalidate = 0;

export default async function ProgressPage() {
  const stats = await getDashboardStats();
  const skillsList = await getSkillsOverview();
  const months = await getRoadmapOverview();

  const unverifiedCount = Math.max(0, stats.completedTasksCount - stats.verifiedTasksCount);

  return (
    <div className="flex-1 pb-16">
      <Header
        title="Skill Progress"
        subtitle="Curriculum Analytics & Progress Breakdown"
      />

      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        {/* Core Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#12161c] border border-[#252b34] rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#9aa3af] font-medium uppercase tracking-wider">
                Course Progress
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#171c23] border border-[#252b34] flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-[#f5f7fa] mt-3 tracking-tight">
              {stats.overallProgressPercent}%
            </div>
            <div className="text-[11px] text-[#9aa3af] mt-3 border-t border-[#252b34] pt-2">
              {stats.completedTasksCount} of {stats.totalTasks} topics completed
            </div>
          </div>

          <div className="bg-[#12161c] border border-[#252b34] rounded-xl p-5 shadow-sm relative overflow-hidden">
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
            <div className="text-[11px] text-[#9aa3af] mt-3 border-t border-[#252b34] pt-2">
              Passed quiz assessments
            </div>
          </div>

          <div className="bg-[#12161c] border border-[#252b34] rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#9aa3af] font-medium uppercase tracking-wider">
                Current Streak
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#171c23] border border-[#252b34] flex items-center justify-center text-amber-400">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-amber-400 mt-3 tracking-tight flex items-baseline gap-1.5">
              <span>{stats.streak.currentStreak}</span>
              <span className="text-xs font-normal text-[#9aa3af]">Days</span>
            </div>
            <div className="text-[11px] text-[#9aa3af] mt-3 border-t border-[#252b34] pt-2">
              Consecutive study days
            </div>
          </div>

          <div className="bg-[#12161c] border border-[#252b34] rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#9aa3af] font-medium uppercase tracking-wider">
                Needs More Practice
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#171c23] border border-[#252b34] flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-rose-400 mt-3 tracking-tight">
              {unverifiedCount} <span className="text-xs text-[#9aa3af] font-normal">Topics</span>
            </div>
            <div className="text-[11px] text-[#9aa3af] mt-3 border-t border-[#252b34] pt-2">
              Completed without quiz verification
            </div>
          </div>
        </div>

        {/* Skill Breakdown */}
        <div className="bg-[#12161c] border border-[#252b34] rounded-xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#252b34] pb-3">
            <h3 className="text-xs font-semibold text-[#f5f7fa] uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Skill Breakdown
            </h3>
            <span className="text-[11px] text-[#66707c]">Calculated from roadmap progress</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skillsList.map((sk) => (
              <div key={sk.id} className="bg-[#171c23] p-4.5 rounded-xl border border-[#252b34] space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#f5f7fa] text-sm">{sk.category}</span>
                  <span className="text-emerald-400 font-semibold bg-[#12161c] px-2.5 py-0.5 rounded border border-[#252b34]">
                    {sk.proficiencyPercent}%
                  </span>
                </div>

                <p className="text-xs text-[#9aa3af] leading-relaxed">{sk.description}</p>

                <div className="w-full bg-[#0d1015] rounded-full h-1.5 overflow-hidden border border-[#252b34]">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${sk.proficiencyPercent}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-[11px] text-[#9aa3af] pt-1 border-t border-[#252b34]">
                  <span>Completed: <strong className="text-[#f5f7fa]">{sk.completedTasks} of {sk.totalTasks}</strong></span>
                  <span>Verified: <strong className="text-emerald-400">{sk.verifiedTasks}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Month Progress Breakdown */}
        <div className="bg-[#12161c] border border-[#252b34] rounded-xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#252b34] pb-3">
            <h3 className="text-xs font-semibold text-[#f5f7fa] uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Monthly Progress Breakdown
            </h3>
            <span className="text-[11px] text-[#66707c]">26-Week Timeline</span>
          </div>

          <div className="space-y-3">
            {months.map((m) => (
              <div key={m.id} className="bg-[#171c23] p-4 rounded-xl border border-[#252b34] space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-[#12161c] text-[#f5f7fa] font-semibold border border-[#252b34] text-[11px]">
                      Month {m.monthNumber}
                    </span>
                    <span className="font-semibold text-[#f5f7fa]">{m.title}</span>
                    <span className="text-[#66707c] text-[11px]">({m.durationWeeks})</span>
                  </div>
                  <span className="text-emerald-400 font-semibold">{m.percentComplete}% Complete</span>
                </div>

                <div className="w-full bg-[#0d1015] rounded-full h-1.5 overflow-hidden border border-[#252b34]">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
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


