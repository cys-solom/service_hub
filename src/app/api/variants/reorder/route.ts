import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function PUT(request: NextRequest) {
    try {
        const auth = authenticateRequest(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { orderedIds } = body;

        if (!Array.isArray(orderedIds)) {
            return NextResponse.json({ error: 'orderedIds must be an array' }, { status: 400 });
        }

        // Update displayOrder for each variant
        const updates = orderedIds.map((id: string, index: number) =>
            prisma.productVariant.update({
                where: { id },
                data: { displayOrder: index },
            })
        );

        await Promise.all(updates);

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Failed to reorder variants' }, { status: 500 });
    }
}
