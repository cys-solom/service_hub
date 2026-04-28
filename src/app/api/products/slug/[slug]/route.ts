import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const product = await prisma.product.findUnique({
            where: { slug },
            include: { category: true, variants: { where: { isActive: true } } },
        });

        if (!product || !product.isActive) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({
            ...product,
            images: JSON.parse(product.images),
            features: JSON.parse(product.features),
            featuresAr: product.featuresAr ? JSON.parse(product.featuresAr) : [],
        });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
}
