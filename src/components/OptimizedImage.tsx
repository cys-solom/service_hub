'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Package } from 'lucide-react';

interface OptimizedImageProps {
    src: string | undefined | null;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    fallbackIcon?: boolean;
    priority?: boolean;
}

/**
 * Smart image component that uses Next.js Image for optimization.
 * Handles external URLs, local paths, and provides fallback.
 */
export default function OptimizedImage({
    src,
    alt,
    width = 80,
    height = 80,
    className = '',
    fallbackIcon = true,
    priority = false,
}: OptimizedImageProps) {
    const [error, setError] = useState(false);

    if (!src || error) {
        if (fallbackIcon) {
            return (
                <div className={`flex items-center justify-center ${className}`}>
                    <Package className="w-7 h-7 text-violet-500" />
                </div>
            );
        }
        return null;
    }

    // For SVGs and local paths, use regular img as they don't benefit from optimization
    if (src.endsWith('.svg') || src.startsWith('/')) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={src}
                alt={alt}
                width={width}
                height={height}
                className={className}
                onError={() => setError(true)}
                loading={priority ? 'eager' : 'lazy'}
            />
        );
    }

    // For remote images, use Next.js Image for optimization
    return (
        <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={className}
            onError={() => setError(true)}
            priority={priority}
            quality={80}
            sizes="(max-width: 768px) 40px, 80px"
        />
    );
}
