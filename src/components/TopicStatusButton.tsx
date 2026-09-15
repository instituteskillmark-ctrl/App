'use client';

import React, { useState, useTransition, useRef, useEffect } from 'react';
import { actionUpdateTaskStatus } from '@/lib/actions/app-actions';
import { CheckCircle2, Check, Clock, Circle, ChevronDown, Loader2 } from 'lucide-react';

type TopicStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED';

interface TopicStatusButtonProps {
  taskId: string;
  currentStatus: TopicStatus;
  className?: string;
}

const statusConfig: Record<
  TopicStatus,
  {
    label: string;
    Icon: React.ElementType;
    color: string;
    bg: string;
    borderColor: string;
  }
> = {
  NOT_STARTED: {
    label: 'Not Started',
    Icon: Circle,
    color: 'var(--text-muted)',
    bg: 'var(--surface-0)',
    borderColor: 'var(--border)',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    Icon: Clock,
    color: 'var(--status-in-progress)',
    bg: 'rgba(10, 132, 255, 0.12)',
    borderColor: 'rgba(10, 132, 255, 0.4)',
  },
  COMPLETED: {
    label: 'Done',
    Icon: Check,
    color: 'var(--status-completed)',
    bg: 'rgba(48, 209, 88, 0.12)',
    borderColor: 'rgba(48, 209, 88, 0.4)',
  },
  VERIFIED: {
    label: 'Verified',
    Icon: CheckCircle2,
    color: 'var(--status-completed)',
    bg: 'rgba(48, 209, 88, 0.22)',
    borderColor: 'var(--status-completed)',
  },
};

export function TopicStatusButton({ taskId, currentStatus, className = '' }: TopicStatusButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  const statusKey = currentStatus || 'NOT_STARTED';
  const current = statusConfig[statusKey] || statusConfig.NOT_STARTED;
  const ActiveIcon = isPending ? Loader2 : current.Icon;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (nextStatus: TopicStatus) => {
    setIsOpen(false);
    if (nextStatus === currentStatus) return;
    startTransition(async () => {
      await actionUpdateTaskStatus(taskId, nextStatus);
    });
  };

  return (
    <div ref={menuRef} className={`relative inline-block text-left ${className}`}>
      {/* Single compact status pill button */}
      <button
        type="button"
        disabled={isPending}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold transition rounded-full shrink-0"
        style={{
          color: current.color,
          background: current.bg,
          border: `1px solid ${current.borderColor}`,
          fontFamily: 'var(--font-mono)',
          cursor: isPending ? 'wait' : 'pointer',
        }}
      >
        <ActiveIcon className={`w-3 h-3 ${isPending ? 'animate-spin' : ''}`} />
        <span>{current.label}</span>
        <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-1 w-36 py-1 z-30 shadow-lg rounded"
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border-strong)',
          }}
        >
          {(Object.keys(statusConfig) as TopicStatus[]).map((stKey) => {
            const item = statusConfig[stKey];
            const ItemIcon = item.Icon;
            const isSelected = stKey === currentStatus;

            return (
              <button
                key={stKey}
                type="button"
                onClick={() => handleSelect(stKey)}
                className="w-full text-left px-3 py-1.5 text-[11px] font-medium flex items-center justify-between transition"
                style={{
                  color: isSelected ? item.color : 'var(--text-secondary)',
                  background: isSelected ? 'var(--surface-0)' : 'transparent',
                  fontFamily: 'var(--font-mono)',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-0)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <ItemIcon className="w-3 h-3" style={{ color: item.color }} />
                  <span>{item.label}</span>
                </div>
                {isSelected && <Check className="w-3 h-3" style={{ color: item.color }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
