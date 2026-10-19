'use client';

// Small building blocks shared by the itinerary components.

import type { KeyboardEvent, ReactNode } from 'react';
import { useT } from '@/lib/i18n';

export function Kicker({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`itin-kicker ${className}`}>
      <span aria-hidden className="itin-kicker-dot" />
      {children}
    </p>
  );
}

export function SectionHead({
  id,
  kicker,
  title,
  lead,
  aside,
}: {
  id: string;
  kicker: string;
  title: string;
  lead?: string;
  aside?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <Kicker>{kicker}</Kicker>
        <h2 id={id} className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h2>
        {lead && <p className="mt-2 text-ink-2">{lead}</p>}
      </div>
      {aside}
    </header>
  );
}

/** Arrow-key navigation inside a radiogroup / toolbar of buttons. */
export function rovingKeys(e: KeyboardEvent<HTMLElement>, selector = '[role="radio"]', select = true) {
  const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
  if (!keys.includes(e.key)) return;
  const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => !(el as HTMLButtonElement).disabled,
  );
  const i = items.indexOf(document.activeElement as HTMLElement);
  if (i < 0) return;
  e.preventDefault();
  let n = i;
  if (e.key === 'Home') n = 0;
  else if (e.key === 'End') n = items.length - 1;
  else n = (i + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
  items[n].focus();
  if (select) items[n].click();
}

export interface ChipOption<T extends string> {
  value: T;
  label: ReactNode;
  sub?: ReactNode;
  disabled?: boolean;
}

/** Single-choice chips as an ARIA radiogroup with roving tabindex. */
export function RadioChips<T extends string>({
  label,
  value,
  options,
  onChange,
  className = '',
  chipClassName = '',
  labelHidden = false,
}: {
  label: string;
  value: T | null;
  options: ChipOption<T>[];
  onChange: (v: T) => void;
  className?: string;
  chipClassName?: string;
  labelHidden?: boolean;
}) {
  const focusable = options.some((o) => o.value === value) ? value : options.find((o) => !o.disabled)?.value;
  return (
    <div role="radiogroup" aria-label={label} onKeyDown={(e) => rovingKeys(e)} className={`flex flex-wrap gap-2 ${className}`}>
      {!labelHidden && <span className="sr-only">{label}</span>}
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          tabIndex={o.value === focusable ? 0 : -1}
          disabled={o.disabled}
          onClick={() => onChange(o.value)}
          className={`itin-chip ${chipClassName}`}
        >
          <span>{o.label}</span>
          {o.sub && <span className="itin-chip-sub">{o.sub}</span>}
        </button>
      ))}
    </div>
  );
}

/** Multi/filter chips (aria-pressed). */
export function ToggleChip({
  pressed,
  onClick,
  children,
  sub,
  className = '',
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
  sub?: ReactNode;
  className?: string;
}) {
  return (
    <button type="button" aria-pressed={pressed} onClick={onClick} className={`itin-chip ${className}`}>
      {pressed && <CheckIcon />}
      <span>{children}</span>
      {sub && <span className="itin-chip-sub">{sub}</span>}
    </button>
  );
}

export function CheckIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8.5l3.2 3L13 4.5" />
    </svg>
  );
}

export function Arrow({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

/** Line icons for the orchestration timeline and services. */
export function GlyphIcon({ name, className = 'h-5 w-5' }: { name: string; className?: string }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const d: Record<string, ReactNode> = {
    jet: <path d="M2 13.5l7-2.2 4.5 4.7 1.6-.6-2.4-5.6 5-1.6c1.3-.4 2-1.4 1.6-2.2-.4-.8-1.6-1-2.9-.6l-5 1.6L8 2.6l-1.6.4 1.8 5.8-4.6 1.4-1.8-1.6-1.2.4 1.4 4.5z" {...common} />,
    vip: (
      <g {...common}>
        <circle cx="10" cy="6.5" r="3" />
        <path d="M4 17c.7-3.2 3-5 6-5s5.3 1.8 6 5" />
      </g>
    ),
    car: (
      <g {...common}>
        <path d="M2.5 13.5v-2.2c0-.8.5-1.4 1.2-1.6L6 9l2-2.6c.4-.5 1-.8 1.6-.8h3.2c.7 0 1.3.3 1.6.9L16 9l1 .3c.7.2 1 .8 1 1.5v2.7" />
        <circle cx="6" cy="14" r="1.6" />
        <circle cx="14.5" cy="14" r="1.6" />
      </g>
    ),
    yacht: (
      <g {...common}>
        <path d="M2 13.5h16l-2 3H4z" />
        <path d="M10 3v9M10 4l5 7h-5" />
      </g>
    ),
    check: <path d="M4 10.5l3.5 3.5L16 5.5" {...common} />,
  };
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden>
      {d[name] ?? d.check}
    </svg>
  );
}

/** Brand monogram from i18n (`brand.monogram`), falling back to the initials of `brand.name`. */
export function useMonogram(): string {
  const t = useT();
  const m = t('brand.monogram');
  if (m !== 'brand.monogram') return m;
  return t('brand.name')
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function Monogram({ className = 'itin-logo' }: { className?: string }) {
  const m = useMonogram();
  return (
    <span className={className} aria-hidden>
      {m}
    </span>
  );
}
