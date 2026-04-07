export interface CartItem {
    productId: string;
    productName: string;
    productSlug: string;
    productImage: string;
    variantId: string;
    variantTitle: string;
    duration: string;
    price: number;
    quantity: number;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    features: string[];
    basePrice: number;
    discount: number;
    isActive: boolean;
    outOfStock: boolean;
    isFeatured: boolean;
    images: string[];
    durationLabel: string;
    categoryId: string;
    orderCount: number;
    category: Category;
    variants: ProductVariant[];
    createdAt: string;
}

export interface ProductVariant {
    id: string;
    productId: string;
    title: string;
    duration: string;
    price: number;
    isActive: boolean;
    outOfStock: boolean;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
}

export interface Order {
    id: string;
    orderCode: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    items: string;
    totalPrice: number;
    status: string;
    notes?: string;
    createdAt: string;
}

export interface Settings {
    id: string;
    storeName: string;
    whatsappPhone: string;
    currency: string;
    seoTitle: string;
    seoDescription: string;
    theme: string;
    heroStat1Value: string;
    heroStat1Label: string;
    heroStat2Value: string;
    heroStat2Label: string;
    heroStat3Value: string;
    heroStat3Label: string;
}
