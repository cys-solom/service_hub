'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, X, Save, FolderOpen } from 'lucide-react';

interface CategoryData {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
}

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<CategoryData | null>(null);
    const [formData, setFormData] = useState({ name: '', slug: '', isActive: true });

    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();
            setCategories(Array.isArray(data) ? data : []);
        } catch {
            console.error('Failed to fetch categories');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCategories();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editing ? `/api/categories/${editing.id}` : '/api/categories';
        const method = editing ? 'PUT' : 'POST';

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(formData),
        });

        setShowForm(false);
        setEditing(null);
        setFormData({ name: '', slug: '', isActive: true });
        fetchCategories();
    };

    const handleEdit = (cat: CategoryData) => {
        setEditing(cat);
        setFormData({ name: cat.name, slug: cat.slug, isActive: cat.isActive });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this category? Products in this category will be affected.')) return;
        // Optimistic update
        const previousCategories = [...categories];
        setCategories(prev => prev.filter(c => c.id !== id));
        try {
            const res = await fetch(`/api/categories/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Failed');
        } catch {
            setCategories(previousCategories);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Categories</h2>
                <button
                    onClick={() => {
                        setEditing(null);
                        setFormData({ name: '', slug: '', isActive: true });
                        setShowForm(true);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-medium flex items-center gap-2 text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add Category
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                {editing ? 'Edit Category' : 'New Category'}
                            </h3>
                            <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                                <input
                                    value={formData.name}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        name: e.target.value,
                                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                                    })}
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
                                {editing ? 'Update' : 'Create'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                            <div className="skeleton h-5 w-40" />
                        </div>
                    ))}
                </div>
            ) : categories.length === 0 ? (
                <div className="text-center py-20 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
                    <FolderOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No categories yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {categories.map((cat) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center justify-between rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-5"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center">
                                    <FolderOpen className="w-5 h-5 text-violet-500" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white">{cat.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">/{cat.slug}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleEdit(cat)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                                    <Edit className="w-4 h-4 text-blue-500" />
                                </button>
                                <button onClick={() => handleDelete(cat.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition">
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
