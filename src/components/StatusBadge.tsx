import React from 'react';

type Status = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  switch (status) {
    case 'VERIFIED':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/60 ${className}`}>
          ✓ VERIFIED
        </span>
      );
    case 'COMPLETED':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-950 text-blue-300 border border-blue-700/60 ${className}`}>
          COMPLETED
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-700/60 ${className}`}>
          IN PROGRESS
        </span>
      );
    case 'NOT_STARTED':
    default:
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-900 text-slate-400 border border-slate-800 ${className}`}>
          NOT STARTED
        </span>
      );
  }
}
