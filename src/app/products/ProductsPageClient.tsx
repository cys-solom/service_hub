'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Check, Eye, ShoppingCart, Shield, Star, Search, X, SlidersHorizontal, ChevronDown, Heart } from 'lucide-react';
import { useWishlist } from '@/lib/wishlist-context';
import { useTheme } from 'next-themes';
import ProductLogo from '@/components/ProductLogo';
import { useCart } from '@/lib/cart-context';
import { useI18n } from '@/lib/i18n';
import { useSettings } from '@/lib/settings-context';
import { Product, ProductVariant } from '@/lib/types';
import { getProductFeatureData, getProductPriority, getProductAccentColor } from '@/lib/product-features';
import { pixel } from '@/lib/pixel';

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

function getWarrantyLabel(product: Product, isAr: boolean): string | null {
  const wType = product.warrantyType || 'none';
  const wDur = product.warrantyDuration || 0;
  if (wType === 'full' || product.fullWarranty) {
    return isAr ? 'ضمان كامل' : 'Full Warranty';
  }
  if (wType === 'months' && wDur > 0) {
    return isAr ? `ضمان ${wDur} أشهر` : `${wDur} Mo Warranty`;
  }
  if (wType === 'days' && wDur > 0) {
    return isAr ? `ضمان ${wDur} يوم` : `${wDur} Day Warranty`;
  }

  // Check variants
  const activeVariants = product.variants?.filter(v => v.isActive) || [];
  const withWarranty = activeVariants.filter(v => (v.warrantyType && v.warrantyType !== 'none') || (v.warrantyDays && v.warrantyDays > 0));
  if (withWarranty.length > 0) {
    const first = withWarranty[0];
    const vType = first.warrantyType || 'none';
    const vDur = first.warrantyDuration || 0;
    const vDays = first.warrantyDays || 0;
    if (vType === 'full') return isAr ? 'ضمان كامل' : 'Full Warranty';
    if (vType === 'months' && vDur > 0) return isAr ? `ضمان ${vDur} أشهر` : `${vDur} Mo Warranty`;
    if (vType === 'days' && vDur > 0) return isAr ? `ضمان ${vDur} يوم` : `${vDur} Day Warranty`;
    if (vDays > 0) return isAr ? `ضمان ${vDays} يوم` : `${vDays} Day Warranty`;
  }

  return null;
}

const MAX_CHIPS = 4; // max variant chips shown on card

function ProductCard({ product, isAr, onAddToCartVariant, isAdded, cardIndex = 0 }: {
  product: Product; isAr: boolean;
  onAddToCartVariant: (p: Product, v: ProductVariant) => void;
  isAdded: boolean; cardIndex?: number;
}) {
  const { displaySymbol, convertForDisplay } = useSettings();
  const { toggle: wishToggle, isWished } = useWishlist();
  const wished = isWished(product.id);
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
  const warrantyLabel = getWarrantyLabel(product, isAr);
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
          <button
            onClick={() => wishToggle({ id: product.id, name: product.name, nameAr: product.nameAr, slug: product.slug, image: product.images?.[0], price: getLowestPrice(product), accentColor })}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', flexShrink: 0, alignSelf: 'flex-start' }}
            title={wished ? (isAr ? 'إزالة من المفضلة' : 'Remove from wishlist') : (isAr ? 'إضافة للمفضلة' : 'Add to wishlist')}
          >
            <Heart style={{ width: 15, height: 15, color: wished ? '#f87171' : 'rgba(128,128,128,0.4)', fill: wished ? '#f87171' : 'none', transition: 'all 0.2s' }} />
          </button>
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
              {warrantyLabel && <span className="sh-badge sh-badge--green"><Shield style={{ width: 10, height: 10 }} />{warrantyLabel}</span>}
              {product.outOfStock && <span className="sh-badge sh-badge--red">{isAr ? 'غير متوفر' : 'Out of stock'}</span>}
              {!product.outOfStock && (product.orderCount || 0) >= 5 && (
                <span className="sh-badge" style={{ background: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}30` }}>
                  🔥 {product.orderCount}+
                </span>
              )}
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

type SortKey = 'default' | 'price_asc' | 'price_desc' | 'popular';

export default function ProductsPageClient({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const urlCategorySlug = searchParams.get('category') || '';

  const [addedId,          setAddedId]          = useState<string | null>(null);
  const [search,           setSearch]           = useState('');
  const [activeCategory,   setActiveCategory]   = useState('all');
  const [sortBy,           setSortBy]           = useState<SortKey>('default');
  const [showFilters,      setShowFilters]      = useState(false);
  const [priceMin,         setPriceMin]         = useState(0);
  const [priceMax,         setPriceMax]         = useState(Infinity);
  const { addItem }  = useCart();
  const { locale, t } = useI18n();
  const { displaySymbol, convertForDisplay } = useSettings();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const C = mounted && resolvedTheme === 'light' ? LIGHT_C : DARK_C;
  const isAr = locale === 'ar';

  /* ── Set initial category from URL slug ── */
  useEffect(() => {
    if (!urlCategorySlug || !products.length) return;
    const match = products.find(p => p.category?.slug === urlCategorySlug);
    if (match?.categoryId) setActiveCategory(match.categoryId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCategorySlug, products.length]);

  /* ── Global price bounds (converted) ── */
  const { globalMin, globalMax } = useMemo(() => {
    const prices = products.flatMap(p =>
      (p.variants || []).filter(v => v.isActive && v.price > 0).map(v => convertForDisplay(v.price))
    ).filter(Boolean);
    return prices.length
      ? { globalMin: Math.floor(Math.min(...prices)), globalMax: Math.ceil(Math.max(...prices)) }
      : { globalMin: 0, globalMax: 10000 };
  }, [products, convertForDisplay]);

  /* ── Init price range once bounds are known ── */
  useEffect(() => {
    setPriceMin(globalMin);
    setPriceMax(globalMax);
  }, [globalMin, globalMax]);

  /* ── Categories list ── */
  const categories = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of products) {
      if (p.categoryId && p.category?.name) map.set(p.categoryId, p.category.name);
    }
    return Array.from(map.entries());
  }, [products]);

  const isPriceFiltered = priceMin > globalMin || priceMax < globalMax;
  const isFiltered = search.trim() || activeCategory !== 'all' || isPriceFiltered || sortBy !== 'default';

  /* ── Filter + Sort ── */
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

    if (isPriceFiltered) {
      list = list.filter(p => {
        const lowest = convertForDisplay(getLowestPrice(p));
        return lowest >= priceMin && lowest <= priceMax;
      });
    }

    return list.sort((a, b) => {
      if (sortBy === 'price_asc')  return getLowestPrice(a) - getLowestPrice(b);
      if (sortBy === 'price_desc') return getLowestPrice(b) - getLowestPrice(a);
      if (sortBy === 'popular')    return (b.orderCount || 0) - (a.orderCount || 0);
      const pa = getProductPriority(a.name), pb = getProductPriority(b.name);
      if (pa !== pb) return pa - pb;
      return (a.displayOrder || 0) - (b.displayOrder || 0);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, search, activeCategory, sortBy, priceMin, priceMax, isPriceFiltered]);

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
    pixel.addToCart(product.name, product.id, variant.price, 'EGP');
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

        {/* ── Search + Filters ── */}
        <div className="fade-up" style={{ marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

          {/* Row 1: Search + Sort + Filter toggle */}
          <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 380 }}>
              <Search style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: C.textMuted, pointerEvents: 'none' }} />
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={isAr ? 'ابحث عن منتج...' : 'Search products...'}
                style={{
                  width: '100%', padding: '0.6rem 0.875rem 0.6rem 2.4rem',
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 10, color: C.text, fontSize: '0.875rem',
                  outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)')}
                onBlur={e => (e.currentTarget.style.borderColor = C.border)}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, padding: 2, display: 'flex' }}>
                  <X style={{ width: 13, height: 13 }} />
                </button>
              )}
            </div>

            {/* Sort dropdown */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortKey)}
                style={{
                  appearance: 'none', padding: '0.6rem 2rem 0.6rem 0.875rem',
                  background: C.surface, border: `1px solid ${sortBy !== 'default' ? 'rgba(139,92,246,0.5)' : C.border}`,
                  borderRadius: 10, color: sortBy !== 'default' ? C.accent : C.textSec,
                  fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer',
                  fontFamily: 'inherit', outline: 'none',
                }}
              >
                <option value="default">{isAr ? 'الترتيب الافتراضي' : 'Default'}</option>
                <option value="price_asc">{isAr ? 'السعر: الأقل أولاً' : 'Price: Low → High'}</option>
                <option value="price_desc">{isAr ? 'السعر: الأعلى أولاً' : 'Price: High → Low'}</option>
                <option value="popular">{isAr ? 'الأكثر مبيعاً' : 'Most Popular'}</option>
              </select>
              <ChevronDown style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: C.textMuted, pointerEvents: 'none' }} />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(f => !f)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.6rem 0.875rem', borderRadius: 10, cursor: 'pointer',
                background: showFilters || isPriceFiltered ? 'rgba(139,92,246,0.15)' : C.surface,
                border: `1px solid ${showFilters || isPriceFiltered ? 'rgba(139,92,246,0.5)' : C.border}`,
                color: showFilters || isPriceFiltered ? C.accent : C.textSec,
                fontSize: '0.8rem', fontWeight: 500, fontFamily: 'inherit', flexShrink: 0,
              }}
            >
              <SlidersHorizontal style={{ width: 13, height: 13 }} />
              {isAr ? 'فلتر السعر' : 'Price Filter'}
              {isPriceFiltered && <span style={{ background: C.accent, color: '#fff', borderRadius: 99, width: 6, height: 6, display: 'inline-block' }} />}
            </button>

            {/* Clear all */}
            {isFiltered && (
              <button
                onClick={() => { setSearch(''); setActiveCategory('all'); setSortBy('default'); setPriceMin(globalMin); setPriceMax(globalMax); setShowFilters(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.6rem 0.75rem', borderRadius: 10, cursor: 'pointer', background: 'transparent', border: `1px solid ${C.border}`, color: C.textMuted, fontSize: '0.78rem', fontFamily: 'inherit', flexShrink: 0 }}
              >
                <X style={{ width: 12, height: 12 }} />
                {isAr ? 'مسح' : 'Clear'}
              </button>
            )}
          </div>

          {/* Price range panel */}
          {showFilters && (
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 420 }}>
              <p style={{ fontSize: '0.78rem', fontWeight: 600, color: C.textSec, margin: 0 }}>
                {isAr ? 'نطاق السعر' : 'Price range'} ({displaySymbol})
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <input
                  type="number"
                  min={globalMin}
                  max={priceMax - 1}
                  value={priceMin}
                  onChange={e => setPriceMin(Math.max(globalMin, Math.min(Number(e.target.value), priceMax - 1)))}
                  style={{ width: '100%', padding: '0.45rem 0.625rem', borderRadius: 8, background: 'transparent', border: `1px solid ${C.border}`, color: C.text, fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none' }}
                />
                <span style={{ color: C.textMuted, fontSize: '0.78rem', flexShrink: 0 }}>—</span>
                <input
                  type="number"
                  min={priceMin + 1}
                  max={globalMax}
                  value={priceMax === Infinity ? globalMax : priceMax}
                  onChange={e => setPriceMax(Math.min(globalMax, Math.max(Number(e.target.value), priceMin + 1)))}
                  style={{ width: '100%', padding: '0.45rem 0.625rem', borderRadius: 8, background: 'transparent', border: `1px solid ${C.border}`, color: C.text, fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none' }}
                />
              </div>
              {/* Visual range bar */}
              <div style={{ position: 'relative', height: 4, background: C.border, borderRadius: 99 }}>
                <div style={{
                  position: 'absolute', height: '100%', borderRadius: 99, background: C.accent,
                  left: `${((priceMin - globalMin) / (globalMax - globalMin)) * 100}%`,
                  right: `${100 - ((Math.min(priceMax === Infinity ? globalMax : priceMax, globalMax) - globalMin) / (globalMax - globalMin)) * 100}%`,
                }} />
              </div>
              <p style={{ fontSize: '0.72rem', color: C.textMuted, margin: 0 }}>
                {filtered.length} {isAr ? 'منتج في هذا النطاق' : 'products in this range'}
              </p>
            </div>
          )}

          {/* Category tabs */}
          {categories.length > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[['all', isAr ? 'الكل' : 'All'], ...categories].map(([id, name]) => {
                const active = activeCategory === id;
                const count = id === 'all' ? products.length : products.filter(p => p.categoryId === id).length;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveCategory(id as string)}
                    style={{
                      padding: '0.35rem 0.875rem', borderRadius: 99, fontSize: '0.78rem', fontWeight: 600,
                      border: `1px solid ${active ? (mounted && resolvedTheme === 'light' ? 'rgba(91,33,182,0.50)' : 'rgba(139,92,246,0.6)') : C.border}`,
                      background: active ? (mounted && resolvedTheme === 'light' ? 'rgba(91,33,182,0.12)' : 'rgba(139,92,246,0.15)') : 'transparent',
                      color: active ? (mounted && resolvedTheme === 'light' ? '#4c1d95' : '#a78bfa') : C.textSec,
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', whiteSpace: 'nowrap',
                    }}
                  >
                    {name}
                    <span style={{ marginInlineStart: 5, opacity: 0.6, fontSize: '0.72rem' }}>{count}</span>
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
            {isFiltered && (
              <button onClick={() => { setSearch(''); setActiveCategory('all'); setSortBy('default'); setPriceMin(globalMin); setPriceMax(globalMax); }} style={{ marginTop: '1rem', padding: '0.5rem 1.25rem', borderRadius: 99, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'inherit' }}>
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
