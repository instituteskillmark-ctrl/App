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
        <span
          className={`inline-flex items-center gap-1 tag-master ${className}`}
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Master
        </span>
      );
    case 'IMPORTANT':
      return (
        <span
          className={`inline-flex items-center gap-1 tag-important ${className}`}
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Important
        </span>
      );
    case 'BASICS_ENOUGH':
      return (
        <span
          className={`inline-flex items-center gap-1 tag-basics ${className}`}
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Basics
        </span>
      );
    default:
      return null;
  }
}
