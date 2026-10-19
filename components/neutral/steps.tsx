'use client';

// Neutral step implementations. Every style may replace any of them via the
// registry; the logic (store actions, validation) stays the same.

import Car3D from '@/components/Car3D';
import CarSilhouette from '@/components/CarSilhouette';
import { useTheme } from '@/components/ThemeProvider';
import EstimatePanel from '@/components/builder/EstimatePanel';
import WhatsAppPreview from '@/components/builder/WhatsAppPreview';
import {
  calendarKeyNav,
  useCitySearch,
  useDailyRate,
  useDateRange,
  useMoney,
  useSelectedCar,
} from '@/components/builder/kit';
import { DELIVERY_TYPES, FLEET, SERVICES, brandBySlug, carById, carName, cityById } from '@/lib/data';
import { useT } from '@/lib/i18n';
import { ALWAYS_ON_REQUEST, EXTRA_PER_DAY, discountFor, rentalDays } from '@/lib/pricing';
import { useBuilder, useRateTable } from '@/lib/store';
import type { StepProps, SummaryProps } from '@/lib/themes';
import { formatDate } from '@/lib/whatsapp';

export function StepHeading({ title, lead }: { title: string; lead?: string }) {
  return (
    <header className="mb-6">
      <h1 className="font-display text-3xl sm:text-4xl">{title}</h1>
      {lead && <p className="mt-1 text-ink-2">{lead}</p>}
    </header>
  );
}

export function CarStep(_: StepProps) {
  const t = useT();
  const { scene3D } = useTheme();
  const { carId, setCar } = useBuilder();
  const selected = useSelectedCar() ?? FLEET[0];
  const rate = useDailyRate();
  return (
    <div>
      <StepHeading title={t('builder.car.title')} lead={t('builder.car.lead')} />
      <Car3D
        {...scene3D}
        bodyType={selected.bodyType}
        paint={selected.color.hex}
        className="mb-6 aspect-[16/9] w-full rounded-theme border border-line"
        title={carName(selected)}
      />
      <div role="radiogroup" aria-label={t('builder.car.title')} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {FLEET.map((c) => (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={carId === c.id}
            onClick={() => setCar(c.id)}
            className={`flex items-center gap-3 rounded-theme border p-3 text-left transition-colors ${
              carId === c.id ? 'border-accent bg-surface' : 'border-line hover:border-ink-2'
            }`}
          >
            <CarSilhouette bodyType={c.bodyType} color={c.color.hex} className="h-10 w-20 shrink-0" shadow={false} />
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{carName(c)}</span>
              <span className="block text-xs text-ink-2">{t('fleet.fromDay', { price: rate(c.id) })}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function CityList({ value, onChange, label }: { value: string | null; onChange: (id: string) => void; label: string }) {
  const t = useT();
  const { q, setQ, results } = useCitySearch();
  return (
    <div>
      <label className="label-caps text-ink-2" htmlFor={`search-${label}`}>{label}</label>
      <input
        id={`search-${label}`}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t('builder.destination.search')}
        className="mt-2 w-full rounded-theme border border-line bg-surface px-3 py-2 text-sm"
      />
      <div role="radiogroup" aria-label={label} className="mt-3 flex max-h-56 flex-wrap gap-2 overflow-auto">
        {results.map((c) => (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={value === c.id}
            onClick={() => onChange(c.id)}
            className={`rounded-theme border px-3 py-1.5 text-sm ${value === c.id ? 'border-accent bg-accent text-on-accent' : 'border-line hover:border-ink-2'}`}
          >
            {t.l(c.name)} <span className="font-mono text-[10px] opacity-70">{c.code}</span>
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
  return (
    <div className="space-y-8">
      <StepHeading title={t('builder.destination.title')} lead={t('builder.destination.lead')} />
      <CityList label={t('builder.destination.city')} value={cityId} onChange={setCity} />
      <fieldset>
        <legend className="label-caps text-ink-2">{t('builder.destination.type')}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {DELIVERY_TYPES.map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={deliveryType === d}
              onClick={() => setDeliveryType(d)}
              className={`rounded-theme border px-3 py-1.5 text-sm ${deliveryType === d ? 'border-accent bg-accent text-on-accent' : 'border-line hover:border-ink-2'}`}
            >
              {t(`deliveryTypes.${d}`)}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="label-caps text-ink-2">{t('builder.destination.return')}</legend>
        <div className="mt-2 flex gap-2">
          <button type="button" aria-pressed={!returnCityId} onClick={() => setReturnCity(null)} className={`rounded-theme border px-3 py-1.5 text-sm ${!returnCityId ? 'border-accent bg-accent text-on-accent' : 'border-line'}`}>
            {t('builder.destination.returnSame')}
          </button>
          <button type="button" aria-pressed={!!returnCityId} disabled={!cityId} onClick={() => setReturnCity(returnCityId ?? (cityId === 'milano' ? 'roma' : 'milano'))} className={`rounded-theme border px-3 py-1.5 text-sm disabled:opacity-40 ${returnCityId ? 'border-accent bg-accent text-on-accent' : 'border-line'}`}>
            {t('builder.destination.returnOther')}
          </button>
        </div>
        {returnCityId && (
          <div className="mt-4">
            <CityList label={t('builder.destination.returnCity')} value={returnCityId} onChange={setReturnCity} />
          </div>
        )}
        {city && ret && ret.country !== city.country && (
          <p className="mt-3 text-sm text-accent">{t('builder.destination.oneWayNote')}</p>
        )}
      </fieldset>
    </div>
  );
}

export function DatesStep(_: StepProps) {
  const t = useT();
  const cal = useDateRange();
  const days = rentalDays(cal.dateFrom, cal.dateTo);
  const pct = discountFor(days);
  return (
    <div>
      <StepHeading title={t('builder.dates.title')} lead={t('builder.dates.pickRange')} />
      <div className="max-w-md rounded-theme border border-line p-4">
        <div className="mb-3 flex items-center justify-between">
          <button type="button" onClick={() => cal.shift(-1)} disabled={!cal.canPrev} aria-label={t('builder.dates.prevMonth')} className="px-2 py-1 disabled:opacity-30">←</button>
          <p className="font-medium" aria-live="polite">{t.dict.common.monthsLong[cal.view.m]} {cal.view.y}</p>
          <button type="button" onClick={() => cal.shift(1)} aria-label={t('builder.dates.nextMonth')} className="px-2 py-1">→</button>
        </div>
        <div role="grid" onKeyDown={calendarKeyNav} className="grid grid-cols-7 gap-1 text-center text-sm">
          {t.dict.common.weekdays.map((w) => (
            <span key={w} className="py-1 text-xs text-ink-2" role="columnheader">{w}</span>
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
                className={`rounded-theme py-2 tabular-nums disabled:opacity-25 ${
                  st === 'edge' ? 'bg-accent text-on-accent' : st === 'in' ? 'bg-accent/20' : 'hover:bg-surface'
                }`}
              >
                {Number(iso.slice(8))}
              </button>
            );
          })}
        </div>
      </div>
      <dl className="mt-6 grid max-w-md grid-cols-3 gap-4 text-sm">
        <div><dt className="text-ink-2">{t('builder.dates.from')}</dt><dd>{formatDate(cal.dateFrom, t.locale)}</dd></div>
        <div><dt className="text-ink-2">{t('builder.dates.to')}</dt><dd>{formatDate(cal.dateTo, t.locale)}</dd></div>
        <div><dt className="text-ink-2">{t('builder.dates.title')}</dt><dd>{days ? (days === 1 ? t('builder.dates.day') : t('builder.dates.days', { n: days })) : '—'}</dd></div>
      </dl>
      {pct > 0 && <p className="mt-3 text-sm text-accent">{t('builder.dates.discount', { pct, n: pct === 12 ? 7 : 3 })}</p>}
    </div>
  );
}

export function useExtraPrice() {
  const t = useT();
  const rates = useRateTable();
  const money = useMoney();
  return (x: (typeof SERVICES)[number]) => {
    if (ALWAYS_ON_REQUEST[x] || x === 'jet' || rates.extras[x] == null) return t('builder.extras.onRequest');
    const v = money(rates.extras[x]!);
    return EXTRA_PER_DAY[x] ? t('builder.extras.perDay', { price: v }) : t('builder.extras.flat', { price: v });
  };
}

export function ExtrasStep(_: StepProps) {
  const t = useT();
  const { extras, toggleExtra } = useBuilder();
  const price = useExtraPrice();
  return (
    <div>
      <StepHeading title={t('builder.extras.title')} lead={t('builder.extras.lead')} />
      <div className="grid gap-3 sm:grid-cols-2">
        {SERVICES.map((x) => (
          <label key={x} className={`flex cursor-pointer items-start gap-3 rounded-theme border p-4 ${extras.includes(x) ? 'border-accent bg-surface' : 'border-line'}`}>
            <input type="checkbox" checked={extras.includes(x)} onChange={() => toggleExtra(x)} className="mt-1 accent-[var(--color-accent)]" />
            <span>
              <span className="block font-medium">{t(`services.${x}.name`)}</span>
              <span className="block text-sm text-ink-2">{t(`services.${x}.desc`)}</span>
              <span className="mt-1 block text-xs text-ink-2">{price(x)}</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function useSummaryRows() {
  const t = useT();
  const s = useBuilder();
  const car = carById(s.carId);
  const city = cityById(s.cityId);
  const ret = cityById(s.returnCityId);
  const rows = [
    { k: t('builder.summary.car'), v: car ? `${carName(car)} · ${t.l(car.color.name)}` : '—', step: 0 },
    { k: t('builder.summary.where'), v: city ? `${t.l(city.name)}${s.deliveryType ? ' · ' + t(`deliveryTypes.${s.deliveryType}`) : ''}` : '—', step: 1 },
    { k: t('builder.summary.returnAt'), v: ret ? t.l(ret.name) : t('builder.destination.returnSame'), step: 1 },
    { k: t('builder.summary.when'), v: `${formatDate(s.dateFrom, t.locale)} → ${formatDate(s.dateTo, t.locale)}`, step: 2 },
    { k: t('builder.summary.extras'), v: s.extras.length ? s.extras.map((x) => t(`services.${x}.name`)).join(', ') : t('builder.summary.none'), step: 3 },
  ];
  return rows;
}

export function SummaryVariant({ nav, estimate, message, url }: SummaryProps) {
  const t = useT();
  const rows = useSummaryRows();
  const car = carById(useBuilder((s) => s.carId));
  return (
    <div>
      <StepHeading title={t('builder.summary.title')} lead={t('builder.summary.lead')} />
      {car && <p className="mb-4 text-sm text-ink-2">{brandBySlug(car.brand).name}</p>}
      <dl className="divide-y divide-line rounded-theme border border-line">
        {rows.map((r) => (
          <div key={r.k} className="flex items-start justify-between gap-4 p-4">
            <div>
              <dt className="label-caps text-ink-2">{r.k}</dt>
              <dd className="mt-1">{r.v}</dd>
            </div>
            <button type="button" onClick={() => nav.go(r.step)} className="text-sm text-accent underline-offset-4 hover:underline">
              {t('builder.edit')}
            </button>
          </div>
        ))}
      </dl>
      <EstimatePanel estimate={estimate} className="mt-6 rounded-theme border border-line p-4" />
      <WhatsAppPreview message={message} url={url} className="mt-6" />
    </div>
  );
}
