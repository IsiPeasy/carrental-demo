'use client';

// Right-hand itinerary card: composes live from the store, with a mini map
// (Milan hub → delivery city → return city).

import type { ReactNode } from 'react';
import CarSilhouette from '@/components/CarSilhouette';
import { useEstimateLines, useMoney } from '@/components/builder/kit';
import { carById, carName, cityById } from '@/lib/data';
import { useT } from '@/lib/i18n';
import type { Estimate } from '@/lib/pricing';
import { LAST_STEP, maxReachableStep, useBuilder } from '@/lib/store';
import { formatDate } from '@/lib/whatsapp';
import EuropeMap, { type BBox, type MapArc } from './EuropeMap';

export const MINI_BBOX: BBox = [-10, 37, 30, 55];

/** BBox around the given cities, padded, with a fixed aspect (w/h). */
export function fitBBox(ids: string[], aspect = 1.55): BBox {
  const pts = ids.map((id) => cityById(id)).filter((c): c is NonNullable<typeof c> => !!c);
  if (pts.length < 2) return MINI_BBOX;
  const pad = 2.4;
  let w = Math.min(...pts.map((c) => c.lon)) - pad;
  let e = Math.max(...pts.map((c) => c.lon)) + pad;
  let s = Math.min(...pts.map((c) => c.lat)) - pad;
  let n = Math.max(...pts.map((c) => c.lat)) + pad;
  if (n - s < 7) {
    const x = (7 - (n - s)) / 2;
    s -= x;
    n += x;
  }
  const k = Math.cos((((s + n) / 2) * Math.PI) / 180);
  const spanX = (e - w) * k;
  const spanY = n - s;
  if (spanX / spanY < aspect) {
    const x = (spanY * aspect) / k - (e - w);
    w -= x / 2;
    e += x / 2;
  } else {
    const y = spanX / aspect - spanY;
    s -= y / 2;
    n += y / 2;
  }
  return [w, s, e, n];
}

export function useItineraryMap() {
  const s = useBuilder();
  const city = cityById(s.cityId);
  const ret = cityById(s.returnCityId);
  const arcs: MapArc[] = [];
  if (city && city.id !== 'milano') arcs.push({ from: 'milano', to: city.id, tone: 'accent' });
  if (city && ret && ret.id !== city.id) arcs.push({ from: city.id, to: ret.id, tone: 'signal', dashed: true });
  const highlight = [city?.id, ret?.id].filter(Boolean) as string[];
  const bbox = fitBBox(['milano', ...highlight]);
  return { arcs, highlight, bbox, key: `${city?.id ?? ''}-${ret?.id ?? ''}` };
}

function Leg({ label, children, empty, tone = 'accent', last = false }: { label: string; children?: ReactNode; empty?: boolean; tone?: 'accent' | 'signal' | 'muted'; last?: boolean }) {
  const t = useT();
  return (
    <li className={`itin-leg ${last ? 'is-last' : ''}`}>
      <span className={`itin-leg-dot tone-${empty ? 'muted' : tone}`} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-2">{label}</p>
        <div className={`mt-0.5 text-sm ${empty ? 'text-ink-2' : 'font-medium'}`}>{empty ? t('th.itinerary.card.empty') : children}</div>
      </div>
    </li>
  );
}

export function EstimateBlock({ estimate, lines = true, className = '' }: { estimate: Estimate; lines?: boolean; className?: string }) {
  const t = useT();
  const money = useMoney();
  const rows = useEstimateLines(estimate);
  const empty = estimate.lines.length === 0 && estimate.onRequest.length === 0;
  return (
    <section aria-live="polite" aria-atomic="true" aria-label={t('price.estimate')} className={className}>
      {empty ? (
        <p className="text-sm text-ink-2">{t('price.empty')}</p>
      ) : (
        <>
          {lines && (
            <ul className="space-y-1.5 text-[13px]">
              {rows.map((l) => (
                <li key={l.id} className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 text-ink-2">
                    {l.label}
                    {l.demo && <span className="itin-demo-tag">{t('price.demo')}</span>}
                  </span>
                  <span className="shrink-0 font-mono tabular-nums">{l.formatted}</span>
                </li>
              ))}
              {estimate.onRequest.map((o) => (
                <li key={o.id} className="flex items-baseline justify-between gap-3">
                  <span className="text-ink-2">{t(o.labelKey)}</span>
                  <span className="shrink-0 font-mono text-[11px] text-ink-2">{t('price.onRequest')}</span>
                </li>
              ))}
            </ul>
          )}
          <div className={`flex items-baseline justify-between gap-3 ${lines ? 'mt-3 border-t border-line pt-3' : ''}`}>
            <span className="text-sm font-medium">{t('price.total')}</span>
            <span className="font-display text-2xl font-semibold tabular-nums tracking-tight">{money(estimate.total)}</span>
          </div>
        </>
      )}
      <p className="mt-2 text-xs text-ink-2">{t('price.disclaimer')}</p>
    </section>
  );
}

export default function ItineraryCard({ estimate, className = '' }: { estimate: Estimate; className?: string }) {
  const t = useT();
  const s = useBuilder();
  const car = carById(s.carId);
  const city = cityById(s.cityId);
  const ret = cityById(s.returnCityId);
  const map = useItineraryMap();
  const ready = maxReachableStep(s) === LAST_STEP;
  const hub = cityById('milano')!;
  return (
    <article className={`itin-card overflow-hidden ${className}`} aria-label={t('th.itinerary.card.title')}>
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold tracking-tight">{t('th.itinerary.card.title')}</h2>
        <span className={`itin-status ${ready ? 'is-ready' : ''}`}>
          {ready ? t('th.itinerary.card.ready') : t('th.itinerary.card.draft')}
        </span>
      </header>
      <div className="itin-mini-map border-b border-line">
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
          title={t('th.itinerary.card.map')}
        />
      </div>
      <div className="px-4 py-4">
        {car && (
          <div className="mb-4 flex items-center gap-3 rounded-theme border border-line bg-bg px-3 py-2">
            <CarSilhouette bodyType={car.bodyType} color={car.color.hex} accent="#2b2b2b" className="h-9 w-20 shrink-0" shadow={false} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{carName(car)}</p>
              <p className="truncate font-mono text-[11px] text-ink-2">{t.l(car.color.name)}</p>
            </div>
          </div>
        )}
        <ol className="itin-legs">
          <Leg label={t('th.itinerary.card.from')} tone="muted">
            {t.l(hub.name)} <span className="font-mono text-[11px] text-ink-2">{hub.code}</span>
          </Leg>
          <Leg label={t('builder.summary.where')} empty={!city}>
            {city && (
              <>
                {t.l(city.name)}
                {s.deliveryType && <span className="text-ink-2"> · {t(`deliveryTypes.${s.deliveryType}`)}</span>}
                {s.dateFrom && <span className="block font-mono text-[11px] text-ink-2">{formatDate(s.dateFrom, t.locale)}</span>}
              </>
            )}
          </Leg>
          <Leg label={t('builder.summary.returnAt')} empty={!city} tone={ret ? 'signal' : 'accent'}>
            {ret ? t.l(ret.name) : t('builder.destination.returnSame')}
            {s.dateTo && <span className="block font-mono text-[11px] text-ink-2">{formatDate(s.dateTo, t.locale)}</span>}
          </Leg>
          <Leg label={t('builder.summary.extras')} last tone="muted">
            {s.extras.length ? (
              <span className="flex flex-wrap gap-1">
                {s.extras.map((x) => (
                  <span key={x} className="itin-tag">
                    {t(`services.${x}.name`)}
                  </span>
                ))}
              </span>
            ) : (
              <span className="text-ink-2">{t('builder.summary.none')}</span>
            )}
          </Leg>
        </ol>
      </div>
      <EstimateBlock estimate={estimate} className="border-t border-line bg-bg px-4 py-4" />
    </article>
  );
}
