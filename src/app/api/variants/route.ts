import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { cacheInvalidate } from '@/lib/api-cache';

export async function POST(request: NextRequest) {
    try {
        const auth = authenticateRequest(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { productId, title, duration, price, warrantyDays, warrantyType, warrantyDuration, isActive } = body;

        const variant = await prisma.productVariant.create({
            data: {
                productId,
                title,
                duration,
                price: parseFloat(price),
                warrantyDays: parseInt(warrantyDays) || 0,
                warrantyType: warrantyType || 'none',
                warrantyDuration: parseInt(warrantyDuration) || 0,
                isActive: isActive ?? true,
            },
        });

        cacheInvalidate('products-active');
        return NextResponse.json(variant);
    } catch {
        return NextResponse.json({ error: 'Failed to create variant' }, { status: 500 });
    }
}
