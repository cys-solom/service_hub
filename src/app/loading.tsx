export default function Loading() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1.5rem',
      padding: '2rem',
    }}>
      {/* Skeleton hero */}
      <div style={{ width: '100%', maxWidth: 680, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <div className="skeleton" style={{ width: 64, height: 64, borderRadius: '50%' }} />
        <div className="skeleton" style={{ width: '55%', height: 18, borderRadius: 8 }} />
        <div className="skeleton" style={{ width: '75%', height: 40, borderRadius: 12 }} />
        <div className="skeleton" style={{ width: '60%', height: 22, borderRadius: 8 }} />
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          <div className="skeleton" style={{ width: 140, height: 44, borderRadius: 24 }} />
          <div className="skeleton" style={{ width: 120, height: 44, borderRadius: 24 }} />
        </div>
      </div>

      {/* Skeleton stats */}
      <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div className="skeleton" style={{ width: 56, height: 28, borderRadius: 8 }} />
            <div className="skeleton" style={{ width: 72, height: 14, borderRadius: 6 }} />
          </div>
        ))}
      </div>

      {/* Skeleton cards row */}
      <div style={{ width: '100%', maxWidth: 1200, display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '2rem' }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="skeleton" style={{ width: 'clamp(160px, 22vw, 220px)', height: 180, borderRadius: 16 }} />
        ))}
      </div>
    </div>
  );
}
