'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface Settings {
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
    // Exchange rate & EGP markup
    usdToEgpRate: number;
    egpMarkup: number;
    rateUpdatedAt: string | null;
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
    heroStat1Value: '',
    heroStat1Label: '',
    heroStat2Value: '',
    heroStat2Label: '',
    heroStat3Value: '',
    heroStat3Label: '',
    usdToEgpRate: 50.5,
    egpMarkup: 0,
    rateUpdatedAt: null,
};

interface SettingsContextValue extends Settings {
    settingsLoaded: boolean;
    displaySymbol: string;
    convertForDisplay: (price: number) => number;
    displayCurrency: 'store' | 'usd';
    toggleDisplayCurrency: () => void;
    canSwitchCurrency: boolean;
}

const SettingsContext = createContext<SettingsContextValue>({
    ...defaultSettings, settingsLoaded: false,
    displaySymbol: 'EGP', convertForDisplay: (p) => p,
    displayCurrency: 'store', toggleDisplayCurrency: () => {}, canSwitchCurrency: false,
});

let settingsCache: Settings | null = null;

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(settingsCache || defaultSettings);
    const [loaded, setLoaded] = useState(!!settingsCache);
    const [displayCurrency, setDisplayCurrencyState] = useState<'store' | 'usd'>('store');

    useEffect(() => {
        if (settingsCache) return;
        const controller = new AbortController();
        fetch('/api/settings', { signal: controller.signal })
            .then((r) => r.json())
            .then((data) => {
                if (data && !data.error) {
                    const currency = data.currency || 'EGP';
                    const resolved: Settings = {
                        ...defaultSettings,
                        ...data,
                        currency,
                        currencySymbol: currencySymbols[currency] || currency,
                        usdToEgpRate: data.usdToEgpRate ?? 50.5,
                        egpMarkup:    data.egpMarkup    ?? 0,
                        rateUpdatedAt: data.rateUpdatedAt ?? null,
                    };
                    settingsCache = resolved;
                    setSettings(resolved);
                }
                setLoaded(true);
            })
            .catch(() => { setLoaded(true); });
        return () => controller.abort();
    }, []);

    useEffect(() => {
        const saved = (typeof window !== 'undefined' ? localStorage.getItem('displayCurrency') : null) as 'usd' | null;
        if (saved === 'usd') setDisplayCurrencyState('usd');
    }, []);

    const canSwitchCurrency = settings.currency === 'EGP' && (settings.usdToEgpRate || 0) > 0;
    const isUsd = displayCurrency === 'usd' && canSwitchCurrency;
    const displaySymbol = isUsd ? 'USD' : settings.currencySymbol;
    const convertForDisplay = (price: number) => isUsd && settings.usdToEgpRate > 0
        ? Math.round((price / settings.usdToEgpRate) * 100) / 100
        : price;
    const toggleDisplayCurrency = () => {
        const next = displayCurrency === 'store' ? 'usd' : 'store';
        setDisplayCurrencyState(next);
        if (typeof window !== 'undefined') localStorage.setItem('displayCurrency', next);
    };

    return (
        <SettingsContext.Provider value={{ ...settings, settingsLoaded: loaded, displaySymbol, convertForDisplay, displayCurrency, toggleDisplayCurrency, canSwitchCurrency }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    return useContext(SettingsContext);
}

/** Convert USD price → EGP using settings */
export function usdToEgpDisplay(
    usdPrice: number,
    settings: Settings,
): { usd: number; egp: number } {
    const egp = Math.ceil(usdPrice * settings.usdToEgpRate + settings.egpMarkup);
    return { usd: usdPrice, egp };
}

/** Format a price value with currency symbol */
export function formatPrice(amount: number, currency?: string): string {
    const symbol = currency ? (currencySymbols[currency] || currency) : 'EGP';
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${symbol}`;
}

export { currencySymbols };
