import React from 'react';
import { CheckCircle2, Clock, Check, Circle } from 'lucide-react';

type Status = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  switch (status) {
    case 'VERIFIED':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-700/80 shadow-xs ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          VERIFIED
        </span>
      );
    case 'COMPLETED':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-700/80 shadow-xs ${className}`}>
          <Check className="w-3.5 h-3.5 text-cyan-400" />
          COMPLETED
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider bg-indigo-950 text-indigo-300 border border-indigo-700/80 shadow-xs ${className}`}>
          <Clock className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          IN PROGRESS
        </span>
      );
    case 'NOT_STARTED':
    default:
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-medium tracking-wider bg-slate-900 text-slate-400 border border-slate-800 ${className}`}>
          <Circle className="w-3 h-3 text-slate-500" />
          NOT STARTED
        </span>
      );
  }
}

