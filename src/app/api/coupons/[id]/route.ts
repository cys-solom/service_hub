import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

// UPDATE coupon (admin only)
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

        const allowedUpdates: Record<string, unknown> = {};
        if (body.code !== undefined) allowedUpdates.code = body.code.toUpperCase().trim();
        if (body.discount !== undefined) allowedUpdates.discount = parseFloat(body.discount);
        if (body.isPercent !== undefined) allowedUpdates.isPercent = body.isPercent;
        if (body.maxUses !== undefined) allowedUpdates.maxUses = parseInt(body.maxUses) || 0;
        if (body.minOrderValue !== undefined) allowedUpdates.minOrderValue = parseFloat(body.minOrderValue) || 0;
        if (body.expiresAt !== undefined) allowedUpdates.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
        if (body.isActive !== undefined) allowedUpdates.isActive = body.isActive;

        const coupon = await prisma.coupon.update({
            where: { id },
            data: allowedUpdates,
        });

        return NextResponse.json(coupon);
    } catch {
        return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
    }
}

// DELETE coupon (admin only)
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
        await prisma.coupon.delete({ where: { id } });

        return NextResponse.json({ message: 'Coupon deleted' });
    } catch {
        return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
    }
}
