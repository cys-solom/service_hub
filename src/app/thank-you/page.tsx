'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Home } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const C = { bg: '#141928', border: '#374151', text: '#f9fafb', textSec: '#9ca3af', accent: '#a78bfa', surface: '#1a2035' };

function ThankYouContent() {
    const searchParams = useSearchParams();
    const orderCode = searchParams.get('code') || 'N/A';
    const { t } = useI18n();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => { navigator.clipboard.writeText(orderCode); setCopied(true); setTimeout(() => setCopied(false), 2000); };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 1rem' }}>
            <div style={{ maxWidth: '28rem', width: '100%', textAlign: 'center' }}>
                <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', boxShadow: '0 8px 25px rgba(16,185,129,0.3)' }}>
                    <CheckCircle style={{ width: 48, height: 48, color: 'white' }} />
                </div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: C.text, marginBottom: '1rem' }}>{t.thankYou.title}</h1>
                <p style={{ color: C.textSec, marginBottom: '2rem' }}>{t.thankYou.subtitle}</p>
                <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem' }}>
                    <p style={{ fontSize: '0.875rem', color: C.textSec, marginBottom: '0.5rem' }}>{t.thankYou.orderCode}</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'monospace', color: C.accent, marginBottom: '0.75rem' }}>{orderCode}</p>
                    <button onClick={handleCopy} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 500, background: C.surface, color: C.text, border: 'none', cursor: 'pointer' }}>
                        {copied ? (<><CheckCircle style={{ width: 16, height: 16, color: '#10b981' }} /><span style={{ color: '#10b981' }}>Copied!</span></>) : (<><Package style={{ width: 16, height: 16 }} />Copy Code</>)}
                    </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
                    <Link href="/products" style={{ padding: '0.75rem 1.5rem', borderRadius: '1rem', fontWeight: 600, background: 'linear-gradient(135deg, #7c3aed, #6366f1)', color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Package style={{ width: 20, height: 20 }} />{t.thankYou.continueShopping}
                    </Link>
                    <Link href="/" style={{ padding: '0.75rem 1.5rem', borderRadius: '1rem', fontWeight: 600, border: `1px solid ${C.border}`, color: C.text, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
