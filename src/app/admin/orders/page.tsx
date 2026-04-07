'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Copy, Check, ChevronDown, Trash2, AlertTriangle } from 'lucide-react';
import { buildWhatsAppMessage, generateWhatsAppUrl } from '@/lib/whatsapp';
import { useSettings } from '@/lib/settings-context';

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
    New: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
    SentToWhatsApp: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
    InProgress: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    Completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
    Cancelled: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
    const { currencySymbol, currency } = useSettings();

    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';

    const fetchOrders = async () => {
        try {
            const url = filterStatus ? `/api/orders?status=${filterStatus}` : '/api/orders';
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
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
        await fetch(`/api/orders/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ status: newStatus }),
        });
        fetchOrders();
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (!confirm('Are you sure you want to delete this order?')) return;
        await fetch(`/api/orders/${orderId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        fetchOrders();
    };

    const handleDeleteAllOrders = async () => {
        await fetch('/api/orders', {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        setShowDeleteAllModal(false);
        fetchOrders();
    };

    const handleCopyWhatsAppMessage = (order: OrderData) => {
        try {
            const items = JSON.parse(order.items);
            const message = buildWhatsAppMessage({
                orderCode: order.orderCode,
                customerName: order.customerName,
                customerPhone: order.customerPhone,
                notes: order.notes,
                items: items.map((i: { productName: string; variant: string; price: number; quantity: number }) => ({
                    productName: i.productName,
                    variant: i.variant,
                    price: i.price,
                    quantity: i.quantity,
                })),
                totalPrice: order.totalPrice,
                currency: currency || 'EGP',
            });
            navigator.clipboard.writeText(message);
            setCopiedId(order.id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch {
            console.error('Failed to copy');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Orders</h2>
                <div className="flex items-center gap-2">
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
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-gray-200 dark:border-gray-800"
                    >
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
                    </motion.div>
                </motion.div>
            )}

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
                        try {
                            parsedItems = JSON.parse(order.items);
                        } catch { }

                        return (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 overflow-hidden"
                            >
                                <div
                                    className="p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30 transition"
                                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="shrink-0">
                                                <p className="font-mono font-bold text-sm text-gray-900 dark:text-white">
                                                    {order.orderCode}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                                    {order.customerName}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{order.customerPhone}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                {order.totalPrice.toFixed(2)} {currencySymbol}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || ''}`}>
                                                {order.status}
                                            </span>
                                            <ChevronDown
                                                className={`w-4 h-4 text-gray-400 transition-transform ${expandedId === order.id ? 'rotate-180' : ''}`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {expandedId === order.id && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: 'auto' }}
                                        className="border-t border-gray-200 dark:border-gray-800 p-5"
                                    >
                                        {/* Items */}
                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Items</h4>
                                            <div className="space-y-2">
                                                {parsedItems.map((item, i) => (
                                                    <div key={i} className="flex justify-between text-sm p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                        <span className="text-gray-700 dark:text-gray-300">
                                                            {item.productName} — {item.variant} x{item.quantity}
                                                        </span>
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {(item.price * item.quantity).toFixed(2)} {currencySymbol}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {order.notes && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                                <span className="font-medium">Notes:</span> {order.notes}
                                            </p>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none"
                                            >
                                                {statusOptions.map((s) => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>

                                            <button
                                                onClick={() => handleCopyWhatsAppMessage(order)}
                                                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                            >
                                                {copiedId === order.id ? (
                                                    <><Check className="w-4 h-4 text-emerald-500" /> Copied!</>
                                                ) : (
                                                    <><Copy className="w-4 h-4" /> Copy WhatsApp Message</>
                                                )}
                                            </button>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteOrder(order.id);
                                                }}
                                                className="px-3 py-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
