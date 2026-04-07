import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const auth = authenticateRequest(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const totalOrders = await prisma.order.count();
        const recentOrders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        const topProducts = await prisma.product.findMany({
            orderBy: { orderCount: 'desc' },
            take: 5,
            include: { category: true },
        });

        const ordersByStatus = await prisma.order.groupBy({
            by: ['status'],
            _count: { id: true },
        });

        const totalRevenue = await prisma.order.aggregate({
            _sum: { totalPrice: true },
            where: { status: { in: ['SentToWhatsApp', 'InProgress', 'Completed'] } },
        });

        const totalProducts = await prisma.product.count();
        const totalCategories = await prisma.category.count();

        // Daily revenue (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const dailyOrders = await prisma.order.findMany({
            where: {
                createdAt: { gte: thirtyDaysAgo },
                status: { in: ['SentToWhatsApp', 'InProgress', 'Completed'] },
            },
            select: { totalPrice: true, createdAt: true },
            orderBy: { createdAt: 'asc' },
        });

        // Group by day
        const dailyRevenueMap: Record<string, number> = {};
        dailyOrders.forEach((o) => {
            const day = new Date(o.createdAt).toISOString().split('T')[0];
            dailyRevenueMap[day] = (dailyRevenueMap[day] || 0) + o.totalPrice;
        });
        const dailyRevenue = Object.entries(dailyRevenueMap).map(([date, amount]) => ({
            date,
            amount: Math.round(amount * 100) / 100,
        }));

        // Monthly revenue (last 12 months)
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const monthlyOrders = await prisma.order.findMany({
            where: {
                createdAt: { gte: twelveMonthsAgo },
                status: { in: ['SentToWhatsApp', 'InProgress', 'Completed'] },
            },
            select: { totalPrice: true, createdAt: true },
            orderBy: { createdAt: 'asc' },
        });

        const monthlyRevenueMap: Record<string, number> = {};
        monthlyOrders.forEach((o) => {
            const d = new Date(o.createdAt);
            const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthlyRevenueMap[month] = (monthlyRevenueMap[month] || 0) + o.totalPrice;
        });
        const monthlyRevenue = Object.entries(monthlyRevenueMap).map(([month, amount]) => ({
            month,
            amount: Math.round(amount * 100) / 100,
        }));

        // Today's revenue
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const todayRevenue = await prisma.order.aggregate({
            _sum: { totalPrice: true },
            where: {
                createdAt: { gte: startOfToday },
                status: { in: ['SentToWhatsApp', 'InProgress', 'Completed'] },
            },
        });

        // This week's revenue
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const weekRevenue = await prisma.order.aggregate({
            _sum: { totalPrice: true },
            where: {
                createdAt: { gte: startOfWeek },
                status: { in: ['SentToWhatsApp', 'InProgress', 'Completed'] },
            },
        });

        // This month's revenue
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const monthRevenue = await prisma.order.aggregate({
            _sum: { totalPrice: true },
            where: {
                createdAt: { gte: startOfMonth },
                status: { in: ['SentToWhatsApp', 'InProgress', 'Completed'] },
            },
        });

        return NextResponse.json({
            totalOrders,
            totalProducts,
            totalCategories,
            totalRevenue: totalRevenue._sum.totalPrice || 0,
            todayRevenue: todayRevenue._sum.totalPrice || 0,
            weekRevenue: weekRevenue._sum.totalPrice || 0,
            monthRevenue: monthRevenue._sum.totalPrice || 0,
            dailyRevenue,
            monthlyRevenue,
            recentOrders,
            topProducts: topProducts.map((p) => ({
                ...p,
                images: JSON.parse(p.images),
                features: JSON.parse(p.features),
            })),
            ordersByStatus: ordersByStatus.reduce(
                (acc, item) => ({ ...acc, [item.status]: item._count.id }),
                {} as Record<string, number>
            ),
        });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
    }
}
