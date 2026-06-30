import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { cacheInvalidate } from '@/lib/api-cache';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = authenticateRequest(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        // Only allow updating specific fields
        const allowedUpdates: Record<string, unknown> = {};
        if (body.title !== undefined) allowedUpdates.title = body.title;
        if (body.duration !== undefined) allowedUpdates.duration = body.duration;
        if (body.price !== undefined) allowedUpdates.price = parseFloat(body.price);
        if (body.warrantyDays !== undefined) allowedUpdates.warrantyDays = parseInt(body.warrantyDays) || 0;
        if (body.isActive !== undefined) allowedUpdates.isActive = body.isActive;
        if (body.outOfStock !== undefined) allowedUpdates.outOfStock = body.outOfStock;

        const variant = await prisma.productVariant.update({
            where: { id },
            data: allowedUpdates,
        });

        cacheInvalidate('products-active');
        return NextResponse.json(variant);
    } catch {
        return NextResponse.json({ error: 'Failed to update variant' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = authenticateRequest(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await prisma.productVariant.delete({ where: { id } });
        cacheInvalidate('products-active');
        return NextResponse.json({ message: 'Variant deleted' });
    } catch {
        return NextResponse.json({ error: 'Failed to delete variant' }, { status: 500 });
    }
}
