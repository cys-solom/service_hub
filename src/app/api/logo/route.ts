import { NextRequest, NextResponse } from 'next/server';

/**
 * /api/logo?domain=openai.com   — resolve brand logo via clearbit/icon.horse/google
 * /api/logo?url=https://...     — proxy a specific direct image URL
 *
 * Server-side proxy: avoids browser tracking-prevention blocks.
 * All responses cached for 7 days.
 *
 * SSRF protection:
 *   - HTTPS-only (no http, file, ftp, etc.)
 *   - Private/loopback hostnames are blocked
 *   - Private IP ranges (10.x, 172.16-31.x, 192.168.x) are blocked
 *
 * NOTE: Hostname-to-IP resolution happens at fetch() time inside Node's DNS
 *       stack. For production deployments facing untrusted input, add a
 *       DNS pre-resolution step that validates the resolved IP before fetching.
 *       This file covers the common/static cases (localhost, well-known ranges).
 */

export const runtime = 'nodejs';

const CACHE_SECONDS = 60 * 60 * 24 * 7; // 7 days

// ── SSRF: blocked hostnames ───────────────────────────────────────────────────
const BLOCKED_HOSTNAMES = new Set([
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '::1',
    '[::1]',
]);

/**
 * Returns true when the hostname looks like a private/loopback/link-local
 * IP address or reserved name that should never be reached from this proxy.
 */
function isPrivateHostname(hostname: string): boolean {
    // Strip IPv6 brackets: [::1] → ::1
    const h = hostname.replace(/^\[|\]$/g, '').toLowerCase();

    if (BLOCKED_HOSTNAMES.has(h)) return true;

    // IPv4 private ranges via simple prefix matching
    const ipv4Parts = h.split('.');
    if (ipv4Parts.length === 4 && ipv4Parts.every(p => /^\d+$/.test(p))) {
        const [a, b] = ipv4Parts.map(Number);
        if (a === 10) return true;                             // 10.0.0.0/8
        if (a === 127) return true;                            // 127.0.0.0/8 (loopback)
        if (a === 0) return true;                              // 0.0.0.0/8
        if (a === 169 && b === 254) return true;               // 169.254.0.0/16 (link-local)
        if (a === 172 && b >= 16 && b <= 31) return true;     // 172.16.0.0/12
        if (a === 192 && b === 168) return true;               // 192.168.0.0/16
        if (a === 198 && (b === 18 || b === 19)) return true;  // 198.18.0.0/15 (benchmarking)
        if (a === 100 && b >= 64 && b <= 127) return true;    // 100.64.0.0/10 (shared address)
    }

    // IPv6 loopback / link-local
    if (h === '::1') return true;
    if (h.startsWith('fe80:')) return true;
    if (h.startsWith('fc') || h.startsWith('fd')) return true; // fc00::/7 (unique local)

    return false;
}

async function tryFetch(url: string): Promise<Response | null> {
    try {
        const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ServiceHub/1.0)' },
            signal: AbortSignal.timeout(5000),
        });
        if (res.ok) {
            const ct = res.headers.get('content-type') || '';
            if (ct.startsWith('image/') || ct.includes('svg') || ct.includes('webp')) return res;
        }
    } catch { /* swallow */ }
    return null;
}

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const domain    = searchParams.get('domain')?.toLowerCase().trim();
    const directUrl = searchParams.get('url');

    // ── Mode 1: direct URL proxy ──────────────────────────────────────────────
    if (directUrl) {
        let parsed: URL;
        try { parsed = new URL(directUrl); } catch {
            return new NextResponse(null, { status: 400 });
        }

        // HTTPS only
        if (parsed.protocol !== 'https:') return new NextResponse(null, { status: 400 });

        // SSRF guard — block private/loopback destinations
        if (isPrivateHostname(parsed.hostname)) {
            return new NextResponse(null, { status: 400 });
        }

        const res = await tryFetch(directUrl);
        if (res) {
            const buffer = await res.arrayBuffer();
            return new NextResponse(buffer, {
                headers: {
                    'Content-Type': res.headers.get('content-type') || 'image/png',
                    'Cache-Control': `public, max-age=${CACHE_SECONDS}, stale-while-revalidate=86400`,
                },
            });
        }

        // Direct URL failed — fall back to domain-based lookup
        const hostname  = parsed.hostname;
        const rootDomain = hostname.split('.').slice(-2).join('.');
        // Only fall back to well-known logo services (not the original host)
        const domainSources = [
            `https://logo.clearbit.com/${rootDomain}`,
            `https://icon.horse/icon/${rootDomain}`,
        ];
        for (const url of domainSources) {
            const fallback = await tryFetch(url);
            if (fallback) {
                const buffer = await fallback.arrayBuffer();
                return new NextResponse(buffer, {
                    headers: {
                        'Content-Type': fallback.headers.get('content-type') || 'image/png',
                        'Cache-Control': `public, max-age=${CACHE_SECONDS}, stale-while-revalidate=86400`,
                    },
                });
            }
        }
        return new NextResponse(null, { status: 404 });
    }

    // ── Mode 2: domain → clearbit / icon.horse / google ──────────────────────
    if (!domain || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
        return new NextResponse(null, { status: 400 });
    }

    // SSRF guard on the domain param too
    if (isPrivateHostname(domain)) {
        return new NextResponse(null, { status: 400 });
    }

    const sources = [
        `https://logo.clearbit.com/${domain}`,
        `https://icon.horse/icon/${domain}`,
        `https://www.google.com/s2/favicons?domain=${domain}&sz=256`,
    ];

    for (const url of sources) {
        const res = await tryFetch(url);
        if (res) {
            const buffer = await res.arrayBuffer();
            return new NextResponse(buffer, {
                headers: {
                    'Content-Type': res.headers.get('content-type') || 'image/png',
                    'Cache-Control': `public, max-age=${CACHE_SECONDS}, stale-while-revalidate=86400`,
                    'X-Logo-Source': url,
                },
            });
        }
    }

    return new NextResponse(null, { status: 404 });
}
