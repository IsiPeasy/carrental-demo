'use client';

import Car3D from '@/components/Car3D';
import CarSilhouette from '@/components/CarSilhouette';
import { useTheme } from '@/components/ThemeProvider';
import { calendarKeyNav, monthMatrix, specRows, useCitySearch, useDailyRate, useDateRange, useSelectedCar } from '@/components/builder/kit';
import { useExtraPrice } from '@/components/neutral/steps';
import { DELIVERY_TYPES, FLEET, SERVICES, brandBySlug, carName, cityById } from '@/lib/data';
import { useT } from '@/lib/i18n';
import { discountFor, rentalDays } from '@/lib/pricing';
import { useBuilder } from '@/lib/store';
import type { StepProps } from '@/lib/themes';
import { formatDate } from '@/lib/whatsapp';
import { Label, radioKeyNav, roman, rovingTab } from './ui';

export function StepTitle({ n, title, lead }: { n: number; title: string; lead?: string }) {
  return (
    <header className="mb-10">
      <p className="font-display text-lg italic text-accent" aria-hidden>
        {roman(n)}.
      </p>
      <h1 className="nc-h1 mt-2">{title}</h1>
      {lead && <p className="mt-4 max-w-lg font-light text-ink-2">{lead}</p>}
    </header>
  );
}

// ——— I. Car: full-width turntable + thin silhouette row ———
export function CarStep(_: StepProps) {
  const t = useT();
  const { scene3D } = useTheme();
  const { carId, setCar } = useBuilder();
  const selected = useSelectedCar() ?? FLEET[0];
  const rate = useDailyRate();
  const idx = FLEET.indexOf(selected);
  return (
    <div>
      <StepTitle n={1} title={t('builder.car.title')} lead={t('builder.car.lead')} />
      <div className="nc-turntable">
        <Car3D
          {...scene3D}
          cameraPreset="turntable"
          dolly={false}
          autoRotate
          rotateSpeed={0.22}
          interactive
          spotlight={{ ...scene3D.spotlight, revealMs: 1400 }}
          bodyType={selected.bodyType}
          paint={selected.color.hex}
          className="nc-turntable-canvas"
          title={carName(selected)}
          fallbackStroke="rgba(200,169,106,.35)"
        />
        <div className="nc-turntable-meta">
          <Label className="text-ink-2">{t('th.nocturne.builder.showing', { n: idx + 1, total: FLEET.length })}</Label>
          <Label className="hidden text-ink-2 sm:block">{t('th.nocturne.builder.drag')}</Label>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
        <div className="min-w-0" aria-live="polite">
          <Label className="text-accent">
            {brandBySlug(selected.brand).name} · {t(`categories.${selected.category}`)}
          </Label>
          <p className="nc-carname mt-3">{selected.model}</p>
          <p className="mt-3 text-sm text-ink-2">
            <span className="text-ink">{t('fleet.fromDay', { price: rate(selected.id) })}</span> · {t('fleet.demoRate')}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 sm:grid-cols-3 lg:grid-cols-2">
          {specRows(selected, t).map((r) => (
            <div key={r.key} className="border-t border-line py-2">
              <dt className="nc-label text-[0.6rem] text-ink-2">{r.label}</dt>
              <dd className="mt-1 text-sm">{r.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div
        role="radiogroup"
        aria-label={t('th.nocturne.builder.selector')}
        onKeyDown={radioKeyNav}
        className="nc-carrow no-scrollbar mt-10"
      >
        {FLEET.map((c, i) => {
          const on = carId === c.id;
          return (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={rovingTab(on, i, !!carId)}
              onClick={() => setCar(c.id)}
              className={`nc-carchip ${on ? 'is-on' : ''}`}
            >
              <CarSilhouette bodyType={c.bodyType} color={c.color.hex} accent="#C8A96A" shadow={false} className="h-9 w-full" />
              <span className="mt-2 block truncate text-[11px] tracking-wide">{c.model}</span>
              <span className="sr-only"> {carName(c)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ——— II. Destination ———
function CityPicker({ value, onChange, label, idBase }: { value: string | null; onChange: (id: string) => void; label: string; idBase: string }) {
  const t = useT();
  const { q, setQ, results } = useCitySearch();
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <label className="nc-label text-ink-2" htmlFor={`${idBase}-search`}>
          {label}
        </label>
        <span className="text-xs text-ink-2">{t('th.nocturne.builder.cities', { n: results.length })}</span>
      </div>
      <input
        id={`${idBase}-search`}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t('builder.destination.search')}
        className="nc-input mt-3"
      />
      <div role="radiogroup" aria-label={label} onKeyDown={radioKeyNav} className="nc-citygrid mt-4">
        {results.map((c, i) => {
          const on = value === c.id;
          return (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={rovingTab(on, i, results.some((r) => r.id === value))}
              onClick={() => onChange(c.id)}
              className={`nc-city ${on ? 'is-on' : ''}`}
            >
              <span className="min-w-0 leading-snug">{t.l(c.name)}</span>
              <span className="nc-label text-[0.58rem] opacity-80">{c.code}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DestinationStep(_: StepProps) {
  const t = useT();
  const { cityId, setCity, deliveryType, setDeliveryType, returnCityId, setReturnCity } = useBuilder();
  const city = cityById(cityId);
  const ret = cityById(returnCityId);
  return (
    <div className="space-y-14">
      <StepTitle n={2} title={t('builder.destination.title')} lead={t('builder.destination.lead')} />
      <CityPicker idBase="nc-city" label={t('builder.destination.city')} value={cityId} onChange={setCity} />
      <fieldset>
        <legend className="nc-label text-ink-2">{t('builder.destination.type')}</legend>
        <div role="radiogroup" aria-label={t('builder.destination.type')} onKeyDown={radioKeyNav} className="mt-4 grid grid-cols-2 gap-px bg-line sm:grid-cols-3 xl:grid-cols-6">
          {DELIVERY_TYPES.map((d, i) => {
            const on = deliveryType === d;
            return (
              <button
                key={d}
                type="button"
                role="radio"
                aria-checked={on}
                tabIndex={rovingTab(on, i, !!deliveryType)}
                onClick={() => setDeliveryType(d)}
                className={`nc-place ${on ? 'is-on' : ''}`}
              >
                <span className="font-display text-sm italic text-accent" aria-hidden>
                  {roman(i + 1)}
                </span>
                <span className="mt-3 block font-display text-xl">{t(`deliveryTypes.${d}`)}</span>
              </button>
            );
          })}
        </div>
      </fieldset>
      <fieldset>
        <legend className="nc-label text-ink-2">{t('builder.destination.return')}</legend>
        <div role="radiogroup" aria-label={t('builder.destination.return')} onKeyDown={radioKeyNav} className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
          <button type="button" role="radio" aria-checked={!returnCityId} tabIndex={!returnCityId ? 0 : -1} onClick={() => setReturnCity(null)} className="nc-filter">
            {t('builder.destination.returnSame')}
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={!!returnCityId}
            tabIndex={returnCityId ? 0 : -1}
            disabled={!cityId}
            onClick={() => setReturnCity(returnCityId ?? (cityId === 'milano' ? 'roma' : 'milano'))}
            className="nc-filter disabled:opacity-40"
          >
            {t('builder.destination.returnOther')}
          </button>
        </div>
        {returnCityId && (
          <div className="mt-8">
            <CityPicker idBase="nc-return" label={t('builder.destination.returnCity')} value={returnCityId} onChange={setReturnCity} />
          </div>
        )}
        {city && ret && ret.country !== city.country && <p className="mt-4 text-sm italic text-accent">{t('builder.destination.oneWayNote')}</p>}
      </fieldset>
    </div>
  );
}

// ——— III. Dates: two months side by side ———
function Month({ y, m, cal }: { y: number; m: number; cal: ReturnType<typeof useDateRange> }) {
  const t = useT();
  return (
    <div className="nc-month">
      <p className="mb-4 text-center font-display text-xl">
        {t.dict.common.monthsLong[m]} <span className="italic text-ink-2">{y}</span>
      </p>
      <div className="grid grid-cols-7 text-center">
        {t.dict.common.weekdays.map((w) => (
          <span key={w} className="nc-label py-2 text-[0.58rem] text-ink-2" role="columnheader">
            {w}
          </span>
        ))}
        {monthMatrix(y, m)
          .flat()
          .map((iso, i) => {
            if (!iso) return <span key={`e${i}`} />;
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
                className={`nc-day is-${st} ${iso === cal.today ? 'is-today' : ''}`}
              >
                {Number(iso.slice(8))}
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
  const next = new Date(cal.view.y, cal.view.m + 1, 1);
  return (
    <div>
      <StepTitle n={3} title={t('builder.dates.title')} lead={t('builder.dates.pickRange')} />
      <div className="nc-calendar">
        <div className="mb-2 flex items-center justify-between">
          <button type="button" onClick={() => cal.shift(-1)} disabled={!cal.canPrev} aria-label={t('builder.dates.prevMonth')} className="nc-icon-btn disabled:opacity-25">
            <span aria-hidden>←</span>
          </button>
          <p className="sr-only" aria-live="polite">
            {t.dict.common.monthsLong[cal.view.m]} {cal.view.y}
          </p>
          <button type="button" onClick={() => cal.shift(1)} aria-label={t('builder.dates.nextMonth')} className="nc-icon-btn">
            <span aria-hidden>→</span>
          </button>
        </div>
        <div role="grid" onKeyDown={calendarKeyNav} className="grid gap-10 md:grid-cols-2">
          <Month y={cal.view.y} m={cal.view.m} cal={cal} />
          <div className="hidden md:block">
            <Month y={next.getFullYear()} m={next.getMonth()} cal={cal} />
          </div>
        </div>
      </div>
      <dl className="mt-10 grid grid-cols-3 border-y border-line">
        {[
          { k: t('builder.dates.from'), v: formatDate(cal.dateFrom, t.locale) },
          { k: t('builder.dates.to'), v: formatDate(cal.dateTo, t.locale) },
          { k: t('th.nocturne.builder.duration'), v: days ? (days === 1 ? t('builder.dates.day') : t('builder.dates.days', { n: days })) : '—' },
        ].map((r, i) => (
          <div key={r.k} className={`py-5 ${i ? 'border-l border-line pl-4 sm:pl-6' : ''}`}>
            <dt className="nc-label text-[0.6rem] text-ink-2">{r.k}</dt>
            <dd className="mt-2 font-display text-lg sm:text-2xl">{r.v}</dd>
          </div>
        ))}
      </dl>
      {pct > 0 && <p className="mt-4 text-sm italic text-accent">{t('builder.dates.discount', { pct, n: pct === 12 ? 7 : 3 })}</p>}
    </div>
  );
}

// ——— IV. Extras: ledger rows ———
export function ExtrasStep(_: StepProps) {
  const t = useT();
  const { extras, toggleExtra } = useBuilder();
  const price = useExtraPrice();
  return (
    <div>
      <StepTitle n={4} title={t('builder.extras.title')} lead={t('builder.extras.lead')} />
      <Label className="mb-3 text-ink-2">{t('builder.extras.optional')}</Label>
      <ul className="border-t border-line">
        {SERVICES.map((x, i) => {
          const on = extras.includes(x);
          return (
            <li key={x} className="border-b border-line">
              <label className={`nc-extra ${on ? 'is-on' : ''}`}>
                <input type="checkbox" checked={on} onChange={() => toggleExtra(x)} className="nc-check" />
                <span className="nc-label hidden w-10 shrink-0 text-accent sm:block" aria-hidden>
                  {roman(i + 1)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-xl">{t(`services.${x}.name`)}</span>
                  <span className="mt-1 block text-sm font-light text-ink-2">{t(`services.${x}.desc`)}</span>
                </span>
                <span className="shrink-0 text-right text-sm italic text-ink-2">{price(x)}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
