import { NextRequest, NextResponse } from 'next/server';
import { getAllNews } from '@/lib/services/newsService';
import { NewsSource } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const source = (searchParams.get('source') as NewsSource) || 'all';

    const articles = await getAllNews(source);
    return NextResponse.json({
      success: true,
      data: articles,
      count: articles.length,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
