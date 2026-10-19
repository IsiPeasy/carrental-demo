'use client';

// "/" — five full-height doors (side by side on desktop, expanding on hover/
// focus; stacked on mobile). Each door renders in its own tokens with the
// theme's live mini hero (Door component from the registry — no 3D here).

import Link from 'next/link';
import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { STYLE_IDS, THEMES } from '@/lib/themes';

export default function Landing() {
  const t = useT();
  const [active, setActive] = useState<number | null>(null);
  return (
    <div className="flex min-h-dvh flex-col bg-[#0b0b0b] text-[#f2f2f2]">
      <header className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-4 sm:px-6">
        <p className="text-sm font-medium tracking-wide">
          {t('brand.name')} <span className="text-white/50">· {t('brand.claim')}</span>
        </p>
        <h1 className="text-sm text-white/80">{t('landing.line')}</h1>
      </header>
      <ul className="flex flex-1 flex-col lg:flex-row" onMouseLeave={() => setActive(null)}>
        {STYLE_IDS.map((id, i) => {
          const th = THEMES[id];
          const Door = th.components.Door;
          const isActive = active === i;
          return (
            <li
              key={id}
              data-theme={id}
              className="door relative flex min-h-[78vh] flex-col overflow-hidden border-b border-black/20 bg-bg text-ink lg:min-h-0 lg:border-b-0 lg:border-r"
              style={{ flexGrow: active == null ? 1 : isActive ? 2.4 : 0.8, flexBasis: 0 }}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
            >
              <div className="relative flex-1">
                <div className="absolute inset-0">
                  <Door active={isActive || active == null} />
                </div>
              </div>
              <div className="relative z-10 bg-gradient-to-t from-bg via-bg/90 to-transparent p-6 pt-10">
                <p className="font-mono text-xs text-ink-2">{t('landing.styleN', { n: i + 1 })}</p>
                <h2 className="mt-1 font-display text-4xl leading-none">{th.name}</h2>
                <p className="mt-3 text-sm text-ink">{t.l(th.tagline)}</p>
                <p className="mt-1 text-sm text-ink-2">
                  <span className="label-caps">{t('landing.forWho')}</span> · {t.l(th.audience)}
                </p>
                <Link
                  href={`/${id}/`}
                  className="mt-5 inline-flex items-center gap-2 rounded-theme bg-accent px-5 py-2.5 text-sm font-medium text-bg transition-transform hover:translate-x-0.5"
                >
                  {t('landing.enter')} <span aria-hidden>→</span>
                  <span className="sr-only"> {th.name}</span>
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
      <footer className="px-4 py-3 text-xs text-white/60 sm:px-6">{t('footer.disclaimer')}</footer>
    </div>
  );
}
