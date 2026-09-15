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
        <span
          className={`status-pill inline-flex items-center gap-1.5 ${className}`}
          style={{ background: 'rgba(99,153,34,0.18)', color: 'var(--status-completed)' }}
        >
          <CheckCircle2 className="w-3 h-3" />
          Verified
        </span>
      );
    case 'COMPLETED':
      return (
        <span
          className={`status-pill inline-flex items-center gap-1.5 ${className}`}
          style={{ background: 'rgba(99,153,34,0.12)', color: 'var(--status-completed)' }}
        >
          <Check className="w-3 h-3" />
          Completed
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span
          className={`status-pill inline-flex items-center gap-1.5 ${className}`}
          style={{ background: 'rgba(239,159,39,0.15)', color: 'var(--status-in-progress)' }}
        >
          <Clock className="w-3 h-3" />
          In Progress
        </span>
      );
    case 'NOT_STARTED':
    default:
      return (
        <span
          className={`status-pill inline-flex items-center gap-1.5 ${className}`}
          style={{ background: 'rgba(107,107,112,0.15)', color: 'var(--status-not-started)' }}
        >
          <Circle className="w-3 h-3" />
          Not Started
        </span>
      );
  }
}
