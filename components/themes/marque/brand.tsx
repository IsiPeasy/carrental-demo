'use client';

// Marque — brand data (accent per marque, flagship car) + BrandMark + BrandScope.
// The brand → accent mapping is DATA: it drives CSS variables (BrandScope)
// and the hex colours handed to Car3D/CarSilhouette (which need hex, not vars).

import type { CSSProperties, HTMLAttributes, KeyboardEvent, ReactNode } from 'react';
import { FLEET, brandBySlug, carById, carsOfBrand, type BrandSlug, type Car } from '@/lib/data';
import manifest from './brands-manifest.json';

export interface BrandStyle {
  /** fills: buttons, bars, active states */
  accent: string;
  accent2: string;
  /** text on `accent` (AA) */
  onAccent: string;
  /** accent usable as text / focus ring on white & #F4F4F4 (AA) */
  ink: string;
  /** Car3D key light tint (a light-emitting colour, never black) */
  light: string;
}

export const NEUTRAL_STYLE: BrandStyle = {
  accent: '#0B0B0B',
  accent2: '#6A6A6A',
  onAccent: '#FFFFFF',
  ink: '#0B0B0B',
  light: '#FFFFFF',
};

export const BRAND_STYLE: Record<BrandSlug, BrandStyle> = {
  ferrari: { accent: '#D40000', accent2: '#FFD100', onAccent: '#FFFFFF', ink: '#C00000', light: '#FF7A6E' },
  lamborghini: { accent: '#D4A21B', accent2: '#0B0B0B', onAccent: '#0B0B0B', ink: '#7A5C00', light: '#F2CF72' },
  porsche: { accent: '#101010', accent2: '#B4B6B8', onAccent: '#FFFFFF', ink: '#101010', light: '#E2E5E8' },
  'mercedes-amg': { accent: '#000000', accent2: '#A3A8AD', onAccent: '#FFFFFF', ink: '#000000', light: '#D3D8DD' },
  'mercedes-benz': { accent: '#1C1D1F', accent2: '#B9BDC2', onAccent: '#FFFFFF', ink: '#1C1D1F', light: '#E4E7EA' },
  'land-rover': { accent: '#005A2B', accent2: '#C9B98E', onAccent: '#FFFFFF', ink: '#005A2B', light: '#8FD1A8' },
  abarth: { accent: '#D0021B', accent2: '#0B0B0B', onAccent: '#FFFFFF', ink: '#B80016', light: '#FF6B76' },
};

/** Reference car per marque (falls back to the first car of the brand). */
const FLAGSHIP: Partial<Record<BrandSlug, string>> = {
  ferrari: 'f8-spider',
  lamborghini: 'huracan-evo-spyder',
  porsche: '911-gt3',
  'mercedes-amg': 'g63',
  'mercedes-benz': 'v-class',
  'land-rover': 'rr-sport-sv',
  abarth: 'abarth-695',
};

export const brandStyle = (slug?: BrandSlug | null): BrandStyle => (slug ? BRAND_STYLE[slug] : NEUTRAL_STYLE);

export function flagshipOf(slug: BrandSlug): Car {
  return carById(FLAGSHIP[slug]) ?? carsOfBrand(slug)[0] ?? FLEET[0];
}

/** CSS variables for a brand scope. */
export function brandVars(slug?: BrandSlug | null): CSSProperties {
  const s = brandStyle(slug);
  return {
    '--color-accent': s.accent,
    '--color-accent-2': s.accent2,
    '--m-on': s.onAccent,
    '--m-ink': s.ink,
  } as CSSProperties;
}

/** Container that re-tints everything inside with the brand accent. */
export function BrandScope({
  brand,
  children,
  className = '',
  style,
  ...rest
}: { brand?: BrandSlug | null; children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-brand={brand ?? 'none'} className={className} style={{ ...brandVars(brand), ...style }} {...rest}>
      {children}
    </div>
  );
}

// ——— BrandMark ———
const AVAILABLE = new Set<string>(manifest.available as string[]);
export const hasLogo = (slug: BrandSlug) => AVAILABLE.has(slug);

export interface BrandMarkProps {
  slug: BrandSlug;
  /** monochrome (marquee) */
  mono?: boolean;
  /** scale the wordmark to fill the parent width (capped by --m-max) */
  fit?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Official logo from public/brands/{slug}.svg when the file was placed by hand
 * (see scripts/brands-manifest.mjs); otherwise the brand name typeset in the
 * display face. Logos are never drawn in code.
 */
export default function BrandMark({ slug, mono = false, fit = false, className = '', style }: BrandMarkProps) {
  const name = brandBySlug(slug).name;
  if (AVAILABLE.has(slug)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/brands/${slug}.svg`}
        alt={name}
        draggable={false}
        className={`m-mark-img ${fit ? 'm-mark-fit' : ''} ${mono ? 'm-mark-mono' : ''} ${className}`}
        style={style}
      />
    );
  }
  const word = (
    <span
      className={`m-wordmark ${fit ? 'm-wordmark-fit' : ''} ${mono ? 'm-mono-text' : ''} ${className}`}
      style={{ '--m-n': name.length, ...style } as CSSProperties}
    >
      {name}
    </span>
  );
  return fit ? <span className="m-fitbox">{word}</span> : word;
}

// ——— keyboard helpers ———
/** Arrow / Home / End navigation for a radiogroup or tablist (selection follows focus). */
export function rovingKeyNav(e: KeyboardEvent<HTMLElement>, role: 'radio' | 'tab' = 'radio') {
  const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
  if (step == null && e.key !== 'Home' && e.key !== 'End') return;
  const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(`[role="${role}"]:not([disabled])`));
  const i = items.indexOf(document.activeElement as HTMLElement);
  if (i < 0 || !items.length) return;
  e.preventDefault();
  const n = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : (i + (step ?? 0) + items.length) % items.length;
  items[n].focus();
  items[n].click();
}

/** tabIndex for roving focus: the checked item, or the first one when none is. */
export const rovingTab = (checked: boolean, index: number, anyChecked: boolean) =>
  checked || (!anyChecked && index === 0) ? 0 : -1;
