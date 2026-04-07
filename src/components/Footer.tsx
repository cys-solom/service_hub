'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import AnimatedLogo from '@/components/AnimatedLogo';

export default function Footer() {
    const { t } = useI18n();

    return (
        <footer className="bg-gray-50 dark:bg-gray-950 border-t border-gray-200/50 dark:border-gray-800/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <div className="mb-4">
                            <AnimatedLogo href="/" size="lg" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md leading-relaxed">
                            {t.footer.description}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">{t.footer.quickLinks}</h4>
                        <ul className="space-y-3">
                            {[
                                { href: '/', label: t.nav.home },
                                { href: '/products', label: t.nav.products },
                                { href: '/contact', label: t.nav.contact },
                                { href: '/cart', label: t.nav.cart },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">{t.footer.legal}</h4>
                        <ul className="space-y-3">
                            {[
                                { href: '/privacy', label: t.footer.privacy },
                                { href: '/terms', label: t.footer.terms },
                                { href: '/refund', label: t.footer.refund },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-200/50 dark:border-gray-800/50">
                    <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
                        © {new Date().getFullYear()} Service Hub. {t.footer.rights}
                    </p>
                </div>
            </div>
        </footer>
    );
}
