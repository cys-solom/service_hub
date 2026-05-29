'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useCart } from '@/lib/cart-context';
import { useI18n } from '@/lib/i18n';
import AnimatedLogo from '@/components/AnimatedLogo';
import { ShoppingCart, Sun, Moon, Globe, Home, Package, Phone, X, Menu } from 'lucide-react';

const C = {
  bgNav: 'rgba(6,7,10,0.88)', border: 'rgba(255,255,255,0.08)',
  text: '#9ca3af', textHover: '#a78bfa',
  hoverBg: 'rgba(255,255,255,0.05)',
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { itemCount } = useCart();
  const { t, locale, setLocale } = useI18n();
  const pathname = usePathname();

  useEffect(() => { setMounted(true); }, []);
  // Close menu on route change
  useEffect(() => { setIsOpen(false); }, [pathname]);

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

            {/* Desktop links */}
            <div className="hidden md:flex" style={{ alignItems: 'center', gap: '0.25rem' }}>
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link key={link.href} href={link.href} style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '0.75rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: active ? '#a78bfa' : C.text,
                    background: active ? 'rgba(139,92,246,0.1)' : 'transparent',
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

              {/* Hamburger (tablet only — phones use bottom nav) */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="hidden sm:flex md:hidden"
                style={iconBtn}
                aria-label="Menu"
              >
                {isOpen ? <X style={{ width: 20, height: 20 }} /> : <Menu style={{ width: 20, height: 20 }} />}
              </button>
            </div>
          </div>
        </div>

        {/* Tablet dropdown */}
        {isOpen && (
          <div
            className="hidden sm:block md:hidden"
            style={{
              borderTop: `1px solid ${C.border}`,
              background: 'rgba(6,7,10,0.97)',
              backdropFilter: 'blur(24px)',
              padding: '0.5rem 1rem 1rem',
            }}
          >
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem 1rem', borderRadius: '0.75rem',
                  fontSize: '0.875rem', fontWeight: 500,
                  color: active ? '#a78bfa' : C.text, textDecoration: 'none',
                  background: active ? 'rgba(139,92,246,0.08)' : 'transparent',
                }}>
                  <link.icon style={{ width: 18, height: 18 }} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
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
          <span>Cart</span>
        </Link>
      </nav>
    </>
  );
}
