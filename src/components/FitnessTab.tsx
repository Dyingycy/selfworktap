'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Dumbbell,
  Calendar as CalendarIcon,
  Flame,
  Trophy,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Info,
  CalendarCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { WorkoutLog, MuscleGroup, ExerciseLog, WorkoutSet } from '@/types';
import {
  MUSCLE_GROUPS_META,
  EXERCISE_PRESETS,
  INITIAL_WORKOUT_LOGS,
  calculateWorkoutStreak,
  getMuscleDistribution,
  estimate1RM,
} from '@/lib/services/fitnessService';

const STORAGE_KEY = 'personal_os_workout_logs';

export const FitnessTab: React.FC = () => {
  // === Data State ===
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'logger' | 'calendar' | 'history'>('logger');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  // Sound generator
  const playSound = (type: 'check' | 'finish' | 'timer') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (type === 'check') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'timer') {
        [0, 0.12, 0.24].forEach((offset, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(880 + idx * 80, ctx.currentTime + offset);
          gain.gain.setValueAtTime(0.2, ctx.currentTime + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.1);
          osc.start(ctx.currentTime + offset);
          osc.stop(ctx.currentTime + offset + 0.1);
        });
      } else if (type === 'finish') {
        const freqs = [523.25, 659.25, 783.99, 1046.5];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          const startTime = ctx.currentTime + idx * 0.08;
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.18, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
          osc.start(startTime);
          osc.stop(startTime + 0.35);
        });
      }
    } catch {
      // AudioContext muted/unsupported
    }
  };

  // Initial load: load only user's genuine logs, purging any previously seeded dummy logs
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const dummyIds = new Set(['log-1', 'log-2', 'log-3', 'log-4', 'log-5', 'log-6', 'log-7']);
          const realLogs = parsed.filter((l: WorkoutLog) => !dummyIds.has(l.id));
          setLogs(realLogs);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(realLogs));
          return;
        }
      }
      setLogs([]);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    } catch (e) {
      setLogs([]);
    }
  }, []);

  const saveLogs = (newLogs: WorkoutLog[]) => {
    setLogs(newLogs);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newLogs));
    } catch (e) {
      console.error('Failed to save workout logs', e);
    }
  };

  // === Logger State (Hevy / Strong style) ===
  const [workoutDate, setWorkoutDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );
  const [workoutTitle, setWorkoutTitle] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [intensity, setIntensity] = useState<'light' | 'moderate' | 'intense' | 'extreme'>('moderate');
  const [workoutNotes, setWorkoutNotes] = useState<string>('');

  // Selected exercises for today's session (starts completely clean!)
  const [activeExercises, setActiveExercises] = useState<ExerciseLog[]>([]);

  // Exercise Picker Drawer / Section State
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<MuscleGroup>('chest');
  const [customExerciseName, setCustomExerciseName] = useState<string>('');

  // Rest Timer State
  const [restTimerSeconds, setRestTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isTimerRunning && restTimerSeconds > 0) {
      timerIntervalRef.current = setInterval(() => {
        setRestTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current!);
            setIsTimerRunning(false);
            playSound('timer');
            showToast('⏰ 间歇时间到！开始下一组！');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, restTimerSeconds]);

  const startRestTimer = (seconds: number) => {
    setRestTimerSeconds(seconds);
    setIsTimerRunning(true);
  };

  // Add exercise to active session
  const handleAddPresetExercise = (preset: { name: string; muscleGroup: MuscleGroup; defaultWeight: number; defaultReps: number }) => {
    // Check if already added
    const exists = activeExercises.some((ex) => ex.exerciseName === preset.name);
    if (exists) {
      showToast(`已在当前训练中包含：${preset.name}`);
      return;
    }

    const newEx: ExerciseLog = {
      id: `ex-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      exerciseName: preset.name,
      muscleGroup: preset.muscleGroup,
      sets: [
        { id: `s-${Date.now()}-1`, setNumber: 1, weightKg: preset.defaultWeight, reps: preset.defaultReps, completed: false },
        { id: `s-${Date.now()}-2`, setNumber: 2, weightKg: preset.defaultWeight, reps: preset.defaultReps, completed: false },
        { id: `s-${Date.now()}-3`, setNumber: 3, weightKg: preset.defaultWeight, reps: preset.defaultReps, completed: false },
      ],
    };

    setActiveExercises([...activeExercises, newEx]);
    showToast(`已添加动作: ${preset.name}`);
  };

  const handleAddCustomExercise = () => {
    const trimmed = customExerciseName.trim();
    if (!trimmed) return;
    handleAddPresetExercise({
      name: trimmed,
      muscleGroup: selectedMuscleFilter,
      defaultWeight: 20,
      defaultReps: 10,
    });
    setCustomExerciseName('');
  };

  // Set actions
  const handleToggleSetComplete = (exId: string, setId: string) => {
    setActiveExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) => {
            if (s.id !== setId) return s;
            const nextCompleted = !s.completed;
            if (nextCompleted) {
              playSound('check');
            }
            return { ...s, completed: nextCompleted };
          }),
        };
      })
    );
  };

  const handleUpdateSetWeight = (exId: string, setId: string, newWeight: number) => {
    const safeWeight = Math.max(0, Math.round(newWeight * 10) / 10);
    setActiveExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) => (s.id === setId ? { ...s, weightKg: safeWeight } : s)),
        };
      })
    );
  };

  const handleUpdateSetReps = (exId: string, setId: string, newReps: number) => {
    const safeReps = Math.max(1, Math.min(999, Math.round(newReps)));
    setActiveExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) => (s.id === setId ? { ...s, reps: safeReps } : s)),
        };
      })
    );
  };

  const handleAddNextSet = (exId: string) => {
    setActiveExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exId) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        const newSetNumber = ex.sets.length + 1;
        const newSet: WorkoutSet = {
          id: `s-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          setNumber: newSetNumber,
          weightKg: lastSet ? lastSet.weightKg : 20,
          reps: lastSet ? lastSet.reps : 10,
          completed: false,
        };
        return {
          ...ex,
          sets: [...ex.sets, newSet],
        };
      })
    );
    showToast('已添加下一组');
  };

  const handleRemoveSet = (exId: string, setId: string) => {
    setActiveExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exId) return ex;
        const filtered = ex.sets.filter((s) => s.id !== setId);
        // re-number remaining sets
        const renumbered = filtered.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
        return { ...ex, sets: renumbered };
      })
    );
  };

  const handleRemoveExercise = (exId: string) => {
    setActiveExercises((prev) => prev.filter((ex) => ex.id !== exId));
    showToast('已移除该动作');
  };

  // Calculations for active workout
  const activeWorkoutStats = useMemo(() => {
    let totalSets = 0;
    let completedSets = 0;
    let totalVolumeKg = 0;
    const muscleSet = new Set<MuscleGroup>();

    activeExercises.forEach((ex) => {
      muscleSet.add(ex.muscleGroup);
      ex.sets.forEach((s) => {
        totalSets++;
        if (s.completed) {
          completedSets++;
          totalVolumeKg += s.weightKg * s.reps;
        }
      });
    });

    return {
      totalSets,
      completedSets,
      totalVolumeKg,
      muscleGroups: Array.from(muscleSet),
    };
  }, [activeExercises]);

  // Finish and save workout
  const handleFinishWorkout = () => {
    if (activeExercises.length === 0) {
      showToast('⚠️ 请至少添加一个训练动作！');
      return;
    }

    const muscleGroups = activeWorkoutStats.muscleGroups.length > 0
      ? activeWorkoutStats.muscleGroups
      : ['chest' as MuscleGroup];

    // Build exercises text summary
    const summaryList = activeExercises.map((ex) => {
      const topSet = [...ex.sets].sort((a, b) => b.weightKg - a.weightKg)[0];
      const maxWeight = topSet ? `${topSet.weightKg}kg·` : '';
      return `${ex.exerciseName} ${maxWeight}${ex.sets.length}组`;
    });

    const newLog: WorkoutLog = {
      id: `log-${Date.now()}`,
      date: workoutDate,
      title: workoutTitle.trim() || `${MUSCLE_GROUPS_META[muscleGroups[0]]?.name || '综合'}力量训练`,
      muscleGroups,
      durationMinutes,
      exercisesList: activeExercises,
      exercises: summaryList.join(', '),
      totalVolumeKg: activeWorkoutStats.totalVolumeKg,
      intensity,
      notes: workoutNotes.trim() || undefined,
      completedAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };

    // Prepend new log
    const updated = [newLog, ...logs.filter((l) => l.id !== newLog.id)];
    saveLogs(updated);
    playSound('finish');
    showToast('🎉 恭喜完成训练打卡！铁铸身躯，意志永存！');

    // Reset logger state for next session
    setActiveExercises([]);
    setWorkoutTitle('');
    setWorkoutNotes('');

    // Switch to calendar to see results
    setActiveSubTab('calendar');
    setSelectedCalendarDate(workoutDate);
  };

  // Delete a single saved log
  const handleDeleteLog = (logId: string) => {
    if (window.confirm('确认要删除这条训练打卡记录吗？')) {
      const filtered = logs.filter((l) => l.id !== logId);
      saveLogs(filtered);
      showToast('已删除训练记录');
    }
  };

  // Clear all saved workout logs
  const handleClearAllLogs = () => {
    if (window.confirm('确认清空所有历史健身记录吗？清空后将从零开始记录。')) {
      saveLogs([]);
      showToast('已清空全部训练记录');
    }
  };

  // === Global Dashboard Stats ===
  const streakDays = useMemo(() => calculateWorkoutStreak(logs), [logs]);
  const distribution = useMemo(() => getMuscleDistribution(logs), [logs]);

  // Top trained muscle
  const mostTrainedMuscle = useMemo(() => {
    let max = -1;
    let top: MuscleGroup = 'chest';
    (Object.keys(distribution) as MuscleGroup[]).forEach((mg) => {
      if (distribution[mg] > max) {
        max = distribution[mg];
        top = mg;
      }
    });
    return { group: top, count: max };
  }, [distribution]);

  // Overall stats
  const totalLifetimeVolume = useMemo(() => {
    return logs.reduce((sum, l) => sum + (l.totalVolumeKg || 0), 0);
  }, [logs]);

  // === Calendar State ===
  const [calendarYear, setCalendarYear] = useState<number>(2026);
  const [calendarMonth, setCalendarMonth] = useState<number>(8); // 0-indexed: 8 is September
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );

  // Month navigation
  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarYear((y) => y - 1);
      setCalendarMonth(11);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarYear((y) => y + 1);
      setCalendarMonth(0);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  };

  const handleJumpToCurrentMonth = () => {
    const now = new Date();
    setCalendarYear(now.getFullYear());
    setCalendarMonth(now.getMonth());
    setSelectedCalendarDate(now.toISOString().split('T')[0]);
  };

  // Calendar matrix calculation
  const calendarData = useMemo(() => {
    const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1);
    const lastDayOfMonth = new Date(calendarYear, calendarMonth + 1, 0);
    const totalDays = lastDayOfMonth.getDate();

    // Monday as first day: 0 is Sunday, so convert
    let startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sun, 1 is Mon...
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // 0 = Mon, 6 = Sun

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean; log?: WorkoutLog }[] = [];

    // Empty lead days
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({
        dateStr: '',
        dayNum: 0,
        isCurrentMonth: false,
      });
    }

    // Month days
    for (let d = 1; d <= totalDays; d++) {
      const monthStr = String(calendarMonth + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateStr = `${calendarYear}-${monthStr}-${dayStr}`;
      const log = logs.find((l) => l.date === dateStr);
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
        log,
      });
    }

    return { days, totalDays };
  }, [calendarYear, calendarMonth, logs]);

  // Selected date log
  const selectedDateLog = useMemo(() => {
    return logs.find((l) => l.date === selectedCalendarDate);
  }, [logs, selectedCalendarDate]);

  // This month workout count
  const thisMonthTrainedDays = useMemo(() => {
    const prefix = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}`;
    return logs.filter((l) => l.date.startsWith(prefix)).length;
  }, [logs, calendarYear, calendarMonth]);

  const thisMonthVolume = useMemo(() => {
    const prefix = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}`;
    return logs
      .filter((l) => l.date.startsWith(prefix))
      .reduce((sum, l) => sum + (l.totalVolumeKg || 0), 0);
  }, [logs, calendarYear, calendarMonth]);

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-300">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-zinc-900/95 border border-rose-500/50 text-rose-300 text-xs font-semibold shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          {toastMessage}
        </div>
      )}

      {/* Top Banner / Dashboard Stats */}
      <div className="relative rounded-3xl p-5 sm:p-6 overflow-hidden border border-rose-500/20 bg-gradient-to-br from-rose-950/40 via-zinc-900/90 to-black backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Dumbbell className="w-3.5 h-3.5 text-rose-400" />
              IRON VAULT · 硬核铁馆打卡系统
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              力量雕刻器械馆
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-white/10 font-normal">
                Hevy / Strong 交互风格
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
              精细化记录每个部位的训练动作、重量(kg)与组数(reps)，动态计算总吨位与月度出勤。
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-white/10 flex flex-col">
              <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-400" /> 连续打卡
              </span>
              <div className="text-xl font-black text-orange-400 mt-0.5">
                {streakDays} <span className="text-xs font-normal text-zinc-400">天</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-white/10 flex flex-col">
              <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                <CalendarCheck className="w-3 h-3 text-blue-400" /> 本月出勤
              </span>
              <div className="text-xl font-black text-blue-400 mt-0.5">
                {thisMonthTrainedDays} <span className="text-xs font-normal text-zinc-400">天</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-white/10 flex flex-col">
              <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-400" /> 累计总容量
              </span>
              <div className="text-xl font-black text-emerald-400 mt-0.5">
                {(totalLifetimeVolume / 1000).toFixed(1)}{' '}
                <span className="text-xs font-normal text-zinc-400">吨</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-white/10 flex flex-col">
              <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                <Trophy className="w-3 h-3 text-purple-400" /> 最常练部位
              </span>
              <div className="text-base font-bold text-purple-300 mt-1 truncate">
                {logs.length > 0 && mostTrainedMuscle.count > 0 ? (
                  <>
                    {MUSCLE_GROUPS_META[mostTrainedMuscle.group]?.icon}{' '}
                    {MUSCLE_GROUPS_META[mostTrainedMuscle.group]?.name}
                  </>
                ) : (
                  <span className="text-xs text-zinc-500 font-normal">暂无打卡</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Top Switcher Navigation */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between flex-wrap gap-2">
          <div className="inline-flex p-1 rounded-2xl bg-zinc-900/90 border border-white/10">
            <button
              onClick={() => setActiveSubTab('logger')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'logger'
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Dumbbell className="w-3.5 h-3.5" />
              今日开练 · 组数记录
            </button>
            <button
              onClick={() => setActiveSubTab('calendar')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'calendar'
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              月度日历打卡 ({thisMonthTrainedDays}天)
            </button>
            <button
              onClick={() => setActiveSubTab('history')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'history'
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              训练历史 ({logs.length}次)
            </button>
          </div>

          {/* Quick Rest Timer Trigger */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-800/80 border border-white/10 text-xs">
              <Timer className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-zinc-400">间歇休息:</span>
              {restTimerSeconds > 0 ? (
                <span className="font-mono font-bold text-amber-400 ml-1">
                  {Math.floor(restTimerSeconds / 60)}:
                  {String(restTimerSeconds % 60).padStart(2, '0')}
                </span>
              ) : (
                <span className="text-zinc-500">未开始</span>
              )}

              {isTimerRunning ? (
                <button
                  onClick={() => setIsTimerRunning(false)}
                  className="ml-1 p-1 hover:text-white text-zinc-400"
                  title="暂停"
                >
                  <Pause className="w-3 h-3" />
                </button>
              ) : restTimerSeconds > 0 ? (
                <button
                  onClick={() => setIsTimerRunning(true)}
                  className="ml-1 p-1 hover:text-white text-emerald-400"
                  title="继续"
                >
                  <Play className="w-3 h-3" />
                </button>
              ) : null}

              {restTimerSeconds > 0 && (
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setRestTimerSeconds(0);
                  }}
                  className="p-1 hover:text-white text-zinc-400"
                  title="重置"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1">
              {[60, 90, 120].map((sec) => (
                <button
                  key={sec}
                  onClick={() => startRestTimer(sec)}
                  className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-[10px] text-zinc-300 font-medium border border-white/5 transition-all"
                >
                  +{sec}s
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-VIEW 1: 今日开练 / 组数打卡 (Hevy / Strong Style)                     */}
      {/* ========================================================================= */}
      {activeSubTab === 'logger' && (
        <div className="space-y-6">
          {/* Workout Header Info Card */}
          <div className="rounded-3xl p-5 bg-zinc-900/80 border border-white/10 backdrop-blur-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  训练日程名称
                </label>
                <input
                  type="text"
                  value={workoutTitle}
                  onChange={(e) => setWorkoutTitle(e.target.value)}
                  placeholder="例如: 周二 胸部大重量推力日"
                  className="w-full bg-zinc-800/80 border border-white/10 rounded-xl px-3.5 py-2 text-white text-sm font-semibold focus:outline-none focus:border-rose-500/50"
                />
              </div>

              <div className="flex items-center gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                    打卡日期
                  </label>
                  <input
                    type="date"
                    value={workoutDate}
                    onChange={(e) => setWorkoutDate(e.target.value)}
                    className="bg-zinc-800/80 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-medium focus:outline-none focus:border-rose-500/50"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                    预计耗时
                  </label>
                  <div className="flex items-center gap-1 bg-zinc-800/80 border border-white/10 rounded-xl px-2 py-1.5">
                    <input
                      type="number"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value) || 0)}
                      className="w-12 bg-transparent text-center text-white text-xs font-semibold focus:outline-none"
                    />
                    <span className="text-[10px] text-zinc-400 mr-1">分钟</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                    训练强度
                  </label>
                  <select
                    value={intensity}
                    onChange={(e) => setIntensity(e.target.value as any)}
                    className="bg-zinc-800/80 border border-white/10 rounded-xl px-2.5 py-2 text-white text-xs font-medium focus:outline-none focus:border-rose-500/50"
                  >
                    <option value="light">🌱 轻松唤醒</option>
                    <option value="moderate">⚡ 泵感充血</option>
                    <option value="intense">🔥 力竭硬核</option>
                    <option value="extreme">💀 突破极限</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Active Exercises List (Set-by-set Hevy Table) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-rose-400" />
                当前已编排动作 ({activeExercises.length})
              </h3>
              <div className="text-xs text-zinc-400 flex items-center gap-2">
                <span>
                  总容量: <strong className="text-rose-400">{activeWorkoutStats.totalVolumeKg} kg</strong>
                </span>
                <span>•</span>
                <span>
                  进度:{' '}
                  <strong className="text-emerald-400">
                    {activeWorkoutStats.completedSets}/{activeWorkoutStats.totalSets}
                  </strong>{' '}
                  组
                </span>
              </div>
            </div>

            {activeExercises.length === 0 ? (
              <div className="p-12 text-center rounded-3xl border border-dashed border-zinc-700/60 bg-zinc-900/40">
                <Dumbbell className="w-10 h-10 text-zinc-600 mx-auto mb-3 animate-pulse" />
                <p className="text-sm font-semibold text-zinc-300">今日训练清单还是空的</p>
                <p className="text-xs text-zinc-500 mt-1">
                  请从下方「动作库与部位选择」中点击挑选要练的动作，或输入自定义动作！
                </p>
              </div>
            ) : (
              activeExercises.map((exercise, exIndex) => {
                const meta = MUSCLE_GROUPS_META[exercise.muscleGroup] || MUSCLE_GROUPS_META.chest;
                const exVolume = exercise.sets
                  .filter((s) => s.completed)
                  .reduce((sum, s) => sum + s.weightKg * s.reps, 0);

                // calculate best 1RM among completed sets
                const best1RM = exercise.sets.reduce((max, s) => {
                  const est = estimate1RM(s.weightKg, s.reps);
                  return est > max ? est : max;
                }, 0);

                return (
                  <div
                    key={exercise.id}
                    className="rounded-3xl p-4 sm:p-5 bg-zinc-900/90 border border-white/10 shadow-xl backdrop-blur-xl space-y-3.5 transition-all"
                  >
                    {/* Exercise Card Header */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-zinc-800 text-xs font-bold text-zinc-300 border border-white/10">
                          {exIndex + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm sm:text-base font-bold text-white tracking-wide">
                              {exercise.exerciseName}
                            </h4>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${meta.bgClass} ${meta.borderClass} ${meta.textClass}`}
                            >
                              {meta.icon} {meta.name}
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-2">
                            <span>预估 1RM: <strong className="text-amber-400">{best1RM}kg</strong></span>
                            <span>•</span>
                            <span>已完成容量: <strong className="text-rose-400">{exVolume}kg</strong></span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveExercise(exercise.id)}
                        className="p-1.5 rounded-xl hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 transition-colors"
                        title="删除动作"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Sets Table (Hevy UI) */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-white/10 text-zinc-400 text-[10px] uppercase tracking-wider">
                            <th className="py-2 px-2 text-center w-12">组号</th>
                            <th className="py-2 px-3 text-center">重量 (KG)</th>
                            <th className="py-2 px-3 text-center">次数 (REPS)</th>
                            <th className="py-2 px-3 text-center w-16">打卡</th>
                            <th className="py-2 px-2 text-right w-10">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {exercise.sets.map((set) => (
                            <tr
                              key={set.id}
                              className={`transition-colors ${
                                set.completed ? 'bg-emerald-500/5' : 'hover:bg-zinc-800/40'
                              }`}
                            >
                              {/* Set Number */}
                              <td className="py-2 px-2 text-center">
                                <span
                                  className={`inline-block w-6 h-6 rounded-lg leading-6 text-center text-xs font-bold ${
                                    set.completed
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-zinc-800 text-zinc-300'
                                  }`}
                                >
                                  {set.setNumber}
                                </span>
                              </td>

                              {/* Weight Input with Steppers */}
                              <td className="py-2 px-3">
                                <div className="flex items-center justify-center gap-1.5 max-w-[170px] mx-auto">
                                  <button
                                    onClick={() => handleUpdateSetWeight(exercise.id, set.id, set.weightKg - 2.5)}
                                    className="w-6 h-6 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold flex items-center justify-center text-xs active:scale-90"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    step="0.5"
                                    value={set.weightKg}
                                    onChange={(e) =>
                                      handleUpdateSetWeight(exercise.id, set.id, parseFloat(e.target.value) || 0)
                                    }
                                    className="w-16 bg-zinc-800/90 border border-white/10 rounded-lg px-1.5 py-1 text-center font-mono font-bold text-white text-xs focus:outline-none focus:border-rose-500"
                                  />
                                  <button
                                    onClick={() => handleUpdateSetWeight(exercise.id, set.id, set.weightKg + 2.5)}
                                    className="w-6 h-6 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold flex items-center justify-center text-xs active:scale-90"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>

                              {/* Reps Input with Steppers */}
                              <td className="py-2 px-3">
                                <div className="flex items-center justify-center gap-1.5 max-w-[150px] mx-auto">
                                  <button
                                    onClick={() => handleUpdateSetReps(exercise.id, set.id, set.reps - 1)}
                                    className="w-6 h-6 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold flex items-center justify-center text-xs active:scale-90"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    value={set.reps}
                                    onChange={(e) =>
                                      handleUpdateSetReps(exercise.id, set.id, parseInt(e.target.value) || 0)
                                    }
                                    className="w-14 bg-zinc-800/90 border border-white/10 rounded-lg px-1.5 py-1 text-center font-mono font-bold text-white text-xs focus:outline-none focus:border-rose-500"
                                  />
                                  <button
                                    onClick={() => handleUpdateSetReps(exercise.id, set.id, set.reps + 1)}
                                    className="w-6 h-6 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold flex items-center justify-center text-xs active:scale-90"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>

                              {/* Completed Checkbox */}
                              <td className="py-2 px-3 text-center">
                                <button
                                  onClick={() => {
                                    handleToggleSetComplete(exercise.id, set.id);
                                    if (!set.completed) {
                                      // auto trigger rest timer if not running
                                      startRestTimer(90);
                                    }
                                  }}
                                  className={`w-7 h-7 mx-auto rounded-xl flex items-center justify-center transition-all ${
                                    set.completed
                                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/40 scale-105'
                                      : 'bg-zinc-800 border border-white/20 text-zinc-500 hover:border-emerald-500/50'
                                  }`}
                                  title={set.completed ? '已完成本组 (点击撤销)' : '点击标记完成本组'}
                                >
                                  {set.completed ? (
                                    <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                                  ) : (
                                    <Circle className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </td>

                              {/* Delete set */}
                              <td className="py-2 px-2 text-right">
                                <button
                                  onClick={() => handleRemoveSet(exercise.id, set.id)}
                                  className="p-1 hover:text-rose-400 text-zinc-600 transition-colors"
                                  title="删除此组"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Bottom Add Next Set Button */}
                    <div className="pt-2 flex items-center justify-between border-t border-white/5">
                      <button
                        onClick={() => handleAddNextSet(exercise.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 active:scale-95 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 border border-white/10"
                      >
                        <Plus className="w-3.5 h-3.5 text-rose-400" />
                        添加一组 (复制上一组规格)
                      </button>

                      <div className="text-[11px] text-zinc-500">
                        已完成 {exercise.sets.filter((s) => s.completed).length} / {exercise.sets.length} 组
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Exercise Library Picker Drawer */}
          <div className="rounded-3xl p-5 bg-zinc-900/80 border border-white/10 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                动作库与部位选择 (点击即加入今日训练)
              </h3>
              <span className="text-xs text-zinc-400">参考专业器械动作标准</span>
            </div>

            {/* Muscle Group Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {(Object.keys(MUSCLE_GROUPS_META) as MuscleGroup[]).map((mg) => {
                const meta = MUSCLE_GROUPS_META[mg];
                const isSelected = selectedMuscleFilter === mg;
                return (
                  <button
                    key={mg}
                    onClick={() => setSelectedMuscleFilter(mg)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/30'
                        : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border border-white/5'
                    }`}
                  >
                    <span>{meta.icon}</span>
                    <span>{meta.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
              {(EXERCISE_PRESETS[selectedMuscleFilter] || []).map((preset) => {
                const isAlreadyAdded = activeExercises.some((ex) => ex.exerciseName === preset.name);
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleAddPresetExercise(preset)}
                    className={`p-2.5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                      isAlreadyAdded
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                        : 'bg-zinc-800/60 hover:bg-zinc-800 border-white/5 text-zinc-200 hover:border-rose-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold truncate block pr-2">{preset.name}</span>
                      <Plus className="w-3.5 h-3.5 text-zinc-400 group-hover:text-rose-400 transition-colors shrink-0" />
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-1">
                      基准: {preset.defaultWeight > 0 ? `${preset.defaultWeight}kg` : '自重'} × {preset.defaultReps}次
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Exercise Input */}
            <div className="pt-2 border-t border-white/5 flex items-center gap-2">
              <input
                type="text"
                value={customExerciseName}
                onChange={(e) => setCustomExerciseName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomExercise()}
                placeholder={`输入自定义${MUSCLE_GROUPS_META[selectedMuscleFilter].name}动作...`}
                className="flex-1 bg-zinc-800/90 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-rose-500"
              />
              <button
                onClick={handleAddCustomExercise}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-rose-300 border border-rose-500/30 transition-all flex items-center gap-1 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                添加自定义动作
              </button>
            </div>
          </div>

          {/* Workout Notes */}
          <div className="rounded-3xl p-5 bg-zinc-900/80 border border-white/10 backdrop-blur-xl space-y-2">
            <label className="text-xs font-bold text-white flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              训练心得与状态备注
            </label>
            <textarea
              rows={2}
              value={workoutNotes}
              onChange={(e) => setWorkoutNotes(e.target.value)}
              placeholder="今天状态极佳、离心控制节奏到位、泵感爆炸，或者右肩稍有轻微紧绷..."
              className="w-full bg-zinc-800/90 border border-white/10 rounded-2xl p-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Finish & Save Bar */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-zinc-900 via-rose-950/40 to-zinc-900 border border-rose-500/30 flex items-center justify-between flex-wrap gap-4 shadow-2xl">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">今日总容量</span>
                <span className="text-xl font-black text-rose-400">{activeWorkoutStats.totalVolumeKg} <span className="text-xs font-normal text-zinc-400">KG</span></span>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">组数完成度</span>
                <span className="text-xl font-black text-emerald-400">{activeWorkoutStats.completedSets} / {activeWorkoutStats.totalSets} <span className="text-xs font-normal text-zinc-400">组</span></span>
              </div>
            </div>

            <button
              onClick={handleFinishWorkout}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 active:scale-95 text-white text-sm font-bold shadow-xl shadow-rose-500/40 flex items-center gap-2 transition-all"
            >
              <Trophy className="w-4 h-4" />
              完成训练并打卡入库
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 2: 月度日历打卡与月度分析                                        */}
      {/* ========================================================================= */}
      {activeSubTab === 'calendar' && (
        <div className="space-y-6">
          {/* Calendar Header Card */}
          <div className="rounded-3xl p-5 bg-zinc-900/90 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-90 text-zinc-300 transition-all border border-white/5"
                  title="上个月"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h3 className="text-lg font-extrabold text-white tracking-wide">
                  {calendarYear} 年 {calendarMonth + 1} 月
                </h3>
                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-90 text-zinc-300 transition-all border border-white/5"
                  title="下个月"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleJumpToCurrentMonth}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-rose-300 border border-rose-500/20 active:scale-95 transition-all"
                >
                  回到本月
                </button>
              </div>
            </div>

            {/* Monthly Summary Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-zinc-800/40 border border-white/5">
              <div>
                <span className="text-[10px] text-zinc-400">本月训练天数</span>
                <p className="text-base font-bold text-white mt-0.5">
                  {thisMonthTrainedDays} <span className="text-xs text-zinc-500 font-normal">/ {calendarData.totalDays}天</span>
                </p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400">本月举铁容量</span>
                <p className="text-base font-bold text-rose-400 mt-0.5">
                  {(thisMonthVolume / 1000).toFixed(1)} <span className="text-xs text-zinc-500 font-normal">吨</span>
                </p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400">月出勤率</span>
                <p className="text-base font-bold text-emerald-400 mt-0.5">
                  {Math.round((thisMonthTrainedDays / calendarData.totalDays) * 100)}%
                </p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400">当前选择日期</span>
                <p className="text-base font-bold text-amber-300 mt-0.5">
                  {selectedCalendarDate}
                </p>
              </div>
            </div>

            {/* 7-Column Calendar Grid */}
            <div>
              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {['一', '二', '三', '四', '五', '六', '日'].map((w, idx) => (
                  <div
                    key={w}
                    className={`text-[11px] font-bold py-1.5 ${
                      idx >= 5 ? 'text-rose-400' : 'text-zinc-400'
                    }`}
                  >
                    周{w}
                  </div>
                ))}
              </div>

              {/* Day Cells */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {calendarData.days.map((item, idx) => {
                  if (!item.isCurrentMonth) {
                    return (
                      <div
                        key={`empty-${idx}`}
                        className="h-16 sm:h-20 rounded-2xl bg-zinc-950/20 border border-transparent opacity-20"
                      />
                    );
                  }

                  const hasLog = Boolean(item.log);
                  const isSelected = item.dateStr === selectedCalendarDate;
                  const isToday =
                    item.dateStr === new Date().toISOString().split('T')[0];

                  return (
                    <button
                      key={item.dateStr}
                      onClick={() => setSelectedCalendarDate(item.dateStr)}
                      className={`h-16 sm:h-20 rounded-2xl p-1.5 flex flex-col justify-between text-left transition-all relative overflow-hidden border ${
                        isSelected
                          ? 'border-rose-500 bg-rose-500/15 shadow-lg shadow-rose-500/20 scale-[1.02]'
                          : hasLog
                          ? 'border-rose-500/30 bg-zinc-800/80 hover:bg-zinc-800'
                          : 'border-white/5 bg-zinc-900/40 hover:bg-zinc-800/40 text-zinc-500'
                      }`}
                    >
                      {/* Top: Day Number & Today indicator */}
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={`text-xs font-bold ${
                            isSelected
                              ? 'text-rose-400'
                              : hasLog
                              ? 'text-white'
                              : 'text-zinc-400'
                          }`}
                        >
                          {item.dayNum}
                        </span>
                        {isToday && (
                          <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 font-bold">
                            今
                          </span>
                        )}
                      </div>

                      {/* Middle/Bottom: Workout badges */}
                      {item.log ? (
                        <div className="space-y-0.5 w-full">
                          <div className="flex items-center gap-0.5 flex-wrap">
                            {item.log.muscleGroups.slice(0, 2).map((mg) => {
                              const meta = MUSCLE_GROUPS_META[mg];
                              return (
                                <span
                                  key={mg}
                                  className={`text-[9px] px-1 py-0.2 rounded font-semibold ${meta.bgClass} ${meta.textClass} truncate`}
                                  title={meta.name}
                                >
                                  {meta.name.slice(0, 1)}
                                </span>
                              );
                            })}
                          </div>
                          <div className="text-[9px] font-mono text-zinc-400 truncate">
                            {item.log.totalVolumeKg ? `${Math.round(item.log.totalVolumeKg / 100) / 10}t` : `${item.log.durationMinutes}m`}
                          </div>
                        </div>
                      ) : (
                        <div className="text-[9px] text-zinc-600 font-medium">休息</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Selected Date Workout Detail View */}
          <div className="rounded-3xl p-5 bg-zinc-900/90 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold block">
                  打卡详情查看
                </span>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-rose-400" />
                  {selectedCalendarDate} 训练记录
                </h3>
              </div>

              {selectedDateLog && (
                <button
                  onClick={() => handleDeleteLog(selectedDateLog.id)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 text-xs font-semibold border border-white/5 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  删除此记录
                </button>
              )}
            </div>

            {selectedDateLog ? (
              <div className="space-y-4">
                {/* Meta Header */}
                <div className="p-4 rounded-2xl bg-zinc-800/60 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-base font-extrabold text-white">
                      {selectedDateLog.title}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {selectedDateLog.muscleGroups.map((mg) => {
                        const meta = MUSCLE_GROUPS_META[mg];
                        return (
                          <span
                            key={mg}
                            className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${meta.bgClass} ${meta.borderClass} ${meta.textClass}`}
                          >
                            {meta.icon} {meta.name}
                          </span>
                        );
                      })}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-white/10">
                        ⏱️ {selectedDateLog.durationMinutes} 分钟
                      </span>
                      {selectedDateLog.intensity && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                          🔥 强度: {selectedDateLog.intensity}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-zinc-400 block uppercase">训练总吨位</span>
                    <span className="text-xl font-black text-rose-400">
                      {selectedDateLog.totalVolumeKg || 0} <span className="text-xs font-normal text-zinc-400">KG</span>
                    </span>
                  </div>
                </div>

                {/* Exercises detail */}
                {selectedDateLog.exercisesList && selectedDateLog.exercisesList.length > 0 ? (
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      动作与组数明细
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedDateLog.exercisesList.map((ex, idx) => (
                        <div
                          key={ex.id || idx}
                          className="p-3.5 rounded-2xl bg-zinc-800/40 border border-white/5 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{ex.exerciseName}</span>
                            <span className="text-[10px] text-zinc-400">{ex.sets.length} 组</span>
                          </div>
                          <div className="space-y-1">
                            {ex.sets.map((s) => (
                              <div
                                key={s.id}
                                className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-zinc-800/80 font-mono"
                              >
                                <span className="text-zinc-400">第 {s.setNumber} 组</span>
                                <span className="text-white font-bold">
                                  {s.weightKg > 0 ? `${s.weightKg} kg` : '自重'} × {s.reps} 次
                                </span>
                                <span className="text-emerald-400 text-[10px]">✓ 完成</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-zinc-800/40 border border-white/5">
                    <span className="text-xs text-zinc-400 block mb-1">训练动作:</span>
                    <p className="text-xs text-zinc-200 font-mono">{selectedDateLog.exercises}</p>
                  </div>
                )}

                {/* Notes */}
                {selectedDateLog.notes && (
                  <div className="p-3.5 rounded-2xl bg-zinc-800/30 border border-white/5">
                    <span className="text-[10px] text-zinc-400 font-semibold block uppercase mb-1">
                      训练心得笔记
                    </span>
                    <p className="text-xs text-zinc-300 italic">“{selectedDateLog.notes}”</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 space-y-3">
                <Info className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">
                  {selectedCalendarDate} 这一天暂无训练打卡记录。
                </p>
                <button
                  onClick={() => {
                    setWorkoutDate(selectedCalendarDate);
                    setActiveSubTab('logger');
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-95 text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  在此日期快速补录一练
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 3: 训练历史时间线 (History Timeline)                             */}
      {/* ========================================================================= */}
      {activeSubTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-400" />
              历史训练打卡流水 ({logs.length} 次)
            </h3>
            {logs.length > 0 && (
              <button
                onClick={handleClearAllLogs}
                className="px-2.5 py-1 rounded-xl bg-zinc-800/80 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 text-xs transition-colors flex items-center gap-1 border border-white/5"
              >
                <Trash2 className="w-3 h-3" />
                <span>清空全部</span>
              </button>
            )}
          </div>

          {logs.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/30 space-y-3">
              <Dumbbell className="w-10 h-10 text-zinc-600 mx-auto" />
              <p className="text-sm font-semibold text-zinc-300">暂无任何历史训练打卡记录</p>
              <p className="text-xs text-zinc-500">点击「今日开练」记录您的第一场力量轰炸！</p>
              <button
                onClick={() => setActiveSubTab('logger')}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-95 text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                开启今日第一练
              </button>
            </div>
          ) : (
            <div className="space-y-3">
            {logs.map((log) => {
              const primaryGroup = log.muscleGroups[0] || 'chest';
              const meta = MUSCLE_GROUPS_META[primaryGroup];

              return (
                <div
                  key={log.id}
                  className="p-4 sm:p-5 rounded-3xl bg-zinc-900/90 border border-white/10 hover:border-rose-500/30 backdrop-blur-xl transition-all shadow-lg space-y-3"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center text-lg border border-white/10">
                        {meta.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm sm:text-base font-bold text-white">{log.title}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                            {log.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {log.muscleGroups.map((mg) => {
                            const m = MUSCLE_GROUPS_META[mg];
                            return (
                              <span
                                key={mg}
                                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${m.bgClass} ${m.textClass}`}
                              >
                                {m.name}
                              </span>
                            );
                          })}
                          <span className="text-[10px] text-zinc-400">• {log.durationMinutes}分钟</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 block uppercase">总吨位</span>
                        <span className="text-base font-extrabold text-rose-400">
                          {log.totalVolumeKg ? `${log.totalVolumeKg}kg` : '—'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        className="p-2 rounded-xl hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 transition-colors"
                        title="删除记录"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Summary / Notes */}
                  {log.exercises && (
                    <div className="text-xs text-zinc-300 font-mono bg-zinc-800/50 p-2.5 rounded-xl border border-white/5">
                      {log.exercises}
                    </div>
                  )}

                  {log.notes && (
                    <p className="text-xs text-zinc-400 italic">“{log.notes}”</p>
                  )}
                </div>
              );
            })}
          </div>
          )}
        </div>
      )}
    </div>
  );
};
