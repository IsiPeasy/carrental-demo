'use client';

// Grand Prix building blocks: split-flap text, stripes, speed lines, race
// numbers, step counter, deterministic barcode. Original graphics only
// (no real liveries or sponsor marks).

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { usePrefersReducedMotion } from '@/lib/hooks';

// ——— deterministic hash / PRNG (stable between server and client) ———
export function hash32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function prng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * Split-flap text. Screen readers get the final value (sr-only); the flipping
 * glyph reels are aria-hidden. Each cell spins through a few deterministic
 * glyphs and lands on its character with a CSS steps() animation.
 */
export function SplitFlap({
  text,
  width,
  play,
  delay = 0,
  seed = 0,
  className = '',
}: {
  text: string;
  /** number of cells (text is padded / cut to fit) */
  width: number;
  play: boolean;
  /** ms before the first cell starts */
  delay?: number;
  seed?: number;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const chars = Array.from(text.padEnd(width, ' ').slice(0, width));
  const rnd = prng(hash32(text) + seed);
  return (
    <span className={`gp-flaps ${play ? 'is-on' : ''} ${className}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="gp-flaps-row">
        {chars.map((ch, i) => {
          if (reduced) {
            return (
              <span key={i} className="gp-flap">
                <span className="gp-flap-reel">
                  <span>{ch === ' ' ? ' ' : ch}</span>
                </span>
              </span>
            );
          }
          const n = ch === ' ' ? 1 : 3 + Math.floor(rnd() * 5);
          const reel = [' '];
          for (let k = 1; k < n; k++) reel.push(GLYPHS[Math.floor(rnd() * GLYPHS.length)]);
          reel.push(ch);
          return (
            <span key={i} className="gp-flap">
              <span
                className="gp-flap-reel"
                style={{ '--n': n, '--d': `${delay + i * 28}ms` } as CSSProperties}
              >
                {reel.map((g, k) => (
                  <span key={k}>{g === ' ' ? ' ' : g}</span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}

/** Three original diagonal stripes (red · cream · blue · ink) entering in sequence. */
export function Stripes({ className = '', play = true }: { className?: string; play?: boolean }) {
  return (
    <div aria-hidden className={`gp-stripes ${play ? 'is-on' : ''} ${className}`}>
      <span className="gp-stripe gp-stripe-1" />
      <span className="gp-stripe gp-stripe-2" />
      <span className="gp-stripe gp-stripe-3" />
    </div>
  );
}

/** Horizontal speed lines (put them behind a car facing right). */
export function SpeedLines({ className = '', count = 7 }: { className?: string; count?: number }) {
  return (
    <div aria-hidden className={`gp-speed ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          style={{ top: `${8 + (i * 84) / Math.max(1, count - 1)}%`, '--i': i, width: `${38 + ((i * 37) % 45)}%` } as CSSProperties}
        />
      ))}
    </div>
  );
}

/** Classic number panel: white roundel / plate with a bold number. */
export function RaceNumber({ n, className = '', style }: { n: number | string; className?: string; style?: CSSProperties }) {
  return (
    <span className={`gp-roundel ${className}`} style={style}>
      {n}
    </span>
  );
}

export function Kicker({ children, className = '', tone = 'ink' }: { children: ReactNode; className?: string; tone?: 'ink' | 'red' | 'cream' }) {
  return <p className={`gp-kicker gp-kicker-${tone} ${className}`}>{children}</p>;
}

/** Counter that ticks up in discrete steps once `play` is true (final value with reduced motion). */
export function StepCounter({
  value,
  play,
  from = 0,
  steps = 12,
  ms = 480,
}: {
  value: number;
  play: boolean;
  from?: number;
  steps?: number;
  ms?: number;
}) {
  const reduced = usePrefersReducedMotion();
  // rests on the final value (SSR / offscreen / reduced motion); ticks once when `play` turns on
  const [k, setK] = useState(steps);
  useEffect(() => {
    if (!play || reduced) return;
    let i = 0;
    setK(0);
    const id = window.setInterval(() => {
      i++;
      setK(i);
      if (i >= steps) window.clearInterval(id);
    }, ms / steps);
    return () => window.clearInterval(id);
  }, [play, reduced, steps, ms]);
  const shown = reduced ? value : Math.round(from + ((value - from) * Math.min(k, steps)) / steps);
  return (
    <span>
      <span className="sr-only">{value}</span>
      <span aria-hidden>{shown}</span>
    </span>
  );
}

/** Deterministic, decorative barcode drawn from a string (not a real symbology). */
export function Barcode({ data, className = '', color = '#111111' }: { data: string; className?: string; color?: string }) {
  const rnd = prng(hash32(data));
  const bars: { x: number; w: number }[] = [];
  let x = 0;
  // guard bars
  const push = (w: number, gap: number) => {
    bars.push({ x, w });
    x += w + gap;
  };
  push(1, 1);
  push(1, 2);
  while (x < 150) push(1 + Math.floor(rnd() * 4), 1 + Math.floor(rnd() * 3));
  push(1, 1);
  push(1, 0);
  const W = x;
  return (
    <svg viewBox={`0 0 ${W} 40`} preserveAspectRatio="none" className={className} aria-hidden focusable="false">
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={0} width={b.w} height={40} fill={color} />
      ))}
    </svg>
  );
}
