export async function register() {
    // Only run on Node.js server — not in Edge runtime or during build
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { prefetchLogos } = await import('./lib/logo-prefetch');
        // Fire and forget — don't block server startup
        prefetchLogos().catch(() => {});
    }
}
