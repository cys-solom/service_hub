import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET() {
    try {
        const settings = await prisma.settings.findFirst();
        if (!settings) {
            return NextResponse.json({});
        }
        // Ensure contentEn and contentAr are always present
        return NextResponse.json({
            ...settings,
            contentEn: settings.contentEn || '{}',
            contentAr: settings.contentAr || '{}',
            heroStat1Value: settings.heroStat1Value || '500+',
            heroStat1Label: settings.heroStat1Label || 'Happy Customers',
            heroStat2Value: settings.heroStat2Value || '6+',
            heroStat2Label: settings.heroStat2Label || 'Premium Services',
            heroStat3Value: settings.heroStat3Value || '24h',
            heroStat3Label: settings.heroStat3Label || 'Fast Delivery',
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

        // Only allow known fields to prevent arbitrary data injection
        const allowedFields = [
            'storeName', 'whatsappPhone', 'currency', 'seoTitle', 'seoDescription',
            'theme', 'heroStat1Value', 'heroStat1Label', 'heroStat2Value', 'heroStat2Label',
            'heroStat3Value', 'heroStat3Label', 'contentEn', 'contentAr'
        ];
        const sanitizedData: Record<string, string> = {};
        for (const key of allowedFields) {
            if (body[key] !== undefined) {
                sanitizedData[key] = body[key];
            }
        }

        const existing = await prisma.settings.findFirst();

        if (existing) {
            const settings = await prisma.settings.update({
                where: { id: existing.id },
                data: sanitizedData,
            });
            return NextResponse.json(settings);
        } else {
            const settings = await prisma.settings.create({ data: sanitizedData });
            return NextResponse.json(settings);
        }
    } catch {
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}

