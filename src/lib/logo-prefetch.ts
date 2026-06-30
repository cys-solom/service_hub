/**
 * Called once at server startup (from instrumentation.ts) to pre-fetch logos
 * for all known product domains and save them to public/logos-cache/.
 * This means users never see a missing logo on first load.
 */

import { promises as fs } from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), 'public', 'logos-cache');
const TIMEOUT_MS = 6000;

const DOMAINS_TO_PREFETCH = [
    'openai.com', 'gemini.google.com', 'claude.ai', 'x.ai', 'perplexity.ai',
    'copilot.microsoft.com', 'mistral.ai', 'deepseek.com', 'midjourney.com',
    'sora.com', 'runwayml.com', 'pika.art', 'lumalabs.ai', 'klingai.com',
    'heygen.com', 'synthesia.io', 'invideo.io', 'fliki.ai', 'veed.io',
    'suno.ai', 'udio.com', 'figma.com', 'obsidian.md', 'jasper.ai',
    'writesonic.com', 'grammarly.com', 'twitter.com', 'slack.com',
    'discord.com', 'zoom.us', 'udemy.com', 'spotify.com', 'netflix.com',
    'youtube.com', 'dropbox.com', 'amazon.com', 'google.com',
    'codeium.com', 'v0.dev', 'bolt.new', 'deepmind.google.com',
    'notebooklm.google.com', 'one.google.com', 'photos.google.com',
];

function safeKey(domain: string) {
    return 'domain_' + domain.toLowerCase().replace(/[^a-z0-9._-]/g, '_').slice(0, 120);
}

const EXT_MAP: Record<string, string> = {
    'image/png': '.png', 'image/jpeg': '.jpg', 'image/svg+xml': '.svg',
    'image/webp': '.webp', 'image/x-icon': '.ico', 'image/gif': '.gif',
};

async function fileExists(filePath: string): Promise<boolean> {
    try { await fs.access(filePath); return true; } catch { return false; }
}

async function fetchLogo(domain: string): Promise<{ buffer: Buffer; ext: string } | null> {
    // Note: logo.clearbit.com was shut down in Dec 2023 — do not use it.
    const sources = [
        `https://unavatar.io/${domain}?fallback=false`,
        `https://icon.horse/icon/${domain}`,
        `https://www.google.com/s2/favicons?domain=${domain}&sz=256`,
    ];
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        for (const url of sources) {
            try {
                const res = await fetch(url, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ServiceHub/1.0)' },
                    signal: controller.signal,
                });
                if (!res.ok) continue;
                const ct = res.headers.get('content-type') || '';
                if (!ct.startsWith('image/') && !ct.includes('svg')) continue;
                const buffer = Buffer.from(await res.arrayBuffer());
                const ext = EXT_MAP[ct.split(';')[0].trim()] || '.png';
                clearTimeout(timer);
                return { buffer, ext };
            } catch { continue; }
        }
    } finally { clearTimeout(timer); }
    return null;
}

export async function prefetchLogos() {
    try {
        await fs.mkdir(CACHE_DIR, { recursive: true });
    } catch { return; }

    // Run in small batches to avoid hammering external services
    const BATCH = 4;
    for (let i = 0; i < DOMAINS_TO_PREFETCH.length; i += BATCH) {
        const batch = DOMAINS_TO_PREFETCH.slice(i, i + BATCH);
        await Promise.allSettled(batch.map(async (domain) => {
            const key = safeKey(domain);
            // Skip if any variant already cached
            for (const ext of ['.png', '.jpg', '.svg', '.webp', '.ico']) {
                if (await fileExists(path.join(CACHE_DIR, key + ext))) return;
            }
            const result = await fetchLogo(domain);
            if (result) {
                await fs.writeFile(path.join(CACHE_DIR, key + result.ext), result.buffer);
            }
        }));
    }
}
