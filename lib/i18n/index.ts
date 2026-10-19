'use client';

import { useCallback } from 'react';
import type { L10n, Locale } from '../data';
import { useUI } from '../store';
import en from './en';
import it, { type Dict } from './it';

export type { Dict };
export const DICTS: Record<Locale, Dict> = { it, en };

/** Resolve a dotted path ("builder.reason.car", "common.months.3"). */
export function lookup(dict: Dict, key: string): unknown {
  let cur: unknown = dict;
  for (const part of key.split('.')) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

export function interpolate(s: string, vars?: Record<string, string | number>): string {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? String(vars[k]) : m));
}

export function translate(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  const v = lookup(DICTS[locale], key);
  if (typeof v === 'string') return interpolate(v, vars);
  if (process.env.NODE_ENV !== 'production') console.warn(`[i18n] missing key "${key}" (${locale})`);
  return key;
}

export function useLocale(): Locale {
  return useUI((s) => s.locale);
}

export type TFunction = ((key: string, vars?: Record<string, string | number>) => string) & {
  /** whole dictionary for the current locale (arrays, nested objects) */
  dict: Dict;
  locale: Locale;
  /** pick the current language from a data field `{ it, en }` */
  l: (v: L10n) => string;
};

export function useT(): TFunction {
  const locale = useLocale();
  const fn = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars),
    [locale],
  );
  return Object.assign(fn, { dict: DICTS[locale], locale, l: (v: L10n) => v[locale] });
}
