'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, Save, FolderOpen } from 'lucide-react';
import { adminFetch, adminJsonFetch } from '@/lib/admin-fetch';
import { AdminToast, useAdminToast } from '@/components/admin/AdminToast';
import { AdminDeleteModal } from '@/components/admin/AdminDeleteModal';

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
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<CategoryData | null>(null);
    const [formData, setFormData] = useState({ name: '', slug: '', isActive: true });
    const { toast, showToast, closeToast } = useAdminToast();

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();
            setCategories(Array.isArray(data) ? data : []);
        } catch {
            showToast('error', 'Failed to load categories');
        }
        setLoading(false);
    };

    useEffect(() => { fetchCategories(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = editing ? `/api/categories/${editing.id}` : '/api/categories';
            const method = editing ? 'PUT' : 'POST';
            const res = await adminJsonFetch(url, { method, body: JSON.stringify(formData) });
            if (!res.ok) throw new Error('Failed');
            showToast('success', editing ? 'Category updated' : 'Category created');
            setShowForm(false);
            setEditing(null);
            setFormData({ name: '', slug: '', isActive: true });
            fetchCategories();
        } catch {
            showToast('error', 'Failed to save category');
        }
        setSaving(false);
    };

    const handleEdit = (cat: CategoryData) => {
        setEditing(cat);
        setFormData({ name: cat.name, slug: cat.slug, isActive: cat.isActive });
        setShowForm(true);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const prev = [...categories];
        setCategories(p => p.filter(c => c.id !== deleteTarget.id));
        setDeleteTarget(null);
        try {
            const res = await adminFetch(`/api/categories/${deleteTarget.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed');
            showToast('success', 'Category deleted');
        } catch {
            setCategories(prev);
            showToast('error', 'Failed to delete category');
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '0.65rem 0.875rem', borderRadius: 10,
        border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)',
        color: '#E8E8E8', fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none',
        transition: 'border-color 0.15s',
    };

    return (
        <div className="space-y-6">
            <AdminToast toast={toast} onClose={closeToast} />

            {deleteTarget && (
                <AdminDeleteModal
                    title="Delete Category"
                    message={`Delete "${deleteTarget.name}"? Products in this category will be affected.`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#E8E8E8', letterSpacing: '-0.02em' }}>Categories</h2>
                    <p style={{ fontSize: '0.78rem', color: '#7a7a7a', marginTop: 2 }}>{categories.length} total</p>
                </div>
                <button
                    onClick={() => { setEditing(null); setFormData({ name: '', slug: '', isActive: true }); setShowForm(true); }}
                    className="adm-btn adm-btn--primary"
                    style={{ gap: '0.5rem' }}
                >
                    <Plus style={{ width: 15, height: 15 }} />
                    Add Category
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: '#141928', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '1.5rem', width: '100%', maxWidth: 440 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                            <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#E8E8E8', margin: 0 }}>
                                {editing ? 'Edit Category' : 'New Category'}
                            </h3>
                            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: 4, display: 'flex' }}>
                                <X style={{ width: 18, height: 18 }} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                            <div>
                                <label className="adm-label">Name</label>
                                <input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })}
                                    style={inputStyle}
                                    placeholder="e.g. Streaming"
                                    required
                                />
                            </div>
                            <div>
                                <label className="adm-label">Slug</label>
                                <input
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.82rem' }}
                                    placeholder="e.g. streaming"
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    id="cat-active"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    style={{ width: 16, height: 16, accentColor: '#7c3aed', cursor: 'pointer' }}
                                />
                                <label htmlFor="cat-active" style={{ fontSize: '0.85rem', color: '#9a9a9a', cursor: 'pointer' }}>Active</label>
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="adm-btn adm-btn--primary"
                                style={{ width: '100%', marginTop: '0.25rem', opacity: saving ? 0.6 : 1 }}
                            >
                                {saving ? <div className="admin-loader" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <Save style={{ width: 15, height: 15 }} />}
                                {editing ? 'Update' : 'Create'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* List */}
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="adm-card sk" style={{ height: 68 }} />
                    ))}
                </div>
            ) : categories.length === 0 ? (
                <div className="admin-empty">
                    <div className="admin-empty-icon"><FolderOpen style={{ width: 24, height: 24 }} /></div>
                    <p style={{ color: '#7a7a7a', fontSize: '0.9rem' }}>No categories yet</p>
                    <p style={{ color: '#555', fontSize: '0.78rem', marginTop: 4 }}>Create your first category to organise products</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {categories.map((cat) => (
                        <div key={cat.id} className="adm-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1.25rem' }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(124,58,237,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <FolderOpen style={{ width: 18, height: 18, color: '#a78bfa' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontWeight: 600, color: '#E8E8E8', fontSize: '0.9rem' }}>{cat.name}</span>
                                    {!cat.isActive && (
                                        <span className="adm-badge adm-badge--gray">Inactive</span>
                                    )}
                                </div>
                                <span style={{ fontSize: '0.75rem', color: '#555', fontFamily: 'monospace' }}>/{cat.slug}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.375rem' }}>
                                <button
                                    onClick={() => handleEdit(cat)}
                                    style={{ padding: '0.5rem', borderRadius: 8, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer', display: 'flex', color: '#818cf8' }}
                                    title="Edit"
                                >
                                    <Edit style={{ width: 14, height: 14 }} />
                                </button>
                                <button
                                    onClick={() => setDeleteTarget(cat)}
                                    style={{ padding: '0.5rem', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', display: 'flex', color: '#f87171' }}
                                    title="Delete"
                                >
                                    <Trash2 style={{ width: 14, height: 14 }} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
