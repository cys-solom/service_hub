'use client';

import React from 'react';
import Link from 'next/link';
import { X, ArrowRight, Clock, Check, Gift } from 'lucide-react';
import { Flame as FlameIcon } from 'lucide-react';
import ProductLogo from '@/components/ProductLogo';
import { getProductAccentColor } from '@/lib/product-features';
import { Product } from '@/lib/types';

interface BundleTool { productName: string; dbImage: string; }
export interface Bundle {
  id: string; title: string; titleAr: string;
  subtitle: string; subtitleAr: string;
  gradient: string; savings: string; savingsAr: string;
  price: number; originalPrice: number;
  tools: BundleTool[]; features: string[]; featuresAr: string[];
  isHot: boolean; isActive: boolean; displayOrder: number;
}

interface BundleModalProps {
  bundle: Bundle;
  products: Product[];
  isAr: boolean;
  currencySymbol: string;
  displaySymbol: string;
  convertForDisplay: (price: number) => number;
  whatsappPhone: string;
  onClose: () => void;
}

function BundleModalInner({ bundle, products, isAr, currencySymbol, displaySymbol, convertForDisplay, whatsappPhone, onClose }: BundleModalProps) {
  const title    = isAr && bundle.titleAr    ? bundle.titleAr    : bundle.title;
  const subtitle = isAr && bundle.subtitleAr ? bundle.subtitleAr : bundle.subtitle;
  const savings  = isAr && bundle.savingsAr  ? bundle.savingsAr  : bundle.savings;
  const feats    = isAr && bundle.featuresAr?.length ? bundle.featuresAr : bundle.features;
  const glowMatch = bundle.gradient.match(/#([0-9a-f]{6})/i);
  const glowHex   = glowMatch ? glowMatch[0] : '#7c3aed';

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
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
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
          <div className="glow-orb" style={{ top: -40, right: -40, width: 200, height: 200, background: 'rgba(255,255,255,0.07)', filter: 'blur(50px)' }} />

          <button
            onClick={onClose}
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
                  <ProductLogo productName={tool.productName} dbImage={tool.dbImage} size={44} bg="transparent" lazy />
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: '22%',
                        background: 'rgba(255,255,255,0.9)',
                        border: `1.5px solid ${accentColor}30`,
                        overflow: 'hidden', flexShrink: 0,
                        boxShadow: `0 4px 12px ${accentColor}20`,
                      }}>
                        <ProductLogo productName={tool.productName} dbImage={tool.dbImage} size={42} bg="transparent" lazy />
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
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: accentColor }}>
                                · {convertForDisplay(v.price)} {displaySymbol}</span>
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

          {bundle.price > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', background: `${glowHex}10`, border: `1px solid ${glowHex}25`, borderRadius: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.72rem', color: '#686868', marginBottom: '0.25rem' }}>{isAr ? 'سعر الباندل' : 'Bundle Price'}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 900, color: glowHex, letterSpacing: '-0.03em' }}>{convertForDisplay(bundle.price)} {displaySymbol}</span>
                  {bundle.originalPrice > 0 && (
                    <span style={{ fontSize: '1rem', color: '#686868', textDecoration: 'line-through' }}>{convertForDisplay(bundle.originalPrice)} {displaySymbol}</span>
                  )}
                </div>
              </div>
              <div style={{ background: `${glowHex}20`, border: `1px solid ${glowHex}40`, borderRadius: 10, padding: '0.4rem 0.85rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: glowHex }}>{savings}</span>
              </div>
            </div>
          )}

          <a
            href={`https://wa.me/${whatsappPhone || '201234567890'}?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover-opacity"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
              padding: '1rem 1.5rem',
              background: bundle.gradient,
              borderRadius: 14, color: 'white', fontWeight: 800,
              fontSize: '1rem', textDecoration: 'none',
              boxShadow: `0 8px 28px ${glowHex}45`,
              letterSpacing: '-0.01em',
            }}
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

export default React.memo(BundleModalInner);
