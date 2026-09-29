'use client';

import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, isRefreshing, activeTab }) => {
  const today = new Date();
  const dateStr = today.toLocaleDateString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  });

  const getTabTitle = () => {
    switch (activeTab) {
      case 'workbench':
        return '个人实用工作台';
      case 'fitness':
        return '硬核铁馆 · 健身打卡';
      case 'radar':
        return '科技与热点雷达';
      case 'aichat':
        return 'Gemini AI 智囊';
      case 'settings':
        return '工作台设置';
      default:
        return '个人工作台';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-header safe-top transition-all">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: Date & Title */}
        <div className="flex flex-col">
          <span className="text-[11px] font-medium text-zinc-400 tracking-wider uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {dateStr} · PERSONAL OS
          </span>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            {getTabTitle()}
          </h1>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {activeTab !== 'settings' && activeTab !== 'aichat' && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className={`p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700/80 active:scale-95 transition-all text-zinc-300 border border-white/10 ${
                isRefreshing ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              title="刷新数据"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
            </button>
          )}

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span className="hidden sm:inline">Gemini 3.8</span>
            <span>AI 已连接</span>
          </div>
        </div>
      </div>
    </header>
  );
};
