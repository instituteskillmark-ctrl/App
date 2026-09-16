'use client';

import React, { useTransition } from 'react';
import Link from 'next/link';
import { actionUpdateTaskStatus } from '@/lib/actions/app-actions';
import { Play, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';

interface TaskActionButtonProps {
  taskId: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'NEEDS_REVISION' | 'COMPLETED' | 'VERIFIED';
  priority?: string;
  size?: 'normal' | 'large';
}

export function TaskActionButton({ taskId, status, size = 'large' }: TaskActionButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleStart = () => {
    startTransition(async () => {
      await actionUpdateTaskStatus(taskId, 'IN_PROGRESS');
    });
  };

  const isLarge = size === 'large';
  const paddingClass = isLarge ? 'px-6 py-3 text-sm font-semibold' : 'px-4 py-2 text-xs font-semibold';

  if (status === 'NOT_STARTED') {
    return (
      <button
        onClick={handleStart}
        disabled={isPending}
        className={`inline-flex items-center justify-center gap-2.5 transition active:scale-[0.98] ${paddingClass}`}
        style={{
          background: 'var(--accent)',
          color: '#ffffff',
          borderRadius: '4px',
          opacity: isPending ? 0.7 : 1,
          cursor: isPending ? 'wait' : 'pointer',
          border: 'none',
          boxShadow: '0 2px 8px rgba(127,119,221,0.25)',
        }}
      >
        <Play className={isLarge ? 'w-4 h-4 fill-white' : 'w-3.5 h-3.5 fill-white'} />
        <span>{isPending ? 'Starting Task...' : 'START TASK'}</span>
      </button>
    );
  }

  if (status === 'IN_PROGRESS' || status === 'NEEDS_REVISION') {
    return (
      <Link
        href={`/roadmap/task/${taskId}`}
        className={`inline-flex items-center justify-center gap-2.5 transition active:scale-[0.98] ${paddingClass}`}
        style={{
          background: 'var(--accent)',
          color: '#ffffff',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(127,119,221,0.25)',
        }}
      >
        <RotateCcw className={isLarge ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
        <span>CONTINUE TASK</span>
        <ArrowRight className={isLarge ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      </Link>
    );
  }

  return (
    <Link
      href={`/roadmap/task/${taskId}`}
      className={`inline-flex items-center justify-center gap-2.5 transition active:scale-[0.98] ${paddingClass}`}
      style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)',
        borderRadius: '4px',
      }}
    >
      <CheckCircle2 className={isLarge ? 'w-4 h-4 text-emerald-400' : 'w-3.5 h-3.5 text-emerald-400'} />
      <span>VIEW TASK DETAILS</span>
      <ArrowRight className={isLarge ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
    </Link>
  );
}
