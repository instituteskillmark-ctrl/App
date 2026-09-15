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
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-950/50 text-emerald-300 border border-emerald-800/40 ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          Verified
        </span>
      );
    case 'COMPLETED':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-950/30 text-emerald-300 border border-emerald-800/30 ${className}`}>
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          Completed
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-950/40 text-amber-300 border border-amber-800/40 ${className}`}>
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          In Progress
        </span>
      );
    case 'NOT_STARTED':
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-[#171c23] text-[#9aa3af] border border-[#252b34] ${className}`}>
          <Circle className="w-3 h-3 text-[#66707c]" />
          Not Started
        </span>
      );
  }
}


