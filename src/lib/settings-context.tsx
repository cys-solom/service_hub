'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface Settings {
    storeName: string;
    whatsappPhone: string;
    currency: string;
    currencySymbol: string;
    seoTitle: string;
    seoDescription: string;
    theme: string;
    heroStat1Value: string;
    heroStat1Label: string;
    heroStat2Value: string;
    heroStat2Label: string;
    heroStat3Value: string;
    heroStat3Label: string;
}

const currencySymbols: Record<string, string> = {
    EGP: 'EGP',
    USD: 'USD',
    EUR: 'EUR',
    GBP: 'GBP',
    SAR: 'SAR',
    AED: 'AED',
    KWD: 'KWD',
    QAR: 'QAR',
    BHD: 'BHD',
    OMR: 'OMR',
};

const defaultSettings: Settings = {
    storeName: 'Service Hub',
    whatsappPhone: '',
    currency: 'EGP',
    currencySymbol: 'EGP',
    seoTitle: '',
    seoDescription: '',
    theme: 'dark',
    heroStat1Value: '500+',
    heroStat1Label: 'Happy Customers',
    heroStat2Value: '6+',
    heroStat2Label: 'Premium Services',
    heroStat3Value: '24h',
    heroStat3Label: 'Fast Delivery',
};

const SettingsContext = createContext<Settings>(defaultSettings);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(defaultSettings);

    useEffect(() => {
        fetch('/api/settings')
            .then((r) => r.json())
            .then((data) => {
                if (data && !data.error) {
                    const currency = data.currency || 'EGP';
                    setSettings({
                        ...data,
                        currency,
                        currencySymbol: currencySymbols[currency] || currency,
                    });
                }
            })
            .catch(() => { });
    }, []);

    return (
        <SettingsContext.Provider value={settings}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    return useContext(SettingsContext);
}

export function formatPrice(amount: number, currency?: string): string {
    const symbol = currency ? (currencySymbols[currency] || currency) : 'EGP';
    return `${amount.toFixed(2)} ${symbol}`;
}

export { currencySymbols };
