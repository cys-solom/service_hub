'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Check, Eye, ShoppingCart, Shield, Star, Search, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import ProductLogo from '@/components/ProductLogo';
import { useCart } from '@/lib/cart-context';
import { useI18n } from '@/lib/i18n';
import { useSettings } from '@/lib/settings-context';
import { Product, ProductVariant } from '@/lib/types';
import { getProductFeatureData, getProductPriority, getProductAccentColor } from '@/lib/product-features';

const DARK_C = {
  text: '#E8E8E8', textSec: '#9a9a9a', textMuted: '#7a7a7a',
  border: 'rgba(255,255,255,0.07)', accent: '#a78bfa',
  green: '#22c55e', surface: '#101010',
};
const LIGHT_C = {
  text: '#0d0f14',
  textSec: '#1f2937',
  textMuted: '#4b5563',
  border: 'rgba(0,0,0,0.09)', accent: '#5b21b6',
  green: '#064e3b', surface: '#ffffff',
};

function getAvailableVariant(product: Product): ProductVariant | null {
  return product.variants?.find((v) => v.isActive && !v.outOfStock && v.price > 0)
    || product.variants?.find((v) => v.isActive && v.price > 0) || null;
}

function getLowestPrice(product: Product) {
  const prices = (product.variants || []).filter((v) => v.isActive && v.price > 0).map((v) => v.price);
  return prices.length > 0 ? Math.min(...prices) : product.basePrice;
}

const MAX_CHIPS = 4; // max variant chips shown on card

function ProductCard({ product, isAr, onAddToCartVariant, isAdded, cardIndex = 0 }: {
  product: Product; isAr: boolean;
  onAddToCartVariant: (p: Product, v: ProductVariant) => void;
  isAdded: boolean; cardIndex?: number;
}) {
  const { displaySymbol, convertForDisplay } = useSettings();
  const currencySymbol = displaySymbol;
  const productName    = isAr && product.nameAr ? product.nameAr : product.name.trim();
  const accentColor    = getProductAccentColor(product.name);
  const featureData    = getProductFeatureData(product.name);
  const activeVariants = useMemo(
    () => (product.variants || [])
      .filter(v => v.isActive && v.price > 0)
      .sort((a, b) => a.price - b.price),
    [product.variants]
  );
  const defaultVariant = activeVariants.find(v => !v.outOfStock) || activeVariants[0] || null;
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(defaultVariant?.id ?? null);

  // Reset selection when product changes
  useEffect(() => {
    setSelectedVariantId(defaultVariant?.id ?? null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  const selectedVariant = activeVariants.find(v => v.id === selectedVariantId) || defaultVariant;
  const canAdd = Boolean(selectedVariant && !selectedVariant.outOfStock && !product.outOfStock);
  const displayPrice = convertForDisplay(selectedVariant?.price ?? getLowestPrice(product));
  const hasWarranty  = product.fullWarranty || product.variants?.some(v => v.warrantyDays > 0);
  const dbFeatures   = isAr && product.featuresAr?.length ? product.featuresAr : product.features;
  const features     = (dbFeatures && dbFeatures.length > 0) ? dbFeatures : ((isAr ? featureData?.ar : featureData?.en) || []);
  const showChips    = activeVariants.length > 1;
  const chipVariants = activeVariants.slice(0, MAX_CHIPS);
  const hasMore      = activeVariants.length > MAX_CHIPS;

  return (
    <article className={`sh-card${product.outOfStock ? ' sh-card--muted' : ''}`} style={{ '--accent': accentColor } as React.CSSProperties}>
      <div className="sh-card-line" style={{ background: accentColor }} />
      <div className="sh-card-body">
        <div className="sh-card-head">
          <div className="sh-logo-wrap">
            <ProductLogo productName={product.name} dbImage={product.images?.[0]} size={44} bg="transparent" lazy={cardIndex > 8} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="sh-card-name">{productName}</h2>
          </div>
          {product.isFeatured && <Star style={{ width: 14, height: 14, color: '#fbbf24', fill: '#fbbf24', flexShrink: 0, alignSelf: 'flex-start' }} />}
        </div>

        {/* Variant quick-select chips */}
        {showChips && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', margin: '0.5rem 0 0.25rem' }}>
            {chipVariants.map(v => {
              const isSelected = v.id === selectedVariantId;
              const isSoldOut  = v.outOfStock;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => !isSoldOut && setSelectedVariantId(v.id)}
                  title={isSoldOut ? (isAr ? 'غير متوفر' : 'Out of stock') : v.title}
                  style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: 99,
                    fontSize: '0.68rem',
                    fontWeight: isSelected ? 700 : 500,
                    lineHeight: 1.6,
                    cursor: isSoldOut ? 'not-allowed' : 'pointer',
                    border: `1px solid ${isSelected ? accentColor : 'rgba(128,128,128,0.25)'}`,
                    background: isSelected ? `${accentColor}22` : 'transparent',
                    color: isSoldOut ? 'rgba(128,128,128,0.45)' : isSelected ? accentColor : 'inherit',
                    opacity: isSoldOut ? 0.5 : 1,
                    textDecoration: isSoldOut ? 'line-through' : 'none',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {v.title}
                </button>
              );
            })}
            {hasMore && (
              <Link
                href={`/product/${product.slug}`}
                style={{ padding: '0.2rem 0.6rem', borderRadius: 99, fontSize: '0.68rem', fontWeight: 500, lineHeight: 1.6, color: accentColor, border: `1px solid ${accentColor}40`, background: `${accentColor}10`, textDecoration: 'none', whiteSpace: 'nowrap' }}
              >
                +{activeVariants.length - MAX_CHIPS}
              </Link>
            )}
          </div>
        )}

        {features.length > 0 && (
          <ul className="sh-features">
            {features.slice(0, 3).map((f, i) => (
              <li key={i} className="sh-feature-row">
                <span className="sh-check" style={{ color: accentColor }}>✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}

        <div style={{ flex: 1 }} />

        <div className="sh-card-foot">
          <div className="sh-price-row">
            <div>
              <span className="sh-price-from">
                {showChips ? (isAr ? 'السعر' : 'Price') : (isAr ? 'من' : 'from')}
              </span>
              <span className="sh-price" style={{ color: accentColor }}>
                {displayPrice > 0 ? `${displayPrice} ${currencySymbol}` : (isAr ? 'تواصل' : 'Contact')}
              </span>
            </div>
            <div className="sh-badges">
              {hasWarranty && <span className="sh-badge sh-badge--green"><Shield style={{ width: 10, height: 10 }} />{isAr ? 'ضمان' : 'Warranty'}</span>}
              {product.outOfStock && <span className="sh-badge sh-badge--red">{isAr ? 'غير متوفر' : 'Out of stock'}</span>}
            </div>
          </div>
          <div className="sh-actions">
            <button
              type="button"
              onClick={() => selectedVariant && onAddToCartVariant(product, selectedVariant)}
              disabled={!canAdd}
              className="sh-btn sh-btn--primary"
              style={{ background: canAdd ? `linear-gradient(135deg, ${accentColor}cc, ${accentColor})` : 'rgba(255,255,255,0.05)', opacity: canAdd ? 1 : 0.45, cursor: canAdd ? 'pointer' : 'not-allowed', boxShadow: canAdd ? `0 4px 14px ${accentColor}40` : 'none' }}
            >
              {isAdded
                ? <><Check style={{ width: 14, height: 14 }} />{isAr ? 'تمت الإضافة' : 'Added!'}</>
                : <><ShoppingCart style={{ width: 14, height: 14 }} />{isAr ? 'أضف للسلة' : 'Add to Cart'}</>}
            </button>
            <Link href={`/product/${product.slug}`} className="sh-btn sh-btn--ghost" title={isAr ? 'التفاصيل' : 'View details'}>
              <Eye style={{ width: 14, height: 14 }} />
              {isAr ? 'تفاصيل' : 'Details'}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ProductsPageClient({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const urlCategorySlug = searchParams.get('category') || '';

  const [addedId,          setAddedId]          = useState<string | null>(null);
  const [search,           setSearch]           = useState('');
  const [activeCategory,   setActiveCategory]   = useState('all');
  const { addItem }  = useCart();
  const { locale, t } = useI18n();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const C = mounted && resolvedTheme === 'light' ? LIGHT_C : DARK_C;
  const isAr          = locale === 'ar';

  /* ── Set initial category from URL slug ── */
  useEffect(() => {
    if (!urlCategorySlug || !products.length) return;
    const match = products.find(p => p.category?.slug === urlCategorySlug);
    if (match?.categoryId) {
      setActiveCategory(match.categoryId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCategorySlug, products.length]);

  /* ── Categories list ── */
  const categories = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of products) {
      if (p.categoryId && p.category?.name) map.set(p.categoryId, p.category.name);
    }
    return Array.from(map.entries());
  }, [products]);

  /* ── Filter ── */
  const filtered = useMemo(() => {
    let list = [...products];

    if (activeCategory !== 'all')
      list = list.filter(p => p.categoryId === activeCategory);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.nameAr && p.nameAr.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => {
      const pa = getProductPriority(a.name), pb = getProductPriority(b.name);
      if (pa !== pb) return pa - pb;
      return (a.displayOrder || 0) - (b.displayOrder || 0);
    });
  }, [products, search, activeCategory]);

  /* ── Group by category ── */
  const groups = useMemo(() => {
    const map = new Map<string, { name: string; products: Product[] }>();
    for (const p of filtered) {
      const catId   = p.categoryId || 'other';
      const catName = p.category?.name || (isAr ? 'أخرى' : 'Other');
      if (!map.has(catId)) map.set(catId, { name: catName, products: [] });
      map.get(catId)!.products.push(p);
    }
    return Array.from(map.values());
  }, [filtered, isAr]);

  const handleAddToCartVariant = useCallback((product: Product, variant: ProductVariant) => {
    if (!variant || product.outOfStock || variant.outOfStock) return;
    addItem({
      productId: product.id, productName: product.name,
      productSlug: product.slug, productImage: product.images?.[0] || '',
      variantId: variant.id, variantTitle: variant.title,
      duration: variant.duration, price: variant.price, quantity: 1,
    });
    setAddedId(product.id);
    window.setTimeout(() => setAddedId(null), 1600);
  }, [addItem]);

  return (
    <div style={{ minHeight: '100vh', maxWidth: '100vw', overflowX: 'hidden', padding: '2.5rem 1.5rem 5rem' }}>
      <div style={{ maxWidth: '1380px', margin: '0 auto' }}>

        {/* Header */}
        <div className="fade-up" style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, color: C.text, marginBottom: '0.25rem', letterSpacing: '-0.025em' }}>
            {t.productsPage.title}
          </h1>
          <p style={{ color: C.textMuted, fontSize: '0.85rem' }}>
            {filtered.length} / {products.length} {isAr ? 'منتج' : 'products'}
          </p>
        </div>

        {/* ── Search + Category Filter ── */}
        <div className="fade-up" style={{ marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

          {/* Search input */}
          <div style={{ position: 'relative', maxWidth: 420 }}>
            <Search style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: C.textMuted, pointerEvents: 'none' }} />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={isAr ? 'ابحث عن منتج...' : 'Search products...'}
              style={{
                width: '100%', padding: '0.65rem 0.875rem 0.65rem 2.5rem',
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 12, color: C.text, fontSize: '0.875rem',
                outline: 'none', fontFamily: 'inherit',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)')}
              onBlur={e => (e.currentTarget.style.borderColor = C.border)}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, padding: 2, display: 'flex' }}>
                <X style={{ width: 14, height: 14 }} />
              </button>
            )}
          </div>

          {/* Category tabs */}
          {categories.length > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[['all', isAr ? 'الكل' : 'All'], ...categories].map(([id, name]) => {
                const active = activeCategory === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveCategory(id as string)}
                    style={{
                      padding: '0.35rem 0.875rem', borderRadius: 99, fontSize: '0.78rem', fontWeight: 600,
                      border: `1px solid ${active ? (mounted && resolvedTheme === 'light' ? 'rgba(91,33,182,0.50)' : 'rgba(139,92,246,0.6)') : C.border}`,
                      background: active ? (mounted && resolvedTheme === 'light' ? 'rgba(91,33,182,0.12)' : 'rgba(139,92,246,0.15)') : 'transparent',
                      color: active ? (mounted && resolvedTheme === 'light' ? '#4c1d95' : '#a78bfa') : C.textSec,
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {name}
                    {id === 'all' && <span style={{ marginLeft: 5, opacity: 0.6, fontSize: '0.72rem' }}>{products.length}</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* No results */}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: C.textMuted }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
            <p style={{ fontSize: '1rem', marginBottom: '0.5rem', color: C.textSec }}>
              {isAr ? 'لا توجد نتائج' : 'No products found'}
            </p>
            <p style={{ fontSize: '0.82rem' }}>
              {isAr ? 'جرّب كلمة بحث مختلفة' : 'Try a different search term'}
            </p>
            {(search || activeCategory !== 'all') && (
              <button onClick={() => { setSearch(''); setActiveCategory('all'); }} style={{ marginTop: '1rem', padding: '0.5rem 1.25rem', borderRadius: 99, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'inherit' }}>
                {isAr ? 'مسح الفلتر' : 'Clear filter'}
              </button>
            )}
          </div>
        )}

        {/* Grouped sections */}
        {groups.map((group) => (
          <div key={group.name} className="fade-up" style={{ marginBottom: '3.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#a78bfa', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{group.name}</h2>
              <div style={{ flex: 1, height: 1, background: 'rgba(139,92,246,0.15)' }} />
              <span style={{ fontSize: '0.75rem', color: '#7a7a7a', fontWeight: 500 }}>{group.products.length} {isAr ? 'منتج' : 'items'}</span>
            </div>
            <div className="products-grid">
              {group.products.map((product, idx) => (
                <div key={product.id} className="card-stagger" style={{ '--delay': `${Math.min(idx * 40, 400)}ms` } as React.CSSProperties}>
                  <ProductCard product={product} isAr={isAr} onAddToCartVariant={handleAddToCartVariant} isAdded={addedId === product.id} cardIndex={idx} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
