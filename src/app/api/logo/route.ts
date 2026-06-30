import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * /api/logo?domain=openai.com   — resolve brand logo via clearbit/icon.horse/google
 * /api/logo?url=https://...     — proxy a specific direct image URL
 *
 * Server-side proxy: avoids browser tracking-prevention blocks.
 * Disk cache: fetched logos are saved to public/logos-cache/ so future
 *   requests skip all external network calls entirely.
 * Browser cache: 7-day Cache-Control header.
 *
 * SSRF protection:
 *   - HTTPS-only (no http, file, ftp, etc.)
 *   - Private/loopback hostnames are blocked
 *   - Private IP ranges (10.x, 172.16-31.x, 192.168.x) are blocked
 */

export const runtime = 'nodejs';

const CACHE_SECONDS = 60 * 60 * 24 * 7; // 7 days browser cache
const CACHE_HEADERS = `public, max-age=${CACHE_SECONDS}, stale-while-revalidate=86400`;

// Directory where fetched logos are saved persistently
const DISK_CACHE_DIR = path.join(process.cwd(), 'public', 'logos-cache');

// ── SSRF: blocked hostnames ───────────────────────────────────────────────────
const BLOCKED_HOSTNAMES = new Set([
    'localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]',
]);

function isPrivateHostname(hostname: string): boolean {
    const h = hostname.replace(/^\[|\]$/g, '').toLowerCase();
    if (BLOCKED_HOSTNAMES.has(h)) return true;
    const ipv4Parts = h.split('.');
    if (ipv4Parts.length === 4 && ipv4Parts.every(p => /^\d+$/.test(p))) {
        const [a, b] = ipv4Parts.map(Number);
        if (a === 10) return true;
        if (a === 127) return true;
        if (a === 0) return true;
        if (a === 169 && b === 254) return true;
        if (a === 172 && b >= 16 && b <= 31) return true;
        if (a === 192 && b === 168) return true;
        if (a === 198 && (b === 18 || b === 19)) return true;
        if (a === 100 && b >= 64 && b <= 127) return true;
    }
    if (h === '::1') return true;
    if (h.startsWith('fe80:')) return true;
    if (h.startsWith('fc') || h.startsWith('fd')) return true;
    return false;
}

// ── Disk cache helpers ────────────────────────────────────────────────────────

/** Convert domain/key to a safe filename (no path traversal). */
function safeKey(raw: string): string {
    return raw.toLowerCase().replace(/[^a-z0-9._-]/g, '_').slice(0, 120);
}

async function ensureCacheDir() {
    try { await fs.mkdir(DISK_CACHE_DIR, { recursive: true }); } catch { /* exists */ }
}

/** Find the first cached file matching the key (any extension). */
async function readDiskCache(key: string): Promise<{ data: Buffer; contentType: string } | null> {
    for (const ext of ['.png', '.jpg', '.svg', '.webp', '.ico', '.gif']) {
        const filePath = path.join(DISK_CACHE_DIR, key + ext);
        try {
            const data = await fs.readFile(filePath);
            const ctMap: Record<string, string> = {
                '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
                '.webp': 'image/webp', '.ico': 'image/x-icon', '.gif': 'image/gif',
            };
            return { data, contentType: ctMap[ext] || 'image/png' };
        } catch { /* not found, try next */ }
    }
    return null;
}

/** Save fetched image to disk cache. */
async function writeDiskCache(key: string, buffer: Buffer, contentType: string): Promise<void> {
    const extMap: Record<string, string> = {
        'image/png': '.png', 'image/jpeg': '.jpg', 'image/svg+xml': '.svg',
        'image/webp': '.webp', 'image/x-icon': '.ico', 'image/gif': '.gif',
    };
    const ext = extMap[contentType.split(';')[0].trim()] || '.png';
    const filePath = path.join(DISK_CACHE_DIR, key + ext);
    try {
        await ensureCacheDir();
        await fs.writeFile(filePath, buffer);
    } catch { /* non-fatal — disk full or readonly */ }
}

// ── Fetch helpers ─────────────────────────────────────────────────────────────

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

/**
 * Race all sources in parallel — first success wins.
 * Deliberately does NOT abort the losing requests: calling AbortController.abort()
 * on a fetch whose response body is already streaming triggers a Node/undici bug
 * ("Cannot set property message of ... which has only a getter") that crashes the
 * route with an unhandled rejection. Losers are simply left to finish/GC quietly.
 */
async function raceFetch(urls: string[]): Promise<{ res: Response; url: string } | null> {
    return new Promise((resolve) => {
        let settled = false;
        let remaining = urls.length;
        if (remaining === 0) { resolve(null); return; }

        for (const url of urls) {
            tryFetch(url).then((res) => {
                remaining--;
                if (res && !settled) {
                    settled = true;
                    resolve({ res, url });
                } else if (remaining === 0 && !settled) {
                    resolve(null);
                }
            });
        }
    });
}

/** Serve buffer with standard image response headers. */
function imageResponse(data: ArrayBuffer | Buffer, contentType: string, extra?: Record<string, string>) {
    const body = data instanceof ArrayBuffer ? data : data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
    return new NextResponse(body, {
        headers: {
            'Content-Type': contentType,
            'Cache-Control': CACHE_HEADERS,
            ...extra,
        },
    });
}

// ── Route handler ─────────────────────────────────────────────────────────────

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
        if (parsed.protocol !== 'https:') return new NextResponse(null, { status: 400 });
        if (isPrivateHostname(parsed.hostname)) return new NextResponse(null, { status: 400 });

        const urlKey = 'url_' + safeKey(directUrl);

        // Check disk cache first
        const cached = await readDiskCache(urlKey);
        if (cached) return imageResponse(cached.data, cached.contentType);

        const res = await tryFetch(directUrl);
        if (res) {
            const ct = res.headers.get('content-type') || 'image/png';
            const buffer = Buffer.from(await res.arrayBuffer());
            void writeDiskCache(urlKey, buffer, ct); // fire and forget
            return imageResponse(buffer, ct);
        }

        // Fallback to domain-based lookup
        const hostname   = parsed.hostname;
        const rootDomain = hostname.split('.').slice(-2).join('.');
        const fallback   = await raceFetch([
            `https://unavatar.io/${rootDomain}?fallback=false`,
            `https://icon.horse/icon/${rootDomain}`,
            `https://www.google.com/s2/favicons?domain=${rootDomain}&sz=256`,
        ]);
        if (fallback) {
            const ct = fallback.res.headers.get('content-type') || 'image/png';
            const buffer = Buffer.from(await fallback.res.arrayBuffer());
            void writeDiskCache(urlKey, buffer, ct);
            return imageResponse(buffer, ct);
        }
        return new NextResponse(null, { status: 404 });
    }

    // ── Mode 2: domain → clearbit / icon.horse / google ──────────────────────
    if (!domain || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
        return new NextResponse(null, { status: 400 });
    }
    if (isPrivateHostname(domain)) return new NextResponse(null, { status: 400 });

    const domainKey = 'domain_' + safeKey(domain);

    // ── Disk cache hit → instant response, no network ──
    const cached = await readDiskCache(domainKey);
    if (cached) return imageResponse(cached.data, cached.contentType);

    // ── Cache miss → race external sources ──
    // Note: logo.clearbit.com was shut down in Dec 2023 — do not use it.
    const sources = [
        `https://unavatar.io/${domain}?fallback=false`,
        `https://icon.horse/icon/${domain}`,
        `https://www.google.com/s2/favicons?domain=${domain}&sz=256`,
    ];

    const result = await raceFetch(sources);
    if (result) {
        const ct = result.res.headers.get('content-type') || 'image/png';
        const buffer = Buffer.from(await result.res.arrayBuffer());
        void writeDiskCache(domainKey, buffer, ct); // save for next time
        return imageResponse(buffer, ct, { 'X-Logo-Source': result.url });
    }

    return new NextResponse(null, { status: 404 });
}
