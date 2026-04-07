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
        const existing = await prisma.settings.findFirst();

        if (existing) {
            const settings = await prisma.settings.update({
                where: { id: existing.id },
                data: body,
            });
            return NextResponse.json(settings);
        } else {
            const settings = await prisma.settings.create({ data: body });
            return NextResponse.json(settings);
        }
    } catch {
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}

