import type { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/$/, '');

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl,               lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${baseUrl}/cart`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/contact`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/privacy`,  lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${baseUrl}/terms`,    lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${baseUrl}/refund`,   lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2 },
  ];

  try {
    const res = await fetch(`${baseUrl}/api/products`, { next: { revalidate: 3600 } });
    if (!res.ok) return staticPages;

    const products: Array<{ slug: string; isActive: boolean; updatedAt?: string }> = await res.json();
    const productPages: MetadataRoute.Sitemap = (Array.isArray(products) ? products : [])
      .filter(p => p.isActive)
      .map(p => ({
        url:             `${baseUrl}/product/${p.slug}`,
        lastModified:    p.updatedAt ? new Date(p.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority:        0.8,
      }));

    return [...staticPages, ...productPages];
  } catch {
    return staticPages;
  }
}
