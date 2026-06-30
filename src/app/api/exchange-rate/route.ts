/**
 * GET /api/exchange-rate
 * Returns current USD→EGP rate + admin EGP markup
 * Used by the storefront to show dual pricing
 */
import { NextResponse } from 'next/server';
import { getExchangeRate } from '@/lib/exchange-rate';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [rateData, settings] = await Promise.all([
      getExchangeRate(),
      prisma.settings.findFirst({ select: { egpMarkup: true } }),
    ]);

    return NextResponse.json({
      usdToEgp:  rateData.usdToEgp,
      egpMarkup: settings?.egpMarkup ?? 0,
      updatedAt: rateData.updatedAt,
      source:    rateData.source,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch {
    return NextResponse.json({ usdToEgp: 50.5, egpMarkup: 0, source: 'fallback' });
  }
}
