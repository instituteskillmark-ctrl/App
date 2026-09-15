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
    <div className="flex items-center space-x-1 bg-[#12161c] p-1 rounded-lg border border-[#252b34] text-xs shadow-xs">
      <button
        disabled={isPending}
        onClick={() => handleUpdate('IN_PROGRESS')}
        className={`px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center gap-1 ${
          currentStatus === 'IN_PROGRESS'
            ? 'bg-[#171c23] text-amber-400 font-semibold border border-amber-500/30'
            : 'text-[#9aa3af] hover:text-[#f5f7fa] hover:bg-[#171c23]'
        }`}
      >
        <Clock className="w-3 h-3 text-amber-400" />
        <span>In Progress</span>
      </button>

      <button
        disabled={isPending}
        onClick={() => handleUpdate('COMPLETED')}
        className={`px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center gap-1 ${
          currentStatus === 'COMPLETED'
            ? 'bg-[#171c23] text-emerald-400 font-semibold border border-emerald-500/30'
            : 'text-[#9aa3af] hover:text-[#f5f7fa] hover:bg-[#171c23]'
        }`}
      >
        <Check className="w-3 h-3 text-emerald-400" />
        <span>Completed</span>
      </button>

      <button
        disabled={isPending}
        onClick={() => handleUpdate('VERIFIED')}
        className={`px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center gap-1 ${
          currentStatus === 'VERIFIED'
            ? 'bg-[#171c23] text-emerald-400 font-semibold border border-emerald-500/40'
            : 'text-[#9aa3af] hover:text-[#f5f7fa] hover:bg-[#171c23]'
        }`}
      >
        {isPending ? (
          <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" />
        ) : (
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
        )}
        <span>Verified</span>
      </button>
    </div>
  );
}

