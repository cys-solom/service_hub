'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function NotFound() {
    const { t, locale } = useI18n();

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="text-center">
                <h1 className="text-8xl font-black text-gray-200 dark:text-gray-800 mb-4">404</h1>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {t.notFound.title}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                    {t.notFound.description}
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
                    <Link
                        href="/"
                        className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl font-semibold flex items-center gap-2"
                    >
                        <Home className="w-5 h-5" />
                        {t.notFound.backHome}
                    </Link>
                    <Link
                        href="/products"
                        className="px-6 py-3 rounded-2xl font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center gap-2"
                    >
                        <ArrowLeft className={`w-5 h-5 ${locale === 'ar' ? 'rotate-180' : ''}`} />
                        {t.notFound.browseProducts}
                    </Link>
                </div>
            </div>
        </div>
    );
}
