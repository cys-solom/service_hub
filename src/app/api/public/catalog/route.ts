import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/public/catalog
 *
 * Public Readonly API — returns active products, active bundles,
 * and safe store settings for use in external sites.
 *
 * Security:
 *  - No authentication required (public data only)
 *  - Only isActive=true products are returned
 *  - Only isActive=true variants are returned
 *  - Only isActive=true bundles are returned
 *  - Products past unavailableUntil date are filtered out
 *  - No orders, coupons, admin data, or secrets are exposed
 *  - No JWT, DATABASE_URL, or sensitive env vars
 *
 * CORS:
 *  - Access-Control-Allow-Origin: * (public read-only data)
 *  - Only GET and OPTIONS are allowed
 *
 * Cache:
 *  - s-maxage=60 (CDN/edge cache 1 minute)
 *  - stale-while-revalidate=300 (serve stale for 5 minutes while refreshing)
 *  - Checkout/orders API remains fully dynamic — not affected
 */

export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
};

/* OPTIONS — pre-flight for cross-origin requests */
export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
    try {
        const [products, bundles, settings] = await Promise.all([
            prisma.product.findMany({
                where: { isActive: true },
                select: {
                    id: true,
                    slug: true,
                    name: true,
                    nameAr: true,
                    description: true,
                    descriptionAr: true,
                    outOfStock: true,
                    images: true,
                    unavailableUntil: true,
                    category: { select: { name: true, slug: true } },
                    variants: {
                        where: { isActive: true },
                        select: { id: true, title: true, duration: true, price: true },
                        orderBy: { displayOrder: 'asc' },
                    },
                },
                orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
            }),
            prisma.bundle.findMany({
                where: { isActive: true },
                select: {
                    id: true,
                    title: true,
                    titleAr: true,
                    description: true,
                    price: true,
                    originalPrice: true,
                    isActive: true,
                },
                orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
            }),
            prisma.settings.findFirst({
                select: { storeName: true, currency: true },
            }),
        ]);

        const now = new Date();
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

        const formattedProducts = products
            .filter(p => !p.unavailableUntil || new Date(p.unavailableUntil) <= now)
            .map(p => ({
                id: p.id,
                slug: p.slug,
                name: p.name,
                nameAr: p.nameAr || '',
                description: p.description || '',
                descriptionAr: p.descriptionAr || '',
                category: p.category?.name || '',
                categorySlug: p.category?.slug || '',
                logo: (() => {
                    try {
                        const imgs = JSON.parse(p.images as string);
                        return Array.isArray(imgs) && imgs.length > 0 ? imgs[0] : null;
                    } catch { return null; }
                })(),
                isOutOfStock: p.outOfStock,
                variants: p.variants.map(v => ({
                    id: v.id,
                    title: v.title,
                    duration: v.duration,
                    price: v.price,
                })),
                url: siteUrl ? `${siteUrl}/product/${p.slug}` : `/product/${p.slug}`,
            }));

        const formattedBundles = bundles.map(b => ({
            id: b.id,
            title: b.title,
            titleAr: b.titleAr || '',
            description: b.description || '',
            price: b.price,
            originalPrice: b.originalPrice || null,
            isActive: b.isActive,
            url: siteUrl || '/',
        }));

        return NextResponse.json(
            {
                store: {
                    name: settings?.storeName || 'Service Hub',
                    currency: settings?.currency || 'EGP',
                    siteUrl: siteUrl || null,
                },
                products: formattedProducts,
                bundles: formattedBundles,
                meta: {
                    version: '1.0',
                    generatedAt: new Date().toISOString(),
                    totalProducts: formattedProducts.length,
                    totalBundles: formattedBundles.length,
                },
            },
            { headers: CORS_HEADERS }
        );
    } catch (err) {
        console.error('Public catalog API error:', err);
        return NextResponse.json(
            { error: 'Failed to fetch catalog' },
            { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
        );
    }
}
