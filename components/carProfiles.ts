// Generic side profiles (no real model is reproduced). Units ≈ metres,
// x = rear → front, y = up from the ground. Used by CarSilhouette (SVG) and
// Car3D (ExtrudeGeometry), so the 2D and 3D cars always match.

import type { BodyType } from '@/lib/data';

export type Pt = [number, number];

export interface CarProfile {
  length: number;
  width: number;
  height: number;
  wheelR: number;
  wheelX: [number, number]; // rear, front
  bottom: number; // body underside height
  /** body top line, rear-bottom → front-bottom, greenhouse excluded (beltline) */
  body: Pt[];
  /** greenhouse (glass cabin), closed polygon sitting on the beltline */
  glass: Pt[];
  /** door cut line (for SVG detail) */
  door: Pt[];
  head: Pt; // headlight position
  tail: Pt; // tail light position
}

export const PROFILES: Record<BodyType, CarProfile> = {
  supercar: {
    length: 4.55,
    width: 1.96,
    height: 1.23,
    wheelR: 0.355,
    wheelX: [0.98, 3.62],
    bottom: 0.16,
    body: [
      [0.06, 0.3], [0.0, 0.5], [0.02, 0.7], [0.12, 0.86], [0.55, 0.9], [1.2, 0.93], [1.58, 0.94],
      [3.18, 0.92], [3.7, 0.8], [4.15, 0.66], [4.46, 0.52], [4.55, 0.4], [4.5, 0.24],
    ],
    glass: [[1.5, 0.94], [1.98, 1.18], [2.3, 1.23], [2.66, 1.21], [3.22, 0.92]],
    door: [[1.75, 0.9], [1.85, 0.3], [2.85, 0.3], [3.1, 0.88]],
    head: [4.38, 0.6],
    tail: [0.06, 0.74],
  },
  gt: {
    length: 4.66,
    width: 1.97,
    height: 1.3,
    wheelR: 0.35,
    wheelX: [0.98, 3.74],
    bottom: 0.18,
    body: [
      [0.04, 0.32], [0.0, 0.55], [0.03, 0.78], [0.2, 0.9], [0.8, 0.95], [1.42, 0.97],
      [3.02, 0.98], [3.5, 0.93], [4.05, 0.86], [4.48, 0.72], [4.64, 0.54], [4.58, 0.26],
    ],
    glass: [[1.42, 0.97], [1.92, 1.24], [2.2, 1.29], [2.55, 1.28], [3.02, 0.98]],
    door: [[1.62, 0.94], [1.7, 0.32], [2.75, 0.32], [2.95, 0.96]],
    head: [4.5, 0.74],
    tail: [0.05, 0.8],
  },
  suv: {
    length: 4.92,
    width: 2.0,
    height: 1.78,
    wheelR: 0.42,
    wheelX: [1.0, 3.96],
    bottom: 0.3,
    body: [
      [0.06, 0.36], [0.0, 0.62], [0.0, 1.08], [0.08, 1.16], [0.2, 1.17],
      [3.5, 1.17], [4.3, 1.1], [4.75, 1.0], [4.9, 0.86], [4.92, 0.56], [4.84, 0.34],
    ],
    glass: [[0.2, 1.17], [0.32, 1.7], [0.5, 1.76], [2.95, 1.78], [3.5, 1.17]],
    door: [[1.6, 1.12], [1.6, 0.4], [3.2, 0.4], [3.3, 1.12]],
    head: [4.8, 0.98],
    tail: [0.04, 1.02],
  },
  van: {
    length: 5.14,
    width: 1.96,
    height: 1.92,
    wheelR: 0.36,
    wheelX: [0.98, 4.12],
    bottom: 0.22,
    body: [
      [0.04, 0.3], [0.0, 0.6], [0.0, 1.14], [0.06, 1.2], [0.12, 1.2],
      [3.82, 1.2], [4.6, 1.08], [4.98, 0.96], [5.12, 0.74], [5.1, 0.3],
    ],
    glass: [[0.12, 1.2], [0.14, 1.86], [0.4, 1.92], [3.45, 1.92], [3.82, 1.2]],
    door: [[1.55, 1.16], [1.55, 0.32], [3.0, 0.32], [3.0, 1.16]],
    head: [4.95, 0.98],
    tail: [0.03, 1.05],
  },
};

/** Chaikin corner-cutting, open polyline (keeps endpoints). */
export function smooth(pts: Pt[], iterations = 2): Pt[] {
  let p = pts;
  for (let k = 0; k < iterations; k++) {
    const out: Pt[] = [p[0]];
    for (let i = 0; i < p.length - 1; i++) {
      const [x0, y0] = p[i];
      const [x1, y1] = p[i + 1];
      out.push([x0 * 0.75 + x1 * 0.25, y0 * 0.75 + y1 * 0.25]);
      out.push([x0 * 0.25 + x1 * 0.75, y0 * 0.25 + y1 * 0.75]);
    }
    out.push(p[p.length - 1]);
    p = out;
  }
  return p;
}

/** Wheel-arch arc going front → rear over the wheel (counter-clockwise). */
function arch(cx: number, cy: number, r: number, yCut: number, steps = 14): Pt[] {
  const t0 = Math.asin(Math.max(-1, Math.min(1, (yCut - cy) / r)));
  const out: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = t0 + ((Math.PI - 2 * t0) * i) / steps;
    out.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]);
  }
  return out;
}

/** Closed body outline: smoothed top line (rear → front), then the underside
 *  (front → rear) with wheel arches. Orientation is clockwise; three.js Shape
 *  and SVG paths accept either. */
export function bodyOutline(p: CarProfile): Pt[] {
  const top = smooth(p.body, 2);
  const ar = p.wheelR + 0.06;
  const [rx, fx] = p.wheelX;
  const last = top[top.length - 1];
  const first = top[0];
  // `top` runs rear → front; the underside runs front → rear.
  const under: Pt[] = [
    [last[0] - 0.04, p.bottom],
    ...arch(fx, p.wheelR, ar, p.bottom),
    ...arch(rx, p.wheelR, ar, p.bottom),
    [first[0] + 0.04, p.bottom],
  ];
  return [...top, ...under];
}

export function glassOutline(p: CarProfile): Pt[] {
  return smooth(p.glass, 2);
}

/** Signed area > 0 ⇒ counter-clockwise. */
export function signedArea(pts: Pt[]): number {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[(i + 1) % pts.length];
    a += x0 * y1 - x1 * y0;
  }
  return a / 2;
}
