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

        // Only allow updating specific fields
        const allowedUpdates: Record<string, unknown> = {};
        if (body.name !== undefined) allowedUpdates.name = body.name;
        if (body.slug !== undefined) allowedUpdates.slug = body.slug;
        if (body.isActive !== undefined) allowedUpdates.isActive = body.isActive;

        const category = await prisma.category.update({
            where: { id },
            data: allowedUpdates,
        });

        return NextResponse.json(category);
    } catch {
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
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
        await prisma.category.delete({ where: { id } });
        return NextResponse.json({ message: 'Category deleted' });
    } catch {
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }
}
