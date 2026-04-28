import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUBLIC: Validate and apply coupon code
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code, orderTotal } = body;

        if (!code) {
            return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
        }

        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase().trim() },
        });

        if (!coupon) {
            return NextResponse.json({ error: 'Invalid coupon code', valid: false }, { status: 404 });
        }

        if (!coupon.isActive) {
            return NextResponse.json({ error: 'This coupon is no longer active', valid: false }, { status: 400 });
        }

        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
            return NextResponse.json({ error: 'This coupon has expired', valid: false }, { status: 400 });
        }

        if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
            return NextResponse.json({ error: 'This coupon has reached its usage limit', valid: false }, { status: 400 });
        }

        const total = parseFloat(orderTotal) || 0;
        if (coupon.minOrderValue > 0 && total < coupon.minOrderValue) {
            return NextResponse.json({
                error: `Minimum order value is ${coupon.minOrderValue}`,
                valid: false,
                minOrderValue: coupon.minOrderValue,
            }, { status: 400 });
        }

        // Calculate discount
        let discountAmount: number;
        if (coupon.isPercent) {
            discountAmount = Math.round((total * coupon.discount / 100) * 100) / 100;
        } else {
            discountAmount = Math.min(coupon.discount, total);
        }

        return NextResponse.json({
            valid: true,
            coupon: {
                id: coupon.id,
                code: coupon.code,
                discount: coupon.discount,
                isPercent: coupon.isPercent,
            },
            discountAmount,
            newTotal: Math.round((total - discountAmount) * 100) / 100,
        });
    } catch {
        return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
    }
}
