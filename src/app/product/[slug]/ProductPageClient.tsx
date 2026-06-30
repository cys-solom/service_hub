'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Check, ShoppingCart, MessageCircle,
  Plus, Minus, Ban, Tag, X, Shield, Star, ExternalLink,
} from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { Product, ProductVariant, WarrantyOption } from '@/lib/types';
import { buildWhatsAppMessage, generateWhatsAppUrl, openWhatsApp } from '@/lib/whatsapp';
import { useI18n } from '@/lib/i18n';
import { useSettings } from '@/lib/settings-context';
import ProductLogo from '@/components/ProductLogo';
import { getProductFeatureData, getProductAccentColor } from '@/lib/product-features';

const DARK_D = {
  bg: '#0d0d0d', surface: '#101010', surfaceUp: '#141414',
  border: 'rgba(255,255,255,0.07)', borderMid: 'rgba(255,255,255,0.10)',
  text: '#E8E8E8', textSec: '#9a9a9a', textMuted: '#7a7a7a',
  green: '#22c55e', greenBg: 'rgba(34,197,94,0.10)', greenBorder: 'rgba(34,197,94,0.20)',
  red: '#f87171', redBg: 'rgba(248,113,113,0.10)', yellow: '#fbbf24',
};
const LIGHT_D = {
  bg: '#f0f1f8', surface: '#ffffff', surfaceUp: '#f8f8ff',
  border: 'rgba(0,0,0,0.09)', borderMid: 'rgba(0,0,0,0.13)',
  text: '#0d0f14',
  textSec: '#1f2937',
  textMuted: '#4b5563',
  green: '#064e3b', greenBg: 'rgba(5,150,105,0.10)', greenBorder: 'rgba(5,150,105,0.25)',
  red: '#7f1d1d', redBg: 'rgba(220,38,38,0.08)', yellow: '#78350f',
};

type RelatedProduct = { id: string; name: string; nameAr?: string; slug: string; images: string[]; lowestPrice: number | null };

export default function ProductPageClient({ product, relatedProducts = [] }: { product: Product; relatedProducts?: RelatedProduct[] }) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const D = mounted && resolvedTheme === 'light' ? LIGHT_D : DARK_D;
  const { addItem } = useCart();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    () => product.variants?.find((v) => !v.outOfStock) || product.variants?.[0] || null
  );
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedWarrantyIndex, setSelectedWarrantyIndex] = useState(-1);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string; discount: number; isPercent: boolean; discountAmount: number;
  } | null>(null);

  const { t, locale } = useI18n();
  const { currencySymbol, currency, whatsappPhone, displaySymbol: sym, convertForDisplay: cvt } = useSettings();
  const isAr = locale === 'ar';

  /* ── Derived values ── */
  const accentColor = getProductAccentColor(product.name);
  const featureData = getProductFeatureData(product.name);

  const currentPrice = selectedVariant?.price || product.basePrice || 0;
  const rawWo = product.warrantyOptions;
  const warrantyOptions: WarrantyOption[] = Array.isArray(rawWo)
    ? rawWo
    : (typeof rawWo === 'string' ? (() => { try { return JSON.parse(rawWo as unknown as string); } catch { return []; } })() : []);
  const selectedWarranty = selectedWarrantyIndex >= 0 ? warrantyOptions[selectedWarrantyIndex] : null;
  const warrantyPrice = selectedWarranty?.price || 0;
  const subtotal = (currentPrice * quantity) + warrantyPrice;
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const finalPrice = Math.max(0, subtotal - discountAmount);
  const isOutOfStock = product.outOfStock || false;
  const isSelectedVariantOutOfStock = selectedVariant?.outOfStock || false;
  const canPurchase = !isOutOfStock && !isSelectedVariantOutOfStock;
  const plansCount = product.variants?.filter(v => v.isActive)?.length || 1;

  useEffect(() => {
    if (appliedCoupon) {
      const newSubtotal = currentPrice * quantity;
      const newDiscount = appliedCoupon.isPercent
        ? (newSubtotal * appliedCoupon.discount) / 100
        : appliedCoupon.discount;
      setAppliedCoupon(prev => prev ? { ...prev, discountAmount: Math.min(newDiscount, newSubtotal) } : null);
    }
  }, [currentPrice, quantity]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true); setCouponError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, orderTotal: subtotal }),
      });
      const data = await res.json();
      if (!res.ok) setCouponError(data.error || 'Invalid coupon');
      else setAppliedCoupon({ code: data.coupon.code, discount: data.coupon.discount, isPercent: data.coupon.isPercent, discountAmount: data.discountAmount });
      setCouponCode('');
    } catch { setCouponError('Failed to validate coupon'); }
    setCouponLoading(false);
  };
  const handleRemoveCoupon = () => { setAppliedCoupon(null); setCouponCode(''); setCouponError(''); };

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addItem({ productId: product.id, productName: product.name, productSlug: product.slug, productImage: product.images?.[0] || '', variantId: selectedVariant.id, variantTitle: selectedVariant.title, duration: selectedVariant.duration, price: selectedVariant.price, quantity });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWhatsAppOrder = async () => {
    if (!selectedVariant) return;
    if (!customerName || !customerPhone) { setShowOrderForm(true); return; }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail: customerEmail.trim() || undefined,
          items: [{
            productId:     product.id,
            variantId:     selectedVariant.id,
            productName:   product.name,
            variant:       selectedVariant.title,
            quantity,
            warrantyIndex: selectedWarrantyIndex,
          }],
          couponCode: appliedCoupon?.code || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCouponError(data.error || (isAr ? 'حدث خطأ. حاول مرة أخرى.' : 'An error occurred. Please try again.'));
        return;
      }

      const trustedItems = Array.isArray(data.items) ? data.items : [{
        productName: product.name,
        variant:     selectedVariant.title,
        price:       selectedVariant.price,
        quantity,
      }];
      const trustedTotal = typeof data.total === 'number' ? data.total : finalPrice;
      const orderCode    = data.orderCode;

      const message = buildWhatsAppMessage({
        orderCode,
        customerName,
        customerPhone,
        items: trustedItems.map((i: { productName: string; variant: string; price: number; quantity: number }) => ({
          productName: i.productName,
          variant:     i.variant,
          price:       i.price,
          quantity:    i.quantity,
        })),
        totalPrice: trustedTotal,
        currency:   currency || 'EGP',
        locale,
      });

      openWhatsApp(generateWhatsAppUrl(whatsappPhone, message));
      setTimeout(() => router.push(`/thank-you?code=${orderCode}`), 500);

    } catch (err) {
      console.error('Failed to place order', err);
      setCouponError(isAr ? 'فشل إرسال الطلب. تحقق من الاتصال.' : 'Failed to send order. Check your connection.');
    }
  };

  const productName = isAr && product.nameAr ? product.nameAr : product.name;
  const productDesc = isAr && product.descriptionAr ? product.descriptionAr : product.description;
  const dbFeatures = isAr && product.featuresAr?.length ? product.featuresAr : product.features;
  const builtinFeatures = isAr ? featureData?.ar : featureData?.en;
  const features = (dbFeatures && dbFeatures.length > 0) ? dbFeatures : (builtinFeatures || []);

  const inputSt: React.CSSProperties = {
    width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem',
    border: `1px solid ${D.border}`, background: D.surfaceUp,
    color: D.text, outline: 'none', fontSize: '0.875rem', fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  };

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ minHeight: '100vh', padding: '0 1rem 6rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          {/* Back breadcrumb */}
          <div style={{ padding: '1.75rem 0 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => router.back()}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: D.textSec, fontSize: '0.85rem', fontFamily: 'inherit', padding: 0 }}
            >
              <ArrowLeft style={{ width: 15, height: 15, transform: isAr ? 'rotate(180deg)' : undefined }} />
              {t.product.backToProducts}
            </button>
            <span style={{ color: D.textMuted, fontSize: '0.75rem' }}>›</span>
            <span style={{ color: D.textMuted, fontSize: '0.75rem' }}>{productName}</span>
          </div>

          <div className="pdp-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,380px)', gap: '1.5rem', alignItems: 'start' }}>

            {/* LEFT PANEL */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Hero card */}
              <div style={{
                background: `linear-gradient(145deg, ${D.surface}, ${D.bg})`,
                border: `1px solid ${D.border}`,
                borderRadius: 20,
                overflow: 'hidden',
                position: 'relative',
              }}>
                <div style={{ height: 3, background: accentColor, opacity: 0.9 }} />
                <div style={{
                  position: 'absolute', top: 0, right: 0,
                  width: 280, height: 280,
                  background: `radial-gradient(ellipse at top right, ${accentColor}12 0%, transparent 65%)`,
                  pointerEvents: 'none',
                }} />

                <div style={{ padding: '2rem', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div style={{
                      width: 96, height: 96, borderRadius: '22%', overflow: 'hidden', flexShrink: 0,
                      background: `${accentColor}10`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 0 0 1.5px ${accentColor}30, 0 8px 32px rgba(0,0,0,0.4), 0 0 40px ${accentColor}18`,
                    }}>
                      <ProductLogo productName={product.name} dbImage={product.images?.[0]} size={96} bg="transparent" />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      {product.category?.name && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '0.22rem 0.75rem', borderRadius: 999,
                          fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                          background: `${accentColor}18`, color: accentColor,
                          border: `1px solid ${accentColor}30`, marginBottom: '0.6rem',
                        }}>
                          {product.category.name}
                        </span>
                      )}

                      <h1 style={{ fontSize: 'clamp(1.3rem, 3.5vw, 1.85rem)', fontWeight: 800, color: D.text, marginBottom: '0.6rem', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
                        {productName}
                      </h1>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} style={{ width: 13, height: 13, fill: '#fbbf24', color: '#fbbf24' }} />
                          ))}
                          <span style={{ fontSize: '0.75rem', color: D.textSec, marginLeft: 4 }}>4.9</span>
                        </div>
                        {isOutOfStock ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.18rem 0.6rem', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700, background: D.redBg, color: D.red, border: `1px solid ${D.red}30` }}>
                            <Ban style={{ width: 10, height: 10 }} /> {isAr ? 'غير متوفر' : 'Out of Stock'}
                          </span>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.18rem 0.6rem', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700, background: D.greenBg, color: D.green, border: `1px solid ${D.greenBorder}` }}>
                            <Check style={{ width: 10, height: 10 }} /> {isAr ? 'متوفر' : 'In Stock'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {productDesc && (
                    <p style={{ color: D.textSec, lineHeight: 1.75, fontSize: '0.88rem', borderTop: `1px solid ${D.border}`, paddingTop: '1.25rem' }}>
                      {productDesc}
                    </p>
                  )}
                </div>
              </div>

              {/* Features */}
              {features.length > 0 && (
                <div style={{ background: `linear-gradient(145deg, ${D.surface}, ${D.bg})`, border: `1px solid ${D.border}`, borderRadius: 20, padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: `${accentColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check style={{ width: 14, height: 14, color: accentColor }} />
                    </div>
                    <h2 style={{ fontSize: '0.82rem', fontWeight: 700, color: D.textSec, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {t.product.features}
                    </h2>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.65rem' }}>
                    {features.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.65rem 0.85rem', borderRadius: 10, background: `${accentColor}08`, border: `1px solid ${accentColor}15` }}>
                        <span style={{ color: accentColor, fontWeight: 800, fontSize: '0.85rem', lineHeight: 1.5, flexShrink: 0 }}>✓</span>
                        <span style={{ fontSize: '0.835rem', color: D.textSec, lineHeight: 1.55 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full warranty banner */}
              {product.fullWarranty && (
                <div style={{ background: D.greenBg, border: `1px solid ${D.greenBorder}`, borderRadius: 16, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: D.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Shield style={{ width: 22, height: 22, color: 'white' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: D.green, fontSize: '0.9rem' }}>
                      🛡️ {isAr ? 'ضمان كامل شامل' : 'Full Warranty Included'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: `${D.green}aa`, marginTop: 2 }}>
                      {isAr ? 'جميع الباقات تشمل ضمان كامل بدون تكلفة إضافية' : 'All plans include full warranty at no extra cost'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT PANEL */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'sticky', top: '1.5rem' }}>

              {/* Plan selector */}
              {product.variants && product.variants.length > 0 && (
                <div style={{ background: `linear-gradient(145deg, ${D.surface}, ${D.bg})`, border: `1px solid ${D.border}`, borderRadius: 20, padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: D.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.875rem' }}>
                    {t.product.selectPlan}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {product.variants.map((v) => {
                      const isSel = selectedVariant?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          onClick={() => !v.outOfStock && setSelectedVariant(v)}
                          disabled={v.outOfStock}
                          style={{
                            width: '100%', textAlign: 'start', cursor: v.outOfStock ? 'not-allowed' : 'pointer',
                            padding: '0.875rem 1rem', borderRadius: 12,
                            background: isSel ? `${accentColor}12` : D.surfaceUp,
                            border: `1.5px solid ${v.outOfStock ? D.border : isSel ? accentColor : D.border}`,
                            opacity: v.outOfStock ? 0.5 : 1,
                            transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '0.75rem',
                            fontFamily: 'inherit',
                          }}
                        >
                          <div style={{
                            width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                            border: `2px solid ${isSel ? accentColor : D.border}`,
                            background: isSel ? accentColor : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {isSel && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: isSel ? D.text : D.textSec, marginBottom: 2, textDecoration: v.outOfStock ? 'line-through' : 'none' }}>
                              {v.title}
                            </div>
                            {v.duration && (
                              <div style={{ fontSize: '0.73rem', color: D.textMuted }}>{v.duration}</div>
                            )}
                            {v.warrantyDays > 0 && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3, fontSize: '0.72rem', color: D.green }}>
                                <Shield style={{ width: 11, height: 11 }} />
                                {isAr ? `ضمان ${v.warrantyDays} يوم` : `${v.warrantyDays}-day warranty`}
                              </div>
                            )}
                          </div>

                          <div style={{ fontSize: '1rem', fontWeight: 800, color: isSel ? accentColor : D.textSec, textDecoration: v.outOfStock ? 'line-through' : 'none', whiteSpace: 'nowrap' }}>
                            {cvt(v.price)} {sym}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Warranty upgrade */}
              {!product.fullWarranty && warrantyOptions.length > 0 && (
                <div style={{ background: `linear-gradient(145deg, ${D.surface}, ${D.bg})`, border: `1px solid ${D.border}`, borderRadius: 20, padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.875rem' }}>
                    <Shield style={{ width: 14, height: 14, color: D.green }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: D.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {isAr ? 'ضمان إضافي' : 'Extended Warranty'}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(warrantyOptions.length + 1, 3)}, 1fr)`, gap: '0.5rem' }}>
                    <button
                      onClick={() => setSelectedWarrantyIndex(-1)}
                      style={{ padding: '0.75rem 0.5rem', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center', background: selectedWarrantyIndex === -1 ? `${accentColor}10` : D.surfaceUp, border: `1.5px solid ${selectedWarrantyIndex === -1 ? accentColor : D.border}` }}
                    >
                      <div style={{ fontSize: '0.72rem', color: D.textSec }}>{isAr ? 'بدون' : 'None'}</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: D.textSec, marginTop: 2 }}>{isAr ? 'مجاني' : 'Free'}</div>
                    </button>
                    {warrantyOptions.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedWarrantyIndex(idx)}
                        style={{ padding: '0.75rem 0.5rem', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center', position: 'relative', background: selectedWarrantyIndex === idx ? `${accentColor}10` : D.surfaceUp, border: `1.5px solid ${selectedWarrantyIndex === idx ? accentColor : D.border}` }}
                      >
                        {selectedWarrantyIndex === idx && (
                          <div style={{ position: 'absolute', top: -7, right: -7, width: 18, height: 18, borderRadius: '50%', background: D.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Check style={{ width: 11, height: 11, color: 'white' }} />
                          </div>
                        )}
                        <div style={{ fontSize: '0.7rem', color: D.textSec }}>{isAr ? opt.labelAr || opt.label : opt.label}</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: D.green, marginTop: 2 }}>+{cvt(opt.price)} {sym}</div>
                        <div style={{ fontSize: '0.65rem', color: D.textMuted, marginTop: 1 }}>{opt.days} {isAr ? 'يوم' : 'days'}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price + Quantity */}
              <div style={{ background: `linear-gradient(145deg, ${D.surface}, ${D.bg})`, border: `1px solid ${D.border}`, borderRadius: 20, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: D.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                      {t.product.totalPrice}
                    </div>
                    {appliedCoupon ? (
                      <div>
                        <div style={{ fontSize: '1rem', color: D.textMuted, textDecoration: 'line-through', lineHeight: 1 }}>{cvt(subtotal).toFixed(2)} {sym}</div>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: D.green, lineHeight: 1, marginTop: 2, letterSpacing: '-0.03em' }}>{cvt(finalPrice).toFixed(2)} {sym}</div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '2rem', fontWeight: 900, color: accentColor, lineHeight: 1, letterSpacing: '-0.03em' }}>{cvt(subtotal).toFixed(2)} {sym}</div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: D.surfaceUp, borderRadius: 12, border: `1px solid ${D.border}`, padding: '0.25rem' }}>
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: 34, height: 34, borderRadius: 9, border: 'none', background: 'transparent', cursor: 'pointer', color: D.textSec, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Minus style={{ width: 14, height: 14 }} />
                    </button>
                    <span style={{ fontSize: '1rem', fontWeight: 700, width: '1.75rem', textAlign: 'center', color: D.text }}>{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} style={{ width: 34, height: 34, borderRadius: 9, border: 'none', background: 'transparent', cursor: 'pointer', color: D.textSec, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Plus style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                </div>

                {/* Coupon */}
                {appliedCoupon ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: 10, background: D.greenBg, border: `1px solid ${D.greenBorder}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Tag style={{ width: 15, height: 15, color: D.green }} />
                      <span style={{ fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 700, color: D.green }}>{appliedCoupon.code}</span>
                      <span style={{ fontSize: '0.75rem', color: D.green }}>(-{appliedCoupon.isPercent ? `${appliedCoupon.discount}%` : `${cvt(appliedCoupon.discount)} ${sym}`})</span>
                    </div>
                    <button onClick={handleRemoveCoupon} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer' }}><X style={{ width: 15, height: 15, color: D.green }} /></button>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', borderRadius: 10, border: `1px solid ${D.border}`, overflow: 'hidden' }}>
                      <input
                        type="text"
                        placeholder={isAr ? 'كود الخصم' : 'Coupon code'}
                        value={couponCode}
                        onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                        style={{ flex: 1, minWidth: 0, padding: '0.65rem 0.75rem', background: D.surfaceUp, color: D.text, border: 'none', outline: 'none', fontSize: '0.85rem', fontFamily: 'monospace', textTransform: 'uppercase' }}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        style={{ padding: '0.65rem 1rem', background: accentColor, color: 'white', fontSize: '0.82rem', fontWeight: 700, border: 'none', cursor: 'pointer', flexShrink: 0, opacity: (couponLoading || !couponCode.trim()) ? 0.5 : 1, fontFamily: 'inherit' }}
                      >
                        {couponLoading ? '...' : (isAr ? 'تطبيق' : 'Apply')}
                      </button>
                    </div>
                    {couponError && <p style={{ fontSize: '0.75rem', color: D.red, marginTop: '0.375rem' }}>{couponError}</p>}
                  </div>
                )}

                {/* Customer form */}
                {showOrderForm && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    <input type="text" placeholder={t.product.yourName} value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={inputSt} required />
                    <input type="tel" placeholder={t.product.yourPhone} value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} style={inputSt} required />
                    <input type="email" placeholder={isAr ? 'البريد الإلكتروني (اختياري)' : 'Email (optional)'} value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} style={{ ...inputSt, fontSize: '0.82rem' }} />
                  </div>
                )}

                {/* CTA Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  <button
                    onClick={handleWhatsAppOrder}
                    disabled={!canPurchase}
                    style={{
                      width: '100%', padding: '0.9rem 1.5rem', borderRadius: 12, fontWeight: 700, fontSize: '0.9rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      border: 'none', fontFamily: 'inherit', cursor: canPurchase ? 'pointer' : 'not-allowed',
                      transition: 'all 0.15s',
                      ...(canPurchase
                        ? { background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', boxShadow: '0 6px 20px rgba(34,197,94,0.3)' }
                        : { background: D.surfaceUp, color: D.textMuted }),
                    }}
                  >
                    {!canPurchase
                      ? <><Ban style={{ width: 18, height: 18 }} /> {isAr ? 'غير متوفر' : 'Out of Stock'}</>
                      : <><MessageCircle style={{ width: 18, height: 18 }} /> {t.product.orderWhatsApp}</>
                    }
                  </button>

                  <button
                    onClick={handleAddToCart}
                    disabled={!canPurchase}
                    style={{
                      width: '100%', padding: '0.9rem 1.5rem', borderRadius: 12, fontWeight: 700, fontSize: '0.9rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      fontFamily: 'inherit', cursor: canPurchase ? 'pointer' : 'not-allowed',
                      transition: 'all 0.15s',
                      ...(addedToCart
                        ? { background: `${D.green}15`, border: `1.5px solid ${D.green}`, color: D.green }
                        : canPurchase
                          ? { background: `${accentColor}15`, border: `1.5px solid ${accentColor}50`, color: accentColor }
                          : { background: D.surfaceUp, border: `1.5px solid ${D.border}`, color: D.textMuted }),
                    }}
                  >
                    {addedToCart
                      ? <><Check style={{ width: 18, height: 18 }} /> {t.product.added}</>
                      : <><ShoppingCart style={{ width: 18, height: 18 }} /> {t.product.addToCart}</>
                    }
                  </button>
                </div>
              </div>

              {/* Quick info pills */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                {[
                  (() => {
                    const type = product.accountType || 'no_account';
                    const map: Record<string, { labelAr: string; labelEn: string; color: string }> = {
                      no_account:  { labelAr: 'بدون حساب',             labelEn: 'No Account Needed',        color: D.green },
                      credentials: { labelAr: 'يحتاج ميل وباسورد',     labelEn: 'Email & Password Required', color: '#60a5fa' },
                      own_account: { labelAr: 'تفعيل على حسابك',       labelEn: 'Activate on Your Account', color: '#fbbf24' },
                      both:        { labelAr: 'حساب جاهز أو تفعيل',   labelEn: 'Account or Activation',    color: '#fb923c' },
                    };
                    const info = map[type] || map['no_account'];
                    return { icon: Shield, label: isAr ? info.labelAr : info.labelEn, color: info.color };
                  })(),
                  { icon: Shield, label: isAr ? 'أصلي 100%' : '100% Genuine', color: accentColor },
                  { icon: Star, label: isAr ? `${plansCount} خطط` : `${plansCount} Plans`, color: '#fbbf24' },
                  { icon: MessageCircle, label: isAr ? 'دعم عبر واتساب' : 'WhatsApp Support', color: '#60a5fa' },
                ].map((item, i) => (
                  <div key={i} style={{
                    padding: '0.75rem 0.875rem', borderRadius: 12,
                    background: D.surface, border: `1px solid ${D.border}`,
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                  }}>
                    <item.icon style={{ width: 14, height: 14, color: item.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.75rem', color: D.textSec, fontWeight: 500 }}>{item.label}</span>
                  </div>
                ))}
              </div>

              {/* View all products */}
              <Link
                href="/products"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  padding: '0.75rem', borderRadius: 12, border: `1px solid ${D.border}`,
                  color: D.textMuted, fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none',
                  background: D.surface, transition: 'all 0.15s',
                }}
              >
                <ExternalLink style={{ width: 13, height: 13 }} />
                {isAr ? 'تصفح المنتجات' : 'Browse All Products'}
              </Link>
            </div>
          </div>

          <style>{`
            @media (max-width: 840px) {
              .pdp-grid { grid-template-columns: 1fr !important; }
            }
          `}</style>
        </div>

        {/* ── Related Products ── */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: `1px solid ${D.border}` }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#a78bfa', marginBottom: '1.25rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {isAr ? 'منتجات من نفس الفئة' : 'More from this category'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.875rem' }}>
              {relatedProducts.map((rp) => {
                const rpName  = isAr && rp.nameAr ? rp.nameAr : rp.name;
                const rpPrice = rp.lowestPrice ? cvt(rp.lowestPrice) : null;
                const rpAccent = getProductAccentColor(rp.name);
                return (
                  <Link key={rp.id} href={`/product/${rp.slug}`} style={{ textDecoration: 'none' }}>
                    <div
                      style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: 14, padding: '1rem', cursor: 'pointer', transition: 'border-color 0.2s, transform 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.625rem', textAlign: 'center' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = `${rpAccent}50`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = D.border; e.currentTarget.style.transform = 'none'; }}
                    >
                      <div style={{ width: 56, height: 56, borderRadius: '22%', overflow: 'hidden', background: `${rpAccent}15`, boxShadow: `0 0 0 1px ${rpAccent}30`, flexShrink: 0 }}>
                        <ProductLogo productName={rp.name} dbImage={rp.images[0] ?? null} size={56} bg="transparent" lazy />
                      </div>
                      <p style={{ fontSize: '0.82rem', fontWeight: 700, color: D.text, margin: 0, lineHeight: 1.35 }}>{rpName}</p>
                      {rpPrice && rpPrice > 0 && (
                        <p style={{ fontSize: '0.78rem', color: rpAccent, fontWeight: 700, margin: 0 }}>
                          {isAr ? 'من ' : 'from '}{rpPrice} {sym}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
