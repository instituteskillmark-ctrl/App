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
    if (seconds < 10) return; // Prevent accidental 0-second logs

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
    <div className="bg-[#080d19] border border-slate-800/80 rounded-xl p-5 space-y-4 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <h4 className="font-bold text-xs text-slate-100 font-mono uppercase tracking-wider">
            LIVE STUDY & FOCUS TIMER
          </h4>
        </div>
        {taskTitle && (
          <span className="text-[11px] text-cyan-300 font-mono font-semibold truncate max-w-[220px] bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-800/50">
            {taskTitle}
          </span>
        )}
      </div>

      <div className="text-center py-6 bg-[#0e1420] rounded-xl border border-slate-800/80 space-y-1">
        <div className="text-4xl lg:text-5xl font-bold font-mono text-cyan-300 tracking-wider">
          {formatTime(seconds)}
        </div>
        <div className="text-[10px] text-slate-400 font-mono flex items-center justify-center gap-1.5 pt-1">
          <span
            className={`w-2 h-2 rounded-full ${
              isActive ? 'bg-emerald-400 animate-pulse' : seconds > 0 ? 'bg-amber-400' : 'bg-slate-500'
            }`}
          ></span>
          <span>{isActive ? 'Timer Running' : seconds > 0 ? 'Timer Paused' : 'Ready to Start Session'}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {!isActive ? (
          <button
            onClick={handleStart}
            className="flex-1 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-lg text-xs transition font-mono shadow-md shadow-cyan-950 flex items-center justify-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{seconds > 0 ? 'Resume Timer' : 'Start Session'}</span>
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg text-xs transition font-mono shadow-md shadow-amber-950 flex items-center justify-center gap-1.5"
          >
            <Pause className="w-3.5 h-3.5 fill-current" />
            <span>Pause Timer</span>
          </button>
        )}

        {seconds > 0 && (
          <button
            onClick={handleReset}
            disabled={isPending}
            className="px-3 py-2.5 bg-[#0e1420] hover:bg-slate-900 text-slate-400 rounded-lg text-xs transition font-mono border border-slate-800 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {seconds > 0 && (
        <div className="space-y-3 pt-3 border-t border-slate-800/60">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-mono">Stage:</span>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              className="flex-1 bg-[#0e1420] border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="LEARN">LEARN (Theory)</option>
              <option value="PRACTICE">PRACTICE (Exercises)</option>
              <option value="BUILD">BUILD (Project)</option>
              <option value="REVIEW">REVIEW (Notes & Revision)</option>
            </select>
          </div>

          <input
            type="text"
            placeholder="Session notes / what you accomplished..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-[#0e1420] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
          />

          <button
            onClick={handleCompleteSession}
            disabled={isPending}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs transition font-mono shadow-md shadow-emerald-950 flex items-center justify-center gap-1.5"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Logging Session...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save & Log Session to DB</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
