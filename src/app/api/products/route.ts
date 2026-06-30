import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cacheGet, cacheSet } from '@/lib/api-cache';

export const dynamic = 'force-dynamic';

const CACHE_KEY = 'products-active';
const TTL = 60_000; // 60 seconds

export async function GET() {
    try {
        const cached = cacheGet<unknown[]>(CACHE_KEY);
        if (cached) {
            return NextResponse.json(cached, {
                headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
            });
        }

        const products = await prisma.product.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                nameAr: true,
                slug: true,
                description: true,
                descriptionAr: true,
                basePrice: true,
                images: true,
                features: true,
                featuresAr: true,
                warrantyOptions: true,
                fullWarranty: true,
                isFeatured: true,
                outOfStock: true,
                displayOrder: true,
                unavailableUntil: true,
                categoryId: true,
                accountType: true,
                category: {
                    select: { id: true, name: true, slug: true },
                },
                variants: {
                    where: { isActive: true },
                    orderBy: { displayOrder: 'asc' },
                    select: {
                        id: true,
                        title: true,
                        price: true,
                        duration: true,
                        isActive: true,
                        outOfStock: true,
                        displayOrder: true,
                        warrantyDays: true,
                    },
                },
            },
            orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
        });

        const nowDate = new Date();
        const parsed = products
            .filter((p) => !p.unavailableUntil || new Date(p.unavailableUntil) <= nowDate)
            .map((p) => ({
                ...p,
                images: JSON.parse(p.images as string),
                features: JSON.parse(p.features as string),
                featuresAr: p.featuresAr ? JSON.parse(p.featuresAr as string) : [],
                warrantyOptions: p.warrantyOptions ? JSON.parse(p.warrantyOptions as string) : [],
            }));

        cacheSet(CACHE_KEY, parsed, TTL);

        return NextResponse.json(parsed, {
            headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
        });
    } catch (err) {
        console.error('Products API error:', err);
        return NextResponse.json([], { status: 200 });
    }
}
