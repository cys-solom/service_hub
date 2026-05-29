import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const bundles = await prisma.bundle.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });

    const parsed = bundles.map((b) => ({
      ...b,
      tools:      JSON.parse(b.tools as string),
      features:   JSON.parse(b.features as string),
      featuresAr: JSON.parse(b.featuresAr as string),
    }));

    return NextResponse.json(parsed, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch (err) {
    console.error('Bundles API error:', err);
    return NextResponse.json([], { status: 200 });
  }
}
