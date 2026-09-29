'use client';

import React, { useState, useEffect } from 'react';
import { TodoItem, TodoPriority } from '@/types';
import { CheckCircle2, Circle, Plus, Trash2, Check, Sparkles, Filter } from 'lucide-react';

interface FocusTodoWidgetProps {
  externalTodos?: TodoItem[];
  onTodosChange?: (todos: TodoItem[]) => void;
}

export const FocusTodoWidget: React.FC<FocusTodoWidgetProps> = ({
  externalTodos,
  onTodosChange,
}) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [priority, setPriority] = useState<TodoPriority>('medium');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Load from localStorage or sync with external
  useEffect(() => {
    if (externalTodos && externalTodos.length > 0) {
      setTodos(externalTodos);
    } else {
      try {
        const saved = localStorage.getItem('techradar_todos');
        if (saved) {
          setTodos(JSON.parse(saved));
        } else {
          // Default initial onboarding items
          const initial: TodoItem[] = [
            {
              id: 'todo-1',
              title: '体验全新个人工作台与科技早报',
              completed: true,
              priority: 'high',
              createdAt: '今日',
            },
            {
              id: 'todo-2',
              title: '尝试将一条科技热点或抖音热搜一键转为待办',
              completed: false,
              priority: 'medium',
              createdAt: '今日',
            },
            {
              id: 'todo-3',
              title: '启动一次 25 分钟番茄专注时钟',
              completed: false,
              priority: 'low',
              createdAt: '今日',
            },
          ];
          setTodos(initial);
          localStorage.setItem('techradar_todos', JSON.stringify(initial));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [externalTodos]);

  const saveTodos = (newTodos: TodoItem[]) => {
    setTodos(newTodos);
    localStorage.setItem('techradar_todos', JSON.stringify(newTodos));
    if (onTodosChange) onTodosChange(newTodos);
  };

  const handleAdd = () => {
    if (!inputText.trim()) return;
    const item: TodoItem = {
      id: `todo-${Date.now()}`,
      title: inputText.trim(),
      completed: false,
      priority,
      createdAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };
    const updated = [item, ...todos];
    saveTodos(updated);
    setInputText('');
  };

  const handleToggle = (id: string) => {
    const updated = todos.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    saveTodos(updated);
  };

  const handleDelete = (id: string) => {
    const updated = todos.filter((t) => t.id !== id);
    saveTodos(updated);
  };

  const filteredTodos = todos.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const completedCount = todos.filter((t) => t.completed).length;

  const getPriorityBadge = (p: TodoPriority) => {
    switch (p) {
      case 'high':
        return <span className="w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-500/50" title="高优先级" />;
      case 'medium':
        return <span className="w-2 h-2 rounded-full bg-amber-400" title="中优先级" />;
      case 'low':
        return <span className="w-2 h-2 rounded-full bg-blue-400" title="低优先级" />;
    }
  };

  return (
    <div className="glass-card rounded-3xl p-5 border border-white/10 space-y-4 flex flex-col h-full shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>今日专注待办</span>
              <span className="text-[11px] text-zinc-400 font-normal">
                ({completedCount}/{todos.length})
              </span>
            </h3>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1 bg-zinc-900/90 p-0.5 rounded-xl border border-white/10 text-[11px]">
          {(['all', 'active', 'completed'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`px-2 py-0.5 rounded-lg transition-all ${
                filter === mode
                  ? 'bg-blue-600 text-white font-medium shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {mode === 'all' ? '全部' : mode === 'active' ? '进行中' : '已完成'}
            </button>
          ))}
        </div>
      </div>

      {/* Input row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
            }}
            placeholder="写下今天最重要的任务..."
            className="w-full bg-zinc-900/90 border border-white/10 rounded-2xl pl-3.5 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-all"
          />
          <button
            onClick={() => {
              const priorities: TodoPriority[] = ['medium', 'high', 'low'];
              const next = priorities[(priorities.indexOf(priority) + 1) % 3];
              setPriority(next);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1"
            title="切换优先级"
          >
            {getPriorityBadge(priority)}
          </button>
        </div>

        <button
          onClick={handleAdd}
          disabled={!inputText.trim()}
          className="p-2 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 active:scale-95 text-white transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 max-h-64 min-h-[140px]">
        {filteredTodos.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-xs">
            {filter === 'completed' ? '暂无已完成任务' : '今日暂无待办，享受轻松时光！'}
          </div>
        ) : (
          filteredTodos.map((todo) => (
            <div
              key={todo.id}
              className={`group flex items-center justify-between gap-2.5 p-2.5 rounded-2xl border transition-all ${
                todo.completed
                  ? 'bg-zinc-900/40 border-white/5 opacity-60'
                  : 'bg-zinc-900/80 border-white/10 hover:border-white/20'
              }`}
            >
              <div
                onClick={() => handleToggle(todo.id)}
                className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
              >
                <button
                  className="flex-shrink-0 text-zinc-400 hover:text-blue-400 transition-colors"
                >
                  {todo.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-zinc-500" />
                  )}
                </button>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <p
                    className={`text-xs leading-snug break-words ${
                      todo.completed
                        ? 'line-through text-zinc-500'
                        : 'text-zinc-200'
                    }`}
                  >
                    {todo.title}
                  </p>
                  {todo.sourceNewsTitle && (
                    <span className="text-[10px] text-blue-400/80 flex items-center gap-0.5 truncate">
                      <span>源自热点:</span>
                      <span className="truncate">{todo.sourceNewsTitle}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {!todo.completed && getPriorityBadge(todo.priority)}
                <button
                  onClick={() => handleDelete(todo.id)}
                  className="p-1 text-zinc-600 hover:text-red-400 opacity-60 group-hover:opacity-100 transition-all active:scale-90"
                  title="删除"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
