'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useStyleHref, useTheme } from '@/components/ThemeProvider';
import { useMoney } from '@/components/builder/kit';
import {
  AIRPORTS,
  CITIES,
  COUNTRIES,
  CONTACTS,
  DELIVERIES,
  FAQ,
  JET_ROUTES,
  PLACEHOLDER,
  STATS,
  carById,
  carName,
  cityById,
} from '@/lib/data';
import { useT } from '@/lib/i18n';
import { useInView } from '@/lib/hooks';
import { waContactUrl } from '@/lib/whatsapp';
import EuropeMap, { type BBox } from './EuropeMap';
import { Arrow, CheckIcon, GlyphIcon, Kicker, SectionHead } from './ui';

const CITY_BBOX: BBox = [-11, 35.2, 26, 56.2];

export default function HomeSections() {
  const t = useT();
  const { FleetSection } = useTheme().components;
  return (
    <div className="space-y-24 pb-8 pt-14 sm:space-y-28">
      <StatusStrip />
      <Orchestration />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <FleetSection variant="home" />
      </div>
      <CitiesByCountry />
      <JetRoutes />
      <section aria-labelledby="h-guar" className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHead id="h-guar" kicker={t('th.itinerary.guarantees.kicker')} title={t('guarantees.title')} />
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {t.dict.guarantees.items.map((g) => (
            <li key={g.id} className="itin-card p-5">
              <span className="itin-icon-badge">
                <CheckIcon className="h-4 w-4" />
              </span>
              <h3 className="mt-4 font-semibold tracking-tight">{g.title}</h3>
              <p className="mt-1 text-sm text-ink-2">{g.text}</p>
            </li>
          ))}
        </ul>
      </section>
      <Faq />
      <Contacts />
    </div>
  );
}

function StatusStrip() {
  const t = useT();
  return (
    <section aria-labelledby="h-status" className="mx-auto max-w-7xl px-4 sm:px-6">
      <h2 id="h-status" className="sr-only">{t('th.itinerary.status.title')}</h2>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <dl className="itin-card grid grid-cols-2 divide-line sm:grid-cols-5 sm:divide-x">
          {STATS.map((s) => (
            <div key={s.id} className="p-4 sm:p-5">
              <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-2">{t(`stats.${s.id}`)}</dt>
              <dd className="mt-2 font-display text-3xl font-semibold tabular-nums tracking-tight">
                {s.value ?? <span className="text-ink-2">{PLACEHOLDER}</span>}
              </dd>
            </div>
          ))}
        </dl>
        <ol className="itin-card grid grid-cols-3 divide-x divide-line" aria-label={t('claims.steps')}>
          {t.dict.steps3.map((s, i) => (
            <li key={s.title} className="p-4 sm:p-5">
              <span className="font-mono text-[11px] text-accent">0{i + 1}</span>
              <p className="mt-1 font-semibold tracking-tight">{s.title}</p>
              <p className="mt-1 text-xs leading-snug text-ink-2 sm:text-sm">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Orchestration() {
  const t = useT();
  const money = useMoney();
  const [ref, inView] = useInView<HTMLOListElement>();
  const route = JET_ROUTES[0];
  const airport = AIRPORTS.find((a) => a.code === route.to);
  const delivery = DELIVERIES[0];
  const car = carById(delivery.carId);
  const vars: Record<string, Record<string, string>> = {
    jet: { route: t.l(route.label) },
    vip: { airport: airport ? `${airport.name} (${airport.code})` : PLACEHOLDER },
    car: { car: car ? carName(car) : PLACEHOLDER },
    yacht: { place: delivery.place },
  };
  const meta: Record<string, string> = {
    jet: t('jet.from', { price: money(route.fromPrice) }),
    vip: airport?.code ?? PLACEHOLDER,
    car: `${delivery.place} · ${t.dict.common.months[delivery.month.month - 1]} ${delivery.month.year}`,
    yacht: cityById(delivery.cityId) ? t.l(cityById(delivery.cityId)!.name) : PLACEHOLDER,
  };
  return (
    <section aria-labelledby="h-orch" className="mx-auto max-w-7xl px-4 sm:px-6">
      <SectionHead id="h-orch" kicker={t('th.itinerary.orch.kicker')} title={t('th.itinerary.orch.title')} lead={t('th.itinerary.orch.lead')} />
      <div className="itin-card overflow-hidden">
        <ol
          ref={ref}
          className={`itin-timeline no-scrollbar ${inView ? 'is-in' : ''}`}
          aria-label={t('th.itinerary.orch.kicker')}
        >
          {t.dict.th.itinerary.orch.steps.map((s, i) => (
            <li key={s.id} className="itin-tl-item" style={{ ['--i' as string]: i }}>
              <div className="itin-tl-rail" aria-hidden>
                <span className="itin-tl-node">
                  <GlyphIcon name={s.id} className="h-4 w-4" />
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-2">
                  0{i + 1} · {s.tag}
                </span>
                <span className="itin-time" title={t('th.itinerary.orch.timeLabel')}>
                  <span className="sr-only">{t('th.itinerary.orch.timeLabel')}: </span>
                  {PLACEHOLDER}
                </span>
              </div>
              <h3 className="mt-3 text-lg font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-2">{t(`th.itinerary.orch.steps.${i}.text`, vars[s.id])}</p>
              <p className="mt-4 font-mono text-xs text-ink">{meta[s.id]}</p>
            </li>
          ))}
        </ol>
      </div>
      <p className="mt-3 font-mono text-[11px] text-ink-2">
        {t('th.itinerary.orch.note')} · {t('price.disclaimer')}
      </p>
    </section>
  );
}

function CitiesByCountry() {
  const t = useT();
  const [country, setCountry] = useState<(typeof COUNTRIES)[number] | 'all'>('all');
  const list = useMemo(
    () =>
      CITIES.filter((c) => country === 'all' || c.country === country).sort((a, b) => t.l(a.name).localeCompare(t.l(b.name))),
    [country, t],
  );
  const options = [
    { value: 'all' as const, label: t('th.itinerary.cities.all'), n: CITIES.length },
    ...COUNTRIES.map((c) => ({ value: c, label: t(`countries.${c}`), n: CITIES.filter((x) => x.country === c).length })),
  ];
  return (
    <section aria-labelledby="h-cities" className="mx-auto max-w-7xl px-4 sm:px-6">
      <SectionHead id="h-cities" kicker={t('th.itinerary.cities.kicker')} title={t('th.itinerary.cities.title')} lead={t('th.itinerary.cities.lead')} />
      <fieldset className="mb-5">
        <legend className="sr-only">{t('th.itinerary.chat.country')}</legend>
        <div className="flex flex-wrap gap-2">
          {options.map((o) => (
            <button key={o.value} type="button" aria-pressed={country === o.value} onClick={() => setCountry(o.value)} className="itin-chip">
              <span>{o.label}</span>
              <span className="itin-chip-sub">{o.n}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="itin-card flex max-h-[30rem] flex-col overflow-hidden">
          <p className="flex items-center justify-between border-b border-line px-4 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-2" aria-live="polite">
            <span>{country === 'all' ? t('th.itinerary.cities.all') : t(`countries.${country}`)}</span>
            <span>{t('th.itinerary.cities.count', { n: list.length })}</span>
          </p>
          <ul className="flex-1 divide-y divide-line overflow-auto">
            {list.map((c) => (
              <li key={c.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                <span className="itin-code w-12 justify-center">{c.code}</span>
                <span className="flex-1 font-medium">{t.l(c.name)}</span>
                <span className="font-mono text-[11px] text-ink-2">
                  {c.country} · {t('th.itinerary.cities.zone')} {c.zone}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="itin-card overflow-hidden">
          <EuropeMap
            bbox={CITY_BBOX}
            width={1000}
            cities={CITIES}
            highlight={list.map((c) => c.id)}
            focusCountries={country === 'all' ? COUNTRIES : [country]}
            labels={country !== 'all'}
            className="block h-auto w-full"
            title={t('th.itinerary.cities.title')}
          />
        </div>
      </div>
    </section>
  );
}

function JetRoutes() {
  const t = useT();
  const money = useMoney();
  return (
    <section aria-labelledby="h-jet" className="mx-auto max-w-7xl px-4 sm:px-6">
      <SectionHead id="h-jet" kicker={t('th.itinerary.jet.kicker')} title={t('jet.title')} lead={t('th.itinerary.jet.lead')} />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {JET_ROUTES.map((r) => (
          <li key={r.to} className="itin-card p-5">
            <div className="flex items-center gap-2 font-mono text-sm">
              <span className="itin-code">MIL</span>
              <span className="itin-route-line" aria-hidden>
                <GlyphIcon name="jet" className="h-3.5 w-3.5" />
              </span>
              <span className="itin-code">{r.to}</span>
            </div>
            <p className="mt-4 font-semibold tracking-tight">{t.l(r.label)}</p>
            <p className="mt-1 font-display text-2xl font-semibold tabular-nums tracking-tight">
              {t('jet.from', { price: money(r.fromPrice) })}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-3 font-mono text-[11px] text-ink-2">{t('price.disclaimer')}</p>
    </section>
  );
}

function Faq() {
  const t = useT();
  return (
    <section aria-labelledby="h-faq" className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <div className="self-start lg:sticky lg:top-24">
          <SectionHead id="h-faq" kicker={t('th.itinerary.faq.kicker')} title={t('faq.title')} />
        </div>
        <div className="itin-card divide-y divide-line">
          {FAQ.map((f) => (
            <details key={f.q.it} className="itin-faq group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium">
                <span>{t.l(f.q)}</span>
                <span className="itin-faq-icon" aria-hidden />
              </summary>
              <p className="px-5 pb-5 text-sm leading-relaxed text-ink-2">{t.l(f.a)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contacts() {
  const t = useT();
  const href = useStyleHref();
  return (
    <section aria-labelledby="h-contacts" className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="itin-card itin-contact grid gap-8 p-6 sm:p-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:items-center">
        <div>
          <Kicker>{t('th.itinerary.contacts.kicker')}</Kicker>
          <h2 id="h-contacts" className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {t('th.itinerary.contacts.title')}
          </h2>
          <p className="mt-2 text-ink-2">{t('th.itinerary.contacts.lead')}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={waContactUrl(t.locale)} target="_blank" rel="noopener noreferrer" className="itin-btn itin-btn-primary">
              {t('cta.whatsapp')} <Arrow />
            </a>
            <Link href={href('/configura/')} className="itin-btn itin-btn-ghost">
              {t('cta.builder')}
            </Link>
          </div>
        </div>
        <dl className="grid gap-px overflow-hidden rounded-theme border border-line bg-line sm:grid-cols-2">
          {[
            { k: `${t('contacts.whatsapp')} · ${t('contacts.phone')}`, v: CONTACTS.whatsapp, href: waContactUrl(t.locale) },
            { k: t('contacts.email'), v: CONTACTS.email, href: `mailto:${CONTACTS.email}` },
            { k: t('contacts.address'), v: CONTACTS.address },
            { k: t('contacts.social'), v: `${CONTACTS.social} · ${CONTACTS.socialNetworks.join(' / ')}` },
          ].map((r) => (
            <div key={r.k} className="bg-surface p-4">
              <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-2">{r.k}</dt>
              <dd className="mt-1 text-sm font-medium">
                {r.href ? (
                  <a href={r.href} className="itin-link">
                    {r.v}
                  </a>
                ) : (
                  r.v
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
