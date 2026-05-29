'use client';

import { CSSProperties, useState } from 'react';
import { Package } from 'lucide-react';

interface OptimizedImageProps {
    src: string | undefined | null;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    style?: CSSProperties;
    fallbackIcon?: boolean;
    priority?: boolean;
}

/**
 * Smart image component — uses plain <img> to avoid Next.js forced lazy-loading
 * which causes the Edge/Chrome "[Intervention] Images loaded lazily" warning.
 */
export default function OptimizedImage({
    src,
    alt,
    width = 80,
    height = 80,
    className = '',
    style,
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

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={className}
            style={style}
            onError={() => setError(true)}
            loading={priority ? 'eager' : 'eager'}
            decoding="async"
        />
    );
}
