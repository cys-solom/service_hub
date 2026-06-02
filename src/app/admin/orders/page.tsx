'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, Copy, Check, ChevronDown, Trash2, AlertTriangle, MessageCircle, Phone } from 'lucide-react';
import { buildWhatsAppMessage, generateWhatsAppUrl } from '@/lib/whatsapp';
import { useSettings } from '@/lib/settings-context';
import { adminFetch, adminJsonFetch } from '@/lib/admin-fetch';


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

/** Quick-action button colours matching each status */
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
    const [filterStatus, setFilterStatus]       = useState('');
    const [copiedCode, setCopiedCode]           = useState<string | null>(null);   // order code copy
    const [copiedMsg, setCopiedMsg]             = useState<string | null>(null);   // WA message copy
    const [expandedId, setExpandedId]           = useState<string | null>(null);
    const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
    const { currencySymbol, currency }          = useSettings();


    const fetchOrders = async () => {
        try {
            const url = filterStatus ? `/api/orders?status=${filterStatus}` : '/api/orders';
            const res = await adminFetch(url);
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch {
            console.error('Failed to fetch orders');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
    }, [filterStatus]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        try {
            const res = await adminJsonFetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error('Failed');
        } catch {
            fetchOrders(); // revert
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (!confirm('Are you sure you want to delete this order?')) return;
        const prev = [...orders];
        setOrders(p => p.filter(o => o.id !== orderId));
        try {
            const res = await adminFetch(`/api/orders/${orderId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed');
        } catch {
            setOrders(prev);
        }
    };

    const handleDeleteAllOrders = async () => {
        await adminFetch('/api/orders', { method: 'DELETE' });
        setShowDeleteAllModal(false);
        fetchOrders();
    };


    /** Copy the formatted WhatsApp message for an order */
    const handleCopyWhatsAppMessage = (order: OrderData) => {
        try {
            const items = JSON.parse(order.items);
            const message = buildWhatsAppMessage({
                orderCode:    order.orderCode,
                customerName: order.customerName,
                customerPhone: order.customerPhone,
                notes:        order.notes,
                items:        items.map((i: { productName: string; variant: string; price: number; quantity: number }) => ({
                    productName: i.productName,
                    variant:     i.variant,
                    price:       i.price,
                    quantity:    i.quantity,
                })),
                totalPrice: order.totalPrice,
                currency:   currency || 'EGP',
            });
            navigator.clipboard.writeText(message);
            setCopiedMsg(order.id);
            setTimeout(() => setCopiedMsg(null), 2000);
        } catch {
            console.error('Failed to copy');
        }
    };

    /** Open WhatsApp chat directly with the customer */
    const handleOpenWhatsApp = (order: OrderData) => {
        try {
            const items = JSON.parse(order.items);
            const message = buildWhatsAppMessage({
                orderCode:    order.orderCode,
                customerName: order.customerName,
                customerPhone: order.customerPhone,
                notes:        order.notes,
                items:        items.map((i: { productName: string; variant: string; price: number; quantity: number }) => ({
                    productName: i.productName,
                    variant:     i.variant,
                    price:       i.price,
                    quantity:    i.quantity,
                })),
                totalPrice: order.totalPrice,
                currency:   currency || 'EGP',
            });
            const url = generateWhatsAppUrl(order.customerPhone, message);
            window.open(url, '_blank', 'noopener,noreferrer');
        } catch {
            console.error('Failed to open WhatsApp');
        }
    };

    /** Copy the order code to clipboard */
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
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Orders
                    {orders.length > 0 && (
                        <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                            ({orders.length})
                        </span>
                    )}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-violet-500"
                    >
                        <option value="">All Statuses</option>
                        {statusOptions.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    {orders.length > 0 && (
                        <button
                            onClick={() => setShowDeleteAllModal(true)}
                            className="px-4 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-500/20 transition flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete All
                        </button>
                    )}
                </div>
            </div>

            {/* Delete All Modal */}
            {showDeleteAllModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete All Orders</h3>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            Are you sure you want to delete all {orders.length} orders? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteAllModal(false)}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAllOrders}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium text-sm hover:bg-red-700 transition"
                            >
                                Delete All
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
            ) : orders.length === 0 ? (
                <div className="text-center py-20 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
                    <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No orders found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => {
                        let parsedItems: Array<{ productName: string; variant: string; price: number; quantity: number }> = [];
                        try { parsedItems = JSON.parse(order.items); } catch { /* noop */ }

                        return (
                            <div key={order.id} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 overflow-hidden">

                                {/* ── Summary row (always visible) ── */}
                                <div
                                    className="p-4 sm:p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30 transition"
                                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                                >
                                    <div className="flex items-start gap-3 flex-wrap sm:flex-nowrap">

                                        {/* Order code + date */}
                                        <div className="shrink-0 min-w-[130px]">
                                            <div className="flex items-center gap-1.5">
                                                <p className="font-mono font-bold text-sm text-gray-900 dark:text-white">
                                                    {order.orderCode}
                                                </p>
                                                <button
                                                    title="Copy order code"
                                                    onClick={(e) => { e.stopPropagation(); handleCopyCode(order.orderCode); }}
                                                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                                >
                                                    {copiedCode === order.orderCode
                                                        ? <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                        : <Copy className="w-3.5 h-3.5" />
                                                    }
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                {formatDateTime(order.createdAt)}
                                            </p>
                                        </div>

                                        {/* Customer info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                                                {order.customerName}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                                                <p className="text-xs font-mono text-gray-500 dark:text-gray-400 select-all">
                                                    {order.customerPhone}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Price + status + chevron */}
                                        <div className="flex items-center gap-2 shrink-0 ml-auto">
                                            <span className="text-base font-bold text-gray-900 dark:text-white whitespace-nowrap">
                                                {order.totalPrice.toFixed(2)} {currencySymbol}
                                            </span>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || ''}`}>
                                                {order.status}
                                            </span>
                                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedId === order.id ? 'rotate-180' : ''}`} />
                                        </div>
                                    </div>
                                </div>

                                {/* ── Expanded panel ── */}
                                {expandedId === order.id && (
                                    <div className="border-t border-gray-200 dark:border-gray-800 p-4 sm:p-5 space-y-4">

                                        {/* Items table */}
                                        <div>
                                            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                                                Items
                                            </h4>
                                            <div className="space-y-1.5">
                                                {parsedItems.map((item, i) => (
                                                    <div key={i} className="flex justify-between text-sm p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 gap-3">
                                                        <div className="min-w-0">
                                                            <span className="font-medium text-gray-800 dark:text-gray-200">
                                                                {item.productName}
                                                            </span>
                                                            <span className="text-gray-500 dark:text-gray-400 mx-1">—</span>
                                                            <span className="text-gray-500 dark:text-gray-400 text-xs">{item.variant}</span>
                                                            <span className="ml-2 text-xs font-semibold text-violet-600 dark:text-violet-400">
                                                                ×{item.quantity}
                                                            </span>
                                                        </div>
                                                        <span className="font-bold text-gray-900 dark:text-white whitespace-nowrap shrink-0">
                                                            {(item.price * item.quantity).toFixed(2)} {currencySymbol}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        {order.notes && (
                                            <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 rounded-xl p-3">
                                                <span className="font-semibold text-gray-700 dark:text-gray-300">Notes: </span>
                                                {order.notes}
                                            </div>
                                        )}

                                        {/* ── Quick status buttons ── */}
                                        <div>
                                            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                                                Change Status
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {statusOptions.map((s) => (
                                                    <button
                                                        key={s}
                                                        onClick={() => handleStatusChange(order.id, s)}
                                                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                                                            order.status === s
                                                                ? 'ring-2 ring-offset-1 ring-violet-500 dark:ring-offset-gray-900'
                                                                : ''
                                                        } ${quickBtnStyle[s] || ''}`}
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* ── Action buttons ── */}
                                        <div className="flex items-center gap-2 flex-wrap pt-1">
                                            {/* Open WhatsApp with customer */}
                                            <button
                                                onClick={() => handleOpenWhatsApp(order)}
                                                className="px-3 py-2 rounded-xl border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 text-sm font-medium flex items-center gap-2 hover:bg-green-50 dark:hover:bg-green-500/10 transition"
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                                Open WhatsApp
                                            </button>

                                            {/* Copy WA message */}
                                            <button
                                                onClick={() => handleCopyWhatsAppMessage(order)}
                                                className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300"
                                            >
                                                {copiedMsg === order.id
                                                    ? <><Check className="w-4 h-4 text-emerald-500" /> Copied!</>
                                                    : <><Copy className="w-4 h-4" /> Copy Message</>
                                                }
                                            </button>

                                            {/* Delete */}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.id); }}
                                                className="px-3 py-2 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-500/10 transition ml-auto"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete
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
