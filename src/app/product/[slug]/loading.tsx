const D = {
  surface: '#101010', bg: '#0d0d0d', border: 'rgba(255,255,255,0.07)',
};

export default function ProductLoading() {
  return (
    <div style={{ minHeight: '100vh', padding: '0 1rem 6rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Breadcrumb skeleton */}
        <div style={{ padding: '1.75rem 0 2rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div className="sk" style={{ width: 120, height: 14, borderRadius: 6 }} />
          <div className="sk" style={{ width: 8, height: 8, borderRadius: 3 }} />
          <div className="sk" style={{ width: 160, height: 14, borderRadius: 6 }} />
        </div>

        <div className="pdp-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,380px)', gap: '1.5rem' }}>

          {/* Left panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: `linear-gradient(145deg,${D.surface},${D.bg})`, border: `1px solid ${D.border}`, borderRadius: 20, overflow: 'hidden' }}>
              <div style={{ height: 3, background: 'rgba(139,92,246,0.2)' }} />
              <div style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                  <div className="sk" style={{ width: 96, height: 96, borderRadius: '22%', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="sk" style={{ height: 20, width: '35%', borderRadius: 20, marginBottom: 12 }} />
                    <div className="sk" style={{ height: 28, width: '70%', borderRadius: 8, marginBottom: 10 }} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[1,2,3,4,5].map(i => <div key={i} className="sk" style={{ width: 14, height: 14, borderRadius: 3 }} />)}
                      <div className="sk" style={{ width: 60, height: 14, borderRadius: 5, marginLeft: 4 }} />
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: '1.5rem', borderTop: `1px solid ${D.border}`, paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[90, 75, 85].map((w, i) => <div key={i} className="sk" style={{ height: 13, width: `${w}%`, borderRadius: 5 }} />)}
                </div>
              </div>
            </div>

            <div style={{ background: `linear-gradient(145deg,${D.surface},${D.bg})`, border: `1px solid ${D.border}`, borderRadius: 20, padding: '1.5rem' }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: '1.25rem' }}>
                <div className="sk" style={{ width: 28, height: 28, borderRadius: 8 }} />
                <div className="sk" style={{ width: 100, height: 14, borderRadius: 6, alignSelf: 'center' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: '0.65rem' }}>
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="sk" style={{ height: 44, borderRadius: 10 }} />)}
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: `linear-gradient(145deg,${D.surface},${D.bg})`, border: `1px solid ${D.border}`, borderRadius: 20, padding: '1.5rem' }}>
              <div className="sk" style={{ height: 12, width: '40%', borderRadius: 5, marginBottom: 14 }} />
              {[1,2].map(i => <div key={i} className="sk" style={{ height: 56, borderRadius: 14, marginBottom: 8 }} />)}
            </div>
            <div style={{ background: `linear-gradient(145deg,${D.surface},${D.bg})`, border: `1px solid ${D.border}`, borderRadius: 20, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="sk" style={{ height: 10, width: '30%', borderRadius: 4 }} />
              <div className="sk" style={{ height: 40, width: '60%', borderRadius: 8 }} />
              <div className="sk" style={{ height: 1, borderRadius: 1 }} />
              <div className="sk" style={{ height: 50, borderRadius: 14 }} />
              <div className="sk" style={{ height: 50, borderRadius: 14 }} />
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 840px) { .pdp-grid { grid-template-columns: 1fr !important; } }
        `}</style>
      </div>
    </div>
  );
}
