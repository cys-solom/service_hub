'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';

function TopProgressBar() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPath = useRef(pathname);

  const startProgress = useCallback(() => {
    setProgress(0);
    setVisible(true);

    let current = 0;
    timerRef.current = setInterval(() => {
      current += Math.random() * 12 + 3;
      if (current > 90) current = 90;
      setProgress(current);
    }, 100);
  }, []);

  const completeProgress = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setProgress(100);
    setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 300);
  }, []);

  useEffect(() => {
    if (pathname !== prevPath.current) {
      startProgress();
      const timeout = setTimeout(completeProgress, 200);
      prevPath.current = pathname;
      return () => clearTimeout(timeout);
    }
  }, [pathname, startProgress, completeProgress]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div className="top-progress-container" style={{ opacity: visible ? 1 : 0 }}>
      <div
        className="top-progress-bar"
        style={{ width: `${progress}%` }}
      />
      <div
        className="top-progress-glow"
        style={{ left: `${progress}%` }}
      />
    </div>
  );
}

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const isFirst = useRef(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    el.classList.remove('page-enter');
    el.classList.add('page-exit');

    requestAnimationFrame(() => {
      el.classList.remove('page-exit');
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      el.offsetHeight;
      el.classList.add('page-enter');
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }, [pathname]);

  return (
    <>
      <TopProgressBar />
      <div ref={ref} className="page-enter">
        {children}
      </div>
    </>
  );
}
