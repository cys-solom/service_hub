'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Filter, SlidersHorizontal, Package, Star, X, Ban, Shield, Clock } from 'lucide-react';
import { Product, Category } from '@/lib/types';
import { useI18n } from '@/lib/i18n';
import { useSettings } from '@/lib/settings-context';
import OptimizedImage from '@/components/OptimizedImage';

function ProductsContent() {
    const searchParams = useSearchParams();
    const { currencySymbol } = useSettings();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 99999]);
    const [maxPrice, setMaxPrice] = useState(500);
    const [duration, setDuration] = useState('');
    const [sort, setSort] = useState('recommended');
    const [showFilters, setShowFilters] = useState(false);
    const { t, locale } = useI18n();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [prodRes, catRes] = await Promise.all([
                fetch('/api/products'),
                fetch('/api/categories'),
            ]);
            const prods = await prodRes.json();
            const cats = await catRes.json();
            setProducts(prods);
            setCategories(cats);
            // Calculate dynamic max price
            if (Array.isArray(prods) && prods.length > 0) {
                const max = Math.ceil(Math.max(...prods.map((p: Product) => p.basePrice)) / 50) * 50;
                setMaxPrice(max);
                setPriceRange([0, max]);
            }
        } catch {
            console.error('Failed to fetch data');
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filtered = products
        .filter((p) => {
            if (search) {
                const q = search.toLowerCase();
                const matchEn = p.name.toLowerCase().includes(q);
                const matchAr = p.nameAr?.toLowerCase().includes(q);
                if (!matchEn && !matchAr) return false;
            }
            if (selectedCategory && p.category?.slug !== selectedCategory) return false;
            // Only apply price filter if user has actively changed it (min > 0 or max < maxPrice)
            const priceFilterActive = priceRange[0] > 0 || priceRange[1] < maxPrice;
            if (priceFilterActive && (p.basePrice < priceRange[0] || p.basePrice > priceRange[1])) return false;
            if (duration) {
                const hasDuration = p.variants?.some((v) => v.duration === duration);
                if (!hasDuration) return false;
            }
            return true;
        })
        .sort((a, b) => {
            switch (sort) {
                case 'price-asc':
                    return a.basePrice - b.basePrice;
                case 'price-desc':
                    return b.basePrice - a.basePrice;
                case 'popular':
                    return (b.orderCount || 0) - (a.orderCount || 0);
                default: {
                    const orderDiff = (a.displayOrder || 0) - (b.displayOrder || 0);
                    if (orderDiff !== 0) return orderDiff;
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                }
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
        });

    return (
        <div className="min-h-screen pt-8 pb-20 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        {t.productsPage.title}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        {t.productsPage.subtitle}
                    </p>
                </motion.div>

                {/* Search & Sort Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col sm:flex-row gap-4 mb-8"
                >
                    <div className="relative flex-1">
                        <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t.productsPage.search}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full ps-12 pe-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition"
                        />
                    </div>

                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 transition"
                    >
                        <option value="recommended">{locale === 'ar' ? 'الترتيب المقترح' : 'Recommended'}</option>
                        <option value="newest">{t.productsPage.newest}</option>
                        <option value="price-asc">{t.productsPage.priceLow}</option>
                        <option value="price-desc">{t.productsPage.priceHigh}</option>
                        <option value="popular">{t.productsPage.popular}</option>
                    </select>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition sm:hidden"
                    >
                        <SlidersHorizontal className="w-5 h-5" />
                        {t.productsPage.filters}
                    </button>
                </motion.div>

                <div className="flex gap-8">
                    {/* Sidebar Filters */}
                    <motion.aside
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className={`${showFilters ? 'fixed inset-0 z-50 bg-white dark:bg-gray-950 p-6 overflow-auto' : 'hidden'} sm:block sm:relative sm:w-64 sm:shrink-0`}
                    >
                        <div className="sm:sticky sm:top-24 space-y-6">
                            <div className="flex items-center justify-between sm:hidden">
                                <h3 className="font-semibold text-lg">{t.productsPage.filters}</h3>
                                <button onClick={() => setShowFilters(false)}>
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Category Filter */}
                            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-5">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-violet-500" />
                                    {t.productsPage.category}
                                </h4>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setSelectedCategory('')}
                                        className={`w-full text-start px-3 py-2 rounded-lg text-sm transition ${!selectedCategory
                                            ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 font-medium'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        {t.productsPage.allCategories}
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.slug)}
                                            className={`w-full text-start px-3 py-2 rounded-lg text-sm transition ${selectedCategory === cat.slug
                                                ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 font-medium'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                }`}
                                        >
                                            {cat.name}
                                            <span className="text-[10px] text-gray-400 ms-1">({products.filter(p => p.category?.slug === cat.slug).length})</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Duration Filter */}
                            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-5">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <SlidersHorizontal className="w-4 h-4 text-violet-500" />
                                    {t.productsPage.duration}
                                </h4>
                                <div className="space-y-2">
                                    {[
                                        { value: '', label: t.productsPage.allDurations },
                                        ...Array.from(new Set(products.flatMap(p => p.variants?.map(v => v.duration) || []).filter(Boolean)))
                                            .map(d => ({ value: d, label: d })),
                                    ].map((d) => (
                                        <button
                                            key={d.value}
                                            onClick={() => setDuration(d.value)}
                                            className={`w-full text-start px-3 py-2 rounded-lg text-sm transition ${duration === d.value
                                                ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 font-medium'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                }`}
                                        >
                                            {d.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-5">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{t.productsPage.priceRange}</h4>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        min="0"
                                        value={priceRange[0]}
                                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none"
                                        placeholder={t.productsPage.min}
                                    />
                                    <span className="text-gray-400">-</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={priceRange[1]}
                                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none"
                                        placeholder={t.productsPage.max}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => setShowFilters(false)}
                                className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-semibold sm:hidden"
                            >
                                {t.productsPage.filters}
                            </button>
                        </div>
                    </motion.aside>

                    {/* Product Grid */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                                        <div className="skeleton h-12 w-12 rounded-2xl mb-4" />
                                        <div className="skeleton h-5 w-3/4 mb-2" />
                                        <div className="skeleton h-4 w-1/2 mb-4" />
                                        <div className="skeleton h-4 w-full mb-2" />
                                        <div className="skeleton h-4 w-2/3 mb-4" />
                                        <div className="skeleton h-8 w-24" />
                                    </div>
                                ))}
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-20">
                                <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    {t.productsPage.noProducts}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {t.productsPage.noProductsDesc}
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {filtered.map((product) => (
                                    <div key={product.id}>
                                        <Link href={`/product/${product.slug}`}>
                                            <div className={`group flex items-start gap-5 p-5 rounded-2xl transition-all duration-300 hover:shadow-lg ${product.outOfStock ? 'opacity-60' : ''} bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-600/50 hover:border-violet-300 dark:hover:border-violet-500/60`}>
                                                {/* Logo */}
                                                <div className={`shrink-0 w-[72px] h-[72px] rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 flex items-center justify-center p-3 overflow-hidden ${product.outOfStock ? 'grayscale' : ''}`}>
                                                    {product.images?.[0] && !product.images[0].endsWith('.svg') ? (
                                                        <OptimizedImage
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            width={120}
                                                            height={120}
                                                            className="w-full h-full object-contain"
                                                            fallbackIcon={false}
                                                        />
                                                    ) : null}
                                                    {(!product.images?.[0] || product.images[0].endsWith('.svg')) && (
                                                        <span className="text-2xl font-black text-violet-600 dark:text-violet-400 select-none">
                                                            {(locale === 'ar' && product.nameAr ? product.nameAr : product.name).trim()[0]?.toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    {/* Product name */}
                                                    <h3 className={`font-bold text-lg leading-snug mb-2.5 ${product.outOfStock ? 'text-gray-400' : 'text-gray-900 dark:text-white'} line-clamp-2`}>
                                                        {locale === 'ar' && product.nameAr ? product.nameAr : product.name}
                                                    </h3>

                                                    {/* Tags */}
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {(product.fullWarranty || product.variants?.some(v => v.warrantyDays > 0)) && (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                                                                <Shield className="w-3.5 h-3.5" />
                                                                {locale === 'ar' ? 'ضمان' : 'Warranty'}
                                                            </span>
                                                        )}
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/15 text-xs font-semibold text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20">
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                                                            </svg>
                                                            {locale === 'ar' ? 'سياسة استرجاع' : 'Refund Policy'}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-500/15 text-xs font-semibold text-orange-700 dark:text-orange-400 border border-orange-100 dark:border-orange-500/20">
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                                                            </svg>
                                                            {locale === 'ar' ? '60 دقيقة' : '60 min'}
                                                        </span>
                                                        {product.outOfStock && (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-500/15 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20">
                                                                <Ban className="w-3.5 h-3.5" />
                                                                {t.productsPage.unavailable}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="skeleton h-8 w-32" /></div>}>
            <ProductsContent />
        </Suspense>
    );
}
