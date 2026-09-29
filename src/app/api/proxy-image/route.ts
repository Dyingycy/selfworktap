import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Image proxy route to bypass anti-hotlinking / referer checks (e.g. Bilibili hdslb.com)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    const parsed = new URL(imageUrl);
    const hostname = parsed.hostname.toLowerCase();

    // Whitelist image hostnames for security
    const isAllowed =
      hostname.endsWith('hdslb.com') ||
      hostname.endsWith('bilibili.com') ||
      hostname.endsWith('sinaimg.cn') ||
      hostname.endsWith('weibo.com') ||
      hostname.endsWith('snssdk.com');

    if (!isAllowed) {
      return new NextResponse('Hostname not allowed', { status: 403 });
    }

    const referer = hostname.endsWith('hdslb.com') || hostname.endsWith('bilibili.com')
      ? 'https://www.bilibili.com/'
      : hostname.endsWith('sinaimg.cn') || hostname.endsWith('weibo.com')
      ? 'https://weibo.com/'
      : '';

    const res = await fetch(imageUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        ...(referer ? { Referer: referer } : {}),
      },
    });

    if (!res.ok) {
      return new NextResponse(`Failed to fetch image: ${res.status}`, { status: res.status });
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error: any) {
    return new NextResponse(`Error proxying image: ${error?.message}`, { status: 500 });
  }
}
