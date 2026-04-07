'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    ShoppingBag,
    Package,
    DollarSign,
    FolderOpen,
    TrendingUp,
    Clock,
    Calendar,
    CalendarDays,
    BarChart3,
} from 'lucide-react';
import { useSettings } from '@/lib/settings-context';

interface DashboardData {
    totalOrders: number;
    totalProducts: number;
    totalCategories: number;
    totalRevenue: number;
    todayRevenue: number;
    weekRevenue: number;
    monthRevenue: number;
    dailyRevenue: Array<{ date: string; amount: number }>;
    monthlyRevenue: Array<{ month: string; amount: number }>;
    recentOrders: Array<{
        id: string;
        orderCode: string;
        customerName: string;
        totalPrice: number;
        status: string;
        createdAt: string;
    }>;
    topProducts: Array<{
        id: string;
        name: string;
        orderCount: number;
        images: string[];
    }>;
    ordersByStatus: Record<string, number>;
}

export default function AdminDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [revenueTab, setRevenueTab] = useState<'daily' | 'monthly'>('daily');
    const { currencySymbol } = useSettings();

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        fetch('/api/admin/dashboard', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((d) => {
                setData(d);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const statusColors: Record<string, string> = {
        New: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
        SentToWhatsApp: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
        InProgress: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
        Completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
        Cancelled: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                            <div className="skeleton h-10 w-10 rounded-xl mb-3" />
                            <div className="skeleton h-4 w-20 mb-2" />
                            <div className="skeleton h-8 w-16" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Chart helper: get max value for scaling
    const chartData = revenueTab === 'daily' ? (data?.dailyRevenue || []) : (data?.monthlyRevenue || []);
    const maxAmount = Math.max(...chartData.map(d => revenueTab === 'daily' ? d.amount : (d as { month: string; amount: number }).amount), 1);

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        icon: ShoppingBag,
                        label: 'Total Orders',
                        value: data?.totalOrders || 0,
                        color: 'from-violet-500 to-purple-500',
                    },
                    {
                        icon: DollarSign,
                        label: 'Total Revenue',
                        value: `${(data?.totalRevenue || 0).toFixed(2)} ${currencySymbol}`,
                        color: 'from-emerald-500 to-teal-500',
                    },
                    {
                        icon: Package,
                        label: 'Products',
                        value: data?.totalProducts || 0,
                        color: 'from-blue-500 to-cyan-500',
                    },
                    {
                        icon: FolderOpen,
                        label: 'Categories',
                        value: data?.totalCategories || 0,
                        color: 'from-amber-500 to-orange-500',
                    },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6"
                    >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                            <stat.icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Revenue Period Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
                {[
                    {
                        icon: Clock,
                        label: 'Today',
                        value: data?.todayRevenue || 0,
                        color: 'text-blue-500',
                        bgColor: 'bg-blue-50 dark:bg-blue-500/10',
                    },
                    {
                        icon: CalendarDays,
                        label: 'This Week',
                        value: data?.weekRevenue || 0,
                        color: 'text-violet-500',
                        bgColor: 'bg-violet-50 dark:bg-violet-500/10',
                    },
                    {
                        icon: Calendar,
                        label: 'This Month',
                        value: data?.monthRevenue || 0,
                        color: 'text-emerald-500',
                        bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
                    },
                ].map((period) => (
                    <div
                        key={period.label}
                        className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-5 flex items-center gap-4"
                    >
                        <div className={`w-12 h-12 rounded-xl ${period.bgColor} flex items-center justify-center`}>
                            <period.icon className={`w-6 h-6 ${period.color}`} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{period.label}</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {period.value.toFixed(2)} {currencySymbol}
                            </p>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* Revenue Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-violet-500" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Revenue Overview</h3>
                    </div>
                    <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setRevenueTab('daily')}
                            className={`px-4 py-1.5 text-sm font-medium transition ${revenueTab === 'daily'
                                ? 'bg-violet-600 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            Daily
                        </button>
                        <button
                            onClick={() => setRevenueTab('monthly')}
                            className={`px-4 py-1.5 text-sm font-medium transition ${revenueTab === 'monthly'
                                ? 'bg-violet-600 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            Monthly
                        </button>
                    </div>
                </div>

                {chartData.length > 0 ? (
                    <div className="space-y-3">
                        {chartData.slice(-10).map((item, i) => {
                            const amount = item.amount;
                            const itemAny = item as Record<string, unknown>;
                            const label = revenueTab === 'daily'
                                ? new Date((itemAny.date as string) || (itemAny.month as string) + '-01').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                : new Date((itemAny.month as string) + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                            const percentage = (amount / maxAmount) * 100;

                            return (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="text-sm text-gray-500 dark:text-gray-400 w-24 shrink-0 text-end">
                                        {label}
                                    </span>
                                    <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-8 overflow-hidden relative">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.max(percentage, 2)}%` }}
                                            transition={{ duration: 0.8, delay: i * 0.05 }}
                                            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full flex items-center justify-end px-3"
                                        >
                                            {percentage > 20 && (
                                                <span className="text-xs font-semibold text-white whitespace-nowrap">
                                                    {amount.toFixed(0)} {currencySymbol}
                                                </span>
                                            )}
                                        </motion.div>
                                        {percentage <= 20 && (
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                {amount.toFixed(0)} {currencySymbol}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                        No revenue data yet
                    </div>
                )}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-5 h-5 text-violet-500" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Recent Orders</h3>
                    </div>
                    <div className="space-y-3">
                        {data?.recentOrders && data.recentOrders.length > 0 ? (
                            data.recentOrders.slice(0, 5).map((order) => (
                                <div
                                    key={order.id}
                                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                                >
                                    <div>
                                        <p className="font-medium text-sm text-gray-900 dark:text-white">
                                            {order.orderCode}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {order.customerName}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-sm text-gray-900 dark:text-white">
                                            {order.totalPrice.toFixed(2)} {currencySymbol}
                                        </p>
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || ''}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                                No orders yet
                            </p>
                        )}
                    </div>
                </motion.div>

                {/* Top Products */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-violet-500" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Top Products</h3>
                    </div>
                    <div className="space-y-3">
                        {data?.topProducts?.map((product, i) => (
                            <div
                                key={product.id}
                                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                            >
                                <span className="text-sm font-bold text-gray-400 w-6">#{i + 1}</span>
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center overflow-hidden">
                                    {product.images?.[0] ? (
                                        <img src={product.images[0]} alt={product.name} className="w-7 h-7 object-contain" />
                                    ) : (
                                        <Package className="w-5 h-5 text-violet-500" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                        {product.name}
                                    </p>
                                </div>
                                <span className="text-sm font-semibold text-violet-600 dark:text-violet-400">
                                    {product.orderCount} orders
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
