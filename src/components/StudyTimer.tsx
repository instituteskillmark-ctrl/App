'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { actionLogStudySession } from '@/lib/actions/app-actions';

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
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <div className="flex items-center space-x-2">
          <span className="text-base">⏱️</span>
          <h4 className="font-bold text-sm text-slate-100">Live Study & Focus Timer</h4>
        </div>
        {taskTitle && <span className="text-xs text-cyan-400 font-mono font-medium truncate max-w-[200px]">{taskTitle}</span>}
      </div>

      <div className="text-center py-4 bg-slate-900/60 rounded-xl border border-slate-800">
        <div className="text-4xl font-bold font-mono text-cyan-300 tracking-wider">
          {formatTime(seconds)}
        </div>
        <div className="text-[11px] text-slate-500 font-mono mt-1">
          {isActive ? '● Timer Active' : seconds > 0 ? '⏸ Timer Paused' : 'Ready to Start Session'}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {!isActive ? (
          <button
            onClick={handleStart}
            className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg text-xs transition font-mono shadow-md shadow-cyan-950"
          >
            {seconds > 0 ? 'Resume Timer' : 'Start Session'}
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg text-xs transition font-mono shadow-md shadow-amber-950"
          >
            Pause Timer
          </button>
        )}

        {seconds > 0 && (
          <button
            onClick={handleReset}
            disabled={isPending}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-lg text-xs transition font-mono border border-slate-800"
          >
            Reset
          </button>
        )}
      </div>

      {seconds > 0 && (
        <div className="space-y-3 pt-3 border-t border-slate-900">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-mono">Stage:</span>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 font-mono focus:outline-none"
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
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none"
          />

          <button
            onClick={handleCompleteSession}
            disabled={isPending}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs transition font-mono shadow-md shadow-emerald-950"
          >
            {isPending ? 'Logging Session...' : 'Save & Log Session to DB'}
          </button>
        </div>
      )}
    </div>
  );
}
