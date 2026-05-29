import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // allow runtime headers

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            where: { isActive: true },
            include: { category: true, variants: { where: { isActive: true }, orderBy: { displayOrder: 'asc' } } },
            orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
        });

        const now = new Date();
        const parsed = products
            .filter((p) => {
                if (p.unavailableUntil && new Date(p.unavailableUntil) > now) {
                    return false;
                }
                return true;
            })
            .map((p) => ({
                ...p,
                images: JSON.parse(p.images as string),
                features: JSON.parse(p.features as string),
                featuresAr: p.featuresAr ? JSON.parse(p.featuresAr as string) : [],
                warrantyOptions: p.warrantyOptions ? JSON.parse(p.warrantyOptions as string) : [],
            }));

        return NextResponse.json(parsed, {
            headers: {
                // Cache for 2min at CDN/edge, serve stale for up to 10min while revalidating
                'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
            },
        });
    } catch (err) {
        console.error('Products API error:', err);
        return NextResponse.json([], { status: 200 }); // Return empty array not error object!
    }
}
