'use client';

// Marque — the Trip Builder as an official manufacturer configurator.
// The layout inherits the selected car's brand accent (data-brand scope)
// through the summary.

import { useEffect, useId, useState, type CSSProperties, type ReactNode } from 'react';
import Car3D from '@/components/Car3D';
import CarSilhouette from '@/components/CarSilhouette';
import { useTheme } from '@/components/ThemeProvider';
import EstimatePanel from '@/components/builder/EstimatePanel';
import WhatsAppPreview from '@/components/builder/WhatsAppPreview';
import {
  calendarKeyNav,
  specRows,
  useCitySearch,
  useDailyRate,
  useDateRange,
  useMoney,
  useSelectedCar,
  useSwitcherOffset,
} from '@/components/builder/kit';
import { useExtraPrice, useSummaryRows } from '@/components/neutral/steps';
import {
  DELIVERY_TYPES,
  PLACEHOLDER,
  SERVICES,
  brandBySlug,
  brandsInFleet,
  carName,
  carsOfBrand,
  cityById,
  type BrandSlug,
  type Car,
} from '@/lib/data';
import { useT } from '@/lib/i18n';
import { discountFor, rentalDays } from '@/lib/pricing';
import { LAST_STEP, useBuilder, useEstimate } from '@/lib/store';
import type { BuilderLayoutProps, BuilderNav, StepProps, SummaryProps } from '@/lib/themes';
import { formatDate } from '@/lib/whatsapp';
import BrandMark, { BrandScope, brandStyle, brandVars, flagshipOf, rovingKeyNav, rovingTab, type BrandStyle } from './brand';
import { useModelCount } from './home';

const BRANDS_IN_FLEET = brandsInFleet();

/** relative luminance (0–1) of a #rrggbb colour */
function lum(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
/** caliper colour: the accent, or its silver/secondary when the accent is near-black */
const caliperOf = (s: BrandStyle) => (lum(s.accent) < 0.04 ? s.accent2 : s.accent);

// ——— shared bits ———
function StepHead({ n, title, lead }: { n: number; title: string; lead?: string }) {
  return (
    <header className="mb-8">
      <p className="m-kicker">{String(n + 1).padStart(2, '0')}</p>
      <h1 className="m-title mt-2 text-3xl sm:text-[2.6rem]">{title}</h1>
      {lead && <p className="mt-2 text-ink-2">{lead}</p>}
    </header>
  );
}

function Part({ index, title, children, aside }: { index: string; title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="border-t border-line pt-5">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="flex items-baseline gap-3 text-base font-semibold">
          <span className="m-mono text-xs text-ink-2">{index}</span>
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

function ConfigStepper({ nav }: { nav: BuilderNav }) {
  const t = useT();
  return (
    <nav aria-label={t('builder.title')}>
      <ol className="no-scrollbar flex overflow-x-auto border-b border-line">
        {t.dict.builder.steps.map((label, i) => {
          const reachable = i <= nav.maxReachable;
          const current = i === nav.step;
          return (
            <li key={label} className="shrink-0">
              <button
                type="button"
                disabled={!reachable}
                aria-current={current ? 'step' : undefined}
                onClick={() => nav.go(i)}
                className="m-tab flex items-baseline gap-2 px-3 py-3.5 text-sm font-medium disabled:opacity-35 sm:px-5"
              >
                <span className="m-mono text-[11px]">{String(i + 1).padStart(2, '0')}</span>
                {label}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function NavButtons({ nav }: { nav: BuilderNav }) {
  const t = useT();
  return (
    <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-line pt-6">
      <button type="button" onClick={nav.back} disabled={nav.step === 0} className="m-btn-ghost">
        ← {t('builder.back')}
      </button>
      {nav.step < LAST_STEP && (
        <button
          type="button"
          onClick={nav.next}
          disabled={!nav.canNext}
          aria-describedby={nav.reason ? 'next-reason' : undefined}
          className="m-btn"
        >
          {t('builder.next')} →
        </button>
      )}
      {nav.reason && (
        <p id="next-reason" className="text-sm text-ink-2" role="status">
          {t(nav.reason)}
        </p>
      )}
    </div>
  );
}

function ConfigPanel() {
  const t = useT();
  const car = useSelectedCar();
  const est = useEstimate();
  return (
    <div className="relative overflow-hidden rounded-theme border border-line bg-bg">
      <span className="m-acc-bg absolute inset-x-0 top-0 h-1" aria-hidden />
      <div className="bg-surface p-5 pt-6">
        <p className="m-kicker">{t('th.marque.builder.config')}</p>
        {car ? (
          <>
            <div className="m-acc-text mt-3" style={{ '--m-h': '1.4rem' } as CSSProperties}>
              <BrandMark slug={car.brand} className="text-lg" />
            </div>
            <p className="m-title text-2xl">{car.model}</p>
            <div className="m-floor relative mt-4">
              <CarSilhouette bodyType={car.bodyType} color={car.color.hex} accent={caliperOf(brandStyle(car.brand))} className="w-full" />
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-ink-2">
              <span className="inline-block size-3 rounded-full border border-line" style={{ background: car.color.hex }} aria-hidden />
              {t('th.marque.builder.paint')} · {t.l(car.color.name)}
            </p>
          </>
        ) : (
          <p className="mt-3 text-sm text-ink-2">{t('th.marque.builder.noCar')}</p>
        )}
      </div>
      <div className="p-5">
        <h2 className="m-kicker mb-3">{t('price.estimate')}</h2>
        <EstimatePanel estimate={est} />
      </div>
    </div>
  );
}

// ——— BuilderLayout ———
export function BuilderLayout({ nav, children }: BuilderLayoutProps) {
  const t = useT();
  const car = useSelectedCar();
  const est = useEstimate();
  const money = useMoney();
  useSwitcherOffset(104);
  return (
    <BrandScope brand={car?.brand} className="mx-auto max-w-[1440px] px-4 pb-40 pt-6 sm:px-8 lg:pb-16">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 pb-2">
        <div className="min-w-0">
          <p className="m-kicker">
            {t('th.marque.builder.title')} · {t('builder.stepOf', { n: nav.step + 1, total: nav.total })}
          </p>
          <div className="mt-2 flex min-w-0 flex-wrap items-baseline gap-x-3">
            {car ? (
              <>
                <span className="m-acc-text" style={{ '--m-h': '1.6rem' } as CSSProperties}>
                  <BrandMark slug={car.brand} className="text-xl sm:text-2xl" />
                </span>
                <span className="m-title text-xl text-ink-2 sm:text-2xl">{car.model}</span>
              </>
            ) : (
              <span className="m-title text-xl text-ink-2 sm:text-2xl">{t('th.marque.builder.noCar')}</span>
            )}
          </div>
        </div>
      </div>
      <ConfigStepper nav={nav} />
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] xl:gap-14">
        <div className="min-w-0">
          {children}
          <NavButtons nav={nav} />
        </div>
        <aside className="hidden lg:block" aria-label={t('th.marque.builder.config')}>
          <div className="sticky top-24">
            <ConfigPanel />
          </div>
        </aside>
      </div>

      {/* mobile sticky estimate bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/95 px-4 pb-3 pt-0 backdrop-blur lg:hidden">
        <span className="m-acc-bg -mx-4 mb-3 block h-1" aria-hidden />
        <div className="flex items-center justify-between gap-3">
          <div aria-live="polite" className="min-w-0">
            <p className="m-kicker !text-[10px]">{t('price.total')}</p>
            <p className="m-title text-xl tabular-nums">{money(est.total)}</p>
          </div>
          {nav.step < nav.total - 1 && (
            <button type="button" onClick={nav.next} disabled={!nav.canNext} className="m-btn !min-h-10 shrink-0 !px-4 !py-2">
              {t('builder.next')} →
            </button>
          )}
        </div>
        <p className="mt-1 text-[10px] text-ink-2">{t('price.disclaimer')}</p>
      </div>
    </BrandScope>
  );
}

// ——— CarStep (signature): marque first, then model ———
export function CarStep({ nav }: StepProps) {
  const t = useT();
  const { scene3D } = useTheme();
  const { carId, setCar } = useBuilder();
  const selected = useSelectedCar();
  const rate = useDailyRate();
  const count = useModelCount();
  const [brand, setBrand] = useState<BrandSlug>(selected?.brand ?? BRANDS_IN_FLEET[0].slug);
  // follow the persisted car once the store has rehydrated
  useEffect(() => {
    if (selected) setBrand(selected.brand);
  }, [selected]);

  const models = carsOfBrand(brand);
  const preview: Car = selected && selected.brand === brand ? selected : flagshipOf(brand);
  const isPreview = preview.id !== carId;
  const s = brandStyle(brand);
  const anyModel = models.some((c) => c.id === carId);

  return (
    <BrandScope brand={brand}>
      <StepHead n={nav.step} title={t('builder.car.title')} lead={t('builder.car.lead')} />

      <Part index="A" title={t('th.marque.builder.chooseBrand')}>
        <div
          role="radiogroup"
          aria-label={t('th.marque.builder.chooseBrand')}
          onKeyDown={(e) => rovingKeyNav(e)}
          className="no-scrollbar -mx-4 flex snap-x scroll-px-4 gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 xl:grid-cols-7"
        >
          {BRANDS_IN_FLEET.map((b, i) => {
            const on = b.slug === brand;
            return (
              <button
                key={b.slug}
                type="button"
                role="radio"
                aria-checked={on}
                tabIndex={rovingTab(on, i, true)}
                onClick={() => setBrand(b.slug)}
                style={{ ...brandVars(b.slug), '--m-max': '1.35rem' } as CSSProperties}
                className={`m-opt relative flex h-24 w-40 shrink-0 snap-start flex-col justify-between overflow-hidden p-3 text-left sm:w-auto ${on ? 'm-acc-text' : ''}`}
              >
                <span className={`absolute inset-x-0 top-0 h-1 m-tr ${on ? 'bg-accent' : 'bg-transparent'}`} aria-hidden />
                <BrandMark slug={b.slug} fit />
                <span className="m-kicker !text-[10px]">{count(b.slug)}</span>
              </button>
            );
          })}
        </div>
      </Part>

      {/* stage */}
      <div className="relative mt-8 overflow-hidden rounded-theme border border-line bg-bg">
        <Car3D
          {...scene3D}
          keyLight={{ ...scene3D.keyLight, color: s.light }}
          accent={caliperOf(s)}
          bodyType={preview.bodyType}
          paint={preview.color.hex}
          className="aspect-[4/3] w-full sm:aspect-[16/8]"
          title={carName(preview)}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-4 sm:p-6">
          <div className="min-w-0">
            <div className="m-acc-text" style={{ '--m-h': '1.6rem' } as CSSProperties}>
              <BrandMark slug={brand} className="text-lg sm:text-xl" />
            </div>
            <p className="m-title text-2xl sm:text-4xl">{preview.model}</p>
          </div>
          {isPreview && <span className="m-kicker shrink-0 rounded-theme border border-line bg-bg px-2 py-1">{t('th.marque.builder.preview')}</span>}
        </div>
        <p className="m-kicker pointer-events-none absolute bottom-3 left-4 sm:left-6">{t('th.marque.builder.drag')}</p>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-theme border border-line bg-line sm:grid-cols-5 [&>*:last-child:nth-child(odd)]:col-span-2 sm:[&>*:last-child:nth-child(odd)]:col-span-1">
        {specRows(preview, t).map((r) => (
          <div key={r.key} className="bg-bg px-3 py-2.5">
            <dt className="m-kicker !text-[10px]">{r.label}</dt>
            <dd className="m-mono mt-1 truncate text-xs">{r.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-10">
        <Part index="B" title={t('th.marque.builder.chooseModel')} aside={<span className="m-kicker">{brandBySlug(brand).name}</span>}>
          <div role="radiogroup" aria-label={t('th.marque.builder.chooseModel')} onKeyDown={(e) => rovingKeyNav(e)} className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {models.map((c, i) => {
              const on = carId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  tabIndex={rovingTab(on, i, anyModel)}
                  onClick={() => setCar(c.id)}
                  className="m-opt flex items-center gap-4 p-3 text-left"
                >
                  <span className="w-24 shrink-0 rounded-theme bg-surface px-2 py-2">
                    <CarSilhouette bodyType={c.bodyType} color={c.color.hex} accent={caliperOf(s)} shadow={false} className="w-full" />
                  </span>
                  <span className="min-w-0">
                    <span className="m-title block truncate text-lg">{c.model}</span>
                    <span className="block text-xs text-ink-2">
                      {c.year ?? PLACEHOLDER} · {t.l(c.color.name)}
                    </span>
                    <span className="m-mono mt-1 block text-xs">{t('fleet.fromDay', { price: rate(c.id) })}</span>
                  </span>
                  <span className={`ml-auto size-4 shrink-0 rounded-full border-2 m-tr ${on ? 'border-accent bg-accent' : 'border-line'}`} aria-hidden />
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-ink-2">
            {t('fleet.demoRate')} · {t('price.disclaimer')}
          </p>
        </Part>
      </div>
    </BrandScope>
  );
}

// ——— DestinationStep ———
function CityPicker({ label, value, onChange }: { label: string; value: string | null; onChange: (id: string) => void }) {
  const t = useT();
  const id = useId();
  const { q, setQ, results } = useCitySearch();
  const any = results.some((c) => c.id === value);
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t('builder.destination.search')}
        className="w-full rounded-theme border border-line bg-surface px-4 py-3 text-sm outline-none transition-colors focus:border-ink"
      />
      <div
        role="radiogroup"
        aria-label={label}
        onKeyDown={(e) => rovingKeyNav(e)}
        className="mt-3 grid max-h-72 grid-cols-2 gap-1.5 overflow-auto p-0.5 sm:grid-cols-3 xl:grid-cols-4"
      >
        {results.map((c, i) => {
          const on = value === c.id;
          return (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={rovingTab(on, i, any)}
              onClick={() => onChange(c.id)}
              className="m-opt m-chip flex items-baseline justify-between gap-2 px-3 py-2.5 text-left text-sm"
            >
              <span className="truncate">{t.l(c.name)}</span>
              <span className="m-mono shrink-0 text-[10px] opacity-75">{c.code}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DestinationStep({ nav }: StepProps) {
  const t = useT();
  const { cityId, setCity, deliveryType, setDeliveryType, returnCityId, setReturnCity } = useBuilder();
  const city = cityById(cityId);
  const ret = cityById(returnCityId);
  return (
    <div className="space-y-10">
      <StepHead n={nav.step} title={t('builder.destination.title')} lead={t('builder.destination.lead')} />
      <Part index="A" title={t('builder.destination.city')} aside={city && <span className="m-mono text-xs">{city.code}</span>}>
        <CityPicker label={t('builder.destination.city')} value={cityId} onChange={setCity} />
      </Part>
      <Part index="B" title={t('builder.destination.type')}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {DELIVERY_TYPES.map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={deliveryType === d}
              onClick={() => setDeliveryType(d)}
              className="m-opt m-chip px-4 py-4 text-left text-sm font-semibold"
            >
              {t(`deliveryTypes.${d}`)}
            </button>
          ))}
        </div>
      </Part>
      <Part index="C" title={t('builder.destination.return')}>
        <div className="grid grid-cols-2 gap-2 sm:max-w-md">
          <button type="button" aria-pressed={!returnCityId} onClick={() => setReturnCity(null)} className="m-opt m-chip px-4 py-3 text-sm font-semibold">
            {t('builder.destination.returnSame')}
          </button>
          <button
            type="button"
            aria-pressed={!!returnCityId}
            disabled={!cityId}
            onClick={() => setReturnCity(returnCityId ?? (cityId === 'milano' ? 'roma' : 'milano'))}
            className="m-opt m-chip px-4 py-3 text-sm font-semibold disabled:opacity-40"
          >
            {t('builder.destination.returnOther')}
          </button>
        </div>
        {returnCityId && (
          <div className="mt-5">
            <p className="mb-2 text-sm font-medium">{t('builder.destination.returnCity')}</p>
            <CityPicker label={t('builder.destination.returnCity')} value={returnCityId} onChange={setReturnCity} />
          </div>
        )}
        {city && ret && ret.country !== city.country && (
          <p className="m-acc-text mt-4 text-sm font-medium">{t('builder.destination.oneWayNote')}</p>
        )}
      </Part>
    </div>
  );
}

// ——— DatesStep ———
export function DatesStep({ nav }: StepProps) {
  const t = useT();
  const cal = useDateRange();
  const days = rentalDays(cal.dateFrom, cal.dateTo);
  const pct = discountFor(days);
  return (
    <div>
      <StepHead n={nav.step} title={t('builder.dates.title')} lead={t('builder.dates.pickRange')} />
      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="rounded-theme border border-line p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <button type="button" onClick={() => cal.shift(-1)} disabled={!cal.canPrev} aria-label={t('builder.dates.prevMonth')} className="m-btn-ghost !min-h-9 !px-3 !py-1">
              ←
            </button>
            <p className="m-title text-lg" aria-live="polite">
              {t.dict.common.monthsLong[cal.view.m]} {cal.view.y}
            </p>
            <button type="button" onClick={() => cal.shift(1)} aria-label={t('builder.dates.nextMonth')} className="m-btn-ghost !min-h-9 !px-3 !py-1">
              →
            </button>
          </div>
          <div role="grid" onKeyDown={calendarKeyNav} className="grid grid-cols-7 gap-1 text-center text-sm">
            {t.dict.common.weekdays.map((w) => (
              <span key={w} role="columnheader" className="m-kicker py-2 !text-[10px]">
                {w}
              </span>
            ))}
            {cal.weeks.flat().map((iso, i) => {
              const st = cal.status(iso);
              if (!iso) return <span key={`e${i}`} />;
              return (
                <button
                  key={iso}
                  type="button"
                  data-iso={iso}
                  data-st={st}
                  disabled={st === 'past'}
                  aria-pressed={st === 'edge' || st === 'in'}
                  aria-label={formatDate(iso, t.locale)}
                  onClick={() => cal.pick(iso)}
                  className="m-day m-mono py-2.5 text-sm tabular-nums disabled:opacity-25 sm:py-3"
                >
                  {Number(iso.slice(8))}
                </button>
              );
            })}
          </div>
        </div>
        <table className="m-spec self-start">
          <tbody>
            <tr>
              <th scope="row">{t('builder.dates.from')}</th>
              <td>{formatDate(cal.dateFrom, t.locale)}</td>
            </tr>
            <tr>
              <th scope="row">{t('builder.dates.to')}</th>
              <td>{formatDate(cal.dateTo, t.locale)}</td>
            </tr>
            <tr>
              <th scope="row">{t('th.marque.builder.duration')}</th>
              <td>{days ? (days === 1 ? t('builder.dates.day') : t('builder.dates.days', { n: days })) : '—'}</td>
            </tr>
            {pct > 0 && (
              <tr>
                <td colSpan={2} className="m-acc-text !font-sans font-semibold">
                  {t('builder.dates.discount', { pct, n: pct === 12 ? 7 : 3 })}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ——— ExtrasStep ———
export function ExtrasStep({ nav }: StepProps) {
  const t = useT();
  const { extras, toggleExtra } = useBuilder();
  const price = useExtraPrice();
  return (
    <div>
      <StepHead n={nav.step} title={t('builder.extras.title')} lead={t('builder.extras.lead')} />
      <Part index="A" title={t('th.marque.builder.optional')} aside={<span className="m-mono text-xs text-ink-2">{extras.length} / {SERVICES.length}</span>}>
        <ul className="divide-y divide-line border-y border-line">
          {SERVICES.map((x) => {
            const on = extras.includes(x);
            return (
              <li key={x}>
                <label className={`flex cursor-pointer items-start gap-4 px-1 py-4 transition-colors hover:bg-surface sm:px-3 ${on ? 'bg-surface' : ''}`}>
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => toggleExtra(x)}
                    className="mt-1 size-[18px] shrink-0"
                    style={{ accentColor: 'var(--color-accent)' }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{t(`services.${x}.name`)}</span>
                    <span className="block text-sm text-ink-2">{t(`services.${x}.desc`)}</span>
                  </span>
                  <span className="m-mono shrink-0 pt-0.5 text-right text-xs">
                    {price(x)}
                    {on && <span className="m-acc-text mt-1 block font-semibold">{t('th.marque.builder.selected')}</span>}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </Part>
    </div>
  );
}

// ——— SummaryVariant (signature): configuration sheet ———
export function SummaryVariant({ nav, estimate, message, url }: SummaryProps) {
  const t = useT();
  const rows = useSummaryRows();
  const car = useSelectedCar();
  const s = brandStyle(car?.brand);
  return (
    <div>
      <StepHead n={nav.step} title={t('builder.summary.title')} lead={t('builder.summary.lead')} />
      <article className="overflow-hidden rounded-theme border border-line" aria-label={t('th.marque.summary.sheet')}>
        <span className="m-acc-bg block h-1.5" aria-hidden />
        {/* head */}
        <div className="grid gap-6 bg-surface p-5 sm:p-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:items-center">
          <div className="min-w-0">
            <p className="m-kicker">
              {t('th.marque.summary.sheet')} · {t('th.marque.summary.code')} {car ? car.id.toUpperCase() : PLACEHOLDER}
            </p>
            {car ? (
              <>
                <div className="m-acc-text mt-5 max-w-sm" style={{ '--m-max': '3.6rem' } as CSSProperties}>
                  <BrandMark slug={car.brand} fit />
                </div>
                <p className="m-title mt-2 text-3xl sm:text-4xl">{car.model}</p>
                <p className="mt-3 flex items-center gap-2 text-sm text-ink-2">
                  <span className="inline-block size-3.5 rounded-full border border-line" style={{ background: car.color.hex }} aria-hidden />
                  {t.l(car.color.name)}
                </p>
              </>
            ) : (
              <p className="mt-4 text-ink-2">{t('th.marque.builder.noCar')}</p>
            )}
          </div>
          {car && (
            <div className="m-floor relative">
              <CarSilhouette bodyType={car.bodyType} color={car.color.hex} accent={caliperOf(s)} className="w-full" title={carName(car)} />
            </div>
          )}
        </div>

        {/* tables */}
        <div className="grid gap-8 p-5 sm:p-8 md:grid-cols-2">
          <section>
            <h2 className="m-kicker mb-2">{t('th.marque.summary.vehicle')}</h2>
            <table className="m-spec">
              <tbody>
                {car && (
                  <>
                    <tr>
                      <th scope="row">{t('th.marque.summary.brand')}</th>
                      <td>{brandBySlug(car.brand).name}</td>
                    </tr>
                    <tr>
                      <th scope="row">{t('th.marque.summary.model')}</th>
                      <td>{car.model}</td>
                    </tr>
                    <tr>
                      <th scope="row">{t('th.marque.summary.category')}</th>
                      <td>{t(`categories.${car.category}`)}</td>
                    </tr>
                    {specRows(car, t).map((r) => (
                      <tr key={r.key}>
                        <th scope="row">{r.key === 'color' ? t('th.marque.builder.paint') : r.label}</th>
                        <td>{r.value}</td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
            <button type="button" onClick={() => nav.go(0)} className="m-link mt-3 text-sm">
              {t('builder.edit')} →
            </button>
          </section>
          <section>
            <h2 className="m-kicker mb-2">{t('th.marque.summary.trip')}</h2>
            <table className="m-spec">
              <tbody>
                {rows.slice(1).map((r) => (
                  <tr key={r.k}>
                    <th scope="row">{r.k}</th>
                    <td>
                      <span className="block">{r.v}</span>
                      <button type="button" onClick={() => nav.go(r.step)} className="m-link mt-1 font-sans text-xs" aria-label={`${t('builder.edit')} · ${r.k}`}>
                        {t('builder.edit')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        {/* estimate + WhatsApp */}
        <div className="grid gap-8 border-t border-line p-5 sm:p-8 md:grid-cols-2">
          <div>
            <h2 className="m-kicker mb-3">{t('th.marque.summary.estimate')}</h2>
            <div className="m-acc-border rounded-theme border-l-4 bg-surface p-4">
              <EstimatePanel estimate={estimate} />
            </div>
          </div>
          <WhatsAppPreview
            message={message}
            url={url}
            label={t('th.marque.summary.send')}
            preClassName="!bg-bg !max-h-80"
            buttonClassName="m-btn mt-4 w-full !min-h-12"
          />
        </div>
      </article>
    </div>
  );
}
