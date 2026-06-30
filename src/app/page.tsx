'use client';

import { useEffect, useState, useMemo, startTransition, useCallback } from 'react';
import Link from 'next/link';
import AnimatedLogo from '@/components/AnimatedLogo';
import ProductLogo from '@/components/ProductLogo';
import BundleModal from '@/components/BundleModal';
import type { Bundle } from '@/components/BundleModal';
import {
  ArrowRight, Sparkles, Shield, Zap, Clock, MessageCircle,
  ChevronDown, ChevronUp, Star, Package, CreditCard, Send, Check,
  Layers, Grid3X3, Gift, Flame as FlameIcon, X,
  Bot, Palette, Music2, Code2, PenTool, Briefcase, Box, Leaf, Flame,
} from 'lucide-react';
import { Product, Category } from '@/lib/types';
import { useTheme } from 'next-themes';
import { useI18n } from '@/lib/i18n';
import { useSettings } from '@/lib/settings-context';
import { getProductFeatureData, getProductAccentColor, getProductPriority } from '@/lib/product-features';

const DARK_C = {
  bg: '#0d1120', bgAlt: '#06070a', surface: '#141928',
  border: '#1f2a3d', borderLight: '#2d3a52',
  text: '#f9fafb', textSec: '#b0b6c3', textMuted: '#848d9e',
  accent: '#a78bfa', accentSolid: '#8b5cf6', accentDim: '#7c3aed',
  green: '#10b981', red: '#ef4444', yellow: '#fbbf24',
  logoBg: '#ffffff',
};
const LIGHT_C = {
  bg: '#f0f1f8', bgAlt: '#e8eaf4', surface: '#ffffff',
  border: 'rgba(0,0,0,0.09)', borderLight: 'rgba(0,0,0,0.06)',
  text: '#0d0f14',
  textSec: '#1f2937',
  textMuted: '#4b5563',
  accent: '#5b21b6',
  accentSolid: '#4c1d95', accentDim: '#3b0764',
  green: '#064e3b', red: '#7f1d1d', yellow: '#78350f',
  logoBg: '#ede9fe',
};

function getLowestPrice(product: Product) {
  const prices = (product.variants || []).filter((v) => v.isActive && v.price > 0).map((v) => v.price);
  return prices.length > 0 ? Math.min(...prices) : product.basePrice;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const { t, locale } = useI18n();
  const { currencySymbol, whatsappPhone, heroStat1Value, heroStat1Label, heroStat2Value, heroStat2Label, heroStat3Value, heroStat3Label, settingsLoaded } = useSettings();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const C = mounted && resolvedTheme === 'light' ? LIGHT_C : DARK_C;
  const isDark = !mounted || resolvedTheme !== 'light';

  const isAr = locale === 'ar';

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    Promise.all([
      fetch('/api/products', { signal }).then((r) => r.json()).catch(() => []),
      fetch('/api/categories', { signal }).then((r) => r.json()).catch(() => []),
      fetch('/api/bundles', { signal }).then((r) => r.json()).catch(() => []),
    ]).then(([prods, cats, buns]) => {
      startTransition(() => {
        setProducts(Array.isArray(prods) ? prods : []);
        setCategories(Array.isArray(cats) ? cats : []);
        setBundles(Array.isArray(buns) ? buns : []);
        setLoaded(true);
      });
    });

    return () => controller.abort();
  }, []);

  const featured = useMemo(() => {
    const featuredProducts = products.filter((p) => p.isFeatured);
    const list = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 6);
    return [...list].sort((a, b) => getProductPriority(a.name) - getProductPriority(b.name));
  }, [products]);

  const faqs = useMemo(() => [
    { q: t.faq.q1, a: t.faq.a1 },
    { q: t.faq.q2, a: t.faq.a2 },
    { q: t.faq.q3, a: t.faq.a3 },
    { q: t.faq.q4, a: t.faq.a4 },
  ], [t.faq]);

  const closeModal = useCallback(() => setSelectedBundle(null), []);

  return (
    <div style={{ overflow: 'hidden' }}>
      {/* Bundle Detail Modal */}
      {selectedBundle && (
        <BundleModal
          bundle={selectedBundle}
          products={products}
          isAr={isAr}
          currencySymbol={currencySymbol}
          whatsappPhone={whatsappPhone || ''}
          onClose={closeModal}
        />
      )}

      {/* ======== HERO ======== */}
      <section style={{ position: 'relative', minHeight: '92vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 1rem' }}>
        {isDark && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            <div className="glow-orb" style={{ top: '10%', left: '15%', width: 500, height: 500, background: 'rgba(124,58,237,0.18)', filter: 'blur(120px)' }} />
            <div className="glow-orb" style={{ bottom: '10%', right: '15%', width: 450, height: 450, background: 'rgba(99,102,241,0.15)', filter: 'blur(120px)' }} />
            <div className="glow-orb" style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 300, height: 300, background: 'rgba(167,139,250,0.08)', filter: 'blur(100px)' }} />
          </div>
        )}

        <div style={{ position: 'relative', maxWidth: '72rem', margin: '0 auto', textAlign: 'center', padding: '0 1rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 1.1rem', borderRadius: '9999px', background: isDark ? 'rgba(139,92,246,0.1)' : 'rgba(109,40,217,0.08)', border: `1px solid ${isDark ? 'rgba(139,92,246,0.25)' : 'rgba(109,40,217,0.20)'}`, marginBottom: '2.5rem' }}>
            <AnimatedLogo href="" size="sm" />
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 4.5rem)', fontWeight: 800, lineHeight: 1.12, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
            <span style={{ color: C.text }}>{t.hero.title.split(' ').slice(0, -2).join(' ')} </span>
            <br />
            <span style={{ backgroundImage: isDark ? 'linear-gradient(135deg, #a78bfa, #818cf8, #c084fc)' : 'linear-gradient(135deg, #3b0764, #5b21b6, #4c1d95)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {t.hero.title.split(' ').slice(-2).join(' ')}
            </span>
          </h1>

          <p style={{ fontSize: '1.1rem', color: C.textSec, maxWidth: '38rem', margin: '0 auto 3rem', lineHeight: 1.7 }}>
            {t.hero.subtitle}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/products" style={{
              padding: '0.9rem 2rem',
              background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
              color: 'white',
              borderRadius: '1rem',
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 8px 30px rgba(124,58,237,0.4)',
              transition: 'all 0.2s',
            }}>
              {t.hero.cta}
              <ArrowRight style={{ width: 18, height: 18, transform: isAr ? 'rotate(180deg)' : undefined }} />
            </Link>
            <Link href="/contact" style={{
              padding: '0.9rem 2rem',
              borderRadius: '1rem',
              fontWeight: 600,
              fontSize: '1rem',
              border: `1px solid ${C.borderLight}`,
              color: C.text,
              textDecoration: 'none',
              background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.2s',
            }}>
              {t.hero.contact}
            </Link>
          </div>

          {settingsLoaded && heroStat1Value && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', maxWidth: '28rem', margin: '5rem auto 0' }}>
              {[
                { value: heroStat1Value, label: heroStat1Label },
                { value: heroStat2Value, label: heroStat2Label },
                { value: heroStat3Value, label: heroStat3Label },
              ].map((stat, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: C.text, letterSpacing: '-0.02em' }}>{stat.value}</div>
                  <div style={{ fontSize: '0.8rem', color: C.textSec, marginTop: '0.3rem' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FEATURED SUBSCRIPTIONS
      ════════════════════════════════════════════ */}
      <section style={{ padding: '5rem 1.25rem', background: C.bgAlt }}>
        <div style={{ maxWidth: '1380px', margin: '0 auto' }}>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.3rem 0.85rem', borderRadius: 999, background: isDark ? 'rgba(139,92,246,0.10)' : 'rgba(91,33,182,0.10)', border: isDark ? '1px solid rgba(139,92,246,0.20)' : '1px solid rgba(91,33,182,0.28)', marginBottom: '0.75rem' }}>
                <Star style={{ width: 12, height: 12, color: isDark ? '#a78bfa' : '#5b21b6', fill: isDark ? '#a78bfa' : '#5b21b6' }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isDark ? '#a78bfa' : '#5b21b6', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {isAr ? 'الأكثر مبيعاً' : 'Top Picks'}
                </span>
              </div>
              <h2 className="section-title" style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)' }}>
                {t.featured.title}
              </h2>
            </div>
            <Link
              href="/products"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: C.textSec, fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', border: `1px solid ${C.border}`, padding: '0.45rem 1rem', borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
            >
              {t.featured.viewAll}
              <ArrowRight style={{ width: 14, height: 14, transform: isAr ? 'rotate(180deg)' : undefined }} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {loaded && featured.length > 0
              ? featured.map((product) => {
                const productName = isAr && product.nameAr ? product.nameAr : product.name;
                const lowestPrice = getLowestPrice(product);
                const accentColor = getProductAccentColor(product.name);
                const featureData = getProductFeatureData(product.name);
                const dbFeatures = isAr && product.featuresAr?.length ? product.featuresAr : product.features;
                const builtinFeatures = isAr ? featureData?.ar : featureData?.en;
                const features = (dbFeatures && dbFeatures.length > 0) ? dbFeatures : (builtinFeatures || []);
                const hasWarranty = product.fullWarranty || product.variants?.some(v => v.warrantyDays > 0);
                const activeVariants = product.variants?.filter(v => v.isActive) || [];
                const primaryVariant = activeVariants.find(v => !v.outOfStock && v.price > 0) || activeVariants[0];

                return (
                  <article
                    key={product.id}
                    className="sh-card"
                    style={{
                      '--accent': accentColor,
                      opacity: product.outOfStock ? 0.65 : 1,
                    } as React.CSSProperties}
                  >
                    <div className="sh-card-line" style={{ background: accentColor }} />

                    <div className="sh-card-body">
                      <div className="sh-card-head">
                        <div className="sh-logo-wrap">
                          <ProductLogo productName={product.name} dbImage={product.images?.[0]} size={44} bg="transparent" lazy={false} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 className="sh-card-name">{productName}</h3>
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

                      {features.length > 0 && (
                        <ul className="sh-features">
                          {features.slice(0, 4).map((f, i) => (
                            <li key={i} className="sh-feature-row">
                              <span className="sh-check" style={{ color: accentColor }}>✓</span>
                              <span>{f.length > 48 ? f.slice(0, 48) + '…' : f}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      <div style={{ flex: 1 }} />

                      <div className="sh-card-foot">
                        <div className="sh-price-row">
                          <div>
                            <span className="sh-price-from">{isAr ? 'من' : 'from'}</span>
                            <span className="sh-price" style={{ color: accentColor }}>
                              {lowestPrice > 0 ? `${lowestPrice} ${currencySymbol}` : (isAr ? 'تواصل' : 'Contact')}
                            </span>
                          </div>
                          <div className="sh-badges">
                            {hasWarranty && <span className="sh-badge sh-badge--green"><Shield style={{ width: 9, height: 9 }} />{isAr ? 'ضمان' : 'Warranty'}</span>}
                            {product.isFeatured && (
                              <span className="sh-badge" style={{ background: isDark ? 'rgba(251,191,36,0.12)' : 'rgba(180,83,9,0.10)', color: isDark ? '#fbbf24' : '#92400e', border: isDark ? '1px solid rgba(251,191,36,0.25)' : '1px solid rgba(180,83,9,0.28)' }}>
                                <Star style={{ width: 9, height: 9, fill: isDark ? '#fbbf24' : '#92400e' }} />
                                {isAr ? 'مميز' : 'Top'}
                              </span>
                            )}
                          </div>
                        </div>
                        <Link
                          href={`/product/${product.slug}`}
                          className="sh-btn sh-btn--primary"
                          style={{
                            background: `linear-gradient(135deg, ${accentColor}cc, ${accentColor})`,
                            boxShadow: `0 4px 14px ${accentColor}35`,
                            width: '100%',
                          }}
                        >
                          {isAr ? 'اشترك الآن' : 'Subscribe Now'}
                          <ArrowRight style={{ width: 13, height: 13, transform: isAr ? 'rotate(180deg)' : undefined }} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })
              : [1,2,3,4,5,6].map((i) => (
                <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 14, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 220 }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ height: 14, width: '70%', marginBottom: 6 }} />
                      <div className="skeleton" style={{ height: 11, width: '40%' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {[1,2,3].map(j => <div key={j} className="skeleton" style={{ height: 11, width: `${60 + j * 10}%` }} />)}
                  </div>
                  <div className="skeleton" style={{ height: 34, borderRadius: 8, marginTop: 'auto' }} />
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          BUNDLES SECTION
      ════════════════════════════════════════════ */}
      <section style={{ padding: '5rem 1.25rem', background: C.bg, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div className="glow-orb" style={{ top: '20%', left: '-5%', width: 600, height: 600, background: 'rgba(124,58,237,0.06)', filter: 'blur(100px)' }} />
          <div className="glow-orb" style={{ bottom: '10%', right: '-5%', width: 500, height: 500, background: 'rgba(16,185,129,0.05)', filter: 'blur(100px)' }} />
        </div>

        <div style={{ maxWidth: '1380px', margin: '0 auto', position: 'relative' }}>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.3rem 0.85rem', borderRadius: 999, background: isDark ? 'rgba(251,191,36,0.10)' : 'rgba(180,83,9,0.10)', border: isDark ? '1px solid rgba(251,191,36,0.25)' : '1px solid rgba(180,83,9,0.28)', marginBottom: '0.75rem' }}>
                <Gift style={{ width: 12, height: 12, color: isDark ? '#fbbf24' : '#b45309' }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isDark ? '#fbbf24' : '#92400e', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {isAr ? 'باقات حصرية' : 'Exclusive Bundles'}
                </span>
              </div>
              <h2 className="section-title" style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}>
                {isAr ? 'باندلات اشتراكات مميزة' : 'Premium Subscription Bundles'}
              </h2>
              <p style={{ color: C.textSec, fontSize: '0.88rem', marginTop: '0.5rem', maxWidth: '36rem', lineHeight: 1.6 }}>
                {isAr
                  ? 'حزم مختارة بعناية من أفضل الأدوات بسعر موحد مميز — وفّر أكثر، احصل على أكثر'
                  : 'Handpicked tool combinations at special bundle pricing — save more, get more'}
              </p>
            </div>
            <Link
              href="/contact"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: C.textSec, fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', border: `1px solid ${C.border}`, padding: '0.45rem 1rem', borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', whiteSpace: 'nowrap' }}
            >
              {isAr ? 'اطلب باندل مخصص' : 'Custom Bundle'}
              <ArrowRight style={{ width: 14, height: 14, transform: isAr ? 'rotate(180deg)' : undefined }} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 16 }}>
            {!loaded
              ? [1, 2, 3, 4].map((i) => (
                  <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, minHeight: 320 }} className="skeleton" />
                ))
              : bundles.length === 0
              ? null
              : bundles.map((bundle) => {
                  const bundleTitle   = isAr && bundle.titleAr   ? bundle.titleAr   : bundle.title;
                  const bundleSubtitle = isAr && bundle.subtitleAr ? bundle.subtitleAr : bundle.subtitle;
                  const bundleSavings  = isAr && bundle.savingsAr  ? bundle.savingsAr  : bundle.savings;
                  const bundleFeatures = isAr && bundle.featuresAr?.length ? bundle.featuresAr : bundle.features;

                  const glowMatch = bundle.gradient.match(/#([0-9a-f]{6})/i);
                  const glowHex   = glowMatch ? glowMatch[0] : '#7c3aed';

                  return (
                    <div
                      key={bundle.id}
                      onClick={() => setSelectedBundle(bundle)}
                      className="bundle-card"
                      style={{
                        '--card-glow': `${glowHex}60`,
                        '--card-glow-bg': `${glowHex}40`,
                        position: 'relative',
                        background: isDark ? 'linear-gradient(145deg, #111118, #0d0d14)' : C.surface,
                        border: `1px solid ${C.border}`,
                        borderRadius: 20,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                      } as React.CSSProperties}
                    >
                      <div style={{ background: bundle.gradient, padding: '1.4rem 1.5rem 1.6rem', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
                        <div className="glow-orb" style={{ top: -30, right: -30, width: 120, height: 120, background: 'rgba(255,255,255,0.08)', filter: 'blur(30px)' }} />

                        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                          <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                              {bundleTitle}
                            </h3>
                            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.3rem', fontWeight: 500 }}>
                              {bundleSubtitle}
                            </p>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', flexShrink: 0 }}>
                            {bundle.isHot && (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,255,255,0.2)', borderRadius: 999, padding: '0.2rem 0.6rem', backdropFilter: 'blur(8px)' }}>
                                <FlameIcon style={{ width: 10, height: 10, color: '#fde68a' }} />
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'white', letterSpacing: '0.05em' }}>
                                  {isAr ? 'الأكثر مبيعاً' : 'HOT'}
                                </span>
                              </div>
                            )}
                            <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 999, padding: '0.22rem 0.7rem', backdropFilter: 'blur(8px)' }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#fde68a' }}>{bundleSavings}</span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: '1rem' }}>
                          {bundle.tools.slice(0, 4).map((tool, ti) => (
                            <div
                              key={ti}
                              title={tool.productName}
                              style={{
                                width: 36, height: 36, borderRadius: '50%',
                                background: 'rgba(255,255,255,0.95)',
                                border: '2px solid rgba(255,255,255,0.5)',
                                overflow: 'hidden',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
                                flexShrink: 0,
                              }}
                            >
                              <ProductLogo productName={tool.productName} dbImage={tool.dbImage} size={36} bg="transparent" lazy />
                            </div>
                          ))}
                          {bundle.tools.length > 4 && (
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.2)' }}>
                              <span style={{ fontSize: '0.6rem', color: 'white', fontWeight: 700 }}>+{bundle.tools.length - 4}</span>
                            </div>
                          )}
                          <div style={{ flex: 1 }} />
                          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '0.2rem 0.55rem', backdropFilter: 'blur(8px)' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>
                              {bundle.tools.length} {isAr ? 'أدوات' : 'tools'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1 }}>
                        {bundle.price > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: glowHex }}>{bundle.price} {currencySymbol}</span>
                            {bundle.originalPrice > 0 && (
                              <span style={{ fontSize: '0.85rem', color: C.textMuted, textDecoration: 'line-through' }}>{bundle.originalPrice}</span>
                            )}
                          </div>
                        )}

                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {bundleFeatures.slice(0, 4).map((feat, fi) => (
                            <li key={fi} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                              <div style={{
                                width: 18, height: 18, borderRadius: '50%',
                                background: `${glowHex}18`,
                                border: `1px solid ${glowHex}40`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                              }}>
                                <Check style={{ width: 10, height: 10, color: glowHex, strokeWidth: 3 }} />
                              </div>
                              <span style={{ fontSize: '0.78rem', color: C.textSec, lineHeight: 1.4 }}>{feat}</span>
                            </li>
                          ))}
                        </ul>

                        <div style={{ flex: 1 }} />

                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedBundle(bundle); }}
                          className="hover-opacity"
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            padding: '0.75rem 1.25rem',
                            background: bundle.gradient,
                            borderRadius: 12, color: 'white', fontWeight: 700, fontSize: '0.85rem',
                            border: 'none', cursor: 'pointer',
                            boxShadow: `0 6px 20px ${glowHex}40`,
                            width: '100%', fontFamily: 'inherit',
                          }}
                        >
                          <Gift style={{ width: 15, height: 15 }} />
                          {isAr ? 'عرض تفاصيل الباندل' : 'View Bundle Details'}
                          <ArrowRight style={{ width: 13, height: 13, transform: isAr ? 'rotate(180deg)' : undefined }} />
                        </button>
                      </div>
                    </div>
                  );
                })}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p style={{ color: C.textMuted, fontSize: '0.8rem' }}>
              {isAr
                ? '✦ الباندلات متاحة عبر التواصل المباشر — يمكن تخصيص أي باندل حسب احتياجك'
                : '✦ Bundles available via direct contact — all bundles can be fully customized'}
            </p>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════
          BROWSE BY CATEGORY
      ════════════════════════════════════════════ */}
      <section style={{ padding: '5rem 1.25rem', background: C.bgAlt }}>
        <div style={{ maxWidth: '1380px', margin: '0 auto' }}>

          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.3rem 0.85rem', borderRadius: 999, background: isDark ? 'rgba(27,222,214,0.08)' : 'rgba(13,148,136,0.10)', border: isDark ? '1px solid rgba(27,222,214,0.20)' : '1px solid rgba(13,148,136,0.28)', marginBottom: '0.75rem' }}>
              <Grid3X3 style={{ width: 12, height: 12, color: isDark ? '#1BDED6' : '#0f766e' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isDark ? '#1BDED6' : '#0f766e', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {isAr ? 'تصفح حسب الفئة' : 'Browse by Category'}
              </span>
            </div>
            <h2 className="section-title" style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)' }}>
              {t.categories.title}
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {loaded && categories.length > 0
              ? categories.map((cat, catIdx) => {
                const catProducts = products.filter((p) => p.categoryId === cat.id);
                const catCount = catProducts.length;

                type CatTheme = { Icon: React.ElementType; gradient: string; accent: string; glow: string };
                const CAT_THEMES: Record<string, CatTheme> = {
                  'ai-productivity': { Icon: Bot,      gradient: 'linear-gradient(135deg, #7c3aed20, #6366f115)', accent: '#a78bfa', glow: 'rgba(124,58,237,0.15)' },
                  'creative-tools':  { Icon: Palette,  gradient: 'linear-gradient(135deg, #ec489920, #f9731615)', accent: '#f472b6', glow: 'rgba(236,72,153,0.15)' },
                  'entertainment':   { Icon: Music2,   gradient: 'linear-gradient(135deg, #1db95420, #06b6d415)', accent: '#22c55e', glow: 'rgba(29,185,84,0.15)' },
                  'coding':          { Icon: Code2,    gradient: 'linear-gradient(135deg, #3b82f620, #06b6d415)', accent: '#60a5fa', glow: 'rgba(59,130,246,0.15)' },
                  'design':          { Icon: PenTool,  gradient: 'linear-gradient(135deg, #f5930820, #fbbf2415)', accent: '#fb923c', glow: 'rgba(245,147,8,0.15)' },
                  'productivity':    { Icon: Briefcase,gradient: 'linear-gradient(135deg, #0ea5e920, #38bdf815)', accent: '#38bdf8', glow: 'rgba(14,165,233,0.15)' },
                  'office-suite':    { Icon: Briefcase,gradient: 'linear-gradient(135deg, #0ea5e920, #06b6d415)', accent: '#38bdf8', glow: 'rgba(14,165,233,0.15)' },
                };
                const fallbackThemes: CatTheme[] = [
                  { Icon: Box,   gradient: 'linear-gradient(135deg, #7c3aed20, #a855f715)', accent: '#c084fc', glow: 'rgba(124,58,237,0.15)' },
                  { Icon: Leaf,  gradient: 'linear-gradient(135deg, #10b98120, #14b8a615)', accent: '#34d399', glow: 'rgba(16,185,129,0.15)' },
                  { Icon: Flame, gradient: 'linear-gradient(135deg, #f5930820, #ef444415)', accent: '#fb923c', glow: 'rgba(245,147,8,0.15)' },
                ];
                const theme: CatTheme = CAT_THEMES[cat.slug] || fallbackThemes[catIdx % fallbackThemes.length];

                const previewProducts = catProducts.slice(0, 4);

                return (
                  <Link key={cat.id} href={`/products?category=${cat.slug}`} style={{ textDecoration: 'none' }}>
                    <div
                      className="category-card"
                      style={{
                        '--card-glow': `${theme.accent}50`,
                        '--card-glow-bg': theme.glow,
                        position: 'relative',
                        background: isDark ? `${theme.gradient}, linear-gradient(145deg, #101010, #0d0d0d)` : `${theme.gradient}, linear-gradient(145deg, #ffffff, #f8f9fa)`,
                        border: `1px solid ${C.border}`,
                        borderRadius: 18,
                        padding: '1.5rem',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        minHeight: 180,
                      } as React.CSSProperties}
                    >
                      <div className="glow-orb" style={{ top: -20, right: -20, width: 120, height: 120, background: theme.glow, filter: 'blur(40px)' }} />

                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div style={{ width: 52, height: 52, borderRadius: 14, background: `${theme.accent}18`, border: `1px solid ${theme.accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 16px ${theme.glow}` }}>
                          <theme.Icon style={{ width: 26, height: 26, color: theme.accent, strokeWidth: 1.75 }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0.25rem 0.65rem', borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', border: `1px solid ${C.border}` }}>
                          <Layers style={{ width: 11, height: 11, color: C.textMuted }} />
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: C.textSec }}>{catCount}</span>
                        </div>
                      </div>

                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: C.text, marginBottom: '0.3rem', letterSpacing: '-0.02em' }}>
                          {cat.name}
                        </h3>
                        <p style={{ fontSize: '0.78rem', color: C.textMuted, lineHeight: 1.5 }}>
                          {catCount} {isAr ? t.categories.products : 'subscriptions available'}
                        </p>
                      </div>

                      {previewProducts.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: -6, marginTop: 'auto' }}>
                          {previewProducts.map((p, pi) => (
                            <div
                              key={p.id}
                              style={{
                                width: 30, height: 30, borderRadius: '50%',
                                border: `1.5px solid ${C.border}`,
                                background: C.surface,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                overflow: 'hidden',
                                marginLeft: pi > 0 ? -8 : 0,
                                zIndex: previewProducts.length - pi,
                                position: 'relative',
                              }}
                            >
                              <ProductLogo productName={p.name} dbImage={p.images?.[0]} size={30} bg="transparent" lazy />
                            </div>
                          ))}
                          {catCount > 4 && (
                            <div style={{ width: 30, height: 30, borderRadius: '50%', border: `1.5px solid ${C.border}`, background: C.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: -8, zIndex: 0, position: 'relative' }}>
                              <span style={{ fontSize: '0.6rem', fontWeight: 700, color: C.textMuted }}>+{catCount - 4}</span>
                            </div>
                          )}
                          <div style={{ flex: 1 }} />
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: `${theme.accent}15`, border: `1px solid ${theme.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowRight style={{ width: 13, height: 13, color: theme.accent, transform: isAr ? 'rotate(180deg)' : undefined }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })
              : [1,2,3,4].map((i) => (
                <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: '1.5rem', minHeight: 180, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="skeleton" style={{ width: 52, height: 52, borderRadius: 14 }} />
                  <div>
                    <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 12, width: '40%' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 'auto' }}>
                    {[1,2,3].map(j => <div key={j} className="skeleton" style={{ width: 30, height: 30, borderRadius: '50%' }} />)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* ======== WHY CHOOSE US ======== */}
      <section style={{ padding: '6rem 1rem' }}>
        <div style={{ maxWidth: '84rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="section-title" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', textAlign: 'center', marginBottom: '0.75rem' }}>{t.why.title}</h2>
            <p className="section-sub">{t.why.subtitle}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1.25rem' }}>
            {[
              { icon: Shield, title: t.why.authentic, desc: t.why.authenticDesc, gradient: 'linear-gradient(135deg, #10b981, #14b8a6)', glow: 'rgba(16,185,129,0.2)' },
              { icon: Zap, title: t.why.instant, desc: t.why.instantDesc, gradient: 'linear-gradient(135deg, #f59e0b, #f97316)', glow: 'rgba(245,158,11,0.2)' },
              { icon: Clock, title: t.why.support, desc: t.why.supportDesc, gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)', glow: 'rgba(59,130,246,0.2)' },
              { icon: CreditCard, title: t.why.prices, desc: t.why.pricesDesc, gradient: 'linear-gradient(135deg, #8b5cf6, #a855f7)', glow: 'rgba(139,92,246,0.2)' },
            ].map((item) => (
              <div
                key={item.title}
                className="why-card"
                style={{
                  '--card-glow-bg': item.glow,
                  background: isDark ? 'linear-gradient(160deg, #1a2035 0%, #111827 100%)' : C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: '1.25rem',
                  padding: '1.75rem',
                } as React.CSSProperties}
              >
                <div style={{ width: 52, height: 52, borderRadius: '1rem', background: item.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', boxShadow: `0 6px 16px ${item.glow}` }}>
                  <item.icon style={{ width: 26, height: 26, color: 'white' }} />
                </div>
                <h3 style={{ fontWeight: 700, color: C.text, marginBottom: '0.5rem', fontSize: '1rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.875rem', color: C.textSec, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== HOW TO ORDER ======== */}
      <section style={{ padding: '6rem 1rem', background: C.bgAlt }}>
        <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 className="section-title" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', textAlign: 'center', marginBottom: '0.75rem' }}>{t.howTo.title}</h2>
            <p className="section-sub">{t.howTo.subtitle}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '2.5rem' }}>
            {[
              { step: '01', icon: Package, title: t.howTo.step1, desc: t.howTo.step1Desc },
              { step: '02', icon: Send, title: t.howTo.step2, desc: t.howTo.step2Desc },
              { step: '03', icon: Sparkles, title: t.howTo.step3, desc: t.howTo.step3Desc },
            ].map((item, idx) => (
              <div key={item.step} style={{ position: 'relative', textAlign: 'center' }}>
                <div style={{ fontSize: '5rem', fontWeight: 900, color: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)', position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%) translateY(-0.5rem)', userSelect: 'none', lineHeight: 1 }}>
                  {item.step}
                </div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ width: 68, height: 68, borderRadius: '1.25rem', background: 'linear-gradient(135deg, #7c3aed, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 10px 24px rgba(124,58,237,0.3)' }}>
                    <item.icon style={{ width: 32, height: 32, color: 'white' }} />
                  </div>
                  <div style={{ display: 'inline-block', marginBottom: '0.75rem', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 999, padding: '0.2rem 0.7rem' }}>
                    <span style={{ color: C.accent, fontSize: '0.75rem', fontWeight: 700 }}>{isAr ? `الخطوة ${idx + 1}` : `Step ${idx + 1}`}</span>
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: C.text, marginBottom: '0.5rem' }}>{item.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: C.textSec, lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== FAQ ======== */}
      <section style={{ padding: '6rem 1rem' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="section-title" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', textAlign: 'center', marginBottom: '0.75rem' }}>{t.faq.title}</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{
                background: isDark ? 'linear-gradient(160deg, #1a2035 0%, #111827 100%)' : C.surface,
                border: `1px solid ${openFaq === i ? 'rgba(139,92,246,0.5)' : C.border}`,
                borderRadius: '1rem',
                overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.25rem 1.5rem',
                    textAlign: 'start',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: C.text,
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                  }}
                >
                  <span style={{ paddingInlineEnd: '1rem' }}>{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp style={{ width: 18, height: 18, color: C.accent, flexShrink: 0 }} />
                    : <ChevronDown style={{ width: 18, height: 18, color: C.textMuted, flexShrink: 0 }} />}
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 1.5rem 1.5rem' }}>
                    <div style={{ height: 1, background: C.border, marginBottom: '1rem' }} />
                    <p style={{ color: C.textSec, lineHeight: 1.7, fontSize: '0.9rem' }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== CTA ======== */}
      <section style={{ padding: '5rem 1rem 7rem' }}>
        <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
          <div style={{ position: 'relative', borderRadius: '1.75rem', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #5b21b6, #4338ca, #7c3aed)' }} />
            <div className="glow-orb" style={{ top: '-40%', right: '-10%', width: 300, height: 300, background: 'rgba(255,255,255,0.05)', filter: 'blur(40px)' }} />
            <div className="glow-orb" style={{ bottom: '-40%', left: '-10%', width: 250, height: 250, background: 'rgba(255,255,255,0.04)', filter: 'blur(40px)' }} />

            <div style={{ position: 'relative', padding: '4.5rem 2rem', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.12)', borderRadius: 999, padding: '0.3rem 0.9rem', marginBottom: '1.5rem' }}>
                <Sparkles style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.8)' }} />
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.78rem', fontWeight: 600 }}>{isAr ? 'ابدأ الآن' : 'Get Started Today'}</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 800, color: 'white', marginBottom: '1rem', letterSpacing: '-0.02em' }}>{t.cta.title}</h2>
              <p style={{ color: 'rgba(255,255,255,0.75)', maxWidth: '34rem', margin: '0 auto 2.5rem', lineHeight: 1.7, fontSize: '0.95rem' }}>{t.cta.subtitle}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
                <Link href="/products" style={{ padding: '0.9rem 2rem', background: 'white', color: '#7c3aed', borderRadius: '1rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                  <Package style={{ width: 18, height: 18 }} />
                  {t.cta.browse}
                </Link>
                <Link href="/contact" style={{ padding: '0.9rem 2rem', borderRadius: '1rem', fontWeight: 600, border: '2px solid rgba(255,255,255,0.3)', color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.08)' }}>
                  <MessageCircle style={{ width: 18, height: 18 }} />
                  {t.cta.contact}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
