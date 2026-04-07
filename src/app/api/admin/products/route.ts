import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            include: { category: true, variants: true },
            orderBy: { createdAt: 'desc' },
        });

        const parsed = products.map((p) => ({
            ...p,
            images: JSON.parse(p.images),
            features: JSON.parse(p.features),
        }));

        return NextResponse.json(parsed);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const auth = authenticateRequest(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, slug, description, features, basePrice, discount, images, categoryId, isActive, unavailableUntil, variants } = body;

        const product = await prisma.product.create({
            data: {
                name,
                slug,
                description,
                features: JSON.stringify(features || []),
                basePrice: parseFloat(basePrice),
                discount: parseFloat(discount || 0),
                images: JSON.stringify(images || []),
                categoryId,
                isActive: isActive ?? true,
                unavailableUntil: unavailableUntil ? new Date(unavailableUntil) : null,
                variants: variants && variants.length > 0 ? {
                    create: variants.map((v: { title: string; duration: string; price: string | number }) => ({
                        title: v.title,
                        duration: v.duration,
                        price: parseFloat(String(v.price)),
                    }))
                } : undefined,
            },
            include: { category: true, variants: true },
        });

        return NextResponse.json({
            ...product,
            images: JSON.parse(product.images),
            features: JSON.parse(product.features),
        });
    } catch (error) {
        console.error('Create product error:', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
