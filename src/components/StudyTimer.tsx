'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import {
  actionStartStudySession,
  actionPauseStudySession,
  actionResumeStudySession,
  actionFinishStudySession,
  actionGetActiveStudySession,
  actionGetTaskStudyTime,
  actionGetRecentStudySessions,
} from '@/lib/actions/app-actions';
import { Play, Pause, CheckCircle2, Clock, Loader2, RefreshCw, History, FileText } from 'lucide-react';

interface StudyTimerProps {
  taskId?: string;
  projectId?: string;
  taskTitle?: string;
}

export type TimerState = 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED';

export function StudyTimer({ taskId, projectId, taskTitle }: StudyTimerProps) {
  const [timerState, setTimerState] = useState<TimerState>('IDLE');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [sessionType, setSessionType] = useState('LEARN');
  const [notes, setNotes] = useState('');
  const [taskStudyTime, setTaskStudyTime] = useState<string>('0m');
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [savedBanner, setSavedBanner] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const startedAtRef = useRef<number | null>(null);
  const totalPausedRef = useRef<number>(0);

  // 1. Recover Active Session and Task Cumulative Time on Mount
  useEffect(() => {
    let isMounted = true;

    async function loadInitialTimerData() {
      // Fetch task cumulative study time if taskId is present
      if (taskId) {
        const taskTime = await actionGetTaskStudyTime(taskId);
        if (isMounted && taskTime) {
          setTaskStudyTime(taskTime.formattedTime);
        }
      }

      // Fetch recent sessions history
      const recent = await actionGetRecentStudySessions(5);
      if (isMounted && recent) {
        setRecentSessions(recent);
      }

      // Check for active (running/paused) session
      const active = await actionGetActiveStudySession(taskId);
      if (isMounted && active) {
        setSessionId(active.id);
        setTimerState(active.status as TimerState);
        setSeconds(active.elapsedSeconds);
        setSessionType(active.sessionType || 'LEARN');
        if (active.notes) setNotes(active.notes);

        startedAtRef.current = new Date(active.startedAt).getTime();
        totalPausedRef.current = active.totalPausedSeconds || 0;
      }
    }

    loadInitialTimerData();
    return () => {
      isMounted = false;
    };
  }, [taskId]);

  // 2. Real-Time Timestamp Clock Tick Loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timerState === 'RUNNING' && startedAtRef.current) {
      interval = setInterval(() => {
        const now = Date.now();
        const totalSpan = Math.floor((now - startedAtRef.current!) / 1000);
        const elapsed = Math.max(0, totalSpan - totalPausedRef.current);
        setSeconds(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState]);

  // 3. START SESSION
  const handleStart = () => {
    setSavedBanner(null);
    startTransition(async () => {
      const res = await actionStartStudySession({
        taskId,
        projectId,
        sessionType,
      });

      if (res.success && res.session) {
        setSessionId(res.session.id);
        setTimerState('RUNNING');
        startedAtRef.current = new Date(res.session.startedAt).getTime();
        totalPausedRef.current = 0;
        setSeconds(0);
      }
    });
  };

  // 4. PAUSE SESSION
  const handlePause = () => {
    if (!sessionId) return;
    startTransition(async () => {
      const res = await actionPauseStudySession(sessionId, taskId);
      if (res.success) {
        setTimerState('PAUSED');
      }
    });
  };

  // 5. RESUME SESSION
  const handleResume = () => {
    if (!sessionId) return;
    startTransition(async () => {
      const res = await actionResumeStudySession(sessionId, taskId);
      if (res.success) {
        // Re-sync active session parameters from server
        const active = await actionGetActiveStudySession(taskId);
        if (active) {
          startedAtRef.current = new Date(active.startedAt).getTime();
          totalPausedRef.current = active.totalPausedSeconds;
          setSeconds(active.elapsedSeconds);
        }
        setTimerState('RUNNING');
      }
    });
  };

  // 6. FINISH SESSION
  const handleFinish = () => {
    if (!sessionId) return;
    startTransition(async () => {
      const res = await actionFinishStudySession({
        sessionId,
        notes,
        sessionType,
        taskId,
      });

      if (res.success) {
        const mins = res.durationMinutes || Math.max(1, Math.round(seconds / 60));
        setSavedBanner(`SESSION SAVED — ${mins} min${mins === 1 ? '' : 's'} recorded`);
        setTimerState('IDLE');
        setSessionId(null);
        setSeconds(0);
        setNotes('');
        startedAtRef.current = null;
        totalPausedRef.current = 0;

        // Refresh cumulative task time & recent history
        if (taskId) {
          const taskTime = await actionGetTaskStudyTime(taskId);
          if (taskTime) setTaskStudyTime(taskTime.formattedTime);
        }
        const recent = await actionGetRecentStudySessions(5);
        if (recent) setRecentSessions(recent);
      }
    });
  };

  const formatTime = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const remainingSecs = sec % 60;

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins
        .toString()
        .padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="p-5 sm:p-6 space-y-6 rounded"
      style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Header & Task Cumulative Study Time */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-400" />
          <h4 className="font-bold text-xs text-white uppercase font-mono tracking-wider">
            Study Timer Workspace
          </h4>
        </div>

        <div className="flex items-center gap-3">
          {taskId && (
            <div className="text-xs font-mono px-3 py-1 rounded bg-purple-950/60 border border-purple-800/40 text-purple-300">
              Task Total Study Time: <span className="font-bold text-white">{taskStudyTime}</span>
            </div>
          )}
          {taskTitle && (
            <span className="text-xs text-slate-400 font-mono truncate max-w-[200px] hidden sm:inline-block">
              {taskTitle}
            </span>
          )}
        </div>
      </div>

      {/* Session Saved Banner */}
      {savedBanner && (
        <div className="p-3.5 rounded bg-emerald-950/70 border border-emerald-700/50 text-emerald-300 text-xs font-mono font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{savedBanner}</span>
        </div>
      )}

      {/* Large Stopwatch Display */}
      <div
        className="text-center py-8 space-y-2 rounded border"
        style={{
          background: 'var(--surface-0)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="text-4xl sm:text-6xl font-bold font-mono text-white tracking-widest">
          {formatTime(seconds)}
        </div>

        <div className="text-xs font-mono flex items-center justify-center gap-2 pt-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              timerState === 'RUNNING'
                ? 'bg-emerald-400 animate-pulse'
                : timerState === 'PAUSED'
                ? 'bg-amber-400'
                : 'bg-slate-600'
            }`}
          ></span>
          <span className="text-slate-300 uppercase tracking-wider font-semibold">
            {timerState === 'RUNNING'
              ? 'Study Session Running'
              : timerState === 'PAUSED'
              ? 'Study Session Paused'
              : 'Timer Ready'}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {timerState === 'IDLE' && (
          <button
            onClick={handleStart}
            disabled={isPending}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded text-xs transition flex items-center justify-center gap-2 shadow"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            <span>START STUDY SESSION</span>
          </button>
        )}

        {timerState === 'RUNNING' && (
          <>
            <button
              onClick={handlePause}
              disabled={isPending}
              className="flex-1 w-full py-3 bg-amber-950/80 hover:bg-amber-900 border border-amber-700/50 text-amber-200 font-semibold rounded text-xs transition flex items-center justify-center gap-2"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pause className="w-4 h-4 fill-current" />}
              <span>PAUSE TIMER</span>
            </button>

            <button
              onClick={handleFinish}
              disabled={isPending}
              className="flex-1 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-xs transition flex items-center justify-center gap-2 shadow"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>FINISH & SAVE SESSION</span>
            </button>
          </>
        )}

        {timerState === 'PAUSED' && (
          <>
            <button
              onClick={handleResume}
              disabled={isPending}
              className="flex-1 w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded text-xs transition flex items-center justify-center gap-2"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              <span>RESUME TIMER</span>
            </button>

            <button
              onClick={handleFinish}
              disabled={isPending}
              className="flex-1 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-xs transition flex items-center justify-center gap-2 shadow"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>FINISH & SAVE SESSION</span>
            </button>
          </>
        )}
      </div>

      {/* Session Metadata Form (when running or paused) */}
      {(timerState === 'RUNNING' || timerState === 'PAUSED') && (
        <div
          className="p-4 space-y-3 rounded border"
          style={{
            background: 'var(--surface-0)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Stage / Focus:</span>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              className="flex-1 bg-[#0b0e14] border border-[#1b202a] rounded px-3 py-1.5 text-xs text-white outline-none font-mono"
            >
              <option value="LEARN">Learn (Theory & Concepts)</option>
              <option value="PRACTICE">Practice (Subtasks & Exercises)</option>
              <option value="BUILD">Build (Practical Project Execution)</option>
              <option value="REVIEW">Review (Notes & Self Check)</option>
            </select>
          </div>

          <input
            type="text"
            placeholder="Optional session notes / key takeaways..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-[#0b0e14] border border-[#1b202a] rounded px-3 py-2 text-xs text-white outline-none font-mono"
          />
        </div>
      )}

      {/* Recent Study Session History */}
      <div className="space-y-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-purple-400" />
            Recent Study Sessions
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {recentSessions.length} recorded
          </span>
        </div>

        {recentSessions.length === 0 ? (
          <div className="text-xs text-slate-500 py-3 text-center font-mono">
            No completed study sessions recorded yet.
          </div>
        ) : (
          <div className="space-y-2">
            {recentSessions.map((s) => (
              <div
                key={s.id}
                className="p-3 rounded border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                style={{
                  background: 'var(--surface-0)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-white flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>{s.taskTitle}</span>
                  </div>
                  {s.notes && (
                    <p className="text-[11px] text-slate-400 font-mono pl-5 italic">
                      "{s.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
                  <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/40 text-purple-300">
                    {s.sessionType}
                  </span>
                  <span className="font-bold text-emerald-400">
                    {s.durationMinutes} min{s.durationMinutes === 1 ? '' : 's'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
