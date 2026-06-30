import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cacheGet, cacheSet } from '@/lib/api-cache';

export const dynamic = 'force-dynamic';

const CACHE_KEY = 'bundles-active';
const TTL = 120_000; // 2 minutes

export async function GET() {
    try {
        const cached = cacheGet<unknown[]>(CACHE_KEY);
        if (cached) {
            return NextResponse.json(cached, {
                headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
            });
        }

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

        cacheSet(CACHE_KEY, parsed, TTL);

        return NextResponse.json(parsed, {
            headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
        });
    } catch (err) {
        console.error('Bundles API error:', err);
        return NextResponse.json([], { status: 200 });
    }
}
