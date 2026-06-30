/**
 * Exchange Rate Service
 * Fetches live USD → EGP rate from open.er-api.com (free, no key needed)
 * Caches in Settings table — refreshes if older than 6 hours
 */
import { prisma } from '@/lib/prisma';

export interface ExchangeRate {
  usdToEgp: number;
  updatedAt: Date | null;
  source: 'live' | 'cached' | 'fallback';
}

const FALLBACK_RATE = 50.5; // Reasonable fallback if all sources fail
const CACHE_HOURS   = 6;    // Refresh every 6 hours

/** Fetch fresh USD→EGP rate from a free API */
async function fetchLiveRate(): Promise<number | null> {
  const sources = [
    'https://open.er-api.com/v6/latest/USD',
    'https://api.exchangerate-api.com/v4/latest/USD',
  ];

  for (const url of sources) {
    try {
      const res = await fetch(url, {
        next: { revalidate: 0 },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) continue;
      const data = await res.json() as Record<string, unknown>;

      // open.er-api.com: { rates: { EGP: number } }
      const rates = (data.rates ?? data.conversion_rates) as Record<string, number> | undefined;
      if (rates?.EGP && typeof rates.EGP === 'number') {
        return rates.EGP;
      }
    } catch {
      continue;
    }
  }
  return null;
}

/** Get the exchange rate — from cache if fresh, else fetch live */
export async function getExchangeRate(): Promise<ExchangeRate> {
  try {
    const settings = await prisma.settings.findFirst();

    const isFresh = settings?.rateUpdatedAt
      && (Date.now() - new Date(settings.rateUpdatedAt).getTime()) < CACHE_HOURS * 3600 * 1000;

    if (isFresh && settings?.usdToEgpRate) {
      return {
        usdToEgp: settings.usdToEgpRate,
        updatedAt: settings.rateUpdatedAt ?? null,
        source: 'cached',
      };
    }

    // Fetch fresh
    const liveRate = await fetchLiveRate();
    if (liveRate) {
      // Persist in DB
      if (settings) {
        await prisma.settings.update({
          where: { id: settings.id },
          data: { usdToEgpRate: liveRate, rateUpdatedAt: new Date() },
        });
      }
      return { usdToEgp: liveRate, updatedAt: new Date(), source: 'live' };
    }

    // Use cached even if stale
    if (settings?.usdToEgpRate) {
      return { usdToEgp: settings.usdToEgpRate, updatedAt: settings.rateUpdatedAt ?? null, source: 'cached' };
    }

    return { usdToEgp: FALLBACK_RATE, updatedAt: null, source: 'fallback' };
  } catch {
    return { usdToEgp: FALLBACK_RATE, updatedAt: null, source: 'fallback' };
  }
}

/** Convert USD to EGP using stored rate + admin EGP markup */
export async function usdToEgp(usdAmount: number): Promise<{
  usdPrice: number;
  egpPrice: number;
  egpMarkup: number;
  rate: number;
}> {
  const settings = await prisma.settings.findFirst();
  const rate      = settings?.usdToEgpRate ?? FALLBACK_RATE;
  const egpMarkup = settings?.egpMarkup    ?? 0;

  const egpPrice  = Math.ceil(usdAmount * rate + egpMarkup);

  return { usdPrice: usdAmount, egpPrice, egpMarkup, rate };
}
