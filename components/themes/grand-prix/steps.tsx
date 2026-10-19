'use client';

// Grand Prix builder steps. Logic = shared store/kit; markup = race poster.

import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import Car3D from '@/components/Car3D';
import { useTheme } from '@/components/ThemeProvider';
import {
  calendarKeyNav,
  specRows,
  useCitySearch,
  useDailyRate,
  useDateRange,
  useSelectedCar,
} from '@/components/builder/kit';
import { useExtraPrice, useSummaryRows } from '@/components/neutral/steps';
import { DELIVERY_TYPES, FLEET, SERVICES, brandBySlug, carName, cityById } from '@/lib/data';
import { usePrefersReducedMotion } from '@/lib/hooks';
import { useT } from '@/lib/i18n';
import { discountFor, rentalDays } from '@/lib/pricing';
import { useBuilder } from '@/lib/store';
import type { StepProps, SummaryProps } from '@/lib/themes';
import { formatDate } from '@/lib/whatsapp';
import { TimingPanel } from './BuilderLayout';
import { Barcode, RaceNumber, Stripes, hash32 } from './parts';

export function GPStepHeading({ kicker, title, lead }: { kicker?: string; title: string; lead?: string }) {
  return (
    <header className="mb-8">
      {kicker && <p className="gp-kicker gp-kicker-red">{kicker}</p>}
      <h1 className="gp-display mt-1 text-5xl leading-[0.9] sm:text-6xl">{title}</h1>
      {lead && <p className="mt-3 max-w-xl text-base font-semibold text-ink-2">{lead}</p>}
    </header>
  );
}

/** Arrow-key roving selection for a radiogroup of buttons. */
function useRovingRadio(count: number, index: number, select: (i: number) => void) {
  const ref = useRef<HTMLDivElement>(null);
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    const edge = e.key === 'Home' ? 0 : e.key === 'End' ? count - 1 : null;
    if (d == null && edge == null) return;
    e.preventDefault();
    const next = edge ?? (Math.max(0, index) + d! + count) % count;
    select(next);
    ref.current?.querySelectorAll<HTMLElement>('[role="radio"]')[next]?.focus();
  };
  return { ref, onKeyDown };
}

// ——— 0 · Car ———
export function CarStep(_: StepProps) {
  const t = useT();
  const { scene3D } = useTheme();
  const { carId, setCar } = useBuilder();
  const selected = useSelectedCar() ?? FLEET[0];
  const selIndex = FLEET.findIndex((c) => c.id === carId);
  const shownIndex = FLEET.indexOf(selected);
  const rate = useDailyRate();
  const rows = specRows(selected, t);
  const roving = useRovingRadio(FLEET.length, selIndex, (i) => setCar(FLEET[i].id));
  const tele = rows.map((r) => `${r.label} ${r.value}`).join('  ///  ');
  return (
    <div>
      <GPStepHeading kicker={t('th.grand-prix.builder.raceNumber')} title={t('builder.car.title')} lead={t('builder.car.lead')} />

      <div className="gp-stage relative overflow-hidden border-2 border-line">
        <Car3D
          {...scene3D}
          bodyType={selected.bodyType}
          paint={selected.color.hex}
          fallbackStroke="#111111"
          className="aspect-[5/4] w-full sm:aspect-[16/9]"
          title={carName(selected)}
        />
        <div className="pointer-events-none absolute left-3 top-3 flex items-start gap-3 sm:left-5 sm:top-5">
          <RaceNumber n={shownIndex + 1} className="gp-stage-num" />
          <div className="gp-stage-name">
            <p className="font-mono text-[11px] font-bold uppercase tracking-widest">{brandBySlug(selected.brand).name}</p>
            <p className="gp-display text-2xl leading-none sm:text-4xl">{selected.model}</p>
          </div>
        </div>
        <div className="gp-tele-ticker" aria-hidden>
          <div key={selected.id} className="gp-tele-run">
            <span>{tele}</span>
            <span>{tele}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_290px]">
        <div>
          <p className="gp-kicker gp-kicker-ink mb-3" id="gp-pick">{t('th.grand-prix.builder.pick')}</p>
          <div
            ref={roving.ref}
            role="radiogroup"
            aria-labelledby="gp-pick"
            onKeyDown={roving.onKeyDown}
            className="gp-numbers"
          >
            {FLEET.map((c, i) => {
              const checked = carId === c.id;
              const focusable = checked || (selIndex < 0 && i === 0);
              return (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  tabIndex={focusable ? 0 : -1}
                  aria-label={`${i + 1} · ${carName(c)} · ${t('fleet.fromDay', { price: rate(c.id) })}`}
                  onClick={() => setCar(c.id)}
                  className="gp-numbtn"
                >
                  <span className="gp-numbtn-n" aria-hidden>{i + 1}</span>
                  <span className="gp-numbtn-m" aria-hidden>{c.model}</span>
                  <span className="gp-numbtn-sw" aria-hidden style={{ background: c.color.hex }} />
                </button>
              );
            })}
          </div>
        </div>
        <section className="gp-telemetry" aria-label={t('th.grand-prix.builder.telemetry')}>
          <p className="flex items-center justify-between font-mono text-xs font-bold uppercase tracking-widest">
            {t('th.grand-prix.builder.telemetry')} <span aria-hidden className="gp-live-dot" />
          </p>
          <dl key={selected.id} className="mt-3">
            {rows.map((r, i) => (
              <div key={r.key} className="gp-tele-row" style={{ animationDelay: `${i * 70}ms` }}>
                <dt>{r.label}</dt>
                <dd>{r.value}</dd>
              </div>
            ))}
            <div className="gp-tele-row" style={{ animationDelay: `${rows.length * 70}ms` }}>
              <dt>{t('th.grand-prix.builder.rate')}</dt>
              <dd>
                {t('fleet.fromDay', { price: rate(selected.id) })} <span className="gp-demo-tag">{t('price.demo')}</span>
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}

// ——— 1 · Destination ———
function CityGrid({ value, onChange, label, idBase }: { value: string | null; onChange: (id: string) => void; label: string; idBase: string }) {
  const t = useT();
  const { q, setQ, results } = useCitySearch();
  return (
    <div>
      <label className="gp-kicker gp-kicker-ink block" htmlFor={`${idBase}-search`}>
        {label}
      </label>
      <input
        id={`${idBase}-search`}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t('builder.destination.search')}
        className="gp-input mt-2"
      />
      <div role="radiogroup" aria-label={label} className="gp-cities mt-3">
        {results.map((c) => (
          <button key={c.id} type="button" role="radio" aria-checked={value === c.id} onClick={() => onChange(c.id)} className="gp-city">
            <span className="gp-city-code">{c.code}</span>
            <span className="gp-city-name">{t.l(c.name)}</span>
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
    <div className="space-y-10">
      <GPStepHeading kicker={t('th.grand-prix.builder.circuit')} title={t('builder.destination.title')} lead={t('builder.destination.lead')} />
      <CityGrid idBase="gp-city" label={t('builder.destination.city')} value={cityId} onChange={setCity} />
      <fieldset>
        <legend className="gp-kicker gp-kicker-ink">{t('builder.destination.type')}</legend>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {DELIVERY_TYPES.map((d, i) => (
            <button key={d} type="button" aria-pressed={deliveryType === d} onClick={() => setDeliveryType(d)} className="gp-pit">
              <span className="gp-pit-n" aria-hidden>{String(i + 1).padStart(2, '0')}</span>
              <span className="gp-pit-l">{t(`deliveryTypes.${d}`)}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="gp-kicker gp-kicker-ink">{t('builder.destination.return')}</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" aria-pressed={!returnCityId} onClick={() => setReturnCity(null)} className="gp-chip">
            {t('builder.destination.returnSame')}
          </button>
          <button
            type="button"
            aria-pressed={!!returnCityId}
            disabled={!cityId}
            onClick={() => setReturnCity(returnCityId ?? (cityId === 'milano' ? 'roma' : 'milano'))}
            className="gp-chip"
          >
            {t('builder.destination.returnOther')}
          </button>
        </div>
        {returnCityId && (
          <div className="mt-6">
            <CityGrid idBase="gp-ret" label={t('builder.destination.returnCity')} value={returnCityId} onChange={setReturnCity} />
          </div>
        )}
        {city && ret && ret.country !== city.country && <p className="gp-flagnote mt-4">{t('builder.destination.oneWayNote')}</p>}
      </fieldset>
    </div>
  );
}

// ——— 2 · Dates (stopwatch) ———
function Stopwatch({ laps }: { laps: number }) {
  const reduced = usePrefersReducedMotion();
  const p = Math.min(laps, 30) / 30;
  const R = 74;
  const C = 2 * Math.PI * R;
  return (
    <svg viewBox="0 0 200 224" className="gp-watch" aria-hidden focusable="false">
      {/* crown + pushers */}
      <rect x="88" y="0" width="24" height="14" fill="#111111" />
      <rect x="80" y="12" width="40" height="10" fill="#111111" />
      <rect x="150" y="30" width="16" height="10" transform="rotate(45 158 35)" fill="#111111" />
      <rect x="34" y="30" width="16" height="10" transform="rotate(-45 42 35)" fill="#D7261E" />
      <circle cx="100" cy="122" r="96" fill="#111111" />
      <circle cx="100" cy="122" r="88" fill="#F8F2E4" />
      {Array.from({ length: 60 }, (_, i) => {
        const a = (i / 60) * Math.PI * 2;
        const long = i % 5 === 0;
        const r1 = long ? 70 : 76;
        return (
          <line
            key={i}
            x1={100 + Math.sin(a) * r1}
            y1={122 - Math.cos(a) * r1}
            x2={100 + Math.sin(a) * 84}
            y2={122 - Math.cos(a) * 84}
            stroke="#111111"
            strokeWidth={long ? 3 : 1.2}
          />
        );
      })}
      <circle
        cx="100"
        cy="122"
        r={R}
        fill="none"
        stroke="#D7261E"
        strokeWidth="9"
        transform="rotate(-90 100 122)"
        style={{ strokeDasharray: `${C * p} ${C}` }}
        className={reduced ? '' : 'gp-watch-arc'}
      />
      <g style={{ transform: `rotate(${p * 360}deg)`, transformOrigin: '100px 122px' }} className={reduced ? '' : 'gp-watch-hand'}>
        <line x1="100" y1="76" x2="100" y2="40" stroke="#111111" strokeWidth="4" />
        <circle cx="100" cy="40" r="4" fill="#D7261E" />
      </g>
    </svg>
  );
}

export function DatesStep(_: StepProps) {
  const t = useT();
  const cal = useDateRange();
  const days = rentalDays(cal.dateFrom, cal.dateTo);
  const pct = discountFor(days);
  const lapsLabel = days ? (days === 1 ? t('th.grand-prix.builder.lap1') : t('th.grand-prix.builder.lapsN', { n: days })) : '—';
  return (
    <div>
      <GPStepHeading kicker={t('th.grand-prix.builder.stopwatch')} title={t('builder.dates.title')} lead={t('builder.dates.pickRange')} />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,260px)] 2xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="gp-cal">
          <div className="gp-cal-head">
            <button type="button" onClick={() => cal.shift(-1)} disabled={!cal.canPrev} aria-label={t('builder.dates.prevMonth')} className="gp-cal-nav">
              <span aria-hidden>←</span>
            </button>
            <p className="gp-display text-2xl sm:text-3xl" aria-live="polite">
              {t.dict.common.monthsLong[cal.view.m]} {cal.view.y}
            </p>
            <button type="button" onClick={() => cal.shift(1)} aria-label={t('builder.dates.nextMonth')} className="gp-cal-nav">
              <span aria-hidden>→</span>
            </button>
          </div>
          <div className="gp-cal-grid" aria-hidden>
            {t.dict.common.weekdays.map((w) => (
              <span key={w} className="gp-cal-wd">
                {w}
              </span>
            ))}
          </div>
          <div className="gp-cal-grid" onKeyDown={calendarKeyNav}>
            {cal.weeks.flat().map((iso, i) => {
              const st = cal.status(iso);
              if (!iso) return <span key={i} className="gp-cal-pad" />;
              return (
                <button
                  key={iso}
                  type="button"
                  data-iso={iso}
                  data-st={st}
                  data-today={iso === cal.today || undefined}
                  disabled={st === 'past'}
                  aria-pressed={st === 'edge' || st === 'in'}
                  aria-label={formatDate(iso, t.locale)}
                  onClick={() => cal.pick(iso)}
                  className="gp-day"
                >
                  {String(Number(iso.slice(8))).padStart(2, '0')}
                </button>
              );
            })}
          </div>
        </div>

        <div className="gp-watchpanel">
          <div className="relative mx-auto w-full max-w-[240px]">
            <Stopwatch laps={days} />
            <div className="pointer-events-none absolute inset-x-0 top-[54.5%] -translate-y-1/2 text-center" aria-hidden>
              <p className="gp-display text-6xl leading-none">{String(days).padStart(2, '0')}</p>
              <p className="font-mono text-[11px] font-bold uppercase tracking-widest">{t('th.grand-prix.builder.laps')}</p>
            </div>
          </div>
          <dl className="gp-readouts mt-4" aria-live="polite">
            <div>
              <dt>{t('builder.dates.from')}</dt>
              <dd>{formatDate(cal.dateFrom, t.locale)}</dd>
            </div>
            <div>
              <dt>{t('builder.dates.to')}</dt>
              <dd>{formatDate(cal.dateTo, t.locale)}</dd>
            </div>
            <div>
              <dt>{t('th.grand-prix.builder.laps')}</dt>
              <dd>{lapsLabel}</dd>
            </div>
          </dl>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-ink-2">{t('th.grand-prix.builder.lapsHint')}</p>
          {pct > 0 && <p className="gp-flagnote mt-3">{t('th.grand-prix.builder.lapsDiscount', { pct, n: pct === 12 ? 7 : 3 })}</p>}
        </div>
      </div>
    </div>
  );
}

// ——— 3 · Extras (pit stop) ———
export function ExtrasStep(_: StepProps) {
  const t = useT();
  const { extras, toggleExtra } = useBuilder();
  const price = useExtraPrice();
  return (
    <div>
      <GPStepHeading kicker={t('th.grand-prix.builder.pitStop')} title={t('builder.extras.title')} lead={t('builder.extras.lead')} />
      <p className="gp-kicker gp-kicker-ink mb-3">{t('builder.extras.optional')}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {SERVICES.map((x, i) => {
          const on = extras.includes(x);
          return (
            <label key={x} className={`gp-extra ${on ? 'is-on' : ''}`}>
              <input type="checkbox" checked={on} onChange={() => toggleExtra(x)} className="gp-check" />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="text-lg font-extrabold uppercase leading-tight tracking-tight">{t(`services.${x}.name`)}</span>
                  <span className="gp-extra-n shrink-0" aria-hidden>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </span>
                <span className="gp-extra-desc mt-1 block text-sm">{t(`services.${x}.desc`)}</span>
                <span className="gp-extra-price mt-2 block font-mono text-xs font-bold uppercase tracking-wider">{price(x)}</span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

// ——— 4 · Summary (paddock pass) ———
function TicketRow({ k, v, onEdit, edit }: { k: string; v: ReactNode; onEdit: () => void; edit: string }) {
  return (
    <div className="gp-trow">
      <dt>{k}</dt>
      <dd>{v}</dd>
      <button type="button" onClick={onEdit} className="gp-edit" aria-label={`${edit} · ${k}`}>
        {edit}
      </button>
    </div>
  );
}

export function SummaryVariant({ nav, estimate, message, url }: SummaryProps) {
  const t = useT();
  const rows = useSummaryRows();
  const car = useSelectedCar();
  const h = hash32(message);
  const bib = (h % 98) + 2;
  const passNo = `${t('brand.monogram')}-${h.toString(16).toUpperCase().padStart(8, '0').slice(0, 6)}`;
  return (
    <div>
      <GPStepHeading kicker={t('th.grand-prix.pass.kicker')} title={t('builder.summary.title')} lead={t('builder.summary.lead')} />

      <article className="gp-ticket" aria-label={t('th.grand-prix.pass.title')}>
        <div className="gp-ticket-main">
          <div className="gp-ticket-band relative overflow-hidden">
            <Stripes className="gp-ticket-stripes" />
            <div className="relative z-10 flex flex-wrap items-start justify-between gap-3">
              <p className="gp-display text-4xl leading-none text-white sm:text-5xl">{t('th.grand-prix.pass.title')}</p>
              <p className="bg-ink px-2 py-1 text-right font-mono text-[11px] font-bold uppercase tracking-widest text-bg">
                {t('th.grand-prix.pass.no')}
                <br />
                <span className="text-sm">{passNo}</span>
              </p>
            </div>
          </div>
          <div className="grid gap-5 p-4 sm:grid-cols-[auto_1fr] sm:p-6">
            <div className="gp-bib max-sm:justify-self-start">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest">{t('th.grand-prix.pass.bib')}</span>
              <span className="gp-display gp-bib-n">{bib}</span>
              {car && <span className="font-mono text-[10px] font-bold uppercase tracking-wider">{car.model}</span>}
            </div>
            <dl className="min-w-0">
              {rows.map((r) => (
                <TicketRow key={r.k} k={r.k} v={r.v} edit={t('builder.edit')} onEdit={() => nav.go(r.step)} />
              ))}
            </dl>
          </div>
          <div className="px-4 pb-5 sm:px-6">
            <TimingPanel estimate={estimate} />
          </div>
        </div>
        <div className="gp-perf" aria-hidden />
        <div className="gp-ticket-stub">
          <p className="font-mono text-[11px] font-bold uppercase tracking-widest">{t('th.grand-prix.pass.stub')}</p>
          <p className="gp-display gp-stub-bib">{bib}</p>
          <p className="font-mono text-xs font-bold uppercase">{passNo}</p>
          <Barcode data={message} className="gp-barcode mt-3" />
          <p className="mt-3 text-xs font-semibold">{t('th.grand-prix.pass.admit')}</p>
          <p className="mt-2 font-mono text-[10px] leading-snug text-ink-2">{t('th.grand-prix.pass.barcode')}</p>
        </div>
      </article>

      <section className="gp-radioblock mt-8" aria-labelledby="gp-wa-preview">
        <div className="flex items-center justify-between gap-3">
          <p id="gp-wa-preview" className="gp-kicker gp-kicker-ink">
            {t('th.grand-prix.pass.radio')} · {t('wa.preview')}
          </p>
          <span aria-hidden className="gp-live-dot" />
        </div>
        <pre className="gp-pre mt-3">{message}</pre>
        <a href={url} target="_blank" rel="noopener noreferrer" className="gp-btn gp-btn-red gp-btn-xl mt-4 w-full justify-center">
          {t('wa.send')} <span aria-hidden>→</span>
        </a>
      </section>
    </div>
  );
}
