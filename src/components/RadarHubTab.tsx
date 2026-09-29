'use client';

import React, { useState } from 'react';
import { DailyBriefing, NewsArticle, NewsSource, DouyinHotItem } from '@/types';
import { DailyBriefTab } from '@/components/DailyBriefTab';
import { TechNewsTab } from '@/components/TechNewsTab';
import { DouyinTab } from '@/components/DouyinTab';
import { Sparkles, Newspaper, Flame } from 'lucide-react';

interface RadarHubTabProps {
  briefing: DailyBriefing | null;
  articles: NewsArticle[];
  douyinItems: DouyinHotItem[];
  isLoadingBrief: boolean;
  isLoadingNews: boolean;
  isLoadingDouyin: boolean;
  selectedSource: NewsSource;
  onSelectSource: (source: NewsSource) => void;
  onRefreshBrief: (force?: boolean) => void;
  onOpenAskAi: (title: string, content: string) => void;
  onOpenShare: (title: string, summary: string, url: string, source: string) => void;
  onAddNewsToTodo?: (title: string) => void;
}

export const RadarHubTab: React.FC<RadarHubTabProps> = ({
  briefing,
  articles,
  douyinItems,
  isLoadingBrief,
  isLoadingNews,
  isLoadingDouyin,
  selectedSource,
  onSelectSource,
  onRefreshBrief,
  onOpenAskAi,
  onOpenShare,
  onAddNewsToTodo,
}) => {
  const [subTab, setSubTab] = useState<'brief' | 'news' | 'douyin'>('brief');

  const subTabs = [
    { id: 'brief', label: '今日早报', icon: Sparkles },
    { id: 'news', label: '科技热榜', icon: Newspaper },
    { id: 'douyin', label: '抖音热搜', icon: Flame },
  ];

  return (
    <div className="space-y-4">
      {/* iOS Segmented Sub-Navbar */}
      <div className="p-1 bg-zinc-900/90 rounded-2xl border border-white/10 flex items-center justify-around">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as any)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sub views */}
      {subTab === 'brief' && (
        <DailyBriefTab
          briefing={briefing}
          isLoading={isLoadingBrief && !briefing}
          onRefresh={onRefreshBrief}
          onOpenAskAi={onOpenAskAi}
        />
      )}

      {subTab === 'news' && (
        <TechNewsTab
          articles={articles}
          isLoading={isLoadingNews && articles.length === 0}
          selectedSource={selectedSource}
          onSelectSource={onSelectSource}
          onOpenAskAi={onOpenAskAi}
          onOpenShare={onOpenShare}
          onAddNewsToTodo={onAddNewsToTodo}
        />
      )}

      {subTab === 'douyin' && (
        <DouyinTab
          items={douyinItems}
          isLoading={isLoadingDouyin && douyinItems.length === 0}
          onOpenAskAi={onOpenAskAi}
        />
      )}
    </div>
  );
};
