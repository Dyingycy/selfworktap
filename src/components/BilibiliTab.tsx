'use client';

import React, { useState } from 'react';
import { BilibiliHotItem } from '@/types';
import { Tv, Sparkles, ExternalLink, Zap, Plus, Search, Play, User } from 'lucide-react';

interface BilibiliTabProps {
  items: BilibiliHotItem[];
  isLoading: boolean;
  onOpenAskAi: (title: string, content: string) => void;
  onAddNewsToTodo?: (title: string) => void;
}

interface BilibiliVideoCoverProps {
  pic: string;
  title: string;
}

const BilibiliVideoCover: React.FC<BilibiliVideoCoverProps> = ({ pic, title }) => {
  const cleanPic = pic.startsWith('//')
    ? `https:${pic}`
    : pic.startsWith('http:')
    ? pic.replace('http:', 'https:')
    : pic;

  const [src, setSrc] = useState(cleanPic);
  const [loadStage, setLoadStage] = useState<'direct' | 'proxy' | 'failed'>('direct');
  const [isLoaded, setIsLoaded] = useState(false);

  const handleError = () => {
    if (loadStage === 'direct') {
      setLoadStage('proxy');
      setSrc(`/api/proxy-image?url=${encodeURIComponent(cleanPic)}`);
    } else {
      setLoadStage('failed');
    }
  };

  return (
    <div className="relative w-20 h-14 rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-white/5 flex items-center justify-center">
      {loadStage !== 'failed' ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={title}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={handleError}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-pink-950/30 to-purple-950/30 text-pink-400">
          <Tv className="w-5 h-5 opacity-70" />
        </div>
      )}

      {/* Hover Play icon indicator */}
      <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
        <Play className="w-4 h-4 text-white fill-white" />
      </div>
    </div>
  );
};

export const BilibiliTab: React.FC<BilibiliTabProps> = ({
  items,
  isLoading,
  onOpenAskAi,
  onAddNewsToTodo,
}) => {
  const [techOnly, setTechOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter((item) => {
    if (techOnly && !item.isTech) return false;
    if (searchQuery.trim() && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const formatViewCount = (val?: number) => {
    if (!val) return '热门播放';
    if (val >= 10000) {
      return (val / 10000).toFixed(1) + '万播放';
    }
    return val.toLocaleString() + '播放';
  };

  const getRankBadgeStyle = (pos: number) => {
    if (pos === 1) return 'bg-pink-500/20 text-pink-300 border-pink-500/40 font-black';
    if (pos === 2) return 'bg-zinc-300/20 text-zinc-200 border-zinc-300/40 font-black';
    if (pos === 3) return 'bg-amber-700/20 text-amber-400 border-amber-600/40 font-black';
    return 'bg-zinc-800 text-zinc-400 border-white/5 font-semibold';
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
                ? 'bg-pink-500 text-white font-bold shadow-md shadow-pink-500/30'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/10'
            }`}
          >
            全部热门 ({items.length})
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
            placeholder="搜索B站热门..."
            className="w-full sm:w-48 bg-zinc-900/90 border border-white/10 rounded-xl pl-8 pr-3 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500"
          />
        </div>
      </div>

      {/* Bilibili Items List */}
      {isLoading ? (
        <div className="space-y-2.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-3.5 flex items-center gap-3 animate-pulse">
              <div className="w-16 h-12 bg-white/10 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-3/4 bg-white/10 rounded" />
                <div className="h-3 w-1/3 bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center space-y-2">
          <Tv className="w-8 h-8 text-zinc-600 mx-auto" />
          <p className="text-sm text-zinc-400">未找到符合条件的B站热门内容</p>
          <button
            onClick={() => {
              setTechOnly(false);
              setSearchQuery('');
            }}
            className="text-xs text-pink-400 hover:underline"
          >
            重置筛选条件
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredItems.map((item) => (
            <div
              key={`${item.position}-${item.bvid || item.title}`}
              className={`glass-card rounded-2xl p-3 sm:p-3.5 transition-all duration-200 hover:border-white/20 active:scale-[0.99] flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                item.isTech ? 'border-pink-500/25 bg-pink-950/10' : ''
              }`}
            >
              {/* Left: Thumbnail & Details */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Rank Badge */}
                <span
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs border shrink-0 ${getRankBadgeStyle(
                    item.position
                  )}`}
                >
                  {item.position}
                </span>

                {/* Video Cover Thumbnail */}
                {item.pic && <BilibiliVideoCover pic={item.pic} title={item.title} />}

                {/* Title & Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-white hover:text-pink-400 transition-colors line-clamp-1 group"
                    >
                      <span>{item.title}</span>
                    </a>
                    {item.rcmdReason && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-pink-500/15 border border-pink-500/30 text-pink-300 font-semibold">
                        {item.rcmdReason}
                      </span>
                    )}
                    {item.isTech && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/15 border border-blue-500/30 text-blue-300 font-semibold">
                        科技
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400">
                    <span className="text-zinc-300 flex items-center gap-1">
                      <User className="w-3 h-3 text-zinc-500" />
                      {item.ownerName}
                    </span>
                    <span>•</span>
                    <span className="text-pink-400 font-mono">
                      {formatViewCount(item.viewCount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center justify-end gap-1.5 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-white/5">
                {onAddNewsToTodo && (
                  <button
                    onClick={() => onAddNewsToTodo(`观看B站热门: ${item.title}`)}
                    className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-400 hover:text-white transition-all active:scale-95"
                    title="加入今日待办"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() =>
                    onOpenAskAi(
                      `B站热门视频：${item.title}`,
                      `UP主：${item.ownerName}\n播放量：${formatViewCount(item.viewCount)}\n简介：${
                        item.desc || '暂无描述'
                      }\n视频链接：${item.url}`
                    )
                  }
                  className="p-2 rounded-xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 hover:from-pink-500/20 hover:to-purple-500/20 text-pink-300 border border-pink-500/20 transition-all active:scale-95 flex items-center gap-1 text-xs"
                  title="让 Gemini AI 解读该热门"
                >
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                  <span className="hidden sm:inline">AI解读</span>
                </button>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-400 hover:text-white transition-all active:scale-95"
                  title="在B站直接播放"
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
