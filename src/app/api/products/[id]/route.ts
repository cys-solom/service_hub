import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { cacheInvalidate } from '@/lib/api-cache';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = authenticateRequest(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const product = await prisma.product.findUnique({
            where: { id },
            include: { category: true, variants: true },
        });

        if (!product) {
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

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = authenticateRequest(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name, slug, description, features, basePrice, discount, images, categoryId, isActive, unavailableUntil, displayOrder } = body;

        const data: Record<string, unknown> = {};
        if (name !== undefined) data.name = name;
        if (slug !== undefined) data.slug = slug;
        if (description !== undefined) data.description = description;
        if (features !== undefined) data.features = JSON.stringify(features);
        if (basePrice !== undefined) data.basePrice = parseFloat(basePrice);
        if (discount !== undefined) data.discount = parseFloat(discount);
        if (images !== undefined) data.images = JSON.stringify(images);
        if (categoryId !== undefined) data.categoryId = categoryId;
        if (isActive !== undefined) data.isActive = isActive;
        if (body.outOfStock !== undefined) data.outOfStock = body.outOfStock;
        if (body.isFeatured !== undefined) data.isFeatured = body.isFeatured;
        if (body.durationLabel !== undefined) data.durationLabel = body.durationLabel;
        if (body.nameAr !== undefined) data.nameAr = body.nameAr;
        if (body.descriptionAr !== undefined) data.descriptionAr = body.descriptionAr;
        if (body.featuresAr !== undefined) data.featuresAr = JSON.stringify(body.featuresAr);
        if (body.warrantyOptions !== undefined) data.warrantyOptions = JSON.stringify(body.warrantyOptions);
        if (body.fullWarranty !== undefined) data.fullWarranty = body.fullWarranty;
        if (displayOrder !== undefined) data.displayOrder = parseInt(String(displayOrder)) || 0;
        if (body.accountType !== undefined) data.accountType = body.accountType;
        if (body.warrantyType !== undefined) data.warrantyType = body.warrantyType;
        if (body.warrantyDuration !== undefined) data.warrantyDuration = parseInt(String(body.warrantyDuration)) || 0;
        if (unavailableUntil !== undefined) {
            data.unavailableUntil = unavailableUntil ? new Date(unavailableUntil) : null;
        }

        const product = await prisma.product.update({
            where: { id },
            data,
            include: { category: true, variants: true },
        });

        cacheInvalidate('products-active');
        return NextResponse.json({
            ...product,
            images: JSON.parse(product.images),
            features: JSON.parse(product.features),
            featuresAr: product.featuresAr ? JSON.parse(product.featuresAr) : [],
        });
    } catch {
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = authenticateRequest(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await prisma.product.delete({ where: { id } });
        cacheInvalidate('products-active');
        return NextResponse.json({ message: 'Product deleted' });
    } catch {
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
