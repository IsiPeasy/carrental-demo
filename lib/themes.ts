'use client';

// THE THEME REGISTRY. Tokens/metadata (lib/theme-tokens.ts) + component map
// + default 3D scene props per style. Pages never branch on the style id:
// they render `theme.components.X`. Missing components fall back to
// components/neutral/*. Each style's components load lazily (one chunk per style).

import dynamic from 'next/dynamic';
import type { ComponentType, ReactNode } from 'react';
import type { Car3DProps } from '@/components/Car3D';
import type { Estimate } from './pricing';
import { STYLE_IDS, THEME_META, type StyleId, type ThemeMeta } from './theme-tokens';

export * from './theme-tokens';

// ——— component contracts ———
export interface BuilderNav {
  step: number;
  /** go to a step (clamped to the furthest reachable one) */
  go: (n: number) => void;
  next: () => void;
  back: () => void;
  canNext: boolean;
  /** i18n key explaining why Next is disabled (null when allowed) */
  reason: string | null;
  maxReachable: number;
  total: number;
}

export interface StepProps {
  nav: BuilderNav;
}

export interface SummaryProps {
  nav: BuilderNav;
  estimate: Estimate;
  /** pre-filled WhatsApp text — always show it before the click */
  message: string;
  /** https://wa.me/… link */
  url: string;
}

export interface BuilderLayoutProps {
  nav: BuilderNav;
  /** the current step, already rendered from the registry */
  children: ReactNode;
}

export interface FleetSectionProps {
  /** home = teaser on the home page, catalog = /collezione with filters */
  variant: 'home' | 'catalog';
}

export interface DoorProps {
  /** the door is hovered/focused/expanded on the landing */
  active: boolean;
}

export type Scene3DProps = Partial<Omit<Car3DProps, 'bodyType' | 'paint'>>;

export interface ThemeComponents {
  Hero: ComponentType;
  HomeSections: ComponentType;
  FleetSection: ComponentType<FleetSectionProps>;
  CarStep: ComponentType<StepProps>;
  DestinationStep: ComponentType<StepProps>;
  DatesStep: ComponentType<StepProps>;
  ExtrasStep: ComponentType<StepProps>;
  SummaryVariant: ComponentType<SummaryProps>;
  BuilderLayout: ComponentType<BuilderLayoutProps>;
  Header: ComponentType;
  Footer: ComponentType;
  Door: ComponentType<DoorProps>;
}

/** What a theme folder's index.ts exports. */
export interface ThemeModule {
  components: Partial<ThemeComponents>;
}

export interface Theme extends ThemeMeta {
  components: ThemeComponents;
  scene3D: Scene3DProps;
}

// Neutral fallbacks are resolved lazily (inside the loader) to avoid an
// import cycle: neutral components → ThemeProvider → this registry.
const KEYS: (keyof ThemeComponents)[] = [
  'Hero',
  'HomeSections',
  'FleetSection',
  'CarStep',
  'DestinationStep',
  'DatesStep',
  'ExtrasStep',
  'SummaryVariant',
  'BuilderLayout',
  'Header',
  'Footer',
  'Door',
];

const LOADERS: Record<StyleId, () => Promise<ThemeModule>> = {
  nocturne: () => import('@/components/themes/nocturne'),
  riserva: () => import('@/components/themes/riserva'),
  'grand-prix': () => import('@/components/themes/grand-prix'),
  itinerary: () => import('@/components/themes/itinerary'),
  marque: () => import('@/components/themes/marque'),
};

function lazyComponents(load: () => Promise<ThemeModule>): ThemeComponents {
  const out = {} as Record<keyof ThemeComponents, ComponentType<never>>;
  for (const key of KEYS) {
    out[key] = dynamic(() =>
      Promise.all([load(), import('@/components/neutral')]).then(
        ([m, neutral]) => (m.components[key] ?? neutral[key]) as ComponentType<never>,
      ),
    );
  }
  return out as unknown as ThemeComponents;
}

/** Default Car3D props per style (themes spread these into <Car3D>). */
const SCENE3D: Record<StyleId, Scene3DProps> = {
  nocturne: {
    background: '#0A0A0B',
    floor: 'reflective',
    keyLight: { color: '#F3EFE6', intensity: 0.6, direction: [3, 5, 4] },
    rimLight: { color: '#C8A96A', intensity: 3.2, direction: [-5, 2.5, -4] },
    spotlight: { color: '#FFF3DC', intensity: 160, revealMs: 2000 },
    envIntensity: 0.35,
    cameraPreset: 'hero',
    dolly: true,
    accent: '#C8A96A',
  },
  riserva: {
    background: '#0A1F1D',
    floor: 'reflective',
    keyLight: { color: '#EDF2EE', intensity: 1.4, direction: [3, 6, 4] },
    rimLight: { color: '#8FD9C6', intensity: 2.2, direction: [-5, 2.5, -4] },
    envIntensity: 0.5,
    cameraPreset: 'side',
    accent: '#8FD9C6',
  },
  'grand-prix': {
    background: '#EFE7D6',
    floor: 'checker',
    floorColors: ['#111111', '#EFE7D6'],
    keyLight: { color: '#FF3B2F', intensity: 3.4, direction: [6, 1.4, 2] },
    rimLight: { color: '#0F4C81', intensity: 2, direction: [-5, 2, -5] },
    autoRotate: true,
    rotateSpeed: 0.45,
    cameraPreset: 'low',
    accent: '#D7261E',
  },
  itinerary: {
    background: '#F6F6F4',
    floor: 'grid',
    floorColors: ['#E4E4E0', '#C9C9C3'],
    keyLight: { color: '#FFFFFF', intensity: 2.6, direction: [4, 7, 4] },
    rimLight: { color: '#0E6B57', intensity: 1, direction: [-5, 3, -5] },
    cameraPreset: 'top',
    autoRotate: true,
    rotateSpeed: 0.2,
    accent: '#0E6B57',
  },
  marque: {
    background: '#FFFFFF',
    floor: 'reflective',
    keyLight: { color: '#FFFFFF', intensity: 2.6, direction: [4, 6, 4] },
    rimLight: { color: '#FFFFFF', intensity: 1.6, direction: [-5, 3, -5] },
    envIntensity: 1.1,
    cameraPreset: 'hero',
    interactive: true,
    accent: '#0B0B0B',
  },
};

export const THEMES: Record<StyleId, Theme> = Object.fromEntries(
  STYLE_IDS.map((id) => [
    id,
    { ...THEME_META[id], components: lazyComponents(LOADERS[id]), scene3D: SCENE3D[id] },
  ]),
) as Record<StyleId, Theme>;

export const getTheme = (id: StyleId): Theme => THEMES[id];
