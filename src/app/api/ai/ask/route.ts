import { NextRequest, NextResponse } from 'next/server';
import { askGemini } from '@/lib/services/geminiService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content, question, apiKey } = body;

    if (!title || !question) {
      return NextResponse.json(
        { success: false, error: 'Title and question are required' },
        { status: 400 }
      );
    }

    const result = await askGemini(title, content || '', question, apiKey);
    if (result.answer.startsWith('分析时遇到问题:')) {
      return NextResponse.json(
        { success: false, error: result.answer, data: result },
        { status: 400 }
      );
    }
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to answer question' },
      { status: 500 }
    );
  }
}
