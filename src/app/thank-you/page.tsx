'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Home, MessageCircle, Clock, Shield } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useSettings } from '@/lib/settings-context';

const C = { bg: '#141928', border: '#374151', text: '#f9fafb', textSec: '#b0b6c3', accent: '#a78bfa', surface: '#1a2035', green: '#22c55e' };
/* textSec improved from #9ca3af — slight lift for clarity on #141928 bg */

function ThankYouContent() {
    const searchParams = useSearchParams();
    const orderCode = searchParams.get('code') || 'N/A';
    const waUrl = searchParams.get('waUrl') || '';          // optional pre-built WA URL from cart
    const { t, locale } = useI18n();
    const { whatsappPhone } = useSettings(); /* no extra fetch — already available from context */
    const [copied, setCopied] = useState(false);
    const isAr = locale === 'ar';

    const handleCopy = () => {
        navigator.clipboard.writeText(orderCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Build the WhatsApp fallback URL:
    // 1. Use pre-built waUrl from query params if available
    // 2. Else open whatsapp with the phone + order code in the message
    const buildFallbackUrl = () => {
        if (waUrl) return waUrl;
        if (whatsappPhone) {
            const cleanPhone = whatsappPhone.replace(/[^0-9]/g, '');
            const msg = isAr
                ? `مرحباً، لديّ طلب برمز: ${orderCode} — أرجو المتابعة.`
                : `Hello, I placed an order with code: ${orderCode} — please follow up.`;
            return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`;
        }
        return null;
    };

    const fallbackUrl = buildFallbackUrl();

    // Delivery process steps
    const steps = isAr
        ? [
            { icon: CheckCircle, label: 'تم تسجيل طلبك', done: true },
            { icon: MessageCircle, label: 'أرسل رسالة واتساب للتأكيد', done: false },
            { icon: Clock, label: 'يُفعَّل اشتراكك بعد الدفع', done: false },
          ]
        : [
            { icon: CheckCircle, label: 'Order placed', done: true },
            { icon: MessageCircle, label: 'Send WhatsApp to confirm', done: false },
            { icon: Clock, label: 'Subscription activated after payment', done: false },
          ];

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: '30rem', width: '100%', textAlign: 'center' }}>
                {/* Success icon */}
                <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', boxShadow: '0 8px 25px rgba(16,185,129,0.3)' }}>
                    <CheckCircle style={{ width: 48, height: 48, color: 'white' }} />
                </div>

                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: C.text, marginBottom: '0.75rem' }}>{t.thankYou.title}</h1>
                <p style={{ color: C.textSec, marginBottom: '2rem', lineHeight: 1.65 }}>{t.thankYou.subtitle}</p>

                {/* Delivery steps */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '2rem', textAlign: isAr ? 'right' : 'left' }}>
                    {steps.map((step, i) => {
                        const StepIcon = step.icon;
                        return (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '0.625rem 0.875rem',
                            borderRadius: '0.75rem',
                            background: step.done ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${step.done ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.07)'}`,
                        }}>
                            <StepIcon style={{ width: 18, height: 18, color: step.done ? C.green : C.textSec, flexShrink: 0 }} />
                            <span style={{ fontSize: '0.85rem', color: step.done ? C.green : C.textSec, fontWeight: step.done ? 600 : 400 }}>
                                {step.label}
                            </span>
                        </div>
                        );
                    })}
                </div>

                {/* Order code card */}
                <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: '1rem', padding: '1.5rem', marginBottom: '0.75rem' }}>
                    <p style={{ fontSize: '0.875rem', color: C.textSec, marginBottom: '0.5rem' }}>{t.thankYou.orderCode}</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'monospace', color: C.accent, marginBottom: '0.75rem' }}>{orderCode}</p>
                    <button
                        onClick={handleCopy}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 500, background: C.surface, color: C.text, border: 'none', cursor: 'pointer' }}
                    >
                        {copied
                            ? (<><CheckCircle style={{ width: 16, height: 16, color: '#10b981' }} /><span style={{ color: '#10b981' }}>{isAr ? 'تم النسخ!' : 'Copied!'}</span></>)
                            : (<><Package style={{ width: 16, height: 16 }} />{isAr ? 'نسخ الكود' : 'Copy Code'}</>)
                        }
                    </button>
                </div>
                <p style={{ fontSize: '0.78rem', color: C.textSec, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}>
                    <Shield style={{ width: 13, height: 13, color: C.accent }} />
                    {t.thankYou.orderCodeHint}
                </p>

                {/* ── WhatsApp fallback button ── */}
                {fallbackUrl ? (
                    <a
                        href={fallbackUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        id="whatsapp-fallback-btn"
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem',
                            width: '100%', padding: '1rem 1.5rem', borderRadius: '1rem',
                            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                            color: 'white', fontWeight: 700, fontSize: '0.9375rem',
                            textDecoration: 'none', marginBottom: '1rem',
                            boxShadow: '0 4px 16px rgba(34,197,94,0.35)',
                            transition: 'opacity 0.15s',
                        }}
                    >
                        <MessageCircle style={{ width: 22, height: 22 }} />
                        {t.thankYou.whatsappFallback}
                    </a>
                ) : (
                    // No phone configured — show informational message
                    <div style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '1rem', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', color: C.textSec, fontSize: '0.875rem', lineHeight: 1.6 }}>
                        <MessageCircle style={{ width: 16, height: 16, display: 'inline', marginInlineEnd: '0.4rem', color: C.accent, verticalAlign: 'middle' }} />
                        {isAr
                            ? `لم يتم فتح واتساب تلقائياً؟ يرجى التواصل مع الدعم مع ذكر رمز الطلب: ${orderCode}`
                            : `WhatsApp didn't open? Please contact support with your order code: ${orderCode}`
                        }
                    </div>
                )}

                {/* Navigation buttons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
                    <Link
                        href="/products"
                        style={{ padding: '0.75rem 1.5rem', borderRadius: '1rem', fontWeight: 600, background: 'linear-gradient(135deg, #7c3aed, #6366f1)', color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Package style={{ width: 20, height: 20 }} />{t.thankYou.continueShopping}
                    </Link>
                    <Link
                        href="/"
                        style={{ padding: '0.75rem 1.5rem', borderRadius: '1rem', fontWeight: 600, border: `1px solid ${C.border}`, color: C.text, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Home style={{ width: 20, height: 20 }} />{t.thankYou.backHome}
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function ThankYouPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="skeleton" style={{ height: 32, width: 128 }} /></div>}>
            <ThankYouContent />
        </Suspense>
    );
}
