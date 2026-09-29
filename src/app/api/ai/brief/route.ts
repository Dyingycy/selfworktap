import { NextRequest, NextResponse } from 'next/server';
import { generateDailyBriefing } from '@/lib/services/geminiService';
import { getAllNews } from '@/lib/services/newsService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { force, apiKey } = body;

    // Fetch top domestic hot topics from Weibo, Bilibili, Douyin, and domestic tech news
    const [weiboItems, bilibiliItems, douyinItems, techArticles] = await Promise.all([
      import('@/lib/services/weiboService').then((m) => m.fetchWeiboHot().catch(() => [])),
      import('@/lib/services/bilibiliService').then((m) => m.fetchBilibiliPopular().catch(() => [])),
      import('@/lib/services/douyinService').then((m) => m.fetchDouyinHot().catch(() => [])),
      getAllNews('all').catch(() => []),
    ]);

    const combinedArticles = [
      ...weiboItems.slice(0, 5).map((w, idx) => ({
        id: `wb-${idx}`,
        title: w.word,
        summary: `微博实时热搜第${w.position}位，热度${(w.hotValue / 10000).toFixed(1)}万，分类：${w.category}`,
        url: w.url,
        source: 'weibo' as const,
        sourceName: '微博热搜',
        publishTime: '刚刚',
      })),
      ...bilibiliItems.slice(0, 5).map((b, idx) => ({
        id: `bl-${idx}`,
        title: b.title,
        summary: `B站热门UP主【${b.ownerName}】热门推荐，播放量${((b.viewCount || 0) / 10000).toFixed(1)}万`,
        url: b.url,
        source: 'bilibili' as const,
        sourceName: 'B站热门',
        publishTime: '今日',
      })),
      ...douyinItems.slice(0, 5).map((d, idx) => ({
        id: `dy-${idx}`,
        title: d.word,
        summary: `抖音全网热度${(d.hotValue / 10000).toFixed(0)}万，标签：${d.categoryTag}`,
        url: d.url,
        source: 'douyin' as const,
        sourceName: '抖音热搜',
        publishTime: '今日',
      })),
      ...techArticles.slice(0, 5),
    ];

    const briefing = await generateDailyBriefing(combinedArticles, apiKey, Boolean(force));

    return NextResponse.json({
      success: true,
      data: briefing,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate briefing' },
      { status: 500 }
    );
  }
}
