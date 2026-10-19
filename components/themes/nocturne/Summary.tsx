'use client';

// Invitation card: black, double champagne border, brand monogram, centred.

import EstimatePanel from '@/components/builder/EstimatePanel';
import WhatsAppPreview from '@/components/builder/WhatsAppPreview';
import { useSummaryRows } from '@/components/neutral/steps';
import { useT } from '@/lib/i18n';
import type { SummaryProps } from '@/lib/themes';
import { Emph, Label, plain } from './ui';

export default function SummaryVariant({ nav, estimate, message, url }: SummaryProps) {
  const t = useT();
  const rows = useSummaryRows();
  return (
    <div className="nc-invite-wrap">
      <article className="nc-invite" aria-labelledby="nc-invite-title">
        <div className="nc-invite-inner">
          <span aria-hidden className="nc-monogram">{t('brand.monogram')}</span>
          <Label className="mt-6 text-accent">{t('th.nocturne.summary.eyebrow')}</Label>
          <h1 id="nc-invite-title" className="nc-h1 mt-4" aria-label={plain(t('th.nocturne.summary.title'))}>
            <Emph text={t('th.nocturne.summary.title')} />
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-sm font-light text-ink-2">{t('th.nocturne.summary.lead')}</p>

          <span aria-hidden className="nc-ornament" />

          <dl className="space-y-7">
            {rows.map((r) => (
              <div key={r.k}>
                <dt className="nc-label text-[0.62rem] text-ink-2">{r.k}</dt>
                <dd className="mt-2 font-display text-xl leading-snug sm:text-2xl">{r.v}</dd>
                <dd>
                  <button type="button" onClick={() => nav.go(r.step)} className="nc-edit" aria-label={`${t('builder.edit')} · ${r.k}`}>
                    {t('builder.edit')}
                  </button>
                </dd>
              </div>
            ))}
          </dl>

          <span aria-hidden className="nc-ornament" />

          <EstimatePanel estimate={estimate} className="nc-estimate nc-estimate-invite text-left" />

          <WhatsAppPreview
            message={message}
            url={url}
            className="mt-10 text-left"
            label={t('wa.send')}
            preClassName="nc-wa-pre"
            buttonClassName="nc-btn nc-btn-solid mt-8 w-full justify-center"
          />
        </div>
      </article>
    </div>
  );
}
