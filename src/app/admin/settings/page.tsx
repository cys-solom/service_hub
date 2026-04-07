'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Settings as SettingsIcon, Check, Globe, Store, CreditCard, Search as SearchIcon } from 'lucide-react';

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
        storeName: '',
        whatsappPhone: '',
        currency: 'EGP',
        seoTitle: '',
        seoDescription: '',
        theme: 'dark',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';

    useEffect(() => {
        fetch('/api/settings')
            .then((r) => r.json())
            .then((data) => {
                if (data && !data.error) setSettings(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        await fetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(settings),
        });
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    if (loading) {
        return (
            <div className="max-w-3xl space-y-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="skeleton h-12 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="max-w-3xl space-y-6">
            {/* Store Settings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                        <Store className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Store Settings</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Configure your store information</p>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Store Name</label>
                            <input
                                value={settings.storeName}
                                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Currency</label>
                            <select
                                value={settings.currency}
                                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 transition"
                            >
                                <option value="EGP">EGP (ج.م)</option>
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="SAR">SAR (ر.س)</option>
                                <option value="AED">AED (د.إ)</option>
                                <option value="KWD">KWD (د.ك)</option>
                                <option value="QAR">QAR (ر.ق)</option>
                                <option value="BHD">BHD (ب.د)</option>
                                <option value="OMR">OMR (ر.ع)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">WhatsApp Phone Number</label>
                        <input
                            value={settings.whatsappPhone}
                            onChange={(e) => setSettings({ ...settings, whatsappPhone: e.target.value })}
                            placeholder="e.g. 1234567890"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 transition"
                        />
                        <p className="text-xs text-gray-400 mt-1">Include country code without + sign</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Default Theme</label>
                        <select
                            value={settings.theme}
                            onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 transition"
                        >
                            <option value="dark">Dark</option>
                            <option value="light">Light</option>
                        </select>
                    </div>

                    {/* Hero Stats Section */}
                    <div className="border-t border-gray-200 dark:border-gray-800 pt-5 mt-5">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xl">📊</span>
                            <h3 className="font-medium text-gray-900 dark:text-white">Hero Statistics</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-gray-500">Stat 1</h4>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Value</label>
                                    <input
                                        value={settings.heroStat1Value}
                                        onChange={(e) => setSettings({ ...settings, heroStat1Value: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Label</label>
                                    <input
                                        value={settings.heroStat1Label}
                                        onChange={(e) => setSettings({ ...settings, heroStat1Label: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 transition"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-gray-500">Stat 2</h4>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Value</label>
                                    <input
                                        value={settings.heroStat2Value}
                                        onChange={(e) => setSettings({ ...settings, heroStat2Value: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Label</label>
                                    <input
                                        value={settings.heroStat2Label}
                                        onChange={(e) => setSettings({ ...settings, heroStat2Label: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 transition"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-gray-500">Stat 3</h4>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Value</label>
                                    <input
                                        value={settings.heroStat3Value}
                                        onChange={(e) => setSettings({ ...settings, heroStat3Value: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Label</label>
                                    <input
                                        value={settings.heroStat3Label}
                                        onChange={(e) => setSettings({ ...settings, heroStat3Label: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 transition"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SEO Section */}
                    <div className="border-t border-gray-200 dark:border-gray-800 pt-5 mt-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Globe className="w-5 h-5 text-violet-500" />
                            <h3 className="font-medium text-gray-900 dark:text-white">SEO Settings</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">SEO Title</label>
                                <input
                                    value={settings.seoTitle}
                                    onChange={(e) => setSettings({ ...settings, seoTitle: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 transition"
                                    placeholder="Your store title for search engines"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">SEO Description</label>
                                <textarea
                                    value={settings.seoDescription}
                                    onChange={(e) => setSettings({ ...settings, seoDescription: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 transition resize-none"
                                    placeholder="Description for search engines"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className={`w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg transition-all ${saved
                            ? 'bg-emerald-500 text-white shadow-emerald-500/25'
                            : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-violet-500/25 hover:shadow-violet-500/40'
                            } disabled:opacity-50`}
                    >
                        {saved ? (
                            <>
                                <Check className="w-5 h-5" />
                                Saved!
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                {saving ? 'Saving...' : 'Save Settings'}
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
