import { BilibiliHotItem } from '@/types';

interface BilibiliCache {
  data: BilibiliHotItem[];
  timestamp: number;
}

let bilibiliCache: BilibiliCache | null = null;
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes cache

const TECH_KEYWORDS = [
  'ai', '大模型', '苹果', 'iphone', 'ios', '华为', '芯片', '鸿蒙', '算力',
  '机器人', '科技', '数码', '小米', '发布会', '手机', '显卡', '英伟达', '特斯拉',
  '智驾', '自动驾驶', '新能源', 'deepseek', 'openai', 'gemini', 'chatgpt', '评测', '显卡', '装机'
];

export async function fetchBilibiliPopular(): Promise<BilibiliHotItem[]> {
  if (bilibiliCache && Date.now() - bilibiliCache.timestamp < CACHE_TTL_MS) {
    return bilibiliCache.data;
  }

  try {
    const res = await fetch('https://api.bilibili.com/x/web-interface/popular?ps=30&pn=1', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://www.bilibili.com/',
        'Accept': 'application/json, text/plain, */*',
      },
      next: { revalidate: 180 },
    });

    if (!res.ok) {
      throw new Error(`Bilibili API responded with status ${res.status}`);
    }

    const json = await res.json();
    const list = json.data?.list || [];

    const items: BilibiliHotItem[] = list.map((item: any, idx: number) => {
      const title = item.title || '';
      const lower = title.toLowerCase();
      const isTech = TECH_KEYWORDS.some((k) => lower.includes(k));

      return {
        position: idx + 1,
        bvid: item.bvid,
        title,
        desc: item.desc,
        pic: item.pic,
        ownerName: item.owner?.name || 'B站UP主',
        viewCount: item.stat?.view || 0,
        likeCount: item.stat?.like || 0,
        rcmdReason: item.rcmd_reason?.content || undefined,
        url: item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : (item.short_link_v2 || 'https://www.bilibili.com'),
        isTech,
      };
    });

    bilibiliCache = {
      data: items,
      timestamp: Date.now(),
    };

    return items;
  } catch (err) {
    console.error('Failed to fetch Bilibili popular:', err);
    if (bilibiliCache?.data && bilibiliCache.data.length > 0) {
      return bilibiliCache.data;
    }
    return getFallbackBilibili();
  }
}

function getFallbackBilibili(): BilibiliHotItem[] {
  return [
    {
      position: 1,
      bvid: 'BV1demo1',
      title: '深度实测：最新开源大模型本地部署与全场景应用评测',
      ownerName: '极客科技评测',
      viewCount: 1580000,
      likeCount: 95000,
      rcmdReason: '百万播放',
      url: 'https://www.bilibili.com',
      isTech: true,
    },
    {
      position: 2,
      bvid: 'BV1demo2',
      title: '2026 最新旗舰芯片与手机架构对比深度解析',
      ownerName: '硬核数码拆解',
      viewCount: 1220000,
      likeCount: 82000,
      rcmdReason: '热门推荐',
      url: 'https://www.bilibili.com',
      isTech: true,
    },
    {
      position: 3,
      bvid: 'BV1demo3',
      title: '从零自制一台微型四足机器人【硬核手搓项目】',
      ownerName: '电子工程工坊',
      viewCount: 980000,
      likeCount: 76000,
      rcmdReason: '入站必看',
      url: 'https://www.bilibili.com',
      isTech: true,
    },
  ];
}
