import { NextRequest, NextResponse } from 'next/server';
import { decomposeTaskWithAi } from '@/lib/services/geminiService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { taskTitle, apiKey } = body;

    const authHeader = req.headers.get('authorization');
    const headerKey = authHeader?.replace('Bearer ', '');
    const effectiveKey = apiKey || headerKey;

    if (!taskTitle) {
      return NextResponse.json(
        { success: false, error: '缺少任务标题' },
        { status: 400 }
      );
    }

    const subtasks = await decomposeTaskWithAi(taskTitle, effectiveKey);
    return NextResponse.json({
      success: true,
      data: subtasks,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'AI 任务拆解失败' },
      { status: 500 }
    );
  }
}
