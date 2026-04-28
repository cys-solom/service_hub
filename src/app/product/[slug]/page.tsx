'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Check,
    ShoppingCart,
    MessageCircle,
    Package,
    Star,
    Plus,
    Minus,
    Ban,
    Tag,
    X,
    Shield,
} from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { Product, ProductVariant, Settings, WarrantyOption } from '@/lib/types';
import { buildWhatsAppMessage, generateWhatsAppUrl, generateOrderCode, openWhatsApp } from '@/lib/whatsapp';
import { useI18n } from '@/lib/i18n';
import { useSettings } from '@/lib/settings-context';
import OptimizedImage from '@/components/OptimizedImage';

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const router = useRouter();
    const { addItem } = useCart();
    const [product, setProduct] = useState<Product | null>(null);
    const [settings, setSettings] = useState<Settings | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [selectedWarrantyIndex, setSelectedWarrantyIndex] = useState(-1);
    const [couponCode, setCouponCode] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<{
        code: string; discount: number; isPercent: boolean; discountAmount: number;
    } | null>(null);
    const { t, locale } = useI18n();
    const { currencySymbol, currency } = useSettings();

    useEffect(() => {
        Promise.all([
            fetch(`/api/products/slug/${slug}`).then((r) => r.json()),
            fetch('/api/settings').then((r) => r.json()),
        ]).then(([prod, sett]) => {
            if (prod.error) {
                router.push('/products');
                return;
            }
            setProduct(prod);
            setSettings(sett);
            if (prod.variants?.length > 0) {
                // Auto-select first in-stock variant
                const inStockVariant = prod.variants.find((v: ProductVariant) => !v.outOfStock);
                setSelectedVariant(inStockVariant || prod.variants[0]);
            }
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [slug, router]);

    const currentPrice = selectedVariant?.price || product?.basePrice || 0;
    const rawWo = product?.warrantyOptions;
    const warrantyOptions: WarrantyOption[] = Array.isArray(rawWo) ? rawWo : (typeof rawWo === 'string' ? (() => { try { return JSON.parse(rawWo); } catch { return []; } })() : []);
    const selectedWarranty = selectedWarrantyIndex >= 0 ? warrantyOptions[selectedWarrantyIndex] : null;
    const warrantyPrice = selectedWarranty?.price || 0;
    const subtotal = (currentPrice * quantity) + warrantyPrice;
    const discountAmount = appliedCoupon?.discountAmount || 0;
    const finalPrice = Math.max(0, subtotal - discountAmount);
    const isOutOfStock = product?.outOfStock || false;
    const isSelectedVariantOutOfStock = selectedVariant?.outOfStock || false;
    const canPurchase = !isOutOfStock && !isSelectedVariantOutOfStock;

    // Recalculate coupon when price/quantity changes
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
        setCouponLoading(true);
        setCouponError('');
        try {
            const res = await fetch('/api/coupons/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponCode, orderTotal: subtotal }),
            });
            const data = await res.json();
            if (!res.ok) {
                setCouponError(data.error || 'Invalid coupon');
            } else {
                setAppliedCoupon({
                    code: data.coupon.code,
                    discount: data.coupon.discount,
                    isPercent: data.coupon.isPercent,
                    discountAmount: data.discountAmount,
                });
                setCouponCode('');
            }
        } catch {
            setCouponError('Failed to validate coupon');
        }
        setCouponLoading(false);
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError('');
    };

    const handleAddToCart = () => {
        if (!product || !selectedVariant) return;
        addItem({
            productId: product.id,
            productName: product.name,
            productSlug: product.slug,
            productImage: product.images?.[0] || '',
            variantId: selectedVariant.id,
            variantTitle: selectedVariant.title,
            duration: selectedVariant.duration,
            price: selectedVariant.price,
            quantity,
        });
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const handleWhatsAppOrder = async () => {
        if (!product || !selectedVariant || !settings) return;
        if (!customerName || !customerPhone) {
            setShowOrderForm(true);
            return;
        }

        const orderCode = generateOrderCode();

        try {
            await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName,
                    customerPhone,
                    items: [
                        {
                            productId: product.id,
                            productName: product.name,
                            variant: selectedVariant.title,
                            price: selectedVariant.price,
                            quantity,
                        },
                    ],
                    totalPrice: finalPrice,
                    couponCode: appliedCoupon?.code || null,
                }),
            });
        } catch (err) {
            console.error('Failed to save order', err);
        }

        const message = buildWhatsAppMessage({
            orderCode,
            customerName,
            customerPhone,
            items: [
                {
                    productName: product.name,
                    variant: selectedVariant.title,
                    price: selectedVariant.price,
                    quantity,
                },
            ],
            totalPrice: finalPrice,
            currency: currency || 'EGP',
            locale,
        });

        const url = generateWhatsAppUrl(settings.whatsappPhone, message);
        openWhatsApp(url);
        setTimeout(() => router.push(`/thank-you?code=${orderCode}`), 500);
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-8 pb-20 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="skeleton h-6 w-32 mb-8" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="skeleton h-80 rounded-3xl" />
                        <div>
                            <div className="skeleton h-8 w-3/4 mb-4" />
                            <div className="skeleton h-5 w-1/2 mb-6" />
                            <div className="skeleton h-20 w-full mb-6" />
                            <div className="skeleton h-12 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="min-h-screen pt-8 pb-20 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Back button */}
                <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition mb-8"
                >
                    <ArrowLeft className={`w-4 h-4 ${locale === 'ar' ? 'rotate-180' : ''}`} />
                    {t.product.backToProducts}
                </motion.button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Product Image */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800/50 p-8 sm:p-12 flex items-center justify-center min-h-[240px] sm:min-h-[320px]">
                            {product.images?.[0] ? (
                                <OptimizedImage
                                    src={product.images[0]}
                                    alt={product.name}
                                    width={200}
                                    height={200}
                                    className="max-w-[150px] sm:max-w-[200px] max-h-[150px] sm:max-h-[200px] object-contain"
                                    priority
                                />
                            ) : (
                                <Package className="w-24 h-24 sm:w-32 sm:h-32 text-gray-300 dark:text-gray-600" />
                            )}
                        </div>
                    </motion.div>

                    {/* Product Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400">
                                {product.category?.name}
                            </span>
                            <div className="flex items-center gap-1 text-amber-500">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                <span className="text-xs font-medium">4.9</span>
                            </div>
                            {isOutOfStock && (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <Ban className="w-3 h-3" /> Out of Stock
                                </span>
                            )}
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            {locale === 'ar' && product.nameAr ? product.nameAr : product.name}
                        </h1>

                        <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                            {locale === 'ar' && product.descriptionAr ? product.descriptionAr : product.description}
                        </p>

                        {/* Features */}
                        {product.features && product.features.length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t.product.features}</h3>
                                <ul className="grid grid-cols-1 gap-2">
                                    {(locale === 'ar' && product.featuresAr && product.featuresAr.length > 0
                                        ? product.featuresAr
                                        : product.features
                                    ).map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                            <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Variants */}
                        {product.variants && product.variants.length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t.product.selectPlan}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {product.variants.map((variant) => (
                                        <button
                                            key={variant.id}
                                            onClick={() => !variant.outOfStock && setSelectedVariant(variant)}
                                            disabled={variant.outOfStock}
                                            className={`p-4 rounded-xl border-2 text-start transition-all relative ${variant.outOfStock
                                                ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-500/5 opacity-60 cursor-not-allowed'
                                                : selectedVariant?.id === variant.id
                                                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-500/50'
                                                }`}
                                        >
                                            <div className={`text-sm font-medium ${variant.outOfStock ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>
                                                {variant.title}
                                            </div>
                                            <div className={`text-lg font-bold mt-1 ${variant.outOfStock ? 'text-gray-400 line-through' : 'text-violet-600 dark:text-violet-400'}`}>
                                                {variant.price} {currencySymbol}
                                            </div>
                                            {variant.warrantyDays > 0 && (
                                                <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                                                    <Shield className="w-3 h-3" />
                                                    <span>{locale === 'ar' ? `ضمان ${variant.warrantyDays} يوم` : `${variant.warrantyDays} days warranty`}</span>
                                                </div>
                                            )}
                                            {variant.outOfStock && (
                                                <div className="absolute top-2 end-2 text-[10px] font-bold text-red-500 uppercase flex items-center gap-1">
                                                    <Ban className="w-3 h-3" /> Out of Stock
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Full Warranty Badge */}
                        {product?.fullWarranty && (
                            <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 border border-emerald-200 dark:border-emerald-500/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
                                        <Shield className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                                            {locale === 'ar' ? '🛡️ ضمان كامل شامل' : '🛡️ Full Warranty Included'}
                                        </h3>
                                        <p className="text-xs text-emerald-600/70 dark:text-emerald-400/60 mt-0.5">
                                            {locale === 'ar' ? 'جميع الباقات تشمل ضمان كامل بدون تكلفة إضافية' : 'All plans include full warranty at no extra cost'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Warranty Upgrade Slider */}
                        {!product?.fullWarranty && warrantyOptions.length > 0 && (
                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Shield className="w-4 h-4 text-emerald-500" />
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                                        {locale === 'ar' ? '🛡️ ضمان إضافي' : '🛡️ Extended Warranty'}
                                    </h3>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {/* No warranty option */}
                                    <button
                                        onClick={() => setSelectedWarrantyIndex(-1)}
                                        className={`p-3 rounded-xl border-2 text-start transition-all ${
                                            selectedWarrantyIndex === -1
                                                ? 'border-gray-400 dark:border-gray-500 bg-gray-50 dark:bg-gray-800'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                            {locale === 'ar' ? 'بدون ضمان إضافي' : 'No extra warranty'}
                                        </div>
                                        <div className="text-sm font-bold text-gray-400 mt-1">
                                            {locale === 'ar' ? 'مجاني' : 'Free'}
                                        </div>
                                    </button>
                                    {/* Warranty tiers */}
                                    {warrantyOptions.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedWarrantyIndex(idx)}
                                            className={`p-3 rounded-xl border-2 text-start transition-all relative ${
                                                selectedWarrantyIndex === idx
                                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-500/50'
                                            }`}
                                        >
                                            {selectedWarrantyIndex === idx && (
                                                <div className="absolute -top-1.5 -end-1.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                                    <Check className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                            <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                {locale === 'ar' ? opt.labelAr || opt.label : opt.label}
                                            </div>
                                            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                                +{opt.price} {currencySymbol}
                                            </div>
                                            <div className="text-[10px] text-gray-400 mt-0.5">
                                                {opt.days} {locale === 'ar' ? 'يوم' : 'days'}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Price & Quantity */}
                        <div className="mb-6 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">{t.product.totalPrice}</span>
                                    {appliedCoupon ? (
                                        <div>
                                            <p className="text-lg text-gray-400 line-through">
                                                {subtotal.toFixed(2)} {currencySymbol}
                                            </p>
                                            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                                {finalPrice.toFixed(2)} {currencySymbol}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                            {subtotal.toFixed(2)} {currencySymbol}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="text-lg font-semibold text-gray-900 dark:text-white w-8 text-center">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Coupon Section */}
                            {appliedCoupon ? (
                                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-800">
                                    <div className="flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        <span className="text-sm font-mono font-bold text-emerald-700 dark:text-emerald-400">{appliedCoupon.code}</span>
                                        <span className="text-xs text-emerald-600 dark:text-emerald-400">
                                            (-{appliedCoupon.isPercent ? `${appliedCoupon.discount}%` : `${appliedCoupon.discount} ${currencySymbol}`})
                                        </span>
                                    </div>
                                    <button onClick={handleRemoveCoupon} className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded transition">
                                        <X className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-stretch gap-0 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                        <input
                                            type="text"
                                            placeholder={locale === 'ar' ? 'كود الخصم' : 'Coupon code'}
                                            value={couponCode}
                                            onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                                            className="flex-1 min-w-0 px-3 py-2.5 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 outline-none text-sm font-mono uppercase"
                                        />
                                        <button
                                            onClick={handleApplyCoupon}
                                            disabled={couponLoading || !couponCode.trim()}
                                            className="px-4 py-2.5 bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                                        >
                                            {couponLoading ? '...' : locale === 'ar' ? 'تطبيق' : 'Apply'}
                                        </button>
                                    </div>
                                    {couponError && (
                                        <p className="text-xs text-red-500 mt-1.5">{couponError}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Order Form */}
                        {showOrderForm && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mb-6 space-y-3"
                            >
                                <input
                                    type="text"
                                    placeholder={t.product.yourName}
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-violet-500 transition"
                                />
                                <input
                                    type="tel"
                                    placeholder={t.product.yourPhone}
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-violet-500 transition"
                                />
                            </motion.div>
                        )}

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleWhatsAppOrder}
                                disabled={!canPurchase}
                                className={`flex-1 px-6 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all ${!canPurchase
                                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40'
                                    }`}
                            >
                                {!canPurchase ? (
                                    <><Ban className="w-5 h-5" /> Out of Stock</>
                                ) : (
                                    <><MessageCircle className="w-5 h-5" /> {t.product.orderWhatsApp}</>
                                )}
                            </button>

                            <button
                                onClick={handleAddToCart}
                                disabled={!canPurchase}
                                className={`flex-1 px-6 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all ${!canPurchase
                                    ? 'border-2 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                    : addedToCart
                                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-500'
                                        : 'border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-violet-500 hover:text-violet-600 dark:hover:text-violet-400'
                                    }`}
                            >
                                {addedToCart ? (
                                    <><Check className="w-5 h-5" /> {t.product.added}</>
                                ) : (
                                    <><ShoppingCart className="w-5 h-5" /> {t.product.addToCart}</>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
