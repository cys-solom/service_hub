'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import AnimatedLogo from '@/components/AnimatedLogo';

const C = {
    bg: '#0f1219', border: '#374151',
    text: '#f9fafb', textSec: '#6b7280',
    accent: '#a78bfa',
};

export default function Footer() {
    const { t } = useI18n();

    const linkStyle: React.CSSProperties = { fontSize: '0.875rem', color: C.textSec, textDecoration: 'none' };

    return (
        <footer style={{ background: C.bg, borderTop: `1px solid ${C.border}` }}>
            <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '3rem 1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '2rem' }}>
                    <div>
                        <div style={{ marginBottom: '1rem' }}><AnimatedLogo href="/" size="lg" /></div>
                        <p style={{ color: C.textSec, fontSize: '0.875rem', maxWidth: '28rem', lineHeight: 1.6 }}>{t.footer.description}</p>
                    </div>

                    <div>
                        <h4 style={{ fontWeight: 600, color: C.text, marginBottom: '1rem' }}>{t.footer.quickLinks}</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {[
                                { href: '/', label: t.nav.home },
                                { href: '/products', label: t.nav.products },
                                { href: '/contact', label: t.nav.contact },
                                { href: '/cart', label: t.nav.cart },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} style={linkStyle}
                                        onMouseEnter={(e) => e.currentTarget.style.color = C.accent}
                                        onMouseLeave={(e) => e.currentTarget.style.color = C.textSec}
                                    >{link.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ fontWeight: 600, color: C.text, marginBottom: '1rem' }}>{t.footer.legal}</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {[
                                { href: '/privacy', label: t.footer.privacy },
                                { href: '/terms', label: t.footer.terms },
                                { href: '/refund', label: t.footer.refund },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} style={linkStyle}
                                        onMouseEnter={(e) => e.currentTarget.style.color = C.accent}
                                        onMouseLeave={(e) => e.currentTarget.style.color = C.textSec}
                                    >{link.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: `1px solid ${C.border}` }}>
                    <p style={{ fontSize: '0.875rem', color: C.textSec, textAlign: 'center' }}>
                        © {new Date().getFullYear()} Service Hub. {t.footer.rights}
                    </p>
                </div>
            </div>
        </footer>
    );
}
