'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function NotFound() {
    const { t, locale } = useI18n();
    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 1rem' }}>
            <div style={{ textAlign: 'center' }}>
                <h1 style={{ fontSize: '6rem', fontWeight: 900, color: '#1a2035', marginBottom: '1rem' }}>404</h1>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f9fafb', marginBottom: '1rem' }}>{t.notFound.title}</h2>
                <p style={{ color: '#9ca3af', marginBottom: '2rem', maxWidth: '28rem', margin: '0 auto 2rem' }}>{t.notFound.description}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
                    <Link href="/" style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #7c3aed, #6366f1)', color: 'white', borderRadius: '1rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Home style={{ width: 20, height: 20 }} />{t.notFound.backHome}
                    </Link>
                    <Link href="/products" style={{ padding: '0.75rem 1.5rem', borderRadius: '1rem', fontWeight: 600, border: '1px solid #374151', color: '#f9fafb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ArrowLeft style={{ width: 20, height: 20, transform: locale === 'ar' ? 'rotate(180deg)' : undefined }} />{t.notFound.browseProducts}
                    </Link>
                </div>
            </div>
        </div>
    );
}
