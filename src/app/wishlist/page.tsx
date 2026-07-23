'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, X, ArrowRight } from 'lucide-react';
import { useWishlist } from '@/lib/wishlist-context';
import { useI18n } from '@/lib/i18n';
import { useTheme } from 'next-themes';
import ProductLogo from '@/components/ProductLogo';

const DARK_C = { bg: '#0d1120', surface: '#141928', border: 'rgba(255,255,255,0.07)', text: '#E8E8E8', textSec: '#9a9a9a', accent: '#a78bfa' };
const LIGHT_C = { bg: '#f0f1f8', surface: '#ffffff', border: 'rgba(0,0,0,0.09)', text: '#0d0f14', textSec: '#4b5563', accent: '#5b21b6' };

export default function WishlistPage() {
  const { items, toggle } = useWishlist();
  const { locale } = useI18n();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const C = mounted && resolvedTheme === 'light' ? LIGHT_C : DARK_C;
  const isAr = locale === 'ar';

  return (
    <div style={{ minHeight: '100vh', padding: '2.5rem 1.5rem 5rem', background: 'transparent' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Heart style={{ width: 22, height: 22, color: '#f87171', fill: '#f87171' }} />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: C.text, margin: 0 }}>
            {isAr ? 'المفضلة' : 'Wishlist'}
          </h1>
          {items.length > 0 && (
            <span style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171', borderRadius: 99, padding: '0.2rem 0.7rem', fontSize: '0.78rem', fontWeight: 700 }}>
              {items.length}
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: C.textSec }}>
            <Heart style={{ width: 48, height: 48, margin: '0 auto 1rem', opacity: 0.2 }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: C.text }}>
              {isAr ? 'قائمة المفضلة فارغة' : 'Your wishlist is empty'}
            </p>
            <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              {isAr ? 'احفظ المنتجات التي تعجبك لتجدها لاحقاً' : 'Save products you like to find them later'}
            </p>
            <Link href="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: 99, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: C.accent, textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}>
              {isAr ? 'تصفح المنتجات' : 'Browse Products'}
              <ArrowRight style={{ width: 15, height: 15 }} />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1rem' }}>
            {items.map(item => (
              <div key={item.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ProductLogo productName={item.name} dbImage={item.image} size={32} bg="transparent" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, color: C.text, fontSize: '0.9rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {isAr && item.nameAr ? item.nameAr : item.name}
                    </p>
                    {item.price != null && item.price > 0 && (
                      <p style={{ fontSize: '0.82rem', color: item.accentColor || C.accent, fontWeight: 700, marginTop: 2 }}>
                        {item.price} EGP
                      </p>
                    )}
                  </div>
                  <button onClick={() => toggle(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', padding: 4, display: 'flex', flexShrink: 0 }} title="Remove">
                    <X style={{ width: 15, height: 15 }} />
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link href={`/product/${item.slug}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.5rem', borderRadius: 10, background: `${item.accentColor || '#a78bfa'}22`, color: item.accentColor || C.accent, textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}>
                    <ShoppingCart style={{ width: 14, height: 14 }} />
                    {isAr ? 'تفاصيل' : 'View'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
