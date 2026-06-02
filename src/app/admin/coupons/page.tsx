'use client';

import { useEffect, useState } from 'react';
import {
    Plus,
    Trash2,
    Tag,
    X,
    Save,
    Eye,
    EyeOff,
    Percent,
    DollarSign,
    Copy,
    Check,
} from 'lucide-react';
import { useSettings } from '@/lib/settings-context';
import { adminFetch, adminJsonFetch } from '@/lib/admin-fetch';


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

export default function AdminCouponsPage() {
    const { currencySymbol } = useSettings();
    const [coupons, setCoupons] = useState<CouponData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        code: '',
        discount: '',
        isPercent: true,
        maxUses: '0',
        minOrderValue: '0',
        expiresAt: '',
        isActive: true,
    });



    const fetchCoupons = async () => {
        try {
            const res = await adminFetch('/api/coupons');
            const data = await res.json();
            setCoupons(Array.isArray(data) ? data : []);
        } catch {
            console.error('Failed to fetch coupons');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCoupons();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await adminJsonFetch('/api/coupons', {
                method: 'POST',
                body: JSON.stringify({
                    code: formData.code.trim(),
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
                alert(data.error || 'Failed to create coupon');
                return;
            }
            setShowForm(false);
            setFormData({ code: '', discount: '', isPercent: true, maxUses: '0', minOrderValue: '0', expiresAt: '', isActive: true });
            fetchCoupons();
        } catch (err) {
            console.error('Create coupon error:', err);
            alert('Failed to create coupon. Check your connection.');
        }
    };

    const handleToggleActive = async (coupon: CouponData) => {
        setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, isActive: !c.isActive } : c));
        try {
            await adminJsonFetch(`/api/coupons/${coupon.id}`, {
                method: 'PUT',
                body: JSON.stringify({ isActive: !coupon.isActive }),
            });
        } catch {
            setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, isActive: coupon.isActive } : c));
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this coupon?')) return;
        await adminFetch(`/api/coupons/${id}`, { method: 'DELETE' });
        fetchCoupons();
    };

    const handleCopyCode = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const isExpired = (expiresAt: string | null) => {
        if (!expiresAt) return false;
        return new Date(expiresAt) < new Date();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Coupons</h2>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-medium flex items-center gap-2 text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add Coupon
                </button>
            </div>

            {/* Create Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div
                        className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">New Coupon</h3>
                            <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Coupon Code</label>
                                <input
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm font-mono uppercase"
                                    placeholder="SUMMER2026"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount Value</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.discount}
                                        onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                    <div className="flex rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, isPercent: true })}
                                            className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-1 transition ${formData.isPercent ? 'bg-violet-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                                        >
                                            <Percent className="w-3.5 h-3.5" /> %
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, isPercent: false })}
                                            className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-1 transition ${!formData.isPercent ? 'bg-violet-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                                        >
                                            <DollarSign className="w-3.5 h-3.5" /> Fixed
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Uses (0 = unlimited)</label>
                                    <input
                                        type="number"
                                        value={formData.maxUses}
                                        onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Order ({currencySymbol})</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.minOrderValue}
                                        onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expires At (optional)</label>
                                <input
                                    type="datetime-local"
                                    value={formData.expiresAt}
                                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 text-sm"
                            >
                                <Save className="w-4 h-4" />
                                Create Coupon
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Coupons List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                            <div className="skeleton h-6 w-48 mb-2" />
                            <div className="skeleton h-4 w-32" />
                        </div>
                    ))}
                </div>
            ) : coupons.length === 0 ? (
                <div className="text-center py-20 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
                    <Tag className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No coupons yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {coupons.map((coupon) => (
                        <div
                            key={coupon.id}
                            className={`rounded-2xl border ${isExpired(coupon.expiresAt) ? 'border-red-200 dark:border-red-800/50' : 'border-gray-200 dark:border-gray-800'} bg-white dark:bg-gray-900/50 p-5`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${coupon.isActive && !isExpired(coupon.expiresAt) ? 'bg-violet-500/10' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                        <Tag className={`w-5 h-5 ${coupon.isActive && !isExpired(coupon.expiresAt) ? 'text-violet-500' : 'text-gray-400'}`} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-bold text-gray-900 dark:text-white">{coupon.code}</span>
                                            <button
                                                onClick={() => handleCopyCode(coupon.code, coupon.id)}
                                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                                title="Copy code"
                                            >
                                                {copiedId === coupon.id ? (
                                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                ) : (
                                                    <Copy className="w-3.5 h-3.5 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-lg font-bold text-violet-600 dark:text-violet-400">
                                                {coupon.isPercent ? `${coupon.discount}%` : `${coupon.discount} ${currencySymbol}`}
                                            </span>
                                            <span className="text-xs text-gray-400">off</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleToggleActive(coupon)}
                                        className={`p-2 rounded-lg transition ${coupon.isActive ? 'hover:bg-gray-100 dark:hover:bg-gray-800' : 'hover:bg-emerald-50 dark:hover:bg-emerald-500/10'}`}
                                        title={coupon.isActive ? 'Deactivate' : 'Activate'}
                                    >
                                        {coupon.isActive ? (
                                            <Eye className="w-4 h-4 text-emerald-500" />
                                        ) : (
                                            <EyeOff className="w-4 h-4 text-gray-400" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(coupon.id)}
                                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                                <span>Used: {coupon.usedCount}/{coupon.maxUses === 0 ? '∞' : coupon.maxUses}</span>
                                {coupon.minOrderValue > 0 && (
                                    <span>Min: {coupon.minOrderValue} {currencySymbol}</span>
                                )}
                                {coupon.expiresAt && (
                                    <span className={isExpired(coupon.expiresAt) ? 'text-red-500 font-medium' : ''}>
                                        {isExpired(coupon.expiresAt) ? 'Expired' : `Expires: ${new Date(coupon.expiresAt).toLocaleDateString()}`}
                                    </span>
                                )}
                                {!coupon.isActive && (
                                    <span className="text-gray-400 font-medium">Inactive</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
