'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSettings } from '@/lib/settings-context';
import { initPixel, pixel } from '@/lib/pixel';

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    pixel.pageView();
  }, [pathname, searchParams]);

  return null;
}

export default function MetaPixel() {
  const { metaPixelId, settingsLoaded } = useSettings();

  useEffect(() => {
    if (settingsLoaded && metaPixelId) {
      initPixel(metaPixelId);
    }
  }, [settingsLoaded, metaPixelId]);

  return (
    <Suspense fallback={null}>
      <PageViewTracker />
    </Suspense>
  );
}
