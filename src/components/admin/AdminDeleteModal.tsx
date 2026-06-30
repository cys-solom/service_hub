'use client';

import { AlertTriangle, Trash2, X } from 'lucide-react';

interface AdminDeleteModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
}

export function AdminDeleteModal({ title, message, onConfirm, onCancel, confirmLabel = 'Delete' }: AdminDeleteModalProps) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}>
      <div style={{ background: '#141928', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '1.5rem', maxWidth: 400, width: '100%', margin: '0 1rem', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle style={{ width: 20, height: 20, color: '#f87171' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#E8E8E8', margin: '0 0 0.35rem' }}>{title}</h3>
            <p style={{ fontSize: '0.82rem', color: '#9a9a9a', margin: 0, lineHeight: 1.55 }}>{message}</p>
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: 0, display: 'flex', alignItems: 'center' }} aria-label="Close">
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onCancel}
            style={{ flex: 1, padding: '0.75rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#9a9a9a', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{ flex: 1, padding: '0.75rem', borderRadius: 12, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.12)', color: '#f87171', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <Trash2 style={{ width: 15, height: 15 }} />
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
