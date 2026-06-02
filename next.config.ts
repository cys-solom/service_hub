import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
      { protocol: 'https', hostname: '**.googleusercontent.com' },
      { protocol: 'https', hostname: 'en.wikipedia.org' },
      { protocol: 'https', hostname: 'i.postimg.cc' },
      { protocol: 'https', hostname: 'i.ibb.co' },
      { protocol: 'https', hostname: 'logo.clearbit.com' },
      { protocol: 'https', hostname: 'icon.horse' },
      { protocol: 'https', hostname: 'www.google.com' },
      { protocol: 'https', hostname: 't3.gstatic.com' },
    ],
  },

  // ── Security headers ──────────────────────────────────────────────────────
  // Applied to all routes. CSP is intentionally omitted here to avoid
  // breaking inline styles and third-party image sources; add it later once
  // the asset inventory is complete.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent the site from being loaded inside an iframe (clickjacking)
          { key: 'X-Frame-Options', value: 'DENY' },
          // Stop browsers from MIME-sniffing the response type
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Control referer information sent with requests
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Disable features not needed by this app
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

