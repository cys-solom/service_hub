'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, Eye, ShoppingCart, Shield, Star } from 'lucide-react';
import ProductLogo from '@/components/ProductLogo';
import { useCart } from '@/lib/cart-context';
import { useI18n } from '@/lib/i18n';
import { useSettings } from '@/lib/settings-context';
import { Product, ProductVariant } from '@/lib/types';
import {
  getProductFeatureData,
  getProductPriority,
  getProductAccentColor,
} from '@/lib/product-features';

/* ── Colors ─────────────────────────────────────── */
const C = {
  text: '#E8E8E8',
  textSec: '#686868',
  textMuted: '#484848',
  border: 'rgba(255,255,255,0.07)',
  accent: '#a78bfa',
  green: '#22c55e',
  red: '#f87171',
};

/* ── Helpers ─────────────────────────────────────── */
function getAvailableVariant(product: Product): ProductVariant | null {
  return product.variants?.find((v) => v.isActive && !v.outOfStock && v.price > 0)
    || product.variants?.find((v) => v.isActive && v.price > 0)
    || null;
}

function getLowestPrice(product: Product) {
  const prices = (product.variants || []).filter((v) => v.isActive && v.price > 0).map((v) => v.price);
  return prices.length > 0 ? Math.min(...prices) : product.basePrice;
}

/* ── Category grouping ───────────────────────────── */
interface GroupedProducts {
  name: string;
  nameAr: string;
  products: Product[];
}

function groupByCategory(products: Product[], isAr: boolean): GroupedProducts[] {
  const map = new Map<string, { name: string; nameAr: string; products: Product[] }>();
  for (const p of products) {
    const catId = p.categoryId || 'other';
    const catName = p.category?.name || (isAr ? 'أخرى' : 'Other');
    if (!map.has(catId)) {
      map.set(catId, { name: catName, nameAr: catName, products: [] });
    }
    map.get(catId)!.products.push(p);
  }
  return Array.from(map.values());
}

/* ═══════════════════════════════════════════════════
   PRODUCT CARD
═══════════════════════════════════════════════════ */
function ProductCard({
  product,
  isAr,
  currencySymbol,
  onAddToCart,
  isAdded,
}: {
  product: Product;
  isAr: boolean;
  currencySymbol: string;
  onAddToCart: (product: Product) => void;
  isAdded: boolean;
}) {
  const productName = isAr && product.nameAr ? product.nameAr : product.name.trim();
  const displayPrice = getLowestPrice(product);
  const availableVariant = getAvailableVariant(product);
  const canAdd = Boolean(availableVariant && !product.outOfStock);
  const accentColor = getProductAccentColor(product.name);
  const featureData = getProductFeatureData(product.name);
  const activeVariants = product.variants?.filter(v => v.isActive) || [];

  // Features: use DB features if available, else use our built-in data
  const dbFeatures = isAr && product.featuresAr?.length ? product.featuresAr : product.features;
  const builtinFeatures = isAr ? featureData?.ar : featureData?.en;
  const features = (dbFeatures && dbFeatures.length > 0) ? dbFeatures : (builtinFeatures || []);

  const hasWarranty = product.fullWarranty || product.variants?.some(v => v.warrantyDays > 0);

  // Primary = cheapest available variant
  const primaryVariant = activeVariants.find(v => !v.outOfStock && v.price > 0) || activeVariants[0];

  return (
    <article
      className={`sh-card${product.outOfStock ? ' sh-card--muted' : ''}`}
      style={{ '--accent': accentColor } as React.CSSProperties}
    >
      {/* ── TOP ACCENT LINE ── */}
      <div className="sh-card-line" style={{ background: accentColor }} />

      <div className="sh-card-body">

        {/* ── Header: Logo + (Name + PRIMARY DURATION) ── */}
        <div className="sh-card-head">
          <div className="sh-logo-wrap">
            <ProductLogo
              productName={product.name}
              dbImage={product.images?.[0]}
              size={44}
              bg="transparent"
            />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="sh-card-name">{productName}</h2>

            {/* ★ PRIMARY DURATION — directly under product name */}
            {primaryVariant?.title && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                marginTop: '0.28rem',
                fontSize: '0.68rem',
                fontWeight: 700,
                color: accentColor,
                background: `${accentColor}18`,
                border: `1px solid ${accentColor}40`,
                borderRadius: 20,
                padding: '0.13rem 0.6rem',
                whiteSpace: 'nowrap',
                lineHeight: 1.6,
                gap: '0.3rem',
              }}>
                {primaryVariant.title}
                {primaryVariant.price > 0 && (
                  <span style={{ opacity: 0.8, fontWeight: 600 }}>
                    · {primaryVariant.price} {currencySymbol}
                  </span>
                )}
              </span>
            )}
          </div>

          {product.isFeatured && (
            <Star style={{ width: 14, height: 14, color: '#fbbf24', fill: '#fbbf24', flexShrink: 0, alignSelf: 'flex-start' }} />
          )}
        </div>

        {/* ── Real subscription features ── */}
        {features.length > 0 && (
          <ul className="sh-features">
            {features.slice(0, 4).map((f, i) => (
              <li key={i} className="sh-feature-row">
                <span className="sh-check" style={{ color: accentColor }}>✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}

        {/* ── Spacer ── */}
        <div style={{ flex: 1 }} />

        {/* ── Footer: price + badges + actions ── */}
        <div className="sh-card-foot">
          <div className="sh-price-row">
            <div>
              <span className="sh-price-from">{isAr ? 'من' : 'from'}</span>
              <span className="sh-price" style={{ color: accentColor }}>
                {displayPrice > 0 ? `${displayPrice} ${currencySymbol}` : (isAr ? 'تواصل' : 'Contact')}
              </span>
            </div>

            <div className="sh-badges">
              {hasWarranty && (
                <span className="sh-badge sh-badge--green">
                  <Shield style={{ width: 10, height: 10 }} />
                  {isAr ? 'ضمان' : 'Warranty'}
                </span>
              )}
              {product.outOfStock && (
                <span className="sh-badge sh-badge--red">
                  {isAr ? 'غير متوفر' : 'Out of stock'}
                </span>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="sh-actions">
            <button
              type="button"
              onClick={() => onAddToCart(product)}
              disabled={!canAdd}
              className="sh-btn sh-btn--primary"
              style={{
                background: canAdd
                  ? `linear-gradient(135deg, ${accentColor}cc, ${accentColor})`
                  : 'rgba(255,255,255,0.05)',
                opacity: canAdd ? 1 : 0.45,
                cursor: canAdd ? 'pointer' : 'not-allowed',
                boxShadow: canAdd ? `0 4px 14px ${accentColor}40` : 'none',
              }}
            >
              {isAdded
                ? <><Check style={{ width: 14, height: 14 }} />{isAr ? 'تمت الإضافة' : 'Added!'}</>
                : <><ShoppingCart style={{ width: 14, height: 14 }} />{isAr ? 'أضف للسلة' : 'Add to Cart'}</>
              }
            </button>
            <Link
              href={`/product/${product.slug}`}
              className="sh-btn sh-btn--ghost"
              title={isAr ? 'التفاصيل' : 'View details'}
            >
              <Eye style={{ width: 14, height: 14 }} />
              {isAr ? 'تفاصيل' : 'Details'}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════ */
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState<string | null>(null);
  const { addItem } = useCart();
  const { locale, t } = useI18n();
  const { currencySymbol } = useSettings();
  const isAr = locale === 'ar';

  useEffect(() => {
    let cancelled = false;
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setProducts(data);
      })
      .catch(() => { })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Sort by priority (famous products first), then by displayOrder
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const pa = getProductPriority(a.name);
      const pb = getProductPriority(b.name);
      if (pa !== pb) return pa - pb;
      return (a.displayOrder || 0) - (b.displayOrder || 0);
    });
  }, [products]);

  // Group into categories
  const groups = useMemo(() => groupByCategory(sortedProducts, isAr), [sortedProducts, isAr]);

  const handleAddToCart = (product: Product) => {
    const variant = getAvailableVariant(product);
    if (!variant || product.outOfStock) return;
    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImage: product.images?.[0] || '',
      variantId: variant.id,
      variantTitle: variant.title,
      duration: variant.duration,
      price: variant.price,
      quantity: 1,
    });
    setAddedId(product.id);
    window.setTimeout(() => setAddedId(null), 1600);
  };


  // Skeleton placeholder cards — matches new card design
  const SkeletonCard = () => (
    <div style={{ background: 'linear-gradient(145deg,#101010,#0d0d0d)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 240 }}>
      <div style={{ height: 3, background: 'rgba(139,92,246,0.18)' }} />
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 11, flex: 1 }}>
        {/* Header row */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div className="sk" style={{ width: 44, height: 44, borderRadius: '22%', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="sk" style={{ height: 13, width: '65%', marginBottom: 7, borderRadius: 6 }} />
            <div className="sk" style={{ height: 18, width: '48%', borderRadius: 12 }} />
          </div>
        </div>
        {/* Feature rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[70, 85, 60, 75].map((w, j) => (
            <div key={j} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <div className="sk" style={{ width: 10, height: 10, borderRadius: 3, flexShrink: 0 }} />
              <div className="sk" style={{ height: 11, width: `${w}%`, borderRadius: 5 }} />
            </div>
          ))}
        </div>
        {/* Footer */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="sk" style={{ height: 11, width: '40%', borderRadius: 5 }} />
          <div className="sk" style={{ height: 22, width: '55%', borderRadius: 6 }} />
          <div className="sk" style={{ height: 34, borderRadius: 8 }} />
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', maxWidth: '100vw', overflowX: 'hidden', padding: '2.5rem 1.5rem 5rem' }}>
      <div style={{ maxWidth: '1380px', margin: '0 auto' }}>

        {/* ── Page Header ── */}
        <div className="fade-up" style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, color: C.text, marginBottom: '0.4rem', letterSpacing: '-0.025em' }}>
            {t.productsPage.title}
          </h1>
          <p style={{ color: C.textMuted, fontSize: '0.88rem' }}>
            {loading ? '\u00a0' : `${products.length} ${isAr ? t.categories.products : 'products available'}`}
          </p>
        </div>

        {/* ── Loading skeleton grid ── */}
        {loading && (
          <div className="products-grid">
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ── Grouped sections ── */}
        {!loading && groups.map((group) => (
          <div key={group.name} className="fade-up" style={{ marginBottom: '3.5rem' }}>
            {/* Category heading */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#a78bfa', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {group.name}
              </h2>
              <div style={{ flex: 1, height: 1, background: 'rgba(139,92,246,0.15)' }} />
              <span style={{ fontSize: '0.75rem', color: C.textMuted, fontWeight: 500 }}>
                {group.products.length} {isAr ? 'منتج' : 'items'}
              </span>
            </div>

            {/* Products grid — staggered entrance */}
            <div className="products-grid">
              {group.products.map((product, idx) => (
                <div
                  key={product.id}
                  className="card-stagger"
                  style={{ '--delay': `${Math.min(idx * 40, 400)}ms` } as React.CSSProperties}
                >
                  <ProductCard
                    product={product}
                    isAr={isAr}
                    currencySymbol={currencySymbol}
                    onAddToCart={handleAddToCart}
                    isAdded={addedId === product.id}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
