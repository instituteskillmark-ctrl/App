import React from 'react';
import { Header } from '@/components/Header';
import { getRoadmapOverview } from '@/lib/services/roadmap';
import Link from 'next/link';
import {
  Clock,
  ArrowRight,
  Calendar,
  Target,
  BookOpen,
  FolderKanban,
  Award,
  Briefcase,
  TrendingUp,
} from 'lucide-react';

export const revalidate = 0;

export default async function RoadmapPage() {
  const months = await getRoadmapOverview();

  return (
    <div className="flex-1 pb-16">
      <Header
        title="Curriculum Roadmap"
        subtitle="26-Week Journey — From Zero to Junior AI Automation Developer"
      />

      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        {/* Priority & Commitment Bar */}
        <div className="bg-[#12161c] border border-[#252b34] rounded-xl p-6 space-y-4 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#252b34] pb-4">
            <div>
              <span className="text-xs font-semibold text-[#f5f7fa] uppercase tracking-wider block mb-2">
                Priority Levels
              </span>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-2 bg-rose-950/40 px-3 py-1.5 rounded-lg border border-rose-800/40 text-rose-300">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span className="font-semibold">Master:</span>
                  <span className="text-[#9aa3af] text-[11px]">Deeply learn & practice</span>
                </div>
                <div className="flex items-center gap-2 bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-800/40 text-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="font-semibold">Important:</span>
                  <span className="text-[#9aa3af] text-[11px]">Good working knowledge</span>
                </div>
                <div className="flex items-center gap-2 bg-[#171c23] px-3 py-1.5 rounded-lg border border-[#252b34] text-[#9aa3af]">
                  <span className="w-2 h-2 rounded-full bg-[#66707c]"></span>
                  <span className="font-semibold text-[#f5f7fa]">Basics:</span>
                  <span className="text-[#9aa3af] text-[11px]">Essential fundamentals</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs shrink-0">
              <div className="bg-[#171c23] px-3.5 py-2 rounded-lg border border-[#252b34] text-[#9aa3af] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#9aa3af]" />
                <span>Daily Commitment: <strong className="text-[#f5f7fa]">2–3 hours</strong></span>
              </div>
              <div className="bg-[#171c23] px-3.5 py-2 rounded-lg border border-[#252b34] text-[#9aa3af] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#9aa3af]" />
                <span>Duration: <strong className="text-[#f5f7fa]">26 Weeks (~6 Months)</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#9aa3af] pt-1">
            <span className="flex items-center gap-1.5 text-[#f5f7fa] font-medium">
              Target Outcome: Build complete automation systems with n8n + code + AI APIs
            </span>
            <span className="text-emerald-400 font-medium">Rest & Recharge: Sundays</span>
          </div>
        </div>

        {/* Month Milestone Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {months.map((m) => (
            <div
              key={m.id}
              className="bg-[#12161c] border border-[#252b34] rounded-xl p-6 hover:border-[#374151] transition shadow-sm flex flex-col justify-between space-y-4 group"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#252b34] pb-3 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded-md bg-[#171c23] text-[#f5f7fa] text-xs font-semibold border border-[#252b34]">
                      Month {m.monthNumber}
                    </span>
                    <span className="text-xs text-[#9aa3af] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#66707c]" />
                      {m.durationWeeks}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-emerald-400 bg-[#171c23] px-2.5 py-1 rounded border border-[#252b34]">
                    {m.percentComplete}% Complete
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base lg:text-lg font-semibold text-[#f5f7fa] group-hover:text-white transition">
                  {m.title}
                </h3>

                {/* Key Output Deliverable */}
                <div className="mt-4 bg-[#171c23] rounded-lg p-3 text-xs border border-[#252b34] space-y-1">
                  <div className="text-[11px] font-semibold text-[#9aa3af] uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-emerald-400" />
                    Portfolio Deliverable:
                  </div>
                  <div className="text-[#f5f7fa] font-medium text-xs pl-5">
                    {m.keyOutput}
                  </div>
                </div>
              </div>

              {/* Progress & Action */}
              <div className="pt-2 border-t border-[#252b34] space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#9aa3af]">{m.completedTasks} of {m.totalTasks} Topics Completed</span>
                  <span className="text-[#f5f7fa] font-semibold">{m.percentComplete}%</span>
                </div>

                <div className="w-full bg-[#0d1015] rounded-full h-1.5 overflow-hidden border border-[#252b34]">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${m.percentComplete}%` }}
                  ></div>
                </div>

                <div className="pt-1">
                  <Link
                    href={`/roadmap/${m.monthNumber}`}
                    className="w-full py-2.5 bg-[#171c23] hover:bg-[#252b34] border border-[#252b34] rounded-lg text-xs font-semibold text-[#f5f7fa] transition flex items-center justify-center gap-2"
                  >
                    <span>Explore Month {m.monthNumber} Topics</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#9aa3af]" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Your Journey Step Flow */}
        <div className="bg-[#12161c] border border-[#252b34] rounded-xl p-6 space-y-4 shadow-sm">
          <div className="text-xs font-semibold text-[#9aa3af] uppercase tracking-wider text-center">
            Your Journey
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {[
              { step: '1. Learn Skills', desc: 'n8n, APIs, DB, JS, AI', icon: BookOpen },
              { step: '2. Build Projects', desc: '6 Capstone Applications', icon: FolderKanban },
              { step: '3. Create Portfolio', desc: 'Verified Code Demos', icon: Award },
              { step: '4. Get Clients / Job', desc: 'Freelance & Junior Prep', icon: Briefcase },
              { step: '5. Grow Skillset', desc: 'Scale Systems & Agents', icon: TrendingUp },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#171c23] p-3.5 rounded-lg border border-[#252b34] text-center space-y-1.5 hover:border-[#374151] transition"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#12161c] border border-[#252b34] flex items-center justify-center mx-auto text-[#f5f7fa]">
                    <Icon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-xs font-semibold text-[#f5f7fa]">{item.step}</div>
                  <div className="text-[11px] text-[#9aa3af]">{item.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}


