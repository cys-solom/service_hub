import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/$/, '');

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl,               lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${baseUrl}/contact`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/privacy`,  lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${baseUrl}/terms`,    lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${baseUrl}/refund`,   lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2 },
  ];

  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        select: { slug: true, isFeatured: true, orderCount: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.category.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    const categoryPages: MetadataRoute.Sitemap = categories.map(c => ({
      url:             `${baseUrl}/products?category=${c.slug}`,
      lastModified:    c.updatedAt,
      changeFrequency: 'weekly' as const,
      priority:        0.7,
    }));

    const productPages: MetadataRoute.Sitemap = products.map(p => ({
      url:             `${baseUrl}/product/${p.slug}`,
      lastModified:    p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority:        p.isFeatured ? 0.9 : p.orderCount > 10 ? 0.8 : 0.7,
    }));

    return [...staticPages, ...categoryPages, ...productPages];
  } catch {
    return staticPages;
  }
}
