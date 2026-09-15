import React from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur px-8 py-4 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-xs font-mono bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-slate-300">Phase 1: Foundation Active</span>
        </div>
      </div>
    </header>
  );
}
