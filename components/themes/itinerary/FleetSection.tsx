'use client';

import Link from 'next/link';
import CarSilhouette from '@/components/CarSilhouette';
import { useStyleHref } from '@/components/ThemeProvider';
import { specRows, useDailyRate, useFleetFilters } from '@/components/builder/kit';
import { FLEET, brandBySlug, carName, type Car } from '@/lib/data';
import { useT } from '@/lib/i18n';
import { useBuilder } from '@/lib/store';
import type { FleetSectionProps } from '@/lib/themes';
import { Arrow, Kicker, SectionHead } from './ui';

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | 'all';
  options: { value: T; label: string; n: number }[];
  onChange: (v: T | 'all') => void;
}) {
  const t = useT();
  const all = [{ value: 'all' as const, label: t('fleet.all'), n: FLEET.length }, ...options];
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-2">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {all.map((o) => (
          <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)} className="itin-chip">
            <span>{o.label}</span>
            <span className="itin-chip-sub">{o.n}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function CarCard({ car }: { car: Car }) {
  const t = useT();
  const href = useStyleHref();
  const rate = useDailyRate();
  const setCar = useBuilder((s) => s.setCar);
  const rows = specRows(car, t).filter((r) => r.key !== 'color');
  return (
    <li className="itin-card itin-car group flex flex-col overflow-hidden">
      <div className="itin-car-stage relative px-5 pb-2 pt-8">
        <span className="absolute left-4 top-3 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-2">
          {t(`categories.${car.category}`)}
        </span>
        <span className="absolute right-4 top-3 flex items-center gap-1.5 font-mono text-[11px] text-ink-2">
          <span className="h-2.5 w-2.5 rounded-full border border-black/15" style={{ background: car.color.hex }} aria-hidden />
          {t.l(car.color.name)}
        </span>
        <CarSilhouette bodyType={car.bodyType} color={car.color.hex} accent="#2b2b2b" className="h-28 w-full transition-transform duration-300 ease-out group-hover:-translate-y-0.5" />
      </div>
      <div className="flex flex-1 flex-col border-t border-line p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-2">{brandBySlug(car.brand).name}</p>
        <h3 className="mt-1 text-xl font-semibold tracking-tight">{car.model}</h3>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {rows.map((r) => (
            <div key={r.key} className="min-w-0">
              <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-2">{r.label}</dt>
              <dd className="truncate font-mono text-[13px]">{r.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <p className="text-sm">
            <span className="font-semibold tabular-nums">{t('fleet.fromDay', { price: rate(car.id) })}</span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-ink-2">{t('fleet.demoRate')}</span>
          </p>
          <Link
            href={href('/configura/?step=0')}
            onClick={() => setCar(car.id)}
            className="itin-btn itin-btn-ghost itin-btn-sm"
            aria-label={`${t('fleet.choose')} ${carName(car)}`}
          >
            {t('fleet.choose')} <Arrow className="h-3.5 w-3.5" />
          </Link>
        </div>
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
  return (
    <section aria-labelledby="h-fleet" className={catalog ? 'mx-auto max-w-7xl px-4 pb-8 pt-10 sm:px-6' : ''}>
      {catalog ? (
        <header className="mb-8">
          <Kicker>{t('th.itinerary.fleet.kicker')}</Kicker>
          <h1 id="h-fleet" className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {t('fleet.title')}
          </h1>
          <p className="mt-2 text-ink-2">{t('fleet.lead')}</p>
        </header>
      ) : (
        <SectionHead
          id="h-fleet"
          kicker={t('th.itinerary.fleet.kicker')}
          title={t('fleet.title')}
          lead={t('fleet.lead')}
          aside={
            <Link href={href('/flotta/')} className="itin-btn itin-btn-ghost">
              {t('th.itinerary.fleet.all')} <Arrow />
            </Link>
          }
        />
      )}
      {catalog && (
        <div className="itin-card mb-6 grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="space-y-4">
          <Segmented
            label={t('fleet.category')}
            value={f.category}
            onChange={f.setCategory}
            options={f.categories.map((c) => ({ value: c, label: t(`categories.${c}`), n: FLEET.filter((x) => x.category === c).length }))}
          />
          <Segmented
            label={t('fleet.brand')}
            value={f.brand}
            onChange={f.setBrand}
            options={f.brands.map((b) => ({ value: b.slug, label: b.name, n: FLEET.filter((x) => x.brand === b.slug).length }))}
          />
          </div>
          <p className="font-mono text-xs text-ink-2 lg:border-l lg:border-line lg:pl-6 lg:text-right" aria-live="polite">
            <span className="block text-[11px] uppercase tracking-[0.12em]">{t('th.itinerary.fleet.results')}</span>
            <span className="text-2xl font-semibold text-ink">{cars.length}</span> / {FLEET.length}
          </p>
        </div>
      )}
      {cars.length === 0 ? (
        <p className="itin-card p-8 text-center text-ink-2">{t('fleet.none')}</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((c) => (
            <CarCard key={c.id} car={c} />
          ))}
        </ul>
      )}
      <p className="mt-3 font-mono text-[11px] text-ink-2">{t('price.disclaimer')}</p>
    </section>
  );
}
