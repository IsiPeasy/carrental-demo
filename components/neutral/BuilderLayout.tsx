'use client';

import EstimatePanel from '@/components/builder/EstimatePanel';
import { useMoney, useSwitcherOffset } from '@/components/builder/kit';
import { useT } from '@/lib/i18n';
import { LAST_STEP, useEstimate } from '@/lib/store';
import type { BuilderLayoutProps, BuilderNav } from '@/lib/themes';

export function Stepper({ nav, className = '' }: { nav: BuilderNav; className?: string }) {
  const t = useT();
  return (
    <nav aria-label={t('builder.title')} className={className}>
      <ol className="flex gap-1 overflow-x-auto no-scrollbar">
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
                className={`rounded-theme border px-3 py-1.5 text-sm transition-colors disabled:opacity-35 ${
                  current ? 'border-accent text-accent' : 'border-line text-ink-2 hover:text-ink'
                }`}
              >
                <span className="font-mono text-xs">{i + 1}</span> {label}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Back / Next with the written reason when Next is disabled. */
export function StepNavButtons({ nav, className = '' }: { nav: BuilderNav; className?: string }) {
  const t = useT();
  if (nav.step === LAST_STEP)
    return (
      <div className={className}>
        <button type="button" onClick={nav.back} className="rounded-theme border border-line px-4 py-2">
          ← {t('builder.back')}
        </button>
      </div>
    );
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <button type="button" onClick={nav.back} disabled={nav.step === 0} className="rounded-theme border border-line px-4 py-2 disabled:opacity-30">
        ← {t('builder.back')}
      </button>
      <button
        type="button"
        onClick={nav.next}
        disabled={!nav.canNext}
        aria-describedby={nav.reason ? 'next-reason' : undefined}
        className="rounded-theme bg-accent px-5 py-2 text-bg disabled:opacity-40"
      >
        {t('builder.next')} →
      </button>
      {nav.reason && (
        <p id="next-reason" className="text-sm text-ink-2" role="status">
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
  useSwitcherOffset(92);
  return (
    <div className="mx-auto max-w-7xl px-4 pb-32 pt-8 sm:px-6 lg:pb-16">
      <p className="label-caps text-ink-2">{t('builder.stepOf', { n: nav.step + 1, total: nav.total })}</p>
      <Stepper nav={nav} className="mt-3" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div>
          {children}
          <StepNavButtons nav={nav} className="mt-10" />
        </div>
        {/* desktop aside */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-theme border border-line bg-surface p-5">
            <h2 className="label-caps mb-4 text-ink-2">{t('price.estimate')}</h2>
            <EstimatePanel estimate={est} />
          </div>
        </aside>
      </div>
      {/* mobile sticky bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div aria-live="polite">
            <p className="text-xs text-ink-2">{t('price.total')}</p>
            <p className="font-display text-xl tabular-nums">{money(est.total)}</p>
          </div>
          {nav.step < nav.total - 1 && (
            <button type="button" onClick={nav.next} disabled={!nav.canNext} className="rounded-theme bg-accent px-4 py-2 text-sm text-bg disabled:opacity-40">
              {t('builder.next')} →
            </button>
          )}
        </div>
        <p className="mt-1 text-[10px] text-ink-2">{t('price.disclaimer')}</p>
      </div>
    </div>
  );
}
