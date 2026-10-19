'use client';

import EstimatePanel from '@/components/builder/EstimatePanel';
import { useMoney, useSwitcherOffset } from '@/components/builder/kit';
import { useT } from '@/lib/i18n';
import { LAST_STEP, useEstimate } from '@/lib/store';
import type { BuilderLayoutProps, BuilderNav } from '@/lib/themes';
import { Label, roman } from './ui';

function Stepper({ nav }: { nav: BuilderNav }) {
  const t = useT();
  const pct = (nav.step / (nav.total - 1)) * 100;
  return (
    <nav aria-label={t('builder.title')} className="nc-stepper">
      <div aria-hidden className="nc-stepper-track">
        <span className="nc-stepper-fill" style={{ width: `${pct}%` }} />
      </div>
      <ol className="no-scrollbar flex justify-between gap-4 overflow-x-auto">
        {t.dict.builder.steps.map((label, i) => {
          const reachable = i <= nav.maxReachable;
          const current = i === nav.step;
          return (
            <li key={label} className="shrink-0">
              <button
                type="button"
                disabled={!reachable}
                aria-current={current ? 'step' : undefined}
                onClick={() => nav.go(i)}
                className={`nc-step ${current ? 'is-current' : ''} ${i < nav.step ? 'is-done' : ''}`}
              >
                <span aria-hidden className="nc-step-dot" />
                <span className="font-display text-sm italic">{roman(i + 1)}</span>
                <span className="nc-label hidden sm:inline">{label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function NavButtons({ nav, className = '' }: { nav: BuilderNav; className?: string }) {
  const t = useT();
  if (nav.step === LAST_STEP)
    return (
      <div className={`flex justify-center ${className}`}>
        <button type="button" onClick={nav.back} className="nc-link nc-label">
          ← {t('builder.back')}
        </button>
      </div>
    );
  return (
    <div className={`flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-line pt-8 ${className}`}>
      <button type="button" onClick={nav.back} disabled={nav.step === 0} className="nc-link nc-label disabled:opacity-30">
        ← {t('builder.back')}
      </button>
      <button
        type="button"
        onClick={nav.next}
        disabled={!nav.canNext}
        aria-describedby={nav.reason ? 'next-reason' : undefined}
        className="nc-btn nc-btn-solid"
      >
        {t('builder.next')} →
      </button>
      {nav.reason && (
        <p id="next-reason" className="text-sm italic text-ink-2" role="status">
          {t(nav.reason)}
        </p>
      )}
    </div>
  );
}

export default function BuilderLayout({ nav, children }: BuilderLayoutProps) {
  const t = useT();
  const est = useEstimate();
  const money = useMoney();
  useSwitcherOffset(104);
  const wide = nav.step === 0; // the turntable takes the full width
  const summary = nav.step === LAST_STEP;
  return (
    <div className="nc-builder mx-auto max-w-[1440px] px-4 pb-40 pt-10 sm:px-8 lg:pb-24">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <Label className="text-accent">{t('th.nocturne.builder.eyebrow')}</Label>
        <Label className="text-ink-2">{t('builder.stepOf', { n: nav.step + 1, total: nav.total })}</Label>
      </div>
      <Stepper nav={nav} />
      <div className={`mt-12 grid gap-12 ${wide || summary ? '' : 'lg:grid-cols-[1fr_360px] xl:gap-20'}`}>
        <div className="min-w-0">
          {children}
          <NavButtons nav={nav} className="mt-12" />
        </div>
        {!wide && !summary && (
          <aside className="hidden lg:block" aria-label={t('th.nocturne.builder.aside')}>
            <div className="nc-aside sticky top-28">
              <Label as="h2" className="mb-6 text-accent">{t('th.nocturne.builder.aside')}</Label>
              <EstimatePanel estimate={est} className="nc-estimate" />
            </div>
          </aside>
        )}
      </div>
      {wide && (
        <div className="mt-12 hidden lg:block">
          <div className="nc-aside">
            <Label as="h2" className="mb-6 text-accent">{t('th.nocturne.builder.aside')}</Label>
            <EstimatePanel estimate={est} className="nc-estimate nc-estimate-wide" />
          </div>
        </div>
      )}
      {/* mobile sticky estimate bar */}
      <div className="nc-mobilebar fixed inset-x-0 bottom-0 z-30 px-4 pb-3 pt-3 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div aria-live="polite" aria-atomic="true" className="min-w-0">
            <p className="nc-label text-[0.6rem] text-ink-2">{t('price.total')}</p>
            <p className="font-display text-2xl tabular-nums leading-tight">{money(est.total)}</p>
          </div>
          {nav.step < nav.total - 1 && (
            <button type="button" onClick={nav.next} disabled={!nav.canNext} className="nc-btn nc-btn-solid nc-btn-sm">
              {t('builder.next')} →
            </button>
          )}
        </div>
        <p className="mt-1 text-[10px] text-ink-2">{t('price.disclaimer')}</p>
      </div>
    </div>
  );
}
