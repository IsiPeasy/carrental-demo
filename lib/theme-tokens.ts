// Theme tokens and metadata — pure data, safe to import from server components.
// The component map lives in lib/themes.ts (the registry entry point).

import type { L10n } from './data';

export type StyleId = 'nocturne' | 'riviera' | 'grand-prix' | 'itinerary' | 'marque';
export const STYLE_IDS: StyleId[] = ['nocturne', 'riviera', 'grand-prix', 'itinerary', 'marque'];
export const DEFAULT_STYLE: StyleId = 'nocturne';

export interface ThemeTokens {
  colors: {
    bg: string;
    surface: string;
    ink: string;
    ink2: string;
    accent: string;
    accent2: string;
    line: string;
    /** text/icons on an accent fill (AA ≥ 4.5:1) */
    onAccent: string;
  };
  fonts: { display: string; body: string; mono: string };
  radius: string;
  motion: { ease: string; fast: string; base: string; slow: string };
  /** 'dark' | 'light' → color-scheme */
  scheme: 'dark' | 'light';
}

export interface ThemeMeta {
  slug: StyleId;
  name: string;
  tagline: L10n;
  audience: L10n;
  tokens: ThemeTokens;
}

export const THEME_META: Record<StyleId, ThemeMeta> = {
  nocturne: {
    slug: 'nocturne',
    name: 'Nocturne',
    tagline: { it: 'Private members club, il 3D in vetrina.', en: 'Private members club, 3D in the spotlight.' },
    audience: { it: 'UHNW, imprenditori, chi vuole discrezione.', en: 'UHNW clients, entrepreneurs, those who value discretion.' },
    tokens: {
      colors: { bg: '#0A0A0B', surface: '#141415', ink: '#F3EFE6', ink2: '#A8A39A', accent: '#C8A96A', accent2: '#6E6A62', line: '#26241F', onAccent: '#0A0A0B' },
      fonts: { display: "var(--f-bodoni), 'Bodoni Moda', Didot, serif", body: "var(--f-inter-tight), 'Inter Tight', system-ui, sans-serif", mono: "var(--f-inter-tight), ui-monospace, monospace" },
      radius: '0px',
      motion: { ease: 'cubic-bezier(.2,.8,.2,1)', fast: '0.8s', base: '1.2s', slow: '1.6s' },
      scheme: 'dark',
    },
  },
  riviera: {
    slug: 'riviera',
    name: 'Riviera',
    tagline: { it: 'Old money mediterraneo, editoriale.', en: 'Mediterranean old money, editorial.' },
    audience: { it: 'Luxury traveler, wedding, charter guest.', en: 'Luxury travelers, weddings, charter guests.' },
    tokens: {
      colors: { bg: '#F5EFE4', surface: '#FBF8F2', ink: '#13233F', ink2: '#5A6478', accent: '#1E4E79', accent2: '#C96F4A', line: '#E2D8C6', onAccent: '#FBF8F2' },
      fonts: { display: "var(--f-fraunces), Fraunces, Georgia, serif", body: "var(--f-dm-sans), 'DM Sans', system-ui, sans-serif", mono: "var(--f-dm-sans), ui-monospace, monospace" },
      radius: '2px',
      motion: { ease: 'cubic-bezier(.33,0,.2,1)', fast: '0.6s', base: '0.9s', slow: '1.2s' },
      scheme: 'light',
    },
  },
  'grand-prix': {
    slug: 'grand-prix',
    name: 'Grand Prix',
    tagline: { it: 'Poster anni ’70, il 3D in pista.', en: '’70s race poster, 3D on the track.' },
    audience: { it: 'Appassionati, social, eventi.', en: 'Enthusiasts, social, events.' },
    tokens: {
      colors: { bg: '#EFE7D6', surface: '#F8F2E4', ink: '#111111', ink2: '#4A4A46', accent: '#D7261E', accent2: '#0F4C81', line: '#111111', onAccent: '#FFFFFF' },
      fonts: { display: "var(--f-anton), Anton, Impact, sans-serif", body: "var(--f-archivo), Archivo, system-ui, sans-serif", mono: "var(--f-space-mono), 'Space Mono', ui-monospace, monospace" },
      radius: '0px',
      motion: { ease: 'cubic-bezier(.5,0,.2,1)', fast: '0.25s', base: '0.35s', slow: '0.5s' },
      scheme: 'light',
    },
  },
  itinerary: {
    slug: 'itinerary',
    name: 'Itinerary',
    tagline: { it: 'Concierge OS svizzero, la mappa al centro.', en: 'Swiss concierge OS, the map at the centre.' },
    audience: { it: 'Executive, agenzie, assistenti personali.', en: 'Executives, agencies, personal assistants.' },
    tokens: {
      colors: { bg: '#F6F6F4', surface: '#FFFFFF', ink: '#0B0B0C', ink2: '#6B6B6B', accent: '#0E6B57', accent2: '#FF5A36', line: '#E4E4E0', onAccent: '#FFFFFF' },
      fonts: { display: "var(--f-geist), Geist, system-ui, sans-serif", body: "var(--f-geist), Geist, system-ui, sans-serif", mono: "var(--f-geist-mono), 'Geist Mono', ui-monospace, monospace" },
      radius: '12px',
      motion: { ease: 'cubic-bezier(0,0,.2,1)', fast: '0.2s', base: '0.3s', slow: '0.4s' },
      scheme: 'light',
    },
  },
  marque: {
    slug: 'marque',
    name: 'Marque',
    tagline: { it: 'Il brand come protagonista.', en: 'The brand takes the lead.' },
    audience: { it: 'Chi sceglie prima la marca, poi la vettura.', en: 'Those who choose the marque first, then the car.' },
    tokens: {
      colors: { bg: '#FFFFFF', surface: '#F4F4F4', ink: '#0B0B0B', ink2: '#6A6A6A', accent: '#0B0B0B', accent2: '#6A6A6A', line: '#E6E6E6', onAccent: '#FFFFFF' },
      fonts: { display: "var(--f-inter-tight), 'Inter Tight', system-ui, sans-serif", body: "var(--f-inter), Inter, system-ui, sans-serif", mono: "var(--f-jetbrains), 'JetBrains Mono', ui-monospace, monospace" },
      radius: '4px',
      motion: { ease: 'cubic-bezier(.25,.1,.25,1)', fast: '0.3s', base: '0.45s', slow: '0.6s' },
      scheme: 'light',
    },
  },
};

export const isStyleId = (s: string): s is StyleId => (STYLE_IDS as string[]).includes(s);

/** CSS custom properties for a theme (used for the generated <style> and inline scopes). */
export function tokenVars(t: ThemeTokens): Record<string, string> {
  return {
    '--color-bg': t.colors.bg,
    '--color-surface': t.colors.surface,
    '--color-ink': t.colors.ink,
    '--color-ink-2': t.colors.ink2,
    '--color-accent': t.colors.accent,
    '--color-accent-2': t.colors.accent2,
    '--color-line': t.colors.line,
    '--color-on-accent': t.colors.onAccent,
    '--font-display': t.fonts.display,
    '--font-body': t.fonts.body,
    '--font-mono': t.fonts.mono,
    '--radius': t.radius,
    '--ease': t.motion.ease,
    '--dur-fast': t.motion.fast,
    '--dur': t.motion.base,
    '--dur-slow': t.motion.slow,
    'color-scheme': t.scheme,
  };
}

/** `[data-theme="x"]{…}` blocks for every theme, generated from the tokens. */
export function themeCSS(): string {
  return STYLE_IDS.map((id) => {
    const vars = Object.entries(tokenVars(THEME_META[id].tokens))
      .map(([k, v]) => `${k}:${v}`)
      .join(';');
    return `[data-theme="${id}"]{${vars}}`;
  }).join('\n');
}
