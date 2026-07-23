import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const alt     = 'Product image';
export const size    = { width: 1200, height: 630 };
export const contentType = 'image/png';

function getAccentColor(name: string): string {
  const lower = name.toLowerCase();
  if (/chatgpt|openai/.test(lower))   return '#10a37f';
  if (/gemini|google/.test(lower))    return '#4285f4';
  if (/claude/.test(lower))           return '#c97040';
  if (/canva/.test(lower))            return '#00c4cc';
  if (/notion/.test(lower))           return '#ffffff';
  if (/spotify/.test(lower))          return '#1db954';
  if (/netflix/.test(lower))          return '#e50914';
  if (/midjourney/.test(lower))       return '#ffffff';
  if (/discord|nitro/.test(lower))    return '#5865f2';
  if (/linkedin/.test(lower))         return '#0077b5';
  return '#a78bfa';
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let name        = 'Product';
  let price       = 0;
  let category    = '';
  let accent      = '#a78bfa';

  try {
    const p = await prisma.product.findUnique({
      where: { slug },
      select: {
        name: true,
        variants: { where: { isActive: true, price: { gt: 0 } }, orderBy: { price: 'asc' }, take: 1, select: { price: true } },
        category: { select: { name: true } },
      },
    });
    if (p) {
      name     = p.name;
      price    = p.variants[0]?.price ?? 0;
      category = p.category?.name ?? '';
      accent   = getAccentColor(p.name);
    }
  } catch { /* fallback to defaults */ }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          background: '#0d0d0d', fontFamily: 'system-ui, sans-serif', position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Accent blob */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 380, height: 380, borderRadius: '50%', background: accent, opacity: 0.12, filter: 'blur(60px)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 260, height: 260, borderRadius: '50%', background: accent, opacity: 0.08, filter: 'blur(50px)', display: 'flex' }} />

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '36px 56px 0', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color: '#000' }}>S</div>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#E8E8E8', letterSpacing: '-0.02em' }}>Service Hub</span>
          {category && (
            <span style={{ marginLeft: 'auto', fontSize: 14, color: '#666', background: 'rgba(255,255,255,0.06)', borderRadius: 99, padding: '4px 14px', border: '1px solid rgba(255,255,255,0.08)' }}>
              {category}
            </span>
          )}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 56px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: accent, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
            Premium Digital Subscription
          </div>
          <div style={{ fontSize: name.length > 30 ? 52 : 68, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.05, maxWidth: 880 }}>
            {name}
          </div>
          {price > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 28 }}>
              <span style={{ fontSize: 18, color: '#666' }}>from</span>
              <span style={{ fontSize: 42, fontWeight: 800, color: accent }}>{price.toFixed(0)}</span>
              <span style={{ fontSize: 22, color: '#666', fontWeight: 600 }}>EGP</span>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 56px 36px', gap: 24 }}>
          {['Fast delivery', 'WhatsApp order', 'Best prices'].map(tag => (
            <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#666' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent, display: 'flex' }} />
              {tag}
            </div>
          ))}
        </div>

        {/* Left accent line */}
        <div style={{ position: 'absolute', left: 0, top: '20%', width: 4, height: '60%', background: `linear-gradient(to bottom, transparent, ${accent}, transparent)`, borderRadius: '0 4px 4px 0', display: 'flex' }} />
      </div>
    ),
    { ...size }
  );
}
