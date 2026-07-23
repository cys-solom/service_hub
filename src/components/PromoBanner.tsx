'use client';

import { useState, useEffect } from 'react';
import { X, Tag } from 'lucide-react';

interface Coupon {
  code: string;
  discount: number;
  isPercent: boolean;
  expiresAt: string | null;
}

const DISMISS_KEY = 'sh_banner_dismissed';

export default function PromoBanner() {
  const [coupon, setCoupon]     = useState<Coupon | null>(null);
  const [visible, setVisible]   = useState(false);
  const [copied, setCopied]     = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY)) return;
    fetch('/api/public/coupons/banner')
      .then(r => r.json())
      .then(d => { if (d.coupon) { setCoupon(d.coupon); setVisible(true); } })
      .catch(() => {});
  }, []);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem(DISMISS_KEY, '1');
  };

  const copyCode = () => {
    if (!coupon) return;
    navigator.clipboard.writeText(coupon.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!visible || !coupon) return null;

  const discountText = coupon.isPercent
    ? `${coupon.discount}% OFF`
    : `${coupon.discount} EGP OFF`;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'linear-gradient(90deg, #7c3aed, #6366f1, #4f46e5)',
      color: '#fff', padding: '0.55rem 1rem',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
      fontSize: '0.82rem', fontWeight: 600,
    }}>
      <Tag style={{ width: 14, height: 14, flexShrink: 0 }} />
      <span>
        Use code{' '}
        <button
          onClick={copyCode}
          style={{
            background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)',
            borderRadius: 6, padding: '0.15rem 0.55rem', color: '#fff',
            cursor: 'pointer', fontWeight: 800, fontSize: '0.82rem', fontFamily: 'inherit',
            letterSpacing: '0.05em',
          }}
        >
          {coupon.code}
        </button>
        {' '}for <strong>{discountText}</strong> on your order!{' '}
        {copied && <span style={{ opacity: 0.85, fontWeight: 500 }}>Copied!</span>}
      </span>
      <button onClick={dismiss} style={{ marginInlineStart: 'auto', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4, display: 'flex', opacity: 0.7, flexShrink: 0 }}>
        <X style={{ width: 15, height: 15 }} />
      </button>
    </div>
  );
}
