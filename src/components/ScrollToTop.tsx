'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 450);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      style={{
        position: 'fixed',
        bottom: 'calc(4.5rem + env(safe-area-inset-bottom, 0px))',
        right: '1.25rem',
        zIndex: 40,
        width: 42,
        height: 42,
        borderRadius: '50%',
        background: 'rgba(124,58,237,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(139,92,246,0.4)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(124,58,237,0.45)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        animation: 'fadeInScale 0.2s ease',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 28px rgba(124,58,237,0.6)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(124,58,237,0.45)'; }}
    >
      <ArrowUp style={{ width: 18, height: 18 }} />
      <style>{`@keyframes fadeInScale { from { opacity:0; transform:scale(0.8); } to { opacity:1; transform:scale(1); } }`}</style>
    </button>
  );
}
