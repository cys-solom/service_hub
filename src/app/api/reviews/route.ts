import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

function cuid() {
  return randomBytes(12).toString('base64url').slice(0, 16);
}

// GET /api/reviews?productId=xxx
export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get('productId');
  if (!productId) return NextResponse.json({ reviews: [] });

  const reviews = await (prisma as any).review.findMany({
    where: { productId, isApproved: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ reviews });
}

// POST /api/reviews
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const { productId, rating, name, comment } = body;
  if (!productId || !rating || !name) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be 1–5' }, { status: 400 });
  }
  const cleanName    = String(name).trim().slice(0, 80);
  const cleanComment = String(comment || '').trim().slice(0, 500);
  if (!cleanName) return NextResponse.json({ error: 'Name required' }, { status: 400 });

  const review = await (prisma as any).review.create({
    data: {
      id: cuid(),
      productId,
      rating: Math.round(rating),
      name: cleanName,
      comment: cleanComment,
      isApproved: false,
    },
  });

  return NextResponse.json({ review, message: 'Review submitted — pending approval' }, { status: 201 });
}
