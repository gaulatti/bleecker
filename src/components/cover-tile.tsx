'use client';

import React from 'react';

import { cn } from '../utils/cn';

export type CoverTileSize = 'sm' | 'md' | 'lg' | 'fill';
export type CoverTileRatio = '1:1' | '16:9';

export interface CoverTileProps {
  /** The accessible name of the tile (`alt` for the image, `aria-label` for the generated art). */
  label: string;
  /** A short kind chip over the art, for example "Song", "Clip" or "Scene". */
  kind?: string;
  /** An optional corner badge, for example an on-air marker. */
  badge?: React.ReactNode;
  className?: string;
  /** The art: an image URL. The component never fetches on its own; the caller supplies the address. */
  src?: string;
  /** A video poster, used when there is no image. */
  posterSrc?: string;
  /** Names the generated art. The same seed gives the same art on every render and machine. */
  seed: string;
  size?: CoverTileSize;
  ratio?: CoverTileRatio;
}

/** Sizes in pixels for the fixed box; `fill` takes the parent's width and keeps the ratio. */
const sizePx: Record<Exclude<CoverTileSize, 'fill'>, number> = { sm: 40, md: 64, lg: 120 };

/**
 * The generated art's palette: fixed colours, the same in both themes, so the fallback's contrast is
 * fixed too. Every stop keeps white initials at least 4.5:1 (checked by the unit tests). The seed
 * picks one pair, so the same seed always gets the same pair, on every render and machine.
 */
export const coverPalette = [
  ['#2c5784', '#1a374d'],
  ['#694f5d', '#4a3642'],
  ['#76323f', '#8a5735'],
  ['#1a374d', '#2c5784'],
] as const;

/** A stable, non-cryptographic hash: 32-bit FNV-1a over the seed's UTF-16 code units. */
export function stableHash(seed: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/** The fallback's pair of colours and its initials for a seed. Pure: the same seed, the same result. */
export function coverFallback(seed: string): { from: string; to: string; initials: string } {
  const hash = stableHash(seed);
  const [from, to] = coverPalette[hash % coverPalette.length];
  const initials = seed
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
  return { from, to, initials };
}

export function CoverTile({ badge, className, kind, label, posterSrc, ratio = '1:1', seed, size = 'md', src }: CoverTileProps) {
  // The failed address is remembered, not a flag: a new src or poster gets its own chance to load.
  const [brokenUrl, setBrokenUrl] = React.useState<string | undefined>(undefined);
  const address = src ?? posterSrc;
  const url = address && address !== brokenUrl ? address : undefined;
  const { from, to, initials } = coverFallback(seed);
  const box = size === 'fill' ? { width: '100%' } : { width: sizePx[size], height: ratio === '1:1' ? sizePx[size] : Math.round((sizePx[size] * 9) / 16) };
  const aspect = ratio === '16:9' ? '16 / 9' : '1 / 1';

  return (
    <div
      className={cn('relative shrink-0 overflow-hidden rounded-[var(--radius-card)] shadow-sm', className)}
      style={{ ...box, aspectRatio: size === 'fill' ? aspect : undefined }}
      data-cover-tile
    >
      {url ? (
        <img
          src={url}
          alt={label}
          loading='lazy'
          decoding='async'
          className='h-full w-full object-cover'
          onError={() => setBrokenUrl(url)}
        />
      ) : (
        <div
          role='img'
          aria-label={label}
          className='flex h-full w-full items-center justify-center font-semibold text-white'
          style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
        >
          <span aria-hidden='true' className={cn('tabular-nums', size === 'sm' ? 'text-xs' : 'text-lg')} data-initials>
            {initials}
          </span>
        </div>
      )}
      {kind ? (
        <span className='absolute left-1.5 top-1.5 rounded-full bg-black/60 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white'>
          {kind}
        </span>
      ) : null}
      {badge ? <span className='absolute bottom-1.5 right-1.5'>{badge}</span> : null}
    </div>
  );
}
