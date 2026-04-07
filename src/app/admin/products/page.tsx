'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    Edit,
    Trash2,
    Package,
    X,
    Save,
    Eye,
    EyeOff,
    Clock,
    Search,
    AlertTriangle,
    Ban,
    Star,
} from 'lucide-react';
import { useSettings } from '@/lib/settings-context';

interface VariantInput {
    title: string;
    duration: string;
    price: string;
}

interface ProductData {
    id: string;
    name: string;
    slug: string;
    description: string;
    features: string[];
    basePrice: number;
    discount: number;
    isActive: boolean;
    outOfStock: boolean;
    isFeatured: boolean;
    unavailableUntil: string | null;
    images: string[];
    durationLabel: string;
    categoryId: string;
    category: { name: string };
    variants: Array<{
        id: string;
        title: string;
        duration: string;
        price: number;
        isActive: boolean;
        outOfStock: boolean;
    }>;
}

interface CategoryData {
    id: string;
    name: string;
    slug: string;
}

export default function AdminProductsPage() {
    const { currencySymbol } = useSettings();
    const [products, setProducts] = useState<ProductData[]>([]);
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        features: '',
        basePrice: '',
        discount: '0',
        images: '',
        categoryId: '',
        isActive: true,
        unavailableUntil: '',
        durationLabel: '',
    });
    const [formVariants, setFormVariants] = useState<VariantInput[]>([]);
    const [showVariantForm, setShowVariantForm] = useState<string | null>(null);
    const [variantData, setVariantData] = useState({
        title: '',
        duration: '',
        price: '',
    });
    const [showUnavailableModal, setShowUnavailableModal] = useState<string | null>(null);
    const [unavailableDate, setUnavailableDate] = useState('');
    const [loadingAction, setLoadingAction] = useState<string | null>(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';

    const fetchData = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([
                fetch('/api/admin/products', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/categories'),
            ]);
            const prods = await prodRes.json();
            const cats = await catRes.json();
            setProducts(Array.isArray(prods) ? prods : []);
            setCategories(Array.isArray(cats) ? cats : []);
        } catch {
            console.error('Failed to fetch');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const body: Record<string, unknown> = {
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            features: formData.features.split('\n').filter(Boolean),
            basePrice: formData.basePrice,
            discount: formData.discount,
            images: formData.images.split('\n').filter(Boolean),
            categoryId: formData.categoryId,
            isActive: formData.isActive,
            durationLabel: formData.durationLabel,
            unavailableUntil: formData.unavailableUntil || null,
        };

        // Include variants only for new products
        if (!editingProduct && formVariants.length > 0) {
            body.variants = formVariants.filter(v => v.title && v.price);
        }

        const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
        const method = editingProduct ? 'PUT' : 'POST';

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(body),
        });

        setShowForm(false);
        setEditingProduct(null);
        resetForm();
        fetchData();
    };

    const handleEdit = (product: ProductData) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            slug: product.slug,
            description: product.description,
            features: (product.features || []).join('\n'),
            basePrice: String(product.basePrice),
            discount: String(product.discount),
            images: (product.images || []).join('\n'),
            categoryId: product.categoryId,
            isActive: product.isActive,
            unavailableUntil: product.unavailableUntil ? new Date(product.unavailableUntil).toISOString().slice(0, 16) : '',
            durationLabel: product.durationLabel || '',
        });
        setFormVariants([]);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this product?')) return;
        await fetch(`/api/products/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        fetchData();
    };

    const handleToggleActive = async (product: ProductData) => {
        const actionKey = `active-${product.id}`;
        setLoadingAction(actionKey);
        // Optimistic update
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isActive: !p.isActive } : p));
        try {
            await fetch(`/api/products/${product.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ isActive: !product.isActive }),
            });
        } catch {
            // Revert on error
            setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isActive: product.isActive } : p));
        }
        setLoadingAction(null);
    };

    const handleToggleOutOfStock = async (product: ProductData) => {
        const actionKey = `stock-${product.id}`;
        setLoadingAction(actionKey);
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, outOfStock: !p.outOfStock } : p));
        try {
            await fetch(`/api/products/${product.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ outOfStock: !product.outOfStock }),
            });
        } catch {
            setProducts(prev => prev.map(p => p.id === product.id ? { ...p, outOfStock: product.outOfStock } : p));
        }
        setLoadingAction(null);
    };

    const handleToggleVariantOutOfStock = async (variantId: string, currentValue: boolean) => {
        const actionKey = `variant-${variantId}`;
        setLoadingAction(actionKey);
        setProducts(prev => prev.map(p => ({
            ...p,
            variants: p.variants.map(v => v.id === variantId ? { ...v, outOfStock: !v.outOfStock } : v)
        })));
        try {
            await fetch(`/api/variants/${variantId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ outOfStock: !currentValue }),
            });
        } catch {
            setProducts(prev => prev.map(p => ({
                ...p,
                variants: p.variants.map(v => v.id === variantId ? { ...v, outOfStock: currentValue } : v)
            })));
        }
        setLoadingAction(null);
    };

    const handleToggleFeatured = async (product: ProductData) => {
        const actionKey = `featured-${product.id}`;
        setLoadingAction(actionKey);
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isFeatured: !p.isFeatured } : p));
        try {
            await fetch(`/api/products/${product.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ isFeatured: !product.isFeatured }),
            });
        } catch {
            setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isFeatured: product.isFeatured } : p));
        }
        setLoadingAction(null);
    };

    const handleSetUnavailable = async (productId: string) => {
        await fetch(`/api/products/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
                unavailableUntil: unavailableDate ? new Date(unavailableDate).toISOString() : null,
                isActive: false,
            }),
        });
        setShowUnavailableModal(null);
        setUnavailableDate('');
        fetchData();
    };

    const handleClearUnavailable = async (productId: string) => {
        await fetch(`/api/products/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
                unavailableUntil: null,
                isActive: true,
            }),
        });
        fetchData();
    };

    const handleAddVariant = async (productId: string) => {
        await fetch('/api/variants', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ ...variantData, productId }),
        });
        setShowVariantForm(null);
        setVariantData({ title: '', duration: '', price: '' });
        fetchData();
    };

    const handleDeleteVariant = async (variantId: string) => {
        if (!confirm('Delete this variant?')) return;
        await fetch(`/api/variants/${variantId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        fetchData();
    };

    const addFormVariant = () => {
        setFormVariants([...formVariants, { title: '', duration: '', price: '' }]);
    };

    const updateFormVariant = (index: number, field: keyof VariantInput, value: string) => {
        const updated = [...formVariants];
        updated[index] = { ...updated[index], [field]: value };
        setFormVariants(updated);
    };

    const removeFormVariant = (index: number) => {
        setFormVariants(formVariants.filter((_, i) => i !== index));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            description: '',
            features: '',
            basePrice: '',
            discount: '0',
            images: '',
            categoryId: categories[0]?.id || '',
            isActive: true,
            unavailableUntil: '',
            durationLabel: '',
        });
        setFormVariants([]);
    };

    const isUnavailable = (product: ProductData) => {
        if (!product.unavailableUntil) return false;
        return new Date(product.unavailableUntil) > new Date();
    };

    const filteredProducts = products.filter((p) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category?.name.toLowerCase().includes(q)
        );
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Products</h2>
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-violet-500 w-48"
                        />
                    </div>
                    <button
                        onClick={() => {
                            setEditingProduct(null);
                            resetForm();
                            setShowForm(true);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-medium flex items-center gap-2 text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add Product
                    </button>
                </div>
            </div>

            {/* Unavailable Until Modal */}
            {showUnavailableModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Set Unavailable Period</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Product will be hidden until this date</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Unavailable Until
                                </label>
                                <input
                                    type="datetime-local"
                                    value={unavailableDate}
                                    onChange={(e) => setUnavailableDate(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleSetUnavailable(showUnavailableModal)}
                                    className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition"
                                >
                                    Set Unavailable
                                </button>
                                <button
                                    onClick={() => { setShowUnavailableModal(null); setUnavailableDate(''); }}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Product Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                {editingProduct ? 'Edit Product' : 'New Product'}
                            </h3>
                            <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                                    <input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug</label>
                                    <input
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                                <select
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                                    required
                                >
                                    <option value="">Select category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm resize-none"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Base Price ({currencySymbol})</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.basePrice}
                                        onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount ({currencySymbol})</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.discount}
                                        onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Card Duration Label</label>
                                <input
                                    value={formData.durationLabel}
                                    onChange={(e) => setFormData({ ...formData, durationLabel: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                                    placeholder="e.g. شهري, سنوي, yearly, monthly"
                                />
                                <p className="text-xs text-gray-400 mt-1">Text shown on product card like &quot;170 EGP /شهري&quot;</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Features (one per line)</label>
                                <textarea
                                    value={formData.features}
                                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm resize-none"
                                    placeholder={"Feature 1\nFeature 2"}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URLs (one per line)</label>
                                <textarea
                                    value={formData.images}
                                    onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm resize-none"
                                    placeholder="https://example.com/image.png"
                                />
                            </div>

                            {/* Unavailable Until */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Unavailable Until (optional)
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.unavailableUntil}
                                    onChange={(e) => setFormData({ ...formData, unavailableUntil: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                                />
                                <p className="text-xs text-gray-400 mt-1">Leave empty if product is always available</p>
                            </div>

                            {/* Subscription Variants (for new products) */}
                            {!editingProduct && (
                                <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Subscription Plans
                                        </label>
                                        <button
                                            type="button"
                                            onClick={addFormVariant}
                                            className="text-xs text-violet-600 dark:text-violet-400 font-medium hover:underline flex items-center gap-1"
                                        >
                                            <Plus className="w-3 h-3" /> Add Plan
                                        </button>
                                    </div>
                                    {formVariants.length === 0 && (
                                        <p className="text-xs text-gray-400">No plans added yet. You can add them after creating the product too.</p>
                                    )}
                                    <div className="space-y-3">
                                        {formVariants.map((v, i) => (
                                            <div key={i} className="flex items-end gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                                <div className="flex-1">
                                                    <label className="block text-xs text-gray-500 mb-1">Title</label>
                                                    <input
                                                        placeholder="e.g. Monthly Plan"
                                                        value={v.title}
                                                        onChange={(e) => updateFormVariant(i, 'title', e.target.value)}
                                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none"
                                                    />
                                                </div>
                                                <div className="w-32">
                                                    <label className="block text-xs text-gray-500 mb-1">Duration</label>
                                                    <input
                                                        placeholder="e.g. 1 Month"
                                                        value={v.duration}
                                                        onChange={(e) => updateFormVariant(i, 'duration', e.target.value)}
                                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none"
                                                    />
                                                </div>
                                                <div className="w-24">
                                                    <label className="block text-xs text-gray-500 mb-1">Price</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder={currencySymbol}
                                                        value={v.price}
                                                        onChange={(e) => updateFormVariant(i, 'price', e.target.value)}
                                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFormVariant(i)}
                                                    className="p-2 text-red-400 hover:text-red-500"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="rounded"
                                />
                                <label className="text-sm text-gray-700 dark:text-gray-300">Active</label>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 text-sm"
                            >
                                <Save className="w-4 h-4" />
                                {editingProduct ? 'Update Product' : 'Create Product'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Products List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                            <div className="skeleton h-6 w-48 mb-2" />
                            <div className="skeleton h-4 w-32" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredProducts.length === 0 && (
                        <div className="text-center py-20 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
                            <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400">
                                {searchQuery ? 'No products found matching your search' : 'No products yet'}
                            </p>
                        </div>
                    )}
                    {filteredProducts.map((product) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`rounded-2xl border ${isUnavailable(product) ? 'border-amber-300 dark:border-amber-700' : 'border-gray-200 dark:border-gray-800'} bg-white dark:bg-gray-900/50 p-5`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center overflow-hidden shrink-0">
                                        {product.images?.[0] ? (
                                            <img src={product.images[0]} alt="" className="w-8 h-8 object-contain" />
                                        ) : (
                                            <Package className="w-6 h-6 text-violet-500" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${product.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'}`}>
                                                {product.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                            {product.outOfStock && (
                                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 flex items-center gap-1">
                                                    <Ban className="w-3 h-3" /> Out of Stock
                                                </span>
                                            )}
                                            {product.isFeatured && (
                                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 flex items-center gap-1">
                                                    <Star className="w-3 h-3 fill-current" /> Featured
                                                </span>
                                            )}
                                            {isUnavailable(product) && (
                                                <span className="badge-unavailable">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    Unavailable until {new Date(product.unavailableUntil!).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {product.category?.name} · {product.basePrice} {currencySymbol}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                    {/* Toggle Unavailable Period */}
                                    {isUnavailable(product) ? (
                                        <button
                                            onClick={() => handleClearUnavailable(product.id)}
                                            className="p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition"
                                            title="Make available again"
                                        >
                                            <Clock className="w-4 h-4 text-emerald-500" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setShowUnavailableModal(product.id)}
                                            className="p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-500/10 transition"
                                            title="Set unavailable period"
                                        >
                                            <Clock className="w-4 h-4 text-amber-500" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleToggleOutOfStock(product)}
                                        disabled={loadingAction === `stock-${product.id}`}
                                        className={`p-2 rounded-lg transition ${loadingAction === `stock-${product.id}` ? 'opacity-50 cursor-wait' : ''} ${product.outOfStock ? 'hover:bg-emerald-50 dark:hover:bg-emerald-500/10' : 'hover:bg-red-50 dark:hover:bg-red-500/10'}`}
                                        title={product.outOfStock ? 'Mark In Stock' : 'Mark Out of Stock'}
                                    >
                                        <Ban className={`w-4 h-4 ${product.outOfStock ? 'text-red-500' : 'text-gray-400'} ${loadingAction === `stock-${product.id}` ? 'animate-pulse' : ''}`} />
                                    </button>
                                    <button
                                        onClick={() => handleToggleFeatured(product)}
                                        disabled={loadingAction === `featured-${product.id}`}
                                        className={`p-2 rounded-lg transition ${loadingAction === `featured-${product.id}` ? 'opacity-50 cursor-wait' : ''} ${product.isFeatured ? 'hover:bg-gray-100 dark:hover:bg-gray-800' : 'hover:bg-amber-50 dark:hover:bg-amber-500/10'}`}
                                        title={product.isFeatured ? 'Remove from Featured' : 'Add to Featured'}
                                    >
                                        <Star className={`w-4 h-4 ${product.isFeatured ? 'text-amber-500 fill-current' : 'text-gray-400'} ${loadingAction === `featured-${product.id}` ? 'animate-pulse' : ''}`} />
                                    </button>
                                    <button
                                        onClick={() => handleToggleActive(product)}
                                        disabled={loadingAction === `active-${product.id}`}
                                        className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition ${loadingAction === `active-${product.id}` ? 'opacity-50 cursor-wait' : ''}`}
                                        title={product.isActive ? 'Deactivate' : 'Activate'}
                                    >
                                        {product.isActive ? (
                                            <Eye className={`w-4 h-4 text-emerald-500 ${loadingAction === `active-${product.id}` ? 'animate-pulse' : ''}`} />
                                        ) : (
                                            <EyeOff className={`w-4 h-4 text-gray-400 ${loadingAction === `active-${product.id}` ? 'animate-pulse' : ''}`} />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleEdit(product)}
                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                    >
                                        <Edit className="w-4 h-4 text-blue-500" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            </div>

                            {/* Variants */}
                            <div className="mt-4 pl-16">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Subscription Plans:</span>
                                    <button
                                        onClick={() => setShowVariantForm(showVariantForm === product.id ? null : product.id)}
                                        className="text-xs text-violet-600 dark:text-violet-400 font-medium hover:underline flex items-center gap-1"
                                    >
                                        <Plus className="w-3 h-3" /> Add
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {product.variants?.map((v) => (
                                        <div
                                            key={v.id}
                                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${v.outOfStock ? 'bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-800' : 'bg-gray-50 dark:bg-gray-800/50'}`}
                                        >
                                            <span className={`${v.outOfStock ? 'text-red-400 line-through' : 'text-gray-700 dark:text-gray-300'}`}>{v.title}</span>
                                            <span className="text-gray-400">·</span>
                                            <span className="text-xs text-gray-400">{v.duration}</span>
                                            <span className="text-gray-400">·</span>
                                            <span className={`font-medium ${v.outOfStock ? 'text-red-400 line-through' : 'text-violet-600 dark:text-violet-400'}`}>{v.price} {currencySymbol}</span>
                                            {v.outOfStock && (
                                                <span className="text-[10px] font-bold text-red-500 uppercase">Out of Stock</span>
                                            )}
                                            <button
                                                onClick={() => handleToggleVariantOutOfStock(v.id, v.outOfStock)}
                                                className={`ml-1 ${v.outOfStock ? 'text-emerald-500 hover:text-emerald-600' : 'text-amber-400 hover:text-amber-500'}`}
                                                title={v.outOfStock ? 'Mark In Stock' : 'Mark Out of Stock'}
                                            >
                                                <Ban className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteVariant(v.id)}
                                                className="ml-1 text-red-400 hover:text-red-500"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {(!product.variants || product.variants.length === 0) && (
                                        <span className="text-xs text-gray-400">No plans yet</span>
                                    )}
                                </div>

                                {showVariantForm === product.id && (
                                    <div className="mt-3 flex items-end gap-3 flex-wrap p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Title</label>
                                            <input
                                                placeholder="Plan name"
                                                value={variantData.title}
                                                onChange={(e) => setVariantData({ ...variantData, title: e.target.value })}
                                                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none w-32"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Duration</label>
                                            <input
                                                placeholder="e.g. 1 Year"
                                                value={variantData.duration}
                                                onChange={(e) => setVariantData({ ...variantData, duration: e.target.value })}
                                                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none w-28"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Price</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder={currencySymbol}
                                                value={variantData.price}
                                                onChange={(e) => setVariantData({ ...variantData, price: e.target.value })}
                                                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none w-24"
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleAddVariant(product.id)}
                                            className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition"
                                        >
                                            Add
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))
                    }
                </div >
            )}
        </div >
    );
}
