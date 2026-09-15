import React from 'react';
import { Header } from '@/components/Header';
import { getRoadmapOverview } from '@/lib/services/roadmap';
import Link from 'next/link';
import { PriorityBadge } from '@/components/PriorityBadge';
import {
  Map,
  Clock,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Zap,
  Target,
  ChevronRight,
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
        title="AI Automation Developer Curriculum Roadmap"
        subtitle="Upgraded & Complete Guide From Zero → Strong Junior / Freelance-Ready • 26-Week Architecture"
      />

      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        {/* Reference-Inspired Priority & Commitment Legend Bar */}
        <div className="bg-[#0e1420] border border-slate-800/80 rounded-xl p-6 shadow-lg space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-2">
                CURRICULUM PRIORITY LEVELS
              </span>
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                <div className="flex items-center gap-2 bg-rose-950/40 px-3 py-1.5 rounded-lg border border-rose-800/50 text-rose-300">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  <span className="font-bold">MASTER:</span>
                  <span className="text-slate-300 text-[11px]">Deeply learn, practice & master</span>
                </div>
                <div className="flex items-center gap-2 bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-800/50 text-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="font-bold">IMPORTANT:</span>
                  <span className="text-slate-300 text-[11px]">Good understanding for real projects</span>
                </div>
                <div className="flex items-center gap-2 bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-800/50 text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="font-bold">BASICS ENOUGH:</span>
                  <span className="text-slate-300 text-[11px]">Just enough to get by</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs font-mono shrink-0">
              <div className="bg-[#080d19] px-3.5 py-2 rounded-lg border border-slate-800 text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Daily commitment: <strong className="text-slate-100">2–3 hours</strong></span>
              </div>
              <div className="bg-[#080d19] px-3.5 py-2 rounded-lg border border-slate-800 text-slate-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>Duration: <strong className="text-slate-100">26 Weeks (~6 Mo)</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-400 pt-1">
            <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Outcome Target: Build complete automation systems with n8n + code + AI (not just n8n operators)
            </span>
            <span className="text-emerald-400 font-medium">Rest & Recharge: Sundays</span>
          </div>
        </div>

        {/* 6 Month Milestone Grid (2 Columns on MD/LG screens inspired by infographic) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {months.map((m) => (
            <div
              key={m.id}
              className="bg-[#0e1420] border border-slate-800/80 rounded-xl p-6 hover:border-cyan-500/40 transition shadow-lg flex flex-col justify-between space-y-4 group"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded-md bg-cyan-950 text-cyan-300 text-xs font-mono font-bold border border-cyan-800/60">
                      MONTH {m.monthNumber}
                    </span>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {m.durationWeeks}
                    </span>
                  </div>

                  <span className="text-xs font-mono font-bold text-cyan-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                    {m.percentComplete}% Done
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base lg:text-lg font-bold text-slate-100 group-hover:text-cyan-300 transition">
                  {m.title}
                </h3>

                {/* Key Output Box */}
                <div className="mt-4 bg-[#080d19] rounded-lg p-3 text-xs border border-slate-800/80 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
                    <Target className="w-3 h-3 text-cyan-400" />
                    KEY OUTPUT PORTFOLIO DELIVERABLE:
                  </div>
                  <div className="text-slate-200 font-semibold font-mono text-[11px] pl-4">
                    {m.keyOutput}
                  </div>
                </div>
              </div>

              {/* Footer Progress & Action */}
              <div className="pt-2 border-t border-slate-800/60 space-y-3">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400">{m.completedTasks} / {m.totalTasks} Topics Completed</span>
                  <span className="text-cyan-400 font-bold">{m.percentComplete}%</span>
                </div>

                <div className="w-full bg-[#080d19] rounded-full h-1.5 overflow-hidden border border-slate-800/60">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${m.percentComplete}%` }}
                  ></div>
                </div>

                <div className="pt-1">
                  <Link
                    href={`/roadmap/${m.monthNumber}`}
                    className="w-full py-2.5 bg-[#141f36] hover:bg-cyan-600 border border-slate-700/60 rounded-lg text-xs font-semibold text-slate-200 hover:text-white transition font-mono flex items-center justify-center gap-2 group-hover:border-cyan-500/50"
                  >
                    <span>Explore Month {m.monthNumber} Curriculum & Tasks</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Journey Milestone Flow matching the Infographic footer */}
        <div className="bg-[#0e1420] border border-slate-800/80 rounded-xl p-6 space-y-4 shadow-lg">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest text-center">
            CAREER PROGRESSION JOURNEY FLOW
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {[
              { step: '1. Learn Skills', desc: 'n8n, APIs, DB, JS, AI', icon: BookOpen },
              { step: '2. Build Projects', desc: '6 Capstone Portfolio Apps', icon: FolderKanban },
              { step: '3. Create Portfolio', desc: 'Verified Code & Flow Demos', icon: Award },
              { step: '4. Get Clients / Job', desc: 'Freelance & Junior Prep', icon: Briefcase },
              { step: '5. Grow to Mid-Level', desc: 'Scale Systems & AI Agents', icon: TrendingUp },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#080d19] p-3.5 rounded-lg border border-slate-800/80 text-center space-y-1.5 hover:border-cyan-500/50 transition"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-cyan-400">
                    <Icon className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-xs font-bold font-mono text-slate-100">{item.step}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{item.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

