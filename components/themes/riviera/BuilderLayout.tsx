'use client';

import EstimatePanel from '@/components/builder/EstimatePanel';
import { useMoney, useSwitcherOffset } from '@/components/builder/kit';
import { useT } from '@/lib/i18n';
import { LAST_STEP, useEstimate } from '@/lib/store';
import type { BuilderLayoutProps, BuilderNav } from '@/lib/themes';
import { Kicker, roman } from './shared';

function Stepper({ nav }: { nav: BuilderNav }) {
  const t = useT();
  return (
    <nav aria-label={t('builder.title')} className="rv-stepper no-print">
      <ol className="flex overflow-x-auto no-scrollbar">
        {t.dict.builder.steps.map((label, i) => {
          const reachable = i <= nav.maxReachable;
          const current = i === nav.step;
          return (
            <li key={label} className="min-w-0 flex-1">
              <button
                type="button"
                disabled={!reachable}
                aria-current={current ? 'step' : undefined}
                onClick={() => nav.go(i)}
                className={`rv-step ${i < nav.step ? 'is-done' : ''}`}
              >
                <span className="rv-step-num">{roman(i + 1)}</span>
                <span className="rv-step-label">{label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function StepNav({ nav, className = '' }: { nav: BuilderNav; className?: string }) {
  const t = useT();
  const last = nav.step === LAST_STEP;
  return (
    <div className={`no-print flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-6 ${className}`}>
      <button type="button" onClick={nav.back} disabled={nav.step === 0} className="rv-link disabled:opacity-30">
        <span aria-hidden>←</span> {t('builder.back')}
      </button>
      {!last && (
        <button
          type="button"
          onClick={nav.next}
          disabled={!nav.canNext}
          aria-describedby={nav.reason ? 'next-reason' : undefined}
          className="rv-btn rv-btn-primary ml-auto"
        >
          {t('builder.next')} <span aria-hidden>→</span>
        </button>
      )}
      {!last && nav.reason && (
        <p id="next-reason" className="rv-display rv-it w-full text-right text-ink-2" role="status">
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
  return (
    <div className="rv-builder mx-auto max-w-7xl px-4 pb-40 pt-10 sm:px-6 lg:pb-16 lg:pt-14">
      <div className="no-print flex flex-wrap items-baseline justify-between gap-3">
        <Kicker>{t('th.riviera.builder.kicker')}</Kicker>
        <p className="rv-display rv-it text-ink-2">{t('builder.stepOf', { n: nav.step + 1, total: nav.total })}</p>
      </div>
      <Stepper nav={nav} />
      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16">
        <div key={nav.step} className="rv-step-body min-w-0">
          {children}
          <StepNav nav={nav} className="mt-12" />
        </div>
        <aside className="no-print hidden lg:block">
          <div className="rv-note sticky top-36">
            <p className="rv-kicker-plain">{t('th.riviera.builder.note')}</p>
            <h2 className="rv-display rv-it mt-1 text-2xl">{t('price.estimate')}</h2>
            <EstimatePanel estimate={est} className="mt-5" />
          </div>
        </aside>
      </div>
      {/* mobile sticky estimate bar */}
      <div className="rv-mobilebar no-print fixed inset-x-0 bottom-0 z-30 px-4 pb-3 pt-3 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div aria-live="polite" aria-atomic="true" className="min-w-0">
            <p className="text-[0.68rem] uppercase tracking-[0.18em] text-ink-2">{t('price.total')}</p>
            <p className="rv-display text-2xl leading-tight tabular-nums">{money(est.total)}</p>
          </div>
          {nav.step < nav.total - 1 && (
            <button type="button" onClick={nav.next} disabled={!nav.canNext} className="rv-btn rv-btn-primary rv-btn-sm shrink-0">
              {t('builder.next')} <span aria-hidden>→</span>
            </button>
          )}
        </div>
        <p className="mt-1 text-[0.68rem] leading-snug text-ink-2">{t('price.disclaimer')}</p>
      </div>
    </div>
  );
}
