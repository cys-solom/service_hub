import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const auth = authenticateRequest(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { productId, title, duration, price, isActive } = body;

        const variant = await prisma.productVariant.create({
            data: {
                productId,
                title,
                duration,
                price: parseFloat(price),
                isActive: isActive ?? true,
            },
        });

        return NextResponse.json(variant);
    } catch {
        return NextResponse.json({ error: 'Failed to create variant' }, { status: 500 });
    }
}
