'use client';

import Link from 'next/link';
import CarSilhouette from '@/components/CarSilhouette';
import { useStyleHref } from '@/components/ThemeProvider';
import { useDailyRate, useFleetFilters } from '@/components/builder/kit';
import { FLEET, brandBySlug, carName, type Car } from '@/lib/data';
import { useT } from '@/lib/i18n';
import { useBuilder } from '@/lib/store';
import type { FleetSectionProps } from '@/lib/themes';
import { Kicker } from './shared';

function FilterRow<T extends string>({
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
    <fieldset className="rv-filter">
      <legend className="rv-filter-legend">{label}</legend>
      <div className="flex flex-wrap gap-x-1 gap-y-1">
        {all.map((o) => (
          <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)} className="rv-filter-btn">
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function CarCard({ car, index }: { car: Car; index: number }) {
  const t = useT();
  const href = useStyleHref();
  const rate = useDailyRate();
  const setCar = useBuilder((s) => s.setCar);
  const no = String(index + 1).padStart(2, '0');
  return (
    <li className="rv-car group">
      <div className="rv-car-plate">
        <span className="rv-car-no">
          {t('th.riviera.fleet.no')} {no}
        </span>
        <span className="rv-car-cat">{t(`categories.${car.category}`)}</span>
        <CarSilhouette bodyType={car.bodyType} color={car.color.hex} className="rv-car-sil" />
      </div>
      <p className="mt-5 text-[0.72rem] uppercase tracking-[0.2em] text-ink-2">{brandBySlug(car.brand).name}</p>
      <h3 className="rv-display rv-it mt-1 text-[1.75rem] leading-tight">{car.model}</h3>
      <p className="mt-2 text-sm text-ink-2">
        {car.specs ? `${car.specs.engine} · ${car.specs.power} · ${car.specs.extra}` : t('fleet.specsMissing')}
        {' · '}
        {t.l(car.color.name)}
      </p>
      <div className="mt-5 flex items-end justify-between gap-4 border-t border-line pt-4">
        <p className="text-sm">
          <span className="tabular-nums">{t('fleet.fromDay', { price: rate(car.id) })}</span>
          <span className="block text-xs text-ink-2">{t('fleet.demoRate')}</span>
        </p>
        <Link
          href={href('/configura/?step=0')}
          onClick={() => setCar(car.id)}
          className="rv-link shrink-0 text-sm"
          aria-label={`${t('fleet.choose')} ${carName(car)}`}
        >
          {t('fleet.choose')} <span aria-hidden>→</span>
        </Link>
      </div>
    </li>
  );
}

export default function FleetSection({ variant }: FleetSectionProps) {
  const t = useT();
  const href = useStyleHref();
  const f = useFleetFilters();
  const catalog = variant === 'catalog';
  const cars = catalog ? f.cars : FLEET.slice(0, 6);
  const Heading = catalog ? 'h1' : 'h2';
  return (
    <section aria-labelledby="h-fleet" className={catalog ? 'mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 lg:pt-16' : ''}>
      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <Kicker>{t('th.riviera.fleet.kicker')}</Kicker>
          <Heading id="h-fleet" className="rv-display mt-4 text-[clamp(2.4rem,5vw,4rem)] leading-none">
            {t('fleet.title')}
          </Heading>
          <p className="mt-4 max-w-lg text-ink-2">{t('fleet.lead')}</p>
        </div>
        {!catalog && (
          <Link href={href('/flotta/')} className="rv-link self-end">
            {t('th.riviera.fleet.all')} <span aria-hidden>→</span>
          </Link>
        )}
      </div>

      {catalog && (
        <div className="mt-10 grid gap-6 border-y border-line py-6 md:grid-cols-[auto_1fr] md:gap-x-12" role="group" aria-label={t('th.riviera.fleet.filters')}>
          <FilterRow label={t('fleet.category')} value={f.category} onChange={f.setCategory} options={f.categories.map((c) => ({ value: c, label: t(`categories.${c}`) }))} />
          <FilterRow label={t('fleet.brand')} value={f.brand} onChange={f.setBrand} options={f.brands.map((b) => ({ value: b.slug, label: b.name }))} />
          <p className="rv-display rv-it text-lg text-ink-2 md:col-span-2" aria-live="polite">
            {t('fleet.count', { n: cars.length })}
          </p>
        </div>
      )}

      {cars.length === 0 ? (
        <p className="rv-display rv-it mt-12 text-2xl text-ink-2">{t('fleet.none')}</p>
      ) : (
        <ul className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((c) => (
            <CarCard key={c.id} car={c} index={FLEET.indexOf(c)} />
          ))}
        </ul>
      )}
      <p className="mt-10 text-xs text-ink-2">{t('price.disclaimer')}</p>
    </section>
  );
}
