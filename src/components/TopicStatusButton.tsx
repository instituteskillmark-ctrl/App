'use client';

import React, { useTransition } from 'react';
import { actionUpdateTaskStatus } from '@/lib/actions/app-actions';
import { CheckCircle2, Check, Clock, Loader2 } from 'lucide-react';

interface TopicStatusButtonProps {
  taskId: string;
  currentStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED';
}

export function TopicStatusButton({ taskId, currentStatus }: TopicStatusButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (nextStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED') => {
    startTransition(async () => {
      await actionUpdateTaskStatus(taskId, nextStatus);
    });
  };

  const buttons = [
    {
      value: 'IN_PROGRESS' as const,
      label: 'In Progress',
      Icon: Clock,
      activeColor: 'var(--status-in-progress)',
    },
    {
      value: 'COMPLETED' as const,
      label: 'Done',
      Icon: Check,
      activeColor: 'var(--status-completed)',
    },
    {
      value: 'VERIFIED' as const,
      label: 'Verified',
      Icon: isPending ? Loader2 : CheckCircle2,
      activeColor: 'var(--status-completed)',
    },
  ];

  return (
    <div
      className="flex items-center gap-0.5 p-0.5"
      style={{
        background: 'var(--surface-0)',
        border: '1px solid var(--border)',
        borderRadius: '4px',
      }}
    >
      {buttons.map(({ value, label, Icon, activeColor }) => {
        const isActive = currentStatus === value;
        return (
          <button
            key={value}
            disabled={isPending}
            onClick={() => handleUpdate(value)}
            className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium transition"
            style={{
              borderRadius: '3px',
              background: isActive ? 'var(--surface-1)' : 'transparent',
              color: isActive ? activeColor : 'var(--text-muted)',
              border: isActive ? '1px solid var(--border-strong)' : '1px solid transparent',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <Icon className={`w-3 h-3 ${isPending && isActive ? 'animate-spin' : ''}`} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
