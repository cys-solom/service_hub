import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { generateOrderCode } from '@/lib/whatsapp';

export async function GET(request: NextRequest) {
    try {
        const auth = authenticateRequest(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const orders = await prisma.order.findMany({
            where: status ? { status } : undefined,
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(orders);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { customerName, customerPhone, customerEmail, items, totalPrice, notes } = body;

        if (!customerName || !customerPhone || !items || items.length === 0) {
            return NextResponse.json(
                { error: 'Customer name, phone, and items are required' },
                { status: 400 }
            );
        }

        const parsedTotalPrice = parseFloat(totalPrice);
        if (isNaN(parsedTotalPrice) || parsedTotalPrice < 0) {
            return NextResponse.json(
                { error: 'Invalid total price' },
                { status: 400 }
            );
        }

        const orderCode = generateOrderCode();

        const order = await prisma.order.create({
            data: {
                orderCode,
                customerName,
                customerPhone,
                customerEmail,
                items: JSON.stringify(items),
                totalPrice: parsedTotalPrice,
                status: 'SentToWhatsApp',
                notes,
            },
        });

        // Update product order counts
        for (const item of items) {
            if (item.productId) {
                await prisma.product.update({
                    where: { id: item.productId },
                    data: { orderCount: { increment: item.quantity || 1 } },
                }).catch(() => { });
            }
        }

        // Increment coupon usage count if coupon was used
        if (body.couponCode) {
            try {
                await prisma.coupon.update({
                    where: { code: body.couponCode.toUpperCase().trim() },
                    data: { usedCount: { increment: 1 } },
                });
            } catch (couponErr) {
                console.error('Failed to update coupon usage:', couponErr);
            }
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('Order creation error:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const auth = authenticateRequest(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await prisma.order.deleteMany({});
        return NextResponse.json({ message: 'All orders deleted' });
    } catch {
        return NextResponse.json({ error: 'Failed to delete orders' }, { status: 500 });
    }
}
