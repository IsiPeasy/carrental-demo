'use client';

// Riviera — small shared pieces: editorial kicker, perforated stamp, wax
// seal, delivery-type line icons, map geometry helpers.

import type { ReactNode } from 'react';
import type { DeliveryType } from '@/lib/data';
import { makeProjection, type GeoCollection } from '@/lib/geo';

export function Kicker({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`rv-kicker ${className}`}>
      <span aria-hidden className="rv-kicker-rule" />
      {children}
    </p>
  );
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV'];
export const roman = (n: number) => ROMAN[n - 1] ?? String(n);

/** Postage stamp with perforated edge (CSS mask). */
export function Stamp({ code, label, className = '', tone = 'navy' }: { code: string; label?: string; className?: string; tone?: 'navy' | 'terra' }) {
  return (
    <span className={`rv-stamp rv-stamp-${tone} ${className}`}>
      <span className="rv-stamp-paper">
        <span className="rv-stamp-inner">
          <span className="rv-stamp-code">{code}</span>
          {label && <span className="rv-stamp-label">{label}</span>}
        </span>
      </span>
    </span>
  );
}

/** Wax seal in SVG: irregular terracotta blob, inner ring, monogram. */
export function WaxSeal({ monogram, title, className = '' }: { monogram: string; title: string; className?: string }) {
  // irregular outline: 28 lobes with deterministic jitter
  const pts: string[] = [];
  const N = 28;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const r = 46 + (i % 3 === 0 ? 3.2 : i % 2 ? -1.4 : 1.6) + Math.sin(i * 1.7) * 1.2;
    pts.push(`${(50 + Math.cos(a) * r).toFixed(2)} ${(50 + Math.sin(a) * r).toFixed(2)}`);
  }
  const d = 'M' + pts.join(' L') + ' Z';
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title}>
      <defs>
        <radialGradient id="rv-wax" cx=".38" cy=".32" r=".75">
          <stop offset="0" stopColor="#E08A63" />
          <stop offset=".55" stopColor="#C96F4A" />
          <stop offset="1" stopColor="#8F4126" />
        </radialGradient>
      </defs>
      <path d={d} fill="url(#rv-wax)" stroke="#8F4126" strokeWidth=".8" strokeLinejoin="round" />
      <circle cx="50" cy="50" r="33" fill="none" stroke="#8F4126" strokeWidth="1.4" opacity=".7" />
      <circle cx="50" cy="50" r="33" fill="none" stroke="#F2B595" strokeWidth=".6" opacity=".55" transform="translate(-.8 -.8)" />
      <circle cx="50" cy="50" r="27" fill="none" stroke="#8F4126" strokeWidth=".6" strokeDasharray="1.2 2.2" opacity=".7" />
      <text
        x="50"
        y="58"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontStyle="italic"
        fontSize="24"
        fill="#7A3720"
        style={{ letterSpacing: '-.04em' }}
      >
        {monogram}
      </text>
      <text x="49.3" y="57.3" textAnchor="middle" fontFamily="var(--font-display)" fontStyle="italic" fontSize="24" fill="#F0A983" opacity=".45" style={{ letterSpacing: '-.04em' }}>
        {monogram}
      </text>
    </svg>
  );
}

/** Original line icons for the delivery types (stroke = currentColor). */
export function DeliveryIcon({ type, className = '' }: { type: DeliveryType; className?: string }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.3,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  const body: Record<DeliveryType, ReactNode> = {
    hotel: (
      <>
        <path d="M10 42V14h20v28M30 22h8v20" />
        <path d="M6 42h36" />
        <path d="M14 19h3M23 19h3M14 25h3M23 25h3M14 31h3M23 31h3M33 27h2M33 32h2" />
        <path d="M16.5 42v-5a3.5 3.5 0 0 1 7 0v5" />
        <path d="M8 14l12-6 12 6" />
      </>
    ),
    villa: (
      <>
        <path d="M8 42V24l12-9 12 9v18" />
        <path d="M5 26l15-12 15 12" />
        <path d="M17 42v-8h6v8M12 27h4v4h-4zM24 27h4v4h-4z" />
        <path d="M39 42V22M39 16c-2.4 3-2.8 7-2.4 10s1.4 4 2.4 4 2-1 2.4-4-.1-7-2.4-10z" />
        <path d="M3 42h42" />
      </>
    ),
    ufficio: (
      <>
        <rect x="8" y="17" width="32" height="21" rx="1.5" />
        <path d="M18 17v-4a1.5 1.5 0 0 1 1.5-1.5h9A1.5 1.5 0 0 1 30 13v4" />
        <path d="M8 26c5 2.5 10.5 3.5 16 3.5S35 28.5 40 26" />
        <path d="M22 28.5h4" />
      </>
    ),
    marina: (
      <>
        <path d="M24 8v24M24 9l11 21H24M23 12L14 30h9" />
        <path d="M10 33h28l-4 5H14z" />
        <path d="M4 42c3 0 3-1.6 6-1.6s3 1.6 6 1.6 3-1.6 6-1.6 3 1.6 6 1.6 3-1.6 6-1.6 3 1.6 6 1.6" />
      </>
    ),
    aeroporto: (
      <>
        <path d="M21 9.5c0-1.6 1.3-2.5 3-2.5s3 .9 3 2.5V20l14 8v4l-14-4v7l4 3v3l-7-2-7 2v-3l4-3v-7L7 32v-4l14-8z" />
        <path d="M4 44h40" />
      </>
    ),
    fbo: (
      <>
        <path d="M6 42V22l14-6 14 6v20" />
        <path d="M11 42V28h18v14" />
        <path d="M36 14v28M36 14l8 2.5-8 2.5" />
        <path d="M14 34h12" />
        <path d="M2 42h44" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden {...common}>
      {body[type]}
    </svg>
  );
}

/** Small decorative ornament (three dots and two rules). */
export function Ornament({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 10" className={className} aria-hidden>
      <path d="M0 5h46M74 5h46" stroke="currentColor" strokeWidth=".8" />
      <circle cx="52" cy="5" r="1.4" fill="currentColor" />
      <circle cx="60" cy="5" r="2.2" fill="none" stroke="currentColor" strokeWidth=".8" />
      <circle cx="68" cy="5" r="1.4" fill="currentColor" />
    </svg>
  );
}

// ——— map geometry ———

/** Carte postale view: Ligurian coast + Côte d'Azur. */
export const RIVIERA_VIEW = { bbox: [5.8, 43.0, 10.6, 45.75] as [number, number, number, number], width: 800 };
export const RIVIERA_PROJ = makeProjection(RIVIERA_VIEW);

/** Rings (flat [x0,y0,x1,y1…]) of every polygon touching the view, clamped to a margin around it. */
export function ringsFromGeo(geo: GeoCollection, margin = 30): number[][] {
  const { width: W, height: H, project } = RIVIERA_PROJ;
  const out: number[][] = [];
  for (const f of geo.features)
    for (const poly of f.geometry.coordinates)
      for (const ring of poly) {
        const pts = ring.map(([lo, la]) => project(lo, la));
        if (!pts.some(([x, y]) => x > -margin && x < W + margin && y > -margin && y < H + margin)) continue;
        const flat: number[] = [];
        for (const [x, y] of pts) {
          flat.push(Math.max(-margin, Math.min(W + margin, x)), Math.max(-margin, Math.min(H + margin, y)));
        }
        out.push(flat);
      }
  return out;
}

/** Closed ring → smooth path (quadratic curves through edge midpoints). */
export function smoothRing(r: number[]): string {
  const n = r.length / 2;
  if (n < 3) return '';
  const P = (i: number): [number, number] => [r[((i + n) % n) * 2], r[((i + n) % n) * 2 + 1]];
  const mid = (i: number) => {
    const a = P(i);
    const b = P(i + 1);
    return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  };
  const m0 = mid(-1);
  let d = `M${m0[0].toFixed(1)} ${m0[1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p = P(i);
    const m = mid(i);
    d += `Q${p[0].toFixed(1)} ${p[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
  }
  return d + 'Z';
}

/** Open polyline → Catmull-Rom spline as cubic béziers. */
export function catmullRom(pts: [number, number][]): string {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}
