'use client';

import Link from 'next/link';

export default function ProductError({ reset }: { reset: () => void }) {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</div>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#E8E8E8', marginBottom: '0.5rem' }}>Product not available</h1>
      <p style={{ color: '#9a9a9a', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Something went wrong loading this product.</p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={reset} style={{ padding: '0.65rem 1.25rem', borderRadius: 10, background: '#7c3aed', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
          Try again
        </button>
        <Link href="/products" style={{ padding: '0.65rem 1.25rem', borderRadius: 10, background: 'rgba(255,255,255,0.07)', color: '#E8E8E8', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>
          Browse products
        </Link>
      </div>
    </div>
  );
}
