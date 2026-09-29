'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TodoItem } from '@/types';
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  Target,
  X,
  CheckCircle2,
  Flame,
  Award
} from 'lucide-react';

interface PomodoroWidgetProps {
  activeTodo?: TodoItem | null;
  onClearActiveTodo?: () => void;
  onCompleteActiveTodo?: (id: string) => void;
}

export const PomodoroWidget: React.FC<PomodoroWidgetProps> = ({
  activeTodo,
  onClearActiveTodo,
  onCompleteActiveTodo,
}) => {
  const [mode, setMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [ambientSound, setAmbientSound] = useState<'off' | 'rain' | 'brown'>('off');
  const [showCompletionPrompt, setShowCompletionPrompt] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);

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

  // If parent sets an active todo, automatically switch to focus mode
  useEffect(() => {
    if (activeTodo) {
      setMode('focus');
      setTimeLeft(25 * 60);
      setShowCompletionPrompt(false);
    }
  }, [activeTodo]);

  // Ambient noise synthesizer via Web Audio API
  const stopAmbientSound = () => {
    if (noiseSourceRef.current) {
      try {
        noiseSourceRef.current.stop();
      } catch (e) {}
      noiseSourceRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
      audioCtxRef.current = null;
    }
  };

  const startAmbientSound = (type: 'rain' | 'brown') => {
    stopAmbientSound();
    if (typeof window === 'undefined') return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'brown') {
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5;
        } else {
          // Rain like
          data[i] = (lastOut + 0.06 * white) / 1.06;
          lastOut = data[i];
          data[i] *= 2.0;
        }
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.035, ctx.currentTime);

      noise.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
      noiseSourceRef.current = noise;
    } catch (e) {
      console.warn('Web Audio Ambient error:', e);
    }
  };

  useEffect(() => {
    if (isRunning && ambientSound !== 'off') {
      startAmbientSound(ambientSound);
    } else {
      stopAmbientSound();
    }
    return () => stopAmbientSound();
  }, [isRunning, ambientSound]);

  // Timer loop
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            stopAmbientSound();
            if (mode === 'focus') {
              setCompletedSessions((s) => s + 1);
              if (activeTodo) {
                setShowCompletionPrompt(true);
              }
            }
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
  }, [isRunning, mode, activeTodo]);

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

  const duration = getDuration(mode);
  const progressPercent = ((duration - timeLeft) / duration) * 100;

  return (
    <div className="glass-card rounded-3xl p-5 border border-white/10 space-y-3.5 relative overflow-hidden shadow-2xl bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-purple-950/30 flex flex-col justify-between h-full">
      {/* Background ambient lighting */}
      <div className="absolute -top-16 -right-16 w-44 h-44 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">沉浸番茄专注</h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Ambient Sound Selector */}
          <button
            onClick={() => {
              const modes: ('off' | 'rain' | 'brown')[] = ['off', 'rain', 'brown'];
              const next = modes[(modes.indexOf(ambientSound) + 1) % 3];
              setAmbientSound(next);
            }}
            className={`px-2 py-1 rounded-xl text-[10px] border flex items-center gap-1 transition-all cursor-pointer ${
              ambientSound !== 'off'
                ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                : 'bg-white/5 border-white/5 text-zinc-400 hover:text-zinc-200'
            }`}
            title="点击切换白噪音专注伴侣"
          >
            {ambientSound === 'off' ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 text-purple-400" />}
            <span>{ambientSound === 'off' ? '静音' : ambientSound === 'rain' ? '🌧️雨声' : '☕褐噪'}</span>
          </button>

          <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-bold text-amber-400">{completedSessions}</span>
            <span>🍅</span>
          </div>
        </div>
      </div>

      {/* Active Focus Target Pill (Linked to Todo) */}
      {activeTodo && (
        <div className="relative z-10 p-2.5 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-between gap-2 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                正在攻坚目标:
              </span>
              <p className="text-xs font-semibold text-white truncate">{activeTodo.title}</p>
            </div>
          </div>

          {onClearActiveTodo && (
            <button
              onClick={onClearActiveTodo}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="解除关联"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Mode Selectors */}
      <div className="flex items-center justify-center gap-1 bg-zinc-950/70 p-1 rounded-2xl border border-white/5 relative z-10">
        <button
          onClick={() => handleModeChange('focus')}
          className={`flex-1 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            mode === 'focus' ? 'bg-purple-600 text-white shadow-sm font-semibold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          专注 25m
        </button>
        <button
          onClick={() => handleModeChange('shortBreak')}
          className={`flex-1 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            mode === 'shortBreak' ? 'bg-emerald-600 text-white shadow-sm font-semibold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          短休 5m
        </button>
        <button
          onClick={() => handleModeChange('longBreak')}
          className={`flex-1 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            mode === 'longBreak' ? 'bg-blue-600 text-white shadow-sm font-semibold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          长休 15m
        </button>
      </div>

      {/* Main Clock Face & Progress */}
      <div className="py-2 flex flex-col items-center justify-center relative z-10">
        <div className="text-5xl font-black tracking-tight font-mono text-white mb-2.5">
          {formatTime(timeLeft)}
        </div>

        {/* Progress bar */}
        <div className="w-4/5 h-2 bg-zinc-950 rounded-full overflow-hidden border border-white/5">
          <div
            className={`h-full transition-all duration-1000 ${
              mode === 'focus' ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Completion Modal / Prompt */}
      {showCompletionPrompt && activeTodo && (
        <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-2 animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-300">专注周期达成！</span>
          </div>
          <p className="text-[11px] text-zinc-300">是否将「{activeTodo.title}」标记为已完成？</p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                if (onCompleteActiveTodo) onCompleteActiveTodo(activeTodo.id);
                setShowCompletionPrompt(false);
              }}
              className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>标记已完成</span>
            </button>
            <button
              onClick={() => setShowCompletionPrompt(false)}
              className="px-3 py-1.5 rounded-xl bg-white/5 text-zinc-400 text-xs hover:text-white transition-colors cursor-pointer"
            >
              稍后
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 relative z-10 pt-1">
        <button
          onClick={toggleRun}
          className={`px-6 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 active:scale-95 transition-all shadow-lg cursor-pointer ${
            isRunning
              ? 'bg-amber-600/90 hover:bg-amber-500 text-white shadow-amber-600/20'
              : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>暂停</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>{activeTodo ? '开始攻坚' : '开始专注'}</span>
            </>
          )}
        </button>

        <button
          onClick={resetTimer}
          className="p-2.5 rounded-2xl bg-zinc-800/80 hover:bg-zinc-700 active:scale-95 text-zinc-300 border border-white/10 transition-all cursor-pointer"
          title="重置计时"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
