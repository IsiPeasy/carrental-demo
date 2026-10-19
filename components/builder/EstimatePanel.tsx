'use client';

// Neutral estimate display. Themes may restyle via className/slots or build
// their own from useEstimate() + useEstimateLines(); aria-live must stay.

import { useT } from '@/lib/i18n';
import type { Estimate } from '@/lib/pricing';
import { useEstimateLines, useMoney } from './kit';

export interface EstimatePanelProps {
  estimate: Estimate;
  className?: string;
  /** only total + disclaimer */
  compact?: boolean;
  /** show the "demo" tag next to demo values */
  showDemoTags?: boolean;
}

export default function EstimatePanel({ estimate, className = '', compact = false, showDemoTags = true }: EstimatePanelProps) {
  const t = useT();
  const money = useMoney();
  const lines = useEstimateLines(estimate);
  const empty = estimate.lines.length === 0 && estimate.onRequest.length === 0;
  return (
    <section className={className} aria-live="polite" aria-atomic="true" aria-label={t('price.estimate')}>
      {empty ? (
        <p className="text-sm text-ink-2">{t('price.empty')}</p>
      ) : (
        <>
          {!compact && (
            <ul className="space-y-1.5 text-sm">
              {lines.map((l) => (
                <li key={l.id} className="flex items-baseline justify-between gap-3">
                  <span className="text-ink-2">
                    {l.label}
                    {showDemoTags && l.demo && (
                      <span className="ml-1.5 align-middle font-mono text-[10px] uppercase tracking-wider opacity-70">
                        {t('price.demo')}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 tabular-nums">{l.formatted}</span>
                </li>
              ))}
              {estimate.onRequest.map((o) => (
                <li key={o.id} className="flex items-baseline justify-between gap-3">
                  <span className="text-ink-2">{t(o.labelKey)}</span>
                  <span className="shrink-0 text-xs italic text-ink-2">{t('price.onRequest')}</span>
                </li>
              ))}
            </ul>
          )}
          <div className={`flex items-baseline justify-between gap-3 ${compact ? '' : 'mt-3 border-t border-line pt-3'}`}>
            <span className="text-sm">{t('price.total')}</span>
            <span className="font-display text-2xl tabular-nums">{money(estimate.total)}</span>
          </div>
        </>
      )}
      <p className="mt-2 text-xs text-ink-2">{t('price.disclaimer')}</p>
    </section>
  );
}
