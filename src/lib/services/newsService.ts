import Parser from 'rss-parser';
import { NewsArticle, NewsSource } from '@/types';

const parser = new Parser({
  timeout: 8000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Safari/604.1',
  },
});

interface CacheEntry {
  data: NewsArticle[];
  timestamp: number;
}

const cache: Record<string, CacheEntry> = {};
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

export async function fetchSspaiNews(): Promise<NewsArticle[]> {
  try {
    const feed = await parser.parseURL('https://sspai.com/feed');
    return (feed.items || []).slice(0, 15).map((item, idx) => ({
      id: `sspai-${item.guid || idx}`,
      title: item.title || '无标题',
      summary: cleanText(item.contentSnippet || item.summary || item.content || ''),
      url: item.link || 'https://sspai.com',
      source: 'sspai',
      sourceName: '少数派',
      publishTime: formatTime(item.pubDate || item.isoDate),
      hotScore: 92 - idx * 2,
      tags: ['数字生活', '少数派精选'],
    }));
  } catch (error) {
    console.error('Fetch SSPAI error:', error);
    return [];
  }
}

export async function fetchIthomeNews(): Promise<NewsArticle[]> {
  try {
    const feed = await parser.parseURL('https://www.ithome.com/rss/');
    return (feed.items || []).slice(0, 15).map((item, idx) => ({
      id: `ithome-${item.guid || idx}`,
      title: item.title || '无标题',
      summary: cleanText(item.contentSnippet || item.summary || item.content || ''),
      url: item.link || 'https://www.ithome.com',
      source: '36kr', // Map to general domestic tech
      sourceName: '科技快讯 (IT之家/36氪)',
      publishTime: formatTime(item.pubDate || item.isoDate),
      hotScore: 98 - idx * 2,
      tags: ['数码前沿', '产业快讯'],
    }));
  } catch (error) {
    console.error('Fetch ITHome error:', error);
    return [];
  }
}

export async function fetchV2exNews(): Promise<NewsArticle[]> {
  try {
    const res = await fetch('https://www.v2ex.com/api/topics/hot.json', {
      headers: { 'User-Agent': 'TechRadar-iOS-Client' },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const topics = await res.json();
    return (topics || []).slice(0, 15).map((item: any, idx: number) => ({
      id: `v2ex-${item.id}`,
      title: item.title || '无标题',
      summary: cleanText(item.content || item.content_rendered || ''),
      url: item.url || `https://www.v2ex.com/t/${item.id}`,
      source: 'v2ex',
      sourceName: 'V2EX 极客',
      publishTime: formatTime(item.created ? new Date(item.created * 1000).toISOString() : ''),
      hotScore: Math.min(99, 50 + (item.replies || 0) * 2),
      tags: [item.node?.title || '技术探讨', `${item.replies || 0} 回复`],
    }));
  } catch (error) {
    console.error('Fetch V2EX error:', error);
    return [];
  }
}

export async function fetchJuejinNews(): Promise<NewsArticle[]> {
  try {
    const res = await fetch('https://api.juejin.cn/recommend_api/v1/article/recommend_all_feed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_type: 2608, cursor: '0', id_type: 2, limit: 12, sort_type: 200 }),
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const list = data.data || [];
    return list.slice(0, 12).map((item: any, idx: number) => {
      const info = item.item_info?.article_info || {};
      return {
        id: `juejin-${info.article_id || idx}`,
        title: info.title || '无标题',
        summary: cleanText(info.brief_content || ''),
        url: `https://juejin.cn/post/${info.article_id}`,
        source: 'github', // Group in geek/developer
        sourceName: '掘金技术热榜',
        publishTime: formatTime(info.ctime ? new Date(Number(info.ctime) * 1000).toISOString() : ''),
        hotScore: 90 - idx * 2,
        tags: ['开发者生态', `${info.view_count || 1000} 阅读`],
      };
    });
  } catch (error) {
    console.error('Fetch Juejin error:', error);
    return [];
  }
}

export async function fetchHackerNews(): Promise<NewsArticle[]> {
  try {
    const topRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    if (!topRes.ok) return [];
    const topIds: number[] = (await topRes.json()).slice(0, 10);

    const items = await Promise.all(
      topIds.map(async (id, idx) => {
        try {
          const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
          if (!itemRes.ok) return null;
          const data = await itemRes.json();
          return {
            id: `hn-${data.id}`,
            title: data.title || 'Hacker News Item',
            summary: `Score: ${data.score || 0} | Author: ${data.by || 'anon'} | Comments: ${data.descendants || 0}`,
            url: data.url || `https://news.ycombinator.com/item?id=${data.id}`,
            source: 'hackernews' as NewsSource,
            sourceName: 'Hacker News',
            publishTime: formatTime(data.time ? new Date(data.time * 1000).toISOString() : ''),
            hotScore: Math.min(100, (data.score || 50)),
            tags: ['Global Geek', `${data.score || 0} pts`],
          };
        } catch {
          return null;
        }
      })
    );
    const result: NewsArticle[] = [];
    for (const it of items) {
      if (it) result.push(it);
    }
    return result;
  } catch (error) {
    console.error('Fetch Hacker News error:', error);
    return [];
  }
}

export async function getAllNews(sourceFilter: NewsSource = 'all'): Promise<NewsArticle[]> {
  const cacheKey = `news_${sourceFilter}`;
  const cached = cache[cacheKey];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  let articles: NewsArticle[] = [];

  if (sourceFilter === 'sspai') {
    articles = await fetchSspaiNews();
  } else if (sourceFilter === '36kr') {
    articles = await fetchIthomeNews();
  } else if (sourceFilter === 'v2ex') {
    articles = await fetchV2exNews();
  } else if (sourceFilter === 'github') {
    articles = await fetchJuejinNews();
  } else if (sourceFilter === 'hackernews') {
    articles = await fetchHackerNews();
  } else {
    // Fetch all in parallel
    const [sspai, ithome, v2ex, juejin, hn] = await Promise.all([
      fetchSspaiNews(),
      fetchIthomeNews(),
      fetchV2exNews(),
      fetchJuejinNews(),
      fetchHackerNews(),
    ]);

    // Interleave or sort by hotness
    articles = [...ithome, ...sspai, ...v2ex, ...juejin, ...hn].sort(
      (a, b) => (b.hotScore || 50) - (a.hotScore || 50)
    );
  }

  // Fallback seed if everything fails due to network outage
  if (articles.length === 0) {
    articles = getFallbackArticles();
  }

  cache[cacheKey] = {
    data: articles,
    timestamp: Date.now(),
  };

  return articles;
}

function cleanText(text: string): string {
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-zA-Z0-9#]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);
}

function formatTime(isoString?: string): string {
  if (!isoString) return '刚刚';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '刚刚';
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diffMin < 5) return '刚刚';
    if (diffMin < 60) return `${diffMin}分钟前`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}小时前`;
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  } catch {
    return '刚刚';
  }
}

function getFallbackArticles(): NewsArticle[] {
  return [
    {
      id: 'fallback-1',
      title: 'Google DeepMind 推出全新下一代通用智能代理与多模态架构',
      summary: '业内关于未来 AI 自主智能体工作流的前沿突破，全面打通桌面与移动端开发自动化。',
      url: 'https://deepmind.google',
      source: '36kr',
      sourceName: '科技快讯',
      publishTime: '10分钟前',
      hotScore: 99,
      tags: ['AI突破', '智能体'],
    },
    {
      id: 'fallback-2',
      title: '苹果计划在 iOS 18 系列中深度集成离线大模型与端侧交互算力',
      summary: '从 iPhone 芯片架构到软件生态的最新动向，隐私与端侧算力的全新权衡。',
      url: 'https://sspai.com',
      source: 'sspai',
      sourceName: '少数派',
      publishTime: '25分钟前',
      hotScore: 95,
      tags: ['Apple', '端侧AI'],
    },
  ];
}
