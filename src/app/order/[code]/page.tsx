'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { CheckCircle, Clock, Package, XCircle, AlertCircle, ArrowLeft, Copy, Check } from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; labelAr: string; color: string; icon: React.ElementType; bg: string }> = {
  New:            { label: 'New',             labelAr: 'جديد',           color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',    icon: Clock        },
  SentToWhatsApp: { label: 'Sent to WhatsApp', labelAr: 'تم الإرسال',   color: '#34d399', bg: 'rgba(52,211,153,0.1)',   icon: CheckCircle  },
  InProgress:     { label: 'In Progress',     labelAr: 'قيد التنفيذ',    color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',   icon: Package      },
  Completed:      { label: 'Completed',       labelAr: 'مكتمل',          color: '#22c55e', bg: 'rgba(34,197,94,0.1)',    icon: CheckCircle  },
  Cancelled:      { label: 'Cancelled',       labelAr: 'ملغي',           color: '#f87171', bg: 'rgba(248,113,113,0.1)', icon: XCircle      },
};

interface OrderItem { productName: string; variant: string; price: number; quantity: number }
interface Order {
  orderCode: string; customerName: string; status: string;
  totalPrice: number; items: OrderItem[]; createdAt: string; notes?: string;
}

export default function OrderTrackingPage() {
  const { code } = useParams<{ code: string }>();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const isDark = !mounted || resolvedTheme !== 'light';
  const D = isDark
    ? { surface: '#101010', border: 'rgba(255,255,255,0.07)', text: '#E8E8E8', textSec: '#9a9a9a', textMuted: '#7a7a7a' }
    : { surface: '#ffffff', border: 'rgba(0,0,0,0.09)', text: '#0d0f14', textSec: '#1f2937', textMuted: '#4b5563' };
  const [order, setOrder]     = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [copied, setCopied]   = useState(false);

  useEffect(() => {
    if (!code) return;
    fetch(`/api/public/order/${encodeURIComponent(code)}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); }
        else { setOrder(data); }
        setLoading(false);
      })
      .catch(() => { setError('Failed to load order'); setLoading(false); });
  }, [code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(order?.orderCode || code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusCfg = order ? (STATUS_CONFIG[order.status] || STATUS_CONFIG.New) : null;

  return (
    <div style={{ minHeight: '100vh', padding: '5rem 1.25rem 4rem', maxWidth: 640, margin: '0 auto' }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: D.textMuted, textDecoration: 'none', fontSize: '0.85rem', marginBottom: '2rem' }}>
        <ArrowLeft style={{ width: 16, height: 16 }} /> Back to home
      </Link>

      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: D.text, marginBottom: '0.25rem', letterSpacing: '-0.025em' }}>
        Order Tracking
      </h1>
      <p style={{ color: D.textMuted, fontSize: '0.85rem', marginBottom: '2rem' }}>
        Track your order status in real time
      </p>

      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: D.textMuted }}>
          <div className="sk" style={{ width: 200, height: 16, borderRadius: 8, margin: '0 auto 12px' }} />
          <div className="sk" style={{ width: 140, height: 12, borderRadius: 6, margin: '0 auto' }} />
        </div>
      )}

      {error && !loading && (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <AlertCircle style={{ width: 48, height: 48, color: '#f87171', margin: '0 auto 1rem' }} />
          <p style={{ color: '#f87171', fontWeight: 600, marginBottom: '0.5rem' }}>{error}</p>
          <p style={{ color: D.textMuted, fontSize: '0.82rem', marginBottom: '1.5rem' }}>
            Make sure you entered the correct order code.
          </p>
          <Link href="/products" style={{ padding: '0.65rem 1.5rem', borderRadius: 12, background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
            Browse products
          </Link>
        </div>
      )}

      {order && statusCfg && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Status card */}
          <div style={{ background: statusCfg.bg, border: `1px solid ${statusCfg.color}40`, borderRadius: 20, padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', textAlign: 'center' }}>
            <statusCfg.icon style={{ width: 48, height: 48, color: statusCfg.color }} />
            <div>
              <p style={{ fontSize: '0.75rem', color: D.textMuted, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Order Status</p>
              <p style={{ fontSize: '1.4rem', fontWeight: 800, color: statusCfg.color }}>
                {statusCfg.label}
              </p>
              <p style={{ fontSize: '0.85rem', color: D.textSec, marginTop: 4 }}>{statusCfg.labelAr}</p>
            </div>
          </div>

          {/* Order details */}
          <div style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: 20, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '0.7rem', color: D.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Order Code</p>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: D.text, fontFamily: 'monospace' }}>{order.orderCode}</p>
              </div>
              <button onClick={handleCopy} style={{ padding: '0.45rem 0.9rem', borderRadius: 10, background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', color: '#a78bfa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'inherit' }}>
                {copied ? <><Check style={{ width: 13, height: 13 }} />Copied</> : <><Copy style={{ width: 13, height: 13 }} />Copy</>}
              </button>
            </div>
            <div style={{ height: 1, background: D.border }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <p style={{ fontSize: '0.7rem', color: D.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Customer</p>
                <p style={{ fontSize: '0.9rem', color: D.text, fontWeight: 600 }}>{order.customerName}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.7rem', color: D.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Date</p>
                <p style={{ fontSize: '0.9rem', color: D.text, fontWeight: 600 }}>{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: 20, padding: '1.25rem' }}>
            <p style={{ fontSize: '0.75rem', color: D.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>Items</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {order.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: D.text, marginBottom: 2 }}>{item.productName}</p>
                    <p style={{ fontSize: '0.75rem', color: D.textSec }}>{item.variant}</p>
                    {item.quantity > 1 && <p style={{ fontSize: '0.7rem', color: D.textMuted }}>× {item.quantity}</p>}
                  </div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#a78bfa', whiteSpace: 'nowrap' }}>{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div style={{ height: 1, background: D.border, margin: '0.875rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: D.text }}>Total</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#22c55e' }}>{order.totalPrice.toFixed(2)}</p>
            </div>
          </div>

          {order.notes && (
            <div style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 14, padding: '1rem' }}>
              <p style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Notes</p>
              <p style={{ fontSize: '0.85rem', color: D.textSec }}>{order.notes}</p>
            </div>
          )}

          <Link href="/products" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: 14, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Continue Shopping
          </Link>
        </div>
      )}
    </div>
  );
}
