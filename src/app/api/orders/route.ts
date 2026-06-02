import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { generateOrderCode } from '@/lib/whatsapp';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

// ── Rate-limit config ─────────────────────────────────────────────────────────
const ORDER_LIMIT = 5;
const ORDER_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

// ── GET all orders (admin only) ───────────────────────────────────────────────
export async function GET(request: NextRequest) {
    try {
        const auth = authenticateRequest(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const orders = await prisma.order.findMany({
            where: status ? { status } : undefined,
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(orders);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

// ── POST create order (public — guest checkout) ───────────────────────────────
export async function POST(request: NextRequest) {
    // ── 1. Rate limiting ──────────────────────────────────────────────────────
    const ip = getClientIp(request);
    const rl = checkRateLimit(ip, { limit: ORDER_LIMIT, windowMs: ORDER_WINDOW_MS, keyPrefix: 'order' });
    if (!rl.allowed) {
        return NextResponse.json(
            { error: 'Too many orders. Please try again later.' },
            { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
        );
    }

    try {
        const body = await request.json();
        const { customerEmail, items } = body;

        // ── 2. Sanitise scalar fields ─────────────────────────────────────────
        const customerName  = typeof body.customerName  === 'string' ? body.customerName.trim()  : '';
        const customerPhone = typeof body.customerPhone === 'string' ? body.customerPhone.trim() : '';
        const notes         = typeof body.notes         === 'string' ? body.notes.trim()         : '';
        const couponCode    = typeof body.couponCode    === 'string' ? body.couponCode.trim().toUpperCase() : null;

        // ── 3. Required-field guards ──────────────────────────────────────────
        if (!customerName) {
            return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
        }
        if (!customerPhone) {
            return NextResponse.json({ error: 'Customer phone is required' }, { status: 400 });
        }
        if (customerName.length > 120) {
            return NextResponse.json({ error: 'Customer name is too long' }, { status: 400 });
        }
        // Phone: digits, spaces, +, -, (, )
        if (!/^[0-9\s\+\-\(\)]{1,30}$/.test(customerPhone)) {
            return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
        }
        if (notes.length > 1000) {
            return NextResponse.json({ error: 'Notes too long (max 1000 characters)' }, { status: 400 });
        }
        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'At least one item is required' }, { status: 400 });
        }
        if (items.length > 50) {
            return NextResponse.json({ error: 'Too many items in order' }, { status: 400 });
        }

        // ── 4. Per-item structure guard ───────────────────────────────────────
        for (let idx = 0; idx < items.length; idx++) {
            const item = items[idx];
            if (!item || typeof item !== 'object') {
                return NextResponse.json({ error: `Item ${idx + 1} is invalid` }, { status: 400 });
            }
            const qty = Number(item.quantity);
            if (!Number.isInteger(qty) || qty < 1 || qty > 20) {
                return NextResponse.json(
                    { error: `Item ${idx + 1}: quantity must be an integer between 1 and 20` },
                    { status: 400 }
                );
            }
            // Each item must have either (variantId) or (bundleId) — productId alone
            // is not enough to determine the correct price
            const hasVariant = typeof item.variantId === 'string' && item.variantId.trim().length > 0;
            const hasBundle  = typeof item.bundleId  === 'string' && item.bundleId.trim().length  > 0;
            if (!hasVariant && !hasBundle) {
                return NextResponse.json(
                    { error: `Item ${idx + 1}: variantId or bundleId is required for server-side price verification` },
                    { status: 400 }
                );
            }
        }

        // ── 5. Server-side price calculation ─────────────────────────────────
        // Reject the client-supplied price; fetch real prices from the DB.
        type SanitisedItem = {
            productId?:   string;
            productName:  string;
            variant:      string;
            bundleId?:    string;
            price:        number;
            quantity:     number;
        };

        let serverSubtotal = 0;
        const sanitisedItems: SanitisedItem[] = [];

        for (let idx = 0; idx < items.length; idx++) {
            const item = items[idx];
            const qty  = Number(item.quantity);

            // ── Bundle item ───────────────────────────────────────────────────
            if (typeof item.bundleId === 'string' && item.bundleId.trim()) {
                const bundle = await prisma.bundle.findUnique({
                    where: { id: item.bundleId.trim() },
                });
                if (!bundle || !bundle.isActive) {
                    return NextResponse.json(
                        { error: `Item ${idx + 1}: bundle not found or inactive` },
                        { status: 400 }
                    );
                }
                const unitPrice = bundle.price;
                serverSubtotal += unitPrice * qty;
                sanitisedItems.push({
                    bundleId:    bundle.id,
                    productName: bundle.title,
                    variant:     'Bundle',
                    price:       unitPrice,
                    quantity:    qty,
                });
                continue;
            }

            // ── Variant item ──────────────────────────────────────────────────
            const variantId = (item.variantId as string).trim();
            const variant = await prisma.productVariant.findUnique({
                where: { id: variantId },
                include: { product: true },
            });

            if (!variant) {
                return NextResponse.json(
                    { error: `Item ${idx + 1}: variant not found` },
                    { status: 400 }
                );
            }
            if (!variant.isActive) {
                return NextResponse.json(
                    { error: `Item ${idx + 1}: this plan is no longer available` },
                    { status: 400 }
                );
            }
            if (!variant.product.isActive) {
                return NextResponse.json(
                    { error: `Item ${idx + 1}: product is not available` },
                    { status: 400 }
                );
            }
            if (variant.outOfStock || variant.product.outOfStock) {
                return NextResponse.json(
                    { error: `Item ${idx + 1}: this item is out of stock` },
                    { status: 400 }
                );
            }

            // ── Warranty option ───────────────────────────────────────────────
            // warrantyOptions are stored as JSON on the Product model.
            // Client sends warrantyIndex (integer ≥ 0) or omits / sends -1 for no warranty.
            let warrantyPrice = 0;
            let warrantyLabel = '';
            const warrantyIdx = typeof item.warrantyIndex === 'number' ? Math.floor(item.warrantyIndex) : -1;

            if (warrantyIdx >= 0) {
                // Parse warranty options from DB — never trust client price
                let rawOpts: Array<{ label?: string; labelAr?: string; price?: number; days?: number }> = [];
                try {
                    const raw = variant.product.warrantyOptions;
                    rawOpts = Array.isArray(raw)
                        ? raw
                        : (typeof raw === 'string' ? JSON.parse(raw) : []);
                } catch {
                    // malformed JSON stored in DB — treat as no warranty options available
                    rawOpts = [];
                }

                if (!Array.isArray(rawOpts) || warrantyIdx >= rawOpts.length || !rawOpts[warrantyIdx]) {
                    // Client sent an index that doesn't exist in the DB — reject explicitly
                    return NextResponse.json(
                        { error: `Item ${idx + 1}: Invalid warranty option (index ${warrantyIdx})` },
                        { status: 400 }
                    );
                }

                const opt = rawOpts[warrantyIdx];
                warrantyPrice = Number(opt.price) || 0;
                warrantyLabel = opt.label || '';
            }
            // warrantyIdx === -1 → no warranty, warrantyPrice stays 0 ✓

            const unitPrice = variant.price + warrantyPrice;
            serverSubtotal += unitPrice * qty;

            sanitisedItems.push({
                productId:   variant.product.id,
                productName: variant.product.name,
                variant:     warrantyLabel
                    ? `${variant.title} + ${warrantyLabel}`
                    : variant.title,
                price:   unitPrice,
                quantity: qty,
            });
        }

        // ── 6. Coupon re-validation ───────────────────────────────────────────
        let discountAmount = 0;
        let validatedCoupon: { id: string; code: string; discount: number; isPercent: boolean } | null = null;

        if (couponCode) {
            const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });

            if (!coupon) {
                return NextResponse.json(
                    { error: `Coupon "${couponCode}" is not valid` },
                    { status: 400 }
                );
            }
            if (!coupon.isActive) {
                return NextResponse.json(
                    { error: `Coupon "${couponCode}" is no longer active` },
                    { status: 400 }
                );
            }
            if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
                return NextResponse.json(
                    { error: `Coupon "${couponCode}" has expired` },
                    { status: 400 }
                );
            }
            if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
                return NextResponse.json(
                    { error: `Coupon "${couponCode}" has reached its usage limit` },
                    { status: 400 }
                );
            }
            if (coupon.minOrderValue > 0 && serverSubtotal < coupon.minOrderValue) {
                return NextResponse.json(
                    { error: `Minimum order value for this coupon is ${coupon.minOrderValue}` },
                    { status: 400 }
                );
            }

            // Calculate server-side discount
            if (coupon.isPercent) {
                discountAmount = Math.round((serverSubtotal * coupon.discount / 100) * 100) / 100;
            } else {
                discountAmount = Math.min(coupon.discount, serverSubtotal);
            }
            validatedCoupon = { id: coupon.id, code: coupon.code, discount: coupon.discount, isPercent: coupon.isPercent };
        }

        // ── 7. Compute server-side total ──────────────────────────────────────
        const serverTotal = Math.max(0, Math.round((serverSubtotal - discountAmount) * 100) / 100);

        // Log if client sent a different total (informational only — never trust client)
        const clientTotal = parseFloat(body.totalPrice);
        if (!isNaN(clientTotal) && Math.abs(clientTotal - serverTotal) > 0.01) {
            console.warn(
                `[orders] Price mismatch — client sent ${clientTotal}, server computed ${serverTotal} (IP: ${ip})`
            );
        }

        // ── 8. Create order ───────────────────────────────────────────────────
        const orderCode = generateOrderCode();

        const order = await prisma.order.create({
            data: {
                orderCode,
                customerName,
                customerPhone,
                customerEmail: customerEmail || null,
                items:      JSON.stringify(sanitisedItems),
                totalPrice: serverTotal,
                status:     'SentToWhatsApp',
                notes:      notes || null,
            },
        });

        // ── 9. Update product order counts (fire-and-forget) ─────────────────
        for (const item of sanitisedItems) {
            if (item.productId) {
                await prisma.product.update({
                    where: { id: item.productId },
                    data:  { orderCount: { increment: item.quantity } },
                }).catch(() => { });
            }
        }

        // ── 10. Increment coupon usage — only after successful order ──────────
        if (validatedCoupon) {
            await prisma.coupon.update({
                where: { id: validatedCoupon.id },
                data:  { usedCount: { increment: 1 } },
            }).catch((err) => console.error('Failed to increment coupon usage:', err));
        }

        // ── 11. Return trusted data for WhatsApp message building ─────────────
        return NextResponse.json({
            id:            order.id,
            orderCode:     order.orderCode,
            customerName,
            customerPhone,
            notes:         notes || null,
            items:         sanitisedItems,
            subtotal:      serverSubtotal,
            discountAmount,
            total:         serverTotal,
            couponCode:    validatedCoupon?.code || null,
            status:        order.status,
            createdAt:     order.createdAt,
        });

    } catch (error) {
        console.error('Order creation error:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}

// ── DELETE all orders (admin only) ────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
    try {
        const auth = authenticateRequest(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await prisma.order.deleteMany({});
        return NextResponse.json({ message: 'All orders deleted' });
    } catch {
        return NextResponse.json({ error: 'Failed to delete orders' }, { status: 500 });
    }
}
