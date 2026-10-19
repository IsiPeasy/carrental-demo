'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import CarSilhouette from '@/components/CarSilhouette';
import { useStyleHref } from '@/components/ThemeProvider';
import { FLEET, STATS, carName } from '@/lib/data';
import { useT } from '@/lib/i18n';
import { RaceNumber, SpeedLines, Stripes } from './parts';

const stat = (id: (typeof STATS)[number]['id']) => STATS.find((s) => s.id === id)?.value ?? null;

export function TickerItems() {
  const t = useT();
  const items = [
    t('brand.claim'),
    t('th.grand-prix.hero.since', { year: stat('since') ?? '[…]' }),
    t('th.grand-prix.hero.countries', { n: stat('countries') ?? '[…]' }),
    `${stat('cars') ?? '[…]'} ${t('stats.cars')}`,
    t('claims.concierge'),
  ];
  return (
    <>
      {items.map((s) => (
        <span key={s} className="gp-ticker-item">
          {s}
        </span>
      ))}
    </>
  );
}

export default function Hero() {
  const t = useT();
  const href = useStyleHref();
  const car = FLEET[1];
  const raceNo = stat('cars') ?? 0;
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <section className={`gp-hero relative overflow-hidden ${on ? 'is-on' : ''}`} aria-labelledby="gp-hero-title">
      <div className="relative z-10 mx-auto grid max-w-7xl gap-8 px-4 pt-10 sm:px-6 lg:grid-cols-[1.35fr_1fr] lg:pt-14">
        <div>
          <p className="gp-kicker gp-kicker-ink">
            <span className="gp-dot" aria-hidden /> {t('th.grand-prix.hero.kicker')}
          </p>
          <h1 id="gp-hero-title" className="gp-display gp-hero-title mt-4">
            {t('th.grand-prix.hero.title')}
          </h1>
          <p className="mt-5 max-w-lg text-base font-medium leading-relaxed text-ink sm:text-lg">{t('th.grand-prix.hero.lead')}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={href('/configura/')} className="gp-btn gp-btn-red">
              {t('cta.request')} <span aria-hidden>→</span>
            </Link>
            <Link href={href('/collezione/')} className="gp-btn gp-btn-ghost">
              {t('cta.fleet')}
            </Link>
          </div>
        </div>
        <div className="relative hidden items-start justify-end lg:flex">
          <div className="gp-hero-roundel-wrap">
            <span className="gp-kicker gp-kicker-ink mb-2 block text-right">{t('th.grand-prix.hero.number')}</span>
            <RaceNumber n={raceNo} className="gp-hero-roundel" />
          </div>
        </div>
      </div>

      <div className="gp-hero-track relative mt-6 lg:-mt-24">
        <Stripes play={on} className="gp-hero-stripes" />
        <span aria-hidden className="gp-hero-ghostnum lg:hidden">
          {raceNo}
        </span>
        <div className="gp-hero-car">
          <SpeedLines className="gp-hero-speed" count={8} />
          <CarSilhouette
            bodyType={car.bodyType}
            color={car.color.hex}
            accent="#EFE7D6"
            stroke="#111111"
            strokeWidth={2}
            className="relative w-full"
            title={carName(car)}
          />
        </div>
      </div>

      <div className="gp-ticker" aria-hidden>
        <div className="gp-ticker-run">
          <TickerItems />
          <TickerItems />
        </div>
      </div>
    </section>
  );
}
