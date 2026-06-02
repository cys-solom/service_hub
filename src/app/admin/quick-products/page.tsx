'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
    Eye, EyeOff, ShoppingBag, CheckCircle, AlertTriangle,
    Search, Filter, Save, RefreshCw, Zap,
} from 'lucide-react';

/* ── Design tokens — consistent with admin dark theme ── */
const A = {
    bg: '#06070a', surface: '#0f1117', card: '#141928',
    border: 'rgba(255,255,255,0.07)', borderMid: 'rgba(255,255,255,0.12)',
    text: '#E8E8E8', textSec: '#9a9a9a', textMuted: '#7a7a7a',
    accent: '#a78bfa', accentSolid: '#7c3aed', accentBg: 'rgba(139,92,246,0.10)',
    green: '#10b981', greenBg: 'rgba(16,185,129,0.10)', greenBorder: 'rgba(16,185,129,0.20)',
    red: '#f87171', redBg: 'rgba(239,68,68,0.10)',
    amber: '#fbbf24', amberBg: 'rgba(251,191,36,0.10)',
};

/* ── Types ── */
interface QuickVariant {
    id: string;
    title: string;
    duration: string;
    price: number;
    isActive: boolean;
    outOfStock: boolean;
    displayOrder: number;
}

interface QuickProduct {
    id: string;
    name: string;
    nameAr: string;
    isActive: boolean;
    outOfStock: boolean;
    updatedAt: string;
    category: { id: string; name: string } | null;
    variants: QuickVariant[];
}

type FilterMode = 'all' | 'active' | 'hidden' | 'outofstock';

/* ── Toast ── */
interface Toast { id: number; msg: string; type: 'success' | 'error' }

/* ── Inline Toggle ── */
function Toggle({ checked, onChange, colorOn = A.green, label }: {
    checked: boolean; onChange: (v: boolean) => void; colorOn?: string; label: string;
}) {
    return (
        <button
            onClick={() => onChange(!checked)}
            title={label}
            aria-label={label}
            style={{
                width: 42, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                padding: 2, transition: 'background 0.2s',
                background: checked ? colorOn : 'rgba(255,255,255,0.1)',
                position: 'relative', flexShrink: 0,
            }}
        >
            <span style={{
                display: 'block', width: 20, height: 20, borderRadius: '50%', background: '#fff',
                transition: 'transform 0.2s',
                transform: checked ? 'translateX(18px)' : 'translateX(0)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
            }} />
        </button>
    );
}

/* ── Product Row ── */
function ProductRow({
    product,
    onToggleActive,
    onToggleOutOfStock,
    onSavePrice,
}: {
    product: QuickProduct;
    onToggleActive: (id: string, val: boolean) => Promise<void>;
    onToggleOutOfStock: (id: string, val: boolean) => Promise<void>;
    onSavePrice: (productId: string, variantId: string, price: number) => Promise<void>;
}) {
    const [prices, setPrices] = useState<Record<string, string>>(() => {
        const init: Record<string, string> = {};
        for (const v of product.variants) init[v.id] = String(v.price);
        return init;
    });
    const [saving, setSaving] = useState<Record<string, boolean>>({});
    const [saved, setSaved] = useState<Record<string, boolean>>({});
    const [priceError, setPriceError] = useState<Record<string, string>>({});

    const handleSave = async (variantId: string) => {
        const raw = prices[variantId];
        const parsed = parseFloat(raw);
        if (!isFinite(parsed) || parsed < 0) {
            setPriceError(e => ({ ...e, [variantId]: 'Invalid price' }));
            return;
        }
        setPriceError(e => ({ ...e, [variantId]: '' }));
        setSaving(s => ({ ...s, [variantId]: true }));
        await onSavePrice(product.id, variantId, parsed);
        setSaving(s => ({ ...s, [variantId]: false }));
        setSaved(s => ({ ...s, [variantId]: true }));
        setTimeout(() => setSaved(s => ({ ...s, [variantId]: false })), 2500);
    };

    const isHidden = !product.isActive;
    const isOos = product.outOfStock;

    return (
        <div style={{
            background: A.card,
            border: `1px solid ${isHidden ? 'rgba(239,68,68,0.2)' : isOos ? 'rgba(251,191,36,0.2)' : A.border}`,
            borderRadius: 16,
            overflow: 'hidden',
            transition: 'border-color 0.2s',
        }}>
            {/* Accent top line */}
            <div style={{ height: 2, background: isHidden ? A.red : isOos ? A.amber : A.accent }} />

            {/* Product header */}
            <div style={{ padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap' }}>
                {/* Name + Category */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: A.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 260 }}>
                            {product.name}
                        </span>
                        {product.category && (
                            <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: 999, background: A.accentBg, color: A.accent, fontWeight: 600, whiteSpace: 'nowrap' }}>
                                {product.category.name}
                            </span>
                        )}
                        {isHidden && (
                            <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: 999, background: A.redBg, color: A.red, fontWeight: 700 }}>
                                Hidden
                            </span>
                        )}
                        {isOos && (
                            <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: 999, background: A.amberBg, color: A.amber, fontWeight: 700 }}>
                                Out of Stock
                            </span>
                        )}
                    </div>
                    {product.nameAr && (
                        <div style={{ fontSize: '0.75rem', color: A.textMuted, marginTop: 2, direction: 'rtl', textAlign: 'left' }}>
                            {product.nameAr}
                        </div>
                    )}
                </div>

                {/* Active toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        {product.isActive
                            ? <Eye style={{ width: 13, height: 13, color: A.green }} />
                            : <EyeOff style={{ width: 13, height: 13, color: A.red }} />
                        }
                        <span style={{ fontSize: '0.72rem', color: A.textSec }}>
                            {product.isActive ? 'Visible' : 'Hidden'}
                        </span>
                    </div>
                    <Toggle
                        checked={product.isActive}
                        onChange={(v) => onToggleActive(product.id, v)}
                        colorOn={A.green}
                        label={product.isActive ? 'Hide product' : 'Show product'}
                    />
                </div>

                {/* Out of Stock toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <ShoppingBag style={{ width: 13, height: 13, color: isOos ? A.amber : A.textMuted }} />
                        <span style={{ fontSize: '0.72rem', color: A.textSec }}>
                            {isOos ? 'Out of Stock' : 'In Stock'}
                        </span>
                    </div>
                    <Toggle
                        checked={product.outOfStock}
                        onChange={(v) => onToggleOutOfStock(product.id, v)}
                        colorOn={A.amber}
                        label={product.outOfStock ? 'Mark as In Stock' : 'Mark as Out of Stock'}
                    />
                </div>
            </div>

            {/* Variants */}
            {product.variants.length > 0 && (
                <div style={{ borderTop: `1px solid ${A.border}`, padding: '0.625rem 1.25rem 0.875rem' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: A.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>
                        Variants & Prices
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {product.variants.map(v => (
                            <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {/* Variant name */}
                                <span style={{
                                    fontSize: '0.78rem', color: v.isActive ? A.textSec : A.textMuted,
                                    minWidth: 120, flexShrink: 0,
                                    textDecoration: v.outOfStock ? 'line-through' : 'none',
                                }}>
                                    {v.title}
                                    {v.duration && v.duration !== v.title && (
                                        <span style={{ color: A.textMuted, fontSize: '0.68rem', marginLeft: 4 }}>({v.duration})</span>
                                    )}
                                    {!v.isActive && (
                                        <span style={{ marginLeft: 4, fontSize: '0.62rem', color: A.red }}>(inactive)</span>
                                    )}
                                </span>

                                {/* Price input */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={prices[v.id] ?? v.price}
                                        onChange={e => {
                                            setPrices(p => ({ ...p, [v.id]: e.target.value }));
                                            setPriceError(err => ({ ...err, [v.id]: '' }));
                                        }}
                                        onKeyDown={e => { if (e.key === 'Enter') handleSave(v.id); }}
                                        style={{
                                            width: 90, padding: '0.3rem 0.5rem',
                                            background: 'rgba(255,255,255,0.04)',
                                            border: `1px solid ${priceError[v.id] ? A.red : A.border}`,
                                            borderRadius: 8, color: A.text,
                                            fontSize: '0.82rem', outline: 'none',
                                            fontFamily: 'monospace', textAlign: 'right',
                                        }}
                                    />
                                    <button
                                        onClick={() => handleSave(v.id)}
                                        disabled={saving[v.id]}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 4,
                                            padding: '0.3rem 0.65rem', borderRadius: 8,
                                            border: `1px solid ${saved[v.id] ? A.greenBorder : 'rgba(139,92,246,0.2)'}`,
                                            background: saved[v.id] ? A.greenBg : A.accentBg,
                                            color: saved[v.id] ? A.green : A.accent,
                                            fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                                            opacity: saving[v.id] ? 0.6 : 1,
                                            transition: 'all 0.15s', fontFamily: 'inherit',
                                            minWidth: 64, justifyContent: 'center',
                                        }}
                                    >
                                        {saving[v.id] ? (
                                            <span style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block' }}>⟳</span>
                                        ) : saved[v.id] ? (
                                            <><CheckCircle style={{ width: 11, height: 11 }} /> Saved</>
                                        ) : (
                                            <><Save style={{ width: 11, height: 11 }} /> Save</>
                                        )}
                                    </button>
                                    {priceError[v.id] && (
                                        <span style={{ fontSize: '0.7rem', color: A.red }}>
                                            {priceError[v.id]}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Last updated */}
            <div style={{ padding: '0.3rem 1.25rem 0.5rem', borderTop: `1px solid rgba(255,255,255,0.04)` }}>
                <span style={{ fontSize: '0.65rem', color: A.textMuted }}>
                    Updated: {new Date(product.updatedAt).toLocaleString()}
                </span>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════ */
export default function QuickProductsPage() {
    const [products, setProducts] = useState<QuickProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<FilterMode>('all');
    const [toasts, setToasts] = useState<Toast[]>([]);
    const toastIdRef = useRef(0);

    const addToast = useCallback((msg: string, type: 'success' | 'error') => {
        const id = ++toastIdRef.current;
        setToasts(t => [...t, { id, msg, type }]);
        setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
    }, []);

    const loadProducts = useCallback(async () => {
        setLoading(true);
        try {
            const r = await fetch('/api/admin/quick-products', { credentials: 'include' });
            if (!r.ok) throw new Error('Unauthorized');
            const data = await r.json();
            setProducts(data);
        } catch {
            addToast('Failed to load products', 'error');
        }
        setLoading(false);
    }, [addToast]);

    useEffect(() => { loadProducts(); }, [loadProducts]);

    /* ── Handlers ── */
    const handleToggleActive = useCallback(async (productId: string, val: boolean) => {
        // Optimistic update
        setProducts(ps => ps.map(p => p.id === productId ? { ...p, isActive: val } : p));
        try {
            const r = await fetch('/api/admin/quick-products', {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, isActive: val }),
            });
            const data = await r.json();
            if (!r.ok) throw new Error(data.error || 'Update failed');
            if (data.product) {
                setProducts(ps => ps.map(p => p.id === productId ? { ...p, ...data.product } : p));
            }
            addToast(val ? 'Product is now visible in store' : 'Product hidden from store', 'success');
        } catch (e) {
            // Revert
            setProducts(ps => ps.map(p => p.id === productId ? { ...p, isActive: !val } : p));
            addToast(e instanceof Error ? e.message : 'Update failed', 'error');
        }
    }, [addToast]);

    const handleToggleOutOfStock = useCallback(async (productId: string, val: boolean) => {
        setProducts(ps => ps.map(p => p.id === productId ? { ...p, outOfStock: val } : p));
        try {
            const r = await fetch('/api/admin/quick-products', {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, outOfStock: val }),
            });
            const data = await r.json();
            if (!r.ok) throw new Error(data.error || 'Update failed');
            if (data.product) {
                setProducts(ps => ps.map(p => p.id === productId ? { ...p, ...data.product } : p));
            }
            addToast(val ? 'Marked as Out of Stock' : 'Marked as In Stock', 'success');
        } catch (e) {
            setProducts(ps => ps.map(p => p.id === productId ? { ...p, outOfStock: !val } : p));
            addToast(e instanceof Error ? e.message : 'Update failed', 'error');
        }
    }, [addToast]);

    const handleSavePrice = useCallback(async (productId: string, variantId: string, price: number) => {
        const r = await fetch('/api/admin/quick-products', {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, variants: [{ variantId, price }] }),
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Price update failed');
        if (data.product) {
            setProducts(ps => ps.map(p => p.id === productId ? { ...p, ...data.product } : p));
        }
        addToast(`Price updated to ${price}`, 'success');
    }, [addToast]);

    /* ── Filter / Search ── */
    const filtered = products.filter(p => {
        const q = search.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q) || (p.nameAr || '').includes(q) || (p.category?.name || '').toLowerCase().includes(q);
        if (!matchName) return false;
        switch (filter) {
            case 'active':    return p.isActive && !p.outOfStock;
            case 'hidden':    return !p.isActive;
            case 'outofstock': return p.outOfStock;
            default: return true;
        }
    });

    const filterCounts = {
        all:        products.length,
        active:     products.filter(p => p.isActive && !p.outOfStock).length,
        hidden:     products.filter(p => !p.isActive).length,
        outofstock: products.filter(p => p.outOfStock).length,
    };

    const filterButtons: { key: FilterMode; label: string; color?: string }[] = [
        { key: 'all',        label: `All (${filterCounts.all})` },
        { key: 'active',     label: `Active (${filterCounts.active})`,        color: A.green },
        { key: 'hidden',     label: `Hidden (${filterCounts.hidden})`,        color: A.red   },
        { key: 'outofstock', label: `Out of Stock (${filterCounts.outofstock})`, color: A.amber },
    ];

    return (
        <>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            {/* ── Toast container ── */}
            <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: 320 }}>
                {toasts.map(t => (
                    <div key={t.id} style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.75rem 1rem', borderRadius: 12,
                        background: t.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                        border: `1px solid ${t.type === 'success' ? A.greenBorder : 'rgba(239,68,68,0.3)'}`,
                        color: t.type === 'success' ? A.green : A.red,
                        fontSize: '0.82rem', fontWeight: 500,
                        animation: 'slideIn 0.2s ease',
                        backdropFilter: 'blur(12px)',
                    }}>
                        {t.type === 'success'
                            ? <CheckCircle style={{ width: 15, height: 15, flexShrink: 0 }} />
                            : <AlertTriangle style={{ width: 15, height: 15, flexShrink: 0 }} />
                        }
                        {t.msg}
                    </div>
                ))}
            </div>

            {/* ── Page header ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: A.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Zap style={{ width: 15, height: 15, color: A.accent }} />
                        </div>
                        <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: A.text, margin: 0 }}>
                            Quick Products
                        </h1>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: A.textSec, margin: 0 }}>
                        Toggle visibility, stock status, and edit prices — fast daily control.
                    </p>
                </div>
                <button
                    onClick={loadProducts}
                    disabled={loading}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.375rem',
                        padding: '0.5rem 0.875rem', borderRadius: 10, border: `1px solid ${A.border}`,
                        background: 'rgba(255,255,255,0.04)', color: A.textSec,
                        fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit',
                        opacity: loading ? 0.6 : 1,
                    }}
                >
                    <RefreshCw style={{ width: 13, height: 13, animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />
                    Refresh
                </button>
            </div>

            {/* ── Search + Filter ── */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'center' }}>
                {/* Search */}
                <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 360 }}>
                    <Search style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: A.textMuted }} />
                    <input
                        type="text"
                        placeholder="Search by name or category…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            width: '100%', padding: '0.5rem 0.75rem 0.5rem 2rem',
                            background: 'rgba(255,255,255,0.04)', border: `1px solid ${A.border}`,
                            borderRadius: 10, color: A.text, fontSize: '0.85rem', outline: 'none',
                            fontFamily: 'inherit', boxSizing: 'border-box',
                        }}
                    />
                </div>

                {/* Filter chips */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                    <Filter style={{ width: 13, height: 13, color: A.textMuted }} />
                    {filterButtons.map(b => (
                        <button
                            key={b.key}
                            onClick={() => setFilter(b.key)}
                            style={{
                                padding: '0.35rem 0.75rem', borderRadius: 999,
                                border: filter === b.key
                                    ? `1px solid ${b.color ? b.color + '40' : A.accent + '40'}`
                                    : '1px solid transparent',
                                cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                                fontFamily: 'inherit', transition: 'all 0.15s',
                                background: filter === b.key
                                    ? (b.color ? `${b.color}20` : A.accentBg)
                                    : 'rgba(255,255,255,0.05)',
                                color: filter === b.key
                                    ? (b.color || A.accent)
                                    : A.textSec,
                            }}
                        >
                            {b.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Product list ── */}
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="sk" style={{ height: 100, borderRadius: 16 }} />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', color: A.textSec }}>
                    <Zap style={{ width: 32, height: 32, color: A.textMuted, margin: '0 auto 0.75rem' }} />
                    <p style={{ margin: 0 }}>{products.length === 0 ? 'No products found.' : 'No products match your filter.'}</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ fontSize: '0.72rem', color: A.textMuted, marginBottom: '0.25rem' }}>
                        Showing {filtered.length} of {products.length} products
                    </div>
                    {filtered.map(p => (
                        <ProductRow
                            key={p.id}
                            product={p}
                            onToggleActive={handleToggleActive}
                            onToggleOutOfStock={handleToggleOutOfStock}
                            onSavePrice={handleSavePrice}
                        />
                    ))}
                </div>
            )}
        </>
    );
}
