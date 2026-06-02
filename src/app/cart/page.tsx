'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingCart, MessageCircle, ArrowRight, Package, Tag, X } from 'lucide-react';
import { useCart } from '@/lib/cart-context';

import { buildWhatsAppMessage, generateWhatsAppUrl, openWhatsApp } from '@/lib/whatsapp';
import { useI18n } from '@/lib/i18n';
import { useSettings } from '@/lib/settings-context';
import ProductLogo from '@/components/ProductLogo';
import { getProductAccentColor } from '@/lib/product-features';

/* ── Design tokens — matches dark design system ── */
const C = {
    bg: '#0d0d0d', bgLight: '#101010', surface: '#141414',
    border: 'rgba(255,255,255,0.07)', borderMid: 'rgba(255,255,255,0.10)',
    text: '#E8E8E8', textSec: '#9a9a9a', textMuted: '#7a7a7a', /* was #686868, #404040 — improved contrast */
    accent: '#a78bfa', accentDim: '#7c3aed', accentBg: 'rgba(139,92,246,0.12)',
    green: '#22c55e', greenBg: 'rgba(34,197,94,0.10)', greenBorder: 'rgba(34,197,94,0.20)',
    red: '#f87171', redBg: 'rgba(248,113,113,0.10)',
};

export default function CartPage() {
    const router = useRouter();
    const { items, removeItem, updateQuantity, clearCart, totalPrice, itemCount } = useCart();
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerNotes, setCustomerNotes] = useState('');
    const [sending, setSending] = useState(false);
    const [formError, setFormError] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState<{ id: string; code: string; discount: number; isPercent: boolean; discountAmount: number } | null>(null);
    const [couponError, setCouponError] = useState('');
    const { t, locale } = useI18n();
    const { currencySymbol, currency, whatsappPhone } = useSettings();

    const finalPrice = appliedCoupon ? Math.round((totalPrice - appliedCoupon.discountAmount) * 100) / 100 : totalPrice;

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true); setCouponError('');
        try {
            const res = await fetch('/api/coupons/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: couponCode, orderTotal: totalPrice }) });
            const data = await res.json();
            if (data.valid) { setAppliedCoupon({ id: data.coupon.id, code: data.coupon.code, discount: data.coupon.discount, isPercent: data.coupon.isPercent, discountAmount: data.discountAmount }); setCouponError(''); }
            else { setCouponError(data.error || 'Invalid coupon'); setAppliedCoupon(null); }
        } catch { setCouponError('Failed to validate coupon'); }
        setCouponLoading(false);
    };
    const handleRemoveCoupon = () => { setAppliedCoupon(null); setCouponCode(''); setCouponError(''); };



    const handleSendOrder = async () => {
        setFormError('');

        // ── Client-side validation ────────────────────────────────────────────
        const isAr = locale === 'ar';
        if (items.length === 0) {
            setFormError(isAr ? 'السلة فارغة.' : 'Your cart is empty.');
            return;
        }
        const trimmedName = customerName.trim();
        const trimmedPhone = customerPhone.trim();
        if (!trimmedName) {
            setFormError(isAr ? 'يرجى إدخال الاسم.' : 'Please enter your name.');
            return;
        }
        if (!trimmedPhone) {
            setFormError(isAr ? 'يرجى إدخال رقم الهاتف.' : 'Please enter your phone number.');
            return;
        }
        // Basic phone format: digits, spaces, +, -, (, )
        if (!/^[0-9\s+\-()]{4,30}$/.test(trimmedPhone)) {
            setFormError(isAr ? 'صيغة رقم الهاتف غير صحيحة.' : 'Invalid phone number format.');
            return;
        }
        // Quantity sanity check
        const badQty = items.find(i => i.quantity < 1 || i.quantity > 20);
        if (badQty) {
            setFormError(isAr ? 'الكمية يجب أن تكون بين 1 و 20.' : 'Quantity must be between 1 and 20.');
            return;
        }

        setSending(true);
        try {
            // ── Send order to server — includes variantId for server-side pricing ──
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: trimmedName,
                    customerPhone: trimmedPhone,
                    items: items.map(i => ({
                        productId:   i.productId,
                        variantId:   i.variantId,    // required for server-side price lookup
                        productName: i.productName,
                        variant:     i.variantTitle,
                        quantity:    i.quantity,
                        // price intentionally omitted — server computes from DB
                    })),
                    notes:      customerNotes,
                    couponCode: appliedCoupon?.code || null,
                    // totalPrice intentionally omitted — server is the source of truth
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                // Surface server error inline (coupon invalid, item unavailable, etc.)
                setFormError(data.error || (isAr ? 'حدث خطأ. يرجى المحاولة مرة أخرى.' : 'An error occurred. Please try again.'));
                setSending(false);
                return;
            }

            // ── Build WhatsApp message from server-computed data (trusted) ────
            const trustedItems = Array.isArray(data.items) ? data.items : items.map(i => ({
                productName: i.productName,
                variant:     i.variantTitle,
                price:       i.price,
                quantity:    i.quantity,
            }));
            const trustedTotal = typeof data.total === 'number' ? data.total : finalPrice;
            const orderCode    = data.orderCode;

            const message = buildWhatsAppMessage({
                orderCode,
                customerName:  trimmedName,
                customerPhone: trimmedPhone,
                notes:         customerNotes,
                items:         trustedItems.map((i: { productName: string; variant: string; price: number; quantity: number }) => ({
                    productName: i.productName,
                    variant:     i.variant,
                    price:       i.price,
                    quantity:    i.quantity,
                })),
                totalPrice: trustedTotal,
                currency:   currency || 'EGP',
                locale,
            });

            const waUrl = generateWhatsAppUrl(whatsappPhone || '', message);
            openWhatsApp(waUrl);
            clearCart();
            setTimeout(() => router.push(`/thank-you?code=${orderCode}&waUrl=${encodeURIComponent(waUrl)}`), 500);

        } catch {
            setFormError(isAr ? 'فشل إرسال الطلب. تحقق من الاتصال وحاول مرة أخرى.' : 'Failed to send order. Check your connection and try again.');
            setSending(false);
        }
    };

    const inputStyle: React.CSSProperties = { width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: `1px solid ${C.border}`, background: C.bgLight, color: C.text, outline: 'none', fontSize: '0.875rem' };
    const qtyBtn: React.CSSProperties = { width: 32, height: 32, borderRadius: '0.5rem', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', cursor: 'pointer', color: C.text };

    return (
        <div style={{ minHeight: '100vh', padding: '2rem 1rem 5rem' }}>
        {/* Responsive cart grid — 2 columns on ≥768 px, 1 column on mobile */}
        <style>{`
          .cart-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }
          @media (max-width: 767px) { .cart-grid { grid-template-columns: 1fr; } }
          .cart-summary-sticky { position: sticky; top: 6rem; align-self: start; }
          @media (max-width: 767px) { .cart-summary-sticky { position: static; } }
        `}</style>
        <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
            <div className="fade-up">
              <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: C.text, marginBottom: '0.5rem' }}>{t.cart.title}</h1>
              <p style={{ color: C.textSec, marginBottom: '2rem' }}>{itemCount} {itemCount === 1 ? t.cart.item : t.cart.items} {t.cart.inCart}</p>
            </div>

                {items.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                        <ShoppingCart style={{ width: 80, height: 80, color: C.textMuted, margin: '0 auto 1rem' }} />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: C.text, marginBottom: '0.5rem' }}>{t.cart.empty}</h2>
                        <p style={{ color: C.textSec, marginBottom: '0.75rem' }}>{t.cart.emptyDesc}</p>
                        <p style={{ color: C.textMuted, fontSize: '0.8rem', marginBottom: '1.75rem' }}>
                            🟢 {t.cart.noAccount}
                        </p>
                        <Link href="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #7c3aed, #6366f1)', color: 'white', borderRadius: '1rem', fontWeight: 600, textDecoration: 'none' }}>
                            {t.cart.browseProducts}
                            <ArrowRight style={{ width: 16, height: 16, transform: locale === 'ar' ? 'rotate(180deg)' : undefined }} />
                        </Link>
                    </div>
                ) : (
                    <div>
                        {/* cart-grid: 2-col desktop, 1-col mobile — see <style> above */}
                        <div className="cart-grid">
                            {/* Cart Items */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {items.map((item, idx) => {
                                    const accent = getProductAccentColor(item.productName);
                                    return (
                                    <div
                                      key={`${item.productId}-${item.variantId}`}
                                      className="card-stagger"
                                      style={{ '--delay': `${idx * 60}ms` } as React.CSSProperties}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                                            {/* Logo — rounded square, matches card design */}
                                            <div style={{ width: 52, height: 52, borderRadius: '22%', overflow: 'hidden', flexShrink: 0, background: `${accent}12`, boxShadow: `0 0 0 1px ${accent}30` }}>
                                                <ProductLogo
                                                    productName={item.productName}
                                                    dbImage={item.productImage ?? null}
                                                    size={52}
                                                    bg="transparent"
                                                />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <h3 style={{ fontWeight: 700, color: C.text, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.productName}</h3>
                                                <p style={{ fontSize: '0.78rem', color: C.textSec, marginTop: '0.15rem' }}>{item.variantTitle}</p>
                                                <p style={{ fontSize: '1rem', fontWeight: 800, color: accent, marginTop: '0.3rem', letterSpacing: '-0.01em' }}>{item.price} {currencySymbol}</p>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <button style={qtyBtn} onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}><Minus style={{ width: 12, height: 12 }} /></button>
                                                <span style={{ fontWeight: 700, color: C.text, width: 24, textAlign: 'center', fontSize: '0.9rem' }}>{item.quantity}</span>
                                                <button style={qtyBtn} onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}><Plus style={{ width: 12, height: 12 }} /></button>
                                                <button onClick={() => removeItem(item.productId, item.variantId)} style={{ padding: 7, background: 'none', border: 'none', cursor: 'pointer', color: C.red, borderRadius: '0.5rem' }}>
                                                    <Trash2 style={{ width: 15, height: 15 }} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>

                            {/* Order Summary */}
                            <div className="cart-summary-sticky">
                                <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: '1rem', padding: '1.5rem' }}>
                                    <h3 style={{ fontWeight: 600, color: C.text, marginBottom: '1rem' }}>{t.cart.orderSummary}</h3>

                                    {/* Items summary */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                                        {items.map(item => (
                                            <div key={`${item.productId}-${item.variantId}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.875rem' }}>
                                                <span style={{ color: C.textSec, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{item.productName} x{item.quantity}</span>
                                                <span style={{ color: C.text, fontWeight: 500, whiteSpace: 'nowrap' }}>{(item.price * item.quantity).toFixed(2)} {currencySymbol}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Coupon */}
                                    <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '0.75rem', marginBottom: '0.75rem' }}>
                                        {appliedCoupon ? (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Tag style={{ width: 16, height: 16, color: C.green }} />
                                                    <span style={{ fontSize: '0.875rem', fontFamily: 'monospace', fontWeight: 700, color: C.green }}>{appliedCoupon.code}</span>
                                                </div>
                                                <button onClick={handleRemoveCoupon} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer' }}><X style={{ width: 16, height: 16, color: C.green }} /></button>
                                            </div>
                                        ) : (
                                            <div>
                                                <div style={{ display: 'flex', borderRadius: '0.75rem', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                                                    <input type="text" placeholder={locale === 'ar' ? 'كود الخصم' : 'Coupon code'} value={couponCode} onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                                                        style={{ flex: 1, minWidth: 0, padding: '0.625rem 0.75rem', background: C.bgLight, color: C.text, border: 'none', outline: 'none', fontSize: '0.875rem', fontFamily: 'monospace', textTransform: 'uppercase' }} />
                                                    <button onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()}
                                                        style={{ padding: '0.625rem 1rem', background: C.accentDim, color: 'white', fontSize: '0.875rem', fontWeight: 500, border: 'none', cursor: 'pointer', flexShrink: 0, opacity: (couponLoading || !couponCode.trim()) ? 0.5 : 1 }}>
                                                        {couponLoading ? '...' : locale === 'ar' ? 'تطبيق' : 'Apply'}
                                                    </button>
                                                </div>
                                                {couponError && <p style={{ fontSize: '0.75rem', color: C.red, marginTop: '0.375rem' }}>{couponError}</p>}
                                            </div>
                                        )}
                                    </div>

                                    {/* Totals */}
                                    <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {appliedCoupon && (
                                            <>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                                    <span style={{ color: C.textSec }}>{locale === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                                                    <span style={{ color: C.textSec }}>{totalPrice.toFixed(2)} {currencySymbol}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                                    <span style={{ color: C.green }}>{locale === 'ar' ? 'الخصم' : 'Discount'}</span>
                                                    <span style={{ color: C.green }}>-{appliedCoupon.discountAmount.toFixed(2)} {currencySymbol}</span>
                                                </div>
                                            </>
                                        )}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 600, color: C.text }}>{t.cart.total}</span>
                                            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: C.text }}>{finalPrice.toFixed(2)} {currencySymbol}</span>
                                        </div>
                                    </div>

                                    {/* Form */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                                        <input
                                            type="text"
                                            placeholder={t.cart.namePlaceholder}
                                            value={customerName}
                                            onChange={e => { setCustomerName(e.target.value); setFormError(''); }}
                                            style={{ ...inputStyle, borderColor: formError && !customerName.trim() ? C.red : undefined }}
                                        />
                                        <input
                                            type="tel"
                                            placeholder={t.cart.phonePlaceholder}
                                            value={customerPhone}
                                            onChange={e => { setCustomerPhone(e.target.value); setFormError(''); }}
                                            style={{ ...inputStyle, borderColor: formError && !customerPhone.trim() ? C.red : undefined }}
                                        />
                                        <textarea
                                            placeholder={t.cart.notesPlaceholder}
                                            value={customerNotes}
                                            onChange={e => setCustomerNotes(e.target.value)}
                                            rows={2}
                                            style={{ ...inputStyle, resize: 'none' as const }}
                                        />
                                    </div>

                                    {/* Inline form error */}
                                    {formError && (
                                        <div style={{ marginBottom: '0.75rem', padding: '0.625rem 0.875rem', borderRadius: '0.625rem', background: C.redBg, border: `1px solid ${C.red}40`, color: C.red, fontSize: '0.82rem', lineHeight: 1.5 }}>
                                            {formError}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleSendOrder}
                                        disabled={sending}
                                        style={{ width: '100%', padding: '1rem', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', borderRadius: '1rem', fontWeight: 700, border: 'none', cursor: sending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9375rem', opacity: sending ? 0.6 : 1, boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}
                                    >
                                        <MessageCircle style={{ width: 20, height: 20 }} />
                                        {sending ? t.cart.sending : t.cart.sendOrder}
                                    </button>

                                    {/* Trust signals */}
                                    <div style={{ marginTop: '0.875rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                                        {[
                                            { emoji: '🟢', text: t.cart.noAccount },
                                            { emoji: '💬', text: t.cart.deliveryInfo },
                                            { emoji: '📋', text: t.cart.orderCodeSaved },
                                            { emoji: '🛡️', text: t.cart.priceGuarantee },
                                        ].map((item, i) => (
                                            <div key={i} style={{
                                                display: 'flex', alignItems: 'flex-start', gap: '0.35rem',
                                                padding: '0.45rem 0.6rem',
                                                background: 'rgba(255,255,255,0.03)',
                                                border: '1px solid rgba(255,255,255,0.06)',
                                                borderRadius: '0.625rem',
                                            }}>
                                                <span style={{ fontSize: '0.75rem', flexShrink: 0, lineHeight: 1.5 }}>{item.emoji}</span>
                                                <span style={{ fontSize: '0.68rem', color: C.textSec, lineHeight: 1.45 }}>{item.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
