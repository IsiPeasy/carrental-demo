'use client';

// Builder kit: shared hooks and headless helpers every style can reuse.
// Logic only lives here or in lib/*; themes provide the markup.

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BRANDS,
  CITIES,
  FLEET,
  PLACEHOLDER,
  carById,
  type BrandSlug,
  type Car,
  type Category,
} from '@/lib/data';
import { useLocale, useT } from '@/lib/i18n';
import { formatEUR, type Estimate } from '@/lib/pricing';
import {
  LAST_STEP,
  STEPS,
  clampStep,
  maxReachableStep,
  todayISO,
  toISO,
  useBuilder,
  useBuilderHydrated,
  useRateTable,
  validateStep,
} from '@/lib/store';
import type { BuilderNav } from '@/lib/themes';
import { buildMessage, waUrl } from '@/lib/whatsapp';

// ——— navigation: ?step=0..4 ⇄ store ———
export function useBuilderNav(): BuilderNav {
  const router = useRouter();
  const params = useSearchParams();
  const hydrated = useBuilderHydrated();
  const state = useBuilder();
  const urlStep = clampStep(Number(params.get('step') ?? state.step ?? 0));
  const maxReachable = maxReachableStep(state);
  // never show a step whose prerequisites are missing (only after hydration,
  // so a deep link like ?step=4 works once the persisted state is loaded)
  const step = hydrated ? Math.min(urlStep, maxReachable) : urlStep;

  useEffect(() => {
    if (!hydrated) return;
    if (state.step !== step) useBuilder.getState().setStep(step);
    if (urlStep !== step) router.replace(`?step=${step}`, { scroll: false });
  }, [hydrated, step, urlStep, state.step, router]);

  const go = useCallback(
    (n: number) => {
      const target = Math.min(clampStep(n), maxReachableStep(useBuilder.getState()));
      useBuilder.getState().setStep(target);
      router.push(`?step=${target}`, { scroll: false });
    },
    [router],
  );
  const reason = step < LAST_STEP ? validateStep(state, step) : null;
  return {
    step,
    go,
    next: () => !reason && go(step + 1),
    back: () => go(step - 1),
    canNext: !reason && step < LAST_STEP,
    reason,
    maxReachable,
    total: STEPS.length,
  };
}

// ——— money / estimate ———
export function useMoney() {
  const locale = useLocale();
  return useCallback((n: number) => formatEUR(n, locale), [locale]);
}

/** Translated estimate lines (label already resolved). */
export function useEstimateLines(est: Estimate) {
  const t = useT();
  const money = useMoney();
  return useMemo(
    () =>
      est.lines.map((l) => {
        const vars: Record<string, string | number> = { ...l.vars };
        if (typeof vars.rate === 'number') vars.rate = money(vars.rate);
        if (typeof vars.name === 'string') vars.name = t(`services.${vars.name}.name`);
        if (typeof vars.type === 'string') vars.type = t(`deliveryTypes.${vars.type}`);
        return { ...l, label: t(l.labelKey, vars), formatted: money(l.amount) };
      }),
    [est, t, money],
  );
}

export function useWhatsApp(est: Estimate) {
  const state = useBuilder();
  const locale = useLocale();
  return useMemo(() => {
    const message = buildMessage(state, est, locale);
    return { message, url: waUrl(message) };
  }, [state, est, locale]);
}

// ——— fleet ———
export function useFleetFilters(initial?: { category?: Category | 'all'; brand?: BrandSlug | 'all' }) {
  const [category, setCategory] = useState<Category | 'all'>(initial?.category ?? 'all');
  const [brand, setBrand] = useState<BrandSlug | 'all'>(initial?.brand ?? 'all');
  const cars = useMemo(
    () => FLEET.filter((c) => (category === 'all' || c.category === category) && (brand === 'all' || c.brand === brand)),
    [category, brand],
  );
  const brands = useMemo(() => BRANDS.filter((b) => FLEET.some((c) => c.brand === b.slug)), []);
  const categories = useMemo(
    () => (['supercar', 'sportiva', 'gt', 'suv', 'luxury'] as Category[]).filter((k) => FLEET.some((c) => c.category === k)),
    [],
  );
  return { category, setCategory, brand, setBrand, cars, brands, categories };
}

/** Rate for display (`da €…/giorno`) — always from pricing via the rate table. */
export function useDailyRate() {
  const rates = useRateTable();
  const money = useMoney();
  return useCallback((carId: string) => money(rates.daily[carId] ?? 0), [rates, money]);
}

export function specRows(car: Car, t: ReturnType<typeof useT>) {
  return [
    { key: 'year', label: t('fleet.year'), value: car.year ? String(car.year) : PLACEHOLDER },
    { key: 'color', label: t('fleet.color'), value: t.l(car.color.name) },
    { key: 'engine', label: t('fleet.engine'), value: car.specs?.engine ?? PLACEHOLDER },
    { key: 'power', label: t('fleet.power'), value: car.specs?.power ?? PLACEHOLDER },
    { key: 'extra', label: t('fleet.extra'), value: car.specs?.extra ?? PLACEHOLDER },
  ];
}

export function useSelectedCar() {
  const carId = useBuilder((s) => s.carId);
  return carById(carId) ?? null;
}

// ——— cities ———
export function useCitySearch() {
  const t = useT();
  const [q, setQ] = useState('');
  const results = useMemo(() => {
    const n = q.trim().toLowerCase();
    const list = [...CITIES].sort((a, b) => t.l(a.name).localeCompare(t.l(b.name)));
    if (!n) return list;
    return list.filter(
      (c) => c.name.it.toLowerCase().includes(n) || c.name.en.toLowerCase().includes(n) || c.code.toLowerCase().includes(n),
    );
  }, [q, t]);
  return { q, setQ, results };
}

// ——— calendar ———
/** Weeks (Mon-first) of a month; null = padding cell. */
export function monthMatrix(year: number, month: number): (string | null)[][] {
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const pad = (first.getDay() + 6) % 7;
  const cells: (string | null)[] = Array(pad).fill(null);
  for (let d = 1; d <= days; d++) cells.push(toISO(new Date(year, month, d)));
  while (cells.length % 7) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** Range-picking state machine shared by every DatesStep. */
export function useDateRange() {
  const { dateFrom, dateTo, setDates } = useBuilder();
  const today = todayISO();
  const init = dateFrom ? new Date(dateFrom + 'T12:00:00') : new Date();
  const [view, setView] = useState({ y: init.getFullYear(), m: init.getMonth() });
  const pick = useCallback(
    (iso: string) => {
      if (iso < today) return;
      if (!dateFrom || (dateFrom && dateTo) || iso <= dateFrom) setDates(iso, null);
      else setDates(dateFrom, iso);
    },
    [dateFrom, dateTo, setDates, today],
  );
  const shift = (delta: number) =>
    setView((v) => {
      const d = new Date(v.y, v.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  const status = (iso: string | null) => {
    if (!iso) return 'empty' as const;
    if (iso < today) return 'past' as const;
    if (iso === dateFrom || iso === dateTo) return 'edge' as const;
    if (dateFrom && dateTo && iso > dateFrom && iso < dateTo) return 'in' as const;
    return 'free' as const;
  };
  const canPrev = view.y > new Date().getFullYear() || view.m > new Date().getMonth();
  return { dateFrom, dateTo, view, shift, canPrev, pick, status, weeks: monthMatrix(view.y, view.m), today };
}

/** Arrow-key navigation for a calendar grid (buttons with data-iso). */
export function calendarKeyNav(e: React.KeyboardEvent<HTMLElement>) {
  const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
  if (!delta) return;
  const el = e.target as HTMLElement;
  const iso = el.dataset.iso;
  if (!iso) return;
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + delta);
  const next = e.currentTarget.querySelector<HTMLElement>(`[data-iso="${toISO(d)}"]`);
  if (next) {
    e.preventDefault();
    next.focus();
  }
}

/**
 * Lift the fixed StyleSwitcher above a sticky bottom bar (mobile builder bars).
 * `px` applies below `lg`; desktop keeps the default.
 */
export function useSwitcherOffset(px: number) {
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--switcher-lift', `${px}px`);
    return () => {
      root.style.removeProperty('--switcher-lift');
    };
  }, [px]);
}
