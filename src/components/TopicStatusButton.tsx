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

  return (
    <div className="flex items-center space-x-1 bg-[#0a0f1d] p-1 rounded-lg border border-slate-800/80 text-xs shadow-xs">
      <button
        disabled={isPending}
        onClick={() => handleUpdate('IN_PROGRESS')}
        className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition flex items-center gap-1 ${
          currentStatus === 'IN_PROGRESS'
            ? 'bg-indigo-600/90 text-white font-semibold border border-indigo-500/50 shadow-xs'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
        }`}
      >
        <Clock className="w-3 h-3 text-indigo-300" />
        <span>In Progress</span>
      </button>

      <button
        disabled={isPending}
        onClick={() => handleUpdate('COMPLETED')}
        className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition flex items-center gap-1 ${
          currentStatus === 'COMPLETED'
            ? 'bg-cyan-600/90 text-white font-semibold border border-cyan-500/50 shadow-xs'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
        }`}
      >
        <Check className="w-3 h-3 text-cyan-300" />
        <span>Complete</span>
      </button>

      <button
        disabled={isPending}
        onClick={() => handleUpdate('VERIFIED')}
        className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition flex items-center gap-1 ${
          currentStatus === 'VERIFIED'
            ? 'bg-emerald-600/90 text-white font-semibold border border-emerald-500/50 shadow-xs'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
        }`}
      >
        {isPending ? (
          <Loader2 className="w-3 h-3 text-white animate-spin" />
        ) : (
          <CheckCircle2 className="w-3 h-3 text-emerald-300" />
        )}
        <span>Verify</span>
      </button>
    </div>
  );
}

