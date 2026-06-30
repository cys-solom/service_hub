'use client';

import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { useSettings } from '@/lib/settings-context';
import { useI18n } from '@/lib/i18n';
import { openWhatsApp } from '@/lib/whatsapp';
import { usePathname } from 'next/navigation';

export default function WhatsAppFloat() {
    const { whatsappPhone } = useSettings();
    const { locale } = useI18n();
    const pathname = usePathname();
    const [visible, setVisible] = useState(false);
    const [hovered, setHovered] = useState(false);
    const isAr = locale === 'ar';

    // Don't show on cart page (redundant) or admin
    const hidden = pathname.startsWith('/admin') || pathname === '/cart';

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    const handleClick = () => {
        if (!whatsappPhone) return;
        const clean = whatsappPhone.replace(/[^0-9]/g, '');
        const msg = isAr
            ? 'مرحباً، أريد الاستفسار عن المنتجات 👋'
            : 'Hello! I\'d like to inquire about your products 👋';
        openWhatsApp(`https://api.whatsapp.com/send?phone=${clean}&text=${encodeURIComponent(msg)}`);
    };

    if (!whatsappPhone || hidden) return null;

    return (
        <div
            style={{
                position: 'fixed',
                bottom: 'calc(env(safe-area-inset-bottom, 0px) + 5.5rem)',
                right: isAr ? 'auto' : '1.25rem',
                left: isAr ? '1.25rem' : 'auto',
                zIndex: 110,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flexDirection: isAr ? 'row-reverse' : 'row',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.4s ease, transform 0.4s ease',
                pointerEvents: visible ? 'auto' : 'none',
            }}
        >
            {/* Label tooltip */}
            {hovered && (
                <span style={{
                    background: 'rgba(16,185,129,0.95)',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.35rem 0.75rem',
                    borderRadius: 99,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 12px rgba(16,185,129,0.4)',
                    animation: 'fade-in 0.15s ease',
                }}>
                    {isAr ? 'تحدث معنا' : 'Chat with us'}
                </span>
            )}

            <button
                onClick={handleClick}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                aria-label={isAr ? 'واتساب' : 'WhatsApp'}
                style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #25d366, #128c7e)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(37,211,102,0.45)',
                    transform: hovered ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
            >
                <MessageCircle style={{ width: 26, height: 26, color: '#fff', fill: '#fff' }} />
            </button>
        </div>
    );
}
