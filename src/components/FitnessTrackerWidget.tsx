'use client';

import React, { useState, useEffect } from 'react';
import { WorkoutLog, MuscleGroup } from '@/types';
import {
  MUSCLE_GROUPS_META,
  INITIAL_WORKOUT_LOGS,
  calculateWorkoutStreak,
  getMuscleDistribution,
  MuscleGroupMeta
} from '@/lib/services/fitnessService';
import {
  Dumbbell,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Clock,
  Flame,
  Sparkles,
  CheckCircle2,
  Award,
  Activity,
  X,
  Edit3
} from 'lucide-react';

export const FitnessTrackerWidget: React.FC = () => {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Calendar view state (year & month, 0-indexed month)
  const today = new Date();
  const [viewYear, setViewYear] = useState<number>(today.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(today.toISOString().split('T')[0]);

  // Form state for adding/editing a workout log
  const [formDate, setFormDate] = useState<string>(today.toISOString().split('T')[0]);
  const [formMuscleGroups, setFormMuscleGroups] = useState<MuscleGroup[]>(['chest']);
  const [formDuration, setFormDuration] = useState<number>(45);
  const [formIntensity, setFormIntensity] = useState<'light' | 'moderate' | 'intense' | 'extreme'>('intense');
  const [formExercises, setFormExercises] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');

  // Audio chime feedback
  const playChime = () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.08);
      osc.frequency.setValueAtTime(783.99, now + 0.16);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {
      // ignore
    }
  };

  // Load logs from localStorage or initialize
  useEffect(() => {
    try {
      const saved = localStorage.getItem('personal_os_workout_logs');
      if (saved) {
        setLogs(JSON.parse(saved));
      } else {
        setLogs(INITIAL_WORKOUT_LOGS);
        localStorage.setItem('personal_os_workout_logs', JSON.stringify(INITIAL_WORKOUT_LOGS));
      }
    } catch (e) {
      console.error(e);
      setLogs(INITIAL_WORKOUT_LOGS);
    }
  }, []);

  const saveLogs = (newLogs: WorkoutLog[]) => {
    setLogs(newLogs);
    localStorage.setItem('personal_os_workout_logs', JSON.stringify(newLogs));
  };

  // Stats
  const totalDays = Array.from(new Set(logs.map((l) => l.date))).length;
  const currentMonthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
  const thisMonthLogs = logs.filter((l) => l.date.startsWith(currentMonthPrefix));
  const thisMonthDays = Array.from(new Set(thisMonthLogs.map((l) => l.date))).length;
  const currentStreak = calculateWorkoutStreak(logs);
  const muscleDistribution = getMuscleDistribution(logs);

  const todayStr = today.toISOString().split('T')[0];
  const todayLog = logs.find((l) => l.date === todayStr);

  // Selected date log in calendar
  const selectedDateLog = logs.find((l) => l.date === selectedDate);

  // Open Log Modal for a specific date
  const handleOpenLogModal = (dateStr: string = todayStr) => {
    setFormDate(dateStr);
    const existing = logs.find((l) => l.date === dateStr);
    if (existing) {
      setFormMuscleGroups(existing.muscleGroups);
      setFormDuration(existing.durationMinutes);
      setFormIntensity(existing.intensity || 'intense');
      setFormExercises(existing.exercises || '');
      setFormNotes(existing.notes || '');
    } else {
      setFormMuscleGroups(['chest']);
      setFormDuration(45);
      setFormIntensity('intense');
      setFormExercises('');
      setFormNotes('');
    }
    setIsLogModalOpen(true);
  };

  const handleSaveLog = () => {
    if (!formDate || formMuscleGroups.length === 0) return;

    const existingIndex = logs.findIndex((l) => l.date === formDate);
    const newLogItem: WorkoutLog = {
      id: existingIndex >= 0 ? logs[existingIndex].id : `workout-${Date.now()}`,
      date: formDate,
      muscleGroups: formMuscleGroups,
      durationMinutes: formDuration,
      intensity: formIntensity,
      exercises: formExercises.trim(),
      notes: formNotes.trim(),
      completedAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };

    let updated: WorkoutLog[];
    if (existingIndex >= 0) {
      updated = logs.map((l, i) => (i === existingIndex ? newLogItem : l));
    } else {
      updated = [newLogItem, ...logs];
    }

    saveLogs(updated);
    setIsLogModalOpen(false);
    playChime();
  };

  const handleDeleteLog = (id: string) => {
    const updated = logs.filter((l) => l.id !== id);
    saveLogs(updated);
  };

  const toggleMuscleGroupSelect = (mg: MuscleGroup) => {
    if (formMuscleGroups.includes(mg)) {
      if (formMuscleGroups.length > 1) {
        setFormMuscleGroups(formMuscleGroups.filter((g) => g !== mg));
      }
    } else {
      setFormMuscleGroups([...formMuscleGroups, mg]);
    }
  };

  // Calendar Grid Builder for viewYear, viewMonth
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; // Monday = 0
  const calendarCells: { day: number; dateStr: string; log?: WorkoutLog }[] = [];

  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push({ day: 0, dateStr: '' });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const log = logs.find((l) => l.date === dateStr);
    calendarCells.push({ day: d, dateStr, log });
  }

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  return (
    <>
      {/* 1. Bento Grid Widget Card */}
      <div className="glass-card rounded-3xl p-5 border border-white/10 space-y-4 shadow-xl relative overflow-hidden bg-gradient-to-br from-zinc-900/95 via-zinc-900/80 to-rose-950/20">
        {/* Ambient lighting */}
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-white tracking-tight">硬核健身训练看板</h3>
                <span className="px-1.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 text-[10px] font-bold border border-rose-500/20">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">智能记录部位 · 连胜追踪 · 月度日历</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsCalendarModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="查看月度打卡日历"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-rose-400" />
              <span>月度日历</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenLogModal(todayStr)}
              className="p-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white transition-all shadow-md shadow-rose-600/20 cursor-pointer"
              title="今日训练打卡"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Core Stats Row */}
        <div className="grid grid-cols-3 gap-2 relative z-10">
          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-center space-y-0.5">
            <span className="text-[10px] text-zinc-400">累计训练</span>
            <div className="text-lg font-black font-mono text-white flex items-center justify-center gap-0.5">
              <span>{totalDays}</span>
              <span className="text-[10px] font-normal text-zinc-400">天</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-center space-y-0.5">
            <span className="text-[10px] text-zinc-400">本月打卡</span>
            <div className="text-lg font-black font-mono text-rose-400 flex items-center justify-center gap-0.5">
              <span>{thisMonthDays}</span>
              <span className="text-[10px] font-normal text-zinc-400">天</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-center space-y-0.5">
            <span className="text-[10px] text-zinc-400">当前连胜</span>
            <div className="text-lg font-black font-mono text-amber-400 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{currentStreak}</span>
            </div>
          </div>
        </div>

        {/* Today's Status Banner */}
        <div className="relative z-10">
          {todayLog ? (
            <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white">今日已完成训练</span>
                  <span className="text-[10px] text-zinc-400 font-mono">({todayLog.durationMinutes} 分钟)</span>
                </div>
                <button
                  onClick={() => handleOpenLogModal(todayStr)}
                  className="text-[11px] text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-0.5 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>编辑</span>
                </button>
              </div>

              {/* Muscle pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {todayLog.muscleGroups.map((mg) => {
                  const meta = MUSCLE_GROUPS_META[mg];
                  return (
                    <span
                      key={mg}
                      className={`px-2 py-0.5 rounded-lg text-xs font-semibold border flex items-center gap-1 ${meta.bgClass} ${meta.borderClass} ${meta.textClass}`}
                    >
                      <span>{meta.icon}</span>
                      <span>{meta.name}</span>
                    </span>
                  );
                })}
              </div>

              {todayLog.exercises && (
                <p className="text-[11px] text-zinc-300 leading-tight">
                  <span className="text-zinc-500 mr-1">动作:</span>
                  {todayLog.exercises}
                </p>
              )}
            </div>
          ) : (
            <div
              onClick={() => handleOpenLogModal(todayStr)}
              className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-rose-500/40 hover:bg-rose-950/20 transition-all cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-white/5 text-zinc-400 group-hover:text-rose-400 group-hover:bg-rose-500/20 flex items-center justify-center transition-all">
                  <Dumbbell className="w-3.5 h-3.5" />
                </span>
                <div>
                  <p className="text-xs font-bold text-zinc-200 group-hover:text-white">今日尚未打卡训练</p>
                  <p className="text-[10px] text-zinc-500">点击立即记录今日训练部位与时长 ⚡</p>
                </div>
              </div>

              <div className="px-2.5 py-1 rounded-xl bg-rose-600/30 text-rose-300 border border-rose-500/30 text-[11px] font-semibold flex items-center gap-1 group-hover:bg-rose-600 group-hover:text-white transition-all">
                <span>打卡</span>
                <Plus className="w-3 h-3" />
              </div>
            </div>
          )}
        </div>

        {/* Muscle Groups Heatmap Badges */}
        <div className="relative z-10 space-y-1.5 pt-1 border-t border-white/5">
          <div className="text-[10px] text-zinc-400 flex items-center justify-between">
            <span>各部位训练频次累计:</span>
            <span className="text-zinc-500">点击日历查看月度分布</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {(Object.keys(MUSCLE_GROUPS_META) as MuscleGroup[]).map((mg) => {
              const meta = MUSCLE_GROUPS_META[mg];
              const count = muscleDistribution[mg] || 0;
              return (
                <div
                  key={mg}
                  className={`px-2 py-1 rounded-xl border flex-shrink-0 flex items-center gap-1 text-[11px] transition-all ${
                    count > 0 ? `${meta.bgClass} ${meta.borderClass} ${meta.textClass}` : 'bg-white/5 border-white/5 text-zinc-500'
                  }`}
                >
                  <span>{meta.icon}</span>
                  <span>{meta.name}</span>
                  <span className="font-mono font-bold ml-0.5">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Full-Screen / Modal Monthly Calendar View */}
      {isCalendarModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsCalendarModalOpen(false)}
        >
          <div
            className="w-full sm:max-w-xl bg-zinc-900 border border-white/15 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-250"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">月度训练日历与记录</h3>
                  <p className="text-[11px] text-zinc-400">查看每月哪天练了什么，点击任意日期查看或补录</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCalendarModalOpen(false)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Month Navigation & Stats Header */}
            <div className="flex items-center justify-between bg-zinc-950/60 p-2.5 rounded-2xl border border-white/10">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="上一月"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="text-center">
                <span className="text-sm font-black text-white font-mono">
                  {viewYear} 年 {viewMonth + 1} 月
                </span>
                <div className="text-[10px] text-rose-400 font-semibold mt-0.5">
                  本月训练: {thisMonthDays} 天 · 连胜 {currentStreak} 天
                </div>
              </div>

              <button
                onClick={nextMonth}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="下一月"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* 7-Days Calendar Grid */}
            <div className="space-y-1.5">
              {/* Weekdays row */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-zinc-500 py-1">
                <span>一</span>
                <span>二</span>
                <span>三</span>
                <span>四</span>
                <span>五</span>
                <span>六</span>
                <span>日</span>
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1 max-h-[36vh] overflow-y-auto pr-0.5">
                {calendarCells.map((cell, idx) => {
                  if (cell.day === 0) {
                    return <div key={`empty-${idx}`} className="h-12 rounded-xl" />;
                  }

                  const isTrained = !!cell.log;
                  const isSelected = selectedDate === cell.dateStr;
                  const isTodayDate = todayStr === cell.dateStr;

                  return (
                    <button
                      key={cell.dateStr}
                      type="button"
                      onClick={() => setSelectedDate(cell.dateStr)}
                      className={`h-12 rounded-xl p-1 flex flex-col items-center justify-between border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-rose-600/30 border-rose-500 ring-2 ring-rose-500/40 text-white shadow-lg shadow-rose-500/10'
                          : isTrained
                          ? 'bg-rose-950/20 border-rose-500/30 text-rose-200 hover:border-rose-400/50'
                          : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full px-0.5">
                        <span className={`text-[11px] font-mono ${isTodayDate ? 'text-amber-400 font-bold' : ''}`}>
                          {cell.day}
                        </span>
                        {isTodayDate && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="今日" />}
                      </div>

                      {/* Muscle tag icon preview */}
                      {isTrained && cell.log && (
                        <div className="flex items-center gap-0.5 overflow-hidden w-full justify-center">
                          {cell.log.muscleGroups.slice(0, 2).map((mg) => (
                            <span key={mg} className="text-[10px]" title={MUSCLE_GROUPS_META[mg].name}>
                              {MUSCLE_GROUPS_META[mg].icon}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Day Inspection & Action Panel */}
            <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{selectedDate} 训练详情</span>
                  {selectedDateLog && (
                    <span className="text-[10px] text-zinc-400">({selectedDateLog.durationMinutes} 分钟)</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenLogModal(selectedDate)}
                    className="px-2.5 py-1 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{selectedDateLog ? '编辑记录' : '补录打卡'}</span>
                  </button>

                  {selectedDateLog && (
                    <button
                      onClick={() => handleDeleteLog(selectedDateLog.id)}
                      className="p-1 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                      title="删除打卡"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {selectedDateLog ? (
                <div className="space-y-2">
                  {/* Muscle groups badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {selectedDateLog.muscleGroups.map((mg) => {
                      const meta = MUSCLE_GROUPS_META[mg];
                      return (
                        <span
                          key={mg}
                          className={`px-2 py-0.5 rounded-lg text-xs font-semibold border flex items-center gap-1 ${meta.bgClass} ${meta.borderClass} ${meta.textClass}`}
                        >
                          <span>{meta.icon}</span>
                          <span>{meta.name}</span>
                        </span>
                      );
                    })}
                  </div>

                  {selectedDateLog.exercises && (
                    <div className="text-xs text-zinc-300">
                      <span className="text-zinc-500 mr-1.5">具体动作:</span>
                      <span>{selectedDateLog.exercises}</span>
                    </div>
                  )}

                  {selectedDateLog.notes && (
                    <div className="text-xs text-zinc-400">
                      <span className="text-zinc-500 mr-1.5">状态感受:</span>
                      <span>{selectedDateLog.notes}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-2 text-center text-xs text-zinc-500">
                  当天为身体休息日 🛌，点击右上角「补录打卡」可记录补交作业。
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Add / Edit Workout Log Dialog */}
      {isLogModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsLogModalOpen(false)}
        >
          <div
            className="w-full sm:max-w-md bg-zinc-900 border border-white/15 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-250"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Dumbbell className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">健身训练打卡</h3>
                  <p className="text-[11px] text-zinc-400">记录训练部位、时长与主要动作</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLogModalOpen(false)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <div className="overflow-y-auto space-y-3.5 pr-1 max-h-[60vh]">
              {/* Date Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-400">训练日期</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Muscle Groups Multi-select */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-400">
                  训练部位 (可多选，当前已选 {formMuscleGroups.length} 项)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(Object.keys(MUSCLE_GROUPS_META) as MuscleGroup[]).map((mg) => {
                    const meta = MUSCLE_GROUPS_META[mg];
                    const isSelected = formMuscleGroups.includes(mg);
                    return (
                      <button
                        key={mg}
                        type="button"
                        onClick={() => toggleMuscleGroupSelect(mg)}
                        className={`p-2 rounded-xl text-left border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? `${meta.bgClass} ${meta.borderClass} ${meta.textClass} ring-1 ring-rose-500/40`
                            : 'bg-white/5 border-white/5 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <span>{meta.icon}</span>
                        <span className="truncate">{meta.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Duration Options */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-400">
                  训练时长: <span className="text-rose-400 font-bold">{formDuration}</span> 分钟
                </label>
                <div className="flex items-center gap-2">
                  {[30, 45, 60, 90].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setFormDuration(mins)}
                      className={`flex-1 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        formDuration === mins
                          ? 'bg-rose-600/30 border-rose-500 text-rose-300'
                          : 'bg-white/5 border-white/5 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Intensity Options */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-400">体感强度</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'light', label: '🌱轻松' },
                    { id: 'moderate', label: '💪充实' },
                    { id: 'intense', label: '🔥充血' },
                    { id: 'extreme', label: '⚡力竭' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFormIntensity(opt.id as any)}
                      className={`py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        formIntensity === opt.id
                          ? 'bg-rose-600/30 border-rose-500 text-rose-300'
                          : 'bg-white/5 border-white/5 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Exercises Details */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-400">主要动作 / 组数记录 (选填)</label>
                <input
                  type="text"
                  value={formExercises}
                  onChange={(e) => setFormExercises(e.target.value)}
                  placeholder="例如: 杠铃卧推 80kg x 4组, 哑铃飞鸟, 跑步机 2km"
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-400">状态感受 / 备注 (选填)</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="例如: 状态极佳，泵感强烈"
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={handleSaveLog}
                className="w-full py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs transition-all shadow-lg shadow-rose-600/30 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>保存打卡记录</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
