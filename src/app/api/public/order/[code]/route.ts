import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    if (!code || code.length > 30) {
      return NextResponse.json({ error: 'Invalid order code' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { orderCode: code.toUpperCase().trim() },
      select: {
        orderCode:    true,
        customerName: true,
        status:       true,
        totalPrice:   true,
        items:        true,
        createdAt:    true,
        notes:        true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      orderCode:    order.orderCode,
      customerName: order.customerName,
      status:       order.status,
      totalPrice:   order.totalPrice,
      items:        JSON.parse(order.items),
      createdAt:    order.createdAt,
      notes:        order.notes,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
