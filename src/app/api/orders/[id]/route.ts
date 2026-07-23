import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { sendCapiEvent } from '@/lib/meta-capi';

async function getPixelIdAndCurrency(): Promise<{ pixelId: string; currency: string }> {
    const settings = await prisma.settings.findFirst();
    if (!settings) return { pixelId: '', currency: 'EGP' };
    let pixelId = '';
    try { pixelId = JSON.parse(settings.contentEn || '{}').metaPixelId || ''; } catch { /* ignore */ }
    return { pixelId, currency: settings.currency || 'EGP' };
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = authenticateRequest(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const order = await prisma.order.findUnique({ where: { id } });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json(order);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
    }
}

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
        if (body.status !== undefined) allowedUpdates.status = body.status;
        if (body.notes !== undefined) allowedUpdates.notes = body.notes;

        // Fire a real "Purchase" Conversions API event the first time an order
        // is confirmed as paid/delivered — a much stronger signal than Lead.
        if (body.status === 'Completed') {
            const existing = await prisma.order.findUnique({ where: { id } });
            if (existing && !existing.purchaseEventSent) {
                const { pixelId, currency } = await getPixelIdAndCurrency();
                if (pixelId) {
                    const nameParts = existing.customerName.trim().split(/\s+/);
                    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.services-hub.store';
                    await sendCapiEvent(pixelId, {
                        eventName: 'Purchase',
                        eventId: `purchase-${existing.id}`,
                        eventSourceUrl: `${siteUrl.replace(/\/$/, '')}/order/${existing.orderCode}`,
                        customData: {
                            value: existing.totalPrice,
                            currency,
                            order_id: existing.orderCode,
                        },
                        userData: {
                            email: existing.customerEmail || undefined,
                            phone: existing.customerPhone,
                            firstName: nameParts[0],
                            lastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined,
                        },
                    });
                }
                allowedUpdates.purchaseEventSent = true;
            }
        }

        const order = await prisma.order.update({
            where: { id },
            data: allowedUpdates,
        });

        return NextResponse.json(order);
    } catch {
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
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
        await prisma.order.delete({ where: { id } });
        return NextResponse.json({ message: 'Order deleted' });
    } catch {
        return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
    }
}
