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
    Image as ImageIcon,
    Link,
    ArrowUp,
    ArrowDown,
    GripVertical,
    ChevronUp,
    ChevronDown,
} from 'lucide-react';
import { useSettings } from '@/lib/settings-context';

interface VariantInput {
    title: string;
    duration: string;
    price: string;
    warrantyDays: string;
}

interface ProductData {
    id: string;
    name: string;
    nameAr: string;
    slug: string;
    description: string;
    descriptionAr: string;
    features: string[];
    featuresAr: string[];
    basePrice: number;
    discount: number;
    isActive: boolean;
    outOfStock: boolean;
    isFeatured: boolean;
    unavailableUntil: string | null;
    images: string[];
    displayOrder: number;
    durationLabel: string;
    fullWarranty: boolean;
    warrantyOptions: Array<{ label: string; labelAr: string; days: number; price: number }>;
    categoryId: string;
    category: { name: string };
    variants: Array<{
        id: string;
        title: string;
        duration: string;
        price: number;
        warrantyDays: number;
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
        nameAr: '',
        slug: '',
        description: '',
        descriptionAr: '',
        features: '',
        featuresAr: '',
        basePrice: '',
        discount: '0',
        images: '',
        categoryId: '',
        isActive: true,
        fullWarranty: false,
        displayOrder: '0',
        unavailableUntil: '',
        durationLabel: '',
    });
    const [formVariants, setFormVariants] = useState<VariantInput[]>([]);
    const [showVariantForm, setShowVariantForm] = useState<string | null>(null);
    const [variantData, setVariantData] = useState({
        title: '',
        duration: '',
        price: '',
        warrantyDays: '0',
    });
    const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
    const [editVariantData, setEditVariantData] = useState({
        title: '',
        duration: '',
        price: '',
        warrantyDays: '0',
    });
    const [showUnavailableModal, setShowUnavailableModal] = useState<string | null>(null);
    const [unavailableDate, setUnavailableDate] = useState('');
    const [loadingAction, setLoadingAction] = useState<string | null>(null);
    const [formWarrantyOptions, setFormWarrantyOptions] = useState<Array<{ label: string; labelAr: string; days: number; price: number }>>([]);

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
            nameAr: formData.nameAr,
            slug: formData.slug,
            description: formData.description,
            descriptionAr: formData.descriptionAr,
            features: formData.features.split('\n').filter(Boolean),
            featuresAr: formData.featuresAr.split('\n').filter(Boolean),
            basePrice: formData.basePrice,
            discount: formData.discount,
            images: formData.images.trim() ? [formData.images.trim()] : [],
            categoryId: formData.categoryId,
            isActive: formData.isActive,
            fullWarranty: formData.fullWarranty,
            displayOrder: parseInt(formData.displayOrder) || 0,
            durationLabel: formData.durationLabel,
            warrantyOptions: formWarrantyOptions,
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
            nameAr: product.nameAr || '',
            slug: product.slug,
            description: product.description,
            descriptionAr: product.descriptionAr || '',
            features: (product.features || []).join('\n'),
            featuresAr: (product.featuresAr || []).join('\n'),
            basePrice: String(product.basePrice),
            discount: String(product.discount),
            images: (product.images || [])[0] || '',
            categoryId: product.categoryId,
            isActive: product.isActive,
            fullWarranty: product.fullWarranty || false,
            displayOrder: String(product.displayOrder || 0),
            unavailableUntil: product.unavailableUntil ? new Date(product.unavailableUntil).toISOString().slice(0, 16) : '',
            durationLabel: product.durationLabel || '',
        });
        setFormVariants([]);
        const wo = product.warrantyOptions;
        setFormWarrantyOptions(Array.isArray(wo) ? wo : (typeof wo === 'string' ? JSON.parse(wo || '[]') : []));
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
        setVariantData({ title: '', duration: '', price: '', warrantyDays: '0' });
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

    const handleStartEditVariant = (variant: ProductData['variants'][0]) => {
        setEditingVariantId(variant.id);
        setEditVariantData({
            title: variant.title,
            duration: variant.duration,
            price: String(variant.price),
            warrantyDays: String(variant.warrantyDays || 0),
        });
    };

    const handleSaveVariant = async (variantId: string) => {
        const actionKey = `edit-variant-${variantId}`;
        setLoadingAction(actionKey);
        try {
            await fetch(`/api/variants/${variantId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    title: editVariantData.title,
                    duration: editVariantData.duration,
                    price: editVariantData.price,
                    warrantyDays: editVariantData.warrantyDays,
                }),
            });
            // Optimistic update
            setProducts(prev => prev.map(p => ({
                ...p,
                variants: p.variants.map(v => v.id === variantId ? {
                    ...v,
                    title: editVariantData.title,
                    duration: editVariantData.duration,
                    price: parseFloat(editVariantData.price) || 0,
                    warrantyDays: parseInt(editVariantData.warrantyDays) || 0,
                } : v)
            })));
        } catch {
            fetchData();
        }
        setEditingVariantId(null);
        setLoadingAction(null);
    };

    const handleCancelEditVariant = () => {
        setEditingVariantId(null);
    };

    const handleReorderVariant = async (productId: string, variantId: string, direction: 'up' | 'down') => {
        const product = products.find(p => p.id === productId);
        if (!product?.variants) return;
        const variants = [...product.variants];
        const idx = variants.findIndex(v => v.id === variantId);
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= variants.length) return;
        // Swap
        [variants[idx], variants[swapIdx]] = [variants[swapIdx], variants[idx]];
        // Optimistic update
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, variants } : p));
        // Save to server
        await fetch('/api/variants/reorder', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ orderedIds: variants.map(v => v.id) }),
        }).catch(() => fetchData());
    };

    const addFormVariant = () => {
        setFormVariants([...formVariants, { title: '', duration: '', price: '', warrantyDays: '0' }]);
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
        const maxOrder = products.reduce((max, p) => Math.max(max, p.displayOrder || 0), 0);
        setFormData({
            name: '',
            nameAr: '',
            slug: '',
            description: '',
            descriptionAr: '',
            features: '',
            featuresAr: '',
            basePrice: '',
            discount: '0',
            images: '',
            categoryId: categories[0]?.id || '',
            isActive: true,
            fullWarranty: false,
            displayOrder: String(maxOrder + 1),
            unavailableUntil: '',
            durationLabel: '',
        });
        setFormVariants([]);
        setFormWarrantyOptions([]);
    };

    const handleMoveOrder = async (product: ProductData, direction: 'up' | 'down') => {
        // Sort products by current displayOrder
        const sorted = [...products].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        const idx = sorted.findIndex(p => p.id === product.id);
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        
        if (swapIdx < 0 || swapIdx >= sorted.length) return; // Can't move further
        
        const neighbor = sorted[swapIdx];
        const myOrder = product.displayOrder || 0;
        const neighborOrder = neighbor.displayOrder || 0;
        
        // Swap orders - if same, assign sequential values
        const newMyOrder = neighborOrder;
        const newNeighborOrder = myOrder === neighborOrder 
            ? (direction === 'up' ? myOrder + 1 : myOrder - 1)
            : myOrder;
        
        // Optimistic update
        setProducts(prev => prev.map(p => {
            if (p.id === product.id) return { ...p, displayOrder: newMyOrder };
            if (p.id === neighbor.id) return { ...p, displayOrder: newNeighborOrder };
            return p;
        }));
        
        // Fire and forget - don't block UI
        Promise.all([
            fetch(`/api/products/${product.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ displayOrder: newMyOrder }),
            }),
            fetch(`/api/products/${neighbor.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ displayOrder: newNeighborOrder }),
            }),
        ]).catch(() => fetchData()); // Only refetch on error
    };

    const isUnavailable = (product: ProductData) => {
        if (!product.unavailableUntil) return false;
        return new Date(product.unavailableUntil) > new Date();
    };

    const filteredProducts = products
        .filter((p) => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (
                p.name.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q) ||
                p.category?.name.toLowerCase().includes(q)
            );
        })
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

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
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (English)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name (Arabic) <span className="text-xs text-gray-400">اسم المنتج</span></label>
                                <input
                                    value={formData.nameAr}
                                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                                    dir="rtl"
                                    placeholder="اسم المنتج بالعربية"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Arabic) <span className="text-xs text-gray-400">الوصف</span></label>
                                <textarea
                                    value={formData.descriptionAr}
                                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm resize-none"
                                    dir="rtl"
                                    placeholder="وصف المنتج بالعربية"
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
                            {/* Warranty Options */}
                            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                                {/* Full Warranty Checkbox */}
                                <label className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.fullWarranty}
                                        onChange={(e) => setFormData({ ...formData, fullWarranty: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <div>
                                        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">🛡️ Full Warranty</span>
                                        <p className="text-[11px] text-emerald-600/70 dark:text-emerald-400/60">All plans include full warranty — customer doesn&apos;t need to choose</p>
                                    </div>
                                </label>
                                {!formData.fullWarranty && (
                                <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Warranty Upgrade Options</label>
                                    <button
                                        type="button"
                                        onClick={() => setFormWarrantyOptions([...formWarrantyOptions, { label: '', labelAr: '', days: 0, price: 0 }])}
                                        className="text-xs px-3 py-1 bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-lg font-medium hover:bg-violet-200 dark:hover:bg-violet-500/20 transition"
                                    >
                                        + Add Tier
                                    </button>
                                </div>
                                {formWarrantyOptions.length === 0 ? (
                                    <p className="text-xs text-gray-400 text-center py-3">No warranty tiers. Click &quot;+ Add Tier&quot; to offer warranty upgrades.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {formWarrantyOptions.map((opt, idx) => (
                                            <div key={idx} className="flex items-end gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/30">
                                                <div className="flex-1">
                                                    <label className="block text-[10px] text-gray-400 mb-0.5">Label EN</label>
                                                    <input
                                                        value={opt.label}
                                                        onChange={(e) => { const u = [...formWarrantyOptions]; u[idx] = { ...u[idx], label: e.target.value }; setFormWarrantyOptions(u); }}
                                                        className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white outline-none"
                                                        placeholder="1 Month"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="block text-[10px] text-gray-400 mb-0.5">Label AR</label>
                                                    <input
                                                        value={opt.labelAr}
                                                        onChange={(e) => { const u = [...formWarrantyOptions]; u[idx] = { ...u[idx], labelAr: e.target.value }; setFormWarrantyOptions(u); }}
                                                        className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white outline-none text-right"
                                                        placeholder="شهر"
                                                        dir="rtl"
                                                    />
                                                </div>
                                                <div className="w-16">
                                                    <label className="block text-[10px] text-gray-400 mb-0.5">Days</label>
                                                    <input
                                                        type="number"
                                                        value={opt.days}
                                                        onChange={(e) => { const u = [...formWarrantyOptions]; u[idx] = { ...u[idx], days: parseInt(e.target.value) || 0 }; setFormWarrantyOptions(u); }}
                                                        className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white outline-none"
                                                    />
                                                </div>
                                                <div className="w-20">
                                                    <label className="block text-[10px] text-gray-400 mb-0.5">Price ({currencySymbol})</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={opt.price}
                                                        onChange={(e) => { const u = [...formWarrantyOptions]; u[idx] = { ...u[idx], price: parseFloat(e.target.value) || 0 }; setFormWarrantyOptions(u); }}
                                                        className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white outline-none"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormWarrantyOptions(formWarrantyOptions.filter((_, i) => i !== idx))}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition shrink-0"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Order</label>
                                <input
                                    type="number"
                                    value={formData.displayOrder}
                                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                                    placeholder="0"
                                />
                                <p className="text-xs text-gray-400 mt-1">Lower numbers appear first (0, 1, 2...)</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Features (English, one per line)</label>
                                <textarea
                                    value={formData.features}
                                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm resize-none"
                                    placeholder={"Feature 1\nFeature 2"}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Features (Arabic) <span className="text-xs text-gray-400">المميزات</span></label>
                                <textarea
                                    value={formData.featuresAr}
                                    onChange={(e) => setFormData({ ...formData, featuresAr: e.target.value })}
                                    rows={2}
                                    dir="rtl"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm resize-none"
                                    placeholder="ميزة 1
ميزة 2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4" />
                                    Product Image
                                </label>
                                <div className="flex gap-3">
                                    {/* Image Preview */}
                                    <div className="w-20 h-20 shrink-0 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center overflow-hidden">
                                        {formData.images && formData.images.trim() ? (
                                            <img
                                                src={formData.images.split('\n')[0]}
                                                alt="Preview"
                                                className="w-full h-full object-contain p-1"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                }}
                                            />
                                        ) : (
                                            <Package className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <Link className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <input
                                                value={formData.images}
                                                onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                                                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                                                placeholder="https://example.com/logo.png or /logos/name.svg"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                                            💡 Add image link (URL) — e.g. <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-violet-500">/logos/chatgpt.svg</code> for local logos, or paste any external image URL
                                        </p>
                                    </div>
                                </div>
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
                                    {/* Quick Order Input */}
                                    <div className="flex items-center gap-1 me-1">
                                        <span className="text-[10px] text-gray-400 font-medium">#</span>
                                        <input
                                            type="number"
                                            min="1"
                                            value={product.displayOrder || 1}
                                            onChange={(e) => {
                                                const newOrder = Math.max(1, parseInt(e.target.value) || 1);
                                                setProducts(prev => prev.map(p =>
                                                    p.id === product.id ? { ...p, displayOrder: newOrder } : p
                                                ));
                                                fetch(`/api/products/${product.id}`, {
                                                    method: 'PUT',
                                                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                                    body: JSON.stringify({ displayOrder: newOrder }),
                                                }).catch(() => fetchData());
                                            }}
                                            className="w-12 px-1.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-center text-sm font-bold text-violet-600 dark:text-violet-400 outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                            title="Display order (lower = first)"
                                        />
                                    </div>
                                    <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
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

                                <div className="space-y-1.5">
                                    {product.variants?.map((v, vIdx) => (
                                        <div
                                            key={v.id}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${editingVariantId === v.id ? 'bg-violet-50 dark:bg-violet-500/10 border border-violet-300 dark:border-violet-700 ring-1 ring-violet-400/30' : v.outOfStock ? 'bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-800' : 'bg-gray-50 dark:bg-gray-800/50'}`}
                                        >
                                            {editingVariantId === v.id ? (
                                                /* Editing Mode */
                                                <>
                                                    <span className="text-xs text-violet-500 font-mono w-5 shrink-0">{vIdx + 1}.</span>
                                                    <input
                                                        value={editVariantData.title}
                                                        onChange={(e) => setEditVariantData({ ...editVariantData, title: e.target.value })}
                                                        className="flex-1 min-w-0 px-2 py-1 rounded-lg border border-violet-300 dark:border-violet-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-violet-500"
                                                        placeholder="Title"
                                                    />
                                                    <input
                                                        value={editVariantData.duration}
                                                        onChange={(e) => setEditVariantData({ ...editVariantData, duration: e.target.value })}
                                                        className="w-24 px-2 py-1 rounded-lg border border-violet-300 dark:border-violet-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-violet-500"
                                                        placeholder="Duration"
                                                    />
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={editVariantData.price}
                                                        onChange={(e) => setEditVariantData({ ...editVariantData, price: e.target.value })}
                                                        className="w-20 px-2 py-1 rounded-lg border border-violet-300 dark:border-violet-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-violet-500"
                                                        placeholder={currencySymbol}
                                                    />
                                                    <input
                                                        type="number"
                                                        value={editVariantData.warrantyDays}
                                                        onChange={(e) => setEditVariantData({ ...editVariantData, warrantyDays: e.target.value })}
                                                        className="w-16 px-2 py-1 rounded-lg border border-violet-300 dark:border-violet-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-violet-500"
                                                        placeholder="🛡️"
                                                        title="Warranty days"
                                                    />
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <button
                                                            onClick={() => handleSaveVariant(v.id)}
                                                            disabled={loadingAction === `edit-variant-${v.id}`}
                                                            className="p-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition disabled:opacity-50"
                                                            title="Save"
                                                        >
                                                            <Save className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEditVariant}
                                                            className="p-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                                                            title="Cancel"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                /* Display Mode */
                                                <>
                                                    {/* Reorder controls */}
                                                    <div className="flex flex-col gap-0 shrink-0">
                                                        <button
                                                            onClick={() => handleReorderVariant(product.id, v.id, 'up')}
                                                            disabled={vIdx === 0}
                                                            className={`p-0.5 rounded transition ${vIdx === 0 ? 'text-gray-200 dark:text-gray-700 cursor-not-allowed' : 'text-gray-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-500/10'}`}
                                                            title="Move up"
                                                        >
                                                            <ChevronUp className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleReorderVariant(product.id, v.id, 'down')}
                                                            disabled={vIdx === (product.variants?.length || 0) - 1}
                                                            className={`p-0.5 rounded transition ${vIdx === (product.variants?.length || 0) - 1 ? 'text-gray-200 dark:text-gray-700 cursor-not-allowed' : 'text-gray-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-500/10'}`}
                                                            title="Move down"
                                                        >
                                                            <ChevronDown className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                    <GripVertical className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 shrink-0" />
                                                    <span className="text-xs text-gray-400 font-mono w-5 shrink-0">{vIdx + 1}.</span>
                                                    <span className={`${v.outOfStock ? 'text-red-400 line-through' : 'text-gray-700 dark:text-gray-300'} font-medium`}>{v.title}</span>
                                                    <span className="text-gray-300 dark:text-gray-600">·</span>
                                                    <span className="text-xs text-gray-400">{v.duration}</span>
                                                    <span className="text-gray-300 dark:text-gray-600">·</span>
                                                    <span className={`font-semibold ${v.outOfStock ? 'text-red-400 line-through' : 'text-violet-600 dark:text-violet-400'}`}>{v.price} {currencySymbol}</span>
                                                    {v.warrantyDays > 0 && (
                                                        <span className="text-xs text-emerald-500" title={`${v.warrantyDays} days warranty`}>🛡️{v.warrantyDays}d</span>
                                                    )}
                                                    {v.outOfStock && (
                                                        <span className="text-[10px] font-bold text-red-500 uppercase">Out of Stock</span>
                                                    )}
                                                    <div className="ml-auto flex items-center gap-1 shrink-0">
                                                        <button
                                                            onClick={() => handleStartEditVariant(v)}
                                                            className="p-1 rounded text-blue-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition"
                                                            title="Edit variant"
                                                        >
                                                            <Edit className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleVariantOutOfStock(v.id, v.outOfStock)}
                                                            className={`p-1 rounded ${v.outOfStock ? 'text-emerald-500 hover:text-emerald-600' : 'text-amber-400 hover:text-amber-500'}`}
                                                            title={v.outOfStock ? 'Mark In Stock' : 'Mark Out of Stock'}
                                                        >
                                                            <Ban className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteVariant(v.id)}
                                                            className="p-1 text-red-400 hover:text-red-500"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </>
                                            )}
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
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">🛡️ Warranty (days)</label>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                value={variantData.warrantyDays}
                                                onChange={(e) => setVariantData({ ...variantData, warrantyDays: e.target.value })}
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
