'use client';

import Link from 'next/link';
import CarSilhouette from '@/components/CarSilhouette';
import { useStyleHref } from '@/components/ThemeProvider';
import { specRows, useDailyRate, useFleetFilters } from '@/components/builder/kit';
import { FLEET, brandBySlug, carName, type Car } from '@/lib/data';
import { useT } from '@/lib/i18n';
import { useBuilder } from '@/lib/store';
import type { FleetSectionProps } from '@/lib/themes';
import { Kicker } from './parts';

function Chips<T extends string>({
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
      <legend className="gp-kicker gp-kicker-ink mb-2 w-full">{label}</legend>
      {all.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)} className="gp-chip">
          {o.label}
        </button>
      ))}
    </fieldset>
  );
}

function GridSlot({ car, pos }: { car: Car; pos: number }) {
  const t = useT();
  const href = useStyleHref();
  const rate = useDailyRate();
  const setCar = useBuilder((s) => s.setCar);
  const rows = specRows(car, t);
  return (
    <li className={`gp-slot ${pos % 2 === 0 ? 'gp-slot-even' : ''}`}>
      <div className="gp-slot-box">
        <div className="flex items-start justify-between gap-3">
          <p className="gp-display gp-slot-pos">
            {t('th.grand-prix.grid.slot', { n: pos })}
          </p>
          <p className="mt-2 text-right font-mono text-[11px] font-bold uppercase tracking-widest text-ink-2">
            {brandBySlug(car.brand).name}
            <br />
            {t(`categories.${car.category}`)}
          </p>
        </div>
        <div className="gp-slot-car relative">
          <CarSilhouette bodyType={car.bodyType} color={car.color.hex} accent="#EFE7D6" stroke="#111111" className="relative h-24 w-full sm:h-28" />
        </div>
        <h3 className="gp-display mt-3 text-3xl leading-none">{car.model}</h3>
        <table className="gp-timing mt-4 w-full">
          <caption className="sr-only">{t('th.grand-prix.grid.times')} · {carName(car)}</caption>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key}>
                <th scope="row">{r.label}</th>
                <td>{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <p className="text-sm font-bold">
            {t('fleet.fromDay', { price: rate(car.id) })}
            <span className="block font-mono text-[11px] font-normal uppercase tracking-wider text-ink-2">{t('fleet.demoRate')}</span>
          </p>
          <Link
            href={href('/configura/?step=0')}
            onClick={() => setCar(car.id)}
            className="gp-btn gp-btn-ink gp-btn-sm"
            aria-label={`${t('fleet.choose')} ${carName(car)}`}
          >
            {t('fleet.choose')} <span aria-hidden>→</span>
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
  const cars = variant === 'home' ? FLEET.slice(0, 8) : f.cars;
  const Heading = variant === 'catalog' ? 'h1' : 'h2';
  return (
    <section aria-labelledby="h-fleet" className="gp-fleet relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Kicker tone="red">{t('th.grand-prix.grid.kicker')}</Kicker>
            <Heading id="h-fleet" className="gp-display mt-2 text-6xl leading-[0.9] sm:text-8xl">
              {t('fleet.title')}
            </Heading>
            <p className="mt-3 max-w-md text-base font-semibold text-ink-2">{t('th.grand-prix.grid.lead')}</p>
          </div>
          {variant === 'home' && (
            <Link href={href('/collezione/')} className="gp-btn gp-btn-ghost">
              {t('th.grand-prix.grid.all')} <span aria-hidden>→</span>
            </Link>
          )}
        </div>

        {variant === 'catalog' && (
          <div className="mt-10 space-y-5 border-y-2 border-line py-6">
            <Chips label={t('fleet.category')} value={f.category} onChange={f.setCategory} options={f.categories.map((c) => ({ value: c, label: t(`categories.${c}`) }))} />
            <Chips label={t('fleet.brand')} value={f.brand} onChange={f.setBrand} options={f.brands.map((b) => ({ value: b.slug, label: b.name }))} />
            <p className="font-mono text-sm font-bold uppercase tracking-wider" aria-live="polite">
              {t('fleet.count', { n: cars.length })}
            </p>
          </div>
        )}

        {cars.length === 0 ? (
          <p className="mt-10 text-lg font-bold">{t('fleet.none')}</p>
        ) : (
          <ol className="gp-grid mt-12">
            {cars.map((c, i) => (
              <GridSlot key={c.id} car={c} pos={i + 1} />
            ))}
          </ol>
        )}
        <p className="mt-8 font-mono text-xs text-ink-2">{t('price.disclaimer')}</p>
      </div>
    </section>
  );
}
