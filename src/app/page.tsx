'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AnimatedLogo from '@/components/AnimatedLogo';
import ProductLogo from '@/components/ProductLogo';
import {
  ArrowRight, Sparkles, Shield, Zap, Clock, MessageCircle,
  ChevronDown, ChevronUp, Star, Package, CreditCard, Send, Ban, Check,
  Layers, TrendingUp, Grid3X3, Gift, Flame as FlameIcon, X,
  Bot, Palette, Music2, Code2, PenTool, Briefcase, Box, Leaf, Flame,
} from 'lucide-react';
import { Product, Category } from '@/lib/types';
import { useI18n } from '@/lib/i18n';
import { useSettings } from '@/lib/settings-context';
import { getProductFeatureData, getProductAccentColor, getProductPriority } from '@/lib/product-features';

const C = {
  bg: '#141928', bgAlt: '#0d1120', surface: '#1a2035',
  border: '#1f2a3d', borderLight: '#2d3a52',
  text: '#f9fafb', textSec: '#b0b6c3', textMuted: '#848d9e',  /* improved: was #9ca3af / #6b7280 */
  accent: '#a78bfa', accentSolid: '#8b5cf6', accentDim: '#7c3aed',
  green: '#10b981', red: '#ef4444', yellow: '#fbbf24',
  logoBg: '#ffffff',
};

interface BundleTool { productName: string; dbImage: string; }
interface Bundle {
  id: string; title: string; titleAr: string;
  subtitle: string; subtitleAr: string;
  gradient: string; savings: string; savingsAr: string;
  price: number; originalPrice: number;
  tools: BundleTool[]; features: string[]; featuresAr: string[];
  isHot: boolean; isActive: boolean; displayOrder: number;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const { t, locale } = useI18n();
  const { currencySymbol, whatsappPhone, heroStat1Value, heroStat1Label, heroStat2Value, heroStat2Label, heroStat3Value, heroStat3Label } = useSettings();

  const isAr = locale === 'ar';

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then((r) => r.json()).catch(() => []),
      fetch('/api/categories').then((r) => r.json()).catch(() => []),
      fetch('/api/bundles').then((r) => r.json()).catch(() => []),
    ]).then(([prods, cats, buns]) => {
      setProducts(Array.isArray(prods) ? prods : []);
      setCategories(Array.isArray(cats) ? cats : []);
      setBundles(Array.isArray(buns) ? buns : []);
      setLoaded(true);
    });
  }, []);

  const featuredProducts = products.filter((p) => p.isFeatured);
  const featured = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 6);

  const faqs = [
    { q: t.faq.q1, a: t.faq.a1 },
    { q: t.faq.q2, a: t.faq.a2 },
    { q: t.faq.q3, a: t.faq.a3 },
    { q: t.faq.q4, a: t.faq.a4 },
  ];

  function getLowestPrice(product: Product) {
    const prices = (product.variants || []).filter((v) => v.isActive && v.price > 0).map((v) => v.price);
    return prices.length > 0 ? Math.min(...prices) : product.basePrice;
  }

  const sectionTitle: React.CSSProperties = {
    fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
    fontWeight: 800,
    color: C.text,
    marginBottom: '0.75rem',
    textAlign: 'center',
    letterSpacing: '-0.02em',
  };
  const sectionSub: React.CSSProperties = {
    color: C.textSec,
    textAlign: 'center',
    maxWidth: '36rem',
    margin: '0 auto',
    lineHeight: 1.65,
    fontSize: '1rem',
  };

  // ── Bundle Detail Modal ─────────────────────────────────────
  function BundleModal({ bundle }: { bundle: Bundle }) {
    const title    = isAr && bundle.titleAr    ? bundle.titleAr    : bundle.title;
    const subtitle = isAr && bundle.subtitleAr ? bundle.subtitleAr : bundle.subtitle;
    const savings  = isAr && bundle.savingsAr  ? bundle.savingsAr  : bundle.savings;
    const feats    = isAr && bundle.featuresAr?.length ? bundle.featuresAr : bundle.features;
    const glowMatch = bundle.gradient.match(/#([0-9a-f]{6})/i);
    const glowHex   = glowMatch ? glowMatch[0] : '#7c3aed';

    // Match each tool to a product in our loaded products list
    const toolProducts = bundle.tools.map((tool) => {
      const match = products.find((p) =>
        p.name.toLowerCase().includes(tool.productName.toLowerCase().split(' ')[0]) ||
        tool.productName.toLowerCase().includes(p.name.toLowerCase().split(' ')[0])
      );
      return { tool, product: match || null };
    });

    const waText = encodeURIComponent(
      isAr ? `أريد الاشتراك في ${title}` : `I want to subscribe to ${bundle.title}`
    );

    return (
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(16px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
          overflowY: 'auto',
        }}
        onClick={(e) => { if (e.target === e.currentTarget) setSelectedBundle(null); }}
      >
        <div style={{
          width: '100%', maxWidth: 700,
          background: 'linear-gradient(160deg, #0f1117 0%, #0a0a12 100%)',
          border: `1px solid ${glowHex}30`,
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: `0 40px 120px rgba(0,0,0,0.8), 0 0 80px ${glowHex}20`,
          margin: 'auto',
        }}>

          {/* Header band */}
          <div style={{ background: bundle.gradient, padding: '1.75rem 1.75rem 2rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 55%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'rgba(255,255,255,0.07)', borderRadius: '50%', filter: 'blur(50px)' }} />

            {/* Close button */}
            <button
              onClick={() => setSelectedBundle(null)}
              style={{
                position: 'absolute', top: '1rem', right: '1rem',
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(0,0,0,0.3)', border: 'none',
                color: 'white', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(8px)',
              }}
            >
              <X style={{ width: 16, height: 16 }} />
            </button>

            <div style={{ position: 'relative' }}>
              {/* Tool logos row */}
              <div style={{ display: 'flex', gap: 10, marginBottom: '1.25rem' }}>
                {bundle.tools.map((tool, ti) => (
                  <div key={ti} style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.95)',
                    border: '2.5px solid rgba(255,255,255,0.5)',
                    overflow: 'hidden',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                    flexShrink: 0,
                  }}>
                    <ProductLogo productName={tool.productName} dbImage={tool.dbImage} size={44} bg="transparent" />
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.75rem)', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.15 }}>
                    {title}
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', marginTop: '0.4rem', fontWeight: 500 }}>
                    {subtitle}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', flexShrink: 0 }}>
                  {bundle.isHot && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 999, padding: '0.25rem 0.7rem', backdropFilter: 'blur(8px)' }}>
                      <FlameIcon style={{ width: 11, height: 11, color: '#fde68a' }} />
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'white' }}>{isAr ? 'الأكثر مبيعاً' : 'HOT'}</span>
                    </div>
                  )}
                  <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 999, padding: '0.3rem 0.85rem', backdropFilter: 'blur(8px)' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#fde68a' }}>{savings}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Tools / subscriptions detail */}
            <div>
              <h3 style={{ fontSize: '0.72rem', fontWeight: 700, color: '#686868', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.85rem' }}>
                {isAr ? 'الاشتراكات المشمولة' : 'Included Subscriptions'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {toolProducts.map(({ tool, product }, idx) => {
                  const activeVariants = (product?.variants || []).filter((v) => v.isActive && !v.outOfStock && v.price > 0);
                  const productName = (isAr && product?.nameAr) ? product.nameAr : (product?.name || tool.productName);
                  const accentColor = product ? getProductAccentColor(product.name) : glowHex;

                  return (
                    <div key={idx} style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 16,
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}>
                      {/* Product header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                        <div style={{
                          width: 42, height: 42, borderRadius: '22%',
                          background: 'rgba(255,255,255,0.9)',
                          border: `1.5px solid ${accentColor}30`,
                          overflow: 'hidden', flexShrink: 0,
                          boxShadow: `0 4px 12px ${accentColor}20`,
                        }}>
                          <ProductLogo productName={tool.productName} dbImage={tool.dbImage} size={42} bg="transparent" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, color: '#E8E8E8', fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
                            {productName}
                          </div>
                          {product?.descriptionAr || product?.description ? (
                            <div style={{ fontSize: '0.73rem', color: '#686868', marginTop: '0.15rem', lineHeight: 1.4,
                              overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                              {isAr && product.descriptionAr ? product.descriptionAr : product?.description}
                            </div>
                          ) : null}
                        </div>
                        {product && (
                          <Link
                            href={`/product/${product.slug}`}
                            style={{
                              flexShrink: 0, fontSize: '0.72rem', color: accentColor,
                              textDecoration: 'none', fontWeight: 600,
                              display: 'flex', alignItems: 'center', gap: '0.25rem',
                              border: `1px solid ${accentColor}30`,
                              padding: '0.3rem 0.65rem', borderRadius: 8,
                              background: `${accentColor}10`,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {isAr ? 'عرض' : 'View'}
                            <ArrowRight style={{ width: 11, height: 11, transform: isAr ? 'rotate(180deg)' : undefined }} />
                          </Link>
                        )}
                      </div>

                      {/* Variants — durations & prices */}
                      {activeVariants.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {activeVariants.slice(0, 6).map((v) => (
                            <div key={v.id} style={{
                              display: 'flex', alignItems: 'center', gap: '0.4rem',
                              padding: '0.35rem 0.75rem',
                              background: `${accentColor}10`,
                              border: `1px solid ${accentColor}28`,
                              borderRadius: 10,
                            }}>
                              <Clock style={{ width: 11, height: 11, color: accentColor, flexShrink: 0 }} />
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#c0c0c0' }}>{v.title}</span>
                              {v.price > 0 && (
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: accentColor }}>· {v.price} {currencySymbol}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.75rem', color: '#686868', fontStyle: 'italic' }}>
                          {isAr ? 'تواصل للاستفسار عن الأسعار' : 'Contact us for pricing'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bundle features */}
            {feats.length > 0 && (
              <div>
                <h3 style={{ fontSize: '0.72rem', fontWeight: 700, color: '#686868', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.85rem' }}>
                  {isAr ? 'مميزات الباندل' : 'Bundle Highlights'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem' }}>
                  {feats.map((feat, fi) => (
                    <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%',
                        background: `${glowHex}18`, border: `1px solid ${glowHex}35`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <Check style={{ width: 11, height: 11, color: glowHex, strokeWidth: 3 }} />
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price row */}
            {bundle.price > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', background: `${glowHex}10`, border: `1px solid ${glowHex}25`, borderRadius: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.72rem', color: '#686868', marginBottom: '0.25rem' }}>{isAr ? 'سعر الباندل' : 'Bundle Price'}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.6rem', fontWeight: 900, color: glowHex, letterSpacing: '-0.03em' }}>{bundle.price} {currencySymbol}</span>
                    {bundle.originalPrice > 0 && (
                      <span style={{ fontSize: '1rem', color: '#686868', textDecoration: 'line-through' }}>{bundle.originalPrice}</span>
                    )}
                  </div>
                </div>
                <div style={{ background: `${glowHex}20`, border: `1px solid ${glowHex}40`, borderRadius: 10, padding: '0.4rem 0.85rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: glowHex }}>{savings}</span>
                </div>
              </div>
            )}

            {/* CTA */}
            <a
              href={`https://wa.me/${whatsappPhone || '201234567890'}?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                padding: '1rem 1.5rem',
                background: bundle.gradient,
                borderRadius: 14, color: 'white', fontWeight: 800,
                fontSize: '1rem', textDecoration: 'none',
                boxShadow: `0 8px 28px ${glowHex}45`,
                letterSpacing: '-0.01em',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.88'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; }}
            >
              <Gift style={{ width: 18, height: 18 }} />
              {isAr ? 'اطلب الباندل الآن عبر واتساب' : 'Order This Bundle via WhatsApp'}
              <ArrowRight style={{ width: 15, height: 15, transform: isAr ? 'rotate(180deg)' : undefined }} />
            </a>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ overflow: 'hidden' }}>
      {/* Bundle Detail Modal */}
      {selectedBundle && <BundleModal bundle={selectedBundle} />}

      {/* ======== HERO ======== */}
      <section style={{ position: 'relative', minHeight: '92vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 1rem' }}>
        {/* Background glows */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '10%', left: '15%', width: 500, height: 500, background: 'rgba(124,58,237,0.18)', borderRadius: '50%', filter: 'blur(120px)' }} />
          <div style={{ position: 'absolute', bottom: '10%', right: '15%', width: 450, height: 450, background: 'rgba(99,102,241,0.15)', borderRadius: '50%', filter: 'blur(120px)' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 300, height: 300, background: 'rgba(167,139,250,0.08)', borderRadius: '50%', filter: 'blur(100px)' }} />
        </div>

        <div style={{ position: 'relative', maxWidth: '72rem', margin: '0 auto', textAlign: 'center', padding: '0 1rem' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 1.1rem', borderRadius: '9999px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', marginBottom: '2.5rem' }}>
            <AnimatedLogo href="" size="sm" />
          </div>

          {/* Title */}
          <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 4.5rem)', fontWeight: 800, lineHeight: 1.12, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
            <span style={{ color: C.text }}>{t.hero.title.split(' ').slice(0, -2).join(' ')} </span>
            <br />
            <span style={{ background: 'linear-gradient(135deg, #a78bfa, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {t.hero.title.split(' ').slice(-2).join(' ')}
            </span>
          </h1>

          <p style={{ fontSize: '1.1rem', color: C.textSec, maxWidth: '38rem', margin: '0 auto 3rem', lineHeight: 1.7 }}>
            {t.hero.subtitle}
          </p>

          {/* CTA Buttons */}
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
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.2s',
            }}>
              {t.hero.contact}
            </Link>
          </div>

          {/* Stats */}
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
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FEATURED SUBSCRIPTIONS — sh-card style
      ════════════════════════════════════════════ */}
      <section style={{ padding: '5rem 1.25rem', background: '#0a0a0a' }}>
        <div style={{ maxWidth: '1380px', margin: '0 auto' }}>

          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.3rem 0.85rem', borderRadius: 999, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', marginBottom: '0.75rem' }}>
                <Star style={{ width: 12, height: 12, color: '#a78bfa', fill: '#a78bfa' }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a78bfa', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {isAr ? 'الأكثر مبيعاً' : 'Top Picks'}
                </span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 800, color: '#E8E8E8', letterSpacing: '-0.025em', lineHeight: 1.15 }}>
                {t.featured.title}
              </h2>
            </div>
            <Link
              href="/products"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#686868', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.07)', padding: '0.45rem 1rem', borderRadius: 8, background: 'rgba(255,255,255,0.03)', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
            >
              {t.featured.viewAll}
              <ArrowRight style={{ width: 14, height: 14, transform: isAr ? 'rotate(180deg)' : undefined }} />
            </Link>
          </div>

          {/* Cards grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {loaded && featured.length > 0
              ? [...featured].sort((a, b) => getProductPriority(a.name) - getProductPriority(b.name)).map((product) => {
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
                    {/* Brand accent top line */}
                    <div className="sh-card-line" style={{ background: accentColor }} />

                    <div className="sh-card-body">
                      {/* Header: logo + name + PRIMARY DURATION UNDER NAME */}
                      <div className="sh-card-head">
                        <div className="sh-logo-wrap">
                          <ProductLogo productName={product.name} dbImage={product.images?.[0]} size={44} bg="transparent" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 className="sh-card-name">{productName}</h3>
                          {/* ★ PRIMARY DURATION — under the name */}
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

                      {/* Real features */}
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

                      {/* Footer */}
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
                              <span className="sh-badge" style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)' }}>
                                <Star style={{ width: 9, height: 9, fill: '#fbbf24' }} />
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
                <div key={i} style={{ background: 'linear-gradient(145deg,#101010,#0d0d0d)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 14, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 220 }}>
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
          BUNDLES SECTION — Premium curated packages
      ════════════════════════════════════════════ */}
      <section style={{ padding: '5rem 1.25rem', background: '#060608', position: 'relative', overflow: 'hidden' }}>
        {/* Background ambient glows */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '20%', left: '-5%', width: 600, height: 600, background: 'rgba(124,58,237,0.06)', borderRadius: '50%', filter: 'blur(100px)' }} />
          <div style={{ position: 'absolute', bottom: '10%', right: '-5%', width: 500, height: 500, background: 'rgba(16,185,129,0.05)', borderRadius: '50%', filter: 'blur(100px)' }} />
        </div>

        <div style={{ maxWidth: '1380px', margin: '0 auto', position: 'relative' }}>

          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.3rem 0.85rem', borderRadius: 999, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', marginBottom: '0.75rem' }}>
                <Gift style={{ width: 12, height: 12, color: '#fbbf24' }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fbbf24', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {isAr ? 'باقات حصرية' : 'Exclusive Bundles'}
                </span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: '#E8E8E8', letterSpacing: '-0.025em', lineHeight: 1.15 }}>
                {isAr ? 'باندلات اشتراكات مميزة' : 'Premium Subscription Bundles'}
              </h2>
              <p style={{ color: '#686868', fontSize: '0.88rem', marginTop: '0.5rem', maxWidth: '36rem', lineHeight: 1.6 }}>
                {isAr
                  ? 'حزم مختارة بعناية من أفضل الأدوات بسعر موحد مميز — وفّر أكثر، احصل على أكثر'
                  : 'Handpicked tool combinations at special bundle pricing — save more, get more'}
              </p>
            </div>
            <Link
              href="/contact"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#686868', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.07)', padding: '0.45rem 1rem', borderRadius: 8, background: 'rgba(255,255,255,0.03)', whiteSpace: 'nowrap' }}
            >
              {isAr ? 'اطلب باندل مخصص' : 'Custom Bundle'}
              <ArrowRight style={{ width: 14, height: 14, transform: isAr ? 'rotate(180deg)' : undefined }} />
            </Link>
          </div>

          {/* Bundle Cards — from DB */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 16 }}>
            {!loaded
              ? [1, 2, 3, 4].map((i) => (
                  <div key={i} style={{ background: 'linear-gradient(145deg, #111118, #0d0d14)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, minHeight: 320 }} className="skeleton" />
                ))
              : bundles.length === 0
              ? null
              : bundles.map((bundle) => {
                  const bundleTitle   = isAr && bundle.titleAr   ? bundle.titleAr   : bundle.title;
                  const bundleSubtitle = isAr && bundle.subtitleAr ? bundle.subtitleAr : bundle.subtitle;
                  const bundleSavings  = isAr && bundle.savingsAr  ? bundle.savingsAr  : bundle.savings;
                  const bundleFeatures = isAr && bundle.featuresAr?.length ? bundle.featuresAr : bundle.features;

                  // derive glow/border color from gradient first color
                  const glowMatch = bundle.gradient.match(/#([0-9a-f]{6})/i);
                  const glowHex   = glowMatch ? glowMatch[0] : '#7c3aed';

                  return (
                    <div
                      key={bundle.id}
                      onClick={() => setSelectedBundle(bundle)}
                      style={{
                        position: 'relative',
                        background: 'linear-gradient(145deg, #111118, #0d0d14)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 20,
                        overflow: 'hidden',
                        transition: 'all 260ms cubic-bezier(0.34,1.56,0.64,1)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                        e.currentTarget.style.borderColor = `${glowHex}60`;
                        e.currentTarget.style.boxShadow = `0 24px 60px rgba(0,0,0,0.6), 0 8px 24px ${glowHex}40`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Gradient header band */}
                      <div style={{ background: bundle.gradient, padding: '1.4rem 1.5rem 1.6rem', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
                        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, background: 'rgba(255,255,255,0.08)', borderRadius: '50%', filter: 'blur(30px)' }} />

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

                        {/* Tool logos — ProductLogo component */}
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
                              <ProductLogo productName={tool.productName} dbImage={tool.dbImage} size={36} bg="transparent" />
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

                      {/* Body */}
                      <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1 }}>
                        {/* Price if set */}
                        {bundle.price > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: glowHex }}>{bundle.price} {currencySymbol}</span>
                            {bundle.originalPrice > 0 && (
                              <span style={{ fontSize: '0.85rem', color: '#686868', textDecoration: 'line-through' }}>{bundle.originalPrice}</span>
                            )}
                          </div>
                        )}

                        {/* Features */}
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
                              <span style={{ fontSize: '0.78rem', color: '#9ca3af', lineHeight: 1.4 }}>{feat}</span>
                            </li>
                          ))}
                        </ul>

                        <div style={{ flex: 1 }} />

                        {/* CTA — opens detail modal */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedBundle(bundle); }}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            padding: '0.75rem 1.25rem',
                            background: bundle.gradient,
                            borderRadius: 12, color: 'white', fontWeight: 700, fontSize: '0.85rem',
                            border: 'none', cursor: 'pointer',
                            boxShadow: `0 6px 20px ${glowHex}40`,
                            transition: 'opacity 0.15s',
                            width: '100%', fontFamily: 'inherit',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
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

          {/* Bottom note */}
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p style={{ color: '#484848', fontSize: '0.8rem' }}>
              {isAr
                ? '✦ الباندلات متاحة عبر التواصل المباشر — يمكن تخصيص أي باندل حسب احتياجك'
                : '✦ Bundles available via direct contact — all bundles can be fully customized'}
            </p>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════
          BROWSE BY CATEGORY — Visual premium cards
      ════════════════════════════════════════════ */}
      <section style={{ padding: '5rem 1.25rem', background: '#070707' }}>
        <div style={{ maxWidth: '1380px', margin: '0 auto' }}>

          {/* Section header */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.3rem 0.85rem', borderRadius: 999, background: 'rgba(27,222,214,0.08)', border: '1px solid rgba(27,222,214,0.2)', marginBottom: '0.75rem' }}>
              <Grid3X3 style={{ width: 12, height: 12, color: '#1BDED6' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1BDED6', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {isAr ? 'تصفح حسب الفئة' : 'Browse by Category'}
              </span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 800, color: '#E8E8E8', letterSpacing: '-0.025em', lineHeight: 1.15 }}>
              {t.categories.title}
            </h2>
          </div>

          {/* Category cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {loaded && categories.length > 0
              ? categories.map((cat, catIdx) => {
                const catProducts = products.filter((p) => p.categoryId === cat.id);
                const catCount = catProducts.length;

                // Per-category visual identity — SVG icons only, no emojis
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

                // Show up to 4 product logos as preview
                const previewProducts = catProducts.slice(0, 4);

                return (
                  <Link key={cat.id} href={`/products?category=${cat.slug}`} style={{ textDecoration: 'none' }}>
                    <div
                      style={{
                        position: 'relative',
                        background: `${theme.gradient}, linear-gradient(145deg, #101010, #0d0d0d)`,
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 18,
                        padding: '1.5rem',
                        overflow: 'hidden',
                        transition: 'all 220ms cubic-bezier(0.34,1.56,0.64,1)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        minHeight: 180,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)';
                        e.currentTarget.style.borderColor = `${theme.accent}50`;
                        e.currentTarget.style.boxShadow = `0 20px 50px rgba(0,0,0,0.5), 0 6px 20px ${theme.glow}`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Glow orb */}
                      <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, background: theme.glow, borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />

                      {/* Top row: icon + count badge */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div style={{ width: 52, height: 52, borderRadius: 14, background: `${theme.accent}18`, border: `1px solid ${theme.accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 16px ${theme.glow}` }}>
                          <theme.Icon style={{ width: 26, height: 26, color: theme.accent, strokeWidth: 1.75 }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0.25rem 0.65rem', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                          <Layers style={{ width: 11, height: 11, color: '#484848' }} />
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#686868' }}>{catCount}</span>
                        </div>
                      </div>

                      {/* Name + description */}
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#E8E8E8', marginBottom: '0.3rem', letterSpacing: '-0.02em' }}>
                          {cat.name}
                        </h3>
                        <p style={{ fontSize: '0.78rem', color: '#484848', lineHeight: 1.5 }}>
                          {catCount} {isAr ? t.categories.products : 'subscriptions available'}
                        </p>
                      </div>

                      {/* Product logos preview strip */}
                      {previewProducts.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: -6, marginTop: 'auto' }}>
                          {previewProducts.map((p, pi) => (
                            <div
                              key={p.id}
                              style={{
                                width: 30, height: 30, borderRadius: '50%',
                                border: '1.5px solid rgba(255,255,255,0.1)',
                                background: '#0d0d0d',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                overflow: 'hidden',
                                marginLeft: pi > 0 ? -8 : 0,
                                zIndex: previewProducts.length - pi,
                                position: 'relative',
                              }}
                            >
                              <ProductLogo productName={p.name} dbImage={p.images?.[0]} size={30} bg="transparent" />
                            </div>
                          ))}
                          {catCount > 4 && (
                            <div style={{ width: 30, height: 30, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: -8, zIndex: 0, position: 'relative' }}>
                              <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#686868' }}>+{catCount - 4}</span>
                            </div>
                          )}
                          <div style={{ flex: 1 }} />
                          {/* Arrow */}
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
                <div key={i} style={{ background: '#101010', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '1.5rem', minHeight: 180, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
            <h2 style={sectionTitle}>{t.why.title}</h2>
            <p style={sectionSub}>{t.why.subtitle}</p>
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
                style={{
                  background: 'linear-gradient(160deg, #1a2035 0%, #111827 100%)',
                  border: `1px solid ${C.border}`,
                  borderRadius: '1.25rem',
                  padding: '1.75rem',
                  transition: 'all 0.25s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.2), 0 6px 20px ${item.glow}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
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
            <h2 style={sectionTitle}>{t.howTo.title}</h2>
            <p style={sectionSub}>{t.howTo.subtitle}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '2.5rem' }}>
            {[
              { step: '01', icon: Package, title: t.howTo.step1, desc: t.howTo.step1Desc },
              { step: '02', icon: Send, title: t.howTo.step2, desc: t.howTo.step2Desc },
              { step: '03', icon: Sparkles, title: t.howTo.step3, desc: t.howTo.step3Desc },
            ].map((item, idx) => (
              <div key={item.step} style={{ position: 'relative', textAlign: 'center' }}>
                <div style={{ fontSize: '5rem', fontWeight: 900, color: 'rgba(255,255,255,0.03)', position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%) translateY(-0.5rem)', userSelect: 'none', lineHeight: 1 }}>
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
            <h2 style={sectionTitle}>{t.faq.title}</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{
                background: 'linear-gradient(160deg, #1a2035 0%, #111827 100%)',
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
            {/* Background */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #5b21b6, #4338ca, #7c3aed)' }} />
            {/* Decorative orbs */}
            <div style={{ position: 'absolute', top: '-40%', right: '-10%', width: 300, height: 300, background: 'rgba(255,255,255,0.05)', borderRadius: '50%', filter: 'blur(40px)' }} />
            <div style={{ position: 'absolute', bottom: '-40%', left: '-10%', width: 250, height: 250, background: 'rgba(255,255,255,0.04)', borderRadius: '50%', filter: 'blur(40px)' }} />

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
