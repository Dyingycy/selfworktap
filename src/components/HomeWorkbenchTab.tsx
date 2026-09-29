'use client';

import React, { useState, useEffect } from 'react';
import { DailyBriefing, TodoItem } from '@/types';
import { FocusTodoWidget } from '@/components/FocusTodoWidget';
import { PomodoroWidget } from '@/components/PomodoroWidget';
import { ScratchpadWidget } from '@/components/ScratchpadWidget';
import { QuickLauncherWidget } from '@/components/QuickLauncherWidget';
import { Sparkles, ArrowRight, Sun, Sunset, Moon, Sunrise } from 'lucide-react';

interface HomeWorkbenchTabProps {
  briefing: DailyBriefing | null;
  onNavigateToTab: (tabId: string) => void;
  todos: TodoItem[];
  onTodosChange: (todos: TodoItem[]) => void;
}

export const HomeWorkbenchTab: React.FC<HomeWorkbenchTabProps> = ({
  briefing,
  onNavigateToTab,
  todos,
  onTodosChange,
}) => {
  const [currentTime, setCurrentTime] = useState('');
  const [greeting, setGreeting] = useState('');
  const [GreetingIcon, setGreetingIcon] = useState<any>(Sunrise);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );

      const hour = now.getHours();
      if (hour >= 5 && hour < 11) {
        setGreeting('早上好，开启专注高效的一天');
        setGreetingIcon(Sunrise);
      } else if (hour >= 11 && hour < 14) {
        setGreeting('中午好，劳逸结合注意休息');
        setGreetingIcon(Sun);
      } else if (hour >= 14 && hour < 19) {
        setGreeting('下午好，保持专注冲刺目标');
        setGreetingIcon(Sunset);
      } else {
        setGreeting('晚上好，复盘今日并放松身心');
        setGreetingIcon(Moon);
      }
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-4 pb-8 max-w-5xl mx-auto">
      {/* 1. Greeting & Live Clock Banner */}
      <div className="glass-card rounded-3xl p-5 border border-white/10 bg-gradient-to-r from-blue-950/20 via-zinc-900/60 to-purple-950/20 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
            {GreetingIcon && <GreetingIcon className="w-4 h-4 text-amber-400" />}
            <span>{greeting}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            个人专属生产力工作台
          </h2>
          <p className="text-xs text-zinc-400">
            {briefing?.quoteOfTheDay ? `“${briefing.quoteOfTheDay}”` : '把目标分解为行动，让思考产生价值。'}
          </p>
        </div>

        <div className="flex items-baseline sm:flex-col sm:items-end gap-2 sm:gap-0">
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono text-white">
            {currentTime}
          </div>
          <span className="text-[11px] text-zinc-500 uppercase tracking-wider">
            LOCAL SYSTEM TIME
          </span>
        </div>
      </div>

      {/* 2. Today's Tech Briefing Quick Highlight Bar */}
      {briefing && (
        <div
          onClick={() => onNavigateToTab('radar')}
          className="glass-card rounded-2xl px-4 py-3 border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-zinc-900/70 to-zinc-900/90 flex items-center justify-between gap-3 cursor-pointer hover:border-amber-500/40 active:scale-[0.99] transition-all group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-6 h-6 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center flex-shrink-0 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </span>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                今日科技风向标
              </span>
              <p className="text-xs font-semibold text-zinc-100 truncate">
                {briefing.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-amber-400 font-medium group-hover:translate-x-1 transition-transform flex-shrink-0">
            <span>速读简报</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      )}

      {/* 3. Bento Grid (Responsive: 1 col on mobile, 2/3 cols on tablet/desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Column: Focus Todos (Takes 7 cols on desktop) */}
        <div className="md:col-span-7 flex flex-col gap-4">
          <FocusTodoWidget
            externalTodos={todos}
            onTodosChange={onTodosChange}
          />
        </div>

        {/* Right Column: Pomodoro Focus Timer (Takes 5 cols on desktop) */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <PomodoroWidget />
        </div>

        {/* Bottom Left Column: Quick Notes / Scratchpad (Takes 6 cols) */}
        <div className="md:col-span-6 flex flex-col gap-4">
          <ScratchpadWidget />
        </div>

        {/* Bottom Right Column: Quick Launcher Dock (Takes 6 cols) */}
        <div className="md:col-span-6 flex flex-col gap-4">
          <QuickLauncherWidget />
        </div>
      </div>
    </div>
  );
};
