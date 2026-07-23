'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

const KEY = 'sh_wishlist';

export interface WishlistItem {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
  image?: string;
  price?: number;
  accentColor?: string;
}

interface WishlistCtx {
  items: WishlistItem[];
  toggle: (item: WishlistItem) => void;
  isWished: (id: string) => boolean;
  count: number;
}

const Ctx = createContext<WishlistCtx>({
  items: [], toggle: () => {}, isWished: () => false, count: 0,
});

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch { setItems([]); }
  }, []);

  const toggle = useCallback((item: WishlistItem) => {
    setItems(prev => {
      const next = prev.some(i => i.id === item.id)
        ? prev.filter(i => i.id !== item.id)
        : [item, ...prev];
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const isWished = useCallback((id: string) => items.some(i => i.id === id), [items]);

  return (
    <Ctx.Provider value={{ items, toggle, isWished, count: items.length }}>
      {children}
    </Ctx.Provider>
  );
}

export const useWishlist = () => useContext(Ctx);
