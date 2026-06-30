'use client';

export default function ProductsError({ reset }: { reset: () => void }) {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#E8E8E8', marginBottom: '0.5rem' }}>Failed to load products</h1>
      <p style={{ color: '#9a9a9a', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Check your connection and try again.</p>
      <button onClick={reset} style={{ padding: '0.65rem 1.5rem', borderRadius: 10, background: '#7c3aed', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
        Try again
      </button>
    </div>
  );
}
