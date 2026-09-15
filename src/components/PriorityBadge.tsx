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
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-950/80 text-red-300 border border-red-800/50 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 animate-pulse"></span>
          MASTER
        </span>
      );
    case 'IMPORTANT':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/50 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
          IMPORTANT
        </span>
      );
    case 'BASICS_ENOUGH':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
          BASICS ENOUGH
        </span>
      );
    default:
      return null;
  }
}
