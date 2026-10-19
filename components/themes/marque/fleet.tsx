'use client';

// Marque — FleetSection. Brand-first: marque filter on top, cars grouped by
// marque, each group tinted with its accent.

import Link from 'next/link';
import type { CSSProperties } from 'react';
import CarSilhouette from '@/components/CarSilhouette';
import { useStyleHref } from '@/components/ThemeProvider';
import { useDailyRate, useFleetFilters } from '@/components/builder/kit';
import { PLACEHOLDER, brandBySlug, brandsInFleet, carName, type Car } from '@/lib/data';
import { useT } from '@/lib/i18n';
import { useBuilder } from '@/lib/store';
import type { FleetSectionProps } from '@/lib/themes';
import BrandMark, { BrandScope, brandStyle, brandVars, flagshipOf } from './brand';

function CarCard({ car, showBrand }: { car: Car; showBrand?: boolean }) {
  const t = useT();
  const href = useStyleHref();
  const rate = useDailyRate();
  const setCar = useBuilder((s) => s.setCar);
  const s = brandStyle(car.brand);
  return (
    <BrandScope brand={car.brand} className="group relative flex h-full flex-col overflow-hidden rounded-theme border border-line bg-bg transition-shadow duration-300 hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,.35)]">
      <span className="m-acc-bg absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100 group-focus-within:scale-x-100" aria-hidden />
      <div className="m-floor relative flex h-40 items-end justify-center bg-surface px-6 pb-6 pt-8">
        <CarSilhouette bodyType={car.bodyType} color={car.color.hex} accent={s.accent} className="h-full w-auto max-w-full transition-transform duration-500 group-hover:scale-[1.03]" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        {showBrand && (
          <div className="m-acc-text mb-2">
            <BrandMark slug={car.brand} className="text-sm" style={{ '--m-h': '1rem' } as CSSProperties} />
          </div>
        )}
        <h3 className="m-title text-2xl">{car.model}</h3>
        <p className="m-kicker mt-1">
          {t(`categories.${car.category}`)} · {car.year ?? PLACEHOLDER} · {t.l(car.color.name)}
        </p>
        <p className="m-mono mt-3 text-xs text-ink-2">
          {car.specs ? `${car.specs.engine} · ${car.specs.power} · ${car.specs.extra}` : `${t('fleet.specsMissing')} ${PLACEHOLDER}`}
        </p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <p className="text-sm">
            {t('fleet.fromDay', { price: rate(car.id) })}
            <span className="block text-[11px] text-ink-2">{t('fleet.demoRate')}</span>
          </p>
          <Link
            href={href('/configura/?step=0')}
            onClick={() => setCar(car.id)}
            className="m-btn !min-h-10 !px-4 !py-2 text-sm"
            aria-label={`${t('th.marque.brands.configure')} ${carName(car)}`}
          >
            {t('th.marque.brands.configure')}
          </Link>
        </div>
      </div>
    </BrandScope>
  );
}

export function FleetSection({ variant }: FleetSectionProps) {
  const t = useT();
  const href = useStyleHref();
  const f = useFleetFilters();

  if (variant === 'home') {
    const flagships = brandsInFleet().map((b) => flagshipOf(b.slug));
    return (
      <section aria-labelledby="h-fleet">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="m-kicker">{t('fleet.title')}</p>
            <h2 id="h-fleet" className="m-title mt-3 text-4xl sm:text-5xl">
              {t('th.marque.fleet.homeTitle')}
            </h2>
            <p className="mt-3 max-w-xl text-ink-2">{t('th.marque.fleet.homeLead')}</p>
          </div>
          <Link href={href('/flotta/')} className="m-btn-ghost">
            {t('th.marque.fleet.viewAll')} →
          </Link>
        </div>
        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {flagships.map((c) => (
            <li key={c.id}>
              <CarCard car={c} showBrand />
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-ink-2">{t('price.disclaimer')}</p>
      </section>
    );
  }

  const groups = f.brands
    .map((b) => ({ brand: b, cars: f.cars.filter((c) => c.brand === b.slug) }))
    .filter((g) => g.cars.length);

  return (
    <section aria-labelledby="h-fleet" className="mx-auto max-w-[1440px] px-4 pt-10 sm:px-8 lg:pt-14">
      <p className="m-kicker">{t('fleet.title')} · {f.cars.length}</p>
      <h1 id="h-fleet" className="m-display mt-4 text-5xl sm:text-7xl">
        {t('th.marque.fleet.catalogTitle')}
      </h1>
      <p className="mt-4 max-w-2xl text-ink-2">{t('th.marque.fleet.catalogLead')}</p>

      {/* brand filter: the first decision */}
      <fieldset className="mt-10">
        <legend className="m-kicker mb-3">{t('fleet.brand')}</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
          <button
            type="button"
            aria-pressed={f.brand === 'all'}
            onClick={() => f.setBrand('all')}
            className="m-opt flex h-16 items-center justify-center px-3 text-sm font-semibold"
          >
            {t('th.marque.fleet.allBrands')}
          </button>
          {f.brands.map((b) => (
            <button
              key={b.slug}
              type="button"
              aria-pressed={f.brand === b.slug}
              onClick={() => f.setBrand(f.brand === b.slug ? 'all' : b.slug)}
              style={{ ...brandVars(b.slug), '--m-max': '1.15rem' } as CSSProperties}
              className={`m-opt flex h-16 items-center px-4 ${f.brand === b.slug ? 'm-acc-text' : ''}`}
            >
              <BrandMark slug={b.slug} fit />
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="m-kicker mb-3">{t('fleet.category')}</legend>
        <div className="flex flex-wrap gap-2">
          {[{ value: 'all' as const, label: t('fleet.all') }, ...f.categories.map((c) => ({ value: c, label: t(`categories.${c}`) }))].map((o) => (
            <button
              key={o.value}
              type="button"
              aria-pressed={f.category === o.value}
              onClick={() => f.setCategory(o.value)}
              className="m-opt m-chip px-4 py-2 text-sm"
            >
              {o.label}
            </button>
          ))}
        </div>
      </fieldset>
      <p className="m-mono mt-6 text-xs text-ink-2" aria-live="polite">
        {t('fleet.count', { n: f.cars.length })}
      </p>

      {groups.length === 0 ? (
        <p className="mt-10 text-ink-2">{t('fleet.none')}</p>
      ) : (
        <div className="mt-8 space-y-16">
          {groups.map((g) => (
            <BrandScope key={g.brand.slug} brand={g.brand.slug} className="m-enter">
              <section aria-label={brandBySlug(g.brand.slug).name}>
                <header className="m-acc-border flex flex-wrap items-end justify-between gap-3 border-b-2 pb-4">
                  <div className="m-acc-text min-w-0" style={{ '--m-h': '2.4rem' } as CSSProperties}>
                    <BrandMark slug={g.brand.slug} className="text-3xl sm:text-4xl" />
                  </div>
                  <p className="m-kicker">{t('th.marque.fleet.inBrand', { n: g.cars.length })}</p>
                </header>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {g.cars.map((c) => (
                    <li key={c.id}>
                      <CarCard car={c} />
                    </li>
                  ))}
                </ul>
              </section>
            </BrandScope>
          ))}
        </div>
      )}
      <p className="mt-8 text-xs text-ink-2">{t('price.disclaimer')}</p>
    </section>
  );
}
