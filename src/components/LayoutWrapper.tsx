'use client';

import { useI18n } from '@/lib/i18n';
import { useEffect, ReactNode } from 'react';

export function LayoutWrapper({ children }: { children: ReactNode }) {
    const { dir, locale } = useI18n();

    useEffect(() => {
        document.documentElement.dir = dir;
        document.documentElement.lang = locale;
    }, [dir, locale]);

    return <div dir={dir}>{children}</div>;
}
