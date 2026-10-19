'use client';

import { useEstimateLines, useMoney, useSwitcherOffset } from '@/components/builder/kit';
import { useT } from '@/lib/i18n';
import type { Estimate } from '@/lib/pricing';
import { LAST_STEP, useEstimate } from '@/lib/store';
import type { BuilderLayoutProps, BuilderNav } from '@/lib/themes';

/** Lap indicator stepper (same logic as the neutral one). */
export function LapStepper({ nav }: { nav: BuilderNav }) {
  const t = useT();
  return (
    <nav aria-label={t('builder.title')}>
      <ol className="gp-laps no-scrollbar">
        {t.dict.builder.steps.map((label, i) => {
          const reachable = i <= nav.maxReachable;
          const current = i === nav.step;
          const done = i < nav.step;
          return (
            <li key={label}>
              <button
                type="button"
                disabled={!reachable}
                aria-current={current ? 'step' : undefined}
                onClick={() => nav.go(i)}
                className={`gp-lapbtn ${done ? 'is-done' : ''}`}
              >
                <span className="gp-lapbtn-n">{String(i + 1).padStart(2, '0')}</span>
                <span className="gp-lapbtn-l">{label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function GPStepNav({ nav, className = '' }: { nav: BuilderNav; className?: string }) {
  const t = useT();
  if (nav.step === LAST_STEP)
    return (
      <div className={className}>
        <button type="button" onClick={nav.back} className="gp-btn gp-btn-ghost">
          <span aria-hidden>←</span> {t('builder.back')}
        </button>
      </div>
    );
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <button type="button" onClick={nav.back} disabled={nav.step === 0} className="gp-btn gp-btn-ghost">
        <span aria-hidden>←</span> {t('builder.back')}
      </button>
      <button
        type="button"
        onClick={nav.next}
        disabled={!nav.canNext}
        aria-describedby={nav.reason ? 'next-reason' : undefined}
        className="gp-btn gp-btn-red"
      >
        {t('builder.next')} <span aria-hidden>→</span>
      </button>
      {nav.reason && (
        <p id="next-reason" className="gp-reason" role="status">
          {t(nav.reason)}
        </p>
      )}
    </div>
  );
}

/** Timing-screen estimate (dark board). aria-live polite, disclaimer always shown. */
export function TimingPanel({ estimate, className = '' }: { estimate: Estimate; className?: string }) {
  const t = useT();
  const money = useMoney();
  const lines = useEstimateLines(estimate);
  const empty = estimate.lines.length === 0 && estimate.onRequest.length === 0;
  return (
    <section className={`gp-timingpanel ${className}`} aria-live="polite" aria-atomic="true" aria-label={t('price.estimate')}>
      <header className="flex items-center justify-between gap-3 border-b-2 border-[#EFE7D6]/30 pb-2">
        <h2 className="font-mono text-xs font-bold uppercase tracking-widest">{t('th.grand-prix.builder.timing')}</h2>
        <span aria-hidden className="gp-live-dot" />
      </header>
      {empty ? (
        <p className="mt-3 text-sm text-[#CFC8B8]">{t('price.empty')}</p>
      ) : (
        <>
          <ul className="mt-3 space-y-2 font-mono text-[13px]">
            {lines.map((l) => (
              <li key={l.id} className="flex items-baseline justify-between gap-3">
                <span className="text-[#CFC8B8]">
                  {l.label}
                  {l.demo && <span className="gp-demo-tag ml-1.5">{t('price.demo')}</span>}
                </span>
                <span className="shrink-0 tabular-nums text-[#EFE7D6]">{l.formatted}</span>
              </li>
            ))}
            {estimate.onRequest.map((o) => (
              <li key={o.id} className="flex items-baseline justify-between gap-3">
                <span className="text-[#CFC8B8]">{t(o.labelKey)}</span>
                <span className="shrink-0 text-[11px] uppercase text-[#F2C230]">{t('price.onRequest')}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-baseline justify-between gap-3 border-t-2 border-[#EFE7D6]/30 pt-3">
            <span className="font-mono text-xs font-bold uppercase tracking-widest">{t('price.total')}</span>
            <span className="gp-total tabular-nums">{money(estimate.total)}</span>
          </div>
        </>
      )}
      <p className="mt-3 text-xs text-[#CFC8B8]">{t('price.disclaimer')}</p>
    </section>
  );
}

export default function BuilderLayout({ nav, children }: BuilderLayoutProps) {
  const t = useT();
  const est = useEstimate();
  const money = useMoney();
  useSwitcherOffset(104);
  return (
    <div className="gp-builder relative">
      <div className="gp-builder-top border-b-2 border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4 px-4 pb-5 pt-8 sm:px-6">
          <div>
            <p className="gp-kicker gp-kicker-red">{t('builder.title')}</p>
            <p className="gp-display mt-1 text-4xl leading-none sm:text-5xl">
              {t('th.grand-prix.builder.lap', { n: nav.step + 1, total: nav.total })}
            </p>
            <p className="sr-only">{t('builder.stepOf', { n: nav.step + 1, total: nav.total })}</p>
          </div>
          <LapStepper nav={nav} />
        </div>
      </div>
      {nav.step === LAST_STEP ? (
        // summary: the paddock pass carries its own timing sheet, no aside
        <div className="mx-auto max-w-5xl px-4 pb-40 pt-8 sm:px-6 lg:pb-20">
          {children}
          <GPStepNav nav={nav} className="mt-10" />
        </div>
      ) : (
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-40 pt-8 sm:px-6 lg:grid-cols-[1fr_360px] lg:pb-20">
          <div className="min-w-0">
            {children}
            <GPStepNav nav={nav} className="mt-10" />
          </div>
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <TimingPanel estimate={est} />
            </div>
          </aside>
        </div>
      )}
      {/* mobile sticky timing bar */}
      <div className="gp-mobilebar fixed inset-x-0 bottom-0 z-30 lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 pt-3">
          <div aria-live="polite" aria-atomic="true">
            <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#CFC8B8]">{t('price.total')}</p>
            <p className="gp-total text-2xl tabular-nums">{money(est.total)}</p>
          </div>
          {nav.step < nav.total - 1 && (
            <button type="button" onClick={nav.next} disabled={!nav.canNext} className="gp-btn gp-btn-red gp-btn-sm">
              {t('builder.next')} <span aria-hidden>→</span>
            </button>
          )}
        </div>
        <p className="px-4 pb-3 pt-1 text-[11px] text-[#CFC8B8]">{t('price.disclaimer')}</p>
      </div>
    </div>
  );
}
