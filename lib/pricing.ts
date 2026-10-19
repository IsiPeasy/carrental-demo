// Indicative estimate — NEVER a quote. Shared by every style.
// The only real anchor is the entry price (~€1.200/day, rialrent.it FAQ).
// Every other figure is a plausible DEMO value (`demo: true`) and can be
// overridden from /[style]/admin (persisted in localStorage via useRates).

import {
  CITIES,
  FLEET,
  JET_ROUTES,
  type DeliveryType,
  type ServiceId,
  type Zone,
} from './data';

export const CURRENCY = 'EUR';

export interface RateTable {
  daily: Record<string, number>; // carId → €/day
  zone: Record<Zone, number>; // delivery fee by zone (from Milan HQ)
  place: Record<DeliveryType, number>; // surcharge by place type
  extras: Partial<Record<ServiceId, number>>; // flat or per-day (see EXTRA_PER_DAY)
}

/** carId → real anchor? Only the entry price is real. */
export const REAL_ANCHORS: Record<string, true> = { 'abarth-695': true };

export const DEFAULT_RATES: RateTable = {
  daily: {
    'abarth-695': 1200, // real anchor: "da circa €1.200/giorno"
    'a45-s': 1250,
    'v-class': 1300,
    'defender-110': 1400,
    'gle-63-s': 1500,
    'sl-43': 1550,
    'rr-sport-sv': 1850,
    'g63': 2000,
    'portofino-m': 2100,
    '911-gt3': 2200,
    'roma-spyder': 2300,
    'urus': 2400,
    'huracan-evo-spyder': 2700,
    'f8-spider': 2900,
  },
  zone: {
    'IT-N': 0,
    'IT-S': 450,
    ISOLE: 650,
    'FR-CH-MC': 550,
    ALPI: 400,
    ES: 1200,
    'NORD-EU': 1400,
  },
  place: { hotel: 0, villa: 60, ufficio: 0, marina: 120, aeroporto: 90, fbo: 180 },
  extras: {
    chauffeur: 450,
    'meet-greet': 250,
    'fast-track': 120,
    porter: 90,
    security: 900,
    helicopter: 1900,
  },
};

/** Extras billed per day instead of flat. */
export const EXTRA_PER_DAY: Partial<Record<ServiceId, true>> = { chauffeur: true, security: true };
/** Extras always "on quotation". `jet` too, unless a known route matches. */
export const ALWAYS_ON_REQUEST: Partial<Record<ServiceId, true>> = { yacht: true, 'one-way': true };

export const DISCOUNTS = [
  { minDays: 7, pct: 12 },
  { minDays: 3, pct: 5 },
];

export interface EstimateInput {
  carId: string | null;
  cityId: string | null;
  deliveryType: DeliveryType | null;
  returnCityId: string | null; // null = same city
  dateFrom: string | null; // YYYY-MM-DD
  dateTo: string | null;
  extras: ServiceId[];
}

export type LineId =
  | 'rental'
  | 'discount'
  | 'delivery'
  | 'place'
  | 'return'
  | `extra:${ServiceId}`;

export interface EstimateLine {
  id: LineId;
  /** i18n key (`price.lines.*` / `services.*.name`) + interpolation vars */
  labelKey: string;
  vars?: Record<string, string | number>;
  amount: number; // € (negative for discounts)
  demo: boolean;
}

export interface OnRequestItem {
  id: ServiceId | 'one-way-country';
  labelKey: string;
}

export interface Estimate {
  days: number;
  lines: EstimateLine[];
  subtotal: number;
  onRequest: OnRequestItem[];
  total: number;
  currency: typeof CURRENCY;
  /** jet route found for the destination (indicative "from" price) */
  jetRoute: (typeof JET_ROUTES)[number] | null;
}

const DAY = 86_400_000;

export function rentalDays(from: string | null, to: string | null): number {
  if (!from || !to) return 0;
  const a = Date.parse(from + 'T12:00:00Z');
  const b = Date.parse(to + 'T12:00:00Z');
  if (Number.isNaN(a) || Number.isNaN(b) || b < a) return 0;
  return Math.max(1, Math.round((b - a) / DAY));
}

export function discountFor(days: number): number {
  return DISCOUNTS.find((d) => days >= d.minDays)?.pct ?? 0;
}

export function mergeRates(override: Partial<RateTable> | undefined): RateTable {
  if (!override) return DEFAULT_RATES;
  return {
    daily: { ...DEFAULT_RATES.daily, ...override.daily },
    zone: { ...DEFAULT_RATES.zone, ...override.zone },
    place: { ...DEFAULT_RATES.place, ...override.place },
    extras: { ...DEFAULT_RATES.extras, ...override.extras },
  };
}

/** Cheapest daily rate in the table (used for "da €…/giorno" copy). */
export function fromDaily(rates: RateTable = DEFAULT_RATES): number {
  return Math.min(...FLEET.map((c) => rates.daily[c.id] ?? Infinity));
}

export function estimate(input: EstimateInput, rates: RateTable = DEFAULT_RATES): Estimate {
  const lines: EstimateLine[] = [];
  const onRequest: OnRequestItem[] = [];
  const days = rentalDays(input.dateFrom, input.dateTo);
  const effDays = Math.max(days, 1);
  const city = CITIES.find((c) => c.id === input.cityId);
  const ret = CITIES.find((c) => c.id === input.returnCityId);

  if (input.carId && rates.daily[input.carId] != null) {
    const rate = rates.daily[input.carId];
    const rental = rate * effDays;
    lines.push({
      id: 'rental',
      labelKey: 'price.lines.rental',
      vars: { days: effDays, rate },
      amount: rental,
      demo: !REAL_ANCHORS[input.carId],
    });
    const pct = discountFor(days);
    if (pct) {
      lines.push({
        id: 'discount',
        labelKey: 'price.lines.discount',
        vars: { pct },
        amount: -Math.round((rental * pct) / 100),
        demo: false,
      });
    }
  }

  if (city) {
    lines.push({
      id: 'delivery',
      labelKey: 'price.lines.delivery',
      vars: { zone: city.zone },
      amount: rates.zone[city.zone],
      demo: true,
    });
    if (input.deliveryType && rates.place[input.deliveryType]) {
      lines.push({
        id: 'place',
        labelKey: 'price.lines.place',
        vars: { type: input.deliveryType },
        amount: rates.place[input.deliveryType],
        demo: true,
      });
    }
  }

  if (city && ret && ret.id !== city.id) {
    if (ret.country !== city.country) {
      onRequest.push({ id: 'one-way-country', labelKey: 'price.lines.oneWayCountry' });
    } else {
      lines.push({
        id: 'return',
        labelKey: 'price.lines.return',
        vars: { zone: ret.zone },
        amount: Math.max(rates.zone[ret.zone], 150),
        demo: true,
      });
    }
  }

  let jetRoute: Estimate['jetRoute'] = null;
  for (const x of input.extras) {
    if (ALWAYS_ON_REQUEST[x]) {
      onRequest.push({ id: x, labelKey: `services.${x}.name` });
      continue;
    }
    if (x === 'jet') {
      const route = JET_ROUTES.find((r) => r.toCityId && r.toCityId === input.cityId);
      if (route) {
        jetRoute = route;
        lines.push({
          id: 'extra:jet',
          labelKey: 'price.lines.jet',
          vars: { route: route.to },
          amount: route.fromPrice,
          demo: false,
        });
      } else {
        onRequest.push({ id: 'jet', labelKey: 'services.jet.name' });
      }
      continue;
    }
    const fee = rates.extras[x];
    if (fee == null) {
      onRequest.push({ id: x, labelKey: `services.${x}.name` });
      continue;
    }
    const perDay = !!EXTRA_PER_DAY[x];
    lines.push({
      id: `extra:${x}`,
      labelKey: perDay ? 'price.lines.extraPerDay' : 'price.lines.extra',
      vars: { name: x, days: effDays, rate: fee },
      amount: perDay ? fee * effDays : fee,
      demo: true,
    });
  }

  const subtotal = lines.reduce((s, l) => s + l.amount, 0);
  return { days, lines, subtotal, onRequest, total: subtotal, currency: CURRENCY, jetRoute };
}

export function formatEUR(n: number, locale: 'it' | 'en' = 'it'): string {
  return new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-GB', {
    style: 'currency',
    currency: CURRENCY,
    maximumFractionDigits: 0,
    // it-IT omits the separator for 4-digit numbers ("3600 €"); keep "3.600 €"
    useGrouping: 'always',
  } as Intl.NumberFormatOptions).format(n);
}
