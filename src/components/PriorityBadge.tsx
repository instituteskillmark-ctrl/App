import React from 'react';

type Priority = 'MASTER' | 'IMPORTANT' | 'BASICS_ENOUGH';

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export function PriorityBadge({ priority, className = '' }: PriorityBadgeProps) {
  switch (priority) {
    case 'MASTER':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider bg-rose-950/80 text-rose-300 border border-rose-800/60 shadow-xs ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 animate-pulse"></span>
          MASTER
        </span>
      );
    case 'IMPORTANT':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider bg-amber-950/80 text-amber-300 border border-amber-800/60 shadow-xs ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
          IMPORTANT
        </span>
      );
    case 'BASICS_ENOUGH':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 shadow-xs ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
          BASICS ENOUGH
        </span>
      );
    default:
      return null;
  }
}

