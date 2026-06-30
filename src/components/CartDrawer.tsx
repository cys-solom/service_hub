'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { X, ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useI18n } from '@/lib/i18n';
import { useSettings } from '@/lib/settings-context';
import { useTheme } from 'next-themes';
import ProductLogo from '@/components/ProductLogo';
import { getProductAccentColor } from '@/lib/product-features';
import { useState } from 'react';

const DARK = {
    bg: '#111114', surface: '#18181b', border: 'rgba(255,255,255,0.08)',
    text: '#f4f4f5', textSec: '#a1a1aa', accent: '#a78bfa',
    red: '#f87171', overlay: 'rgba(0,0,0,0.6)',
};
const LIGHT = {
    bg: '#ffffff', surface: '#f4f5fb', border: 'rgba(0,0,0,0.09)',
    text: '#0d0f14', textSec: '#4b5563', accent: '#5b21b6',
    red: '#dc2626', overlay: 'rgba(0,0,0,0.35)',
};

export default function CartDrawer() {
    const { items, removeItem, updateQuantity, totalPrice, itemCount, isDrawerOpen, closeDrawer } = useCart();
    const { locale } = useI18n();
    const { displaySymbol, convertForDisplay } = useSettings();
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const drawerRef = useRef<HTMLDivElement>(null);
    const isAr = locale === 'ar';

    useEffect(() => { setMounted(true); }, []);
    const C = mounted && resolvedTheme === 'light' ? LIGHT : DARK;

    // Close on Escape key
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDrawer(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [closeDrawer]);

    // Trap focus inside drawer
    useEffect(() => {
        if (isDrawerOpen) drawerRef.current?.focus();
    }, [isDrawerOpen]);

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={closeDrawer}
                style={{
                    position: 'fixed', inset: 0, zIndex: 200,
                    background: C.overlay,
                    backdropFilter: 'blur(4px)',
                    opacity: isDrawerOpen ? 1 : 0,
                    pointerEvents: isDrawerOpen ? 'auto' : 'none',
                    transition: 'opacity 0.25s ease',
                }}
                aria-hidden="true"
            />

            {/* Drawer panel */}
            <div
                ref={drawerRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-label={isAr ? 'سلة التسوق' : 'Shopping cart'}
                style={{
                    position: 'fixed',
                    top: 0,
                    [isAr ? 'left' : 'right']: 0,
                    bottom: 0,
                    zIndex: 201,
                    width: 'min(420px, 100vw)',
                    background: C.bg,
                    borderLeft: isAr ? 'none' : `1px solid ${C.border}`,
                    borderRight: isAr ? `1px solid ${C.border}` : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    transform: isDrawerOpen
                        ? 'translateX(0)'
                        : isAr ? 'translateX(-100%)' : 'translateX(100%)',
                    transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
                    outline: 'none',
                    boxShadow: isDrawerOpen
                        ? (isAr ? '4px 0 40px rgba(0,0,0,0.4)' : '-4px 0 40px rgba(0,0,0,0.4)')
                        : 'none',
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1.125rem 1.25rem',
                    borderBottom: `1px solid ${C.border}`,
                    flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <ShoppingCart style={{ width: 20, height: 20, color: C.accent }} />
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: C.text }}>
                            {isAr ? 'سلة التسوق' : 'Cart'}
                        </span>
                        {itemCount > 0 && (
                            <span style={{
                                background: C.accent, color: '#fff',
                                borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700,
                                padding: '0.1rem 0.5rem', lineHeight: 1.6,
                            }}>
                                {itemCount}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={closeDrawer}
                        aria-label={isAr ? 'إغلاق' : 'Close'}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: C.textSec, padding: '0.375rem', borderRadius: '0.5rem',
                            display: 'flex', alignItems: 'center',
                        }}
                    >
                        <X style={{ width: 20, height: 20 }} />
                    </button>
                </div>

                {/* Items list */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {items.length === 0 ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0', gap: '1rem', color: C.textSec }}>
                            <Package style={{ width: 52, height: 52, opacity: 0.3 }} />
                            <p style={{ fontWeight: 600, color: C.text, fontSize: '0.95rem' }}>
                                {isAr ? 'السلة فارغة' : 'Your cart is empty'}
                            </p>
                            <p style={{ fontSize: '0.8rem', textAlign: 'center', lineHeight: 1.6 }}>
                                {isAr ? 'أضف منتجات لتبدأ طلبك' : 'Add products to start your order'}
                            </p>
                            <button
                                onClick={closeDrawer}
                                style={{
                                    marginTop: '0.5rem', padding: '0.6rem 1.5rem',
                                    borderRadius: 99, background: `${C.accent}20`,
                                    border: `1px solid ${C.accent}40`,
                                    color: C.accent, fontWeight: 700, cursor: 'pointer',
                                    fontSize: '0.85rem',
                                }}
                            >
                                {isAr ? 'تصفح المنتجات' : 'Browse Products'}
                            </button>
                        </div>
                    ) : (
                        items.map((item) => {
                            const accent = getProductAccentColor(item.productName);
                            return (
                                <div
                                    key={`${item.productId}-${item.variantId}`}
                                    style={{
                                        display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                                        padding: '0.875rem',
                                        background: C.surface,
                                        borderRadius: '0.875rem',
                                        border: `1px solid ${C.border}`,
                                    }}
                                >
                                    {/* Logo */}
                                    <div style={{
                                        width: 44, height: 44, borderRadius: '22%',
                                        overflow: 'hidden', flexShrink: 0,
                                        background: `${accent}15`,
                                        boxShadow: `0 0 0 1px ${accent}30`,
                                    }}>
                                        <ProductLogo productName={item.productName} dbImage={item.productImage ?? null} size={44} bg="transparent" />
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontWeight: 700, color: C.text, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {item.productName}
                                        </p>
                                        <p style={{ fontSize: '0.72rem', color: C.textSec, marginTop: '0.1rem' }}>{item.variantTitle}</p>
                                        <p style={{ fontWeight: 800, color: accent, fontSize: '0.9rem', marginTop: '0.25rem' }}>
                                            {convertForDisplay(item.price)} {displaySymbol}
                                        </p>
                                    </div>

                                    {/* Qty + Remove */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
                                        <button
                                            onClick={() => removeItem(item.productId, item.variantId)}
                                            aria-label="Remove"
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.red, padding: '0.2rem', opacity: 0.7 }}
                                        >
                                            <Trash2 style={{ width: 14, height: 14 }} />
                                        </button>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                            <button
                                                onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                                                style={{ width: 26, height: 26, borderRadius: '0.4rem', border: `1px solid ${C.border}`, background: 'none', cursor: 'pointer', color: C.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                <Minus style={{ width: 10, height: 10 }} />
                                            </button>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: C.text, width: 20, textAlign: 'center' }}>{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                                                style={{ width: 26, height: 26, borderRadius: '0.4rem', border: `1px solid ${C.border}`, background: 'none', cursor: 'pointer', color: C.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                <Plus style={{ width: 10, height: 10 }} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer — total + checkout */}
                {items.length > 0 && (
                    <div style={{
                        padding: '1.125rem 1.25rem',
                        borderTop: `1px solid ${C.border}`,
                        flexShrink: 0,
                        background: C.bg,
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <span style={{ color: C.textSec, fontWeight: 600, fontSize: '0.9rem' }}>
                                {isAr ? 'الإجمالي' : 'Total'}
                            </span>
                            <span style={{ fontWeight: 800, fontSize: '1.15rem', color: C.text }}>
                                {convertForDisplay(totalPrice).toFixed(2)} {displaySymbol}
                            </span>
                        </div>
                        <Link
                            href="/cart"
                            onClick={closeDrawer}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: '0.5rem', width: '100%', padding: '0.875rem',
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                color: '#fff', borderRadius: '0.875rem', fontWeight: 700,
                                fontSize: '0.9375rem', textDecoration: 'none',
                                boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
                            }}
                        >
                            {isAr ? 'أكمل الطلب' : 'Checkout'}
                            <ArrowRight style={{ width: 16, height: 16, transform: isAr ? 'rotate(180deg)' : undefined }} />
                        </Link>
                        <button
                            onClick={closeDrawer}
                            style={{
                                marginTop: '0.625rem', width: '100%', padding: '0.625rem',
                                background: 'none', border: `1px solid ${C.border}`,
                                borderRadius: '0.875rem', color: C.textSec,
                                fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500,
                            }}
                        >
                            {isAr ? 'متابعة التسوق' : 'Continue Shopping'}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
