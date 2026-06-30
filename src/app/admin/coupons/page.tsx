'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Tag, X, Save, Eye, EyeOff, Percent, DollarSign, Copy, Check } from 'lucide-react';
import { useSettings } from '@/lib/settings-context';
import { adminFetch, adminJsonFetch } from '@/lib/admin-fetch';
import { AdminToast, useAdminToast } from '@/components/admin/AdminToast';
import { AdminDeleteModal } from '@/components/admin/AdminDeleteModal';

interface CouponData {
    id: string;
    code: string;
    discount: number;
    isPercent: boolean;
    maxUses: number;
    usedCount: number;
    minOrderValue: number;
    expiresAt: string | null;
    isActive: boolean;
    createdAt: string;
}

const emptyForm = { code: '', discount: '', isPercent: true, maxUses: '0', minOrderValue: '0', expiresAt: '', isActive: true };

export default function AdminCouponsPage() {
    const { currencySymbol } = useSettings();
    const [coupons, setCoupons] = useState<CouponData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<CouponData | null>(null);
    const [formData, setFormData] = useState(emptyForm);
    const { toast, showToast, closeToast } = useAdminToast();

    const fetchCoupons = async () => {
        try {
            const res = await adminFetch('/api/coupons');
            const data = await res.json();
            setCoupons(Array.isArray(data) ? data : []);
        } catch {
            showToast('error', 'Failed to load coupons');
        }
        setLoading(false);
    };

    useEffect(() => { fetchCoupons(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await adminJsonFetch('/api/coupons', {
                method: 'POST',
                body: JSON.stringify({
                    code: formData.code.trim().toUpperCase(),
                    discount: parseFloat(formData.discount) || 0,
                    isPercent: formData.isPercent,
                    maxUses: parseInt(formData.maxUses) || 0,
                    minOrderValue: parseFloat(formData.minOrderValue) || 0,
                    expiresAt: formData.expiresAt || null,
                    isActive: formData.isActive,
                }),
            });
            if (!res.ok) {
                const data = await res.json();
                showToast('error', data.error || 'Failed to create coupon');
                setSaving(false);
                return;
            }
            showToast('success', `Coupon ${formData.code.toUpperCase()} created`);
            setShowForm(false);
            setFormData(emptyForm);
            fetchCoupons();
        } catch {
            showToast('error', 'Failed to create coupon');
        }
        setSaving(false);
    };

    const handleToggleActive = async (coupon: CouponData) => {
        setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, isActive: !c.isActive } : c));
        try {
            const res = await adminJsonFetch(`/api/coupons/${coupon.id}`, {
                method: 'PUT',
                body: JSON.stringify({ isActive: !coupon.isActive }),
            });
            if (!res.ok) throw new Error('Failed');
            showToast('success', coupon.isActive ? 'Coupon deactivated' : 'Coupon activated');
        } catch {
            setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, isActive: coupon.isActive } : c));
            showToast('error', 'Failed to update coupon');
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const prev = [...coupons];
        setCoupons(p => p.filter(c => c.id !== deleteTarget.id));
        setDeleteTarget(null);
        try {
            const res = await adminFetch(`/api/coupons/${deleteTarget.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed');
            showToast('success', 'Coupon deleted');
        } catch {
            setCoupons(prev);
            showToast('error', 'Failed to delete coupon');
        }
    };

    const handleCopyCode = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const isExpired = (expiresAt: string | null) => expiresAt ? new Date(expiresAt) < new Date() : false;

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '0.65rem 0.875rem', borderRadius: 10,
        border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)',
        color: '#E8E8E8', fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none',
    };

    return (
        <div className="space-y-6">
            <AdminToast toast={toast} onClose={closeToast} />

            {deleteTarget && (
                <AdminDeleteModal
                    title="Delete Coupon"
                    message={`Delete coupon "${deleteTarget.code}"? This cannot be undone.`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#E8E8E8', letterSpacing: '-0.02em' }}>Coupons</h2>
                    <p style={{ fontSize: '0.78rem', color: '#7a7a7a', marginTop: 2 }}>{coupons.length} total</p>
                </div>
                <button onClick={() => setShowForm(true)} className="adm-btn adm-btn--primary">
                    <Plus style={{ width: 15, height: 15 }} /> Add Coupon
                </button>
            </div>

            {/* Create Form Modal */}
            {showForm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: '#141928', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '1.5rem', width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                            <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#E8E8E8', margin: 0 }}>New Coupon</h3>
                            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: 4, display: 'flex' }}>
                                <X style={{ width: 18, height: 18 }} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label className="adm-label">Coupon Code</label>
                                <input
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    style={{ ...inputStyle, fontFamily: 'monospace', textTransform: 'uppercase' }}
                                    placeholder="SUMMER2026"
                                    required
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                                <div>
                                    <label className="adm-label">Discount Value</label>
                                    <input type="number" step="0.01" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: e.target.value })} style={inputStyle} required />
                                </div>
                                <div>
                                    <label className="adm-label">Type</label>
                                    <div style={{ display: 'flex', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                                        {[{ label: '%', icon: Percent, val: true }, { label: 'Fixed', icon: DollarSign, val: false }].map(({ label, icon: Icon, val }) => (
                                            <button key={label} type="button" onClick={() => setFormData({ ...formData, isPercent: val })} style={{ flex: 1, padding: '0.65rem', fontSize: '0.82rem', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: formData.isPercent === val ? '#7c3aed' : 'rgba(255,255,255,0.04)', color: formData.isPercent === val ? 'white' : '#9a9a9a', transition: 'all 0.15s' }}>
                                                <Icon style={{ width: 13, height: 13 }} />{label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                                <div>
                                    <label className="adm-label">Max Uses (0 = unlimited)</label>
                                    <input type="number" value={formData.maxUses} onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })} style={inputStyle} />
                                </div>
                                <div>
                                    <label className="adm-label">Min Order ({currencySymbol})</label>
                                    <input type="number" step="0.01" value={formData.minOrderValue} onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })} style={inputStyle} />
                                </div>
                            </div>

                            <div>
                                <label className="adm-label">Expires At (optional)</label>
                                <input type="datetime-local" value={formData.expiresAt} onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })} style={inputStyle} />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input type="checkbox" id="coupon-active" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} style={{ width: 16, height: 16, accentColor: '#7c3aed', cursor: 'pointer' }} />
                                <label htmlFor="coupon-active" style={{ fontSize: '0.85rem', color: '#9a9a9a', cursor: 'pointer' }}>Active</label>
                            </div>

                            <button type="submit" disabled={saving} className="adm-btn adm-btn--primary" style={{ width: '100%', opacity: saving ? 0.6 : 1 }}>
                                {saving ? <div className="admin-loader" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <Save style={{ width: 15, height: 15 }} />}
                                Create Coupon
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Coupons List */}
            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: '0.875rem' }}>
                    {[1, 2, 3].map((i) => <div key={i} className="adm-card sk" style={{ height: 120 }} />)}
                </div>
            ) : coupons.length === 0 ? (
                <div className="admin-empty">
                    <div className="admin-empty-icon"><Tag style={{ width: 24, height: 24 }} /></div>
                    <p style={{ color: '#7a7a7a' }}>No coupons yet</p>
                    <p style={{ color: '#555', fontSize: '0.78rem', marginTop: 4 }}>Create discount codes to boost sales</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%,300px),1fr))', gap: '0.875rem' }}>
                    {coupons.map((coupon) => {
                        const expired = isExpired(coupon.expiresAt);
                        const active = coupon.isActive && !expired;
                        return (
                            <div key={coupon.id} className="adm-card" style={{ padding: '1.125rem', borderColor: expired ? 'rgba(239,68,68,0.2)' : undefined }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 12, background: active ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Tag style={{ width: 18, height: 18, color: active ? '#a78bfa' : '#555' }} />
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#E8E8E8', fontSize: '0.95rem' }}>{coupon.code}</span>
                                                <button onClick={() => handleCopyCode(coupon.code, coupon.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: 2, display: 'flex' }} title="Copy">
                                                    {copiedId === coupon.id ? <Check style={{ width: 12, height: 12, color: '#10b981' }} /> : <Copy style={{ width: 12, height: 12 }} />}
                                                </button>
                                            </div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#a78bfa', lineHeight: 1.2, marginTop: 2 }}>
                                                {coupon.isPercent ? `${coupon.discount}%` : `${coupon.discount} ${currencySymbol}`} <span style={{ fontSize: '0.72rem', fontWeight: 500, color: '#666' }}>off</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                                        <button onClick={() => handleToggleActive(coupon)} style={{ padding: '0.4rem', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', display: 'flex' }} title={coupon.isActive ? 'Deactivate' : 'Activate'}>
                                            {coupon.isActive ? <Eye style={{ width: 14, height: 14, color: '#10b981' }} /> : <EyeOff style={{ width: 14, height: 14, color: '#666' }} />}
                                        </button>
                                        <button onClick={() => setDeleteTarget(coupon)} style={{ padding: '0.4rem', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer', display: 'flex' }} title="Delete">
                                            <Trash2 style={{ width: 14, height: 14, color: '#f87171' }} />
                                        </button>
                                    </div>
                                </div>

                                <div style={{ marginTop: '0.875rem', paddingTop: '0.875rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexWrap: 'wrap', gap: '0.75rem 1.25rem' }}>
                                    <span style={{ fontSize: '0.72rem', color: '#666' }}>Used: <strong style={{ color: '#9a9a9a' }}>{coupon.usedCount}/{coupon.maxUses === 0 ? '∞' : coupon.maxUses}</strong></span>
                                    {coupon.minOrderValue > 0 && <span style={{ fontSize: '0.72rem', color: '#666' }}>Min: <strong style={{ color: '#9a9a9a' }}>{coupon.minOrderValue} {currencySymbol}</strong></span>}
                                    {coupon.expiresAt && (
                                        <span style={{ fontSize: '0.72rem', color: expired ? '#f87171' : '#666', fontWeight: expired ? 700 : 400 }}>
                                            {expired ? '⚠ Expired' : `Expires ${new Date(coupon.expiresAt).toLocaleDateString()}`}
                                        </span>
                                    )}
                                    {!coupon.isActive && !expired && <span style={{ fontSize: '0.72rem', color: '#666' }}>Inactive</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
