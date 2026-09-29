'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { BottomTabBar } from '@/components/BottomTabBar';
import { HomeWorkbenchTab } from '@/components/HomeWorkbenchTab';
import { FitnessTab } from '@/components/FitnessTab';
import { RadarHubTab } from '@/components/RadarHubTab';
import { AiChatTab } from '@/components/AiChatTab';
import { SettingsTab } from '@/components/SettingsTab';
import { AskAiModal } from '@/components/AskAiModal';
import { ShareModal } from '@/components/ShareModal';
import { NewsArticle, NewsSource, DouyinHotItem, DailyBriefing, TodoItem } from '@/types';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'workbench' | 'fitness' | 'radar' | 'aichat' | 'settings'>('workbench');
  const [selectedSource, setSelectedSource] = useState<NewsSource>('all');

  // Workbench Data
  const [todos, setTodos] = useState<TodoItem[]>([]);

  // Radar Data states
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [douyinItems, setDouyinItems] = useState<DouyinHotItem[]>([]);
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);

  // Loading states
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [isLoadingDouyin, setIsLoadingDouyin] = useState(false);
  const [isLoadingBrief, setIsLoadingBrief] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // 1. Load cached data from localStorage on first mount
  useEffect(() => {
    try {
      const cachedTodos = localStorage.getItem('techradar_todos');
      if (cachedTodos) setTodos(JSON.parse(cachedTodos));

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

  // Convert news article to todo
  const handleAddNewsToTodo = (newsTitle: string) => {
    const newItem: TodoItem = {
      id: `todo-${Date.now()}`,
      title: `研读资讯: ${newsTitle}`,
      completed: false,
      priority: 'medium',
      createdAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      sourceNewsTitle: newsTitle,
    };
    const updated = [newItem, ...todos];
    setTodos(updated);
    localStorage.setItem('techradar_todos', JSON.stringify(updated));
    showToast('🎉 已成功将该热点加入【今日专注待办】！');
  };

  // Top header refresh button
  const handleGlobalRefresh = async () => {
    setIsRefreshing(true);
    if (activeTab === 'workbench') {
      await Promise.all([fetchBriefing(false), fetchNews('all')]);
    } else if (activeTab === 'radar') {
      await Promise.all([fetchBriefing(true), fetchNews(selectedSource), fetchDouyin()]);
    }
    setIsRefreshing(false);
  };

  // Clear Cache
  const handleClearCache = () => {
    localStorage.removeItem('techradar_cache_news');
    localStorage.removeItem('techradar_cache_douyin');
    localStorage.removeItem('techradar_cache_brief');
    showToast('本地快照已清除，正在重新拉取最新数据...');
    fetchNews(selectedSource);
    fetchDouyin();
    fetchBriefing(true);
  };

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col font-sans pb-24">
      {/* Top Ambient Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-72 bg-gradient-to-b from-blue-900/15 via-purple-900/10 to-transparent pointer-events-none -z-10" />

      {/* iOS Header */}
      <Header
        activeTab={activeTab}
        isRefreshing={isRefreshing || isLoadingNews || isLoadingDouyin || isLoadingBrief}
        onRefresh={handleGlobalRefresh}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-zinc-900/95 border border-emerald-500/40 text-emerald-300 text-xs font-medium shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
          {toastMessage}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 pt-3">
        {/* Tab 1: 🏠 工作台 (Workbench) */}
        {activeTab === 'workbench' && (
          <HomeWorkbenchTab
            briefing={briefing}
            onNavigateToTab={(tab) => setActiveTab(tab as any)}
            todos={todos}
            onTodosChange={setTodos}
          />
        )}

        {/* Tab 2: 🏋️ 铁馆打卡 (Fitness Workout Center) */}
        {activeTab === 'fitness' && <FitnessTab />}

        {/* Tab 2: 📰 情报雷达 (Radar: 早报/热榜/抖音) */}
        {activeTab === 'radar' && (
          <RadarHubTab
            briefing={briefing}
            articles={articles}
            douyinItems={douyinItems}
            isLoadingBrief={isLoadingBrief && !briefing}
            isLoadingNews={isLoadingNews && articles.length === 0}
            isLoadingDouyin={isLoadingDouyin && douyinItems.length === 0}
            selectedSource={selectedSource}
            onSelectSource={handleSelectSource}
            onRefreshBrief={(force) => fetchBriefing(force)}
            onOpenAskAi={(title, content) =>
              setAskAiState({ isOpen: true, title, content })
            }
            onOpenShare={(title, summary, url, source) =>
              setShareState({ isOpen: true, title, summary, url, source })
            }
            onAddNewsToTodo={handleAddNewsToTodo}
          />
        )}

        {/* Tab 3: 🤖 AI 智囊 (Gemini Copilot) */}
        {activeTab === 'aichat' && <AiChatTab />}

        {/* Tab 4: ⚙️ 设置 (Settings) */}
        {activeTab === 'settings' && (
          <SettingsTab onClearCache={handleClearCache} />
        )}
      </main>

      {/* Floating Bottom Navigation Bar */}
      <BottomTabBar activeTab={activeTab} onChangeTab={(tab) => setActiveTab(tab as any)} />

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
