'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CartItem } from '@/lib/types';

interface CartContextType {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (productId: string, variantId: string) => void;
    updateQuantity: (productId: string, variantId: string, quantity: number) => void;
    clearCart: () => void;
    totalPrice: number;
    itemCount: number;
    isDrawerOpen: boolean;
    openDrawer: () => void;
    closeDrawer: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('cart');
        if (saved) {
            try { setItems(JSON.parse(saved)); } catch { setItems([]); }
        }
        setLoaded(true);
    }, []);

    useEffect(() => {
        if (loaded) localStorage.setItem('cart', JSON.stringify(items));
    }, [items, loaded]);

    // Lock body scroll when drawer is open
    useEffect(() => {
        if (isDrawerOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isDrawerOpen]);

    const addItem = useCallback((item: CartItem) => {
        setItems((prev) => {
            const existing = prev.find(
                (i) => i.productId === item.productId && i.variantId === item.variantId
            );
            if (existing) {
                return prev.map((i) =>
                    i.productId === item.productId && i.variantId === item.variantId
                        ? { ...i, quantity: i.quantity + item.quantity }
                        : i
                );
            }
            return [...prev, item];
        });
        setIsDrawerOpen(true);
    }, []);

    const removeItem = useCallback((productId: string, variantId: string) => {
        setItems((prev) => prev.filter((i) => !(i.productId === productId && i.variantId === variantId)));
    }, []);

    const updateQuantity = useCallback((productId: string, variantId: string, quantity: number) => {
        if (quantity <= 0) { removeItem(productId, variantId); return; }
        setItems((prev) =>
            prev.map((i) =>
                i.productId === productId && i.variantId === variantId ? { ...i, quantity } : i
            )
        );
    }, [removeItem]);

    const clearCart = useCallback(() => setItems([]), []);
    const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
    const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            items, addItem, removeItem, updateQuantity, clearCart,
            totalPrice, itemCount, isDrawerOpen, openDrawer, closeDrawer,
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
}
