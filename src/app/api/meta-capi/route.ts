import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getClientIp, checkRateLimit } from '@/lib/rate-limit';
import { sendCapiEvent } from '@/lib/meta-capi';

const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60 * 1000; // 1 minute

const ALLOWED_EVENTS = new Set([
  'PageView', 'ViewContent', 'AddToCart', 'InitiateCheckout', 'Lead', 'Purchase', 'Search',
]);

// ── POST forward a client-side pixel event to Meta's Conversions API (server-side) ──
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(ip, { limit: RATE_LIMIT, windowMs: RATE_WINDOW_MS, keyPrefix: 'meta-capi' });
    if (!rl.allowed) {
      return NextResponse.json({ ok: false }, { status: 429 });
    }

    if (!process.env.META_CAPI_ACCESS_TOKEN) {
      // Not configured yet — silently skip, don't error out the client.
      return NextResponse.json({ ok: false, skipped: true });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ ok: false, error: 'Invalid body' }, { status: 400 });
    }

    const eventName = typeof body.eventName === 'string' ? body.eventName : '';
    const eventId   = typeof body.eventId   === 'string' ? body.eventId   : '';
    const url       = typeof body.url       === 'string' ? body.url       : '';

    if (!ALLOWED_EVENTS.has(eventName) || !eventId) {
      return NextResponse.json({ ok: false, error: 'Invalid event' }, { status: 400 });
    }

    const settings = await prisma.settings.findFirst();
    let pixelId = '';
    if (settings) {
      try { pixelId = JSON.parse(settings.contentEn || '{}').metaPixelId || ''; } catch { /* ignore */ }
    }
    if (!pixelId) {
      return NextResponse.json({ ok: false, skipped: true });
    }

    const customData: Record<string, unknown> =
      (body.customData && typeof body.customData === 'object') ? body.customData : {};
    const rawUserData: Record<string, unknown> =
      (body.userData && typeof body.userData === 'object') ? body.userData : {};

    await sendCapiEvent(pixelId, {
      eventName,
      eventId,
      eventSourceUrl: url,
      customData,
      userData: {
        email:     typeof rawUserData.email     === 'string' ? rawUserData.email     : undefined,
        phone:     typeof rawUserData.phone     === 'string' ? rawUserData.phone     : undefined,
        firstName: typeof rawUserData.firstName === 'string' ? rawUserData.firstName : undefined,
        lastName:  typeof rawUserData.lastName  === 'string' ? rawUserData.lastName  : undefined,
        clientIp:  ip !== 'unknown' ? ip : undefined,
        userAgent: request.headers.get('user-agent') || undefined,
        fbp: request.cookies.get('_fbp')?.value,
        fbc: request.cookies.get('_fbc')?.value,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/meta-capi] error', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
