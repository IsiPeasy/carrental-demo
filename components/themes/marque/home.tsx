'use client';

// Marque — Hero (brand wall) + HomeSections (marquee, in-page brand tabs,
// flagships, steps, guarantees, FAQ, contacts).

import Link from 'next/link';
import { useEffect, useState, type CSSProperties } from 'react';
import CarSilhouette from '@/components/CarSilhouette';
import Photo from '@/components/Photo';
import { useStyleHref, useTheme } from '@/components/ThemeProvider';
import { specRows, useDailyRate } from '@/components/builder/kit';
import {
  CLIENTELE,
  CONTACTS,
  DELIVERIES,
  FAQ,
  PLACEHOLDER,
  STATS,
  TESTIMONIALS,
  brandBySlug,
  brandsInFleet,
  carById,
  carName,
  carsOfBrand,
  cityById,
  type BrandSlug,
} from '@/lib/data';
import { useT } from '@/lib/i18n';
import { usePrefersReducedMotion } from '@/lib/hooks';
import { useBuilder, useRateTable } from '@/lib/store';
import BrandMark, { BrandScope, brandStyle, brandVars, flagshipOf, rovingKeyNav } from './brand';

const BRANDS_IN_FLEET = brandsInFleet();
const stat = (id: (typeof STATS)[number]['id']) => STATS.find((s) => s.id === id)?.value ?? PLACEHOLDER;

export function useModelCount() {
  const t = useT();
  return (slug: BrandSlug) => {
    const n = carsOfBrand(slug).length;
    return n === 1 ? t('th.marque.hero.model') : t('th.marque.hero.models', { n });
  };
}

// ——— Hero: brand wall ———
export function Hero() {
  const t = useT();
  const href = useStyleHref();
  const brands = brandsInFleet();
  const count = useModelCount();
  const tiles = [...brands.map((b) => b.slug), 'all' as const];
  const rows = [tiles.slice(0, 4), tiles.slice(4)];
  return (
    <section className="mx-auto max-w-[1440px] px-4 pb-14 pt-10 sm:px-8 lg:pt-14" aria-labelledby="h-hero">
      <div className="mb-8 grid gap-6 lg:mb-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-end">
        <div>
          <p className="m-kicker">{t('th.marque.hero.kicker')} · {brands.length}</p>
          <h1 id="h-hero" className="m-display mt-4 max-w-[17ch] text-[2.55rem] sm:text-6xl xl:text-[5.4rem]">
            {t('th.marque.hero.title')}
          </h1>
        </div>
        <div className="lg:pb-2">
          <p className="text-ink-2">
            {t('th.marque.hero.lead', { brands: brands.length, cars: stat('cars'), countries: stat('countries') })}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={href('/configura/')} className="m-btn">
              {t('cta.builder')} <span aria-hidden>→</span>
            </Link>
            <Link href={href('/flotta/')} className="m-btn-ghost">
              {t('cta.fleet')}
            </Link>
          </div>
        </div>
      </div>

      <div className="m-wall">
        {rows.map((row, r) => (
          <div key={r} className="m-wall-row">
            {row.map((slug, j) => {
              const idx = r * 4 + j;
              if (slug === 'all')
                return (
                  <Link key="all" href={href('/flotta/')} className="m-tile m-tile-all">
                    <span className="m-tile-head">
                      <span className="m-kicker">{String(idx + 1).padStart(2, '0')}</span>
                      <span className="m-kicker hidden md:inline">
                        {stat('cars')} {t('stats.cars')}
                      </span>
                    </span>
                    <span className="m-tile-mark !transform-none md:!-translate-y-1/2">
                      <span className="m-title block text-2xl md:text-4xl">{t('th.marque.hero.all')}</span>
                      <span className="mt-2 block text-sm opacity-75">{t('th.marque.hero.allLead')}</span>
                    </span>
                    <span className="absolute bottom-3 left-3.5 text-2xl md:bottom-5 md:left-6" aria-hidden>
                      →
                    </span>
                  </Link>
                );
              const car = flagshipOf(slug);
              const name = brandBySlug(slug).name;
              return (
                <a
                  key={slug}
                  href={`#marca-${slug}`}
                  data-brand={slug}
                  style={brandVars(slug)}
                  className="m-tile"
                  aria-label={t('th.marque.hero.tileLabel', { brand: name, count: count(slug) })}
                >
                  <span className="m-tile-bar" aria-hidden />
                  <span className="m-tile-head" aria-hidden>
                    <span className="m-kicker">{String(idx + 1).padStart(2, '0')}</span>
                    <span className="m-kicker m-tile-count">{count(slug)}</span>
                  </span>
                  <span className="m-tile-mark">
                    <BrandMark slug={slug} fit />
                  </span>
                  <span className="m-tile-car m-floor" aria-hidden>
                    <CarSilhouette bodyType={car.bodyType} color={brandStyle(slug).accent} accent="#BDBDBD" className="w-full" />
                  </span>
                  <span className="m-tile-cta max-md:hidden" aria-hidden>
                    {t('th.marque.hero.discover')} →
                  </span>
                </a>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}

// ——— marquee ———
export function BrandMarquee() {
  const t = useT();
  const reduced = usePrefersReducedMotion();
  const brands = brandsInFleet();
  const list = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {[...brands, ...brands].map((b, i) => (
        <li key={`${b.slug}-${i}`} className="px-8 sm:px-12">
          <BrandMark slug={b.slug} mono className="text-2xl sm:text-3xl" style={{ '--m-h': '2rem' } as CSSProperties} />
        </li>
      ))}
    </ul>
  );
  return (
    <section aria-label={t('th.marque.marquee.title')} className="border-y border-line py-7">
      <div className="mx-auto mb-5 max-w-[1440px] px-4 sm:px-8">
        <h2 className="m-kicker">{t('th.marque.marquee.title')}</h2>
      </div>
      <div className={`m-marquee ${reduced ? 'is-paused' : ''}`}>
        <div className="m-marquee-track">
          {list(false)}
          {list(true)}
        </div>
      </div>
    </section>
  );
}

// ——— in-page brand section (tabs) ———
export function BrandSection() {
  const t = useT();
  const href = useStyleHref();
  const rate = useDailyRate();
  const setCar = useBuilder((s) => s.setCar);
  const count = useModelCount();
  const rates = useRateTable();
  const brands = BRANDS_IN_FLEET;
  const [sel, setSel] = useState<BrandSlug>(brands[0].slug);

  // #marca-{slug} (brand wall tiles, footer) selects the tab
  useEffect(() => {
    const read = () => {
      const m = window.location.hash.match(/^#marca-(.+)$/);
      if (m && brands.some((b) => b.slug === m[1])) setSel(m[1] as BrandSlug);
    };
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, [brands]);

  const name = brandBySlug(sel).name;
  const models = carsOfBrand(sel);
  const flagship = flagshipOf(sel);
  const deliveries = DELIVERIES.filter((d) => carById(d.carId)?.brand === sel);
  const minRate = models.reduce<string | null>(
    (a, c) => (a == null || (rates.daily[c.id] ?? Infinity) < (rates.daily[a] ?? Infinity) ? c.id : a),
    null,
  );

  return (
    <section id="marche" aria-labelledby="h-brands" className="relative mx-auto max-w-[1440px] scroll-mt-20 px-4 sm:px-8">
      {brands.map((b) => (
        <span key={b.slug} id={`marca-${b.slug}`} className="absolute -top-20" aria-hidden />
      ))}
      <header className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-end">
        <div>
          <p className="m-kicker">{t('th.marque.brands.kicker')}</p>
          <h2 id="h-brands" className="m-title mt-3 text-4xl sm:text-5xl">
            {t('th.marque.brands.title')}
          </h2>
        </div>
        <p className="text-ink-2">{t('th.marque.brands.lead')}</p>
      </header>

      <div
        role="tablist"
        aria-label={t('th.marque.brands.tabs')}
        onKeyDown={(e) => rovingKeyNav(e, 'tab')}
        className="no-scrollbar mt-10 flex overflow-x-auto border-b border-line"
      >
        {brands.map((b) => {
          const on = b.slug === sel;
          return (
            <button
              key={b.slug}
              type="button"
              role="tab"
              id={`tab-${b.slug}`}
              aria-selected={on}
              aria-controls="panel-brand"
              tabIndex={on ? 0 : -1}
              onClick={() => setSel(b.slug)}
              style={brandVars(b.slug)}
              className="m-tab shrink-0 px-4 py-4 sm:px-6"
            >
              <BrandMark slug={b.slug} className="text-base sm:text-lg" style={{ '--m-h': '1.4rem' } as CSSProperties} />
            </button>
          );
        })}
      </div>

      <BrandScope brand={sel} role="tabpanel" id="panel-brand" aria-labelledby={`tab-${sel}`} tabIndex={0} className="pt-10">
        <div key={sel} className="m-enter grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
          {/* brand card */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="relative overflow-hidden rounded-theme bg-surface p-6 sm:p-8">
              <span className="m-acc-bg absolute inset-x-0 top-0 h-1.5" aria-hidden />
              <p className="m-kicker">{count(sel)}</p>
              <div className="m-acc-text mt-5" style={{ '--m-max': '5.5rem' } as CSSProperties}>
                <BrandMark slug={sel} fit />
              </div>
              <div className="m-floor relative mx-auto mt-10 max-w-md">
                <CarSilhouette bodyType={flagship.bodyType} color={flagship.color.hex} accent={brandStyle(sel).accent} className="w-full" title={carName(flagship)} />
              </div>
              <p className="mt-6 text-sm text-ink-2">
                {carName(flagship)} · {t.l(flagship.color.name)}
              </p>
              <Link
                href={href('/configura/?step=0')}
                onClick={() => setCar(flagship.id)}
                className="m-btn mt-6 w-full sm:w-auto"
              >
                {t('th.marque.brands.configureBrand', { brand: name })} <span aria-hidden>→</span>
              </Link>
            </div>
          </div>

          {/* models */}
          <div>
            <h3 className="m-kicker">{t('th.marque.brands.models')}</h3>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {models.map((c) => (
                <li key={c.id} className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-4 py-7 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6">
                  <div className="m-floor relative flex h-16 items-end justify-center self-start rounded-theme bg-surface px-2 py-2 sm:h-24 sm:px-3">
                    <CarSilhouette bodyType={c.bodyType} color={c.color.hex} accent={brandStyle(sel).accent} shadow={false} className="h-full w-auto max-w-full" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h4 className="m-title text-2xl sm:text-3xl">{c.model}</h4>
                      <p className="m-mono text-sm">
                        {t('fleet.fromDay', { price: rate(c.id) })}
                        <span className="ml-1.5 text-[10px] uppercase tracking-wider text-ink-2">{t('price.demo')}</span>
                      </p>
                    </div>
                    <p className="m-kicker mt-1">
                      {name} · {t(`categories.${c.category}`)}
                    </p>
                    <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-theme border border-line bg-line md:grid-cols-5 [&>*:last-child:nth-child(odd)]:col-span-2 md:[&>*:last-child:nth-child(odd)]:col-span-1">
                      {specRows(c, t).map((r) => (
                        <div key={r.key} className="bg-bg px-3 py-2.5">
                          <dt className="m-kicker !text-[10px]">{r.label}</dt>
                          <dd className="m-mono mt-1 text-xs">{r.value}</dd>
                        </div>
                      ))}
                    </dl>
                    <Link
                      href={href('/configura/?step=0')}
                      onClick={() => setCar(c.id)}
                      className="m-link mt-4 inline-flex items-center gap-2 text-sm"
                      aria-label={`${t('th.marque.brands.configure')} ${carName(c)}`}
                    >
                      {t('th.marque.brands.configure')} <span aria-hidden>→</span>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-ink-2">
              {minRate && t('th.marque.brands.rateNote', { price: rate(minRate) })} {t('price.disclaimer')}
            </p>
          </div>
        </div>

        {/* deliveries for this brand */}
        <div className="mt-16">
          <h3 className="m-title text-2xl sm:text-3xl">{t('th.marque.brands.deliveries', { brand: name })}</h3>
          {deliveries.length ? (
            <ul className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
              {deliveries.map((d) => (
                <li key={d.slot}>
                  <Photo slot={d.slot} ratio="4/5" tone="accent" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-ink-2">{t('th.marque.brands.noDeliveries')}</p>
          )}
        </div>
      </BrandScope>
    </section>
  );
}

// ——— HomeSections ———
export function HomeSections() {
  const t = useT();
  const href = useStyleHref();
  const { FleetSection } = useTheme().components;
  return (
    <div className="space-y-24 sm:space-y-32">
      <BrandMarquee />
      <BrandSection />

      <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
        <FleetSection variant="home" />
      </div>

      {/* steps */}
      <section aria-labelledby="h-steps" className="mx-auto max-w-[1440px] px-4 sm:px-8">
        <p className="m-kicker">{t('th.marque.sections.stepsKicker')}</p>
        <h2 id="h-steps" className="m-title mt-3 text-4xl sm:text-5xl">
          {t('claims.steps')}
        </h2>
        <ol className="mt-10 grid border-t border-ink sm:grid-cols-3">
          {t.dict.steps3.map((s, i) => (
            <li key={s.title} className="border-b border-line py-8 sm:border-b-0 sm:border-r sm:px-8 sm:first:pl-0 sm:last:border-r-0">
              <span className="m-mono text-sm text-ink-2">0{i + 1}</span>
              <h3 className="m-title mt-6 text-3xl">{s.title}</h3>
              <p className="mt-2 text-ink-2">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* guarantees + numbers */}
      <section aria-labelledby="h-guar" className="bg-surface py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
          <p className="m-kicker">{t('th.marque.sections.guaranteesKicker')}</p>
          <h2 id="h-guar" className="m-title mt-3 text-4xl sm:text-5xl">
            {t('guarantees.title')}
          </h2>
          <ul className="mt-10 grid gap-px overflow-hidden rounded-theme bg-line sm:grid-cols-2 lg:grid-cols-4">
            {t.dict.guarantees.items.map((g, i) => (
              <li key={g.id} className="bg-bg p-6 sm:p-8">
                <span className="m-mono text-xs text-ink-2">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="m-title mt-8 text-xl">{g.title}</h3>
                <p className="mt-2 text-sm text-ink-2">{g.text}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
            {STATS.map((s) => (
              <div key={s.id} className="border-t border-ink pt-4">
                <dd className="m-display text-5xl sm:text-6xl">{s.value ?? PLACEHOLDER}</dd>
                <dt className="m-kicker mt-3">{t(`stats.${s.id}`)}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* testimonials */}
      <section aria-labelledby="h-test" className="mx-auto max-w-[1440px] px-4 sm:px-8">
        <p className="m-kicker">{t('th.marque.sections.testimonialsKicker')}</p>
        <h2 id="h-test" className="m-title mt-3 text-4xl sm:text-5xl">
          {t('testimonials.title')}
        </h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((q) => {
            const car = carById(q.carId);
            return (
              <BrandScope key={q.name} brand={car?.brand} className="border-t-2 border-accent pt-6 m-tr">
                <blockquote>
                  <p className="text-lg leading-relaxed">“{t.l(q.quote)}”</p>
                  <footer className="mt-5 text-sm text-ink-2">
                    <span className="font-semibold text-ink">{q.name}</span> · {t.l(q.role)} · {t.l(cityById(q.cityId)?.name ?? { it: PLACEHOLDER, en: PLACEHOLDER })}
                    <span className="m-mono mt-1 block text-xs">{car ? carName(car) : PLACEHOLDER}</span>
                  </footer>
                </blockquote>
              </BrandScope>
            );
          })}
        </div>
        <p className="mt-10 text-sm text-ink-2">
          <span className="m-kicker">{t('clientele.title')}</span> · {CLIENTELE.map((c) => t.l(c)).join(' · ')}
        </p>
      </section>

      {/* FAQ */}
      <section aria-labelledby="h-faq" className="mx-auto grid max-w-[1440px] gap-10 px-4 sm:px-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <div>
          <p className="m-kicker">{t('th.marque.sections.faqKicker')}</p>
          <h2 id="h-faq" className="m-title mt-3 text-4xl sm:text-5xl">
            {t('faq.title')}
          </h2>
        </div>
        <div className="border-t border-ink">
          {FAQ.map((f) => (
            <details key={f.q.it} className="m-faq border-b border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-medium">
                {t.l(f.q)}
                <span className="m-plus m-mono shrink-0 text-xl text-ink-2" aria-hidden>
                  +
                </span>
              </summary>
              <p className="max-w-2xl pb-6 text-ink-2">{t.l(f.a)}</p>
            </details>
          ))}
        </div>
      </section>

      {/* contact band */}
      <section aria-labelledby="h-contact" className="mx-auto max-w-[1440px] px-4 sm:px-8">
        <div className="grid gap-8 rounded-theme bg-ink p-8 text-bg sm:p-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="m-kicker !text-white/70">{t('th.marque.sections.contactKicker')}</p>
            <h2 id="h-contact" className="m-display mt-4 text-4xl sm:text-6xl">
              {t('th.marque.sections.contactTitle')}
            </h2>
            <p className="mt-4 max-w-xl text-white/75">{t('th.marque.sections.contactLead')}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href={href('/configura/')} className="inline-flex min-h-12 items-center justify-center rounded-theme bg-bg px-6 font-semibold text-ink transition-opacity hover:opacity-85">
              {t('cta.builder')} →
            </Link>
            <a
              href={`https://wa.me/${CONTACTS.whatsappDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-theme border border-white/40 px-6 font-semibold text-bg transition-colors hover:bg-white/10"
            >
              {t('cta.whatsapp')} · {CONTACTS.whatsapp}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
