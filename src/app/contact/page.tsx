'use client';

import { useEffect, useState } from 'react';
import { MessageCircle, Mail, Phone } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Settings } from '@/lib/types';
import { useI18n } from '@/lib/i18n';
import { openWhatsApp } from '@/lib/whatsapp';

const DARK_C = {
    bg: '#141928', bgLight: '#0f1219',
    border: 'rgba(255,255,255,0.08)', text: '#f9fafb', textSec: '#9ca3af',
    accent: '#a78bfa', green: '#10b981',
};
const LIGHT_C = {
    bg: '#ffffff', bgLight: '#f8f8ff',
    border: 'rgba(0,0,0,0.09)', text: '#0d0f14', textSec: '#4b5563',
    accent: '#4c1d95', green: '#065f46',
};

export default function ContactPage() {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [mounted, setMounted] = useState(false);
    const { resolvedTheme } = useTheme();
    const { t } = useI18n();

    useEffect(() => { setMounted(true); }, []);
    useEffect(() => { fetch('/api/settings').then(r => r.json()).then(setSettings).catch(() => {}); }, []);

    const isDark = !mounted || resolvedTheme !== 'light';
    const C = isDark ? DARK_C : LIGHT_C;

    const cardStyle: React.CSSProperties = {
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: '1rem',
        padding: '1.5rem',
        transition: 'all 0.2s',
        boxShadow: isDark ? 'none' : '0 2px 16px rgba(0,0,0,0.07)',
    };
    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem',
        border: `1px solid ${C.border}`, background: C.bgLight,
        color: C.text, outline: 'none', fontSize: '0.875rem',
        fontFamily: 'inherit',
    };

    const handleWhatsApp = () => {
        if (!settings?.whatsappPhone) return;
        const cleanPhone = settings.whatsappPhone.replace(/[^0-9]/g, '');
        const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(t.contact.whatsappGreeting)}`;
        openWhatsApp(url);
    };

    return (
        <div style={{ minHeight: '100vh', padding: '2rem 1rem 5rem' }}>
            <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: C.text, marginBottom: '1rem' }}>{t.contact.title}</h1>
                    <p style={{ color: C.textSec, maxWidth: '36rem', margin: '0 auto' }}>{t.contact.subtitle}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '2rem' }}>
                    {/* Contact Cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <button onClick={handleWhatsApp} style={{ ...cardStyle, textAlign: 'start', cursor: 'pointer', width: '100%' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = isDark ? '#8b5cf6' : 'rgba(91,33,182,0.35)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <div style={{ width: 56, height: 56, borderRadius: '1rem', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', boxShadow: '0 4px 12px rgba(16,185,129,0.25)' }}>
                                <MessageCircle style={{ width: 28, height: 28, color: 'white' }} />
                            </div>
                            <h3 style={{ fontWeight: 600, color: C.text, marginBottom: '0.25rem' }}>{t.contact.whatsapp}</h3>
                            <p style={{ fontSize: '0.875rem', color: C.textSec }}>{t.contact.whatsappDesc}</p>
                            <p style={{ fontSize: '0.875rem', color: C.green, marginTop: '0.5rem', fontWeight: 600 }}>{settings?.whatsappPhone || t.common.loading}</p>
                        </button>

                        {[
                            { icon: Mail, title: t.contact.email, desc: t.contact.emailDesc, info: 'support@servicehub.store', gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)' },
                            { icon: Phone, title: t.contact.phone, desc: t.contact.phoneDesc, info: settings?.whatsappPhone || t.common.loading, gradient: 'linear-gradient(135deg, #8b5cf6, #a855f7)' },
                        ].map(item => (
                            <div key={item.title} style={cardStyle}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = isDark ? '#8b5cf6' : 'rgba(91,33,182,0.35)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                <div style={{ width: 56, height: 56, borderRadius: '1rem', background: item.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                                    <item.icon style={{ width: 28, height: 28, color: 'white' }} />
                                </div>
                                <h3 style={{ fontWeight: 600, color: C.text, marginBottom: '0.25rem' }}>{item.title}</h3>
                                <p style={{ fontSize: '0.875rem', color: C.textSec }}>{item.desc}</p>
                                <p style={{ fontSize: '0.875rem', color: C.accent, marginTop: '0.5rem', fontWeight: 600 }}>{item.info}</p>
                            </div>
                        ))}
                    </div>

                    {/* Contact Form */}
                    <div style={cardStyle}>
                        <h3 style={{ fontWeight: 600, color: C.text, marginBottom: '1.5rem' }}>{t.contact.sendMessage}</h3>
                        <form onSubmit={e => { e.preventDefault(); handleWhatsApp(); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input type="text" placeholder={t.contact.yourNameLabel} style={inputStyle} />
                            <input type="email" placeholder={t.contact.yourEmail} style={inputStyle} />
                            <textarea placeholder={t.contact.yourMessage} rows={4} style={{ ...inputStyle, resize: 'none' as const }} />
                            <button type="submit" style={{ width: '100%', padding: '1rem', background: 'linear-gradient(135deg, #7c3aed, #6366f1)', color: 'white', borderRadius: '1rem', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(124,58,237,0.3)' }}>
                                <MessageCircle style={{ width: 20, height: 20 }} />
                                {t.contact.sendViaWhatsApp}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
