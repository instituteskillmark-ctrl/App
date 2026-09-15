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
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-950/40 text-rose-300 border border-rose-800/40 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
          Master
        </span>
      );
    case 'IMPORTANT':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950/40 text-amber-300 border border-amber-800/40 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
          Important
        </span>
      );
    case 'BASICS_ENOUGH':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#171c23] text-[#9aa3af] border border-[#252b34] ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#66707c] mr-1.5"></span>
          Basics
        </span>
      );
    default:
      return null;
  }
}


