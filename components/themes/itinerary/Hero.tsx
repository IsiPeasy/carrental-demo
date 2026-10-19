'use client';

// "Europe live": the map is the hero. Pulsing city dots, arcs from Milan.

import Link from 'next/link';
import { useStyleHref } from '@/components/ThemeProvider';
import { CITIES, COUNTRIES, STATS, cityById } from '@/lib/data';
import { useT } from '@/lib/i18n';
import EuropeMap, { type BBox, type MapArc } from './EuropeMap';
import { Arrow, Kicker } from './ui';

export const HERO_BBOX: BBox = [-11, 35.2, 26, 56.2];
export const HERO_DESTINATIONS = [
  'londra',
  'costa-smeralda',
  'parigi',
  'ibiza',
  'saint-moritz',
  'montecarlo',
  'vienna',
  'marbella',
  'berlino',
  'ginevra',
  'capri',
  'courchevel',
];
const ARCS: MapArc[] = HERO_DESTINATIONS.map((to) => ({ from: 'milano', to }));

const stat = (id: (typeof STATS)[number]['id']) => STATS.find((s) => s.id === id)?.value ?? null;

export default function Hero() {
  const t = useT();
  const href = useStyleHref();
  const cars = stat('cars');
  const countries = stat('countries') ?? COUNTRIES.length;
  return (
    <section className="itin-hero relative overflow-hidden border-b border-line">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-12 pt-10 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-10 lg:pb-16 lg:pt-14">
        <div className="relative z-10">
          <Kicker>{t('th.itinerary.hero.kicker')}</Kicker>
          <h1 className="mt-5 font-display text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.035em] sm:text-6xl lg:text-[4.2rem]">
            {t('th.itinerary.hero.title')}
          </h1>
          <p className="mt-5 max-w-md text-[1.05rem] leading-relaxed text-ink-2">{t('th.itinerary.hero.lead')}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={href('/configura/')} className="itin-btn itin-btn-primary">
              {t('cta.builder')} <Arrow />
            </Link>
            <Link href={href('/flotta/')} className="itin-btn itin-btn-ghost">
              {t('cta.fleet')}
            </Link>
          </div>
          <p className="itin-counter mt-8">
            <span className="itin-live-dot" aria-hidden />
            <span>{t('th.itinerary.hero.counter', { cars: cars ?? '[…]', countries })}</span>
          </p>
        </div>

        <div className="itin-window relative">
          <div className="itin-window-bar">
            <span className="flex items-center gap-2">
              <span className="itin-live-dot" aria-hidden />
              <span className="font-mono text-[11px] uppercase tracking-[0.14em]">{t('th.itinerary.live')}</span>
            </span>
            <span className="font-mono text-[11px] text-ink-2">{t('th.itinerary.hero.hub')}</span>
            <span className="hidden font-mono text-[11px] text-ink-2 sm:inline">
              {t('th.itinerary.hero.cities', { n: CITIES.length })}
            </span>
          </div>
          <div className="relative w-full">
            <EuropeMap
              bbox={HERO_BBOX}
              width={1000}
              arcs={ARCS}
              highlight={HERO_DESTINATIONS}
              labels
              live
              stagger={0.75}
              className="block h-auto w-full"
              title={t('th.itinerary.hero.mapLabel')}
            />
          </div>
          <div className="itin-window-foot">
            <span className="flex items-center gap-2">
              <span className="itin-legend-dot" aria-hidden /> {t('th.itinerary.hero.legendCity')}
            </span>
            <span className="flex items-center gap-2">
              <span className="itin-legend-arc" aria-hidden /> {t('th.itinerary.hero.legendRoute')}
            </span>
            <ul className="ml-auto hidden gap-1.5 md:flex" aria-hidden>
              {HERO_DESTINATIONS.slice(0, 6).map((id) => (
                <li key={id} className="itin-code">{cityById(id)!.code}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
