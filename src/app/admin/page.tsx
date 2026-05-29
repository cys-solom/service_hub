'use client';

import { useEffect, useState } from 'react';
import { useSettings } from '@/lib/settings-context';
import {
  ShoppingBag, Package, DollarSign, FolderOpen,
  TrendingUp, Clock, Calendar, CalendarDays, BarChart3, ArrowUpRight,
} from 'lucide-react';

const A = {
  bg: '#06070a', surface: '#0f1117', card: '#141928',
  border: 'rgba(255,255,255,0.07)', text: '#E8E8E8',
  textSec: '#9ca3af', textMuted: '#686868', accent: '#a78bfa',
};

interface DashboardData {
  totalOrders: number; totalProducts: number;
  totalCategories: number; totalRevenue: number;
  todayRevenue: number; weekRevenue: number; monthRevenue: number;
  dailyRevenue: { date: string; amount: number }[];
  monthlyRevenue: { month: string; amount: number }[];
  recentOrders: { id: string; orderCode: string; customerName: string; totalPrice: number; status: string; createdAt: string }[];
  topProducts: { id: string; name: string; orderCount: number; images: string[] }[];
  ordersByStatus: Record<string, number>;
}

const STATUS_BADGE: Record<string, string> = {
  New:          'adm-badge--blue',
  SentToWhatsApp: 'adm-badge--green',
  InProgress:   'adm-badge--amber',
  Completed:    'adm-badge--green',
  Cancelled:    'adm-badge--red',
};

export default function AdminDashboard() {
  const [data,       setData]       = useState<DashboardData | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [revenueTab, setRevenueTab] = useState<'daily' | 'monthly'>('daily');
  const { currencySymbol } = useSettings();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    fetch('/api/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const chartData = revenueTab === 'daily' ? (data?.dailyRevenue || []) : (data?.monthlyRevenue || []);
  const maxAmount = Math.max(...chartData.map((d) => d.amount), 1);

  const card = (content: React.ReactNode, style?: React.CSSProperties) => (
    <div style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 16, ...style }}>
      {content}
    </div>
  );

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1rem' }}>
        {[1,2,3,4].map((i) => (
          <div key={i} style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 16, padding: '1.25rem' }}>
            <div className="sk" style={{ width: 42, height: 42, borderRadius: 12, marginBottom: 12 }} />
            <div className="sk" style={{ height: 12, width: '50%', borderRadius: 5, marginBottom: 8 }} />
            <div className="sk" style={{ height: 28, width: '70%', borderRadius: 8 }} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1rem' }}>
        {[
          { icon: ShoppingBag, label: 'Total Orders',   value: data?.totalOrders ?? 0,   grad: 'from-violet-500 to-purple-600', col: '#8b5cf6' },
          { icon: DollarSign,  label: 'Total Revenue',  value: `${(data?.totalRevenue ?? 0).toFixed(2)} ${currencySymbol}`, grad: 'from-emerald-500 to-teal-600', col: '#10b981' },
          { icon: Package,     label: 'Products',       value: data?.totalProducts ?? 0,  grad: 'from-blue-500 to-cyan-600', col: '#3b82f6' },
          { icon: FolderOpen,  label: 'Categories',     value: data?.totalCategories ?? 0,grad: 'from-amber-500 to-orange-600', col: '#f59e0b' },
        ].map((stat, i) => (
          <div key={i} className="card-stagger" style={{ '--delay': `${i * 60}ms` } as React.CSSProperties}>
            {card(
              <div style={{ padding: '1.25rem' }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: `${stat.col}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.875rem' }}>
                  <stat.icon style={{ width: 20, height: 20, color: stat.col }} />
                </div>
                <p style={{ fontSize: '0.75rem', color: A.textMuted, marginBottom: '0.3rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
                <p style={{ fontSize: '1.6rem', fontWeight: 800, color: A.text, lineHeight: 1 }}>{stat.value}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Revenue Period ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1rem' }}>
        {[
          { icon: Clock,       label: 'Today',      value: data?.todayRevenue ?? 0,  color: '#3b82f6' },
          { icon: CalendarDays,label: 'This Week',   value: data?.weekRevenue ?? 0,   color: '#8b5cf6' },
          { icon: Calendar,    label: 'This Month',  value: data?.monthRevenue ?? 0,  color: '#10b981' },
        ].map((p) => (
          card(
            <div key={p.label} style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${p.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <p.icon style={{ width: 22, height: 22, color: p.color }} />
              </div>
              <div>
                <p style={{ fontSize: '0.72rem', color: A.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{p.label}</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: A.text }}>{p.value.toFixed(2)} {currencySymbol}</p>
              </div>
            </div>,
          )
        ))}
      </div>

      {/* ── Revenue Chart ── */}
      {card(
        <div style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 style={{ width: 18, height: 18, color: A.accent }} />
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: A.text, margin: 0 }}>Revenue Overview</h2>
            </div>
            <div style={{ display: 'flex', borderRadius: 10, overflow: 'hidden', border: `1px solid ${A.border}` }}>
              {(['daily', 'monthly'] as const).map((tab) => (
                <button key={tab} onClick={() => setRevenueTab(tab)} style={{
                  padding: '0.35rem 0.875rem', fontSize: '0.78rem', fontWeight: 600,
                  background: revenueTab === tab ? '#7c3aed' : 'transparent',
                  color: revenueTab === tab ? '#fff' : A.textSec,
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {chartData.length > 0 ? chartData.slice(-10).map((item, i) => {
              const pct = (item.amount / maxAmount) * 100;
              const label = revenueTab === 'daily'
                ? new Date(((item as unknown) as Record<string,string>).date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : new Date(((item as unknown) as Record<string,string>).month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.72rem', color: A.textMuted, width: 56, textAlign: 'end', flexShrink: 0 }}>{label}</span>
                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 99, height: 28, overflow: 'hidden', position: 'relative' }}>
                    <div style={{
                      width: `${Math.max(pct, 2)}%`, height: '100%',
                      background: 'linear-gradient(90deg,#7c3aed,#a78bfa)',
                      borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                      padding: '0 0.625rem',
                      transition: 'width 0.8s cubic-bezier(0.22,1,0.36,1)',
                    }}>
                      {pct > 18 && <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>{item.amount.toFixed(0)} {currencySymbol}</span>}
                    </div>
                    {pct <= 18 && <span style={{ position: 'absolute', right: '0.625rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', color: A.textMuted }}>{item.amount.toFixed(0)} {currencySymbol}</span>}
                  </div>
                </div>
              );
            }) : <p style={{ textAlign: 'center', color: A.textMuted, padding: '2rem 0', fontSize: '0.875rem' }}>No revenue data yet</p>}
          </div>
        </div>
      )}

      {/* ── Recent Orders + Top Products ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.25rem' }}>

        {/* Recent Orders */}
        {card(
          <div style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock style={{ width: 18, height: 18, color: A.accent }} />
                <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: A.text, margin: 0 }}>Recent Orders</h2>
              </div>
              <a href="/admin/orders" style={{ fontSize: '0.72rem', color: A.accent, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                View all <ArrowUpRight style={{ width: 13, height: 13 }} />
              </a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {data?.recentOrders?.length ? data.recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: 12, background: 'rgba(255,255,255,0.03)' }}>
                  <div>
                    <p style={{ fontSize: '0.82rem', fontWeight: 600, color: A.text }}>{order.orderCode}</p>
                    <p style={{ fontSize: '0.72rem', color: A.textMuted }}>{order.customerName}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.82rem', fontWeight: 700, color: A.text }}>{order.totalPrice.toFixed(2)} {currencySymbol}</p>
                    <span className={`adm-badge ${STATUS_BADGE[order.status] ?? 'adm-badge--gray'}`}>{order.status}</span>
                  </div>
                </div>
              )) : <p style={{ textAlign: 'center', color: A.textMuted, padding: '1.5rem 0', fontSize: '0.875rem' }}>No orders yet</p>}
            </div>
          </div>
        )}

        {/* Top Products */}
        {card(
          <div style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp style={{ width: 18, height: 18, color: A.accent }} />
                <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: A.text, margin: 0 }}>Top Products</h2>
              </div>
              <a href="/admin/products" style={{ fontSize: '0.72rem', color: A.accent, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                View all <ArrowUpRight style={{ width: 13, height: 13 }} />
              </a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {data?.topProducts?.map((product, i) => (
                <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: 12, background: 'rgba(255,255,255,0.03)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: A.textMuted, width: 20, textAlign: 'center' }}>#{i + 1}</span>
                  <div style={{ width: 36, height: 36, borderRadius: '22%', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                    {product.images?.[0]
                      ? <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 'inherit' }} />
                      : <Package style={{ width: 18, height: 18, color: A.accent }} />}
                  </div>
                  <p style={{ flex: 1, fontSize: '0.82rem', fontWeight: 500, color: A.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: A.accent, flexShrink: 0 }}>{product.orderCount} orders</span>
                </div>
              )) ?? <p style={{ textAlign: 'center', color: A.textMuted, padding: '1.5rem 0', fontSize: '0.875rem' }}>No data yet</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
