'use client';

import React, { useState, useEffect } from 'react';
import { TodoItem, TodoPriority, TodoCategory, SubTask, HabitItem } from '@/types';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Sparkles,
  Flame,
  LayoutGrid,
  ListTodo,
  Play,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  Droplets,
  Activity,
  BookOpen,
  Code2,
  Award
} from 'lucide-react';

interface FocusTodoWidgetProps {
  externalTodos?: TodoItem[];
  onTodosChange?: (todos: TodoItem[]) => void;
  onSelectFocusTodo?: (todo: TodoItem) => void;
  activeFocusTodoId?: string | null;
}

const DEFAULT_HABITS: HabitItem[] = [
  { id: 'h-1', title: '充足饮水 2L', icon: '💧', target: '8 杯水', completedToday: false, streakCount: 0 },
  { id: 'h-2', title: '运动与散步', icon: '🏃', target: '30 分钟', completedToday: false, streakCount: 0 },
  { id: 'h-3', title: '深度阅读', icon: '📖', target: '15 页', completedToday: false, streakCount: 0 },
  { id: 'h-4', title: '核心成果交付', icon: '💻', target: '今日攻坚', completedToday: false, streakCount: 0 },
];

export const FocusTodoWidget: React.FC<FocusTodoWidgetProps> = ({
  externalTodos,
  onTodosChange,
  onSelectFocusTodo,
  activeFocusTodoId,
}) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [priority, setPriority] = useState<TodoPriority>('high');
  const [category, setCategory] = useState<TodoCategory>('work');
  const [filter, setFilter] = useState<'all' | 'high' | 'work' | 'study' | 'life' | 'completed'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'matrix'>('list');
  const [expandedSubtasks, setExpandedSubtasks] = useState<Record<string, boolean>>({});
  const [decomposingIds, setDecomposingIds] = useState<Record<string, boolean>>({});
  const [habits, setHabits] = useState<HabitItem[]>(DEFAULT_HABITS);
  const [showHabits, setShowHabits] = useState<boolean>(true);

  // Play crisp tactile audio chime on completion
  const playChime = (isHigh: boolean = false) => {
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
      const f1 = isHigh ? 659.25 : 523.25;
      const f2 = isHigh ? 1046.50 : 783.99;
      osc.frequency.setValueAtTime(f1, now);
      osc.frequency.setValueAtTime(f2, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      // ignore
    }
  };

  // Load from localStorage or sync with external (filter out any dummy demo todos)
  useEffect(() => {
    if (externalTodos && externalTodos.length > 0) {
      const dummyIds = new Set(['todo-1', 'todo-2', 'todo-3']);
      const filtered = externalTodos.filter((t) => !dummyIds.has(t.id));
      setTodos(filtered);
    } else {
      try {
        const saved = localStorage.getItem('techradar_todos');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const dummyIds = new Set(['todo-1', 'todo-2', 'todo-3']);
            const realTodos = parsed.filter((t: TodoItem) => !dummyIds.has(t.id));
            setTodos(realTodos);
            localStorage.setItem('techradar_todos', JSON.stringify(realTodos));
            if (onTodosChange) onTodosChange(realTodos);
            return;
          }
        }
        setTodos([]);
        localStorage.setItem('techradar_todos', JSON.stringify([]));
        if (onTodosChange) onTodosChange([]);
      } catch (e) {
        console.error(e);
        setTodos([]);
      }
    }

    // Load habits
    try {
      const savedHabits = localStorage.getItem('personal_os_habits');
      if (savedHabits) {
        setHabits(JSON.parse(savedHabits));
      }
    } catch (e) {
      // ignore
    }
  }, [externalTodos]);

  const saveTodos = (newTodos: TodoItem[]) => {
    setTodos(newTodos);
    localStorage.setItem('techradar_todos', JSON.stringify(newTodos));
    if (onTodosChange) onTodosChange(newTodos);
  };

  const saveHabits = (newHabits: HabitItem[]) => {
    setHabits(newHabits);
    localStorage.setItem('personal_os_habits', JSON.stringify(newHabits));
  };

  const handleAdd = () => {
    if (!inputText.trim()) return;
    const item: TodoItem = {
      id: `todo-${Date.now()}`,
      title: inputText.trim(),
      completed: false,
      priority,
      category,
      createdAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };
    const updated = [item, ...todos];
    saveTodos(updated);
    setInputText('');
  };

  const handleToggle = (id: string) => {
    const updated = todos.map((t) => {
      if (t.id === id) {
        const nextState = !t.completed;
        if (nextState) playChime(true);
        // If completing parent, also complete all subtasks
        const subTasks = t.subTasks?.map((st) => ({ ...st, completed: nextState }));
        return { ...t, completed: nextState, subTasks };
      }
      return t;
    });
    saveTodos(updated);
  };

  const handleToggleSubtask = (todoId: string, subtaskId: string) => {
    const updated = todos.map((t) => {
      if (t.id === todoId && t.subTasks) {
        const subTasks = t.subTasks.map((st) =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        const allDone = subTasks.every((st) => st.completed);
        if (!allDone && t.completed) {
          return { ...t, completed: false, subTasks };
        }
        if (allDone && !t.completed) {
          playChime(true);
          return { ...t, completed: true, subTasks };
        }
        playChime(false);
        return { ...t, subTasks };
      }
      return t;
    });
    saveTodos(updated);
  };

  const handleDelete = (id: string) => {
    const updated = todos.filter((t) => t.id !== id);
    saveTodos(updated);
  };

  const handleClearCompleted = () => {
    const updated = todos.filter((t) => !t.completed);
    saveTodos(updated);
    playChime(true);
  };

  // AI Task Decomposition
  const handleAiDecompose = async (todo: TodoItem) => {
    if (decomposingIds[todo.id]) return;
    setDecomposingIds((prev) => ({ ...prev, [todo.id]: true }));

    let userKey = '';
    if (typeof window !== 'undefined') {
      userKey = localStorage.getItem('techradar_gemini_key') || '';
    }

    try {
      const res = await fetch('/api/ai/decompose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskTitle: todo.title, apiKey: userKey }),
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const subTasks: SubTask[] = json.data.map((title: string, idx: number) => ({
          id: `sub-${Date.now()}-${idx}`,
          title,
          completed: false,
        }));
        const updated = todos.map((t) => (t.id === todo.id ? { ...t, subTasks } : t));
        saveTodos(updated);
        setExpandedSubtasks((prev) => ({ ...prev, [todo.id]: true }));
        playChime(true);
      }
    } catch (e) {
      console.error('AI Decompose error:', e);
    } finally {
      setDecomposingIds((prev) => ({ ...prev, [todo.id]: false }));
    }
  };

  const toggleSubtasksExpand = (todoId: string) => {
    setExpandedSubtasks((prev) => ({ ...prev, [todoId]: !prev[todoId] }));
  };

  const handleToggleHabit = (id: string) => {
    const updated = habits.map((h) => {
      if (h.id === id) {
        const next = !h.completedToday;
        if (next) playChime(true);
        return {
          ...h,
          completedToday: next,
          streakCount: next ? h.streakCount + 1 : Math.max(0, h.streakCount - 1),
        };
      }
      return h;
    });
    saveHabits(updated);
  };

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;
  const progressRatio = totalCount > 0 ? completedCount / totalCount : 0;
  const progressPercentage = Math.round(progressRatio * 100);

  // SVG Circular progress math
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const filteredTodos = todos.filter((t) => {
    if (filter === 'high') return t.priority === 'high' && !t.completed;
    if (filter === 'work') return t.category === 'work';
    if (filter === 'study') return t.category === 'study';
    if (filter === 'life') return t.category === 'life';
    if (filter === 'completed') return t.completed;
    return true;
  });

  const getPriorityBadge = (p: TodoPriority) => {
    switch (p) {
      case 'high':
        return <span className="px-1.5 py-0.5 rounded-md bg-red-500/15 text-red-400 font-medium text-[10px] border border-red-500/20">高优</span>;
      case 'medium':
        return <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-400 font-medium text-[10px] border border-amber-500/20">中优</span>;
      case 'low':
        return <span className="px-1.5 py-0.5 rounded-md bg-blue-500/15 text-blue-400 font-medium text-[10px] border border-blue-500/20">常规</span>;
    }
  };

  const getCategoryBadge = (cat?: TodoCategory) => {
    switch (cat) {
      case 'work':
        return <span className="text-[10px] text-zinc-400">💼 工作</span>;
      case 'study':
        return <span className="text-[10px] text-purple-400">💡 学习</span>;
      case 'life':
        return <span className="text-[10px] text-emerald-400">☕ 生活</span>;
      case 'urgent':
        return <span className="text-[10px] text-rose-400 font-bold">⚡ 紧急</span>;
      default:
        return null;
    }
  };

  // Quadrants for Matrix View
  const urgentImportant = todos.filter((t) => t.priority === 'high' && !t.completed);
  const importantNotUrgent = todos.filter((t) => t.priority === 'medium' && !t.completed);
  const otherTasks = todos.filter((t) => t.priority === 'low' && !t.completed);
  const doneTasks = todos.filter((t) => t.completed);

  return (
    <div className="glass-card rounded-3xl p-5 border border-white/10 space-y-4 flex flex-col h-full shadow-2xl relative overflow-hidden bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-blue-950/20">
      {/* Background ambient lighting */}
      <div className="absolute -top-16 -left-16 w-44 h-44 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-44 h-44 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header: Gamified Level & Progress Ring */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          {/* Circular Progress Ring */}
          <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r={radius}
                className="stroke-zinc-800"
                strokeWidth="3.5"
                fill="transparent"
              />
              <circle
                cx="24"
                cy="24"
                r={radius}
                className="stroke-blue-500 transition-all duration-500 ease-out"
                strokeWidth="3.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-[11px] font-mono font-bold text-white">
              {progressPercentage}%
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white tracking-tight">今日核心待办</h3>
              {progressPercentage === 100 && totalCount > 0 ? (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  <Award className="w-3 h-3 text-emerald-400" />
                  <span>全部清空</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>连胜 {completedCount} 项</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400">
              已完成 {completedCount} / {totalCount} 目标
            </p>
          </div>
        </div>

        {/* View mode toggle & clear button */}
        <div className="flex items-center gap-1.5">
          {completedCount > 0 && (
            <button
              onClick={handleClearCompleted}
              className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-[11px] transition-all flex items-center gap-1 cursor-pointer border border-white/5"
              title="清理所有已完成任务"
            >
              <span>清办</span>
            </button>
          )}

          <div className="flex items-center bg-zinc-950/80 p-0.5 rounded-xl border border-white/10 text-[11px]">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
              title="清单视图"
            >
              <ListTodo className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'matrix' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
              title="四象限矩阵看板"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Chips Bar (In List View) */}
      {viewMode === 'list' && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs pb-0.5">
          {[
            { id: 'all', label: '全部', count: todos.length },
            { id: 'high', label: '🔥 必做', count: todos.filter((t) => t.priority === 'high' && !t.completed).length },
            { id: 'work', label: '💼 工作', count: todos.filter((t) => t.category === 'work').length },
            { id: 'study', label: '💡 学习', count: todos.filter((t) => t.category === 'study').length },
            { id: 'life', label: '☕ 生活', count: todos.filter((t) => t.category === 'life').length },
            { id: 'completed', label: '✅ 已办', count: completedCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-2.5 py-1 rounded-xl text-[11px] whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                filter === tab.id
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-zinc-400 border border-white/5'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] ${filter === tab.id ? 'text-blue-200' : 'text-zinc-500'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Smart Quick Input Row */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
              }}
              placeholder="添加重要待办（按回车快速录入）..."
              className="w-full bg-zinc-950/80 border border-white/10 rounded-2xl pl-3.5 pr-20 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-inner"
            />
            {/* Quick Priority & Category selectors inside input */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  const pList: TodoPriority[] = ['high', 'medium', 'low'];
                  setPriority(pList[(pList.indexOf(priority) + 1) % 3]);
                }}
                className="cursor-pointer"
                title="点击切换优先级"
              >
                {getPriorityBadge(priority)}
              </button>
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={!inputText.trim()}
            className="p-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 active:scale-95 text-white transition-all shadow-md shadow-blue-600/20 cursor-pointer flex-shrink-0"
            title="添加任务"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Category Pills Selector */}
        <div className="flex items-center gap-1.5 text-[10px] px-1">
          <span className="text-zinc-500">归属:</span>
          {(['work', 'study', 'life', 'urgent'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                category === cat
                  ? 'bg-white/15 border-white/30 text-white font-semibold'
                  : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {cat === 'work' ? '💼工作' : cat === 'study' ? '💡学习' : cat === 'life' ? '☕生活' : '⚡应急'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'list' ? (
        /* List Mode with Subtasks & AI Decompose */
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2.5 max-h-80 min-h-[160px] pr-0.5">
          {filteredTodos.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 text-xs space-y-1">
              <p>{filter === 'completed' ? '暂无已完成的任务' : '当前列表暂无待办，享受轻松专注时光！'}</p>
              <p className="text-[10px] text-zinc-600">写下一件今天最重要的事情，让专注创造价值</p>
            </div>
          ) : (
            filteredTodos.map((todo) => {
              const isFocusing = activeFocusTodoId === todo.id;
              const hasSubtasks = todo.subTasks && todo.subTasks.length > 0;
              const isExpanded = expandedSubtasks[todo.id] ?? false;
              const completedSubCount = todo.subTasks?.filter((s) => s.completed).length || 0;
              const totalSubCount = todo.subTasks?.length || 0;

              return (
                <div
                  key={todo.id}
                  className={`group rounded-2xl border transition-all ${
                    isFocusing
                      ? 'bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/10'
                      : todo.completed
                      ? 'bg-zinc-950/40 border-white/5 opacity-60'
                      : 'bg-zinc-900/80 border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Main Task Item Row */}
                  <div className="p-3 flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <button
                        onClick={() => handleToggle(todo.id)}
                        className="flex-shrink-0 text-zinc-400 hover:text-blue-400 transition-colors cursor-pointer"
                      >
                        {todo.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-zinc-500" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p
                            onClick={() => handleToggle(todo.id)}
                            className={`text-xs leading-snug break-words cursor-pointer ${
                              todo.completed ? 'line-through text-zinc-500' : 'text-zinc-100 font-medium'
                            }`}
                          >
                            {todo.title}
                          </p>
                        </div>

                        {/* Badges row */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {!todo.completed && getPriorityBadge(todo.priority)}
                          {getCategoryBadge(todo.category)}
                          {todo.sourceNewsTitle && (
                            <span className="text-[10px] text-blue-400/80 truncate max-w-[140px]">
                              源: {todo.sourceNewsTitle}
                            </span>
                          )}
                          {hasSubtasks && (
                            <button
                              onClick={() => toggleSubtasksExpand(todo.id)}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/20 flex items-center gap-0.5 cursor-pointer hover:bg-blue-500/25"
                            >
                              <span>
                                {completedSubCount}/{totalSubCount} 步骤
                              </span>
                              {isExpanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* AI Decompose Button */}
                      {!todo.completed && !hasSubtasks && (
                        <button
                          onClick={() => handleAiDecompose(todo)}
                          disabled={decomposingIds[todo.id]}
                          className="px-2 py-1 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 text-[11px] border border-purple-500/20 flex items-center gap-1 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                          title="使用 Gemini AI 拆解为可执行子任务"
                        >
                          <Sparkles className={`w-3 h-3 text-purple-400 ${decomposingIds[todo.id] ? 'animate-spin' : ''}`} />
                          <span className="hidden sm:inline">AI拆解</span>
                        </button>
                      )}

                      {/* Focus with Pomodoro */}
                      {!todo.completed && onSelectFocusTodo && (
                        <button
                          onClick={() => onSelectFocusTodo(todo)}
                          className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                            isFocusing
                              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                              : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-blue-300 border-white/5'
                          }`}
                          title="载入番茄钟开启沉浸专注"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(todo.id)}
                        className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors cursor-pointer"
                        title="删除待办"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Subtasks Accordion Panel */}
                  {hasSubtasks && isExpanded && (
                    <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-1.5 bg-black/20 rounded-b-2xl">
                      <div className="text-[10px] text-zinc-400 flex items-center justify-between pb-1">
                        <span>行动步骤清单:</span>
                        <span>{Math.round((completedSubCount / totalSubCount) * 100)}% 完成</span>
                      </div>
                      {todo.subTasks!.map((st) => (
                        <div
                          key={st.id}
                          onClick={() => handleToggleSubtask(todo.id, st.id)}
                          className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
                        >
                          <button className="flex-shrink-0 text-zinc-400">
                            {st.completed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-zinc-600" />
                            )}
                          </button>
                          <span
                            className={`text-[11px] leading-tight flex-1 ${
                              st.completed ? 'line-through text-zinc-500' : 'text-zinc-300'
                            }`}
                          >
                            {st.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Matrix Mode: 4 Quadrants View */
        <div className="grid grid-cols-2 gap-2.5 max-h-80 overflow-y-auto no-scrollbar">
          {/* Q1: Urgent & Important */}
          <div className="p-3 rounded-2xl bg-red-950/20 border border-red-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-red-400">🔴 紧急且重要</span>
              <span className="text-[10px] text-zinc-400">{urgentImportant.length}</span>
            </div>
            <div className="space-y-1.5 max-h-28 overflow-y-auto no-scrollbar">
              {urgentImportant.length === 0 ? (
                <span className="text-[10px] text-zinc-500 block py-2">暂无高优待办</span>
              ) : (
                urgentImportant.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleToggle(t.id)}
                    className="p-1.5 rounded-xl bg-black/30 text-[11px] text-zinc-200 cursor-pointer hover:bg-black/50 transition-colors truncate"
                  >
                    {t.title}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Q2: Important Not Urgent */}
          <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-400">🟡 重要不紧急</span>
              <span className="text-[10px] text-zinc-400">{importantNotUrgent.length}</span>
            </div>
            <div className="space-y-1.5 max-h-28 overflow-y-auto no-scrollbar">
              {importantNotUrgent.length === 0 ? (
                <span className="text-[10px] text-zinc-500 block py-2">暂无规划事项</span>
              ) : (
                importantNotUrgent.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleToggle(t.id)}
                    className="p-1.5 rounded-xl bg-black/30 text-[11px] text-zinc-200 cursor-pointer hover:bg-black/50 transition-colors truncate"
                  >
                    {t.title}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Q3: Other / Routine */}
          <div className="p-3 rounded-2xl bg-blue-950/20 border border-blue-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-400">🔵 常规与速战</span>
              <span className="text-[10px] text-zinc-400">{otherTasks.length}</span>
            </div>
            <div className="space-y-1.5 max-h-28 overflow-y-auto no-scrollbar">
              {otherTasks.length === 0 ? (
                <span className="text-[10px] text-zinc-500 block py-2">暂无常规待办</span>
              ) : (
                otherTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleToggle(t.id)}
                    className="p-1.5 rounded-xl bg-black/30 text-[11px] text-zinc-200 cursor-pointer hover:bg-black/50 transition-colors truncate"
                  >
                    {t.title}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Q4: Completed */}
          <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-400">🟢 今日已达成</span>
              <span className="text-[10px] text-zinc-400">{doneTasks.length}</span>
            </div>
            <div className="space-y-1.5 max-h-28 overflow-y-auto no-scrollbar">
              {doneTasks.length === 0 ? (
                <span className="text-[10px] text-zinc-500 block py-2">暂无已办成果</span>
              ) : (
                doneTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleToggle(t.id)}
                    className="p-1.5 rounded-xl bg-black/30 text-[11px] text-zinc-400 line-through cursor-pointer truncate"
                  >
                    {t.title}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Daily Micro-Habits Bar (极简习惯打卡) */}
      <div className="pt-2 border-t border-white/5">
        <div
          onClick={() => setShowHabits(!showHabits)}
          className="flex items-center justify-between text-[11px] text-zinc-400 cursor-pointer py-1 hover:text-zinc-200 transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-zinc-300">每日高频微习惯打卡</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-zinc-500">
            <span>{habits.filter((h) => h.completedToday).length}/{habits.length} 已达标</span>
            {showHabits ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </div>
        </div>

        {showHabits && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            {habits.map((habit) => (
              <button
                key={habit.id}
                onClick={() => handleToggleHabit(habit.id)}
                className={`p-2 rounded-2xl border transition-all flex items-center justify-between cursor-pointer active:scale-95 ${
                  habit.completedToday
                    ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-200 shadow-sm'
                    : 'bg-white/5 border-white/5 hover:bg-white/10 text-zinc-400'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm">{habit.icon}</span>
                  <div className="text-left min-w-0">
                    <p className={`text-[11px] font-semibold truncate ${habit.completedToday ? 'text-white' : 'text-zinc-300'}`}>
                      {habit.title}
                    </p>
                    <p className="text-[9px] text-zinc-500 truncate">{habit.target}</p>
                  </div>
                </div>

                {habit.completedToday ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
