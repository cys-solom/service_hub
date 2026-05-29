'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useCart } from '@/lib/cart-context';
import { useI18n } from '@/lib/i18n';
import AnimatedLogo from '@/components/AnimatedLogo';
import { ShoppingCart, Sun, Moon, Menu, X, Globe } from 'lucide-react';

const C = {
    bgNav: 'rgba(6,7,10,0.85)', border: '#374151',
    text: '#9ca3af', textHover: '#a78bfa',
    hoverBg: '#1f2937',
};

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();
    const { itemCount } = useCart();
    const { t, locale, setLocale } = useI18n();

    useEffect(() => { setMounted(true); }, []);

    const navLinks = [
        { href: '/', label: t.nav.home },
        { href: '/products', label: t.nav.products },
        { href: '/contact', label: t.nav.contact },
    ];

    const navStyle: React.CSSProperties = {
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        background: C.bgNav, borderBottom: `1px solid ${C.border}`,
        maxWidth: '100vw', overflow: 'hidden',
    };

    const btnStyle: React.CSSProperties = {
        padding: '0.5rem', borderRadius: '0.75rem', color: C.text,
        background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '0.375rem',
        fontSize: '0.875rem', fontWeight: 500,
    };

    return (
        <nav style={navStyle}>
            <div style={{ maxWidth: '80rem', width: '100%', boxSizing: 'border-box', margin: '0 auto', padding: '0 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4rem' }}>
                    <AnimatedLogo href="/" size="md" />

                    {/* Desktop Nav */}
                    <div className="hidden md:flex" style={{ alignItems: 'center', gap: '2rem' }}>
                        {navLinks.map((link) => (
                            <Link key={link.href} href={link.href}
                                style={{ fontSize: '0.875rem', fontWeight: 500, color: C.text, textDecoration: 'none' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = C.textHover}
                                onMouseLeave={(e) => e.currentTarget.style.color = C.text}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <button onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')} style={btnStyle} aria-label="Toggle language">
                            <Globe style={{ width: 16, height: 16 }} />
                            <span className="hidden sm:inline">{t.nav.toggleLang}</span>
                        </button>

                        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={btnStyle} aria-label={t.nav.toggleTheme}>
                            {mounted ? (theme === 'dark' ? <Sun style={{ width: 20, height: 20 }} /> : <Moon style={{ width: 20, height: 20 }} />) : <div style={{ width: 20, height: 20 }} />}
                        </button>

                        <Link href="/cart" style={{ ...btnStyle, position: 'relative', textDecoration: 'none' }}>
                            <ShoppingCart style={{ width: 20, height: 20 }} />
                            {mounted && itemCount > 0 && (
                                <span style={{ position: 'absolute', top: -4, right: -4, width: 20, height: 20, background: 'linear-gradient(135deg, #7c3aed, #6366f1)', color: 'white', fontSize: '0.7rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                                    {itemCount}
                                </span>
                            )}
                        </Link>

                        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden" style={btnStyle}>
                            {isOpen ? <X style={{ width: 20, height: 20 }} /> : <Menu style={{ width: 20, height: 20 }} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <div className="md:hidden" style={{ borderTop: `1px solid ${C.border}`, background: 'rgba(6,7,10,0.95)', backdropFilter: 'blur(20px)', padding: '0.5rem 1rem 1rem' }}>
                    {navLinks.map((link) => (
                        <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)}
                            style={{ display: 'block', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 500, color: C.text, textDecoration: 'none' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = C.hoverBg}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    );
}
