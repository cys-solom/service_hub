'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import AnimatedLogo from '@/components/AnimatedLogo';
import {
  LayoutDashboard, Package, FolderOpen,
  ShoppingBag, Tag, Settings, FileText,
  LogOut, Menu, X, ChevronRight, Gift, Zap,
} from 'lucide-react';

const A = {
  bg: '#06070a', surface: '#0f1117', card: '#141928',
  border: 'rgba(255,255,255,0.07)', text: '#E8E8E8',
  textSec: '#9a9a9a', accent: '#a78bfa', accentSolid: '#7c3aed',  /* textSec: was #686868 */
};

const sidebarLinks = [
  { href: '/admin',                icon: LayoutDashboard, label: 'Dashboard'   },
  { href: '/admin/products',       icon: Package,         label: 'Products'    },
  { href: '/admin/quick-products', icon: Zap,             label: 'Quick Edit'  },
  { href: '/admin/categories',     icon: FolderOpen,      label: 'Categories'  },
  { href: '/admin/orders',         icon: ShoppingBag,     label: 'Orders'      },
  { href: '/admin/coupons',        icon: Tag,             label: 'Coupons'     },
  { href: '/admin/bundles',        icon: Gift,            label: 'Bundles'     },
  { href: '/admin/content',        icon: FileText,        label: 'Content'     },
  { href: '/admin/settings',       icon: Settings,        label: 'Settings'    },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router    = useRouter();
  const pathname  = usePathname();
  const [authenticated, setAuthenticated] = useState(false);
  const [checking,      setChecking]      = useState(true);
  const [sidebarOpen,   setSidebarOpen]   = useState(false);

  useEffect(() => {
    if (pathname === '/admin/login') { setChecking(false); return; }
    // Verify session using httpOnly cookie — no localStorage needed
    fetch('/api/auth/verify', { credentials: 'include' })
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(() => { setAuthenticated(true); setChecking(false); })
      .catch(() => { router.push('/admin/login'); });
  }, [pathname, router]);

  // Close sidebar on navigation
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    // Clean up any legacy localStorage token from older versions
    try { localStorage.removeItem('admin_token'); } catch { /* SSR-safe */ }
    router.push('/admin/login');
  };

  if (pathname === '/admin/login') return <>{children}</>;

  if (checking) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: A.bg }}>
      <div style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: A.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  if (!authenticated) return null;

  const currentLabel = sidebarLinks.find((l) => l.href === pathname)?.label
    ?? sidebarLinks.find((l) => pathname.startsWith(l.href + '/'))?.label
    ?? 'Admin';

  return (
    <div className="admin-dark" style={{ display: 'flex', minHeight: '100vh', background: A.bg, color: A.text }}>

      {/* ── Sidebar overlay (mobile) ── */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 39, backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: 240, zIndex: 40,
        background: A.surface,
        borderRight: `1px solid ${A.border}`,
        display: 'flex', flexDirection: 'column',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
      }}
        // Always visible on lg+
        className="lg:!translate-x-0"
      >
        {/* Logo + close */}
        <div style={{ padding: '1.25rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${A.border}` }}>
          <AnimatedLogo href="/admin" size="md" />
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden"
            style={{ padding: '0.5rem', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.05)', color: A.textSec, cursor: 'pointer' }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.75rem 0.75rem', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {sidebarLinks.map((link) => {
            const active = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
            return (
              <Link key={link.href} href={link.href} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.625rem 0.875rem',
                borderRadius: 12,
                fontSize: '0.875rem', fontWeight: 500,
                color: active ? A.accent : A.textSec,
                background: active ? 'rgba(139,92,246,0.1)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s',
                position: 'relative',
              }}
                onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = A.text; } }}
                onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = A.textSec; } }}
              >
                {active && <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3, background: A.accent, borderRadius: '0 4px 4px 0' }} />}
                <link.icon style={{ width: 18, height: 18, flexShrink: 0 }} />
                {link.label}
                {active && <ChevronRight style={{ width: 14, height: 14, marginLeft: 'auto', opacity: 0.5 }} />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '0.75rem', borderTop: `1px solid ${A.border}` }}>
          <button onClick={handleLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.625rem 0.875rem', borderRadius: 12, border: 'none',
            background: 'rgba(239,68,68,0.06)', color: '#f87171',
            fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
            transition: 'background 0.15s', fontFamily: 'inherit',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; }}
          >
            <LogOut style={{ width: 18, height: 18 }} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', marginLeft: 0 }}
        className="lg:!ml-[240px]"
      >
        {/* Header */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 30,
          background: 'rgba(6,7,10,0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${A.border}`,
          padding: '0 1.25rem',
          height: '3.75rem',
          display: 'flex', alignItems: 'center', gap: '1rem',
        }}>
          {/* Hamburger */}
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden"
            style={{ padding: '0.5rem', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.05)', color: A.textSec, cursor: 'pointer', display: 'flex' }}>
            <Menu style={{ width: 20, height: 20 }} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
            <span style={{ fontSize: '0.75rem', color: A.textSec }}>Admin</span>
            <ChevronRight style={{ width: 14, height: 14, color: A.textSec }} />
            <h1 style={{ fontSize: '0.9rem', fontWeight: 600, color: A.text, margin: 0 }}>{currentLabel}</h1>
          </div>

          <Link href="/" target="_blank" style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            fontSize: '0.75rem', color: A.textSec, textDecoration: 'none',
            padding: '0.375rem 0.75rem', borderRadius: 8,
            border: `1px solid ${A.border}`,
            transition: 'all 0.15s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.color = A.accent; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = A.textSec; e.currentTarget.style.borderColor = A.border; }}
          >
            View Store ↗
          </Link>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '1.5rem 1.25rem 3rem', overflowX: 'hidden' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
