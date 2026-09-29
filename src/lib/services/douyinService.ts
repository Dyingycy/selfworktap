import { DouyinHotItem } from '@/types';

interface DouyinCache {
  data: DouyinHotItem[];
  timestamp: number;
}

let douyinCache: DouyinCache | null = null;
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes cache for hot trending

const TECH_KEYWORDS = [
  'ai', '大模型', '人工智能', '苹果', 'iphone', 'ios', '华为', '芯片', '鸿蒙', '算力',
  '机器人', '科技', '数码', '小米', '发布会', '手机', '电脑', '显卡', '英伟达', '特斯拉',
  '智驾', '自动驾驶', '新能源', '开源', '算法', '无人机', '航天', '火箭', '量子',
  'vision pro', 'openai', 'deepseek', 'gemini', 'chatgpt', '头显', '游戏掌机'
];

export async function fetchDouyinHot(): Promise<DouyinHotItem[]> {
  if (douyinCache && Date.now() - douyinCache.timestamp < CACHE_TTL_MS) {
    return douyinCache.data;
  }

  try {
    const res = await fetch('https://www.douyin.com/aweme/v1/web/hot/search/list/', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.douyin.com/',
        'Accept': 'application/json, text/plain, */*',
      },
      next: { revalidate: 180 },
    });

    if (!res.ok) {
      throw new Error(`Douyin API responded with status ${res.status}`);
    }

    const json = await res.json();
    const rawList = json.data?.word_list || [];

    const items: DouyinHotItem[] = rawList.slice(0, 50).map((item: any, idx: number) => {
      const word = item.word || '';
      const lowerWord = word.toLowerCase();
      
      const isTech = TECH_KEYWORDS.some(k => lowerWord.includes(k));
      let categoryTag = '全网热搜';
      if (lowerWord.includes('ai') || lowerWord.includes('大模型') || lowerWord.includes('deepseek') || lowerWord.includes('openai')) {
        categoryTag = 'AI前沿';
      } else if (lowerWord.includes('苹果') || lowerWord.includes('华为') || lowerWord.includes('小米') || lowerWord.includes('手机')) {
        categoryTag = '数码新品';
      } else if (lowerWord.includes('智驾') || lowerWord.includes('特斯拉') || lowerWord.includes('新能源')) {
        categoryTag = '数智出行';
      } else if (isTech) {
        categoryTag = '硬核科技';
      }

      let label: string | undefined = undefined;
      if (item.label === 1) label = '新';
      else if (item.label === 2) label = '热';
      else if (item.label === 3) label = '爆';

      return {
        position: item.position || idx + 1,
        word,
        hotValue: item.hot_value || 0,
        label,
        isTech,
        categoryTag,
        url: `https://www.douyin.com/search/${encodeURIComponent(word)}`,
        videoCount: item.video_count,
      };
    });

    douyinCache = {
      data: items,
      timestamp: Date.now(),
    };

    return items;
  } catch (err) {
    console.error('Failed to fetch Douyin hot:', err);
    if (douyinCache?.data && douyinCache.data.length > 0) {
      return douyinCache.data;
    }
    return getFallbackDouyin();
  }
}

function getFallbackDouyin(): DouyinHotItem[] {
  return [
    {
      position: 1,
      word: '最新科技创新与大模型突破',
      hotValue: 12500000,
      label: '爆',
      isTech: true,
      categoryTag: 'AI前沿',
      url: 'https://www.douyin.com',
      videoCount: 99,
    },
    {
      position: 2,
      word: '全新智能折叠旗舰上手体验',
      hotValue: 10400000,
      label: '热',
      isTech: true,
      categoryTag: '数码新品',
      url: 'https://www.douyin.com',
      videoCount: 65,
    },
    {
      position: 3,
      word: '国庆长假科技展与机器人实测',
      hotValue: 9800000,
      label: '新',
      isTech: true,
      categoryTag: '硬核科技',
      url: 'https://www.douyin.com',
      videoCount: 42,
    },
  ];
}
