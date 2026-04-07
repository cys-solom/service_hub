'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface AnimatedLogoProps {
    href?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export default function AnimatedLogo({ href = '/', size = 'md', className = '' }: AnimatedLogoProps) {
    const sizeClasses = {
        sm: 'text-lg',
        md: 'text-xl',
        lg: 'text-2xl',
        xl: 'text-4xl',
    };

    const underlineSizes = {
        sm: 'h-[2px]',
        md: 'h-[2.5px]',
        lg: 'h-[3px]',
        xl: 'h-[4px]',
    };

    const content = (
        <motion.div
            className={`inline-flex items-baseline gap-0 select-none group cursor-pointer font-english ${className}`}
            style={{ fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif' }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
            <div className="relative">
                <span className={`${sizeClasses[size]} font-black tracking-tight text-gray-900 dark:text-white`}>
                    S
                </span>
                <span className={`${sizeClasses[size]} font-extrabold tracking-tight logo-text-flow`}>
                    ervice
                </span>
                <span className={`${sizeClasses[size]} font-black tracking-tight logo-hub-gradient`}>
                    Hub
                </span>

                {/* Animated underline */}
                <motion.div
                    className={`absolute -bottom-1 left-0 right-0 ${underlineSizes[size]} rounded-full logo-underline-gradient`}
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                />

                {/* Hover glow */}
                <div className="absolute -inset-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 logo-glow -z-10" />
            </div>
        </motion.div>
    );

    if (href) {
        return (
            <Link href={href} className="inline-flex no-underline">
                {content}
            </Link>
        );
    }

    return content;
}
