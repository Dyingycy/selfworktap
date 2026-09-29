import { NextResponse } from 'next/server';
import { fetchWeiboHot } from '@/lib/services/weiboService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await fetchWeiboHot();
    return NextResponse.json({
      success: true,
      data: items,
      count: items.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch Weibo hot' },
      { status: 500 }
    );
  }
}
