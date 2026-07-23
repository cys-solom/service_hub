'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSettings } from '@/lib/settings-context';
import { initPixel, pixel } from '@/lib/pixel';

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname.startsWith('/admin')) return;
    pixel.pageView();
  }, [pathname, searchParams]);

  return null;
}

export default function MetaPixel() {
  const { metaPixelId, settingsLoaded } = useSettings();
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  useEffect(() => {
    // Never load the Pixel script on admin pages — it would track the store
    // owner's own dashboard clicks (status changes, edits, etc.) as if they
    // were customer behavior, and Meta's automatic button-click detection
    // would fire on every admin UI button.
    if (settingsLoaded && metaPixelId && !isAdmin) {
      initPixel(metaPixelId);
    }
  }, [settingsLoaded, metaPixelId, isAdmin]);

  if (isAdmin) return null;

  return (
    <Suspense fallback={null}>
      <PageViewTracker />
    </Suspense>
  );
}
