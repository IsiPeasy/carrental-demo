'use client';

import Link from 'next/link';
import CarSilhouette from '@/components/CarSilhouette';
import { useStyleHref } from '@/components/ThemeProvider';
import { FLEET, brandBySlug, carName } from '@/lib/data';
import { useT } from '@/lib/i18n';
import type { FleetSectionProps } from '@/lib/themes';
import { useBuilder } from '@/lib/store';
import { useDailyRate, useFleetFilters } from '@/components/builder/kit';

export function FilterChips<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | 'all';
  options: { value: T; label: string }[];
  onChange: (v: T | 'all') => void;
}) {
  const t = useT();
  const all = [{ value: 'all' as const, label: t('fleet.all') }, ...options];
  return (
    <fieldset className="flex flex-wrap items-center gap-2">
      <legend className="label-caps mb-2 w-full text-ink-2">{label}</legend>
      {all.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-theme border px-3 py-1.5 text-sm transition-colors ${
            value === o.value ? 'border-accent bg-accent text-on-accent' : 'border-line hover:border-ink-2'
          }`}
        >
          {o.label}
        </button>
      ))}
    </fieldset>
  );
}

export default function FleetSection({ variant }: FleetSectionProps) {
  const t = useT();
  const href = useStyleHref();
  const rate = useDailyRate();
  const setCar = useBuilder((s) => s.setCar);
  const f = useFleetFilters();
  const cars = variant === 'home' ? FLEET.slice(0, 6) : f.cars;
  return (
    <section aria-labelledby="h-fleet" className={variant === 'catalog' ? 'mx-auto max-w-7xl px-4 py-12 sm:px-6' : ''}>
      <h2 id="h-fleet" className="font-display text-3xl sm:text-4xl">{t('fleet.title')}</h2>
      <p className="mt-2 text-ink-2">{t('fleet.lead')}</p>
      {variant === 'catalog' && (
        <div className="mt-8 space-y-4">
          <FilterChips label={t('fleet.category')} value={f.category} onChange={f.setCategory} options={f.categories.map((c) => ({ value: c, label: t(`categories.${c}`) }))} />
          <FilterChips label={t('fleet.brand')} value={f.brand} onChange={f.setBrand} options={f.brands.map((b) => ({ value: b.slug, label: b.name }))} />
          <p className="text-sm text-ink-2" aria-live="polite">{t('fleet.count', { n: cars.length })}</p>
        </div>
      )}
      {cars.length === 0 ? (
        <p className="mt-8 text-ink-2">{t('fleet.none')}</p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((c) => (
            <li key={c.id} className="flex flex-col rounded-theme border border-line bg-surface p-5">
              <CarSilhouette bodyType={c.bodyType} color={c.color.hex} className="h-28 w-full" />
              <p className="mt-4 text-xs text-ink-2">{brandBySlug(c.brand).name} · {t(`categories.${c.category}`)}</p>
              <h3 className="font-display text-xl">{c.model}</h3>
              <p className="text-sm text-ink-2">{c.specs ? `${c.specs.engine} · ${c.specs.power} · ${c.specs.extra}` : t('fleet.specsMissing')}</p>
              <p className="mt-2 text-sm">{t('fleet.fromDay', { price: rate(c.id) })} <span className="text-xs text-ink-2">({t('fleet.demoRate')})</span></p>
              <Link
                href={href('/configura/?step=0')}
                onClick={() => setCar(c.id)}
                className="mt-4 self-start rounded-theme border border-line px-3 py-1.5 text-sm hover:border-accent"
                aria-label={`${t('fleet.choose')} ${carName(c)}`}
              >
                {t('fleet.choose')}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
