'use client';

import { useEffect, useState } from 'react';
import { Gift, Plus, Pencil, Trash2, Save, X, Flame, Eye, EyeOff } from 'lucide-react';
import ProductLogo from '@/components/ProductLogo';
import { adminFetch, adminJsonFetch } from '@/lib/admin-fetch';
import { AdminToast, useAdminToast } from '@/components/admin/AdminToast';
import { AdminDeleteModal } from '@/components/admin/AdminDeleteModal';

const A = {
  bg: '#06070a', surface: '#0f1117', card: '#141928',
  border: 'rgba(255,255,255,0.07)', borderLight: 'rgba(255,255,255,0.12)',
  text: '#E8E8E8', textSec: '#9a9a9a', accent: '#a78bfa', accentSolid: '#7c3aed',
};

interface BundleTool { productName: string; dbImage: string; }

interface Bundle {
  id: string; title: string; titleAr: string; subtitle: string; subtitleAr: string;
  description: string; descriptionAr: string; gradient: string; savings: string; savingsAr: string;
  price: number; originalPrice: number; tools: BundleTool[]; features: string[]; featuresAr: string[];
  isHot: boolean; isActive: boolean; displayOrder: number;
}

const GRADIENTS = [
  { label: 'بنفسجي',  value: 'linear-gradient(135deg, #7c3aed, #a855f7)' },
  { label: 'أزرق',    value: 'linear-gradient(135deg, #0ea5e9, #6366f1)' },
  { label: 'أخضر',    value: 'linear-gradient(135deg, #10b981, #0891b2)' },
  { label: 'ذهبي',    value: 'linear-gradient(135deg, #f59e0b, #ef4444)' },
  { label: 'وردي',    value: 'linear-gradient(135deg, #ec4899, #a855f7)' },
  { label: 'برتقالي', value: 'linear-gradient(135deg, #f97316, #fbbf24)' },
];

const emptyBundle = (): Omit<Bundle, 'id'> => ({
  title: '', titleAr: '', subtitle: '', subtitleAr: '', description: '', descriptionAr: '',
  gradient: GRADIENTS[0].value, savings: 'Save 30%', savingsAr: 'وفّر 30%',
  price: 0, originalPrice: 0, tools: [], features: ['', '', '', ''], featuresAr: ['', '', '', ''],
  isHot: false, isActive: true, displayOrder: 0,
});

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyBundle());
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Bundle | null>(null);
  const [newToolName, setNewToolName] = useState('');
  const [newToolImg, setNewToolImg] = useState('');
  const { toast, showToast, closeToast } = useAdminToast();

  useEffect(() => { loadBundles(); }, []);

  async function loadBundles() {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/bundles');
      const data = await res.json();
      setBundles(Array.isArray(data) ? data : []);
    } catch {
      showToast('error', 'Failed to load bundles');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() { setEditId(null); setForm(emptyBundle()); setShowForm(true); }

  function openEdit(b: Bundle) {
    setEditId(b.id);
    setForm({
      title: b.title, titleAr: b.titleAr, subtitle: b.subtitle, subtitleAr: b.subtitleAr,
      description: b.description, descriptionAr: b.descriptionAr, gradient: b.gradient,
      savings: b.savings, savingsAr: b.savingsAr, price: b.price, originalPrice: b.originalPrice,
      tools: b.tools, features: b.features.length ? b.features : ['', '', '', ''],
      featuresAr: b.featuresAr.length ? b.featuresAr : ['', '', '', ''],
      isHot: b.isHot, isActive: b.isActive, displayOrder: b.displayOrder,
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.title.trim()) { showToast('error', 'Title is required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, features: form.features.filter(Boolean), featuresAr: form.featuresAr.filter(Boolean) };
      const res = editId
        ? await adminJsonFetch(`/api/admin/bundles/${editId}`, { method: 'PUT', body: JSON.stringify(payload) })
        : await adminJsonFetch('/api/admin/bundles', { method: 'POST', body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Failed');
      showToast('success', editId ? 'Bundle updated' : 'Bundle created');
      setShowForm(false);
      loadBundles();
    } catch {
      showToast('error', 'Failed to save bundle');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const prev = [...bundles];
    setBundles(b => b.filter(x => x.id !== deleteTarget.id));
    setDeleteTarget(null);
    try {
      const res = await adminFetch(`/api/admin/bundles/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      showToast('success', 'Bundle deleted');
    } catch {
      setBundles(prev);
      showToast('error', 'Failed to delete bundle');
    }
  }

  async function toggleActive(b: Bundle) {
    setBundles(prev => prev.map(x => x.id === b.id ? { ...x, isActive: !b.isActive } : x));
    try {
      const res = await adminJsonFetch(`/api/admin/bundles/${b.id}`, { method: 'PUT', body: JSON.stringify({ ...b, isActive: !b.isActive }) });
      if (!res.ok) throw new Error('Failed');
      showToast('success', b.isActive ? 'Bundle hidden' : 'Bundle activated');
    } catch {
      setBundles(prev => prev.map(x => x.id === b.id ? { ...x, isActive: b.isActive } : x));
      showToast('error', 'Failed to update bundle');
    }
  }

  function addTool() {
    if (!newToolName.trim()) return;
    setForm((f) => ({ ...f, tools: [...f.tools, { productName: newToolName.trim(), dbImage: newToolImg.trim() }] }));
    setNewToolName(''); setNewToolImg('');
  }

  function removeTool(i: number) { setForm((f) => ({ ...f, tools: f.tools.filter((_, idx) => idx !== i) })); }

  const inp: React.CSSProperties = {
    width: '100%', padding: '0.55rem 0.85rem', background: A.surface, border: `1px solid ${A.border}`,
    borderRadius: 10, color: A.text, fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.72rem', fontWeight: 700, color: A.textSec,
    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem', display: 'block',
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <AdminToast toast={toast} onClose={closeToast} />

      {deleteTarget && (
        <AdminDeleteModal
          title="Delete Bundle"
          message={`Delete "${deleteTarget.titleAr || deleteTarget.title}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: A.text, letterSpacing: '-0.02em' }}>Bundles</h1>
          <p style={{ color: A.textSec, fontSize: '0.82rem', marginTop: '0.2rem' }}>إدارة باندلات الاشتراكات المميزة</p>
        </div>
        <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #7c3aed, #6366f1)', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 16px rgba(124,58,237,0.4)' }}>
          <Plus style={{ width: 16, height: 16 }} /> إضافة باندل
        </button>
      </div>

      {/* Bundles Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {[1, 2, 3, 4].map((i) => <div key={i} style={{ background: A.card, borderRadius: 16, height: 260, border: `1px solid ${A.border}` }} className="skeleton" />)}
        </div>
      ) : bundles.length === 0 ? (
        <div className="admin-empty">
          <div className="admin-empty-icon"><Gift style={{ width: 24, height: 24 }} /></div>
          <p style={{ color: A.textSec }}>لا توجد باندلات — أضف أول باندل</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 16 }}>
          {bundles.map((bundle) => (
            <div key={bundle.id} style={{ background: A.card, border: `1px solid ${bundle.isActive ? A.border : 'rgba(255,255,255,0.03)'}`, borderRadius: 18, overflow: 'hidden', opacity: bundle.isActive ? 1 : 0.5, display: 'flex', flexDirection: 'column' }}>
              {/* Gradient header */}
              <div style={{ background: bundle.gradient, padding: '1rem 1.25rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%)', pointerEvents: 'none' }} />
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'white', margin: 0 }}>{bundle.titleAr || bundle.title}</h3>
                    <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', margin: '0.2rem 0 0', fontWeight: 500 }}>{bundle.subtitleAr || bundle.subtitle}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
                    {bundle.isHot && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 999, padding: '0.15rem 0.5rem' }}>
                        <Flame style={{ width: 9, height: 9, color: '#fde68a' }} />
                        <span style={{ fontSize: '0.6rem', color: 'white', fontWeight: 800 }}>HOT</span>
                      </span>
                    )}
                    <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.15)', color: 'white', borderRadius: 6, padding: '0.12rem 0.4rem', fontWeight: 700 }}>
                      {bundle.savingsAr || bundle.savings}
                    </span>
                  </div>
                </div>
                <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white' }}>{bundle.price}</span>
                  {bundle.originalPrice > 0 && (
                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', textDecoration: 'line-through' }}>{bundle.originalPrice}</span>
                  )}
                </div>
              </div>

              {/* Tools row */}
              {bundle.tools.length > 0 && (
                <div style={{ padding: '0.75rem 1.25rem', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {bundle.tools.map((t, i) => (
                    <div key={i} style={{ width: 28, height: 28, borderRadius: 8, background: '#fff', overflow: 'hidden', flexShrink: 0 }} title={t.productName}>
                      <ProductLogo productName={t.productName} dbImage={t.dbImage} size={28} bg="white" />
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div style={{ marginTop: 'auto', padding: '0.75rem 1.25rem', borderTop: `1px solid ${A.border}`, display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => openEdit(bundle)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0.5rem', borderRadius: 10, border: `1px solid ${A.border}`, background: 'rgba(255,255,255,0.04)', color: A.accent, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  <Pencil style={{ width: 13, height: 13 }} /> تعديل
                </button>
                <button onClick={() => toggleActive(bundle)} style={{ padding: '0.5rem 0.75rem', borderRadius: 10, border: `1px solid ${A.border}`, background: 'rgba(255,255,255,0.04)', color: bundle.isActive ? '#10b981' : '#666', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title={bundle.isActive ? 'Hide' : 'Show'}>
                  {bundle.isActive ? <Eye style={{ width: 14, height: 14 }} /> : <EyeOff style={{ width: 14, height: 14 }} />}
                </button>
                <button onClick={() => setDeleteTarget(bundle)} style={{ padding: '0.5rem 0.75rem', borderRadius: 10, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.08)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Delete">
                  <Trash2 style={{ width: 14, height: 14 }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Drawer */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }} onClick={() => setShowForm(false)} />
          <div style={{ width: '100%', maxWidth: 560, background: A.surface, borderLeft: `1px solid ${A.borderLight}`, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {/* Drawer header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${A.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: A.surface, zIndex: 1 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: A.text, margin: 0 }}>{editId ? 'تعديل الباندل' : 'باندل جديد'}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', display: 'flex', padding: 4 }}><X style={{ width: 20, height: 20 }} /></button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
              {/* Gradient picker */}
              <div>
                <label style={labelStyle}>Gradient</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {GRADIENTS.map((g) => (
                    <button key={g.value} type="button" onClick={() => setForm(f => ({ ...f, gradient: g.value }))} style={{ width: 40, height: 40, borderRadius: 10, background: g.value, border: form.gradient === g.value ? '3px solid white' : '3px solid transparent', cursor: 'pointer', boxShadow: form.gradient === g.value ? '0 0 0 2px #7c3aed' : 'none' }} title={g.label} />
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                <div><label style={labelStyle}>Title (EN)</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inp} placeholder="Premium Bundle" /></div>
                <div><label style={labelStyle}>Title (AR)</label><input value={form.titleAr} onChange={e => setForm(f => ({ ...f, titleAr: e.target.value }))} style={{ ...inp, direction: 'rtl' }} placeholder="باندل مميز" /></div>
                <div><label style={labelStyle}>Subtitle (EN)</label><input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} style={inp} placeholder="Best value deal" /></div>
                <div><label style={labelStyle}>Subtitle (AR)</label><input value={form.subtitleAr} onChange={e => setForm(f => ({ ...f, subtitleAr: e.target.value }))} style={{ ...inp, direction: 'rtl' }} placeholder="أفضل قيمة" /></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                <div><label style={labelStyle}>Savings (EN)</label><input value={form.savings} onChange={e => setForm(f => ({ ...f, savings: e.target.value }))} style={inp} /></div>
                <div><label style={labelStyle}>Savings (AR)</label><input value={form.savingsAr} onChange={e => setForm(f => ({ ...f, savingsAr: e.target.value }))} style={{ ...inp, direction: 'rtl' }} /></div>
                <div><label style={labelStyle}>Price</label><input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))} style={inp} /></div>
                <div><label style={labelStyle}>Original Price</label><input type="number" step="0.01" value={form.originalPrice} onChange={e => setForm(f => ({ ...f, originalPrice: parseFloat(e.target.value) || 0 }))} style={inp} /></div>
              </div>

              <div><label style={labelStyle}>Description (EN)</label><textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ ...inp, resize: 'none' }} /></div>
              <div><label style={labelStyle}>Description (AR)</label><textarea rows={2} value={form.descriptionAr} onChange={e => setForm(f => ({ ...f, descriptionAr: e.target.value }))} style={{ ...inp, resize: 'none', direction: 'rtl' }} /></div>

              {/* Features */}
              <div>
                <label style={labelStyle}>Features (EN) — one per line</label>
                {form.features.map((f, i) => (
                  <input key={i} value={f} onChange={e => setForm(prev => { const arr = [...prev.features]; arr[i] = e.target.value; return { ...prev, features: arr }; })} style={{ ...inp, marginBottom: 6 }} placeholder={`Feature ${i + 1}`} />
                ))}
              </div>
              <div>
                <label style={labelStyle}>Features (AR)</label>
                {form.featuresAr.map((f, i) => (
                  <input key={i} value={f} onChange={e => setForm(prev => { const arr = [...prev.featuresAr]; arr[i] = e.target.value; return { ...prev, featuresAr: arr }; })} style={{ ...inp, marginBottom: 6, direction: 'rtl' }} placeholder={`ميزة ${i + 1}`} />
                ))}
              </div>

              {/* Tools */}
              <div>
                <label style={labelStyle}>Products / Tools</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '0.5rem' }}>
                  {form.tools.map((t, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.2rem 0.5rem 0.2rem 0.2rem', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: `1px solid ${A.border}` }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: '#fff', overflow: 'hidden', flexShrink: 0 }}><ProductLogo productName={t.productName} dbImage={t.dbImage} size={22} bg="white" /></div>
                      <span style={{ fontSize: '0.72rem', color: A.textSec }}>{t.productName}</span>
                      <button type="button" onClick={() => removeTool(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', padding: 0, display: 'flex', marginLeft: 2 }}><X style={{ width: 12, height: 12 }} /></button>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input value={newToolName} onChange={e => setNewToolName(e.target.value)} style={{ ...inp, flex: 1 }} placeholder="Product name" onKeyDown={e => e.key === 'Enter' && addTool()} />
                  <input value={newToolImg} onChange={e => setNewToolImg(e.target.value)} style={{ ...inp, flex: 1 }} placeholder="Image URL (optional)" />
                  <button type="button" onClick={addTool} style={{ padding: '0.5rem 0.875rem', borderRadius: 10, border: 'none', background: A.accentSolid, color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>Add</button>
                </div>
              </div>

              {/* Toggles */}
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                {[{ key: 'isHot', label: '🔥 Hot Badge' }, { key: 'isActive', label: '✅ Active' }].map(({ key, label }) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem', color: A.textSec }}>
                    <input type="checkbox" checked={form[key as keyof typeof form] as boolean} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))} style={{ width: 16, height: 16, accentColor: '#7c3aed', cursor: 'pointer' }} />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: `1px solid ${A.border}`, display: 'flex', gap: '0.75rem', position: 'sticky', bottom: 0, background: A.surface }}>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: 12, border: `1px solid ${A.border}`, background: 'rgba(255,255,255,0.04)', color: A.textSec, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '0.75rem', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #7c3aed, #6366f1)', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {saving ? <div className="admin-loader" style={{ width: 16, height: 16, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> : <Save style={{ width: 15, height: 15 }} />}
                {editId ? 'Update Bundle' : 'Create Bundle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
