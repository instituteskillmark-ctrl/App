'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Roadmap', href: '/roadmap', icon: '🗺️' },
  { label: 'Today', href: '/today', icon: '🎯' },
  { label: 'Assistant', href: '/assistant', icon: '🤖' },
  { label: 'Projects', href: '/projects', icon: '🛠️' },
  { label: 'Progress', href: '/progress', icon: '📈' },
  { label: 'Notes', href: '/notes', icon: '📝' },
  { label: 'Settings', href: '/settings', icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Header Toggle Bar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800 sticky top-0 z-30">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
            OS
          </div>
          <span className="font-bold text-sm text-slate-100 font-mono">Automation Dev OS</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs"
        >
          {mobileOpen ? '✕ Close' : '☰ Menu'}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`${
          mobileOpen ? 'block fixed inset-y-0 left-0 z-40' : 'hidden'
        } lg:block w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col h-screen sticky top-0`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-950">
            OS
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-slate-100">Automation Dev OS</h1>
            <p className="text-[11px] text-slate-400 font-mono">v1.0 • Personal System</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
            Workspace
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Target Level Badge */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/50">
          <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
            <div className="text-slate-400 font-medium">Target Outcome:</div>
            <div className="text-emerald-400 font-semibold mt-0.5">Strong Junior / Freelance-Ready</div>
            <div className="text-[11px] text-slate-500 mt-1 font-mono">26 Weeks • ~2-3 hrs/day</div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile view */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
        ></div>
      )}
    </>
  );
}
