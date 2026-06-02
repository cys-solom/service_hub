'use client';

import { useMemo, useState } from 'react';

// ── Logo sources: routed through server-side proxy ────────────────────────
// All requests go to /api/logo which fetches externally server-side.
// This avoids browser tracking-prevention blocks and ERR_NAME_NOT_RESOLVED.
//
//  ?domain=openai.com  → proxy tries clearbit / icon.horse / google
//  ?url=https://...    → proxy fetches the exact image URL
//  /relative/path      → served directly (same-origin assets)

function buildSources(domain: string, extras: string[] = []): string[] {
  const sources: string[] = [];

  for (const e of extras) {
    if (e.startsWith('/')) {
      // Same-origin asset — use directly
      sources.push(e);
    } else {
      // External direct URL — proxy it via ?url=
      sources.push(`/api/logo?url=${encodeURIComponent(e)}`);
    }
  }

  // Primary domain-based brand logo lookup
  sources.push(`/api/logo?domain=${domain}`);

  return Array.from(new Set(sources));
}

// Official domains for each product — used to get the best logo
const PRODUCT_DOMAINS: Record<string, { domain: string; extras?: string[] }> = {
  // ── AI Chat & Text ──
  chatgpt:     { domain: 'openai.com' },
  openai:      { domain: 'openai.com' },
  gemini:      { domain: 'gemini.google.com' },
  claude:      { domain: 'claude.ai' },
  grok:        { domain: 'x.ai' },
  perplexity:  { domain: 'perplexity.ai' },
  copilot:     { domain: 'copilot.microsoft.com' },
  meta:        { domain: 'meta.ai' },
  llama:       { domain: 'llama.meta.com' },
  mistral:     { domain: 'mistral.ai' },
  deepseek:    { domain: 'deepseek.com' },
  qwen:        { domain: 'qwenlm.github.io' },

  // ── AI Image & Video ──
  midjourney:  { domain: 'midjourney.com' },
  dalle:       { domain: 'openai.com' },
  sora:        { domain: 'sora.com' },
  runway:      { domain: 'runwayml.com' },
  pika:        { domain: 'pika.art' },
  luma:        { domain: 'lumalabs.ai' },
  kling:       { domain: 'klingai.com' },
  heygen:      { domain: 'heygen.com' },
  synthesia:   { domain: 'synthesia.io' },
  descript:    { domain: 'descript.com' },
  invideo:     { domain: 'invideo.io' },
  fliki:       { domain: 'fliki.ai' },
  veed:        { domain: 'veed.io' },

  // ── AI Audio ──
  elevenlabs:  { domain: 'elevenlabs.io' },
  suno:        { domain: 'suno.ai' },
  udio:        { domain: 'udio.com' },
  mubert:      { domain: 'mubert.com' },
  wispr:       { domain: 'wisprflow.ai' },

  // ── AI Coding ──
  cursor:      { domain: 'cursor.com' },
  github:      { domain: 'github.com' },
  replit:      { domain: 'replit.com' },
  bolt:        { domain: 'bolt.new' },
  lovable:     { domain: 'lovable.dev' },
  'v0':        { domain: 'v0.dev' },
  windsurf:    { domain: 'codeium.com' },
  warp:        { domain: 'warp.dev' },
  'magic patterns': { domain: 'magicpatterns.com' },
  framer:      { domain: 'framer.com' },
  n8n:         { domain: 'n8n.io' },
  factory:     { domain: 'factory.ai' },
  manus:       { domain: 'manus.im' },

  // ── Design & Creative ──
  canva:       { domain: 'canva.com' },
  figma:       { domain: 'figma.com' },
  adobe:       { domain: 'adobe.com' },
  capcut:      { domain: 'capcut.com' },
  picsart:     { domain: 'picsart.com' },
  gamma:       { domain: 'gamma.app' },

  // ── Productivity & Office ──
  notion:      { domain: 'notion.so' },
  microsoft:   { domain: 'microsoft.com' },
  office:      { domain: 'microsoft.com' },
  obsidian:    { domain: 'obsidian.md' },
  granola:     { domain: 'granola.ai' },
  linear:      { domain: 'linear.app' },
  chatprd:     { domain: 'chatprd.ai' },
  gumloop:     { domain: 'gumloop.com' },

  // ── Research & Knowledge ──
  quillbot:    { domain: 'quillbot.com' },
  jasper:      { domain: 'jasper.ai' },
  writesonic:  { domain: 'writesonic.com' },
  grammarly:   { domain: 'grammarly.com' },
  mobbin:      { domain: 'mobbin.com' },

  // ── Professional & Social ──
  linkedin:    { domain: 'linkedin.com' },
  twitter:     { domain: 'twitter.com' },
  slack:       { domain: 'slack.com' },
  discord:     { domain: 'discord.com' },
  zoom:        { domain: 'zoom.us' },

  // ── Infrastructure & Dev Tools ──
  supabase:    { domain: 'supabase.com' },
  railway:     { domain: 'railway.app' },
  posthog:     { domain: 'posthog.com' },

  // ── Education ──
  coursera:    { domain: 'coursera.org' },
  udemy:       { domain: 'udemy.com' },

  // ── Entertainment ──
  spotify:     { domain: 'spotify.com' },
  netflix:     { domain: 'netflix.com' },
  youtube:     { domain: 'youtube.com' },

  // ── Other ──
  dropbox:     { domain: 'dropbox.com' },
  amazon:      { domain: 'amazon.com' },
  google:      { domain: 'google.com' },

  // ── Custom / Service Hub products ──
  antigravity:     { domain: 'antigravity.ai', extras: ['/logos/antigravity.png'] },
  'nano banana':   { domain: 'nano.one' },
  'omni ai':       { domain: 'omni.us' },
  'neural express': { domain: 'neural.love' },
  'ask youtube':   { domain: 'youtube.com' },
  'google pics':   { domain: 'photos.google.com' },
  'notebooklm':    { domain: 'notebooklm.google.com' },
  'gemini flash':  { domain: 'gemini.google.com' },
  'gemini spark':  { domain: 'gemini.google.com' },
  'gemini ai':     { domain: 'gemini.google.com' },
  'veo':           { domain: 'deepmind.google.com' },
  'veo 3':         { domain: 'deepmind.google.com' },
  'google one':    { domain: 'one.google.com' },
  'google 5tb':    { domain: 'one.google.com' },
  'google storage': { domain: 'one.google.com' },
};

function resolveSources(productName: string, dbImage?: string | null): string[] {
  const lower = productName.toLowerCase().trim();
  const sources: string[] = [];

  // Sort keys by length DESC so longer/more specific keys match first
  const sortedKeys = Object.keys(PRODUCT_DOMAINS).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (lower.includes(key)) {
      const { domain, extras = [] } = PRODUCT_DOMAINS[key];
      sources.push(...buildSources(domain, extras));
      break; // take first match only (longest key wins)
    }
  }

  // If no match, derive domain from product name itself
  if (sources.length === 0) {
    const firstWord = lower.replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/)[0];
    if (firstWord && firstWord.length > 2) {
      sources.push(`https://logo.clearbit.com/${firstWord}.com`);
      sources.push(`https://icon.horse/icon/${firstWord}.com`);
      sources.push(`https://www.google.com/s2/favicons?domain=${firstWord}.com&sz=256`);
      sources.push(`https://icon.horse/icon/${firstWord}.ai`);
    }
  }

  // DB image (non-svg) appended after logo sources as additional fallback
  if (dbImage && !dbImage.endsWith('.svg')) sources.push(dbImage);

  return Array.from(new Set(sources));
}

// ── Letter avatar color palette ──────────────────────────────
const PALETTE = ['#9333ea', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#f97316', '#06b6d4', '#8b5cf6', '#0ea5e9'];
function nameColor(name: string) {
  const n = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return PALETTE[n % PALETTE.length];
}

// ── Props ────────────────────────────────────────────────────
interface ProductLogoProps {
  productName: string;
  dbImage?: string | null;
  size?: number;
  className?: string;
  /** 'transparent' = no background (like service-hub), 'white' = white bg box */
  bg?: 'transparent' | 'white' | 'none';
  /** true = defer loading for below-the-fold logos (default: false = eager for first cards) */
  lazy?: boolean;
}

export default function ProductLogo({
  productName,
  dbImage,
  size = 48,
  className = '',
  bg = 'white',
  lazy = false,
}: ProductLogoProps) {
  const sources = useMemo(() => resolveSources(productName, dbImage), [productName, dbImage]);
  const [step, setStep] = useState(0);

  // ── Initials fallback ──
  const initials = productName
    .trim()
    .replace(/[^a-zA-Z\u0600-\u06FF\s]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  const color = nameColor(productName);

  const wrapStyle: React.CSSProperties = {
    width: size,
    height: size,
    flexShrink: 0,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: bg === 'white' ? '#ffffff' : 'transparent',
    borderRadius: '22%',
  };

  // All sources exhausted → show letter avatar
  if (step >= sources.length) {
    return (
      <div
        className={className}
        aria-label={productName}
        role="img"
        style={{
          ...wrapStyle,
          background: `linear-gradient(135deg, ${color}, ${color}88)`,
          borderRadius: '22%',
        }}
      >
        <span style={{
          fontSize: size * 0.38,
          fontWeight: 900,
          color: '#fff',
          lineHeight: 1,
          userSelect: 'none',
        }}>
          {initials}
        </span>
      </div>
    );
  }

  return (
    <div
      className={className}
      aria-label={`${productName} logo`}
      role="img"
      style={wrapStyle}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={sources[step]}
        src={sources[step]}
        alt={`${productName} logo`}
        loading={lazy ? 'lazy' : 'eager'}
        decoding="async"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
          borderRadius: 'inherit',
        }}
        onError={() => setStep((s) => s + 1)}
      />
    </div>
  );
}
