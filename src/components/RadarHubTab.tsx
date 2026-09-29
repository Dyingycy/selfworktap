'use client';

import React, { useState } from 'react';
import { DailyBriefing, WeiboHotItem, BilibiliHotItem, DouyinHotItem } from '@/types';
import { DailyBriefTab } from '@/components/DailyBriefTab';
import { WeiboTab } from '@/components/WeiboTab';
import { BilibiliTab } from '@/components/BilibiliTab';
import { DouyinTab } from '@/components/DouyinTab';
import { Sparkles, Flame, Tv, MessageSquare } from 'lucide-react';

interface RadarHubTabProps {
  briefing: DailyBriefing | null;
  weiboItems: WeiboHotItem[];
  bilibiliItems: BilibiliHotItem[];
  douyinItems: DouyinHotItem[];
  isLoadingBrief: boolean;
  isLoadingWeibo: boolean;
  isLoadingBilibili: boolean;
  isLoadingDouyin: boolean;
  onRefreshBrief: (force?: boolean) => void;
  onOpenAskAi: (title: string, content: string) => void;
  onOpenShare: (title: string, summary: string, url: string, source: string) => void;
  onAddNewsToTodo?: (title: string) => void;
}

export const RadarHubTab: React.FC<RadarHubTabProps> = ({
  briefing,
  weiboItems,
  bilibiliItems,
  douyinItems,
  isLoadingBrief,
  isLoadingWeibo,
  isLoadingBilibili,
  isLoadingDouyin,
  onRefreshBrief,
  onOpenAskAi,
  onOpenShare,
  onAddNewsToTodo,
}) => {
  const [subTab, setSubTab] = useState<'brief' | 'weibo' | 'bilibili' | 'douyin'>('brief');

  const subTabs = [
    { id: 'brief', label: 'AI 早报', icon: Sparkles, color: 'text-amber-400' },
    { id: 'weibo', label: '微博热搜', icon: MessageSquare, color: 'text-orange-400' },
    { id: 'bilibili', label: 'B站热门', icon: Tv, color: 'text-pink-400' },
    { id: 'douyin', label: '抖音热搜', icon: Flame, color: 'text-rose-400' },
  ];

  return (
    <div className="space-y-4">
      {/* Segmented Sub-Navbar for Mainstream Domestic Platforms */}
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
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.color}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sub view 1: AI 全网早报 */}
      {subTab === 'brief' && (
        <DailyBriefTab
          briefing={briefing}
          isLoading={isLoadingBrief && !briefing}
          onRefresh={onRefreshBrief}
          onOpenAskAi={onOpenAskAi}
        />
      )}

      {/* Sub view 2: 微博实时热搜 */}
      {subTab === 'weibo' && (
        <WeiboTab
          items={weiboItems}
          isLoading={isLoadingWeibo && weiboItems.length === 0}
          onOpenAskAi={onOpenAskAi}
          onAddNewsToTodo={onAddNewsToTodo}
        />
      )}

      {/* Sub view 3: B站全站热门 */}
      {subTab === 'bilibili' && (
        <BilibiliTab
          items={bilibiliItems}
          isLoading={isLoadingBilibili && bilibiliItems.length === 0}
          onOpenAskAi={onOpenAskAi}
          onAddNewsToTodo={onAddNewsToTodo}
        />
      )}

      {/* Sub view 4: 抖音实时热搜 */}
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
