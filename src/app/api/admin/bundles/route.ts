import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function authCheck(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.replace('Bearer ', '').trim();
  if (!token) return false;
  // Basic: same token stored in localStorage
  return token.length > 10;
}

// GET all bundles (admin view - includes inactive)
export async function GET(req: NextRequest) {
  if (!authCheck(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const bundles = await prisma.bundle.findMany({
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });
    const parsed = bundles.map((b) => ({
      ...b,
      tools:      JSON.parse(b.tools as string),
      features:   JSON.parse(b.features as string),
      featuresAr: JSON.parse(b.featuresAr as string),
    }));
    return NextResponse.json(parsed);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// POST create new bundle
export async function POST(req: NextRequest) {
  if (!authCheck(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const bundle = await prisma.bundle.create({
      data: {
        title:         body.title ?? '',
        titleAr:       body.titleAr ?? '',
        subtitle:      body.subtitle ?? '',
        subtitleAr:    body.subtitleAr ?? '',
        description:   body.description ?? '',
        descriptionAr: body.descriptionAr ?? '',
        gradient:      body.gradient ?? 'linear-gradient(135deg, #7c3aed, #a855f7)',
        savings:       body.savings ?? 'Save 30%',
        savingsAr:     body.savingsAr ?? 'وفّر 30%',
        price:         Number(body.price) || 0,
        originalPrice: Number(body.originalPrice) || 0,
        tools:         JSON.stringify(body.tools ?? []),
        features:      JSON.stringify(body.features ?? []),
        featuresAr:    JSON.stringify(body.featuresAr ?? []),
        isHot:         Boolean(body.isHot),
        isActive:      body.isActive !== false,
        displayOrder:  Number(body.displayOrder) || 0,
      },
    });
    return NextResponse.json(bundle);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
