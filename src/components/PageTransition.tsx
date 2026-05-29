'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * PageTransition — wraps page content with a smooth fadeUp animation
 * on every route change. Zero dependencies beyond Next.js.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Reset → trigger reflow → add class
    el.classList.remove('page-enter');
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    el.offsetHeight; // force reflow
    el.classList.add('page-enter');
  }, [pathname]);

  return (
    <div ref={ref} className="page-enter">
      {children}
    </div>
  );
}
