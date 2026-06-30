'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';
export interface ToastState { type: ToastType; msg: string; }

interface AdminToastProps {
  toast: ToastState | null;
  onClose: () => void;
}

export function AdminToast({ toast, onClose }: AdminToastProps) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;

  const icon = toast.type === 'success'
    ? <Check style={{ width: 16, height: 16 }} />
    : toast.type === 'error'
      ? <AlertCircle style={{ width: 16, height: 16 }} />
      : <Info style={{ width: 16, height: 16 }} />;

  return (
    <div className={`admin-toast admin-toast--${toast.type}`} role="alert" aria-live="polite">
      {icon}
      <span style={{ flex: 1 }}>{toast.msg}</span>
      <button
        onClick={onClose}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, display: 'flex', alignItems: 'center', opacity: 0.7 }}
        aria-label="Close"
      >
        <X style={{ width: 14, height: 14 }} />
      </button>
    </div>
  );
}

export function useAdminToast() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const showToast = useCallback((type: ToastType, msg: string) => setToast({ type, msg }), []);
  const closeToast = useCallback(() => setToast(null), []);
  return { toast, showToast, closeToast };
}
