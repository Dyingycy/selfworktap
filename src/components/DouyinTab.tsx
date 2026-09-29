'use client';

import React, { useState } from 'react';
import { DouyinHotItem } from '@/types';
import { Flame, Sparkles, ExternalLink, Zap, Video } from 'lucide-react';

interface DouyinTabProps {
  items: DouyinHotItem[];
  isLoading: boolean;
  onOpenAskAi: (title: string, content: string) => void;
}

export const DouyinTab: React.FC<DouyinTabProps> = ({ items, isLoading, onOpenAskAi }) => {
  const [techOnly, setTechOnly] = useState(false);

  const displayItems = techOnly ? items.filter((i) => i.isTech) : items;

  const formatHotValue = (val: number) => {
    if (val >= 10000000) {
      return (val / 10000).toFixed(0) + '万';
    }
    if (val >= 10000) {
      return (val / 10000).toFixed(1) + '万';
    }
    return val.toLocaleString();
  };

  const getRankBadgeStyle = (pos: number) => {
    if (pos === 1) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    if (pos === 2) return 'bg-zinc-400/20 text-zinc-300 border-zinc-400/30';
    if (pos === 3) return 'bg-amber-700/20 text-amber-500 border-amber-700/30';
    return 'bg-zinc-800 text-zinc-500 border-white/5';
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Subheader Filter Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTechOnly(false)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              !techOnly
                ? 'bg-zinc-100 text-zinc-900 font-semibold'
                : 'bg-zinc-900 text-zinc-400 border border-white/10'
            }`}
          >
            全部热搜 ({items.length})
          </button>
          <button
            onClick={() => setTechOnly(true)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              techOnly
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-zinc-900 text-zinc-400 border border-white/10'
            }`}
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>科技数码专区</span>
          </button>
        </div>

        <span className="text-[11px] text-zinc-500 flex items-center gap-1">
          <Flame className="w-3 h-3 text-pink-500" />
          <span>实时抖音热榜</span>
        </span>
      </div>

      {/* Douyin Items List */}
      {isLoading ? (
        <div className="space-y-2.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-3.5 flex items-center gap-3 animate-pulse">
              <div className="w-7 h-7 bg-white/10 rounded-full shimmer" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-3/4 bg-white/10 rounded shimmer" />
                <div className="h-3 w-1/3 bg-white/5 rounded shimmer" />
              </div>
            </div>
          ))}
        </div>
      ) : displayItems.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center space-y-2">
          <Zap className="w-8 h-8 text-zinc-600 mx-auto" />
          <p className="text-sm text-zinc-400">当前热搜暂无科技数码直接关键词</p>
          <button
            onClick={() => setTechOnly(false)}
            className="text-xs text-blue-400 hover:underline"
          >
            查看全网 50 条热榜
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {displayItems.map((item) => (
            <div
              key={item.position}
              className={`glass-card rounded-2xl p-3.5 transition-all duration-200 hover:border-white/20 active:scale-[0.99] flex items-center justify-between gap-3 ${
                item.isTech ? 'border-blue-500/25 bg-blue-950/10' : ''
              }`}
            >
              {/* Left: Position & Topic */}
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 border ${getRankBadgeStyle(
                    item.position
                  )}`}
                >
                  {item.position}
                </span>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-zinc-100 hover:text-pink-400 transition-colors truncate"
                    >
                      {item.word}
                    </a>

                    {item.label && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-400 font-bold border border-pink-500/30">
                        {item.label}
                      </span>
                    )}

                    {item.isTech && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-medium border border-blue-500/30">
                        {item.categoryTag}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                    <span className="flex items-center gap-0.5 text-pink-400/90">
                      <Flame className="w-3 h-3 text-pink-500" />
                      {formatHotValue(item.hotValue)}
                    </span>
                    {item.videoCount ? (
                      <span className="flex items-center gap-0.5">
                        <Video className="w-3 h-3" />
                        {item.videoCount}条视频
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Right: Action Buttons */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() =>
                    onOpenAskAi(
                      `抖音热搜：${item.word}`,
                      `热度指数：${item.hotValue}。请解读该热点在科技/数码/社会数智创新层面的背景与看点。`
                    )
                  }
                  className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 active:scale-90 transition-all"
                  title="Gemini 解读"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                </button>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border border-white/10 active:scale-90 transition-all"
                  title="在抖音中打开"
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
