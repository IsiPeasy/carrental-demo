'use client';

// Photo placeholder slot. public/media/ stays empty until the client supplies
// the real photos (see README "Slot foto"). Renders an elegant gradient in the
// active theme tokens, the real caption, and a small "[foto cliente]" tag.

import type { CSSProperties, ReactNode } from 'react';
import { DELIVERIES, carById, carName, cityById } from '@/lib/data';
import { useT } from '@/lib/i18n';

export interface PhotoProps {
  slot: string;
  /** override caption (defaults to the delivery: place · month · car) */
  caption?: ReactNode;
  showCaption?: boolean;
  className?: string;
  style?: CSSProperties;
  /** aspect ratio, e.g. "4/5" */
  ratio?: string;
  /** visual variant of the gradient */
  tone?: 'accent' | 'ink' | 'surface';
  children?: ReactNode;
}

export function deliveryCaption(slot: string, t: ReturnType<typeof useT>) {
  const d = DELIVERIES.find((x) => x.slot === slot);
  if (!d) return null;
  const car = carById(d.carId);
  return {
    place: d.place,
    city: cityById(d.cityId),
    month: `${t.dict.common.months[d.month.month - 1]} ${d.month.year}`,
    car: car ? carName(car) : '',
  };
}

export default function Photo({
  slot,
  caption,
  showCaption = true,
  className = '',
  style,
  ratio = '4/3',
  tone = 'accent',
  children,
}: PhotoProps) {
  const t = useT();
  const c = deliveryCaption(slot, t);
  const grad =
    tone === 'ink'
      ? 'linear-gradient(160deg, color-mix(in oklab, var(--color-ink) 88%, var(--color-accent)) 0%, var(--color-ink) 100%)'
      : tone === 'surface'
        ? 'linear-gradient(160deg, var(--color-surface) 0%, color-mix(in oklab, var(--color-line) 70%, var(--color-surface)) 100%)'
        : 'linear-gradient(160deg, color-mix(in oklab, var(--color-accent) 70%, var(--color-bg)) 0%, color-mix(in oklab, var(--color-accent) 35%, var(--color-ink)) 100%)';
  const dark = tone !== 'surface';
  return (
    <figure className={`relative m-0 overflow-hidden rounded-theme ${className}`} style={{ aspectRatio: ratio, ...style }} data-slot={slot}>
      <div className="absolute inset-0" style={{ background: grad }} aria-hidden />
      <div
        className="absolute inset-0 opacity-30 mix-blend-overlay"
        aria-hidden
        style={{
          background:
            'radial-gradient(120% 80% at 20% 10%, rgba(255,255,255,.55), transparent 60%), radial-gradient(90% 60% at 90% 100%, rgba(0,0,0,.5), transparent 70%)',
        }}
      />
      {children && <div className="absolute inset-0">{children}</div>}
      <span
        className="absolute right-2 top-2 rounded-theme px-1.5 py-0.5 font-mono text-[10px] tracking-wide"
        style={{ background: 'rgba(0,0,0,.35)', color: 'rgba(255,255,255,.85)' }}
      >
        {t('photo.client')}
      </span>
      {showCaption && (caption ?? c) && (
        <figcaption
          className="absolute inset-x-0 bottom-0 p-3 text-sm"
          style={{ color: dark ? 'rgba(255,255,255,.94)' : 'var(--color-ink)', background: dark ? 'linear-gradient(transparent, rgba(0,0,0,.45))' : undefined }}
        >
          {caption ?? (
            <>
              <span className="font-display italic">{c!.place}</span>
              <span className="opacity-80"> · {c!.month}</span>
              <span className="block text-xs opacity-80">{c!.car}</span>
            </>
          )}
        </figcaption>
      )}
    </figure>
  );
}
