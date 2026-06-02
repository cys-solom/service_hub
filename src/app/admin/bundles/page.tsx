'use client';

import { useEffect, useState } from 'react';
import {
  Gift, Plus, Pencil, Trash2, Save, X, Flame,
  Eye, EyeOff,
} from 'lucide-react';
import ProductLogo from '@/components/ProductLogo';
import { adminFetch, adminJsonFetch } from '@/lib/admin-fetch';


const A = {
  bg: '#06070a', surface: '#0f1117', card: '#141928',
  border: 'rgba(255,255,255,0.07)', borderLight: 'rgba(255,255,255,0.12)',
  text: '#E8E8E8', textSec: '#9a9a9a', accent: '#a78bfa', accentSolid: '#7c3aed',  /* textSec: was #686868 */
};

interface BundleTool {
  productName: string;
  dbImage: string;
}

interface Bundle {
  id: string;
  title: string;
  titleAr: string;
  subtitle: string;
  subtitleAr: string;
  description: string;
  descriptionAr: string;
  gradient: string;
  savings: string;
  savingsAr: string;
  price: number;
  originalPrice: number;
  tools: BundleTool[];
  features: string[];
  featuresAr: string[];
  isHot: boolean;
  isActive: boolean;
  displayOrder: number;
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
  title: '', titleAr: '',
  subtitle: '', subtitleAr: '',
  description: '', descriptionAr: '',
  gradient: GRADIENTS[0].value,
  savings: 'Save 30%', savingsAr: 'وفّر 30%',
  price: 0, originalPrice: 0,
  tools: [],
  features: ['', '', '', ''],
  featuresAr: ['', '', '', ''],
  isHot: false, isActive: true, displayOrder: 0,
});


export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyBundle());
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [newToolName, setNewToolName] = useState('');
  const [newToolImg, setNewToolImg] = useState('');

  useEffect(() => { loadBundles(); }, []);

  async function loadBundles() {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/bundles');
      const data = await res.json();
      setBundles(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditId(null);
    setForm(emptyBundle());
    setShowForm(true);
  }

  function openEdit(b: Bundle) {
    setEditId(b.id);
    setForm({
      title: b.title, titleAr: b.titleAr,
      subtitle: b.subtitle, subtitleAr: b.subtitleAr,
      description: b.description, descriptionAr: b.descriptionAr,
      gradient: b.gradient,
      savings: b.savings, savingsAr: b.savingsAr,
      price: b.price, originalPrice: b.originalPrice,
      tools: b.tools,
      features: b.features.length ? b.features : ['', '', '', ''],
      featuresAr: b.featuresAr.length ? b.featuresAr : ['', '', '', ''],
      isHot: b.isHot, isActive: b.isActive, displayOrder: b.displayOrder,
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        features:   form.features.filter(Boolean),
        featuresAr: form.featuresAr.filter(Boolean),
      };
      if (editId) {
        await adminJsonFetch(`/api/admin/bundles/${editId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await adminJsonFetch('/api/admin/bundles', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setShowForm(false);
      loadBundles();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await adminFetch(`/api/admin/bundles/${id}`, { method: 'DELETE' });
    setDeleteConfirm(null);
    loadBundles();
  }

  async function toggleActive(b: Bundle) {
    await adminJsonFetch(`/api/admin/bundles/${b.id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...b, isActive: !b.isActive }),
    });
    loadBundles();
  }

  function addTool() {
    if (!newToolName.trim()) return;
    setForm((f) => ({
      ...f,
      tools: [...f.tools, { productName: newToolName.trim(), dbImage: newToolImg.trim() }],
    }));
    setNewToolName('');
    setNewToolImg('');
  }

  function removeTool(i: number) {
    setForm((f) => ({ ...f, tools: f.tools.filter((_, idx) => idx !== i) }));
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '0.55rem 0.85rem',
    background: A.surface, border: `1px solid ${A.border}`,
    borderRadius: 10, color: A.text, fontSize: '0.85rem',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.72rem', fontWeight: 700, color: A.textSec,
    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem', display: 'block',
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: A.text, letterSpacing: '-0.02em' }}>
            Bundles
          </h1>
          <p style={{ color: A.textSec, fontSize: '0.82rem', marginTop: '0.2rem' }}>
            إدارة باندلات الاشتراكات المميزة
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.6rem 1.25rem', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
            color: 'white', fontWeight: 700, fontSize: '0.85rem',
            cursor: 'pointer', boxShadow: '0 4px 16px rgba(124,58,237,0.4)',
          }}
        >
          <Plus style={{ width: 16, height: 16 }} />
          إضافة باندل
        </button>
      </div>

      {/* Bundles Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ background: A.card, borderRadius: 16, height: 260, border: `1px solid ${A.border}` }} className="skeleton" />
          ))}
        </div>
      ) : bundles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: A.textSec }}>
          <Gift style={{ width: 48, height: 48, margin: '0 auto 1rem', opacity: 0.3 }} />
          <p>لا توجد باندلات بعد — أضف أول باندل</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 16 }}>
          {bundles.map((bundle) => (
            <div
              key={bundle.id}
              style={{
                background: A.card,
                border: `1px solid ${bundle.isActive ? A.border : 'rgba(255,255,255,0.03)'}`,
                borderRadius: 18,
                overflow: 'hidden',
                opacity: bundle.isActive ? 1 : 0.5,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Gradient header preview */}
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
                    <span style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 999, padding: '0.15rem 0.55rem', fontSize: '0.7rem', color: '#fde68a', fontWeight: 800 }}>
                      {bundle.savingsAr || bundle.savings}
                    </span>
                  </div>
                </div>

                {/* Tool logos */}
                <div style={{ display: 'flex', gap: 6, marginTop: '0.75rem' }}>
                  {bundle.tools.slice(0, 4).map((tool, ti) => (
                    <div key={ti} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.95)', border: '2px solid rgba(255,255,255,0.4)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                      <ProductLogo productName={tool.productName} dbImage={tool.dbImage} size={32} bg="transparent" />
                    </div>
                  ))}
                  {bundle.tools.length > 4 && (
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '0.6rem', color: 'white', fontWeight: 700 }}>+{bundle.tools.length - 4}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '1rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {bundle.price > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: A.accent }}>{bundle.price} ج.م</span>
                    {bundle.originalPrice > 0 && (
                      <span style={{ fontSize: '0.8rem', color: A.textSec, textDecoration: 'line-through' }}>{bundle.originalPrice}</span>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  <button
                    onClick={() => openEdit(bundle)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.5rem', borderRadius: 9, border: `1px solid ${A.border}`, background: 'rgba(167,139,250,0.08)', color: A.accent, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
                  >
                    <Pencil style={{ width: 13, height: 13 }} />
                    تعديل
                  </button>
                  <button
                    onClick={() => toggleActive(bundle)}
                    style={{ padding: '0.5rem 0.75rem', borderRadius: 9, border: `1px solid ${A.border}`, background: 'rgba(255,255,255,0.04)', color: bundle.isActive ? '#10b981' : A.textSec, cursor: 'pointer' }}
                    title={bundle.isActive ? 'إيقاف' : 'تفعيل'}
                  >
                    {bundle.isActive ? <Eye style={{ width: 14, height: 14 }} /> : <EyeOff style={{ width: 14, height: 14 }} />}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(bundle.id)}
                    style={{ padding: '0.5rem 0.75rem', borderRadius: 9, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', color: '#f87171', cursor: 'pointer' }}
                    title="حذف"
                  >
                    <Trash2 style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 18, padding: '2rem', maxWidth: 380, width: '100%', textAlign: 'center' }}>
            <Trash2 style={{ width: 36, height: 36, color: '#f87171', margin: '0 auto 1rem' }} />
            <h3 style={{ color: A.text, fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>حذف الباندل؟</h3>
            <p style={{ color: A.textSec, fontSize: '0.85rem', marginBottom: '1.5rem' }}>هذا الإجراء لا يمكن التراجع عنه</p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: '0.65rem', borderRadius: 10, border: `1px solid ${A.border}`, background: 'transparent', color: A.textSec, cursor: 'pointer', fontFamily: 'inherit' }}>إلغاء</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ flex: 1, padding: '0.65rem', borderRadius: 10, border: 'none', background: 'rgba(239,68,68,0.15)', color: '#f87171', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>حذف</button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 50, overflowY: 'auto', padding: '1rem' }}>
          <div style={{ maxWidth: 680, margin: '2rem auto', background: A.surface, border: `1px solid ${A.border}`, borderRadius: 20, overflow: 'hidden' }}>

            {/* Modal header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${A.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: A.text, margin: 0 }}>
                {editId ? 'تعديل الباندل' : 'إضافة باندل جديد'}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ padding: '0.4rem', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.05)', color: A.textSec, cursor: 'pointer' }}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            {/* Form body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Title row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>اسم الباندل (EN)</label>
                  <input style={inp} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Creator Bundle" />
                </div>
                <div>
                  <label style={labelStyle}>اسم الباندل (AR)</label>
                  <input style={{ ...inp, textAlign: 'right', direction: 'rtl' }} value={form.titleAr} onChange={(e) => setForm((f) => ({ ...f, titleAr: e.target.value }))} placeholder="باندل المبدع" />
                </div>
              </div>

              {/* Subtitle row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>الوصف القصير (EN)</label>
                  <input style={inp} value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="Content · Design · Voice" />
                </div>
                <div>
                  <label style={labelStyle}>الوصف القصير (AR)</label>
                  <input style={{ ...inp, textAlign: 'right', direction: 'rtl' }} value={form.subtitleAr} onChange={(e) => setForm((f) => ({ ...f, subtitleAr: e.target.value }))} placeholder="للمحتوى والتصميم والصوت" />
                </div>
              </div>

              {/* Savings + Price row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>نسبة الخصم (EN)</label>
                  <input style={inp} value={form.savings} onChange={(e) => setForm((f) => ({ ...f, savings: e.target.value }))} placeholder="Save 30%" />
                </div>
                <div>
                  <label style={labelStyle}>نسبة الخصم (AR)</label>
                  <input style={{ ...inp, direction: 'rtl' }} value={form.savingsAr} onChange={(e) => setForm((f) => ({ ...f, savingsAr: e.target.value }))} placeholder="وفّر 30%" />
                </div>
                <div>
                  <label style={labelStyle}>السعر (ج.م)</label>
                  <input style={inp} type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} placeholder="0" />
                </div>
                <div>
                  <label style={labelStyle}>السعر الأصلي</label>
                  <input style={inp} type="number" value={form.originalPrice} onChange={(e) => setForm((f) => ({ ...f, originalPrice: Number(e.target.value) }))} placeholder="0" />
                </div>
              </div>

              {/* Gradient picker */}
              <div>
                <label style={labelStyle}>لون التدرج</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {GRADIENTS.map((g) => (
                    <button
                      key={g.value}
                      onClick={() => setForm((f) => ({ ...f, gradient: g.value }))}
                      style={{
                        width: 36, height: 36, borderRadius: '50%', border: form.gradient === g.value ? '3px solid white' : '2px solid rgba(255,255,255,0.15)',
                        background: g.value, cursor: 'pointer', flexShrink: 0,
                        boxShadow: form.gradient === g.value ? '0 0 0 2px #7c3aed' : 'none',
                      }}
                      title={g.label}
                    />
                  ))}
                  {/* Custom gradient input */}
                  <input
                    style={{ ...inp, flex: 1, minWidth: 200 }}
                    value={form.gradient}
                    onChange={(e) => setForm((f) => ({ ...f, gradient: e.target.value }))}
                    placeholder="linear-gradient(135deg, ...)"
                  />
                </div>
              </div>

              {/* Tools */}
              <div>
                <label style={labelStyle}>الأدوات</label>
                {form.tools.map((tool, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', background: A.card, borderRadius: 10, padding: '0.5rem 0.75rem', border: `1px solid ${A.border}` }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'white', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <ProductLogo productName={tool.productName} dbImage={tool.dbImage} size={28} bg="transparent" />
                    </div>
                    <span style={{ flex: 1, fontSize: '0.82rem', color: A.text }}>{tool.productName}</span>
                    <span style={{ fontSize: '0.72rem', color: A.textSec, flex: 1 }}>{tool.dbImage}</span>
                    <button onClick={() => removeTool(i)} style={{ border: 'none', background: 'none', color: '#f87171', cursor: 'pointer', padding: '0.25rem' }}>
                      <X style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                ))}
                {/* Add tool */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input style={inp} value={newToolName} onChange={(e) => setNewToolName(e.target.value)} placeholder="اسم البرنامج (مثال: Canva Pro)" onKeyDown={(e) => e.key === 'Enter' && addTool()} />
                  <input style={inp} value={newToolImg} onChange={(e) => setNewToolImg(e.target.value)} placeholder="مسار اللوجو (مثال: /logos/canva.png)" onKeyDown={(e) => e.key === 'Enter' && addTool()} />
                  <button onClick={addTool} style={{ padding: '0.55rem 0.85rem', borderRadius: 10, border: 'none', background: 'rgba(167,139,250,0.15)', color: A.accent, cursor: 'pointer', fontWeight: 700 }}>+</button>
                </div>
              </div>

              {/* Features EN */}
              <div>
                <label style={labelStyle}>المميزات (EN)</label>
                {form.features.map((feat, i) => (
                  <input key={i} style={{ ...inp, marginBottom: '0.4rem' }} value={feat} onChange={(e) => { const arr = [...form.features]; arr[i] = e.target.value; setForm((f) => ({ ...f, features: arr })); }} placeholder={`Feature ${i + 1}`} />
                ))}
                <button onClick={() => setForm((f) => ({ ...f, features: [...f.features, ''] }))} style={{ fontSize: '0.75rem', color: A.accent, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>+ إضافة ميزة</button>
              </div>

              {/* Features AR */}
              <div>
                <label style={labelStyle}>المميزات (AR)</label>
                {form.featuresAr.map((feat, i) => (
                  <input key={i} style={{ ...inp, marginBottom: '0.4rem', direction: 'rtl', textAlign: 'right' }} value={feat} onChange={(e) => { const arr = [...form.featuresAr]; arr[i] = e.target.value; setForm((f) => ({ ...f, featuresAr: arr })); }} placeholder={`الميزة ${i + 1}`} />
                ))}
                <button onClick={() => setForm((f) => ({ ...f, featuresAr: [...f.featuresAr, ''] }))} style={{ fontSize: '0.75rem', color: A.accent, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>+ إضافة ميزة</button>
              </div>

              {/* Toggles row */}
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                {[
                  { label: 'مميز 🔥 HOT', key: 'isHot' as const },
                  { label: 'مفعّل',        key: 'isActive' as const },
                ].map(({ label, key }) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: A.textSec, fontSize: '0.85rem', userSelect: 'none' }}>
                    <div
                      onClick={() => setForm((f) => ({ ...f, [key]: !f[key] }))}
                      style={{
                        width: 40, height: 22, borderRadius: 99,
                        background: form[key] ? '#7c3aed' : 'rgba(255,255,255,0.1)',
                        position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
                      }}
                    >
                      <div style={{ position: 'absolute', top: 3, left: form[key] ? 20 : 3, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
                    </div>
                    {label}
                  </label>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{ ...labelStyle, margin: 0 }}>ترتيب العرض</label>
                  <input style={{ ...inp, width: 70 }} type="number" value={form.displayOrder} onChange={(e) => setForm((f) => ({ ...f, displayOrder: Number(e.target.value) }))} />
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: `1px solid ${A.border}`, display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={{ padding: '0.6rem 1.25rem', borderRadius: 10, border: `1px solid ${A.border}`, background: 'transparent', color: A.textSec, cursor: 'pointer', fontFamily: 'inherit' }}>
                إلغاء
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title.trim()}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.6rem 1.5rem', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                  color: 'white', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1, fontFamily: 'inherit',
                }}
              >
                <Save style={{ width: 15, height: 15 }} />
                {saving ? 'جاري الحفظ...' : 'حفظ الباندل'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
