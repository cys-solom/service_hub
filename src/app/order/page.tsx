'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Search } from 'lucide-react';

export default function OrderSearchPage() {
  const [code, setCode] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  useEffect(() => { setMounted(true); }, []);
  const isDark = !mounted || resolvedTheme !== 'light';
  const D = isDark
    ? { surface: '#101010', border: 'rgba(255,255,255,0.07)', text: '#E8E8E8', textMuted: '#7a7a7a' }
    : { surface: '#ffffff', border: 'rgba(0,0,0,0.09)', text: '#0d0f14', textMuted: '#4b5563' };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (trimmed) router.push(`/order/${encodeURIComponent(trimmed)}`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.25rem' }}>
      <div style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📦</div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: D.text, marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>
          Track Your Order
        </h1>
        <p style={{ color: D.textMuted, fontSize: '0.875rem', marginBottom: '2rem', lineHeight: 1.6 }}>
          Enter your order code to check the current status
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. ORD-2B4F8A"
            style={{
              width: '100%', padding: '0.875rem 1rem',
              borderRadius: 14, border: `1px solid ${D.border}`,
              background: D.surface, color: D.text, fontSize: '1rem',
              fontFamily: 'monospace', outline: 'none', textAlign: 'center',
              letterSpacing: '0.05em', boxSizing: 'border-box',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)')}
            onBlur={e => (e.currentTarget.style.borderColor = D.border)}
          />
          <button
            type="submit"
            disabled={!code.trim()}
            style={{
              padding: '0.875rem', borderRadius: 14,
              background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
              color: '#fff', border: 'none', fontWeight: 700,
              fontSize: '0.95rem', cursor: code.trim() ? 'pointer' : 'not-allowed',
              opacity: code.trim() ? 1 : 0.5, display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              fontFamily: 'inherit',
            }}
          >
            <Search style={{ width: 18, height: 18 }} />
            Track Order
          </button>
        </form>
      </div>
    </div>
  );
}
