const SkeletonCard = () => (
  <div style={{ background: 'linear-gradient(145deg,#101010,#0d0d0d)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 240 }}>
    <div style={{ height: 3, background: 'rgba(139,92,246,0.18)' }} />
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 11, flex: 1 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div className="sk" style={{ width: 44, height: 44, borderRadius: '22%', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="sk" style={{ height: 13, width: '65%', marginBottom: 7, borderRadius: 6 }} />
          <div className="sk" style={{ height: 18, width: '48%', borderRadius: 12 }} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[70, 85, 60, 75].map((w, j) => (
          <div key={j} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div className="sk" style={{ width: 10, height: 10, borderRadius: 3, flexShrink: 0 }} />
            <div className="sk" style={{ height: 11, width: `${w}%`, borderRadius: 5 }} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="sk" style={{ height: 11, width: '40%', borderRadius: 5 }} />
        <div className="sk" style={{ height: 22, width: '55%', borderRadius: 6 }} />
        <div className="sk" style={{ height: 34, borderRadius: 8 }} />
      </div>
    </div>
  </div>
);

export default function ProductsLoading() {
  return (
    <div style={{ minHeight: '100vh', padding: '2.5rem 1.5rem 5rem' }}>
      <div style={{ maxWidth: '1380px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div className="sk" style={{ height: 36, width: 220, borderRadius: 8, marginBottom: 10 }} />
          <div className="sk" style={{ height: 14, width: 120, borderRadius: 6 }} />
        </div>
        <div className="products-grid">
          {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    </div>
  );
}
