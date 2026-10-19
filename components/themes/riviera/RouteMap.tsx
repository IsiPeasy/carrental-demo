'use client';

// The "carte postale" map: Ligurian coast + Côte d'Azur, a dashed route that
// draws itself Milano → Portofino → Montecarlo → Saint-Tropez (6 s), a GT
// silhouette following the path (getPointAtLength) and a stamp per stop.
// Used by the Hero (coast from the GeoJSON) and the landing Door (inline coast).

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import CarSilhouette from '@/components/CarSilhouette';
import { cityById } from '@/lib/data';
import { usePrefersReducedMotion } from '@/lib/hooks';
import { useT } from '@/lib/i18n';
import { RIVIERA_PROJ, Stamp, catmullRom, smoothRing } from './shared';

const W = RIVIERA_PROJ.width;
const H = RIVIERA_PROJ.height;
const P = (lon: number, lat: number) => RIVIERA_PROJ.project(lon, lat);

/** Route stops (city ids from lib/data) with stamp / label placement (view units). */
const STOPS = [
  { id: 'milano', stamp: [655, 78], label: 'left' },
  { id: 'portofino', stamp: [652, 428], label: 'right' },
  { id: 'montecarlo', stamp: [338, 562], label: 'left' },
  { id: 'saint-tropez', stamp: [70, 498], label: 'below' },
] as const;

/** Inland waypoints between stops so the road hugs the coast (lon, lat). */
const VIA: Record<string, [number, number][]> = {
  milano: [[9.25, 44.72]],
  portofino: [[9.04, 44.455], [8.77, 44.47], [8.53, 44.4], [8.23, 44.18], [8.03, 43.96], [7.71, 43.84]],
  montecarlo: [[7.23, 43.726], [7.09, 43.666], [6.83, 43.486], [6.71, 43.39]],
};

const DURATION = 6000;
const ease = (x: number) => 0.5 - Math.cos(Math.PI * x) / 2;

export interface RouteMapProps {
  /** land rings (flat x/y arrays in view units); null while loading */
  rings: number[][] | null;
  compact?: boolean;
  /** restart the drawing in a loop (landing door) */
  loop?: boolean;
  /** animation allowed to run */
  run?: boolean;
  className?: string;
}

export default function RouteMap({ rings, compact = false, loop = false, run = true, className = '' }: RouteMapProps) {
  const t = useT();
  const uid = useId().replace(/:/g, '');
  const reduced = usePrefersReducedMotion();
  const routeRef = useRef<SVGPathElement>(null);
  const maskRef = useRef<SVGPathElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const [reached, setReached] = useState(0);
  const [flip, setFlip] = useState(false);
  const [cycle, setCycle] = useState(0);

  const cities = STOPS.map((s) => cityById(s.id)!);
  const stopPts = cities.map((c) => P(c.lon, c.lat));

  const routeD = useMemo(() => {
    const pts: [number, number][] = [];
    STOPS.forEach((s, i) => {
      pts.push(stopPts[i]);
      for (const [lo, la] of VIA[s.id] ?? []) pts.push(P(lo, la));
    });
    return catmullRom(pts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const land = useMemo(() => (rings ? rings.map(smoothRing).join(' ') : ''), [rings]);

  // drive the drawing + the car from one clock
  useEffect(() => {
    const path = routeRef.current;
    const mask = maskRef.current;
    const car = carRef.current;
    if (!path || !mask || !car) return;
    const total = path.getTotalLength();
    // length along the path at which each stop is reached
    const samples = 400;
    const stopLen = stopPts.map(([sx, sy]) => {
      let best = 0;
      let bestD = Infinity;
      for (let i = 0; i <= samples; i++) {
        const L = (i / samples) * total;
        const p = path.getPointAtLength(L);
        const d = (p.x - sx) ** 2 + (p.y - sy) ** 2;
        if (d < bestD) {
          bestD = d;
          best = L;
        }
      }
      return best;
    });
    let lastFlip = false;
    const place = (L: number) => {
      const p = path.getPointAtLength(L);
      const q = path.getPointAtLength(Math.min(total, L + 2));
      car.style.left = `${(p.x / W) * 100}%`;
      car.style.top = `${(p.y / H) * 100}%`;
      const dx = q.x - p.x;
      const f = dx < -0.4 ? true : dx > 0.4 ? false : lastFlip;
      if (f !== lastFlip) {
        lastFlip = f;
        setFlip(f);
      }
    };
    const setProgress = (k: number) => {
      mask.style.strokeDashoffset = String(1 - k);
      const L = k * total;
      place(L);
      setReached(stopLen.filter((s) => s <= L + 1).length);
    };
    if (reduced || !run) {
      setProgress(1);
      return;
    }
    let raf = 0;
    let start = 0;
    let hold: ReturnType<typeof setTimeout> | undefined;
    const frame = (now: number) => {
      if (!start) start = now;
      const x = Math.min(1, (now - start) / DURATION);
      setProgress(ease(x));
      if (x < 1) raf = requestAnimationFrame(frame);
      else if (loop) hold = setTimeout(() => setCycle((c) => c + 1), 3200);
    };
    setProgress(0);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      if (hold) clearTimeout(hold);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, run, loop, cycle]);

  const pct = (x: number, y: number) => ({ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` });
  const routeLabel = cities.map((c) => t.l(c.name)).join(' → ');

  return (
    <div className={`rv-map ${compact ? 'rv-map-compact' : ''} ${className}`} style={{ aspectRatio: `${W} / ${H.toFixed(1)}` }}>
      <svg viewBox={`0 0 ${W} ${H.toFixed(1)}`} className="absolute inset-0 h-full w-full" role="img" aria-label={t('th.riviera.hero.mapLabel', { route: routeLabel })}>
        <defs>
          <pattern id={`hatch${uid}`} width="7" height="7" patternUnits="userSpaceOnUse">
            <path d="M0 3.5h7" stroke="var(--color-accent)" strokeWidth=".55" opacity=".16" />
          </pattern>
          <mask id={`draw${uid}`} maskUnits="userSpaceOnUse" x="-20" y="-20" width={W + 40} height={H + 40}>
            <path
              ref={maskRef}
              d={routeD}
              fill="none"
              stroke="#fff"
              strokeWidth="10"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset="1"
            />
          </mask>
          <clipPath id={`land${uid}`}>
            <path d={land} />
          </clipPath>
        </defs>
        {/* sea */}
        <rect width={W} height={H} fill="var(--rv-sea)" />
        <rect width={W} height={H} fill={`url(#hatch${uid})`} />
        {land && (
          <g className="rv-land">
            {/* water lines parallel to the coast (old chart style) */}
            <path d={land} fill="none" stroke="var(--color-accent)" strokeOpacity=".22" strokeWidth="34" strokeLinejoin="round" />
            <path d={land} fill="none" stroke="var(--rv-sea)" strokeWidth="32" strokeLinejoin="round" />
            <path d={land} fill="none" stroke="var(--color-accent)" strokeOpacity=".3" strokeWidth="17" strokeLinejoin="round" />
            <path d={land} fill="none" stroke="var(--rv-sea)" strokeWidth="15" strokeLinejoin="round" />
            {/* coastline: stroke under the fill, so inner borders vanish */}
            <path d={land} fill="none" stroke="var(--color-ink)" strokeOpacity=".8" strokeWidth="2.6" strokeLinejoin="round" />
            <path d={land} fill="var(--rv-land)" />
            {/* national borders, faint, only inside the land */}
            <path d={land} fill="none" stroke="var(--color-ink-2)" strokeOpacity=".35" strokeWidth=".9" strokeDasharray="3 4" clipPath={`url(#land${uid})`} />
          </g>
        )}
        {/* route */}
        <path ref={routeRef} d={routeD} fill="none" stroke="none" />
        <path
          d={routeD}
          fill="none"
          stroke="var(--color-accent-2)"
          strokeWidth={compact ? 4 : 3}
          strokeDasharray={compact ? '9 8' : '7 7'}
          strokeLinecap="round"
          mask={`url(#draw${uid})`}
        />
        {stopPts.map(([x, y], i) => (
          <g key={STOPS[i].id} className={`rv-stop ${i < reached ? 'is-on' : ''}`}>
            <circle cx={x} cy={y} r={compact ? 9 : 7} fill="var(--color-surface)" stroke="var(--color-accent)" strokeWidth="2" />
            <circle cx={x} cy={y} r={compact ? 3.6 : 2.8} fill="var(--color-accent)" />
          </g>
        ))}
        {/* compass */}
        {!compact && (
          <g transform={`translate(${W - 52} ${H - 62})`} className="rv-compass" aria-hidden>
            <circle r="22" fill="none" stroke="var(--color-accent)" strokeOpacity=".5" strokeWidth=".8" />
            <path d="M0 -26 L5 0 L0 26 L-5 0Z" fill="none" stroke="var(--color-accent)" strokeWidth=".9" />
            <path d="M0 -26 L5 0 L-5 0Z" fill="var(--color-accent)" />
          </g>
        )}
      </svg>

      {!compact && (
        <>
          <span className="rv-map-sea" style={pct(500, 548)} aria-hidden>{t('th.riviera.hero.sea')}</span>
          <span className="rv-map-coast" style={pct(246, 572)} aria-hidden>{t('th.riviera.hero.coast')}</span>
          <span className="rv-map-north" style={pct(W - 52, H - 100)} aria-hidden>{t('th.riviera.hero.north')}</span>
          {stopPts.map(([x, y], i) => (
            <span
              key={STOPS[i].id}
              className={`rv-map-city rv-map-city-${STOPS[i].label} ${i < reached ? 'is-on' : ''}`}
              style={pct(x, y)}
              aria-hidden
            >
              {t.l(cities[i].name)}
            </span>
          ))}
        </>
      )}

      {/* stamps (one per stop, appear when the car arrives) */}
      <ol className="rv-map-stamps">
        {STOPS.map((s, i) => (
          <li
            key={s.id}
            className={`rv-map-stamp ${i < reached ? 'is-on' : ''}`}
            style={{ ...pct(s.stamp[0], s.stamp[1]), ['--tilt' as string]: `${[-6, 4, -3, 5][i]}deg` }}
          >
            <Stamp code={cities[i].code} label={compact ? undefined : roman4(i)} tone={i % 2 ? 'terra' : 'navy'} />
            <span className="sr-only">{t('th.riviera.hero.stop', { n: i + 1, city: t.l(cities[i].name) })}</span>
          </li>
        ))}
      </ol>

      {/* the GT following the route */}
      <div ref={carRef} className="rv-map-car" aria-hidden style={pct(stopPts[0][0], stopPts[0][1])}>
        <CarSilhouette
          bodyType="gt"
          color="var(--color-accent)"
          accent="var(--color-surface)"
          stroke="var(--color-ink)"
          strokeWidth={1}
          flip={flip}
          shadow={false}
          className="block h-auto w-full"
        />
      </div>
    </div>
  );
}

const roman4 = (i: number) => ['I', 'II', 'III', 'IV'][i];
