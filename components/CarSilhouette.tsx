// Generic, recolourable SVG car silhouettes (4 body types). Shared by every
// style — themes only pass props. No real model or logo is reproduced.

import { useId, type CSSProperties } from 'react';
import type { BodyType } from '@/lib/data';
import { PROFILES, bodyOutline, glassOutline, type Pt } from './carProfiles';

export interface CarSilhouetteProps {
  bodyType: BodyType;
  /** body paint (any CSS colour, including var(--…)) */
  color?: string;
  /** rims, calipers, light details */
  accent?: string;
  /** outline colour (defaults to a darkened body edge) */
  stroke?: string;
  strokeWidth?: number;
  /** outline only, no fills */
  wireframe?: boolean;
  /** 0–1: stroke-dashoffset draw-on progress (only strokes are drawn) */
  drawProgress?: number;
  /** soft ground shadow */
  shadow?: boolean;
  /** mirror horizontally (car facing left) */
  flip?: boolean;
  className?: string;
  style?: CSSProperties;
  /** accessible label; omit for decorative use */
  title?: string;
}

const PAD = 0.12;

function toPath(pts: Pt[], H: number, close = true): string {
  return (
    pts.map(([x, y], i) => `${i ? 'L' : 'M'}${(x + PAD).toFixed(3)} ${(H - y).toFixed(3)}`).join(' ') +
    (close ? ' Z' : '')
  );
}

export function silhouetteViewBox(bodyType: BodyType) {
  const p = PROFILES[bodyType];
  const W = p.length + PAD * 2;
  const H = p.height + PAD;
  return { W, H, viewBox: `0 0 ${W.toFixed(3)} ${(H + PAD * 0.5).toFixed(3)}` };
}

export default function CarSilhouette({
  bodyType,
  color = 'currentColor',
  accent = '#9a9a9a',
  stroke,
  strokeWidth = 1.25,
  wireframe = false,
  drawProgress,
  shadow = true,
  flip = false,
  className,
  style,
  title,
}: CarSilhouetteProps) {
  const id = useId().replace(/:/g, '');
  const p = PROFILES[bodyType];
  const { W, H, viewBox } = silhouetteViewBox(bodyType);
  const drawing = drawProgress != null;
  const outlineOnly = wireframe || drawing;
  const lineColor = stroke ?? (outlineOnly ? color : 'rgba(0,0,0,.35)');
  const sw = { strokeWidth, vectorEffect: 'non-scaling-stroke' as const };
  const dash = drawing
    ? { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - Math.max(0, Math.min(1, drawProgress!)) }
    : {};

  const body = toPath(bodyOutline(p), H);
  const glass = toPath(glassOutline(p), H);
  const door = toPath(p.door, H, false);
  const [hx, hy] = p.head;
  const [tx, ty] = p.tail;

  return (
    <svg
      viewBox={viewBox}
      className={className}
      style={{ overflow: 'visible', ...style }}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".28" />
          <stop offset=".45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".28" />
        </linearGradient>
        <radialGradient id={`s${id}`} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#000" stopOpacity=".38" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform={flip ? `translate(${W} 0) scale(-1 1)` : undefined}>
        {shadow && !outlineOnly && (
          <ellipse cx={W / 2} cy={H - 0.01} rx={p.length * 0.56} ry={0.09} fill={`url(#s${id})`} />
        )}
        {/* body */}
        <path
          d={body}
          style={{ fill: outlineOnly ? 'none' : color, stroke: lineColor }}
          {...sw}
          {...dash}
          strokeLinejoin="round"
        />
        {!outlineOnly && <path d={body} fill={`url(#g${id})`} />}
        {/* glass cabin */}
        <path
          d={glass}
          style={{ fill: outlineOnly ? 'none' : '#0d1014', stroke: lineColor }}
          fillOpacity={outlineOnly ? 0 : 0.88}
          {...sw}
          {...dash}
          strokeLinejoin="round"
        />
        {/* door line */}
        <path d={door} fill="none" style={{ stroke: outlineOnly ? lineColor : 'rgba(0,0,0,.3)' }} {...sw} {...dash} />
        {/* lights */}
        {!outlineOnly && (
          <>
            <rect x={hx + PAD - 0.14} y={H - hy - 0.025} width={0.16} height={0.05} rx={0.02} fill="#f4f1e8" />
            <rect x={tx + PAD} y={H - ty - 0.025} width={0.12} height={0.05} rx={0.02} fill="#b3121b" />
          </>
        )}
        {/* wheels */}
        {p.wheelX.map((wx) => {
          const cx = wx + PAD;
          const cy = H - p.wheelR;
          const r = p.wheelR;
          return (
            <g key={wx}>
              <circle
                cx={cx}
                cy={cy}
                r={r}
                style={{ fill: outlineOnly ? 'none' : '#121212', stroke: outlineOnly ? lineColor : '#000' }}
                {...sw}
                {...dash}
              />
              <circle
                cx={cx}
                cy={cy}
                r={r * 0.66}
                style={{ fill: outlineOnly ? 'none' : '#2a2a2a', stroke: outlineOnly ? lineColor : accent }}
                {...sw}
                {...dash}
              />
              {!outlineOnly && (
                <>
                  {[0, 72, 144, 216, 288].map((a) => (
                    <line
                      key={a}
                      x1={cx}
                      y1={cy}
                      x2={cx + Math.cos((a * Math.PI) / 180) * r * 0.62}
                      y2={cy + Math.sin((a * Math.PI) / 180) * r * 0.62}
                      style={{ stroke: accent }}
                      strokeWidth={0.035}
                      strokeLinecap="round"
                    />
                  ))}
                  <path
                    d={`M${cx + r * 0.42} ${cy - r * 0.32} A ${r * 0.53} ${r * 0.53} 0 0 1 ${cx + r * 0.42} ${cy + r * 0.32}`}
                    style={{ stroke: accent }}
                    strokeOpacity={0.9}
                    strokeWidth={0.07}
                    fill="none"
                  />
                  <circle cx={cx} cy={cy} r={r * 0.1} style={{ fill: accent }} />
                </>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}
