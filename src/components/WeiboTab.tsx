'use client';

import React, { useState } from 'react';
import { WeiboHotItem } from '@/types';
import { Flame, Sparkles, ExternalLink, Zap, Plus, Search } from 'lucide-react';

interface WeiboTabProps {
  items: WeiboHotItem[];
  isLoading: boolean;
  onOpenAskAi: (title: string, content: string) => void;
  onAddNewsToTodo?: (title: string) => void;
}

export const WeiboTab: React.FC<WeiboTabProps> = ({
  items,
  isLoading,
  onOpenAskAi,
  onAddNewsToTodo,
}) => {
  const [techOnly, setTechOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter((item) => {
    if (techOnly && !item.isTech) return false;
    if (searchQuery.trim() && !item.word.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const formatHotValue = (val: number) => {
    if (val >= 10000) {
      return (val / 10000).toFixed(1) + '万';
    }
    return val > 0 ? val.toLocaleString() : '热搜中';
  };

  const getRankBadgeStyle = (pos: number) => {
    if (pos === 1) return 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-black';
    if (pos === 2) return 'bg-zinc-300/20 text-zinc-200 border-zinc-300/40 font-black';
    if (pos === 3) return 'bg-orange-700/20 text-orange-400 border-orange-600/40 font-black';
    return 'bg-zinc-800 text-zinc-400 border-white/5 font-semibold';
  };

  const getLabelBadge = (label?: string) => {
    if (!label) return null;
    let colorClass = 'bg-zinc-800 text-zinc-300';
    if (label === '爆') colorClass = 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse';
    else if (label === '热') colorClass = 'bg-orange-500/20 text-orange-400 border border-orange-500/40';
    else if (label === '新') colorClass = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';
    else if (label === '沸') colorClass = 'bg-red-500/20 text-red-400 border border-red-500/40';
    else if (label === '荐') colorClass = 'bg-blue-500/20 text-blue-400 border border-blue-500/40';

    return (
      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${colorClass}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Subheader Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setTechOnly(false)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              !techOnly
                ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/30'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/10'
            }`}
          >
            全网热搜 ({items.length})
          </button>
          <button
            onClick={() => setTechOnly(true)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              techOnly
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/10'
            }`}
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>科技数码专区</span>
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索热搜词条..."
            className="w-full sm:w-48 bg-zinc-900/90 border border-white/10 rounded-xl pl-8 pr-3 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Weibo Items List */}
      {isLoading ? (
        <div className="space-y-2.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-3.5 flex items-center gap-3 animate-pulse">
              <div className="w-7 h-7 bg-white/10 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-3/4 bg-white/10 rounded" />
                <div className="h-3 w-1/3 bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center space-y-2">
          <Flame className="w-8 h-8 text-zinc-600 mx-auto" />
          <p className="text-sm text-zinc-400">未找到符合条件的热搜词条</p>
          <button
            onClick={() => {
              setTechOnly(false);
              setSearchQuery('');
            }}
            className="text-xs text-orange-400 hover:underline"
          >
            重置筛选条件
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <div
              key={`${item.position}-${item.word}`}
              className={`glass-card rounded-2xl p-3.5 transition-all duration-200 hover:border-white/20 active:scale-[0.99] flex items-center justify-between gap-3 ${
                item.isTech ? 'border-orange-500/25 bg-orange-950/10' : ''
              }`}
            >
              {/* Left: Position & Word */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs border shrink-0 ${getRankBadgeStyle(
                    item.position
                  )}`}
                >
                  {item.position}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-white hover:text-orange-400 transition-colors line-clamp-1 group"
                    >
                      <span>{item.word}</span>
                    </a>
                    {getLabelBadge(item.label)}
                    {item.isTech && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/15 border border-blue-500/30 text-blue-300 font-semibold">
                        科技
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400">
                    <span className="flex items-center gap-1 text-orange-400 font-mono">
                      <Flame className="w-3 h-3 text-orange-400" />
                      {formatHotValue(item.hotValue)}
                    </span>
                    <span>•</span>
                    <span className="text-zinc-500">{item.category}</span>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {onAddNewsToTodo && (
                  <button
                    onClick={() => onAddNewsToTodo(`研读微博热搜: ${item.word}`)}
                    className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-400 hover:text-white transition-all active:scale-95"
                    title="加入今日专注待办"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() =>
                    onOpenAskAi(
                      `微博热搜：${item.word}`,
                      `热度指数：${formatHotValue(item.hotValue)}。\n这是当前微博实时热搜榜第 ${item.position} 位的话题。`
                    )
                  }
                  className="p-2 rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 hover:from-orange-500/20 hover:to-amber-500/20 text-orange-300 border border-orange-500/20 transition-all active:scale-95 flex items-center gap-1 text-xs"
                  title="让 Gemini AI 深度解读背景"
                >
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                  <span className="hidden sm:inline">AI解读</span>
                </button>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-400 hover:text-white transition-all active:scale-95"
                  title="在微博打开此热搜"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
