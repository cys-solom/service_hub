import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            include: { category: true, variants: true },
            orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
        });
        // Auto-fix negative/zero displayOrder values
        const needsFix = products.filter(p => (p.displayOrder || 0) <= 0);
        if (needsFix.length > 0) {
            const maxOrder = Math.max(0, ...products.map(p => p.displayOrder || 0));
            let nextOrder = maxOrder + 1;
            for (const p of needsFix) {
                await prisma.product.update({
                    where: { id: p.id },
                    data: { displayOrder: nextOrder },
                });
                p.displayOrder = nextOrder;
                nextOrder++;
            }
        }

        // Re-sort after fix
        products.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

        const parsed = products.map((p) => ({
            ...p,
            images: JSON.parse(p.images),
            features: JSON.parse(p.features),
            featuresAr: p.featuresAr ? JSON.parse(p.featuresAr) : [],
            warrantyOptions: p.warrantyOptions ? JSON.parse(p.warrantyOptions) : [],
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
        const { name, slug, description, features, basePrice, discount, images, categoryId, isActive, unavailableUntil, variants, displayOrder, durationLabel } = body;

        const product = await prisma.product.create({
            data: {
                name,
                nameAr: body.nameAr || '',
                slug,
                description,
                descriptionAr: body.descriptionAr || '',
                features: JSON.stringify(features || []),
                featuresAr: JSON.stringify(body.featuresAr || []),
                basePrice: parseFloat(basePrice),
                discount: parseFloat(discount || 0),
                images: JSON.stringify(images || []),
                categoryId,
                isActive: isActive ?? true,
                outOfStock: body.outOfStock ?? false,
                fullWarranty: body.fullWarranty ?? false,
                displayOrder: parseInt(String(displayOrder || 0)) || 0,
                durationLabel: durationLabel || '',
                warrantyOptions: JSON.stringify(body.warrantyOptions || []),
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
            featuresAr: product.featuresAr ? JSON.parse(product.featuresAr) : [],
        });
    } catch (error) {
        console.error('Create product error:', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
