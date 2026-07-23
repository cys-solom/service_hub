'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, Copy, Check, ChevronDown, Trash2, MessageCircle, Phone, Search, X, Download } from 'lucide-react';
import { buildWhatsAppMessage, generateWhatsAppUrl } from '@/lib/whatsapp';
import { useSettings } from '@/lib/settings-context';
import { adminFetch, adminJsonFetch } from '@/lib/admin-fetch';
import { AdminToast, useAdminToast } from '@/components/admin/AdminToast';
import { AdminDeleteModal } from '@/components/admin/AdminDeleteModal';

interface OrderData {
    id: string;
    orderCode: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    items: string;
    totalPrice: number;
    status: string;
    notes?: string;
    createdAt: string;
}

const statusOptions = ['New', 'SentToWhatsApp', 'InProgress', 'Completed', 'Cancelled'];

const statusColors: Record<string, string> = {
    New:            'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
    SentToWhatsApp: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
    InProgress:     'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    Completed:      'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
    Cancelled:      'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
};

const quickBtnStyle: Record<string, string> = {
    New:            'border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10',
    SentToWhatsApp: 'border-green-300 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10',
    InProgress:     'border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10',
    Completed:      'border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10',
    Cancelled:      'border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10',
};

export default function AdminOrdersPage() {
    const [orders, setOrders]                   = useState<OrderData[]>([]);
    const [loading, setLoading]                 = useState(true);

    const stats = (() => {
        const now   = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const week  = new Date(today); week.setDate(today.getDate() - 7);
        const month = new Date(now.getFullYear(), now.getMonth(), 1);
        const completed = orders.filter(o => o.status !== 'Cancelled');
        const sum = (arr: OrderData[]) => arr.reduce((s, o) => s + o.totalPrice, 0);
        return {
            todayRev:  sum(completed.filter(o => new Date(o.createdAt) >= today)),
            weekRev:   sum(completed.filter(o => new Date(o.createdAt) >= week)),
            monthRev:  sum(completed.filter(o => new Date(o.createdAt) >= month)),
            todayCount:  completed.filter(o => new Date(o.createdAt) >= today).length,
            pendingCount: orders.filter(o => o.status === 'New').length,
        };
    })();
    const [filterStatus, setFilterStatus]       = useState('');
    const [search, setSearch]                   = useState('');
    const [copiedCode, setCopiedCode]           = useState<string | null>(null);
    const [copiedMsg, setCopiedMsg]             = useState<string | null>(null);
    const [expandedId, setExpandedId]           = useState<string | null>(null);
    const [dateFrom, setDateFrom]               = useState('');
    const [dateTo, setDateTo]                   = useState('');
    const [deleteTarget, setDeleteTarget]       = useState<OrderData | null>(null);
    const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
    const [historyPhone, setHistoryPhone]       = useState<string | null>(null);
    const { currencySymbol, currency }          = useSettings();
    const { toast, showToast, closeToast }      = useAdminToast();

    const fetchOrders = async () => {
        try {
            const url = filterStatus ? `/api/orders?status=${filterStatus}` : '/api/orders';
            const res = await adminFetch(url);
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch {
            showToast('error', 'Failed to load orders');
        }
        setLoading(false);
    };

    useEffect(() => { fetchOrders(); }, [filterStatus]); // eslint-disable-line react-hooks/exhaustive-deps

    const filtered = orders.filter(o => {
        const q = search.trim().toLowerCase();
        if (q && !(o.customerName.toLowerCase().includes(q) || o.customerPhone.includes(q) || o.orderCode.toLowerCase().includes(q))) return false;
        if (dateFrom) {
            const from = new Date(dateFrom); from.setHours(0, 0, 0, 0);
            if (new Date(o.createdAt) < from) return false;
        }
        if (dateTo) {
            const to = new Date(dateTo); to.setHours(23, 59, 59, 999);
            if (new Date(o.createdAt) > to) return false;
        }
        return true;
    });

    const handleExportCsv = () => {
        const rows = [['Order Code', 'Customer Name', 'Phone', 'Email', 'Total', 'Status', 'Notes', 'Date']];
        for (const o of filtered) {
            rows.push([o.orderCode, o.customerName, o.customerPhone, o.customerEmail || '', String(o.totalPrice), o.status, (o.notes || '').replace(/\n/g, ' '), new Date(o.createdAt).toISOString()]);
        }
        const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
    };

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        try {
            const res = await adminJsonFetch(`/api/orders/${orderId}`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) });
            if (!res.ok) throw new Error('Failed');
            showToast('success', `Status → ${newStatus}`);
        } catch {
            fetchOrders();
            showToast('error', 'Failed to update status');
        }
    };

    const handleDeleteOrder = async () => {
        if (!deleteTarget) return;
        const prev = [...orders];
        setOrders(p => p.filter(o => o.id !== deleteTarget.id));
        setDeleteTarget(null);
        try {
            const res = await adminFetch(`/api/orders/${deleteTarget.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed');
            showToast('success', 'Order deleted');
        } catch {
            setOrders(prev);
            showToast('error', 'Failed to delete order');
        }
    };

    const handleDeleteAllOrders = async () => {
        try {
            await adminFetch('/api/orders', { method: 'DELETE' });
            setShowDeleteAllModal(false);
            showToast('success', 'All orders deleted');
            fetchOrders();
        } catch {
            showToast('error', 'Failed to delete orders');
        }
    };

    const buildMessage = (order: OrderData) => {
        const items = JSON.parse(order.items);
        return buildWhatsAppMessage({
            orderCode: order.orderCode, customerName: order.customerName, customerPhone: order.customerPhone, notes: order.notes,
            items: items.map((i: { productName: string; variant: string; price: number; quantity: number }) => ({ productName: i.productName, variant: i.variant, price: i.price, quantity: i.quantity })),
            totalPrice: order.totalPrice, currency: currency || 'EGP',
        });
    };

    const handleCopyWhatsAppMessage = (order: OrderData) => {
        try {
            navigator.clipboard.writeText(buildMessage(order));
            setCopiedMsg(order.id);
            setTimeout(() => setCopiedMsg(null), 2000);
        } catch { showToast('error', 'Failed to copy'); }
    };

    const handleOpenWhatsApp = (order: OrderData) => {
        try { window.open(generateWhatsAppUrl(order.customerPhone, buildMessage(order)), '_blank', 'noopener,noreferrer'); }
        catch { showToast('error', 'Failed to open WhatsApp'); }
    };

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const formatDateTime = (iso: string) => {
        const d = new Date(iso);
        return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    return (
        <div className="space-y-6">
            <AdminToast toast={toast} onClose={closeToast} />

            {/* Customer History Modal */}
            {historyPhone && (() => {
                const hOrders = orders.filter(o => o.customerPhone === historyPhone);
                const hName   = hOrders[0]?.customerName || historyPhone;
                const hTotal  = hOrders.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + o.totalPrice, 0);
                return (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
                        <div style={{ background: '#141928', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '1.5rem', width: '100%', maxWidth: 560, maxHeight: '80vh', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#E8E8E8', margin: 0 }}>{hName}</h3>
                                    <p style={{ fontSize: '0.75rem', color: '#7a7a7a', margin: '2px 0 0', fontFamily: 'monospace' }}>{historyPhone}</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '0.7rem', color: '#7a7a7a', margin: 0 }}>{hOrders.length} orders · total</p>
                                        <p style={{ fontSize: '1rem', fontWeight: 800, color: '#a78bfa', margin: 0 }}>{hTotal.toFixed(0)} {currencySymbol}</p>
                                    </div>
                                    <button onClick={() => setHistoryPhone(null)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '0.4rem', cursor: 'pointer', color: '#9a9a9a', display: 'flex' }}>
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {hOrders.map(o => (
                                    <div key={o.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                                        <div>
                                            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#E8E8E8', fontFamily: 'monospace', margin: 0 }}>{o.orderCode}</p>
                                            <p style={{ fontSize: '0.7rem', color: '#7a7a7a', margin: '2px 0 0' }}>{formatDateTime(o.createdAt)}</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#E8E8E8' }}>{o.totalPrice.toFixed(0)} {currencySymbol}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[o.status] || ''}`}>{o.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {deleteTarget && (
                <AdminDeleteModal
                    title="Delete Order"
                    message={`Delete order ${deleteTarget.orderCode} from ${deleteTarget.customerName}? This cannot be undone.`}
                    onConfirm={handleDeleteOrder}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            {showDeleteAllModal && (
                <AdminDeleteModal
                    title="Delete All Orders"
                    message={`Delete all ${orders.length} orders? This cannot be undone.`}
                    onConfirm={handleDeleteAllOrders}
                    onCancel={() => setShowDeleteAllModal(false)}
                    confirmLabel="Delete All"
                />
            )}

            {/* Stats bar */}
            {!loading && orders.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '0.75rem' }}>
                    {[
                        { label: "Today's orders", value: stats.todayCount, sub: `${stats.todayRev.toFixed(0)} ${currencySymbol}`, color: '#a78bfa' },
                        { label: 'This week',       value: `${stats.weekRev.toFixed(0)} ${currencySymbol}`, sub: 'revenue', color: '#34d399' },
                        { label: 'This month',      value: `${stats.monthRev.toFixed(0)} ${currencySymbol}`, sub: 'revenue', color: '#38bdf8' },
                        { label: 'Pending (New)',   value: stats.pendingCount, sub: 'awaiting action', color: '#fb923c' },
                    ].map(s => (
                        <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '0.875rem 1rem' }}>
                            <p style={{ fontSize: '0.72rem', color: '#666', marginBottom: 4 }}>{s.label}</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
                            <p style={{ fontSize: '0.7rem', color: '#555', marginTop: 3 }}>{s.sub}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#E8E8E8', letterSpacing: '-0.02em' }}>
                        Orders {orders.length > 0 && <span style={{ fontSize: '0.82rem', fontWeight: 500, color: '#7a7a7a' }}>({orders.length})</span>}
                    </h2>
                    {search && <p style={{ fontSize: '0.75rem', color: '#7a7a7a', marginTop: 2 }}>{filtered.length} results</p>}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {filtered.length > 0 && (
                        <button onClick={handleExportCsv} className="px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2" style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)' }}>
                            <Download className="w-4 h-4" /> Export CSV
                        </button>
                    )}
                    {orders.length > 0 && (
                        <button onClick={() => setShowDeleteAllModal(true)} className="px-4 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-500/20 transition flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> Delete All
                        </button>
                    )}
                </div>
            </div>

            {/* Search + Filter bar */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#666' }} />
                    <input
                        type="text"
                        placeholder="Search by name, phone or order code..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: '100%', padding: '0.625rem 0.875rem 0.625rem 2.5rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#E8E8E8', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                    />
                    {search && (
                        <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#666', display: 'flex', padding: 0 }}>
                            <X style={{ width: 14, height: 14 }} />
                        </button>
                    )}
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{ padding: '0.625rem 0.875rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#9a9a9a', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none', cursor: 'pointer', minWidth: 140 }}
                >
                    <option value="">All Statuses</option>
                    {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} title="From date"
                    style={{ padding: '0.625rem 0.75rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#9a9a9a', fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none', cursor: 'pointer', colorScheme: 'dark' }} />
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} title="To date"
                    style={{ padding: '0.625rem 0.75rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#9a9a9a', fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none', cursor: 'pointer', colorScheme: 'dark' }} />
                {(dateFrom || dateTo) && (
                    <button onClick={() => { setDateFrom(''); setDateTo(''); }} title="Clear dates"
                        style={{ padding: '0.5rem', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#9a9a9a', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <X style={{ width: 14, height: 14 }} />
                    </button>
                )}
            </div>

            {/* Orders list */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                            <div className="skeleton h-5 w-40 mb-2" />
                            <div className="skeleton h-4 w-32" />
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
                    <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">{search ? 'No orders match your search' : 'No orders found'}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((order) => {
                        let parsedItems: Array<{ productName: string; variant: string; price: number; quantity: number }> = [];
                        try { parsedItems = JSON.parse(order.items); } catch { /* noop */ }

                        return (
                            <div key={order.id} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 overflow-hidden">
                                {/* Summary row */}
                                <div className="p-4 sm:p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30 transition" onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}>
                                    <div className="flex items-start gap-3 flex-wrap sm:flex-nowrap">
                                        <div className="shrink-0 min-w-[130px]">
                                            <div className="flex items-center gap-1.5">
                                                <p className="font-mono font-bold text-sm text-gray-900 dark:text-white">{order.orderCode}</p>
                                                <button title="Copy order code" onClick={(e) => { e.stopPropagation(); handleCopyCode(order.orderCode); }} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                                                    {copiedCode === order.orderCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{formatDateTime(order.createdAt)}</p>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{order.customerName}</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setHistoryPhone(order.customerPhone); }}
                                                    className="text-xs font-mono text-gray-500 dark:text-gray-400 hover:text-violet-400 dark:hover:text-violet-400 transition underline-offset-2 hover:underline"
                                                    title="View order history for this customer"
                                                >
                                                    {order.customerPhone}
                                                </button>
                                            </div>
                                            {order.customerEmail && (
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{order.customerEmail}</p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0 ml-auto">
                                            <span className="text-base font-bold text-gray-900 dark:text-white whitespace-nowrap">{order.totalPrice.toFixed(2)} {currencySymbol}</span>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || ''}`}>{order.status}</span>
                                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedId === order.id ? 'rotate-180' : ''}`} />
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded panel */}
                                {expandedId === order.id && (
                                    <div className="border-t border-gray-200 dark:border-gray-800 p-4 sm:p-5 space-y-4">
                                        <div>
                                            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Items</h4>
                                            <div className="space-y-1.5">
                                                {parsedItems.map((item, i) => (
                                                    <div key={i} className="flex justify-between text-sm p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 gap-3">
                                                        <div className="min-w-0">
                                                            <span className="font-medium text-gray-800 dark:text-gray-200">{item.productName}</span>
                                                            <span className="text-gray-500 dark:text-gray-400 mx-1">—</span>
                                                            <span className="text-gray-500 dark:text-gray-400 text-xs">{item.variant}</span>
                                                            <span className="ml-2 text-xs font-semibold text-violet-600 dark:text-violet-400">×{item.quantity}</span>
                                                        </div>
                                                        <span className="font-bold text-gray-900 dark:text-white whitespace-nowrap shrink-0">{(item.price * item.quantity).toFixed(2)} {currencySymbol}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {order.notes && (
                                            <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 rounded-xl p-3">
                                                <span className="font-semibold text-gray-700 dark:text-gray-300">Notes: </span>{order.notes}
                                            </div>
                                        )}

                                        <div>
                                            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Change Status</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {statusOptions.map((s) => (
                                                    <button key={s} onClick={() => handleStatusChange(order.id, s)} className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${order.status === s ? 'ring-2 ring-offset-1 ring-violet-500 dark:ring-offset-gray-900' : ''} ${quickBtnStyle[s] || ''}`}>
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 flex-wrap pt-1">
                                            <button onClick={() => handleOpenWhatsApp(order)} className="px-3 py-2 rounded-xl border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 text-sm font-medium flex items-center gap-2 hover:bg-green-50 dark:hover:bg-green-500/10 transition">
                                                <MessageCircle className="w-4 h-4" /> Open WhatsApp
                                            </button>
                                            <button onClick={() => handleCopyWhatsAppMessage(order)} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300">
                                                {copiedMsg === order.id ? <><Check className="w-4 h-4 text-emerald-500" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Message</>}
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(order); }} className="px-3 py-2 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-500/10 transition ml-auto">
                                                <Trash2 className="w-4 h-4" /> Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
