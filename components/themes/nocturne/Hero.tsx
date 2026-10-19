'use client';

// "The Unveil": Car3D on a black stage, spotlight reveal, champagne rim,
// reflective floor, slow dolly, paint cycling between real fleet colours.

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Car3D from '@/components/Car3D';
import { useStyleHref, useTheme } from '@/components/ThemeProvider';
import { carById, type Car } from '@/lib/data';
import { usePrefersReducedMotion } from '@/lib/hooks';
import { useT } from '@/lib/i18n';
import { Emph, Label, plain } from './ui';

const CYCLE_IDS = ['f8-spider', 'roma-spyder', '911-gt3'];
const CYCLE: Car[] = CYCLE_IDS.map((id) => carById(id)!).filter(Boolean);
const CYCLE_MS = 8000;

export default function Hero() {
  const t = useT();
  const href = useStyleHref();
  const { scene3D } = useTheme();
  const reduced = usePrefersReducedMotion();
  const [idx, setIdx] = useState(0);

  // caption in step with the engine's paint cycle (same period)
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setIdx((i) => (i + 1) % CYCLE.length), CYCLE_MS);
    return () => window.clearInterval(id);
  }, [reduced]);

  const lead = CYCLE[0];
  return (
    <section className="nc-hero relative isolate overflow-hidden" aria-labelledby="nc-hero-title">
      <div className="nc-hero-stage absolute inset-0">
        <Car3D
          {...scene3D}
          bodyType={lead.bodyType}
          paint={lead.color.hex}
          paintCycle={CYCLE.map((c) => c.color.hex)}
          paintCycleMs={CYCLE_MS}
          className="nc-hero-car"
          title={CYCLE.map((c) => t.l(c.color.name)).join(' · ')}
          fallbackStroke="rgba(200,169,106,.35)"
        />
        <div aria-hidden className="nc-hero-cone" />
        <div aria-hidden className="nc-hero-vignette" />
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-[1440px] flex-col justify-end px-4 pb-14 sm:px-8 lg:justify-center lg:pb-0">
        <div className="max-w-xl">
          <Label className="nc-rise text-accent">{t('brand.claim')}</Label>
          <h1 id="nc-hero-title" className="mt-5 font-display text-[3.1rem] leading-[0.98] tracking-[-0.01em] sm:text-7xl lg:text-[6.2rem]" aria-label={plain(t('th.nocturne.hero.title'))}>
            <Emph text={t('th.nocturne.hero.title')} />
          </h1>
          <p className="nc-rise nc-d2 mt-6 max-w-sm text-base font-light leading-relaxed text-ink-2">{t('claims.main')}</p>
          <div className="nc-rise nc-d3 mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link href={href('/configura/')} className="nc-btn nc-btn-solid">
              {t('cta.request')}
            </Link>
            <Link href={href('/collezione/')} className="nc-link nc-label">
              {t('cta.fleet')}
            </Link>
          </div>
        </div>
      </div>

      {/* paint caption — synced to the cycle */}
      <div className="nc-rise nc-d2 absolute right-4 top-8 z-10 hidden text-right sm:right-8 lg:block">
        <Label className="text-ink-2">{t('th.nocturne.hero.showing')}</Label>
        <ul className="mt-2 flex gap-5">
          {CYCLE.map((c, i) => (
            <li key={c.id} className={`nc-swatch ${i === idx ? 'is-on' : ''}`}>
              <span aria-hidden className="nc-swatch-dot" style={{ background: c.color.hex }} />
              <span className="text-xs tracking-wide">{t.l(c.color.name)}</span>
            </li>
          ))}
        </ul>
      </div>
      <div aria-hidden className="nc-scrollcue absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 lg:block">
        <span className="nc-label text-[0.6rem] text-ink-2">{t('th.nocturne.hero.scroll')}</span>
        <span className="nc-scrollcue-line" />
      </div>
    </section>
  );
}
