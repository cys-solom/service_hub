/**
 * Simple in-memory rate limiter (no external packages).
 *
 * ⚠️  PRODUCTION NOTE:
 *   On serverless runtimes (Vercel, etc.) each function instance has its own
 *   in-memory store. This means the limit is per-instance, NOT global.
 *   For true rate limiting in production use Redis / Upstash or a WAF.
 *   This implementation is sufficient as a first-layer defence against
 *   casual abuse and bots that hit the same server instance repeatedly.
 */

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

// Global store — survives across requests on the same instance
const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 15 minutes to avoid memory bloat
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of store.entries()) {
            if (entry.resetAt <= now) store.delete(key);
        }
    }, 15 * 60 * 1000);
}

export interface RateLimitOptions {
    /** Maximum number of requests allowed per window */
    limit: number;
    /** Time window in milliseconds */
    windowMs: number;
    /** Prefix for the key (e.g. 'order', 'coupon') */
    keyPrefix: string;
}

export interface RateLimitResult {
    allowed: boolean;
    /** Remaining requests in current window */
    remaining: number;
    /** Epoch ms when the window resets */
    resetAt: number;
}

/**
 * Get the best-effort client IP from a Next.js Request.
 * Falls back to 'unknown' when no header is present (e.g. local dev).
 */
export function getClientIp(request: Request): string {
    const xForwardedFor = request.headers.get('x-forwarded-for');
    if (xForwardedFor) {
        // May be a comma-separated list; take the first (client) IP
        return xForwardedFor.split(',')[0].trim();
    }
    return request.headers.get('x-real-ip') ?? 'unknown';
}

/**
 * Check and record a rate-limit hit.
 *
 * @param ip      - The client IP (from getClientIp)
 * @param options - limit, windowMs, keyPrefix
 * @returns       - { allowed, remaining, resetAt }
 */
export function checkRateLimit(ip: string, options: RateLimitOptions): RateLimitResult {
    const { limit, windowMs, keyPrefix } = options;
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();

    let entry = store.get(key);

    if (!entry || entry.resetAt <= now) {
        // New window
        entry = { count: 1, resetAt: now + windowMs };
        store.set(key, entry);
        return { allowed: true, remaining: limit - 1, resetAt: entry.resetAt };
    }

    entry.count += 1;

    if (entry.count > limit) {
        return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }

    return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}
