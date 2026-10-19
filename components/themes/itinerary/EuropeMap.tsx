'use client';

// Itinerary map: Natural Earth Europe (public/geo/europe.json) projected by
// hand (lib/geo), city dots, arcs from the Milan hub. Pure SVG + CSS motion.

import { useId, useMemo } from 'react';
import { CITIES, COUNTRIES, cityById, type City } from '@/lib/data';
import { arcPath, featurePath, makeProjection, useEurope, type GeoCollection } from '@/lib/geo';

export type BBox = [number, number, number, number];

export interface MapArc {
  from: string;
  to: string;
  tone?: 'accent' | 'signal';
  dashed?: boolean;
}

export interface EuropeMapProps {
  bbox: BBox;
  /** SVG units (labels and strokes scale with it) */
  width?: number;
  /** dots to draw (defaults to every city) */
  cities?: City[];
  /** emphasised dots (pulse + label) */
  highlight?: string[];
  arcs?: MapArc[];
  /** country fill tint (ISO codes); defaults to the served countries */
  focusCountries?: readonly string[];
  /** show labels for highlighted cities */
  labels?: boolean;
  /** continuous arc/pulse animation (hero, door) */
  live?: boolean;
  /** one-shot draw (builder mini map) */
  drawOnce?: boolean;
  slice?: boolean;
  className?: string;
  /** accessible label; omit for decorative maps */
  title?: string;
  /** stagger arcs (seconds per arc) for live mode */
  stagger?: number;
  /** hub city drawn as a ring (default Milan) */
  hub?: string | null;
  /** multiplier for dots, strokes and labels (zoomed maps) */
  markScale?: number;
}

const pathCache = new Map<string, { iso: string; d: string }[]>();

function countryPaths(geo: GeoCollection, bbox: BBox, width: number) {
  const key = `${bbox.join(',')}:${width}`;
  const hit = pathCache.get(key);
  if (hit) return hit;
  const proj = makeProjection({ bbox, width });
  const [w, s, e, n] = bbox;
  const out = geo.features
    .filter((f) =>
      f.geometry.coordinates.some((poly) =>
        poly[0].some(([lon, lat]) => lon >= w - 4 && lon <= e + 4 && lat >= s - 4 && lat <= n + 4),
      ),
    )
    .map((f) => ({ iso: f.properties.iso, d: featurePath(f, proj) }));
  pathCache.set(key, out);
  return out;
}

export default function EuropeMap({
  bbox,
  width = 1000,
  cities = CITIES,
  highlight = [],
  arcs = [],
  focusCountries = COUNTRIES,
  labels = false,
  live = false,
  drawOnce = false,
  slice = false,
  className = '',
  title,
  stagger = 0.9,
  hub = 'milano',
  markScale = 1,
}: EuropeMapProps) {
  const gid = 'itin-grid-' + useId().replace(/:/g, '');
  const geo = useEurope();
  const proj = useMemo(() => makeProjection({ bbox, width }), [bbox, width]);
  const paths = useMemo(() => (geo ? countryPaths(geo, bbox, width) : []), [geo, bbox, width]);
  const u = (width / 1000) * markScale; // unit scale for marks
  const p = (id: string) => {
    const c = cityById(id);
    return c ? proj.project(c.lon, c.lat) : null;
  };
  const hl = new Set(highlight);
  const focus = new Set(focusCountries);
  const cycle = Math.max(arcs.length * stagger, 4);

  return (
    <svg
      viewBox={`0 0 ${width} ${proj.height.toFixed(1)}`}
      preserveAspectRatio={slice ? 'xMidYMid slice' : 'xMidYMid meet'}
      className={`itin-map ${live ? 'is-live' : ''} ${className}`}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      style={{ ['--itin-cycle' as string]: `${cycle}s` }}
    >
      <defs>
        <pattern id={gid} width={width / 25} height={width / 25} patternUnits="userSpaceOnUse">
          <path d={`M${width / 25} 0H0V${width / 25}`} fill="none" className="itin-map-grid" strokeWidth={width / 1000} />
        </pattern>
      </defs>
      <rect width={width} height={proj.height} className="itin-map-sea" />
      <rect width={width} height={proj.height} fill={`url(#${gid})`} />
      <g strokeWidth={0.8 * (width / 1000)} strokeLinejoin="round">
        {paths.map((c, i) => (
          <path key={c.iso + i} d={c.d} className={focus.has(c.iso) ? 'itin-land is-focus' : 'itin-land'} />
        ))}
      </g>
      <g fill="none" strokeLinecap="round">
        {arcs.map((a, i) => {
          const pa = p(a.from);
          const pb = p(a.to);
          if (!pa || !pb || a.from === a.to) return null;
          return (
            <path
              key={`${a.from}-${a.to}-${i}`}
              d={arcPath(pa, pb, 0.25)}
              pathLength={1}
              strokeWidth={(live ? 1.6 : 2.2) * u}
              className={`itin-arc tone-${a.tone ?? 'accent'} ${a.dashed ? 'is-dashed' : ''} ${drawOnce ? 'is-once' : ''}`}
              style={{ animationDelay: live ? `${(i * stagger).toFixed(2)}s` : undefined }}
            />
          );
        })}
      </g>
      <g>
        {cities.map((c) => {
          const [x, y] = proj.project(c.lon, c.lat);
          const on = hl.has(c.id);
          return (
            <g key={c.id} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`} className={on ? 'itin-city is-on' : 'itin-city'}>
              {on && <circle r={9 * u} className="itin-pulse" />}
              <circle r={(on ? 4.2 : 2.6) * u} className="itin-dot" strokeWidth={1.2 * u} />
            </g>
          );
        })}
        {/* destination pings timed with the live arcs */}
        {live &&
          arcs.map((a, i) => {
            const pb = p(a.to);
            if (!pb) return null;
            return (
              <circle
                key={`ping-${a.to}-${i}`}
                cx={pb[0]}
                cy={pb[1]}
                r={10 * u}
                className="itin-ping"
                style={{ animationDelay: `${(i * stagger).toFixed(2)}s` }}
              />
            );
          })}
      </g>
      {hub &&
        (() => {
          const ph = p(hub);
          if (!ph) return null;
          return (
            <g transform={`translate(${ph[0].toFixed(1)} ${ph[1].toFixed(1)})`} className="itin-hub">
              <circle r={11 * u} className="itin-hub-ring" strokeWidth={1.5 * u} />
              <circle r={5 * u} className="itin-hub-core" />
            </g>
          );
        })()}
      {labels && (
        <g className="itin-map-labels" fontSize={15 * u}>
          {cities
            .filter((c) => hl.has(c.id))
            .map((c) => {
              const [x, y] = proj.project(c.lon, c.lat);
              return (
                <text key={c.id} x={x + 9 * u} y={y - 8 * u} className="itin-label" strokeWidth={4 * u}>
                  {c.code}
                </text>
              );
            })}
        </g>
      )}
    </svg>
  );
}
