'use client';

// Inline composers for the concierge chat (the question bubble itself is
// rendered by BuilderLayout). Logic = store actions + kit hooks only.

import { useMemo, useState } from 'react';
import CarSilhouette from '@/components/CarSilhouette';
import { useSummaryRows, useExtraPrice } from '@/components/neutral/steps';
import { calendarKeyNav, useCitySearch, useDailyRate, useDateRange } from '@/components/builder/kit';
import {
  CITIES,
  COUNTRIES,
  DELIVERY_TYPES,
  FLEET,
  PLACEHOLDER,
  brandBySlug,
  carName,
  cityById,
  type Category,
  type ServiceId,
} from '@/lib/data';
import { useT } from '@/lib/i18n';
import { discountFor, rentalDays } from '@/lib/pricing';
import { toISO, useBuilder } from '@/lib/store';
import type { StepProps, SummaryProps } from '@/lib/themes';
import { formatDate } from '@/lib/whatsapp';
import EuropeMap from './EuropeMap';
import { EstimateBlock, useItineraryMap } from './ItineraryCard';
import { Arrow, CheckIcon, Monogram, RadioChips, ToggleChip, rovingKeys } from './ui';

function Label({ children, htmlFor, id }: { children: React.ReactNode; htmlFor?: string; id?: string }) {
  const cls = 'mb-2 block font-mono text-[11px] uppercase tracking-[0.12em] text-ink-2';
  return htmlFor ? (
    <label htmlFor={htmlFor} className={cls}>
      {children}
    </label>
  ) : (
    <p id={id} className={cls}>
      {children}
    </p>
  );
}

// ——— 0 · car ———
export function CarStep(_: StepProps) {
  const t = useT();
  const { carId, setCar } = useBuilder();
  const rate = useDailyRate();
  const [cat, setCat] = useState<Category | 'all'>('all');
  const cats = (['supercar', 'sportiva', 'gt', 'suv', 'luxury'] as Category[]).filter((c) => FLEET.some((x) => x.category === c));
  const cars = FLEET.filter((c) => cat === 'all' || c.category === cat);
  const focusId = cars.some((c) => c.id === carId) ? carId : cars[0]?.id;
  return (
    <div className="space-y-4">
      <div role="toolbar" aria-label={t('th.itinerary.chat.filter')} className="flex flex-wrap gap-2" onKeyDown={(e) => rovingKeys(e, 'button', false)}>
        <ToggleChip pressed={cat === 'all'} onClick={() => setCat('all')}>
          {t('fleet.all')}
        </ToggleChip>
        {cats.map((c) => (
          <ToggleChip key={c} pressed={cat === c} onClick={() => setCat(c)}>
            {t(`categories.${c}`)}
          </ToggleChip>
        ))}
      </div>
      <div role="radiogroup" aria-label={t('builder.car.title')} onKeyDown={(e) => rovingKeys(e)} className="grid gap-2 sm:grid-cols-2">
        {cars.map((c) => {
          const on = carId === c.id;
          return (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={c.id === focusId ? 0 : -1}
              onClick={() => setCar(c.id)}
              className="itin-option"
            >
              <CarSilhouette bodyType={c.bodyType} color={c.color.hex} accent="#2b2b2b" className="h-9 w-[4.5rem] shrink-0" shadow={false} />
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-ink-2">
                  {brandBySlug(c.brand).name} · {t(`categories.${c.category}`)}
                </span>
                <span className="block truncate text-sm font-semibold">{c.model}</span>
                <span className="block font-mono text-[11px] text-ink-2">{t('fleet.fromDay', { price: rate(c.id) })}</span>
              </span>
              <span className="itin-radio" aria-hidden>
                {on && <CheckIcon className="h-3 w-3" />}
              </span>
            </button>
          );
        })}
      </div>
      <p className="font-mono text-[11px] text-ink-2">
        {t('fleet.demoRate')} · {t('price.disclaimer')}
      </p>
    </div>
  );
}

// ——— 1 · destination ———
export function DestinationStep(_: StepProps) {
  const t = useT();
  const { cityId, setCity, deliveryType, setDeliveryType, returnCityId, setReturnCity } = useBuilder();
  const city = cityById(cityId);
  const ret = cityById(returnCityId);
  const [country, setCountry] = useState<(typeof COUNTRIES)[number] | 'all'>(city?.country ?? 'all');
  const { q, setQ, results } = useCitySearch();
  const list = results.filter((c) => country === 'all' || c.country === country);
  const byCountry = useMemo(
    () =>
      COUNTRIES.map((k) => ({
        k,
        cities: CITIES.filter((c) => c.country === k).sort((a, b) => t.l(a.name).localeCompare(t.l(b.name))),
      })),
    [t],
  );
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div role="toolbar" aria-label={t('th.itinerary.chat.country')} className="flex flex-wrap gap-1.5" onKeyDown={(e) => rovingKeys(e, 'button', false)}>
            <ToggleChip pressed={country === 'all'} onClick={() => setCountry('all')} className="itin-chip-sm">
              {t('th.itinerary.cities.all')}
            </ToggleChip>
            {COUNTRIES.map((k) => (
              <ToggleChip key={k} pressed={country === k} onClick={() => setCountry(k)} className="itin-chip-sm">
                {t(`countries.${k}`)}
              </ToggleChip>
            ))}
          </div>
        </div>
        <label htmlFor="itin-city-search" className="sr-only">
          {t('builder.destination.search')}
        </label>
        <input
          id="itin-city-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('builder.destination.search')}
          className="itin-input mb-3"
        />
        <div className="itin-scrollbox">
          <RadioChips
            label={t('builder.destination.city')}
            value={cityId}
            onChange={setCity}
            options={list.map((c) => ({ value: c.id, label: t.l(c.name), sub: c.code }))}
          />
          {list.length === 0 && <p className="text-sm text-ink-2">—</p>}
        </div>
      </div>

      <div>
        <Label id="itin-type-label">{t('builder.destination.type')}</Label>
        <RadioChips
          label={t('builder.destination.type')}
          value={deliveryType}
          onChange={setDeliveryType}
          options={DELIVERY_TYPES.map((d) => ({ value: d, label: t(`deliveryTypes.${d}`) }))}
        />
      </div>

      <div>
        <Label id="itin-return-label">{t('builder.destination.return')}</Label>
        <RadioChips
          label={t('builder.destination.return')}
          value={returnCityId ? 'other' : 'same'}
          onChange={(v) => {
            if (v === 'same') setReturnCity(null);
            else if (!returnCityId && cityId) setReturnCity(cityId === 'milano' ? 'roma' : 'milano');
          }}
          options={[
            { value: 'same', label: t('builder.destination.returnSame') },
            { value: 'other', label: t('builder.destination.returnOther'), disabled: !cityId },
          ]}
        />
        {returnCityId && (
          <div className="mt-3 max-w-sm">
            <label htmlFor="itin-return" className="mb-1.5 block text-[13px] text-ink-2">
              {t('th.itinerary.chat.otherCity')}
            </label>
            <select id="itin-return" value={returnCityId} onChange={(e) => setReturnCity(e.target.value)} className="itin-input">
              {byCountry.map((g) => (
                <optgroup key={g.k} label={t(`countries.${g.k}`)}>
                  {g.cities
                    .filter((c) => c.id !== cityId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {t.l(c.name)} · {c.code}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>
        )}
        {city && ret && ret.country !== city.country && <p className="itin-note mt-3">{t('builder.destination.oneWayNote')}</p>}
      </div>
    </div>
  );
}

// ——— 2 · dates ———
export function DatesStep(_: StepProps) {
  const t = useT();
  const cal = useDateRange();
  const setDates = useBuilder((s) => s.setDates);
  const days = rentalDays(cal.dateFrom, cal.dateTo);
  const pct = discountFor(days);
  const plus = (n: number) => {
    if (!cal.dateFrom) return;
    const d = new Date(cal.dateFrom + 'T12:00:00');
    d.setDate(d.getDate() + n);
    setDates(cal.dateFrom, toISO(d));
  };
  return (
    <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,14rem)]">
      <div className="itin-calendar">
        <div className="mb-3 flex items-center justify-between">
          <button type="button" onClick={() => cal.shift(-1)} disabled={!cal.canPrev} aria-label={t('builder.dates.prevMonth')} className="itin-icon-btn">
            ←
          </button>
          <p className="font-semibold tracking-tight" aria-live="polite">
            {t.dict.common.monthsLong[cal.view.m]} <span className="font-mono text-ink-2">{cal.view.y}</span>
          </p>
          <button type="button" onClick={() => cal.shift(1)} aria-label={t('builder.dates.nextMonth')} className="itin-icon-btn">
            →
          </button>
        </div>
        <div role="grid" onKeyDown={calendarKeyNav} className="grid grid-cols-7 gap-1 text-center text-sm">
          {t.dict.common.weekdays.map((w) => (
            <span key={w} role="columnheader" className="py-1 font-mono text-[10px] uppercase text-ink-2">
              {w}
            </span>
          ))}
          {cal.weeks.flat().map((iso, i) => {
            const st = cal.status(iso);
            if (!iso) return <span key={i} />;
            return (
              <button
                key={iso}
                type="button"
                data-iso={iso}
                disabled={st === 'past'}
                aria-pressed={st === 'edge' || st === 'in'}
                aria-label={formatDate(iso, t.locale)}
                onClick={() => cal.pick(iso)}
                className={`itin-day is-${st} ${iso === cal.today ? 'is-today' : ''}`}
              >
                {Number(iso.slice(8))}
              </button>
            );
          })}
        </div>
      </div>
      <div className="space-y-3">
        <dl className="divide-y divide-line rounded-theme border border-line bg-bg text-sm">
          <div className="px-3 py-2.5">
            <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-2">{t('builder.dates.from')}</dt>
            <dd className="font-medium">{formatDate(cal.dateFrom, t.locale)}</dd>
          </div>
          <div className="px-3 py-2.5">
            <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-2">{t('builder.dates.to')}</dt>
            <dd className="font-medium">{formatDate(cal.dateTo, t.locale)}</dd>
          </div>
          <div className="px-3 py-2.5">
            <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-2">{t('builder.dates.title')}</dt>
            <dd className="font-medium">
              {days ? (days === 1 ? t('builder.dates.day') : t('builder.dates.days', { n: days })) : PLACEHOLDER}
            </dd>
          </div>
        </dl>
        <div>
          <Label>{t('th.itinerary.chat.quick')}</Label>
          <div className="flex flex-wrap gap-2">
            {[3, 7].map((n) => (
              <button key={n} type="button" disabled={!cal.dateFrom} onClick={() => plus(n)} aria-pressed={days === n} className="itin-chip itin-chip-sm">
                {t('th.itinerary.chat.plusDays', { n })}
                <span className="itin-chip-sub">−{discountFor(n)}%</span>
              </button>
            ))}
          </div>
        </div>
        {pct > 0 && <p className="itin-note">{t('builder.dates.discount', { pct, n: pct === 12 ? 7 : 3 })}</p>}
      </div>
    </div>
  );
}

// ——— 3 · extras ———
const GROUPS: { id: 'travel' | 'arrival' | 'onboard'; items: ServiceId[] }[] = [
  { id: 'travel', items: ['jet', 'helicopter', 'yacht', 'one-way'] },
  { id: 'arrival', items: ['meet-greet', 'fast-track', 'porter'] },
  { id: 'onboard', items: ['chauffeur', 'security'] },
];

export function ExtrasStep(_: StepProps) {
  const t = useT();
  const { extras, toggleExtra } = useBuilder();
  const price = useExtraPrice();
  const clear = () => extras.forEach((x) => toggleExtra(x));
  return (
    <div className="space-y-5">
      <ToggleChip pressed={extras.length === 0} onClick={clear}>
        {t('th.itinerary.chat.noExtras')}
      </ToggleChip>
      {GROUPS.map((g) => (
        <fieldset key={g.id}>
          <legend className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-2">{t(`th.itinerary.chat.groups.${g.id}`)}</legend>
          <div className="flex flex-wrap gap-2">
            {g.items.map((x) => (
              <ToggleChip key={x} pressed={extras.includes(x)} onClick={() => toggleExtra(x)} sub={price(x)}>
                {t(`services.${x}.name`)}
              </ToggleChip>
            ))}
          </div>
        </fieldset>
      ))}
      <p className="font-mono text-[11px] text-ink-2">{t('price.disclaimer')}</p>
    </div>
  );
}

// ——— 4 · summary: itinerary document + phone with the WhatsApp preview ———
export function SummaryVariant({ nav, estimate, message, url }: SummaryProps) {
  const t = useT();
  const rows = useSummaryRows();
  const map = useItineraryMap();
  const s = useBuilder();
  const city = cityById(s.cityId);
  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <article className="itin-doc" aria-labelledby="itin-doc-title">
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="flex items-center gap-3">
            <Monogram />
            <div>
              <h2 id="itin-doc-title" className="font-semibold tracking-tight">
                {t('th.itinerary.summary.doc')}
              </h2>
              <p className="font-mono text-[11px] text-ink-2">{t('brand.claim')}</p>
            </div>
          </div>
          <p className="font-mono text-[11px] text-ink-2">
            {t('th.itinerary.summary.ref')} {PLACEHOLDER}
          </p>
        </header>
        <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_minmax(0,15rem)]">
          <dl className="divide-y divide-line">
            {rows.map((r) => (
              <div key={r.k} className="flex items-start justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-2">{r.k}</dt>
                  <dd className="mt-0.5 text-sm font-medium">{r.v}</dd>
                </div>
                <button
                  type="button"
                  onClick={() => nav.go(r.step)}
                  className="itin-edit"
                  aria-label={t('th.itinerary.chat.editAria', { label: r.k })}
                >
                  {t('builder.edit')}
                </button>
              </div>
            ))}
          </dl>
          <div className="itin-mini-map flex items-center border-t border-line md:border-l md:border-t-0">
            <EuropeMap
              key={map.key}
              bbox={map.bbox}
              width={520}
              markScale={map.highlight.length ? 2.6 : 1.6}
              arcs={map.arcs}
              highlight={map.highlight}
              labels
              drawOnce
              className="block h-auto w-full"
              title={city ? `${t('th.itinerary.card.map')} · ${t.l(city.name)}` : t('th.itinerary.card.map')}
            />
          </div>
        </div>
        <EstimateBlock estimate={estimate} className="border-t border-line bg-bg px-5 py-4" />
      </article>

      <div>
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-2">{t('wa.preview')}</p>
        <div className="itin-phone" role="group" aria-label={t('th.itinerary.summary.phone')}>
          <div className="itin-phone-notch" aria-hidden />
          <div className="itin-phone-head">
            <Monogram className="itin-avatar" />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold">{t('th.itinerary.summary.to', { brand: t('brand.name') })}</p>
              <p className="text-[11px] opacity-80">{t('th.itinerary.summary.online')}</p>
            </div>
          </div>
          <div className="itin-phone-chat">
            <pre className="itin-wa-bubble">{message}</pre>
          </div>
        </div>
        <a href={url} target="_blank" rel="noopener noreferrer" className="itin-btn itin-btn-primary mt-4 w-full justify-center">
          {t('th.itinerary.summary.send')} <Arrow />
        </a>
        <p className="mt-2 text-center font-mono text-[11px] text-ink-2">{t('price.disclaimer')}</p>
      </div>
    </div>
  );
}
