'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useI18n } from '@/lib/i18n';

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

function StarRating({ value, onChange, size = 20 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i)}
          onMouseEnter={() => onChange && setHover(i)}
          onMouseLeave={() => onChange && setHover(0)}
          style={{ background: 'none', border: 'none', padding: 1, cursor: onChange ? 'pointer' : 'default', lineHeight: 1 }}
          aria-label={`${i} star`}
        >
          <Star
            style={{
              width: size, height: size,
              fill: (hover || value) >= i ? '#fbbf24' : 'transparent',
              color: (hover || value) >= i ? '#fbbf24' : 'rgba(128,128,128,0.35)',
              transition: 'all 0.12s',
            }}
          />
        </button>
      ))}
    </div>
  );
}

function avgRating(reviews: Review[]) {
  if (!reviews.length) return 0;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}

export default function ProductReviews({ productId }: { productId: string }) {
  const { resolvedTheme } = useTheme();
  const { locale } = useI18n();
  const isAr = locale === 'ar';
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = !mounted || resolvedTheme !== 'light';
  const C = isDark
    ? { text: '#E8E8E8', textSec: '#9a9a9a', textMuted: '#666', border: 'rgba(255,255,255,0.07)', surface: '#161616', input: '#111' }
    : { text: '#0d0f14', textSec: '#4b5563', textMuted: '#9ca3af', border: 'rgba(0,0,0,0.09)', surface: '#f8f8f8', input: '#fff' };

  const [reviews,   setReviews]   = useState<Review[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [name,      setName]      = useState('');
  const [comment,   setComment]   = useState('');
  const [rating,    setRating]    = useState(0);
  const [submitting,setSubmitting]= useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState('');

  useEffect(() => {
    fetch(`/api/reviews?productId=${productId}`)
      .then(r => r.json())
      .then(d => setReviews(d.reviews || []))
      .finally(() => setLoading(false));
  }, [productId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) { setError(isAr ? 'اختر عدد النجوم' : 'Please select a rating'); return; }
    if (!name.trim()) { setError(isAr ? 'أدخل اسمك' : 'Please enter your name'); return; }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, name: name.trim(), comment: comment.trim() }),
      });
      if (res.ok) { setSubmitted(true); setName(''); setComment(''); setRating(0); }
      else { const d = await res.json(); setError(d.error || 'Error'); }
    } catch { setError('Network error'); }
    finally { setSubmitting(false); }
  }

  const avg = avgRating(reviews);
  const dist = [5,4,3,2,1].map(s => ({ star: s, count: reviews.filter(r => r.rating === s).length }));

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.6rem 0.75rem', borderRadius: 8,
    background: C.input, border: `1px solid ${C.border}`,
    color: C.text, fontSize: '0.875rem', fontFamily: 'inherit',
    outline: 'none', boxSizing: 'border-box',
  };

  return (
    <section style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: `1px solid ${C.border}` }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: C.text, marginBottom: '1.5rem' }}>
        {isAr ? 'التقييمات والمراجعات' : 'Ratings & Reviews'}
        {reviews.length > 0 && <span style={{ marginInlineStart: 8, fontSize: '0.82rem', color: C.textMuted, fontWeight: 400 }}>({reviews.length})</span>}
      </h2>

      {/* Summary */}
      {reviews.length > 0 && (
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: C.text, lineHeight: 1 }}>{avg.toFixed(1)}</div>
            <StarRating value={Math.round(avg)} size={16} />
            <div style={{ fontSize: '0.72rem', color: C.textMuted, marginTop: 4 }}>
              {reviews.length} {isAr ? 'تقييم' : 'reviews'}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', gap: 5 }}>
            {dist.map(({ star, count }) => (
              <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.72rem', color: C.textMuted, width: 8, textAlign: 'right' }}>{star}</span>
                <Star style={{ width: 11, height: 11, fill: '#fbbf24', color: '#fbbf24', flexShrink: 0 }} />
                <div style={{ flex: 1, height: 6, background: C.border, borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#fbbf24', borderRadius: 99, width: reviews.length ? `${(count / reviews.length) * 100}%` : '0%', transition: 'width 0.6s ease' }} />
                </div>
                <span style={{ fontSize: '0.72rem', color: C.textMuted, width: 16 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div style={{ color: C.textMuted, fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          {isAr ? 'جاري التحميل...' : 'Loading...'}
        </div>
      ) : reviews.length === 0 ? (
        <p style={{ color: C.textMuted, fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          {isAr ? 'لا توجد تقييمات بعد. كن أول من يقيّم!' : 'No reviews yet. Be the first!'}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          {reviews.map(r => (
            <div key={r.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '0.875rem 1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: 6 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700, color: '#a78bfa', flexShrink: 0 }}>
                  {r.name[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: C.text }}>{r.name}</div>
                  <div style={{ fontSize: '0.7rem', color: C.textMuted }}>{new Date(r.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}</div>
                </div>
                <div style={{ marginInlineStart: 'auto' }}>
                  <StarRating value={r.rating} size={13} />
                </div>
              </div>
              {r.comment && <p style={{ fontSize: '0.82rem', color: C.textSec, margin: 0, lineHeight: 1.6 }}>{r.comment}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Submit form */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '1.25rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: C.text, marginBottom: '1rem' }}>
          {isAr ? 'أضف تقييمك' : 'Leave a review'}
        </h3>
        {submitted ? (
          <div style={{ color: '#22c55e', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
            ✓ {isAr ? 'شكراً! تقييمك قيد المراجعة.' : 'Thanks! Your review is pending approval.'}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: C.textMuted, marginBottom: 6, display: 'block' }}>
                {isAr ? 'تقييمك *' : 'Your rating *'}
              </label>
              <StarRating value={rating} onChange={setRating} size={24} />
            </div>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={isAr ? 'اسمك *' : 'Your name *'}
              maxLength={80}
              style={inputStyle}
            />
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder={isAr ? 'تعليقك (اختياري)' : 'Your comment (optional)'}
              maxLength={500}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
            {error && <p style={{ fontSize: '0.78rem', color: '#f87171', margin: 0 }}>{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '0.6rem 1.5rem', borderRadius: 10, fontWeight: 600, fontSize: '0.875rem',
                background: submitting ? 'rgba(139,92,246,0.4)' : 'linear-gradient(135deg,#7c3aedcc,#7c3aed)',
                color: '#fff', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', alignSelf: 'flex-start',
              }}
            >
              {submitting ? '...' : (isAr ? 'إرسال التقييم' : 'Submit review')}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
