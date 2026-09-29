'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { BottomTabBar } from '@/components/BottomTabBar';
import { DailyBriefTab } from '@/components/DailyBriefTab';
import { TechNewsTab } from '@/components/TechNewsTab';
import { DouyinTab } from '@/components/DouyinTab';
import { SettingsTab } from '@/components/SettingsTab';
import { AskAiModal } from '@/components/AskAiModal';
import { ShareModal } from '@/components/ShareModal';
import { NewsArticle, NewsSource, DouyinHotItem, DailyBriefing } from '@/types';

export default function Home() {
  const [activeTab, setActiveTab] = useState('brief');
  const [selectedSource, setSelectedSource] = useState<NewsSource>('all');

  // Data states
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [douyinItems, setDouyinItems] = useState<DouyinHotItem[]>([]);
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);

  // Loading states
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [isLoadingDouyin, setIsLoadingDouyin] = useState(false);
  const [isLoadingBrief, setIsLoadingBrief] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals
  const [askAiState, setAskAiState] = useState<{
    isOpen: boolean;
    title: string;
    content: string;
  }>({ isOpen: false, title: '', content: '' });

  const [shareState, setShareState] = useState<{
    isOpen: boolean;
    title: string;
    summary: string;
    url: string;
    source: string;
  }>({ isOpen: false, title: '', summary: '', url: '', source: '' });

  // 1. Load cached data from localStorage on first mount for instant 0ms startup
  useEffect(() => {
    try {
      const cachedNews = localStorage.getItem('techradar_cache_news');
      if (cachedNews) setArticles(JSON.parse(cachedNews));

      const cachedDY = localStorage.getItem('techradar_cache_douyin');
      if (cachedDY) setDouyinItems(JSON.parse(cachedDY));

      const cachedBF = localStorage.getItem('techradar_cache_brief');
      if (cachedBF) setBriefing(JSON.parse(cachedBF));
    } catch (e) {
      console.error('Failed to read local cache', e);
    }
  }, []);

  // Fetch News
  const fetchNews = useCallback(async (source: NewsSource = selectedSource) => {
    setIsLoadingNews(true);
    try {
      const res = await fetch(`/api/news?source=${source}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setArticles(json.data);
        if (source === 'all') {
          localStorage.setItem('techradar_cache_news', JSON.stringify(json.data));
        }
      }
    } catch (e) {
      console.error('Failed to fetch news', e);
    } finally {
      setIsLoadingNews(false);
    }
  }, [selectedSource]);

  // Fetch Douyin
  const fetchDouyin = useCallback(async () => {
    setIsLoadingDouyin(true);
    try {
      const res = await fetch('/api/douyin');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setDouyinItems(json.data);
        localStorage.setItem('techradar_cache_douyin', JSON.stringify(json.data));
      }
    } catch (e) {
      console.error('Failed to fetch Douyin', e);
    } finally {
      setIsLoadingDouyin(false);
    }
  }, []);

  // Fetch Daily Briefing
  const fetchBriefing = useCallback(async (force: boolean = false) => {
    setIsLoadingBrief(true);
    try {
      const apiKey = typeof window !== 'undefined' ? localStorage.getItem('techradar_gemini_key') || '' : '';
      const res = await fetch('/api/ai/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force, apiKey }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setBriefing(json.data);
        localStorage.setItem('techradar_cache_brief', JSON.stringify(json.data));
      }
    } catch (e) {
      console.error('Failed to fetch briefing', e);
    } finally {
      setIsLoadingBrief(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchNews('all');
    fetchDouyin();
    fetchBriefing(false);
  }, [fetchNews, fetchDouyin, fetchBriefing]);

  // Handle source switch
  const handleSelectSource = (src: NewsSource) => {
    setSelectedSource(src);
    fetchNews(src);
  };

  // Top header refresh button
  const handleGlobalRefresh = async () => {
    setIsRefreshing(true);
    if (activeTab === 'brief') {
      await fetchBriefing(true);
    } else if (activeTab === 'news') {
      await fetchNews(selectedSource);
    } else if (activeTab === 'douyin') {
      await fetchDouyin();
    }
    setIsRefreshing(false);
  };

  // Clear Cache
  const handleClearCache = () => {
    localStorage.removeItem('techradar_cache_news');
    localStorage.removeItem('techradar_cache_douyin');
    localStorage.removeItem('techradar_cache_brief');
    alert('缓存已清除，正在重新拉取最新数据...');
    fetchNews(selectedSource);
    fetchDouyin();
    fetchBriefing(true);
  };

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col font-sans pb-24">
      {/* Top Background Ambient Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-64 bg-gradient-to-b from-blue-900/10 via-purple-900/5 to-transparent pointer-events-none -z-10" />

      {/* iOS Header */}
      <Header
        activeTab={activeTab}
        isRefreshing={isRefreshing || isLoadingNews || isLoadingDouyin || isLoadingBrief}
        onRefresh={handleGlobalRefresh}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 pt-3">
        {activeTab === 'brief' && (
          <DailyBriefTab
            briefing={briefing}
            isLoading={isLoadingBrief && !briefing}
            onRefresh={(force) => fetchBriefing(force)}
            onOpenAskAi={(title, content) =>
              setAskAiState({ isOpen: true, title, content })
            }
          />
        )}

        {activeTab === 'news' && (
          <TechNewsTab
            articles={articles}
            isLoading={isLoadingNews && articles.length === 0}
            selectedSource={selectedSource}
            onSelectSource={handleSelectSource}
            onOpenAskAi={(title, content) =>
              setAskAiState({ isOpen: true, title, content })
            }
            onOpenShare={(title, summary, url, source) =>
              setShareState({ isOpen: true, title, summary, url, source })
            }
          />
        )}

        {activeTab === 'douyin' && (
          <DouyinTab
            items={douyinItems}
            isLoading={isLoadingDouyin && douyinItems.length === 0}
            onOpenAskAi={(title, content) =>
              setAskAiState({ isOpen: true, title, content })
            }
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab onClearCache={handleClearCache} />
        )}
      </main>

      {/* Floating iOS Bottom Tab Bar */}
      <BottomTabBar activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Modals */}
      <AskAiModal
        isOpen={askAiState.isOpen}
        title={askAiState.title}
        content={askAiState.content}
        onClose={() => setAskAiState({ isOpen: false, title: '', content: '' })}
      />

      <ShareModal
        isOpen={shareState.isOpen}
        title={shareState.title}
        summary={shareState.summary}
        url={shareState.url}
        source={shareState.source}
        onClose={() =>
          setShareState({ isOpen: false, title: '', summary: '', url: '', source: '' })
        }
      />
    </div>
  );
}
