'use client';

import { useCallback, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import AnimatedLogo from '@/components/AnimatedLogo';
import {
  LayoutDashboard, Package, FolderOpen,
  ShoppingBag, Tag, Settings, FileText,
  LogOut, Menu, X, ChevronRight, Gift, Zap, Star,
} from 'lucide-react';

const A = {
  bg: '#06070a', surface: '#0f1117', card: '#141928',
  border: 'rgba(255,255,255,0.07)', text: '#E8E8E8',
  textSec: '#9a9a9a', accent: '#a78bfa', accentSolid: '#7c3aed',
};

const sidebarLinks = [
  { href: '/admin',                icon: LayoutDashboard, label: 'Dashboard'   },
  { href: '/admin/products',       icon: Package,         label: 'Products'    },
  { href: '/admin/quick-products', icon: Zap,             label: 'Quick Edit'  },
  { href: '/admin/categories',     icon: FolderOpen,      label: 'Categories'  },
  { href: '/admin/orders',         icon: ShoppingBag,     label: 'Orders'      },
  { href: '/admin/reviews',        icon: Star,            label: 'Reviews'     },
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
  const [newOrders,     setNewOrders]     = useState(0);

  useEffect(() => {
    if (pathname === '/admin/login') { setChecking(false); return; }
    fetch('/api/auth/verify', { credentials: 'include' })
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(() => { setAuthenticated(true); setChecking(false); })
      .catch(() => { router.push('/admin/login'); });
  }, [pathname, router]);

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  const fetchNewOrdersCount = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/orders/count', { credentials: 'include' });
      if (res.ok) {
        const { count } = await res.json();
        setNewOrders(count ?? 0);
      }
    } catch { /* noop */ }
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    fetchNewOrdersCount();
    const interval = setInterval(fetchNewOrdersCount, 30_000);
    return () => clearInterval(interval);
  }, [authenticated, fetchNewOrdersCount]);

  // Clear badge when visiting orders page
  useEffect(() => {
    if (pathname === '/admin/orders') setNewOrders(0);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    try { localStorage.removeItem('admin_token'); } catch { /* SSR-safe */ }
    router.push('/admin/login');
  };

  if (pathname === '/admin/login') return <>{children}</>;

  if (checking) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: A.bg }}>
      <div className="admin-loader" />
    </div>
  );

  if (!authenticated) return null;

  const currentLabel = sidebarLinks.find((l) => l.href === pathname)?.label
    ?? sidebarLinks.find((l) => pathname.startsWith(l.href + '/'))?.label
    ?? 'Admin';

  return (
    <div className="admin-dark" style={{ display: 'flex', minHeight: '100vh', background: A.bg, color: A.text }}>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="admin-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}
      >
        <div style={{ padding: '1.25rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${A.border}` }}>
          <AnimatedLogo href="/admin" size="md" />
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden"
            style={{ padding: '0.5rem', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.05)', color: A.textSec, cursor: 'pointer' }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        <nav style={{ flex: 1, padding: '0.75rem 0.75rem', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {sidebarLinks.map((link) => {
            const active = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
            const isOrders = link.href === '/admin/orders';
            return (
              <Link key={link.href} href={link.href} className={`admin-nav-link ${active ? 'admin-nav-link--active' : ''}`}
                style={{ position: 'relative' }}>
                {active && <div className="admin-nav-indicator" />}
                <link.icon style={{ width: 18, height: 18, flexShrink: 0 }} />
                {link.label}
                {isOrders && newOrders > 0 && (
                  <span style={{
                    marginLeft: 'auto',
                    background: '#ef4444',
                    color: 'white',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 5px',
                    lineHeight: 1,
                    boxShadow: '0 0 8px rgba(239,68,68,0.6)',
                    animation: 'badgePulse 2s ease infinite',
                  }}>
                    {newOrders > 99 ? '99+' : newOrders}
                  </span>
                )}
                {active && !isOrders && <ChevronRight style={{ width: 14, height: 14, marginLeft: 'auto', opacity: 0.5 }} />}
                {active && isOrders && newOrders === 0 && <ChevronRight style={{ width: 14, height: 14, marginLeft: 'auto', opacity: 0.5 }} />}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '0.75rem', borderTop: `1px solid ${A.border}` }}>
          <button onClick={handleLogout} className="admin-logout-btn">
            <LogOut style={{ width: 18, height: 18 }} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', marginLeft: 0 }}
        className="lg:!ml-[240px]"
      >
        {/* Header */}
        <header className="admin-header">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden admin-hamburger">
            <Menu style={{ width: 20, height: 20 }} />
            {newOrders > 0 && (
              <span style={{
                position: 'absolute', top: 6, right: 6,
                width: 8, height: 8, borderRadius: '50%',
                background: '#ef4444',
                boxShadow: '0 0 6px rgba(239,68,68,0.8)',
              }} />
            )}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
            <span style={{ fontSize: '0.75rem', color: A.textSec }}>Admin</span>
            <ChevronRight style={{ width: 14, height: 14, color: A.textSec }} />
            <h1 style={{ fontSize: '0.9rem', fontWeight: 600, color: A.text, margin: 0 }}>{currentLabel}</h1>
            {pathname !== '/admin/orders' && newOrders > 0 && (
              <Link href="/admin/orders" style={{
                marginLeft: '0.5rem',
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#f87171',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 6,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}>
                🔴 {newOrders} new order{newOrders !== 1 ? 's' : ''}
              </Link>
            )}
          </div>

          <Link href="/" target="_blank" className="admin-store-link">
            View Store ↗
          </Link>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '1.5rem 1.25rem 3rem', overflowX: 'hidden' }}>
          {children}
        </main>
      </div>

      <style>{`
        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 0 8px rgba(239,68,68,0.6); }
          50%       { box-shadow: 0 0 16px rgba(239,68,68,0.9); }
        }
      `}</style>
    </div>
  );
}
