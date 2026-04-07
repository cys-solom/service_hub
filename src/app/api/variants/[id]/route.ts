import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

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

        const variant = await prisma.productVariant.update({
            where: { id },
            data: body,
        });

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
        return NextResponse.json({ message: 'Variant deleted' });
    } catch {
        return NextResponse.json({ error: 'Failed to delete variant' }, { status: 500 });
    }
}
