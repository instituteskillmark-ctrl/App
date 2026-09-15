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
  BarChart3,
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
  { label: 'Today Workspace', href: '/today', icon: Target },
  { label: 'AI Assistant', href: '/assistant', icon: Bot },
  { label: 'Projects Portfolio', href: '/projects', icon: FolderKanban },
  { label: 'Progress & Audit', href: '/progress', icon: BarChart3 },
  { label: 'Notes & Specs', href: '/notes', icon: FileText },
  { label: 'OS Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Header Toggle Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0a0f1d] border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-cyan-950/50">
            <Zap className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm text-slate-100 tracking-tight">Automation Dev OS</span>
            <span className="text-[10px] text-cyan-400 font-mono block">v1.0 • Personal System</span>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`${
          mobileOpen ? 'block fixed inset-y-0 left-0 z-50 w-72' : 'hidden'
        } lg:block w-64 bg-[#0a0f1d] border-r border-slate-800/80 flex flex-col h-screen sticky top-0 shrink-0 select-none`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center space-x-3 bg-[#080d19]">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-950/60 ring-1 ring-cyan-400/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-slate-100 flex items-center gap-1.5">
              <span>Automation OS</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-wide mt-0.5">
              AI DEVELOPER ARCHITECTURE
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
            WORKSPACE NAVIGATION
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
                    ? 'bg-[#141f36] text-cyan-300 font-semibold border-l-2 border-cyan-400 border-t border-b border-r border-slate-700/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#111827]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Target Outcome Footer Badge */}
        <div className="p-3.5 border-t border-slate-800/80 bg-[#080d19]">
          <div className="p-3 rounded-lg bg-[#0e1628] border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                TARGET OUTCOME
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <div className="text-xs text-emerald-300 font-bold tracking-tight">
              Strong Junior / Freelance-Ready
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-0.5 border-t border-slate-800/60">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" /> 26 Weeks
              </span>
              <span>~2–3 hrs/day</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile view */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
        ></div>
      )}
    </>
  );
}

