import React from 'react';
import { Activity } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="border-b border-[#252b34] bg-[#0d1015]/95 backdrop-blur-md px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-0 z-20">
      <div>
        <h2 className="text-lg lg:text-xl font-semibold text-[#f5f7fa] tracking-tight">
          {title}
        </h2>
        {subtitle && <p className="text-xs text-[#9aa3af] mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center space-x-3 shrink-0">
        <div className="flex items-center space-x-2 text-xs text-[#9aa3af] bg-[#12161c] px-3 py-1.5 rounded-lg border border-[#252b34]">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-medium text-[#f5f7fa]">Phase 1 Active</span>
        </div>
      </div>
    </header>
  );
}


