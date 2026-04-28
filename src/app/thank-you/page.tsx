'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Home } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

function ThankYouContent() {
    const searchParams = useSearchParams();
    const orderCode = searchParams.get('code') || 'N/A';
    const { t } = useI18n();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(orderCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full text-center"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/30"
                >
                    <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {t.thankYou.title}
                </h1>

                <p className="text-gray-500 dark:text-gray-400 mb-8">
                    {t.thankYou.subtitle}
                </p>

                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 mb-8">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t.thankYou.orderCode}</p>
                    <p className="text-2xl font-bold font-mono text-violet-600 dark:text-violet-400 mb-3">
                        {orderCode}
                    </p>
                    <button
                        onClick={handleCopy}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                    >
                        {copied ? (
                            <>
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                            </>
                        ) : (
                            <>
                                <Package className="w-4 h-4" />
                                Copy Code
                            </>
                        )}
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/products"
                        className="px-6 py-3 rounded-2xl font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center justify-center gap-2"
                    >
                        <Package className="w-5 h-5" />
                        {t.thankYou.continueShopping}
                    </Link>

                    <Link
                        href="/"
                        className="px-6 py-3 rounded-2xl font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center justify-center gap-2"
                    >
                        <Home className="w-5 h-5" />
                        {t.thankYou.backHome}
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}

export default function ThankYouPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="skeleton h-8 w-32" /></div>}>
            <ThankYouContent />
        </Suspense>
    );
}
