import { NextResponse } from 'next/server';
import { fetchDouyinHot } from '@/lib/services/douyinService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const list = await fetchDouyinHot();
    return NextResponse.json({
      success: true,
      data: list,
      count: list.length,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch Douyin hot' },
      { status: 500 }
    );
  }
}
