import React from 'react';
import { Activity } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="border-b border-slate-800/80 bg-[#080d19]/90 backdrop-blur-md px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-0 z-20">
      <div>
        <h2 className="text-lg lg:text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
          {title}
        </h2>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5 font-mono">{subtitle}</p>}
      </div>
      <div className="flex items-center space-x-3 shrink-0">
        <div className="flex items-center space-x-2 text-[11px] font-mono bg-[#0e1628] px-3 py-1.5 rounded-md border border-slate-800 text-slate-300">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Phase 1: Foundation Active</span>
        </div>
      </div>
    </header>
  );
}

