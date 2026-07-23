import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/reviews
export async function GET() {
  const reviews = await (prisma as any).review.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ reviews });
}

// PATCH /api/admin/reviews — approve or delete
export async function PATCH(req: NextRequest) {
  const { id, action } = await req.json().catch(() => ({}));
  if (!id || !action) return NextResponse.json({ error: 'Missing id or action' }, { status: 400 });

  if (action === 'approve') {
    const review = await (prisma as any).review.update({ where: { id }, data: { isApproved: true } });
    return NextResponse.json({ review });
  }
  if (action === 'delete') {
    await (prisma as any).review.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
