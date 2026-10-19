'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import CarSilhouette from '@/components/CarSilhouette';
import EstimatePanel from '@/components/builder/EstimatePanel';
import { calendarKeyNav, monthMatrix, specRows, useCitySearch, useDailyRate, useDateRange, useSelectedCar } from '@/components/builder/kit';
import { useExtraPrice, useSummaryRows } from '@/components/neutral/steps';
import { CITIES, CONTACTS, DELIVERY_TYPES, FLEET, REGIONS, brandBySlug, carName, cityById, type City, type Region, type ServiceId } from '@/lib/data';
import { useT } from '@/lib/i18n';
import { discountFor, rentalDays } from '@/lib/pricing';
import { todayISO, useBuilder } from '@/lib/store';
import type { StepProps, SummaryProps } from '@/lib/themes';
import { formatDate } from '@/lib/whatsapp';
import { useMonogram } from './Hero';
import { DeliveryIcon, Ornament, Stamp, WaxSeal, roman } from './shared';

// ——— helpers ———

function StepTitle({ n, title, lead }: { n: number; title: string; lead?: string }) {
  return (
    <header className="no-print mb-10">
      <p className="rv-numeral rv-numeral-sm" aria-hidden>
        {roman(n)}
      </p>
      <h1 className="rv-display mt-1 text-[clamp(2.2rem,4.4vw,3.4rem)] leading-[1.02]">{title}</h1>
      {lead && <p className="rv-display rv-it mt-3 text-lg text-ink-2 sm:text-xl">{lead}</p>}
    </header>
  );
}

/** Arrow keys move and select inside a radiogroup (roving tabindex). */
function radioKeys(e: KeyboardEvent<HTMLElement>) {
  const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
  if (!step) return;
  const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]:not([disabled])'));
  const i = items.indexOf(document.activeElement as HTMLElement);
  if (i < 0) return;
  e.preventDefault();
  const next = items[(i + step + items.length) % items.length];
  next.focus();
  next.click();
}
const roving = (checked: boolean, index: number, anyChecked: boolean) => (checked || (!anyChecked && index === 0) ? 0 : -1);

// ——— 0 · Car ———

export function CarStep(_: StepProps) {
  const t = useT();
  const { carId, setCar } = useBuilder();
  const car = useSelectedCar();
  const rate = useDailyRate();
  return (
    <div>
      <StepTitle n={1} title={t('builder.car.title')} lead={t('builder.car.lead')} />
      <section className="rv-cover" aria-live="polite">
        <div className="rv-cover-plate">
          {car ? (
            <CarSilhouette bodyType={car.bodyType} color={car.color.hex} className="rv-cover-sil" title={carName(car)} />
          ) : (
            <p className="rv-display rv-it text-xl text-ink-2">{t('th.riviera.builder.car.empty')}</p>
          )}
          <span className="rv-cover-horizon" aria-hidden />
        </div>
        {car && (
          <div className="rv-cover-text">
            <p className="rv-kicker-plain">{t('th.riviera.builder.car.cover')}</p>
            <p className="mt-3 text-[0.72rem] uppercase tracking-[0.2em] text-ink-2">
              {brandBySlug(car.brand).name} · {t(`categories.${car.category}`)}
            </p>
            <h2 className="rv-display rv-it text-[2.4rem] leading-none">{car.model}</h2>
            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {specRows(car, t).map((r) => (
                <div key={r.key} className="border-t border-line pt-1.5">
                  <dt className="text-xs text-ink-2">{r.label}</dt>
                  <dd>{r.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm">
              {t('fleet.fromDay', { price: rate(car.id) })} <span className="text-xs text-ink-2">· {t('fleet.demoRate')}</span>
            </p>
          </div>
        )}
      </section>

      <h2 className="rv-kicker-plain mt-14">{t('th.riviera.builder.car.index')}</h2>
      <div role="radiogroup" aria-label={t('builder.car.title')} onKeyDown={radioKeys} className="rv-index mt-4 grid sm:grid-cols-2">
        {FLEET.map((c, i) => (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={carId === c.id}
            tabIndex={roving(carId === c.id, i, !!carId)}
            onClick={() => setCar(c.id)}
            className="rv-index-row"
          >
            <span className="rv-index-no">{String(i + 1).padStart(2, '0')}</span>
            <CarSilhouette bodyType={c.bodyType} color={c.color.hex} className="h-7 w-16 shrink-0" shadow={false} />
            <span className="min-w-0 flex-1 text-left">
              <span className="block text-[0.66rem] uppercase tracking-[0.18em] text-ink-2">{brandBySlug(c.brand).name}</span>
              <span className="rv-display rv-it block truncate text-lg leading-tight">{c.model}</span>
              <span className="block text-xs tabular-nums text-ink-2 sm:hidden">{t('fleet.fromDay', { price: rate(c.id) })}</span>
            </span>
            <span className="hidden shrink-0 text-right text-xs tabular-nums text-ink-2 sm:block">{t('fleet.fromDay', { price: rate(c.id) })}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ——— 1 · Destination (signature: deck of postcards) ———

function Constellation({ cities, className = '' }: { cities: City[]; className?: string }) {
  const lons = cities.map((c) => c.lon);
  const lats = cities.map((c) => c.lat);
  const [w, e, s, n] = [Math.min(...lons), Math.max(...lons), Math.min(...lats), Math.max(...lats)];
  const k = Math.cos((((s + n) / 2) * Math.PI) / 180);
  const spanX = Math.max((e - w) * k, 0.5);
  const spanY = Math.max(n - s, 0.5);
  const sc = Math.min(150 / spanX, 62 / spanY);
  const ox = (200 - (e - w) * k * sc) / 2;
  const oy = 8 + (82 - (n - s) * sc) / 2;
  const pts = cities.map((c) => [ox + (c.lon - w) * k * sc, oy + (n - c.lat) * sc] as const);
  const order = pts.map((_, i) => i).sort((a, b) => pts[a][0] - pts[b][0]);
  return (
    <svg viewBox="0 0 200 90" className={className} aria-hidden>
      <path d={`M${order.map((i) => `${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)}`).join(' L')}`} fill="none" stroke="var(--color-accent-2)" strokeWidth=".9" strokeDasharray="2.5 3" />
      {pts.map(([x, y], i) => (
        <g key={cities[i].id}>
          <circle cx={x} cy={y} r="2.6" fill="var(--color-surface)" stroke="var(--color-accent)" strokeWidth="1.1" />
          <text x={x > 140 ? x - 5 : x + 5} y={y - 4} textAnchor={x > 140 ? 'end' : 'start'} fontSize="7.5" letterSpacing=".8" fill="var(--color-ink-2)" fontFamily="var(--font-body)">
            {cities[i].code}
          </text>
        </g>
      ))}
    </svg>
  );
}

function RegionCard({
  region,
  open,
  onToggle,
  cityId,
  onPick,
  index,
}: {
  region: Region;
  open: boolean;
  onToggle: (open: boolean) => void;
  cityId: string | null;
  onPick: (id: string) => void;
  index: number;
}) {
  const t = useT();
  const id = useId();
  const frontRef = useRef<HTMLButtonElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(open);
  const cities = CITIES.filter((c) => c.region === region).sort((a, b) => t.l(a.name).localeCompare(t.l(b.name)));
  const chosen = cities.find((c) => c.id === cityId);
  const name = t(`regions.${region}`);

  // move focus with the flip (only after a user toggle)
  useEffect(() => {
    if (open && !wasOpen.current) {
      const target = backRef.current?.querySelector<HTMLElement>('[role="radio"][tabindex="0"]');
      setTimeout(() => target?.focus({ preventScroll: true }), 60);
    }
    wasOpen.current = open;
  }, [open]);

  return (
    <li className={`rv-pc ${open ? 'is-open' : ''} ${chosen ? 'is-chosen' : ''}`} style={{ ['--tilt' as string]: `${[-1.4, 0.9, -0.6, 1.3, -1, 0.6][index % 6]}deg` }}>
      <div className="rv-pc-inner">
        <button
          ref={frontRef}
          type="button"
          className="rv-pc-face rv-pc-front"
          aria-expanded={open}
          aria-controls={`${id}-back`}
          aria-label={t('th.riviera.builder.dest.show', { region: name }) + (chosen ? ` · ${t('th.riviera.builder.dest.here')}: ${t.l(chosen.name)}` : '')}
          inert={open}
          onClick={() => onToggle(true)}
        >
          <span className="flex items-start justify-between gap-3">
            <span className="text-left">
              <span className="rv-pc-label">{t('th.riviera.hero.card')}</span>
              <span className="rv-display rv-it mt-1 block text-[1.9rem] leading-[1.02]">{name}</span>
              <span className="mt-1 block text-sm text-ink-2">{t('th.riviera.builder.dest.cities', { n: cities.length })}</span>
            </span>
            <Stamp code={(chosen ?? cities[0]).code} tone={chosen ? 'terra' : 'navy'} className="rv-pc-stamp" />
          </span>
          <Constellation cities={cities} className="mt-auto w-full" />
          {chosen && (
            <span className="rv-pc-chosen">
              {t('th.riviera.builder.dest.here')} · {t.l(chosen.name)}
            </span>
          )}
        </button>
        <div
          ref={backRef}
          id={`${id}-back`}
          className="rv-pc-face rv-pc-back"
          inert={!open}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              onToggle(false);
              frontRef.current?.focus();
            }
          }}
        >
          <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
            <span className="rv-display rv-it text-xl">{name}</span>
            <button
              type="button"
              className="rv-link shrink-0 text-xs"
              onClick={() => {
                onToggle(false);
                setTimeout(() => frontRef.current?.focus(), 30);
              }}
            >
              ↺ {t('th.riviera.builder.dest.back')}
            </button>
          </div>
          <div role="radiogroup" aria-label={name} onKeyDown={radioKeys} className="mt-2 grid grid-cols-2 gap-x-3">
            {cities.map((c, i) => (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={cityId === c.id}
                tabIndex={roving(cityId === c.id, i, !!chosen)}
                onClick={() => onPick(c.id)}
                className="rv-city"
              >
                <span className="min-w-0 leading-tight">{t.l(c.name)}</span>
                <span className="rv-city-code">{c.code}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </li>
  );
}

function CityPicker({ value, onChange, label }: { value: string | null; onChange: (id: string) => void; label: string }) {
  const t = useT();
  const id = useId();
  const { q, setQ, results } = useCitySearch();
  const any = results.some((c) => c.id === value);
  return (
    <div className="mt-6">
      <label htmlFor={`${id}-q`} className="rv-kicker-plain">
        {label}
      </label>
      <input id={`${id}-q`} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('builder.destination.search')} className="rv-input mt-2" />
      <div role="radiogroup" aria-label={label} onKeyDown={radioKeys} className="mt-4 flex max-h-56 flex-wrap gap-2 overflow-auto p-1">
        {results.map((c, i) => (
          <button key={c.id} type="button" role="radio" aria-checked={value === c.id} tabIndex={roving(value === c.id, i, any)} onClick={() => onChange(c.id)} className="rv-chip">
            {t.l(c.name)} <span className="rv-city-code">{c.code}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function DestinationStep(_: StepProps) {
  const t = useT();
  const { cityId, setCity, deliveryType, setDeliveryType, returnCityId, setReturnCity } = useBuilder();
  const city = cityById(cityId);
  const ret = cityById(returnCityId);
  const [open, setOpen] = useState<Region | null>(null);
  return (
    <div className="space-y-14">
      <StepTitle n={2} title={t('builder.destination.title')} lead={t('builder.destination.lead')} />

      <section aria-labelledby="rv-deck">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="rv-deck" className="rv-kicker-plain">
              {t('builder.destination.city')} · {t('th.riviera.builder.dest.deck')}
            </h2>
            <p className="mt-1 text-sm text-ink-2">{t('th.riviera.builder.dest.deckHint')}</p>
          </div>
          <p className="flex items-center gap-3" aria-live="polite">
            {city ? (
              <>
                <span className="text-sm text-ink-2">{t('th.riviera.builder.dest.chosen')}</span>
                <span className="rv-display rv-it text-2xl">{t.l(city.name)}</span>
                <Stamp code={city.code} tone="terra" className="rv-stamp-xs" />
              </>
            ) : (
              <span className="rv-display rv-it text-ink-2">{t('th.riviera.builder.dest.none')}</span>
            )}
          </p>
        </div>
        <ul className="rv-deck mt-8">
          {REGIONS.map((r, i) => (
            <RegionCard
              key={r}
              region={r}
              index={i}
              open={open === r}
              onToggle={(o) => setOpen(o ? r : null)}
              cityId={cityId}
              onPick={setCity}
            />
          ))}
        </ul>
      </section>

      <fieldset>
        <legend className="rv-kicker-plain">
          {t('builder.destination.type')} · {t('th.riviera.builder.dest.types')}
        </legend>
        <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {DELIVERY_TYPES.map((d) => (
            <button key={d} type="button" aria-pressed={deliveryType === d} onClick={() => setDeliveryType(d)} className="rv-type">
              <DeliveryIcon type={d} className="h-10 w-10" />
              <span>{t(`deliveryTypes.${d}`)}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="rv-kicker-plain">{t('builder.destination.return')}</legend>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" aria-pressed={!returnCityId} onClick={() => setReturnCity(null)} className="rv-choice">
            {t('builder.destination.returnSame')}
          </button>
          <button
            type="button"
            aria-pressed={!!returnCityId}
            disabled={!cityId}
            onClick={() => setReturnCity(returnCityId ?? (cityId === 'milano' ? 'roma' : 'milano'))}
            className="rv-choice"
          >
            {t('builder.destination.returnOther')}
          </button>
        </div>
        {returnCityId && <CityPicker label={t('builder.destination.returnCity')} value={returnCityId} onChange={setReturnCity} />}
        {city && ret && ret.country !== city.country && <p className="rv-display rv-it mt-4 text-accent">{t('builder.destination.oneWayNote')}</p>}
      </fieldset>
    </div>
  );
}

// ——— 2 · Dates ———

function Month({ y, m, cal }: { y: number; m: number; cal: ReturnType<typeof useDateRange> }) {
  const t = useT();
  const label = `${t.dict.common.monthsLong[m]} ${y}`;
  return (
    <div role="group" aria-label={label}>
      <p className="rv-display rv-it mb-4 text-center text-2xl">{label}</p>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {t.dict.common.weekdays.map((w) => (
          <span key={w} className="pb-2 text-[0.66rem] uppercase tracking-[0.16em] text-ink-2" aria-hidden>
            {w}
          </span>
        ))}
        {monthMatrix(y, m)
          .flat()
          .map((iso, i) => {
            if (!iso) return <span key={i} />;
            const st = cal.status(iso);
            return (
              <button
                key={iso}
                type="button"
                data-iso={iso}
                disabled={st === 'past'}
                aria-pressed={st === 'edge' || st === 'in'}
                aria-label={formatDate(iso, t.locale)}
                onClick={() => cal.pick(iso)}
                className={`rv-day rv-day-${st} ${iso === cal.dateFrom ? 'is-from' : ''} ${iso === cal.dateTo ? 'is-to' : ''}`}
              >
                <span>{Number(iso.slice(8))}</span>
              </button>
            );
          })}
      </div>
    </div>
  );
}

export function DatesStep(_: StepProps) {
  const t = useT();
  const cal = useDateRange();
  const days = rentalDays(cal.dateFrom, cal.dateTo);
  const pct = discountFor(days);
  const second = new Date(cal.view.y, cal.view.m + 1, 1);
  return (
    <div>
      <StepTitle n={3} title={t('builder.dates.title')} lead={t('builder.dates.pickRange')} />
      <section className="rv-almanac" aria-label={t('th.riviera.builder.dates.almanac')}>
        <div className="mb-2 flex items-center justify-between">
          <button type="button" onClick={() => cal.shift(-1)} disabled={!cal.canPrev} aria-label={t('builder.dates.prevMonth')} className="rv-round-btn">
            ←
          </button>
          <p className="rv-kicker-plain" aria-live="polite">
            {t.dict.common.monthsLong[cal.view.m]} {cal.view.y}
          </p>
          <button type="button" onClick={() => cal.shift(1)} aria-label={t('builder.dates.nextMonth')} className="rv-round-btn">
            →
          </button>
        </div>
        <div onKeyDown={calendarKeyNav} className="grid gap-10 md:grid-cols-2">
          <Month y={cal.view.y} m={cal.view.m} cal={cal} />
          <div className="hidden md:block">
            <Month y={second.getFullYear()} m={second.getMonth()} cal={cal} />
          </div>
        </div>
      </section>
      <dl className="rv-ticket mt-8">
        <div>
          <dt>{t('builder.dates.from')}</dt>
          <dd className="rv-display rv-it">{formatDate(cal.dateFrom, t.locale)}</dd>
        </div>
        <div>
          <dt>{t('builder.dates.to')}</dt>
          <dd className="rv-display rv-it">{formatDate(cal.dateTo, t.locale)}</dd>
        </div>
        <div>
          <dt>{t('th.riviera.builder.dates.duration')}</dt>
          <dd className="rv-display rv-it">{days ? (days === 1 ? t('builder.dates.day') : t('builder.dates.days', { n: days })) : '—'}</dd>
        </div>
      </dl>
      {pct > 0 && <p className="rv-display rv-it mt-4 text-lg text-accent">{t('builder.dates.discount', { pct, n: pct === 12 ? 7 : 3 })}</p>}
    </div>
  );
}

// ——— 3 · Extras (menu of services) ———

const GROUPS: { key: 'land' | 'sea'; items: ServiceId[] }[] = [
  { key: 'land', items: ['chauffeur', 'meet-greet', 'fast-track', 'porter', 'security', 'one-way'] },
  { key: 'sea', items: ['yacht', 'jet', 'helicopter'] },
];

export function ExtrasStep(_: StepProps) {
  const t = useT();
  const { extras, toggleExtra } = useBuilder();
  const price = useExtraPrice();
  return (
    <div>
      <StepTitle n={4} title={t('builder.extras.title')} lead={t('builder.extras.lead')} />
      <section className="rv-menu">
        <p className="rv-display rv-it text-center text-3xl">{t('th.riviera.builder.extras.menu')}</p>
        <Ornament className="mx-auto mt-3 w-32 text-accent-2" />
        {GROUPS.map((g) => (
          <fieldset key={g.key} className="mt-8">
            <legend className="rv-kicker-plain mx-auto">{t(`th.riviera.builder.extras.${g.key}`)}</legend>
            <ul className="mt-3">
              {g.items.map((x) => {
                const on = extras.includes(x);
                return (
                  <li key={x}>
                    <label className={`rv-menu-row ${on ? 'is-on' : ''}`}>
                      <input type="checkbox" checked={on} onChange={() => toggleExtra(x)} className="rv-check" />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline gap-2">
                          <span className="rv-display text-lg sm:text-xl">{t(`services.${x}.name`)}</span>
                          <span className="rv-leader" aria-hidden />
                          <span className="shrink-0 text-sm tabular-nums text-ink-2">{price(x)}</span>
                        </span>
                        <span className="block text-sm text-ink-2">{t(`services.${x}.desc`)}</span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        ))}
        <p className="mt-6 text-center text-xs text-ink-2">{t('price.disclaimer')}</p>
      </section>
    </div>
  );
}

// ——— 4 · Summary (letter on letterhead) ———

export function SummaryVariant({ nav, estimate, message, url }: SummaryProps) {
  const t = useT();
  const rows = useSummaryRows();
  const brand = t('brand.name');
  const monogram = useMonogram();
  const today = formatDate(todayISO(), t.locale);
  return (
    <div>
      <StepTitle n={5} title={t('builder.summary.title')} lead={t('builder.summary.lead')} />
      <article className="rv-letter" aria-label={t('builder.summary.title')}>
        <header className="rv-letterhead">
          <p className="rv-display rv-it text-4xl">{brand}</p>
          <p className="mt-1 text-[0.68rem] uppercase tracking-[0.28em] text-ink-2">{t('brand.claim')}</p>
          <Ornament className="mx-auto mt-4 w-28 text-accent-2" />
          <p className="mt-3 text-xs text-ink-2">
            {CONTACTS.address} · {CONTACTS.email} · {CONTACTS.whatsapp}
          </p>
        </header>

        <p className="mt-10 text-right text-sm italic text-ink-2">
          {t('th.riviera.builder.summary.place', { city: t.l(cityById('milano')!.name), date: today })}
        </p>
        <p className="rv-display rv-it mt-6 text-2xl">{t('th.riviera.builder.summary.dear')}</p>
        <p className="mt-3 max-w-xl leading-relaxed">{t('th.riviera.builder.summary.body')}</p>

        <h2 className="rv-kicker-plain mt-10">{t('th.riviera.builder.summary.details')}</h2>
        <dl className="mt-3">
          {rows.map((r) => (
            <div key={r.k} className="rv-letter-row">
              <dt>{r.k}</dt>
              <dd>{r.v}</dd>
              <button type="button" onClick={() => nav.go(r.step)} className="rv-link no-print text-xs" aria-label={`${t('builder.edit')} · ${r.k}`}>
                {t('builder.edit')}
              </button>
            </div>
          ))}
        </dl>

        <EstimatePanel estimate={estimate} className="rv-letter-estimate mt-8" />

        <h2 className="rv-kicker-plain mt-10">{t('th.riviera.builder.summary.message')}</h2>
        <p className="mt-1 text-xs text-ink-2">{t('wa.preview')}</p>
        <pre className="rv-wa-text mt-3">{message}</pre>

        <footer className="mt-10 flex items-end justify-between gap-6">
          <div>
            <p className="italic text-ink-2">{t('th.riviera.builder.summary.closing')}</p>
            <p className="rv-signature mt-2">{t('th.riviera.builder.summary.signature')}</p>
          </div>
          <WaxSeal monogram={monogram} title={t('th.riviera.builder.summary.seal', { brand })} className="rv-seal" />
        </footer>

        <div className="no-print mt-10 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center">
          <a href={url} target="_blank" rel="noopener noreferrer" className="rv-btn rv-btn-primary justify-center">
            {t('wa.send')} <span aria-hidden>→</span>
          </a>
          <button type="button" onClick={() => window.print()} className="rv-link sm:ml-4">
            {t('th.riviera.builder.summary.print')}
          </button>
        </div>
      </article>
    </div>
  );
}

