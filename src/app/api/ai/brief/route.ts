import { NextRequest, NextResponse } from 'next/server';
import { generateDailyBriefing } from '@/lib/services/geminiService';
import { getAllNews } from '@/lib/services/newsService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { force, apiKey } = body;

    const articles = await getAllNews('all');
    const briefing = await generateDailyBriefing(articles, apiKey, Boolean(force));

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
