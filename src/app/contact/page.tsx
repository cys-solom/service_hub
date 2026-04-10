'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Mail, Phone } from 'lucide-react';
import { Settings } from '@/lib/types';
import { useI18n } from '@/lib/i18n';

import { openWhatsApp } from '@/lib/whatsapp';

export default function ContactPage() {
    const [settings, setSettings] = useState<Settings | null>(null);
    const { t } = useI18n();

    useEffect(() => {
        fetch('/api/settings')
            .then((r) => r.json())
            .then(setSettings)
            .catch(() => { });
    }, []);

    const handleWhatsApp = () => {
        if (!settings?.whatsappPhone) return;
        const cleanPhone = settings.whatsappPhone.replace(/[^0-9]/g, '');
        const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(t.contact.whatsappGreeting)}`;
        openWhatsApp(url);
    };

    return (
        <div className="min-h-screen pt-8 pb-20 px-4">
            <div className="max-w-4xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        {t.contact.title}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                        {t.contact.subtitle}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Contact Cards */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-6"
                    >
                        <button
                            onClick={handleWhatsApp}
                            className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 text-start card-hover group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                                <MessageCircle className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                                {t.contact.whatsapp}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t.contact.whatsappDesc}
                            </p>
                            <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                                {settings?.whatsappPhone || t.common.loading}
                            </p>
                        </button>

                        {[
                            {
                                icon: Mail,
                                title: t.contact.email,
                                desc: t.contact.emailDesc,
                                info: 'support@servicehub.store',
                                color: 'from-blue-500 to-cyan-500',
                            },
                            {
                                icon: Phone,
                                title: t.contact.phone,
                                desc: t.contact.phoneDesc,
                                info: settings?.whatsappPhone || t.common.loading,
                                color: 'from-violet-500 to-purple-500',
                            },
                        ].map((item) => (
                            <div
                                key={item.title}
                                className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 card-hover"
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-lg`}>
                                    <item.icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                                <p className="text-sm text-violet-600 dark:text-violet-400 mt-2 font-medium">{item.info}</p>
                            </div>
                        ))}
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-6">{t.contact.sendMessage}</h3>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleWhatsApp();
                                }}
                                className="space-y-4"
                            >
                                <input
                                    type="text"
                                    placeholder={t.contact.yourNameLabel}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-violet-500 transition"
                                />
                                <input
                                    type="email"
                                    placeholder={t.contact.yourEmail}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-violet-500 transition"
                                />
                                <textarea
                                    placeholder={t.contact.yourMessage}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-violet-500 transition resize-none"
                                />
                                <button
                                    type="submit"
                                    className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    {t.contact.sendViaWhatsApp}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
