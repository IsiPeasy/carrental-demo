'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useStyleHref } from '@/components/ThemeProvider';
import { STATS, cityById } from '@/lib/data';
import { useEurope } from '@/lib/geo';
import { useT } from '@/lib/i18n';
import RouteMap from './RouteMap';
import { Kicker, ringsFromGeo } from './shared';

/** Brand monogram from shared i18n (`brand.monogram`); initials of `brand.name` until that key exists. */
export function useMonogram() {
  const t = useT();
  const m = t('brand.monogram');
  if (m !== 'brand.monogram') return m;
  return t('brand.name')
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

/** Round postmark with the brand and the city of the head office. */
export function Postmark({ className = '' }: { className?: string }) {
  const t = useT();
  const mono = useMonogram();
  const text = `${t('brand.name')} · ${t.l(cityById('milano')!.name)} · `.toUpperCase();
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <defs>
        <path id="rv-pm-circle" d="M60 60 m-41 0 a41 41 0 1 1 82 0 a41 41 0 1 1 -82 0" />
      </defs>
      <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="60" cy="60" r="32" fill="none" stroke="currentColor" strokeWidth="1" />
      <text fontSize="10" fill="currentColor" fontFamily="var(--font-body)">
        <textPath href="#rv-pm-circle" textLength="252" lengthAdjust="spacing">
          {text}
        </textPath>
      </text>
      <text x="60" y="66" textAnchor="middle" fontSize="18" fontStyle="italic" fontFamily="var(--font-display)" fill="currentColor">
        {mono}
      </text>
      {/* cancellation waves */}
      <path d="M100 44c8-4 14 4 22 0M100 56c8-4 14 4 22 0M100 68c8-4 14 4 22 0" fill="none" stroke="currentColor" strokeWidth="1.2" transform="translate(-4 0)" />
    </svg>
  );
}

export function PostcardFrame({ rings, className = '' }: { rings: number[][] | null; className?: string }) {
  const t = useT();
  const route = ['milano', 'portofino', 'montecarlo', 'saint-tropez'].map((id) => t.l(cityById(id)!.name));
  return (
    <figure className={`rv-postcard ${className}`}>
      <div className="rv-postcard-head">
        <span className="rv-postcard-title">{t('th.riviera.hero.card')}</span>
        <span className="rv-postcard-route">{route.join(' — ')}</span>
      </div>
      <RouteMap rings={rings} />
      <figcaption className="rv-postcard-foot">
        <span>{t('th.riviera.hero.route')}</span>
        <span className="rv-postcard-brand">{t('brand.name')}</span>
      </figcaption>
      <Postmark className="rv-postmark" />
    </figure>
  );
}

export default function Hero() {
  const t = useT();
  const href = useStyleHref();
  const geo = useEurope();
  const rings = useMemo(() => (geo ? ringsFromGeo(geo) : null), [geo]);
  const cars = STATS.find((s) => s.id === 'cars')!;
  const since = STATS.find((s) => s.id === 'since')!;
  return (
    <section className="rv-hero relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 lg:pb-24 lg:pt-16">
        <div className="rv-fade-up">
          <Kicker>{t('th.riviera.hero.eyebrow')}</Kicker>
          <h1 className="rv-display mt-6 text-[clamp(2.9rem,7vw,5.6rem)] leading-[0.95]">{t('claims.marina')}</h1>
          <p className="rv-display rv-it mt-5 text-2xl text-accent sm:text-3xl">{t('claims.concierge')}</p>
          <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-ink-2">{t('th.riviera.hero.lead')}</p>
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link href={href('/configura/')} className="rv-btn rv-btn-primary">
              {t('cta.request')}
            </Link>
            <Link href={href('/flotta/')} className="rv-link">
              {t('cta.fleet')} <span aria-hidden>→</span>
            </Link>
          </div>
          <dl className="mt-12 flex gap-10 border-t border-line pt-6">
            {[cars, since].map((s) => (
              <div key={s.id} className="flex flex-col-reverse">
                <dt className="mt-1 text-sm text-ink-2">{t(`stats.${s.id}`)}</dt>
                <dd className="rv-display text-4xl tabular-nums">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="rv-fade-in relative lg:pl-4">
          <PostcardFrame rings={rings} className="lg:rotate-[0.6deg]" />
        </div>
      </div>
    </section>
  );
}
