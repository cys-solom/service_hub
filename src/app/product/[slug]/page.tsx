import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Product, WarrantyOption } from '@/lib/types';
import ProductPageClient from './ProductPageClient';

type Props = { params: Promise<{ slug: string }> };

/* ─── helpers ─────────────────────────────────────────── */
function parseJson<T>(raw: string, fallback: T): T {
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

/* ─── SEO Metadata ─────────────────────────────────────── */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/$/, '');

  try {
    const p = await prisma.product.findUnique({
      where: { slug },
      select: {
        name: true, nameAr: true, description: true, images: true,
        variants: { where: { isActive: true }, select: { price: true }, orderBy: { price: 'asc' }, take: 1 },
      },
    });
    if (!p) return { title: 'Product | Service Hub' };

    const name      = p.name;
    const desc      = p.description?.trim() || `Buy ${name} subscription at the best price. Fast delivery via WhatsApp.`;
    const shortDesc = desc.length > 160 ? desc.slice(0, 157) + '…' : desc;
    const images    = parseJson<string[]>(p.images, []);
    const imageUrl  = images[0] || null;
    const lowestPrice = p.variants[0]?.price;
    const priceStr  = lowestPrice ? ` — From ${lowestPrice}` : '';

    return {
      title:       `${name} | Service Hub${priceStr}`,
      description: shortDesc,
      keywords:    `${name}, ${p.nameAr || name}, digital subscription, buy online, WhatsApp order, Service Hub`,
      alternates:  { canonical: `${baseUrl}/product/${slug}` },
      openGraph: {
        title: `${name} | Service Hub`, description: shortDesc,
        url: `${baseUrl}/product/${slug}`, type: 'website',
        images: imageUrl ? [{ url: imageUrl, width: 800, height: 600, alt: name }] : [],
      },
      twitter: {
        card: imageUrl ? 'summary_large_image' : 'summary',
        title: `${name} | Service Hub`, description: shortDesc,
        images: imageUrl ? [imageUrl] : [],
      },
    };
  } catch {
    return { title: 'Product | Service Hub', description: 'Premium digital subscriptions at the best prices.' };
  }
}

/* ─── Page ─────────────────────────────────────────────── */
export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/$/, '');

  const raw = await prisma.product.findUnique({
    where:   { slug },
    include: {
      category: { select: { id: true, name: true, slug: true, isActive: true } },
      variants: {
        where:   { isActive: true },
        orderBy: { displayOrder: 'asc' },
      },
    },
  });

  if (!raw || !raw.isActive) notFound();

  const isUnavailable = raw.unavailableUntil ? new Date(raw.unavailableUntil) > new Date() : false;
  const images = parseJson<string[]>(raw.images, []);
  const activeVariants = raw.variants;
  const prices = activeVariants.map(v => v.price).filter(p => p > 0);
  const lowPrice  = prices.length ? Math.min(...prices) : null;
  const highPrice = prices.length ? Math.max(...prices) : null;

  const product: Product = {
    id:             raw.id,
    name:           raw.name,
    nameAr:         raw.nameAr || undefined,
    slug:           raw.slug,
    description:    raw.description,
    descriptionAr:  raw.descriptionAr || undefined,
    features:       parseJson<string[]>(raw.features, []),
    featuresAr:     parseJson<string[]>(raw.featuresAr, []),
    basePrice:      raw.basePrice,
    discount:       raw.discount,
    isActive:       raw.isActive,
    outOfStock:     raw.outOfStock || isUnavailable,
    isFeatured:     raw.isFeatured,
    images,
    durationLabel:  raw.durationLabel,
    warrantyOptions: parseJson<WarrantyOption[]>(raw.warrantyOptions, []),
    fullWarranty:   raw.fullWarranty,
    categoryId:     raw.categoryId,
    displayOrder:   raw.displayOrder,
    orderCount:     raw.orderCount,
    accountType:    raw.accountType || 'ready_account',
    warrantyType:   raw.warrantyType || 'none',
    warrantyDuration: raw.warrantyDuration || 0,
    category:       raw.category,
    variants:       raw.variants.map(v => ({
      id:          v.id,
      productId:   v.productId,
      title:       v.title,
      duration:    v.duration,
      price:       v.price,
      warrantyDays: v.warrantyDays,
      isActive:    v.isActive,
      outOfStock:  v.outOfStock,
    })),
    createdAt: raw.createdAt.toISOString(),
  };

  /* ── Related products (same category, max 3) ─ */
  const relatedRaw = raw.categoryId ? await prisma.product.findMany({
    where: {
      categoryId: raw.categoryId,
      isActive:   true,
      id:         { not: raw.id },
    },
    include: {
      variants: { where: { isActive: true }, orderBy: { price: 'asc' }, take: 1 },
    },
    orderBy: { isFeatured: 'desc' },
    take: 3,
  }) : [];

  const relatedProducts = relatedRaw.map(p => ({
    id:    p.id,
    name:  p.name,
    nameAr: p.nameAr || undefined,
    slug:  p.slug,
    images: parseJson<string[]>(p.images, []),
    lowestPrice: p.variants[0]?.price || null,
  }));

  /* ── JSON-LD structured data ─ */
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type':    'Product',
    name:       raw.name,
    description: raw.description || `Buy ${raw.name} subscription at the best price.`,
    image:      images.length ? images : undefined,
    url:        `${baseUrl}/product/${slug}`,
    offers: lowPrice ? {
      '@type':        'AggregateOffer',
      priceCurrency:  'EGP',
      lowPrice:        lowPrice,
      highPrice:       highPrice ?? lowPrice,
      offerCount:      prices.length,
      availability:   raw.outOfStock || isUnavailable
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name:    process.env.NEXT_PUBLIC_STORE_NAME || 'Service Hub',
      },
    } : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductPageClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}
