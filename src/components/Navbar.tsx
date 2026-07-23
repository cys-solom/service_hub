'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useCart } from '@/lib/cart-context';
import { useI18n } from '@/lib/i18n';
import { useSettings } from '@/lib/settings-context';
import AnimatedLogo from '@/components/AnimatedLogo';
import { ShoppingCart, Sun, Moon, Globe, Home, Package, Phone, Heart } from 'lucide-react';
import { useWishlist } from '@/lib/wishlist-context';

const DARK_C = {
  bgNav: 'rgba(6,7,10,0.88)', border: 'rgba(255,255,255,0.08)',
  text: '#9ca3af', textHover: '#a78bfa',
  hoverBg: 'rgba(255,255,255,0.05)',
  activeText: '#a78bfa', activeBg: 'rgba(139,92,246,0.10)',
  activeAccent: '#a78bfa',
};
const LIGHT_C = {
  bgNav: 'rgba(240,241,248,0.96)', border: 'rgba(0,0,0,0.09)',
  text: '#1f2937',
  textHover: '#0d0f14',
  hoverBg: 'rgba(0,0,0,0.06)',
  activeText: '#4c1d95', activeBg: 'rgba(91,33,182,0.12)',
  activeAccent: '#5b21b6',
};

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const C = mounted && resolvedTheme === 'light' ? LIGHT_C : DARK_C;
  const { itemCount } = useCart();
  const { count: wishCount } = useWishlist();
  const { t, locale, setLocale } = useI18n();
  const { displaySymbol, toggleDisplayCurrency, canSwitchCurrency, displayCurrency } = useSettings();
  const pathname = usePathname();

  useEffect(() => { setMounted(true); }, []);

  const navLinks = [
    { href: '/',         label: t.nav.home,     icon: Home    },
    { href: '/products', label: t.nav.products,  icon: Package },
    { href: '/contact',  label: t.nav.contact,   icon: Phone   },
  ];

  const navStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
    backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
    background: C.bgNav, borderBottom: `1px solid ${C.border}`,
  };

  const iconBtn: React.CSSProperties = {
    padding: '0.5rem', borderRadius: '0.75rem', color: C.text,
    background: 'none', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '0.375rem',
    fontSize: '0.875rem', fontWeight: 500, minHeight: 44, minWidth: 44,
    justifyContent: 'center',
  };

  return (
    <>
      {/* ── Top Navbar ── */}
      <nav style={navStyle} aria-label="Main navigation">
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '3.75rem' }}>
            <AnimatedLogo href="/" size="md" />

            {/* Nav links — visible on sm+ */}
            <div className="hidden sm:flex" style={{ alignItems: 'center', gap: '0.25rem' }}>
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link key={link.href} href={link.href} style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '0.75rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: active ? C.activeText : C.text,
                    background: active ? C.activeBg : 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={(e) => {
                      if (!active) e.currentTarget.style.color = C.textHover;
                      if (!active) e.currentTarget.style.background = C.hoverBg;
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.color = C.text;
                      if (!active) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Right actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.125rem' }}>
              {/* Currency toggle — only shown when exchange rate is configured */}
              {mounted && canSwitchCurrency && (
                <button
                  onClick={toggleDisplayCurrency}
                  style={{ ...iconBtn, fontSize: '0.72rem', fontWeight: 700, gap: '0.2rem', minWidth: 'auto', padding: '0.4rem 0.6rem', letterSpacing: '0.02em', color: displayCurrency === 'usd' ? C.activeText : C.text, background: displayCurrency === 'usd' ? C.activeBg : 'none', borderRadius: '0.625rem' }}
                  aria-label="Toggle display currency"
                  title={displayCurrency === 'usd' ? 'Switch to EGP' : 'Switch to USD'}
                >
                  {displaySymbol}
                </button>
              )}

              <button
                onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
                style={iconBtn} aria-label="Toggle language"
              >
                <Globe style={{ width: 18, height: 18 }} />
                <span className="hidden sm:inline" style={{ fontSize: '0.8rem' }}>{t.nav.toggleLang}</span>
              </button>

              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                style={iconBtn} aria-label={t.nav.toggleTheme}
              >
                {mounted
                  ? (theme === 'dark' ? <Sun style={{ width: 19, height: 19 }} /> : <Moon style={{ width: 19, height: 19 }} />)
                  : <div style={{ width: 19, height: 19 }} />}
              </button>

              {/* Wishlist */}
              <Link href="/wishlist" style={{ ...iconBtn, position: 'relative', textDecoration: 'none' }} aria-label="Wishlist">
                <Heart style={{ width: 19, height: 19 }} />
                {mounted && wishCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 4, right: 4,
                    width: 16, height: 16,
                    background: '#ef4444',
                    color: '#fff', fontSize: '0.6rem', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, lineHeight: 1,
                  }}>
                    {wishCount > 9 ? '9+' : wishCount}
                  </span>
                )}
              </Link>

              {/* Cart — visible on all sizes */}
              <Link href="/cart" style={{ ...iconBtn, position: 'relative', textDecoration: 'none' }} aria-label="Cart">
                <ShoppingCart style={{ width: 20, height: 20 }} />
                {mounted && itemCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 4, right: 4,
                    width: 18, height: 18,
                    background: 'linear-gradient(135deg,#7c3aed,#6366f1)',
                    color: '#fff', fontSize: '0.65rem', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, lineHeight: 1,
                  }}>
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>

            </div>
          </div>
        </div>

      </nav>

      {/* ── Bottom Tab Bar (phones only, max-width 640px) ── */}
      <nav className="bottom-nav sm:hidden" aria-label="Bottom navigation">
        {navLinks.map((link) => {
          const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`bottom-nav-item${active ? ' active' : ''}`}
            >
              <link.icon />
              <span>{link.label}</span>
            </Link>
          );
        })}

        {/* Cart tab */}
        <Link
          href="/cart"
          className={`bottom-nav-item${pathname === '/cart' ? ' active' : ''}`}
          style={{ position: 'relative' }}
        >
          <span style={{ position: 'relative', display: 'inline-flex' }}>
            <ShoppingCart />
            {mounted && itemCount > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -6,
                width: 16, height: 16,
                background: 'linear-gradient(135deg,#7c3aed,#6366f1)',
                color: '#fff', fontSize: '0.6rem',
                borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontWeight: 700,
              }}>
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </span>
          <span>{t.nav.cart}</span>
        </Link>
      </nav>
    </>
  );
}
