import { NextResponse } from 'next/server';
import { fetchBilibiliPopular } from '@/lib/services/bilibiliService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await fetchBilibiliPopular();
    return NextResponse.json({
      success: true,
      data: items,
      count: items.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch Bilibili popular' },
      { status: 500 }
    );
  }
}
