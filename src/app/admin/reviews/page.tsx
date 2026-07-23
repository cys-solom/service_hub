'use client';

import { useEffect, useState } from 'react';
import { Check, Trash2, Star, Clock } from 'lucide-react';
import { adminFetch, adminJsonFetch } from '@/lib/admin-fetch';
import { AdminToast, useAdminToast } from '@/components/admin/AdminToast';

interface Review {
  id: string;
  productId: string;
  name: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

function Stars({ value }: { value: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} style={{ width: 12, height: 12, fill: value >= i ? '#fbbf24' : 'transparent', color: value >= i ? '#fbbf24' : 'rgba(255,255,255,0.15)' }} />
      ))}
    </span>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews]   = useState<Review[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter,  setFilter]    = useState<'all' | 'pending' | 'approved'>('all');
  const { toast, showToast, closeToast } = useAdminToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/reviews');
      const d   = await res.json();
      setReviews(d.reviews || []);
    } catch { showToast('error', 'Failed to load reviews'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const act = async (id: string, action: 'approve' | 'delete') => {
    setReviews(prev => action === 'delete' ? prev.filter(r => r.id !== id) : prev.map(r => r.id === id ? { ...r, isApproved: true } : r));
    try {
      await adminJsonFetch('/api/admin/reviews', { method: 'PATCH', body: JSON.stringify({ id, action }) });
      showToast('success', action === 'approve' ? 'Review approved' : 'Review deleted');
    } catch { showToast('error', 'Action failed'); load(); }
  };

  const visible = reviews.filter(r =>
    filter === 'all' ? true : filter === 'pending' ? !r.isApproved : r.isApproved
  );

  const pendingCount = reviews.filter(r => !r.isApproved).length;

  return (
    <div className="space-y-6">
      <AdminToast toast={toast} onClose={closeToast} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#E8E8E8', letterSpacing: '-0.02em' }}>
            Reviews
            {pendingCount > 0 && (
              <span style={{ marginLeft: 8, fontSize: '0.75rem', background: 'rgba(251,146,60,0.15)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.3)', borderRadius: 99, padding: '2px 8px', fontWeight: 600 }}>
                {pendingCount} pending
              </span>
            )}
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(['all', 'pending', 'approved'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '0.4rem 0.875rem', borderRadius: 99, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', border: `1px solid ${filter === f ? 'rgba(139,92,246,0.6)' : 'rgba(255,255,255,0.08)'}`, background: filter === f ? 'rgba(139,92,246,0.15)' : 'transparent', color: filter === f ? '#a78bfa' : '#9a9a9a' }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span style={{ marginLeft: 5, opacity: 0.7, fontSize: '0.72rem' }}>
                {f === 'all' ? reviews.length : f === 'pending' ? pendingCount : reviews.length - pendingCount}
              </span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ color: '#666', fontSize: '0.875rem' }}>Loading...</div>
      ) : visible.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#555' }}>
          <Star style={{ width: 40, height: 40, margin: '0 auto 0.75rem', opacity: 0.3 }} />
          <p>No reviews {filter !== 'all' ? `(${filter})` : ''}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {visible.map(r => (
            <div key={r.id} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${r.isApproved ? 'rgba(255,255,255,0.07)' : 'rgba(251,146,60,0.2)'}`, borderRadius: 14, padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#a78bfa', flexShrink: 0 }}>
                {r.name[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, color: '#E8E8E8', fontSize: '0.875rem' }}>{r.name}</span>
                  <Stars value={r.rating} />
                  <span style={{ fontSize: '0.7rem', color: '#555', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Clock style={{ width: 10, height: 10 }} />{new Date(r.createdAt).toLocaleDateString()}
                  </span>
                  {!r.isApproved && (
                    <span style={{ fontSize: '0.68rem', background: 'rgba(251,146,60,0.15)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.3)', borderRadius: 99, padding: '1px 7px' }}>Pending</span>
                  )}
                  {r.isApproved && (
                    <span style={{ fontSize: '0.68rem', background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 99, padding: '1px 7px' }}>Approved</span>
                  )}
                </div>
                {r.comment && <p style={{ fontSize: '0.82rem', color: '#9a9a9a', margin: 0, lineHeight: 1.6 }}>{r.comment}</p>}
                <p style={{ fontSize: '0.7rem', color: '#444', marginTop: 4 }}>Product ID: {r.productId}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                {!r.isApproved && (
                  <button onClick={() => act(r.id, 'approve')}
                    style={{ padding: '0.4rem 0.75rem', borderRadius: 8, border: '1px solid rgba(52,211,153,0.35)', background: 'rgba(52,211,153,0.1)', color: '#34d399', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Check style={{ width: 12, height: 12 }} /> Approve
                  </button>
                )}
                <button onClick={() => act(r.id, 'delete')}
                  style={{ padding: '0.4rem 0.75rem', borderRadius: 8, border: '1px solid rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.08)', color: '#f87171', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Trash2 style={{ width: 12, height: 12 }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
