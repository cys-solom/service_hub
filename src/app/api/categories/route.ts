import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
        });
        return NextResponse.json(categories, {
            headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
        });
    } catch (err) {
        console.error('Categories API error:', err);
        return NextResponse.json([], { status: 200 }); // Always return array!
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

        return NextResponse.json(category);
    } catch {
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}
