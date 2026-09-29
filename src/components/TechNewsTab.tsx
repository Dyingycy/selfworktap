'use client';

import React, { useState, useMemo } from 'react';
import { NewsArticle, NewsSource } from '@/types';
import { Search, Flame, ExternalLink, Sparkles, Share2, Filter, Plus } from 'lucide-react';

interface TechNewsTabProps {
  articles: NewsArticle[];
  isLoading: boolean;
  selectedSource: NewsSource;
  onSelectSource: (source: NewsSource) => void;
  onOpenAskAi: (title: string, content: string) => void;
  onOpenShare: (title: string, summary: string, url: string, source: string) => void;
  onAddNewsToTodo?: (title: string) => void;
}

export const TechNewsTab: React.FC<TechNewsTabProps> = ({
  articles,
  isLoading,
  selectedSource,
  onSelectSource,
  onOpenAskAi,
  onOpenShare,
  onAddNewsToTodo,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const sourceTabs: { id: NewsSource; label: string }[] = [
    { id: 'all', label: '全部' },
    { id: '36kr', label: '快讯' },
    { id: 'sspai', label: '少数派' },
    { id: 'v2ex', label: 'V2EX' },
    { id: 'github', label: '掘金' },
  ];

  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return articles;
    const q = searchQuery.toLowerCase();
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.sourceName.toLowerCase().includes(q)
    );
  }, [articles, searchQuery]);

  const getSourceBadgeStyle = (source: NewsSource) => {
    switch (source) {
      case 'sspai':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case '36kr':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'v2ex':
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20';
      case 'github':
        return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20';
      default:
        return 'bg-zinc-800 text-zinc-300 border-white/10';
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* iOS Segmented Controls for Source Filter */}
      <div className="overflow-x-auto no-scrollbar -mx-4 px-4">
        <div className="flex items-center gap-1.5 p-1 bg-zinc-900/90 rounded-2xl border border-white/10 w-max min-w-full">
          {sourceTabs.map((tab) => {
            const isSelected = selectedSource === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectSource(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-all duration-150 active:scale-95 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索今日科技资讯关键词..."
          className="w-full bg-zinc-900/80 border border-white/10 rounded-2xl pl-10 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300"
          >
            清除
          </button>
        )}
      </div>

      {/* Articles Stream */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-4 space-y-2 animate-pulse">
              <div className="flex gap-2">
                <div className="w-14 h-4 bg-white/10 rounded shimmer" />
                <div className="w-10 h-4 bg-white/5 rounded shimmer" />
              </div>
              <div className="h-5 w-4/5 bg-white/10 rounded shimmer" />
              <div className="h-8 w-full bg-white/5 rounded shimmer" />
            </div>
          ))}
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center space-y-2">
          <Filter className="w-8 h-8 text-zinc-600 mx-auto" />
          <p className="text-sm text-zinc-400">未找到相关资讯</p>
          <p className="text-xs text-zinc-600">可尝试切换分类或重置搜索词</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              className="glass-card rounded-2xl p-4 transition-all duration-200 hover:border-white/20 active:scale-[0.99] space-y-2.5"
            >
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getSourceBadgeStyle(
                      article.source
                    )}`}
                  >
                    {article.sourceName}
                  </span>
                  <span className="text-[11px] text-zinc-500">{article.publishTime}</span>
                </div>

                {article.hotScore && (
                  <span className="flex items-center gap-0.5 text-[11px] font-semibold text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <Flame className="w-3 h-3 text-amber-400" />
                    <span>{article.hotScore}</span>
                  </span>
                )}
              </div>

              {/* Title */}
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-blue-400 transition-colors leading-snug">
                  {article.title}
                </h3>
              </a>

              {/* Summary */}
              {article.summary && (
                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                  {article.summary}
                </p>
              )}

              {/* Card Footer Actions */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenAskAi(article.title, article.summary)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 active:scale-95 transition-all text-xs font-medium"
                  >
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span>Gemini 解读</span>
                  </button>

                  <button
                    onClick={() =>
                      onOpenShare(
                        article.title,
                        article.summary,
                        article.url,
                        article.sourceName
                      )
                    }
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-white/10 active:scale-95 transition-all text-xs"
                    title="分享"
                  >
                    <Share2 className="w-3 h-3 text-zinc-400" />
                    <span>分享</span>
                  </button>

                  {onAddNewsToTodo && (
                    <button
                      onClick={() => onAddNewsToTodo(article.title)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 active:scale-95 transition-all text-xs"
                      title="存为今日待办"
                    >
                      <Plus className="w-3 h-3 text-emerald-400" />
                      <span>待办</span>
                    </button>
                  )}
                </div>

                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-0.5 text-zinc-500 hover:text-zinc-300 text-xs transition-colors"
                >
                  <span>阅读原文</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
