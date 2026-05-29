import { NextRequest, NextResponse } from 'next/server';

/**
 * /api/logo?domain=openai.com   — resolve brand logo via clearbit/icon.horse/google
 * /api/logo?url=https://...     — proxy a specific direct image URL
 *
 * Server-side proxy: avoids browser tracking-prevention blocks.
 * All responses cached for 7 days.
 */

export const runtime = 'nodejs';

const CACHE_SECONDS = 60 * 60 * 24 * 7; // 7 days

async function tryFetch(url: string): Promise<Response | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ServiceHub/1.0)' },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const ct = res.headers.get('content-type') || '';
      if (ct.startsWith('image/') || ct.includes('svg') || ct.includes('webp')) return res;
    }
  } catch { /* swallow */ }
  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const domain = searchParams.get('domain')?.toLowerCase().trim();
  const directUrl = searchParams.get('url');

  // ── Mode 1: direct URL proxy ──
  if (directUrl) {
    let parsed: URL;
    try { parsed = new URL(directUrl); } catch {
      return new NextResponse(null, { status: 400 });
    }
    if (parsed.protocol !== 'https:') return new NextResponse(null, { status: 400 });

    // Try the direct URL first
    const res = await tryFetch(directUrl);
    if (res) {
      const buffer = await res.arrayBuffer();
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': res.headers.get('content-type') || 'image/png',
          'Cache-Control': `public, max-age=${CACHE_SECONDS}, stale-while-revalidate=86400`,
        },
      });
    }

    // Direct URL failed (CDN blocked) — fall through to domain-based lookup
    // e.g. cdn.oaistatic.com → try clearbit for oaistatic.com & openai.com
    const hostname = parsed.hostname; // e.g. cdn.oaistatic.com
    const rootDomain = hostname.split('.').slice(-2).join('.'); // e.g. oaistatic.com
    const domainSources = [
      `https://logo.clearbit.com/${rootDomain}`,
      `https://icon.horse/icon/${rootDomain}`,
    ];
    for (const url of domainSources) {
      const fallback = await tryFetch(url);
      if (fallback) {
        const buffer = await fallback.arrayBuffer();
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': fallback.headers.get('content-type') || 'image/png',
            'Cache-Control': `public, max-age=${CACHE_SECONDS}, stale-while-revalidate=86400`,
          },
        });
      }
    }
    return new NextResponse(null, { status: 404 });
  }

  // ── Mode 2: domain → clearbit / icon.horse / google ──
  if (!domain || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
    return new NextResponse(null, { status: 400 });
  }

  const sources = [
    `https://logo.clearbit.com/${domain}`,
    `https://icon.horse/icon/${domain}`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=256`,
  ];

  for (const url of sources) {
    const res = await tryFetch(url);
    if (res) {
      const buffer = await res.arrayBuffer();
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': res.headers.get('content-type') || 'image/png',
          'Cache-Control': `public, max-age=${CACHE_SECONDS}, stale-while-revalidate=86400`,
          'X-Logo-Source': url,
        },
      });
    }
  }

  return new NextResponse(null, { status: 404 });
}
