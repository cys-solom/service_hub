'use client';

import { useEffect, useState } from 'react';
import { Save, Check, Globe, Store, AlertCircle } from 'lucide-react';
import { adminJsonFetch } from '@/lib/admin-fetch';

interface SettingsData {
    id?: string;
    storeName: string;
    whatsappPhone: string;
    currency: string;
    seoTitle: string;
    seoDescription: string;
    theme: string;
    heroStat1Value?: string;
    heroStat1Label?: string;
    heroStat2Value?: string;
    heroStat2Label?: string;
    heroStat3Value?: string;
    heroStat3Label?: string;
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<SettingsData>({
        storeName: '', whatsappPhone: '', currency: 'EGP',
        seoTitle: '', seoDescription: '', theme: 'dark',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    useEffect(() => {
        fetch('/api/settings')
            .then((r) => r.json())
            .then((data) => { if (data && !data.error) setSettings(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const showToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await adminJsonFetch('/api/settings', {
                method: 'PUT',
                body: JSON.stringify(settings),
            });
            if (!res.ok) throw new Error('Failed to save');
            showToast('success', 'Settings saved successfully');
        } catch {
            showToast('error', 'Failed to save settings');
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="sk" style={{ height: 48, borderRadius: 12 }} />
                ))}
            </div>
        );
    }

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '0.75rem 1rem', borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)',
        color: '#E8E8E8', fontSize: '0.875rem', fontFamily: 'inherit',
        outline: 'none', transition: 'border-color 0.15s', minHeight: 44,
    };

    const labelStyle: React.CSSProperties = {
        display: 'block', fontSize: '0.78rem', fontWeight: 600,
        color: '#9a9a9a', marginBottom: '0.4rem',
    };

    return (
        <div className="fade-up" style={{ maxWidth: 720 }}>
            {/* Toast */}
            {toast && (
                <div className={`admin-toast admin-toast--${toast.type}`}>
                    {toast.type === 'success' ? <Check style={{ width: 18, height: 18 }} /> : <AlertCircle style={{ width: 18, height: 18 }} />}
                    {toast.msg}
                </div>
            )}

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Store Settings */}
                <div className="adm-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #7c3aed, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Store style={{ width: 20, height: 20, color: 'white' }} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#E8E8E8', margin: 0 }}>Store Settings</h2>
                            <p style={{ fontSize: '0.78rem', color: '#7a7a7a', margin: 0 }}>Configure your store information</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Store Name</label>
                            <input value={settings.storeName} onChange={(e) => setSettings({ ...settings, storeName: e.target.value })} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Currency</label>
                            <select value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                                {['EGP', 'USD', 'EUR', 'GBP', 'SAR', 'AED', 'KWD', 'QAR', 'BHD', 'OMR'].map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <label style={labelStyle}>WhatsApp Phone Number</label>
                        <input value={settings.whatsappPhone} onChange={(e) => setSettings({ ...settings, whatsappPhone: e.target.value })} placeholder="e.g. 201234567890" style={inputStyle} />
                        <p style={{ fontSize: '0.72rem', color: '#686868', marginTop: '0.3rem' }}>Include country code without + sign</p>
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <label style={labelStyle}>Default Theme</label>
                        <select value={settings.theme} onChange={(e) => setSettings({ ...settings, theme: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                            <option value="dark">Dark</option>
                            <option value="light">Light</option>
                        </select>
                    </div>
                </div>

                {/* Hero Stats */}
                <div className="adm-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                        <span style={{ fontSize: '1.1rem' }}>📊</span>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#E8E8E8', margin: 0 }}>Hero Statistics</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
                        {[
                            { label: 'Stat 1', vKey: 'heroStat1Value' as const, lKey: 'heroStat1Label' as const },
                            { label: 'Stat 2', vKey: 'heroStat2Value' as const, lKey: 'heroStat2Label' as const },
                            { label: 'Stat 3', vKey: 'heroStat3Value' as const, lKey: 'heroStat3Label' as const },
                        ].map((stat) => (
                            <div key={stat.label} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</span>
                                <div>
                                    <label style={labelStyle}>Value</label>
                                    <input value={settings[stat.vKey] || ''} onChange={(e) => setSettings({ ...settings, [stat.vKey]: e.target.value })} style={inputStyle} placeholder="e.g. 4000+" />
                                </div>
                                <div>
                                    <label style={labelStyle}>Label</label>
                                    <input value={settings[stat.lKey] || ''} onChange={(e) => setSettings({ ...settings, [stat.lKey]: e.target.value })} style={inputStyle} placeholder="e.g. Happy Customers" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SEO */}
                <div className="adm-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                        <Globe style={{ width: 20, height: 20, color: '#a78bfa' }} />
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#E8E8E8', margin: 0 }}>SEO Settings</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>SEO Title</label>
                            <input value={settings.seoTitle} onChange={(e) => setSettings({ ...settings, seoTitle: e.target.value })} placeholder="Your store title for search engines" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>SEO Description</label>
                            <textarea value={settings.seoDescription} onChange={(e) => setSettings({ ...settings, seoDescription: e.target.value })} rows={3} placeholder="Description for search engines" style={{ ...inputStyle, resize: 'none' }} />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <button
                    type="submit"
                    disabled={saving}
                    className="adm-btn adm-btn--primary"
                    style={{
                        width: '100%', padding: '1rem', fontSize: '0.95rem',
                        borderRadius: 14, opacity: saving ? 0.6 : 1,
                    }}
                >
                    {saving ? (
                        <><div className="admin-loader" style={{ width: 18, height: 18, borderWidth: 2 }} /> Saving...</>
                    ) : (
                        <><Save style={{ width: 18, height: 18 }} /> Save Settings</>
                    )}
                </button>
            </form>
        </div>
    );
}
