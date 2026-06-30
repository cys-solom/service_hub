import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { getExchangeRate } from '@/lib/exchange-rate';

export async function GET() {
    try {
        const settings = await prisma.settings.findFirst();
        if (!settings) {
            // Auto-create with live exchange rate
            const rate = await getExchangeRate();
            const created = await prisma.settings.create({
                data: { usdToEgpRate: rate.usdToEgp, rateUpdatedAt: new Date() },
            });
            return NextResponse.json({
                ...created,
                contentEn: '{}',
                contentAr: '{}',
            });
        }
        return NextResponse.json({
            ...settings,
            contentEn:     settings.contentEn   || '{}',
            contentAr:     settings.contentAr   || '{}',
            heroStat1Value: settings.heroStat1Value || '4000+',
            heroStat1Label: settings.heroStat1Label || 'Happy Customers',
            heroStat2Value: settings.heroStat2Value || '10+',
            heroStat2Label: settings.heroStat2Label || 'Premium Services',
            heroStat3Value: settings.heroStat3Value || '24h',
            heroStat3Label: settings.heroStat3Label || 'Fast Delivery',
            usdToEgpRate:   settings.usdToEgpRate  ?? 50.5,
            egpMarkup:      settings.egpMarkup      ?? 0,
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            },
        });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const auth = authenticateRequest(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        const allowedFields = [
            'storeName', 'whatsappPhone', 'currency', 'seoTitle', 'seoDescription',
            'theme', 'heroStat1Value', 'heroStat1Label', 'heroStat2Value', 'heroStat2Label',
            'heroStat3Value', 'heroStat3Label', 'contentEn', 'contentAr',
            'usdToEgpRate', 'egpMarkup',
        ];

        const sanitizedData: Record<string, unknown> = {};
        for (const key of allowedFields) {
            if (body[key] !== undefined) {
                // Numeric fields
                if (key === 'usdToEgpRate' || key === 'egpMarkup') {
                    sanitizedData[key] = Number(body[key]);
                } else {
                    sanitizedData[key] = body[key];
                }
            }
        }

        // If refreshing rate from live
        if (body.refreshRate) {
            const rate = await getExchangeRate();
            sanitizedData.usdToEgpRate  = rate.usdToEgp;
            sanitizedData.rateUpdatedAt = new Date();
        }

        const existing = await prisma.settings.findFirst();

        if (existing) {
            const settings = await prisma.settings.update({
                where: { id: existing.id },
                data: sanitizedData,
            });
            return NextResponse.json(settings);
        } else {
            const settings = await prisma.settings.create({ data: sanitizedData as Record<string, string> });
            return NextResponse.json(settings);
        }
    } catch {
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
