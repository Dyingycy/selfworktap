import { WeiboHotItem } from '@/types';

interface WeiboCache {
  data: WeiboHotItem[];
  timestamp: number;
}

let weiboCache: WeiboCache | null = null;
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes cache

const TECH_KEYWORDS = [
  'ai', '大模型', '苹果', 'iphone', 'ios', '华为', '芯片', '鸿蒙', '算力',
  '机器人', '科技', '数码', '小米', '发布会', '手机', '显卡', '英伟达', '特斯拉',
  '智驾', '自动驾驶', '新能源', 'deepseek', 'openai', 'gemini', 'chatgpt', '无人机', '航天'
];

export async function fetchWeiboHot(): Promise<WeiboHotItem[]> {
  if (weiboCache && Date.now() - weiboCache.timestamp < CACHE_TTL_MS) {
    return weiboCache.data;
  }

  try {
    const res = await fetch('https://weibo.com/ajax/side/hotSearch', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://weibo.com/',
        'Accept': 'application/json, text/plain, */*',
      },
      next: { revalidate: 180 },
    });

    if (!res.ok) {
      throw new Error(`Weibo API responded with status ${res.status}`);
    }

    const json = await res.json();
    const realtime = json.data?.realtime || [];

    let rankCounter = 1;
    const items: WeiboHotItem[] = [];

    for (const item of realtime) {
      // Skip advertisement items with flag === 1 or is_ad
      if (item.is_ad) continue;

      const word = item.word || item.note || '';
      if (!word) continue;

      const lower = word.toLowerCase();
      const isTech = TECH_KEYWORDS.some((k) => lower.includes(k));

      items.push({
        position: item.rank !== undefined && item.rank > 0 ? item.rank : rankCounter++,
        word,
        hotValue: item.num || 0,
        label: item.label_name || undefined,
        category: item.category || '综合热搜',
        url: `https://s.weibo.com/weibo?q=${encodeURIComponent(word)}`,
        rawNote: item.note,
        isTech,
      });

      if (items.length >= 50) break;
    }

    weiboCache = {
      data: items,
      timestamp: Date.now(),
    };

    return items;
  } catch (err) {
    console.error('Failed to fetch Weibo hot search:', err);
    if (weiboCache?.data && weiboCache.data.length > 0) {
      return weiboCache.data;
    }
    return getFallbackWeibo();
  }
}

function getFallbackWeibo(): WeiboHotItem[] {
  return [
    {
      position: 1,
      word: '最新科技创新与人工智能前沿进展',
      hotValue: 1850000,
      label: '热',
      category: '科技数码',
      url: 'https://s.weibo.com',
      isTech: true,
    },
    {
      position: 2,
      word: '国产大模型生态突破与软硬件适配',
      hotValue: 1420000,
      label: '新',
      category: '科技数码',
      url: 'https://s.weibo.com',
      isTech: true,
    },
    {
      position: 3,
      word: '主流旗舰手机影像与芯片架构发布',
      hotValue: 980000,
      label: '荐',
      category: '数码硬件',
      url: 'https://s.weibo.com',
      isTech: true,
    },
  ];
}
