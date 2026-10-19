'use client';

// Procedural, generic three.js car built from the same side profile as
// CarSilhouette. Shared by every style — themes only pass props.
// - one WebGL context per page (module singleton; extra instances fall back)
// - pauses offscreen (IntersectionObserver) and when the tab is hidden
// - disposes everything on unmount
// - static CarSilhouette fallback: SSR, no WebGL, prefers-reduced-motion
// - three.js is imported lazily (./car3dEngine) so it never blocks first paint

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { BodyType } from '@/lib/data';
import { usePrefersReducedMotion } from '@/lib/hooks';
import CarSilhouette from './CarSilhouette';
import type { EngineHandle } from './car3dEngine';

export interface LightSpec {
  color?: string;
  intensity?: number;
  /** position the light comes from (scene units, car ≈ 4.6 long, centred) */
  direction?: [number, number, number];
}

export type CameraPreset = 'hero' | 'turntable' | 'low' | 'side' | 'top' | 'front';
export type FloorKind = 'none' | 'reflective' | 'grid' | 'checker';

export interface Car3DProps {
  bodyType: BodyType;
  paint: string;
  /** css colour or 'transparent' */
  background?: string;
  keyLight?: LightSpec;
  rimLight?: LightSpec;
  /** extra ambient/environment reflection strength (0–2) */
  envIntensity?: number;
  floor?: FloorKind;
  /** [a, b] colours for grid/checker; reflective uses `background` for its fade */
  floorColors?: [string, string];
  autoRotate?: boolean;
  /** radians per second */
  rotateSpeed?: number;
  wireframe?: boolean;
  /** colour of wireframe lines */
  wireColor?: string;
  cameraPreset?: CameraPreset;
  /** slow camera dolly + orbit drift */
  dolly?: boolean;
  /** drag to rotate */
  interactive?: boolean;
  /** stage spotlight from above with visible cone that fades in over `revealMs` */
  spotlight?: { color?: string; intensity?: number; revealMs?: number; cone?: boolean };
  /** cycle paints (hex) every `paintCycleMs` — overrides `paint` while active */
  paintCycle?: string[];
  paintCycleMs?: number;
  /** rim + caliper colour */
  accent?: string;
  className?: string;
  style?: CSSProperties;
  /** accessible label */
  title?: string;
  /** shown in the fallback silhouette */
  fallbackStroke?: string;
}

// ——— singleton: one WebGL context per page ———
let activeInstances = 0;

function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function Car3D(props: Car3DProps) {
  const {
    bodyType,
    paint,
    background = 'transparent',
    floor = 'none',
    floorColors,
    wireframe = false,
    wireColor,
    accent = '#b8b8b8',
    className,
    style,
    title,
    fallbackStroke,
  } = props;
  const hostRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);
  propsRef.current = props;
  const reduced = usePrefersReducedMotion();
  const [mode, setMode] = useState<'pending' | 'webgl' | 'fallback'>('pending');
  const engineRef = useRef<EngineHandle | null>(null);

  // ——— mount: lazy-load the engine, renderer, loop ———
  useEffect(() => {
    if (reduced || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setMode('fallback');
      return;
    }
    const host = hostRef.current;
    if (!host) return;
    if (activeInstances > 0 || !webglAvailable()) {
      setMode('fallback');
      return;
    }
    activeInstances++;
    let cancelled = false;
    import('./car3dEngine')
      .then(({ mountCar3D }) => {
        if (cancelled) return;
        const h = mountCar3D(host, propsRef, () => !cancelled && setMode('webgl'));
        if (!h) setMode('fallback');
        engineRef.current = h;
      })
      .catch(() => !cancelled && setMode('fallback'));
    return () => {
      cancelled = true;
      engineRef.current?.dispose();
      engineRef.current = null;
      activeInstances--;
    };
  }, [reduced]);

  // structural changes (no-ops when unchanged)
  useEffect(() => {
    engineRef.current?.setCar(bodyType, wireframe);
  }, [bodyType, wireframe, wireColor]);
  useEffect(() => {
    engineRef.current?.setStage();
  }, [floor, background, floorColors?.[0], floorColors?.[1]]);

  const showSilhouette = mode !== 'webgl';
  return (
    <div
      ref={hostRef}
      className={className}
      style={{ position: 'relative', overflow: 'hidden', ...style }}
      role="img"
      aria-label={title}
    >
      {showSilhouette && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: '8% 8% 14%',
            transition: 'opacity .6s',
            opacity: mode === 'pending' ? 0.85 : 1,
          }}
        >
          <CarSilhouette
            bodyType={bodyType}
            color={wireframe ? (wireColor ?? accent) : paint}
            accent={accent}
            stroke={fallbackStroke}
            wireframe={wireframe}
            style={{ width: '100%', maxHeight: '100%' }}
          />
        </div>
      )}
    </div>
  );
}
