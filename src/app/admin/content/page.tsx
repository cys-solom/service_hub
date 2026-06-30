'use client';

import { useEffect, useState } from 'react';
import { Save, Check, Globe, ChevronDown, ChevronUp } from 'lucide-react';
import { defaultEn, defaultAr } from '@/lib/i18n';
import { adminJsonFetch } from '@/lib/admin-fetch';


// Section config for the admin UI
const contentSections = [
    {
        id: 'nav',
        title: '🧭 Navigation',
        fields: [
            { key: 'home', label: 'Home Link' },
            { key: 'products', label: 'Products Link' },
            { key: 'contact', label: 'Contact Link' },
            { key: 'cart', label: 'Cart Link' },
            { key: 'admin', label: 'Admin Link' },
            { key: 'toggleTheme', label: 'Toggle Theme Text' },
            { key: 'toggleLang', label: 'Toggle Language Text' },
        ],
    },
    {
        id: 'hero',
        title: '🏠 Hero Section',
        fields: [
            { key: 'title', label: 'Title' },
            { key: 'subtitle', label: 'Subtitle', multiline: true },
            { key: 'cta', label: 'CTA Button Text' },
            { key: 'contact', label: 'Contact Button Text' },
        ],
    },
    {
        id: 'featured',
        title: '⭐ Featured Section',
        fields: [
            { key: 'title', label: 'Title' },
            { key: 'subtitle', label: 'Subtitle', multiline: true },
            { key: 'viewAll', label: 'View All Button' },
            { key: 'from', label: '"From" Text' },
            { key: 'month', label: 'Month Suffix' },
            { key: 'orders', label: 'Orders Text' },
        ],
    },
    {
        id: 'categories',
        title: '📁 Categories Section',
        fields: [
            { key: 'title', label: 'Title' },
            { key: 'subtitle', label: 'Subtitle' },
            { key: 'products', label: 'Products Text' },
        ],
    },
    {
        id: 'why',
        title: '✅ Why Choose Us',
        fields: [
            { key: 'title', label: 'Section Title' },
            { key: 'subtitle', label: 'Section Subtitle', multiline: true },
            { key: 'authentic', label: 'Authentic Title' },
            { key: 'authenticDesc', label: 'Authentic Description' },
            { key: 'instant', label: 'Instant Title' },
            { key: 'instantDesc', label: 'Instant Description' },
            { key: 'support', label: 'Support Title' },
            { key: 'supportDesc', label: 'Support Description' },
            { key: 'prices', label: 'Prices Title' },
            { key: 'pricesDesc', label: 'Prices Description' },
        ],
    },
    {
        id: 'howTo',
        title: '📋 How to Order',
        fields: [
            { key: 'title', label: 'Section Title' },
            { key: 'subtitle', label: 'Section Subtitle' },
            { key: 'step1', label: 'Step 1 Title' },
            { key: 'step1Desc', label: 'Step 1 Description' },
            { key: 'step2', label: 'Step 2 Title' },
            { key: 'step2Desc', label: 'Step 2 Description' },
            { key: 'step3', label: 'Step 3 Title' },
            { key: 'step3Desc', label: 'Step 3 Description' },
        ],
    },
    {
        id: 'faq',
        title: '❓ FAQ',
        fields: [
            { key: 'title', label: 'Section Title' },
            { key: 'q1', label: 'Question 1' },
            { key: 'a1', label: 'Answer 1', multiline: true },
            { key: 'q2', label: 'Question 2' },
            { key: 'a2', label: 'Answer 2', multiline: true },
            { key: 'q3', label: 'Question 3' },
            { key: 'a3', label: 'Answer 3', multiline: true },
            { key: 'q4', label: 'Question 4' },
            { key: 'a4', label: 'Answer 4', multiline: true },
        ],
    },
    {
        id: 'cta',
        title: '🚀 CTA Section',
        fields: [
            { key: 'title', label: 'Title' },
            { key: 'subtitle', label: 'Subtitle', multiline: true },
            { key: 'browse', label: 'Browse Button' },
            { key: 'contact', label: 'Contact Button' },
        ],
    },
    {
        id: 'productsPage',
        title: '🛍️ Products Page',
        fields: [
            { key: 'title', label: 'Page Title' },
            { key: 'subtitle', label: 'Page Subtitle' },
            { key: 'search', label: 'Search Placeholder' },
            { key: 'filters', label: 'Filters Label' },
            { key: 'category', label: 'Category Label' },
            { key: 'allCategories', label: 'All Categories' },
            { key: 'duration', label: 'Duration Label' },
            { key: 'allDurations', label: 'All Durations' },
            { key: 'monthly', label: 'Monthly' },
            { key: 'threeMonths', label: '3 Months' },
            { key: 'sixMonths', label: '6 Months' },
            { key: 'yearly', label: 'Yearly' },
            { key: 'priceRange', label: 'Price Range' },
            { key: 'sortBy', label: 'Sort By' },
            { key: 'popular', label: 'Most Popular' },
            { key: 'priceLow', label: 'Price Low to High' },
            { key: 'priceHigh', label: 'Price High to Low' },
            { key: 'newest', label: 'Newest' },
            { key: 'noProducts', label: 'No Products Text' },
            { key: 'noProductsDesc', label: 'No Products Description' },
            { key: 'subscribe', label: 'Subscribe Button' },
            { key: 'unavailable', label: 'Unavailable Text' },
            { key: 'min', label: 'Min Placeholder' },
            { key: 'max', label: 'Max Placeholder' },
        ],
    },
    {
        id: 'product',
        title: '📦 Product Detail',
        fields: [
            { key: 'backToProducts', label: 'Back to Products' },
            { key: 'features', label: 'Features Title' },
            { key: 'selectPlan', label: 'Select Plan' },
            { key: 'totalPrice', label: 'Total Price' },
            { key: 'orderWhatsApp', label: 'Order via WhatsApp' },
            { key: 'addToCart', label: 'Add to Cart' },
            { key: 'added', label: 'Added Text' },
            { key: 'yourName', label: 'Your Name' },
            { key: 'yourPhone', label: 'Your Phone' },
        ],
    },
    {
        id: 'cart',
        title: '🛒 Cart Page',
        fields: [
            { key: 'title', label: 'Cart Title' },
            { key: 'items', label: 'Items (plural)' },
            { key: 'item', label: 'Item (singular)' },
            { key: 'inCart', label: 'In Cart Text' },
            { key: 'empty', label: 'Empty Cart Text' },
            { key: 'emptyDesc', label: 'Empty Description' },
            { key: 'browseProducts', label: 'Browse Products Button' },
            { key: 'orderSummary', label: 'Order Summary' },
            { key: 'total', label: 'Total' },
            { key: 'namePlaceholder', label: 'Name Placeholder' },
            { key: 'phonePlaceholder', label: 'Phone Placeholder' },
            { key: 'notesPlaceholder', label: 'Notes Placeholder' },
            { key: 'sendOrder', label: 'Send Order Button' },
            { key: 'sending', label: 'Sending Text' },
        ],
    },
    {
        id: 'thankYou',
        title: '🎉 Thank You Page',
        fields: [
            { key: 'title', label: 'Title' },
            { key: 'subtitle', label: 'Subtitle', multiline: true },
            { key: 'orderCode', label: 'Order Code Label' },
            { key: 'continueShopping', label: 'Continue Shopping' },
            { key: 'backHome', label: 'Back to Home' },
        ],
    },
    {
        id: 'contact',
        title: '📞 Contact Page',
        fields: [
            { key: 'title', label: 'Page Title' },
            { key: 'subtitle', label: 'Page Subtitle', multiline: true },
            { key: 'whatsapp', label: 'WhatsApp Title' },
            { key: 'whatsappDesc', label: 'WhatsApp Description' },
            { key: 'email', label: 'Email Title' },
            { key: 'emailDesc', label: 'Email Description' },
            { key: 'phone', label: 'Phone Title' },
            { key: 'phoneDesc', label: 'Phone Description' },
            { key: 'sendMessage', label: 'Send Message Title' },
            { key: 'yourNameLabel', label: 'Name Label' },
            { key: 'yourEmail', label: 'Email Label' },
            { key: 'yourMessage', label: 'Message Label' },
            { key: 'sendViaWhatsApp', label: 'Send via WhatsApp' },
            { key: 'whatsappGreeting', label: 'WhatsApp Greeting Message', multiline: true },
        ],
    },
    {
        id: 'footer',
        title: '🦶 Footer',
        fields: [
            { key: 'description', label: 'Description', multiline: true },
            { key: 'quickLinks', label: 'Quick Links Title' },
            { key: 'legal', label: 'Legal Title' },
            { key: 'privacy', label: 'Privacy Policy' },
            { key: 'terms', label: 'Terms & Conditions' },
            { key: 'refund', label: 'Refund Policy' },
            { key: 'rights', label: 'Rights Text' },
        ],
    },
    {
        id: 'common',
        title: '⚙️ Common',
        fields: [
            { key: 'loading', label: 'Loading Text' },
            { key: 'error', label: 'Error Text' },
        ],
    },
    {
        id: 'notFound',
        title: '🚫 404 Page',
        fields: [
            { key: 'title', label: 'Title' },
            { key: 'description', label: 'Description' },
            { key: 'backHome', label: 'Back Home Button' },
            { key: 'browseProducts', label: 'Browse Products Button' },
        ],
    },
    {
        id: 'privacy',
        title: '🔒 Privacy Policy',
        fields: [
            { key: 'title', label: 'Page Title' },
            { key: 'lastUpdated', label: 'Last Updated' },
            { key: 's1Title', label: 'Section 1 Title' },
            { key: 's1Desc', label: 'Section 1 Description', multiline: true },
            { key: 's1Item1', label: 'Section 1 Item 1' },
            { key: 's1Item2', label: 'Section 1 Item 2' },
            { key: 's1Item3', label: 'Section 1 Item 3' },
            { key: 's2Title', label: 'Section 2 Title' },
            { key: 's2Desc', label: 'Section 2 Description', multiline: true },
            { key: 's2Item1', label: 'Section 2 Item 1' },
            { key: 's2Item2', label: 'Section 2 Item 2' },
            { key: 's2Item3', label: 'Section 2 Item 3' },
            { key: 's2Item4', label: 'Section 2 Item 4' },
            { key: 's3Title', label: 'Section 3 Title' },
            { key: 's3Desc', label: 'Section 3 Description', multiline: true },
            { key: 's4Title', label: 'Section 4 Title' },
            { key: 's4Desc', label: 'Section 4 Description', multiline: true },
            { key: 's5Title', label: 'Section 5 Title' },
            { key: 's5Desc', label: 'Section 5 Description', multiline: true },
            { key: 's6Title', label: 'Section 6 Title' },
            { key: 's6Desc', label: 'Section 6 Description', multiline: true },
        ],
    },
    {
        id: 'terms',
        title: '📜 Terms & Conditions',
        fields: [
            { key: 'title', label: 'Page Title' },
            { key: 'lastUpdated', label: 'Last Updated' },
            { key: 's1Title', label: 'Section 1 Title' },
            { key: 's1Desc', label: 'Section 1 Description', multiline: true },
            { key: 's2Title', label: 'Section 2 Title' },
            { key: 's2Desc', label: 'Section 2 Description', multiline: true },
            { key: 's3Title', label: 'Section 3 Title' },
            { key: 's3Item1', label: 'Section 3 Item 1' },
            { key: 's3Item2', label: 'Section 3 Item 2' },
            { key: 's3Item3', label: 'Section 3 Item 3' },
            { key: 's3Item4', label: 'Section 3 Item 4' },
            { key: 's4Title', label: 'Section 4 Title' },
            { key: 's4Desc', label: 'Section 4 Description', multiline: true },
            { key: 's5Title', label: 'Section 5 Title' },
            { key: 's5Desc', label: 'Section 5 Description', multiline: true },
            { key: 's6Title', label: 'Section 6 Title' },
            { key: 's6Desc', label: 'Section 6 Description', multiline: true },
            { key: 's7Title', label: 'Section 7 Title' },
            { key: 's7Desc', label: 'Section 7 Description', multiline: true },
        ],
    },
    {
        id: 'refund',
        title: '💰 Refund Policy',
        fields: [
            { key: 'title', label: 'Page Title' },
            { key: 'lastUpdated', label: 'Last Updated' },
            { key: 's1Title', label: 'Section 1 Title' },
            { key: 's1Desc', label: 'Section 1 Description', multiline: true },
            { key: 's1Item1', label: 'Section 1 Item 1' },
            { key: 's1Item2', label: 'Section 1 Item 2' },
            { key: 's1Item3', label: 'Section 1 Item 3' },
            { key: 's2Title', label: 'Section 2 Title' },
            { key: 's2Item1', label: 'Section 2 Item 1' },
            { key: 's2Item2', label: 'Section 2 Item 2' },
            { key: 's2Item3', label: 'Section 2 Item 3' },
            { key: 's2Item4', label: 'Section 2 Item 4' },
            { key: 's3Title', label: 'Section 3 Title' },
            { key: 's3Item1', label: 'Section 3 Item 1' },
            { key: 's3Item2', label: 'Section 3 Item 2' },
            { key: 's3Item3', label: 'Section 3 Item 3' },
            { key: 's3Item4', label: 'Section 3 Item 4' },
            { key: 's4Title', label: 'Section 4 Title' },
            { key: 's4Desc', label: 'Section 4 Description', multiline: true },
            { key: 's5Title', label: 'Section 5 Title' },
            { key: 's5Desc', label: 'Section 5 Description', multiline: true },
        ],
    },
];

type ContentData = Record<string, Record<string, string>>;

export default function AdminContentPage() {
    const [contentEn, setContentEn] = useState<ContentData>({});
    const [contentAr, setContentAr] = useState<ContentData>({});
    const [activeTab, setActiveTab] = useState<'en' | 'ar'>('en');
    const [openSections, setOpenSections] = useState<Set<string>>(new Set(['hero']));
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);


    useEffect(() => {
        fetch('/api/settings')
            .then((r) => r.json())
            .then((data) => {
                if (data && !data.error) {
                    try {
                        setContentEn(data.contentEn ? JSON.parse(data.contentEn) : {});
                        setContentAr(data.contentAr ? JSON.parse(data.contentAr) : {});
                    } catch {
                        // defaults
                    }
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        await adminJsonFetch('/api/settings', {
            method: 'PUT',
            body: JSON.stringify({
                contentEn: JSON.stringify(contentEn),
                contentAr: JSON.stringify(contentAr),
            }),
        });
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const toggleSection = (id: string) => {
        const next = new Set(openSections);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setOpenSections(next);
    };

    const currentContent = activeTab === 'en' ? contentEn : contentAr;
    const setCurrentContent = activeTab === 'en' ? setContentEn : setContentAr;
    const defaultContent: Record<string, Record<string, string>> = activeTab === 'en' ? defaultEn as any : defaultAr as any;

    const updateField = (sectionId: string, key: string, value: string) => {
        setCurrentContent((prev) => ({
            ...prev,
            [sectionId]: {
                ...prev[sectionId],
                [key]: value,
            },
        }));
    };

    const inputClass = 'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 transition text-sm';

    if (loading) {
        return (
            <div className="max-w-4xl space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton h-16 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-6">
            <div className="fade-up">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                            <Globe className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Website Content</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Edit all text and labels on your website</p>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg transition-all text-sm ${saved
                            ? 'bg-emerald-500 text-white shadow-emerald-500/25'
                            : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-violet-500/25 hover:shadow-violet-500/40'
                            } disabled:opacity-50`}
                    >
                        {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}</>}
                    </button>
                </div>

                {/* Language Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('en')}
                        className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${activeTab === 'en'
                            ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        🇬🇧 English
                    </button>
                    <button
                        onClick={() => setActiveTab('ar')}
                        className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${activeTab === 'ar'
                            ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        🇸🇦 العربية
                    </button>
                </div>

                <p className="text-xs text-gray-400 mb-4">
                    💡 النص الأصلي يظهر داخل كل حقل. عدّل ما تريده فقط، أو اتركه كما هو.
                </p>

                {/* Sections */}
                <div className="space-y-3">
                    {contentSections.map((section) => (
                        <div
                            key={section.id}
                            className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 overflow-hidden"
                        >
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                            >
                                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                                    {section.title}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400">
                                        {section.fields.length} fields
                                    </span>
                                    {openSections.has(section.id) ? (
                                        <ChevronUp className="w-4 h-4 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                    )}
                                </div>
                            </button>

                            {openSections.has(section.id) && (
                                <div className="px-4 pb-4 space-y-3 border-t border-gray-100 dark:border-gray-800 pt-3">
                                    {section.fields.map((field) => (
                                        <div key={field.key}>
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                {field.label}
                                            </label>
                                            {field.multiline ? (
                                                <textarea
                                                    value={currentContent[section.id]?.[field.key] || ''}
                                                    onChange={(e) => updateField(section.id, field.key, e.target.value)}
                                                    rows={3}
                                                    className={`${inputClass} resize-none`}
                                                    placeholder={defaultContent[section.id]?.[field.key] || ''}
                                                    dir={activeTab === 'ar' ? 'rtl' : 'ltr'}
                                                />
                                            ) : (
                                                <input
                                                    value={currentContent[section.id]?.[field.key] || ''}
                                                    onChange={(e) => updateField(section.id, field.key, e.target.value)}
                                                    className={inputClass}
                                                    placeholder={defaultContent[section.id]?.[field.key] || ''}
                                                    dir={activeTab === 'ar' ? 'rtl' : 'ltr'}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Bottom Save */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`w-full mt-6 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg transition-all ${saved
                        ? 'bg-emerald-500 text-white shadow-emerald-500/25'
                        : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-violet-500/25 hover:shadow-violet-500/40'
                        } disabled:opacity-50`}
                >
                    {saved ? <><Check className="w-5 h-5" /> Saved!</> : <><Save className="w-5 h-5" /> {saving ? 'Saving...' : 'Save All Content'}</>}
                </button>
            </div>
        </div>
    );
}
