'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, Sparkles } from 'lucide-react';

export const PomodoroWidget: React.FC = () => {
  const [mode, setMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getDuration = (m: 'focus' | 'shortBreak' | 'longBreak') => {
    switch (m) {
      case 'focus':
        return 25 * 60;
      case 'shortBreak':
        return 5 * 60;
      case 'longBreak':
        return 15 * 60;
    }
  };

  const handleModeChange = (newMode: 'focus' | 'shortBreak' | 'longBreak') => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(getDuration(newMode));
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (mode === 'focus') {
              setCompletedSessions((s) => s + 1);
            }
            // Trigger audio or vibration if supported
            if (typeof window !== 'undefined' && 'vibrate' in navigator) {
              navigator.vibrate([200, 100, 200]);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode]);

  const toggleRun = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getDuration(mode));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent =
    ((getDuration(mode) - timeLeft) / getDuration(mode)) * 100;

  return (
    <div className="glass-card rounded-3xl p-5 border border-white/10 space-y-3.5 relative overflow-hidden shadow-lg bg-gradient-to-br from-zinc-900/90 via-zinc-900/60 to-purple-950/20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">番茄专注时钟</h3>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-zinc-400">
          <span>今日已专注:</span>
          <span className="font-bold text-amber-400">{completedSessions}</span>
          <span>🍅</span>
        </div>
      </div>

      {/* Mode Selectors */}
      <div className="flex items-center justify-center gap-1.5 bg-zinc-950/60 p-1 rounded-2xl border border-white/5">
        <button
          onClick={() => handleModeChange('focus')}
          className={`flex-1 py-1 rounded-xl text-xs font-medium transition-all ${
            mode === 'focus'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          专注 (25m)
        </button>
        <button
          onClick={() => handleModeChange('shortBreak')}
          className={`flex-1 py-1 rounded-xl text-xs font-medium transition-all ${
            mode === 'shortBreak'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          短休 (5m)
        </button>
        <button
          onClick={() => handleModeChange('longBreak')}
          className={`flex-1 py-1 rounded-xl text-xs font-medium transition-all ${
            mode === 'longBreak'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          长休 (15m)
        </button>
      </div>

      {/* Main Clock Face & Progress */}
      <div className="py-2 flex flex-col items-center justify-center">
        <div className="text-4xl font-extrabold tracking-tight font-mono text-white mb-2">
          {formatTime(timeLeft)}
        </div>

        {/* Progress line */}
        <div className="w-4/5 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              mode === 'focus'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 pt-1">
        <button
          onClick={toggleRun}
          className={`px-5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all shadow-md ${
            isRunning
              ? 'bg-amber-600/90 hover:bg-amber-500 text-white'
              : 'bg-purple-600 hover:bg-purple-500 text-white'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>暂停</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>开始专注</span>
            </>
          )}
        </button>

        <button
          onClick={resetTimer}
          className="p-2 rounded-2xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-300 border border-white/10 transition-all"
          title="重置"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
