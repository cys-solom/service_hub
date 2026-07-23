const KEY = 'sh_recently_viewed';
const MAX = 8;

export interface RecentProduct {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
  image?: string;
  price?: number;
  accentColor?: string;
}

export function getRecentlyViewed(): RecentProduct[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export function trackProductView(product: RecentProduct) {
  try {
    const existing = getRecentlyViewed().filter(p => p.id !== product.id);
    const updated = [product, ...existing].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {}
}
