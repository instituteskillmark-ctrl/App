'use client';

import React, { useTransition } from 'react';
import { actionUpdateTaskStatus } from '@/lib/actions/app-actions';

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

  return (
    <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
      <button
        disabled={isPending}
        onClick={() => handleUpdate('IN_PROGRESS')}
        className={`px-2 py-1 rounded text-[11px] font-medium transition ${
          currentStatus === 'IN_PROGRESS' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        In Progress
      </button>
      <button
        disabled={isPending}
        onClick={() => handleUpdate('COMPLETED')}
        className={`px-2 py-1 rounded text-[11px] font-medium transition ${
          currentStatus === 'COMPLETED' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        Completed
      </button>
      <button
        disabled={isPending}
        onClick={() => handleUpdate('VERIFIED')}
        className={`px-2 py-1 rounded text-[11px] font-medium transition ${
          currentStatus === 'VERIFIED' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        ✓ Verify
      </button>
    </div>
  );
}
