'use client';

// "Private Viewing": horizontal scroll-snap gallery (home) / filtered
// collection grid (catalog). Hover/focus lifts the card and reveals specs.

import Link from 'next/link';
import { useRef } from 'react';
import CarSilhouette from '@/components/CarSilhouette';
import { useStyleHref } from '@/components/ThemeProvider';
import { specRows, useDailyRate, useFleetFilters } from '@/components/builder/kit';
import { FLEET, brandBySlug, carName, type Car } from '@/lib/data';
import { useT } from '@/lib/i18n';
import { useBuilder } from '@/lib/store';
import type { FleetSectionProps } from '@/lib/themes';
import { Emph, Label, plain, roman } from './ui';

function ViewingCard({ car, n, always = false }: { car: Car; n: number; always?: boolean }) {
  const t = useT();
  const href = useStyleHref();
  const rate = useDailyRate();
  const setCar = useBuilder((s) => s.setCar);
  return (
    <article className={`nc-card group ${always ? 'is-open' : ''}`}>
      <div className="nc-card-stage" aria-hidden>
        <span className="nc-card-num">{roman(n)}</span>
        <CarSilhouette bodyType={car.bodyType} color={car.color.hex} accent="#C8A96A" className="nc-card-car" />
      </div>
      <div className="nc-card-body">
        <Label className="text-ink-2">
          {brandBySlug(car.brand).name} · {t(`categories.${car.category}`)}
        </Label>
        <h3 className="mt-2 font-display text-[1.7rem] leading-tight">{car.model}</h3>
        <dl className="nc-card-specs">
          {specRows(car, t).map((r) => (
            <div key={r.key} className="flex items-baseline justify-between gap-4 border-t border-line py-1.5 text-sm">
              <dt className="text-ink-2">{r.label}</dt>
              <dd className="text-right">{r.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex items-end justify-between gap-3">
          <p className="text-sm text-ink-2">
            <span className="text-ink">{t('fleet.fromDay', { price: rate(car.id) })}</span>
            <span className="block text-[11px]">{t('fleet.demoRate')}</span>
          </p>
          <Link
            href={href('/configura/?step=0')}
            onClick={() => setCar(car.id)}
            className="nc-link nc-label shrink-0"
            aria-label={`${t('th.nocturne.viewing.request')} ${carName(car)}`}
          >
            {t('th.nocturne.viewing.request')}
          </Link>
        </div>
      </div>
    </article>
  );
}

function Gallery() {
  const t = useT();
  const href = useStyleHref();
  const track = useRef<HTMLUListElement>(null);
  const scroll = (dir: number) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector('li');
    const w = card ? card.getBoundingClientRect().width + 24 : 320;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
  };
  const cars = FLEET.slice(0, 9);
  return (
    <section aria-labelledby="nc-viewing" className="nc-section">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <Label className="text-accent">{t('th.nocturne.viewing.eyebrow')}</Label>
            <h2 id="nc-viewing" className="nc-h2 mt-4" aria-label={plain(t('th.nocturne.viewing.title'))}>
              <Emph text={t('th.nocturne.viewing.title')} />
            </h2>
            <p className="mt-4 max-w-md font-light text-ink-2">{t('th.nocturne.viewing.lead')}</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="nc-icon-btn" onClick={() => scroll(-1)} aria-label={t('th.nocturne.viewing.prev')}>
              <span aria-hidden>←</span>
            </button>
            <button type="button" className="nc-icon-btn" onClick={() => scroll(1)} aria-label={t('th.nocturne.viewing.next')}>
              <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      </div>
      <ul ref={track} className="nc-gallery no-scrollbar mt-12" tabIndex={0} aria-label={t('th.nocturne.viewing.eyebrow')}>
        {cars.map((c, i) => (
          <li key={c.id}>
            <ViewingCard car={c} n={i + 1} />
          </li>
        ))}
        <li className="nc-gallery-end">
          <Link href={href('/collezione/')} className="nc-btn nc-btn-ghost">
            {t('th.nocturne.viewing.all')} →
          </Link>
        </li>
      </ul>
      <p className="mx-auto mt-6 max-w-[1440px] px-4 text-xs text-ink-2 sm:px-8">{t('price.disclaimer')}</p>
    </section>
  );
}

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
    <fieldset className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:gap-8">
      <legend className="nc-label float-left w-28 shrink-0 pb-3 text-ink-2 sm:pb-0">{label}</legend>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {all.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className="nc-filter"
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Catalog() {
  const t = useT();
  const f = useFleetFilters();
  return (
    <section aria-labelledby="nc-catalog" className="mx-auto max-w-[1440px] px-4 pb-8 pt-16 sm:px-8 sm:pt-24">
      <Label className="text-accent">{t('th.nocturne.viewing.eyebrow')}</Label>
      <h1 id="nc-catalog" className="nc-h1 mt-4" aria-label={plain(t('th.nocturne.viewing.catalogTitle'))}>
        <Emph text={t('th.nocturne.viewing.catalogTitle')} />
      </h1>
      <p className="mt-4 max-w-md font-light text-ink-2">{t('th.nocturne.viewing.catalogLead')}</p>
      <div className="mt-12 space-y-5 border-y border-line py-6">
        <FilterRow label={t('fleet.category')} value={f.category} onChange={f.setCategory} options={f.categories.map((c) => ({ value: c, label: t(`categories.${c}`) }))} />
        <FilterRow label={t('fleet.brand')} value={f.brand} onChange={f.setBrand} options={f.brands.map((b) => ({ value: b.slug, label: b.name }))} />
      </div>
      <p className="nc-label mt-6 text-ink-2" aria-live="polite">
        {t('fleet.count', { n: f.cars.length })}
      </p>
      {f.cars.length === 0 ? (
        <p className="mt-10 font-display text-2xl italic text-ink-2">{t('fleet.none')}</p>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {f.cars.map((c) => (
            <li key={c.id}>
              <ViewingCard car={c} n={FLEET.indexOf(c) + 1} always />
            </li>
          ))}
        </ul>
      )}
      <p className="mt-8 text-xs text-ink-2">{t('price.disclaimer')}</p>
    </section>
  );
}

export default function FleetSection({ variant }: FleetSectionProps) {
  return variant === 'catalog' ? <Catalog /> : <Gallery />;
}
