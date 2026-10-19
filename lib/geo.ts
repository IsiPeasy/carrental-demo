'use client';

// Hand-rolled equirectangular projection for the Natural Earth Europe crop
// in public/geo/europe.json (no d3). x is scaled by cos(centre latitude) so
// shapes keep plausible proportions at European latitudes.

import { useEffect, useState } from 'react';

export type LonLat = [number, number];
export interface GeoFeature {
  type: 'Feature';
  properties: { iso: string; name: string };
  geometry: { type: 'MultiPolygon'; coordinates: LonLat[][][] };
}
export interface GeoCollection {
  type: 'FeatureCollection';
  bbox: [number, number, number, number];
  features: GeoFeature[];
}

export interface GeoView {
  /** [west, south, east, north] in degrees */
  bbox: [number, number, number, number];
  /** output width in SVG units; height is derived */
  width: number;
}

export interface Projection {
  width: number;
  height: number;
  project: (lon: number, lat: number) => [number, number];
}

export function makeProjection(view: GeoView): Projection {
  const [w, s, e, n] = view.bbox;
  const k = Math.cos((((s + n) / 2) * Math.PI) / 180);
  const spanX = (e - w) * k;
  const spanY = n - s;
  const scale = view.width / spanX;
  const height = spanY * scale;
  return {
    width: view.width,
    height,
    project: (lon, lat) => [(lon - w) * k * scale, (n - lat) * scale],
  };
}

export function featurePath(f: GeoFeature, proj: Projection): string {
  let d = '';
  for (const poly of f.geometry.coordinates) {
    for (const ring of poly) {
      ring.forEach(([lon, lat], i) => {
        const [x, y] = proj.project(lon, lat);
        d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
      });
      d += 'Z';
    }
  }
  return d;
}

/** Quadratic arc between two points, bulging "up" (for flight/route arcs). */
export function arcPath(a: [number, number], b: [number, number], bend = 0.22): string {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  // perpendicular offset, always towards the top of the map
  let px = -dy;
  let py = dx;
  if (py > 0) {
    px = -px;
    py = -py;
  }
  const cx = mx + px * bend;
  const cy = my + py * bend;
  return `M${a[0].toFixed(1)} ${a[1].toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
}

let cache: GeoCollection | null = null;
let pending: Promise<GeoCollection> | null = null;

export function loadEurope(): Promise<GeoCollection> {
  if (cache) return Promise.resolve(cache);
  pending ??= fetch('/geo/europe.json')
    .then((r) => r.json() as Promise<GeoCollection>)
    .then((g) => (cache = g));
  return pending;
}

/** Europe GeoJSON (null until loaded). */
export function useEurope(): GeoCollection | null {
  const [geo, setGeo] = useState<GeoCollection | null>(cache);
  useEffect(() => {
    if (cache) return;
    let alive = true;
    loadEurope().then((g) => alive && setGeo(g)).catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return geo;
}
