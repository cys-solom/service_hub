'use client';

import Link from 'next/link';

interface AnimatedLogoProps {
    href?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export default function AnimatedLogo({ href = '/', size = 'md', className = '' }: AnimatedLogoProps) {
    const fontSizes: Record<string, string> = { sm: '1.125rem', md: '1.25rem', lg: '1.5rem', xl: '2.25rem' };
    const fs = fontSizes[size];

    const content = (
        <div
            className={`inline-flex items-baseline gap-0 select-none cursor-pointer font-english ${className}`}
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
            <div style={{ position: 'relative' }}>
                <span style={{ fontSize: fs, fontWeight: 900, letterSpacing: '-0.025em', color: '#f9fafb' }}>S</span>
                <span style={{ fontSize: fs, fontWeight: 800, letterSpacing: '-0.025em' }} className="logo-text-flow">ervice</span>
                <span style={{ fontSize: fs, fontWeight: 900, letterSpacing: '-0.025em' }} className="logo-hub-gradient">Hub</span>
                {/* Underline */}
                <div className="logo-underline-gradient" style={{ position: 'absolute', bottom: -4, left: 0, right: 0, height: size === 'xl' ? 4 : size === 'lg' ? 3 : 2.5, borderRadius: 9999 }} />
            </div>
        </div>
    );

    if (href) {
        return <Link href={href} style={{ display: 'inline-flex', textDecoration: 'none' }}>{content}</Link>;
    }
    return content;
}
