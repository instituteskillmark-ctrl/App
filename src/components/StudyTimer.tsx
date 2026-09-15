'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { actionLogStudySession } from '@/lib/actions/app-actions';
import { Play, Pause, RotateCcw, CheckCircle2, Clock, Loader2 } from 'lucide-react';

interface StudyTimerProps {
  taskId?: string;
  projectId?: string;
  taskTitle?: string;
}

export function StudyTimer({ taskId, projectId, taskTitle }: StudyTimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState('LEARN');
  const [notes, setNotes] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const handleStart = () => setIsActive(true);
  const handlePause = () => setIsActive(false);

  const handleReset = () => {
    setIsActive(false);
    setSeconds(0);
  };

  const handleCompleteSession = () => {
    if (seconds < 10) return;

    const durationMinutes = Math.max(1, Math.round(seconds / 60));

    startTransition(async () => {
      await actionLogStudySession({
        taskId,
        projectId,
        durationMinutes,
        sessionType,
        notes,
      });
      setIsActive(false);
      setSeconds(0);
      setNotes('');
    });
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#12161c] border border-[#252b34] rounded-xl p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#252b34] pb-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-[#9aa3af]" />
          <h4 className="font-semibold text-xs text-[#f5f7fa] uppercase tracking-wider">
            Study Timer
          </h4>
        </div>
        {taskTitle && (
          <span className="text-xs text-[#9aa3af] font-medium truncate max-w-[220px] bg-[#171c23] px-2.5 py-0.5 rounded border border-[#252b34]">
            {taskTitle}
          </span>
        )}
      </div>

      <div className="text-center py-6 bg-[#171c23] rounded-xl border border-[#252b34] space-y-1">
        <div className="text-4xl lg:text-5xl font-bold text-[#f5f7fa] tracking-wider">
          {formatTime(seconds)}
        </div>
        <div className="text-xs text-[#9aa3af] flex items-center justify-center gap-1.5 pt-1">
          <span
            className={`w-2 h-2 rounded-full ${
              isActive ? 'bg-emerald-400' : seconds > 0 ? 'bg-amber-400' : 'bg-[#66707c]'
            }`}
          ></span>
          <span>{isActive ? 'Timer Running' : seconds > 0 ? 'Timer Paused' : 'Ready to Start'}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {!isActive ? (
          <button
            onClick={handleStart}
            className="flex-1 py-2.5 bg-[#f5f7fa] hover:bg-white text-[#08090c] font-semibold rounded-lg text-xs transition flex items-center justify-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{seconds > 0 ? 'Resume Timer' : 'Start Session'}</span>
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex-1 py-2.5 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800/40 text-amber-300 font-semibold rounded-lg text-xs transition flex items-center justify-center gap-1.5"
          >
            <Pause className="w-3.5 h-3.5 fill-current" />
            <span>Pause Timer</span>
          </button>
        )}

        {seconds > 0 && (
          <button
            onClick={handleReset}
            disabled={isPending}
            className="px-3 py-2.5 bg-[#171c23] hover:bg-[#252b34] text-[#9aa3af] rounded-lg text-xs transition border border-[#252b34] flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {seconds > 0 && (
        <div className="space-y-3 pt-3 border-t border-[#252b34]">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#9aa3af]">Stage:</span>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              className="flex-1 bg-[#171c23] border border-[#252b34] rounded-md px-2.5 py-1.5 text-xs text-[#f5f7fa] focus:outline-none focus:border-[#374151]"
            >
              <option value="LEARN">Learn (Theory)</option>
              <option value="PRACTICE">Practice (Exercises)</option>
              <option value="BUILD">Build (Project)</option>
              <option value="REVIEW">Review (Notes)</option>
            </select>
          </div>

          <input
            type="text"
            placeholder="Session notes / what you accomplished..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-[#171c23] border border-[#252b34] rounded-lg px-3 py-2 text-xs text-[#f5f7fa] focus:outline-none focus:border-[#374151]"
          />

          <button
            onClick={handleCompleteSession}
            disabled={isPending}
            className="w-full py-2.5 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/40 text-emerald-300 font-semibold rounded-lg text-xs transition flex items-center justify-center gap-1.5"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Logging Session...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Log Session</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

