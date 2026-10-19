'use client';

// Shared Zustand stores. Persisted stores use `skipHydration` and are
// rehydrated after mount by <Providers> so SSR markup and the first client
// render always match.

import { useEffect, useMemo, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cityById, type DeliveryType, type Locale, type ServiceId } from './data';
import { estimate, mergeRates, rentalDays, type RateTable } from './pricing';

export const STEPS = ['car', 'destination', 'dates', 'extras', 'summary'] as const;
export type StepId = (typeof STEPS)[number];
export const LAST_STEP = STEPS.length - 1;

export interface BuilderState {
  carId: string | null;
  cityId: string | null;
  deliveryType: DeliveryType | null;
  returnCityId: string | null; // null = same as cityId
  dateFrom: string | null; // YYYY-MM-DD
  dateTo: string | null;
  extras: ServiceId[];
  step: number;
}

interface BuilderActions {
  setCar: (id: string) => void;
  setCity: (id: string) => void;
  setDeliveryType: (t: DeliveryType) => void;
  setReturnCity: (id: string | null) => void;
  setDates: (from: string | null, to: string | null) => void;
  toggleExtra: (x: ServiceId) => void;
  setStep: (n: number) => void;
  reset: () => void;
}

const initial: BuilderState = {
  carId: null,
  cityId: null,
  deliveryType: null,
  returnCityId: null,
  dateFrom: null,
  dateTo: null,
  extras: [],
  step: 0,
};

export const useBuilder = create<BuilderState & BuilderActions>()(
  persist(
    (set) => ({
      ...initial,
      setCar: (carId) => set({ carId }),
      setCity: (cityId) =>
        set((s) => ({ cityId, returnCityId: s.returnCityId === cityId ? null : s.returnCityId })),
      setDeliveryType: (deliveryType) => set({ deliveryType }),
      setReturnCity: (returnCityId) => set({ returnCityId }),
      setDates: (dateFrom, dateTo) => set({ dateFrom, dateTo }),
      toggleExtra: (x) =>
        set((s) => ({ extras: s.extras.includes(x) ? s.extras.filter((e) => e !== x) : [...s.extras, x] })),
      setStep: (step) => set({ step: clampStep(step) }),
      reset: () => set(initial),
    }),
    { name: 'rr-builder', version: 1, skipHydration: true },
  ),
);

export function clampStep(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(LAST_STEP, Math.max(0, Math.round(n)));
}

// ——— validation ———
/** Returns null when `step` is complete, otherwise an i18n key with the reason. */
export function validateStep(s: BuilderState, step: number): string | null {
  switch (step) {
    case 0:
      return s.carId ? null : 'builder.reason.car';
    case 1:
      if (!s.cityId || !cityById(s.cityId)) return 'builder.reason.city';
      if (!s.deliveryType) return 'builder.reason.delivery';
      return null;
    case 2: {
      if (!s.dateFrom || !s.dateTo) return 'builder.reason.dates';
      const today = todayISO();
      if (s.dateFrom < today) return 'builder.reason.past';
      if (rentalDays(s.dateFrom, s.dateTo) < 1) return 'builder.reason.order';
      return null;
    }
    case 3:
      return null; // extras are optional
    default:
      return null;
  }
}

/** First step that is not valid (the furthest the user may reach). */
export function maxReachableStep(s: BuilderState): number {
  for (let i = 0; i < LAST_STEP; i++) if (validateStep(s, i)) return i;
  return LAST_STEP;
}

export function todayISO(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return toISO(d);
}
export function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ——— admin rate overrides ———
interface RatesState {
  override: Partial<RateTable>;
  setDaily: (carId: string, v: number) => void;
  setZone: (zone: keyof RateTable['zone'], v: number) => void;
  setPlace: (t: keyof RateTable['place'], v: number) => void;
  setExtra: (x: keyof RateTable['extras'], v: number) => void;
  resetRates: () => void;
}

export const useRates = create<RatesState>()(
  persist(
    (set) => ({
      override: {},
      setDaily: (carId, v) =>
        set((s) => ({ override: { ...s.override, daily: { ...s.override.daily, [carId]: v } } })),
      setZone: (zone, v) =>
        set((s) => ({ override: { ...s.override, zone: { ...(s.override.zone as RateTable['zone']), [zone]: v } } })),
      setPlace: (t, v) =>
        set((s) => ({ override: { ...s.override, place: { ...(s.override.place as RateTable['place']), [t]: v } } })),
      setExtra: (x, v) =>
        set((s) => ({ override: { ...s.override, extras: { ...s.override.extras, [x]: v } } })),
      resetRates: () => set({ override: {} }),
    }),
    { name: 'rr-rates', version: 1, skipHydration: true },
  ),
);

export function useRateTable(): RateTable {
  const override = useRates((s) => s.override);
  return useMemo(() => mergeRates(override), [override]);
}

// ——— UI: locale ———
interface UIState {
  locale: Locale;
  setLocale: (l: Locale) => void;
}
export const useUI = create<UIState>()(
  persist((set) => ({ locale: 'it', setLocale: (locale) => set({ locale }) }), {
    name: 'rr-ui',
    version: 1,
    skipHydration: true,
  }),
);

// ——— hydration ———
let hydrated = false;
const listeners = new Set<() => void>();

export async function rehydrateAll() {
  if (hydrated) return;
  await Promise.all([
    useBuilder.persist.rehydrate(),
    useRates.persist.rehydrate(),
    useUI.persist.rehydrate(),
  ]);
  hydrated = true;
  listeners.forEach((l) => l());
}

/** true once persisted stores have been read from localStorage. */
export function useBuilderHydrated(): boolean {
  const [h, setH] = useState(hydrated);
  useEffect(() => {
    if (hydrated) return setH(true);
    const l = () => setH(true);
    listeners.add(l);
    return () => void listeners.delete(l);
  }, []);
  return h;
}

// ——— derived ———
export function useEstimate() {
  const s = useBuilder();
  const rates = useRateTable();
  return useMemo(
    () =>
      estimate(
        {
          carId: s.carId,
          cityId: s.cityId,
          deliveryType: s.deliveryType,
          returnCityId: s.returnCityId,
          dateFrom: s.dateFrom,
          dateTo: s.dateTo,
          extras: s.extras,
        },
        rates,
      ),
    [s.carId, s.cityId, s.deliveryType, s.returnCityId, s.dateFrom, s.dateTo, s.extras, rates],
  );
}
