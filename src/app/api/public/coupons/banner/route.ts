import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const now = new Date();
  const coupons = await prisma.coupon.findMany({
    where: { isActive: true, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
    orderBy: { discount: 'desc' },
    select: { code: true, discount: true, isPercent: true, expiresAt: true, maxUses: true, usedCount: true },
    take: 5,
  });

  const valid = coupons.find(c => c.maxUses === 0 || c.usedCount < c.maxUses);
  return NextResponse.json({ coupon: valid ?? null });
}
