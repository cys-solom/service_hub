import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            where: { isActive: true },
            include: { category: true, variants: { where: { isActive: true } } },
            orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
        });

        const now = new Date();
        const parsed = products
            .filter((p) => {
                // Filter out products that are unavailable until a future date
                if (p.unavailableUntil && new Date(p.unavailableUntil) > now) {
                    return false;
                }
                return true;
            })
            .map((p) => ({
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

