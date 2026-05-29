import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function authCheck(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.replace('Bearer ', '').trim();
  return token.length > 10;
}

// PUT update bundle
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!authCheck(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    const body = await req.json();
    const bundle = await prisma.bundle.update({
      where: { id },
      data: {
        title:         body.title,
        titleAr:       body.titleAr,
        subtitle:      body.subtitle,
        subtitleAr:    body.subtitleAr,
        description:   body.description,
        descriptionAr: body.descriptionAr,
        gradient:      body.gradient,
        savings:       body.savings,
        savingsAr:     body.savingsAr,
        price:         Number(body.price) || 0,
        originalPrice: Number(body.originalPrice) || 0,
        tools:         JSON.stringify(body.tools ?? []),
        features:      JSON.stringify(body.features ?? []),
        featuresAr:    JSON.stringify(body.featuresAr ?? []),
        isHot:         Boolean(body.isHot),
        isActive:      Boolean(body.isActive),
        displayOrder:  Number(body.displayOrder) || 0,
      },
    });
    return NextResponse.json(bundle);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// DELETE bundle
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!authCheck(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    await prisma.bundle.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

