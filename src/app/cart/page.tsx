'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Trash2,
    Plus,
    Minus,
    ShoppingCart,
    MessageCircle,
    ArrowRight,
    Package,
    Tag,
    X,
} from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { Settings } from '@/lib/types';
import { buildWhatsAppMessage, generateWhatsAppUrl, generateOrderCode, openWhatsApp } from '@/lib/whatsapp';
import { useI18n } from '@/lib/i18n';
import { useSettings } from '@/lib/settings-context';
import OptimizedImage from '@/components/OptimizedImage';

export default function CartPage() {
    const router = useRouter();
    const { items, removeItem, updateQuantity, clearCart, totalPrice, itemCount } = useCart();
    const [settings, setSettings] = useState<Settings | null>(null);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerNotes, setCustomerNotes] = useState('');
    const [sending, setSending] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState<{ id: string; code: string; discount: number; isPercent: boolean; discountAmount: number } | null>(null);
    const [couponError, setCouponError] = useState('');
    const { t, locale } = useI18n();
    const { currencySymbol, currency } = useSettings();

    const finalPrice = appliedCoupon ? Math.round((totalPrice - appliedCoupon.discountAmount) * 100) / 100 : totalPrice;

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        setCouponError('');
        try {
            const res = await fetch('/api/coupons/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponCode, orderTotal: totalPrice }),
            });
            const data = await res.json();
            if (data.valid) {
                setAppliedCoupon({
                    id: data.coupon.id,
                    code: data.coupon.code,
                    discount: data.coupon.discount,
                    isPercent: data.coupon.isPercent,
                    discountAmount: data.discountAmount,
                });
                setCouponError('');
            } else {
                setCouponError(data.error || 'Invalid coupon');
                setAppliedCoupon(null);
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

    useEffect(() => {
        fetch('/api/settings')
            .then((r) => r.json())
            .then(setSettings)
            .catch(() => { });
    }, []);

    const handleSendOrder = async () => {
        if (!customerName || !customerPhone) return;
        if (items.length === 0) return;
        setSending(true);

        const orderCode = generateOrderCode();

        try {
            await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName,
                    customerPhone,
                    items: items.map((item) => ({
                        productId: item.productId,
                        productName: item.productName,
                        variant: item.variantTitle,
                        price: item.price,
                        quantity: item.quantity,
                    })),
                    totalPrice: finalPrice,
                    notes: customerNotes,
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
            notes: customerNotes,
            items: items.map((item) => ({
                productName: item.productName,
                variant: item.variantTitle,
                price: item.price,
                quantity: item.quantity,
            })),
            totalPrice: finalPrice,
            currency: currency || 'EGP',
            locale,
        });

        const url = generateWhatsAppUrl(settings?.whatsappPhone || '', message);
        openWhatsApp(url);
        clearCart();
        setTimeout(() => router.push(`/thank-you?code=${orderCode}`), 500);
    };

    return (
        <div className="min-h-screen pt-8 pb-20 px-4">
            <div className="max-w-4xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {t.cart.title}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">
                        {itemCount} {itemCount === 1 ? t.cart.item : t.cart.items} {t.cart.inCart}
                    </p>
                </motion.div>

                {items.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20"
                    >
                        <ShoppingCart className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {t.cart.empty}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8">
                            {t.cart.emptyDesc}
                        </p>
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl font-semibold"
                        >
                            {t.cart.browseProducts}
                            <ArrowRight className={`w-4 h-4 ${locale === 'ar' ? 'rotate-180' : ''}`} />
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {items.map((item, index) => (
                                <motion.div
                                    key={`${item.productId}-${item.variantId}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-4 sm:p-5"
                                >
                                    <div className="flex items-start gap-3 sm:gap-4">
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center overflow-hidden shrink-0">
                                            {item.productImage ? (
                                                <OptimizedImage src={item.productImage} alt={item.productName} width={40} height={40} className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                                            ) : (
                                                <Package className="w-6 h-6 sm:w-7 sm:h-7 text-violet-500" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm sm:text-base">
                                                {item.productName}
                                            </h3>
                                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                                {item.variantTitle}
                                            </p>
                                            <p className="text-base sm:text-lg font-bold text-violet-600 dark:text-violet-400 mt-1">
                                                {item.price} {currencySymbol}
                                            </p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                                                    className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="font-semibold text-gray-900 dark:text-white w-6 text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                                                    className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.productId, item.variantId)}
                                                className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:sticky lg:top-24"
                        >
                            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t.cart.orderSummary}</h3>

                                <div className="space-y-3 mb-6">
                                    {items.map((item) => (
                                        <div key={`${item.productId}-${item.variantId}`} className="flex justify-between gap-2 text-sm">
                                            <span className="text-gray-500 dark:text-gray-400 truncate min-w-0">
                                                {item.productName} x{item.quantity}
                                            </span>
                                            <span className="text-gray-900 dark:text-white font-medium whitespace-nowrap">
                                                {(item.price * item.quantity).toFixed(2)} {currencySymbol}
                                            </span>
                                        </div>
                                    ))}
                                    {/* Coupon Input */}
                                    <div className="border-t border-gray-200 dark:border-gray-800 pt-3">
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
                                                        className="flex-1 min-w-0 px-3 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none text-sm font-mono uppercase"
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

                                    <div className="border-t border-gray-200 dark:border-gray-800 pt-3 space-y-2">
                                        {appliedCoupon && (
                                            <>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500 dark:text-gray-400">{locale === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                                                    <span className="text-gray-500 dark:text-gray-400">{totalPrice.toFixed(2)} {currencySymbol}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-emerald-600 dark:text-emerald-400">{locale === 'ar' ? 'الخصم' : 'Discount'}</span>
                                                    <span className="text-emerald-600 dark:text-emerald-400">-{appliedCoupon.discountAmount.toFixed(2)} {currencySymbol}</span>
                                                </div>
                                            </>
                                        )}
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-gray-900 dark:text-white">{t.cart.total}</span>
                                            <span className="text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
                                                {finalPrice.toFixed(2)} {currencySymbol}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <input
                                        type="text"
                                        placeholder={t.cart.namePlaceholder}
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-violet-500 transition text-sm"
                                    />
                                    <input
                                        type="tel"
                                        placeholder={t.cart.phonePlaceholder}
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-violet-500 transition text-sm"
                                    />
                                    <textarea
                                        placeholder={t.cart.notesPlaceholder}
                                        value={customerNotes}
                                        onChange={(e) => setCustomerNotes(e.target.value)}
                                        rows={2}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-violet-500 transition text-sm resize-none"
                                    />
                                </div>

                                <button
                                    onClick={handleSendOrder}
                                    disabled={!customerName || !customerPhone || sending}
                                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    {sending ? t.cart.sending : t.cart.sendOrder}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}
