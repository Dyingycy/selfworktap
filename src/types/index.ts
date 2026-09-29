export type NewsSource = 'all' | '36kr' | 'sspai' | 'v2ex' | 'github' | 'hackernews';

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  aiSummary?: string;
  url: string;
  source: NewsSource;
  sourceName: string;
  publishTime: string;
  hotScore?: number;
  tags?: string[];
}

export interface DouyinHotItem {
  position: number;
  word: string;
  hotValue: number;
  label?: string; // '新' | '热' | '爆'
  isTech: boolean;
  categoryTag: string; // 'AI前沿' | '数码新品' | '数智出行' | '全网热搜'
  url: string;
  videoCount?: number;
  aiTakeaway?: string;
}

export interface DailyBriefHighlight {
  title: string;
  takeaway: string;
  impact: string;
  source?: string;
}

export interface DailyBriefing {
  date: string;
  title: string;
  overview: string;
  highlights: DailyBriefHighlight[];
  techTrends: string[];
  quoteOfTheDay: string;
  generatedAt: string;
}

export interface AskAiRequest {
  title: string;
  content: string;
  sourceName?: string;
  question: string;
  apiKey?: string;
}

export interface AskAiResponse {
  answer: string;
  keyPoints?: string[];
  takeaway?: string;
}

// === Personal Workbench Extensions ===

export type TodoPriority = 'high' | 'medium' | 'low';

export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  priority: TodoPriority;
  createdAt: string;
  sourceNewsTitle?: string;
}

export interface QuickLink {
  id: string;
  title: string;
  url: string;
  icon: string; // Emoji or label
  color?: string;
}

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
