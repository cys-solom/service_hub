// Simple in-memory TTL cache for public API routes.
// Admin mutations call invalidate() so users see updates immediately.

type CacheEntry = { data: unknown; expiresAt: number };
const store = new Map<string, CacheEntry>();

export function cacheGet<T>(key: string): T | null {
    const entry = store.get(key);
    if (!entry || Date.now() > entry.expiresAt) return null;
    return entry.data as T;
}

export function cacheSet(key: string, data: unknown, ttlMs: number) {
    store.set(key, { data, expiresAt: Date.now() + ttlMs });
}

export function cacheInvalidate(...keys: string[]) {
    for (const k of keys) store.delete(k);
}
