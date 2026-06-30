import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { cacheGet, cacheSet, cacheInvalidate } from '@/lib/api-cache';

export const dynamic = 'force-dynamic';

const CACHE_KEY = 'categories-active';
const TTL = 120_000;

export async function GET() {
    try {
        const cached = cacheGet<unknown[]>(CACHE_KEY);
        if (cached) {
            return NextResponse.json(cached, {
                headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
            });
        }

        const categories = await prisma.category.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
            select: { id: true, name: true, slug: true, isActive: true },
        });

        cacheSet(CACHE_KEY, categories, TTL);

        return NextResponse.json(categories, {
            headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
        });
    } catch (err) {
        console.error('Categories API error:', err);
        return NextResponse.json([], { status: 200 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const auth = authenticateRequest(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, slug, isActive } = body;

        const category = await prisma.category.create({
            data: { name, slug, isActive: isActive ?? true },
        });

        cacheInvalidate(CACHE_KEY, 'products-active');
        return NextResponse.json(category);
    } catch {
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}
