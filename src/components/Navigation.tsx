'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Map,
  Target,
  Bot,
  FolderKanban,
  TrendingUp,
  FileText,
  Settings,
  Menu,
  X,
  Zap,
  Award,
  Clock,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Roadmap', href: '/roadmap', icon: Map },
  { label: 'Today\'s Focus', href: '/today', icon: Target },
  { label: 'AI Assistant', href: '/assistant', icon: Bot },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Skill Progress', href: '/progress', icon: TrendingUp },
  { label: 'Knowledge Notes', href: '/notes', icon: FileText },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Header Toggle Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0d1015] border-b border-[#252b34] sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#171c23] border border-[#252b34] flex items-center justify-center text-[#f5f7fa]">
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="font-semibold text-sm text-[#f5f7fa] tracking-tight">Automation Dev OS</span>
            <span className="text-[11px] text-[#9aa3af] block">Personal Learning System</span>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-[#12161c] border border-[#252b34] text-[#9aa3af] hover:text-[#f5f7fa] transition"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`${
          mobileOpen ? 'block fixed inset-y-0 left-0 z-50 w-72' : 'hidden'
        } lg:block w-64 bg-[#0d1015] border-r border-[#252b34] flex flex-col h-screen sticky top-0 shrink-0 select-none`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#252b34] flex items-center space-x-3 bg-[#090b0f]">
          <div className="w-9 h-9 rounded-lg bg-[#171c23] border border-[#252b34] flex items-center justify-center text-[#f5f7fa] shadow-sm">
            <Zap className="w-4.5 h-4.5 text-emerald-400" />
          </div>
          <div>
            <h1 className="font-semibold text-sm tracking-tight text-[#f5f7fa]">
              Automation Dev OS
            </h1>
            <p className="text-[11px] text-[#9aa3af] mt-0.5">
              AI Developer Learning System
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="text-[11px] font-medium text-[#66707c] px-3 mb-2">
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#171c23] text-[#f5f7fa] font-semibold border border-[#252b34] shadow-sm'
                    : 'text-[#9aa3af] hover:text-[#f5f7fa] hover:bg-[#12161c]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-[#66707c]'}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Target Outcome Footer Badge */}
        <div className="p-3.5 border-t border-[#252b34] bg-[#090b0f]">
          <div className="p-3 rounded-lg bg-[#12161c] border border-[#252b34] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#9aa3af] flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                Target Outcome
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <div className="text-xs text-[#f5f7fa] font-semibold tracking-tight">
              Junior / Freelance-Ready
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#66707c] pt-1.5 border-t border-[#252b34]">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#66707c]" /> 26 Weeks
              </span>
              <span>2–3 hrs/day</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile view */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        ></div>
      )}
    </>
  );
}


