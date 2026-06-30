import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { cacheInvalidate } from '@/lib/api-cache';

/* ──────────────────────────────────────────────
   GET /api/admin/quick-products
   Returns minimal product + variant data for
   the Quick Products admin page.
   Protected: requires valid admin cookie.
────────────────────────────────────────────── */
export async function GET(request: NextRequest) {
    const auth = authenticateRequest(request);
    if (!auth) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const products = await prisma.product.findMany({
            select: {
                id: true,
                name: true,
                nameAr: true,
                isActive: true,
                outOfStock: true,
                displayOrder: true,
                updatedAt: true,
                category: { select: { id: true, name: true } },
                variants: {
                    select: {
                        id: true,
                        title: true,
                        duration: true,
                        price: true,
                        isActive: true,
                        outOfStock: true,
                        displayOrder: true,
                    },
                    orderBy: { displayOrder: 'asc' },
                },
            },
            orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
        });

        return NextResponse.json(products);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

/* ──────────────────────────────────────────────
   PATCH /api/admin/quick-products
   Accepts ONLY:
     { productId, isActive?, outOfStock?, variants?: [{ variantId, price }] }

   Strict validation — no arbitrary field updates.
   Protected: requires valid admin cookie.
────────────────────────────────────────────── */
export async function PATCH(request: NextRequest) {
    const auth = authenticateRequest(request);
    if (!auth) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body || typeof body !== 'object') {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { productId, isActive, outOfStock, variants } = body as Record<string, unknown>;

    // productId is required
    if (typeof productId !== 'string' || !productId.trim()) {
        return NextResponse.json({ error: 'productId is required and must be a string' }, { status: 400 });
    }

    // Verify product exists
    const existingProduct = await prisma.product.findUnique({ where: { id: productId } });
    if (!existingProduct) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Build product update payload — ONLY allowed fields
    const productData: { isActive?: boolean; outOfStock?: boolean } = {};
    if (isActive !== undefined) {
        if (typeof isActive !== 'boolean') {
            return NextResponse.json({ error: 'isActive must be a boolean' }, { status: 400 });
        }
        productData.isActive = isActive;
    }
    if (outOfStock !== undefined) {
        if (typeof outOfStock !== 'boolean') {
            return NextResponse.json({ error: 'outOfStock must be a boolean' }, { status: 400 });
        }
        productData.outOfStock = outOfStock;
    }

    // Handle variant price updates
    const variantErrors: string[] = [];
    const variantUpdates: Array<{ id: string; price: number }> = [];

    if (variants !== undefined) {
        if (!Array.isArray(variants)) {
            return NextResponse.json({ error: 'variants must be an array' }, { status: 400 });
        }

        for (const v of variants) {
            if (!v || typeof v !== 'object') {
                variantErrors.push('Each variant must be an object');
                continue;
            }
            const { variantId, price } = v as Record<string, unknown>;

            if (typeof variantId !== 'string' || !variantId.trim()) {
                variantErrors.push('variantId must be a non-empty string');
                continue;
            }

            const parsedPrice = typeof price === 'number' ? price : parseFloat(String(price));
            if (!isFinite(parsedPrice) || parsedPrice < 0) {
                variantErrors.push(`Invalid price for variant ${variantId}: must be a finite number >= 0`);
                continue;
            }

            // Round to 2 decimal places to prevent float drift
            variantUpdates.push({ id: variantId, price: Math.round(parsedPrice * 100) / 100 });
        }

        if (variantErrors.length > 0) {
            return NextResponse.json({ error: 'Variant validation failed', details: variantErrors }, { status: 400 });
        }
    }

    // No-op check — must have at least one update
    if (Object.keys(productData).length === 0 && variantUpdates.length === 0) {
        return NextResponse.json({ error: 'No valid update fields provided' }, { status: 400 });
    }

    // Execute updates in a transaction
    try {
        await prisma.$transaction(async (tx) => {
            if (Object.keys(productData).length > 0) {
                await tx.product.update({ where: { id: productId }, data: productData });
            }
            for (const { id, price } of variantUpdates) {
                // Verify variant belongs to this product
                const variant = await tx.productVariant.findFirst({
                    where: { id, productId },
                });
                if (!variant) {
                    throw new Error(`Variant ${id} does not belong to product ${productId}`);
                }
                await tx.productVariant.update({ where: { id }, data: { price } });
            }
        });

        // Return updated product data
        const updated = await prisma.product.findUnique({
            where: { id: productId },
            select: {
                id: true, name: true, nameAr: true, isActive: true, outOfStock: true, updatedAt: true,
                category: { select: { id: true, name: true } },
                variants: {
                    select: { id: true, title: true, duration: true, price: true, isActive: true, outOfStock: true, displayOrder: true },
                    orderBy: { displayOrder: 'asc' },
                },
            },
        });

        cacheInvalidate('products-active');
        return NextResponse.json({ success: true, product: updated });
    } catch (err) {
        const msg = err instanceof Error ? err.message : 'Update failed';
        return NextResponse.json({ error: msg }, { status: 400 });
    }
}
