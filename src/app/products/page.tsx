import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { Product, WarrantyOption } from '@/lib/types';
import ProductsPageClient from './ProductsPageClient';
import ProductsLoading from './loading';

function parseJson<T>(raw: string, fallback: T): T {
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const rawProducts = await prisma.product.findMany({
    where:   { isActive: true },
    include: {
      category: { select: { id: true, name: true, slug: true, isActive: true } },
      variants: { where: { isActive: true }, orderBy: { displayOrder: 'asc' } },
    },
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
  });

  const now = new Date();
  const products: Product[] = rawProducts
    .filter(p => !p.unavailableUntil || new Date(p.unavailableUntil) <= now)
    .map(p => ({
      id:             p.id,
      name:           p.name,
      nameAr:         p.nameAr || undefined,
      slug:           p.slug,
      description:    p.description,
      descriptionAr:  p.descriptionAr || undefined,
      features:       parseJson<string[]>(p.features, []),
      featuresAr:     parseJson<string[]>(p.featuresAr, []),
      basePrice:      p.basePrice,
      discount:       p.discount,
      isActive:       p.isActive,
      outOfStock:     p.outOfStock,
      isFeatured:     p.isFeatured,
      images:         parseJson<string[]>(p.images, []),
      durationLabel:  p.durationLabel,
      warrantyOptions: parseJson<WarrantyOption[]>(p.warrantyOptions, []),
      fullWarranty:   p.fullWarranty,
      categoryId:     p.categoryId,
      displayOrder:   p.displayOrder,
      orderCount:     p.orderCount,
      category:       p.category,
      variants:       p.variants.map(v => ({
        id:          v.id,
        productId:   v.productId,
        title:       v.title,
        duration:    v.duration,
        price:       v.price,
        warrantyDays: v.warrantyDays,
        isActive:    v.isActive,
        outOfStock:  v.outOfStock,
      })),
      createdAt: p.createdAt.toISOString(),
    }));

  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsPageClient products={products} />
    </Suspense>
  );
}
