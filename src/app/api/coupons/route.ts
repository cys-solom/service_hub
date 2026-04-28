import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

// GET all coupons (admin only)
export async function GET(request: NextRequest) {
    try {
        const auth = authenticateRequest(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const coupons = await prisma.coupon.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(coupons);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
    }
}

// CREATE a new coupon (admin only)
export async function POST(request: NextRequest) {
    try {
        const auth = authenticateRequest(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { code, discount, isPercent, maxUses, minOrderValue, expiresAt, isActive } = body;

        if (!code || discount === undefined) {
            return NextResponse.json({ error: 'Code and discount are required' }, { status: 400 });
        }

        // Validate percentage discount
        if (isPercent && (discount < 0 || discount > 100)) {
            return NextResponse.json({ error: 'Percentage discount must be between 0 and 100' }, { status: 400 });
        }

        const coupon = await prisma.coupon.create({
            data: {
                code: code.toUpperCase().trim(),
                discount: parseFloat(discount),
                isPercent: isPercent ?? true,
                maxUses: parseInt(maxUses) || 0,
                minOrderValue: parseFloat(minOrderValue) || 0,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                isActive: isActive ?? true,
            },
        });

        return NextResponse.json(coupon);
    } catch (error: unknown) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
            return NextResponse.json({ error: 'Coupon code already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
    }
}
