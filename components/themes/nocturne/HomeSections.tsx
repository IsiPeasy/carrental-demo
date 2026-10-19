'use client';

import Link from 'next/link';
import Photo from '@/components/Photo';
import { useStyleHref, useTheme } from '@/components/ThemeProvider';
import { CLIENTELE, DELIVERIES, FAQ, PLACEHOLDER, SERVICES, STATS, TESTIMONIALS, carById, carName, cityById } from '@/lib/data';
import { useT } from '@/lib/i18n';
import { waContactUrl } from '@/lib/whatsapp';
import { Emph, Label, plain, roman } from './ui';

function SectionHead({ id, eyebrow, title, className = '' }: { id: string; eyebrow?: string; title: string; className?: string }) {
  return (
    <div className={className}>
      {eyebrow && <Label className="text-accent">{eyebrow}</Label>}
      <h2 id={id} className="nc-h2 mt-4" aria-label={plain(title)}>
        <Emph text={title} />
      </h2>
    </div>
  );
}

export default function HomeSections() {
  const t = useT();
  const href = useStyleHref();
  const { FleetSection } = useTheme().components;
  const deliveries = DELIVERIES.slice(0, 6);
  return (
    <div>
      <FleetSection variant="home" />

      {/* I / II / III */}
      <section aria-labelledby="nc-concierge" className="nc-section border-t border-line">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
          <SectionHead id="nc-concierge" eyebrow={t('claims.steps')} title={t('th.nocturne.concierge.title')} className="max-w-3xl" />
          <ol className="mt-16 grid gap-12 md:grid-cols-3 md:gap-0">
            {t.dict.steps3.map((s, i) => (
              <li key={s.title} className="nc-col md:px-10 md:first:pl-0">
                <span className="nc-numeral" aria-hidden>
                  {roman(i + 1)}
                </span>
                <h3 className="mt-6 font-display text-3xl italic">{s.title}</h3>
                <p className="mt-3 max-w-xs font-light leading-relaxed text-ink-2">{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-20 flex flex-col gap-4 border-t border-line pt-8 lg:flex-row lg:items-baseline lg:gap-12">
            <Label className="shrink-0 text-ink-2">{t('th.nocturne.concierge.services')}</Label>
            <ul className="flex flex-wrap gap-x-3 gap-y-2 text-sm font-light text-ink">
              {SERVICES.map((x, i) => (
                <li key={x} className="flex items-center gap-3">
                  {i > 0 && <span aria-hidden className="text-accent-2">·</span>}
                  {t(`services.${x}.name`)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* guarantees — thin row */}
      <section aria-label={t('guarantees.title')} className="nc-guarantees border-y border-line">
        <ul className="mx-auto grid max-w-[1440px] sm:grid-cols-2 lg:grid-cols-4">
          {t.dict.guarantees.items.map((g) => (
            <li key={g.id} className="nc-guarantee">
              <span aria-hidden className="nc-diamond" />
              <div>
                <h3 className="nc-label text-ink">{g.title}</h3>
                <p className="mt-1 text-sm font-light text-ink-2">{g.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* numbers */}
      <section aria-label={t('fleet.title')} className="mx-auto max-w-[1440px] px-4 py-20 sm:px-8">
        <dl className="grid grid-cols-2 gap-y-10 sm:grid-cols-5">
          {STATS.map((s) => (
            <div key={s.id} className="nc-stat flex flex-col-reverse">
              <dt className="nc-label mt-3 text-ink-2">{t(`stats.${s.id}`)}</dt>
              <dd className="font-display text-5xl tabular-nums sm:text-6xl">{s.value ?? PLACEHOLDER}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* deliveries */}
      <section aria-labelledby="nc-deliveries" className="nc-section border-t border-line">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHead id="nc-deliveries" eyebrow={t('deliveries.lead')} title={t('th.nocturne.deliveries.title')} />
          </div>
          <ul className="nc-deliveries mt-14">
            {deliveries.map((d, i) => (
              <li key={d.slot} className={`nc-delivery nc-delivery-${i}`}>
                <Photo slot={d.slot} ratio="4/5" tone="surface" className="nc-photo" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* testimonials */}
      <section aria-labelledby="nc-test" className="nc-section border-t border-line">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
          <SectionHead id="nc-test" eyebrow={t('testimonials.title')} title={t('th.nocturne.testimonials.title')} />
          <div className="mt-14 grid gap-12 md:grid-cols-3 md:gap-10">
            {TESTIMONIALS.map((q) => (
              <figure key={q.name} className="nc-quote">
                <span aria-hidden className="nc-quote-mark">“</span>
                <blockquote className="font-display text-xl italic leading-snug sm:text-[1.45rem]">{t.l(q.quote)}</blockquote>
                <figcaption className="mt-6 border-t border-line pt-4">
                  <span className="nc-label text-ink">{q.name}</span>
                  <span className="mt-1 block text-sm font-light text-ink-2">
                    {t.l(q.role)} · {t.l(cityById(q.cityId)!.name)} · {carName(carById(q.carId)!)}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-16 flex flex-wrap items-baseline gap-x-4 gap-y-2 text-sm font-light text-ink-2">
            <span className="nc-label text-accent">{t('clientele.title')}</span>
            {CLIENTELE.map((c) => t.l(c)).join(' · ')}
          </p>
        </div>
      </section>

      {/* faq */}
      <section aria-labelledby="nc-faq" className="nc-section border-t border-line">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-4 sm:px-8 lg:grid-cols-[1fr_1.6fr]">
          <SectionHead id="nc-faq" eyebrow={t('faq.title')} title={t('th.nocturne.faq.title')} />
          <div className="border-t border-line">
            {FAQ.map((f, i) => (
              <details key={f.q.it} className="nc-faq group border-b border-line">
                <summary className="flex cursor-pointer list-none items-baseline gap-5 py-6">
                  <span className="nc-label w-8 shrink-0 text-accent">{roman(i + 1)}</span>
                  <span className="flex-1 font-display text-xl sm:text-2xl">{t.l(f.q)}</span>
                  <span aria-hidden className="nc-faq-sign" />
                </summary>
                <p className="pb-6 pl-[3.25rem] pr-8 font-light leading-relaxed text-ink-2">{t.l(f.a)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* closing — contact */}
      <section aria-labelledby="nc-contact" className="nc-contact relative overflow-hidden border-t border-line">
        <div aria-hidden className="nc-contact-glow" />
        <div className="relative mx-auto max-w-4xl px-4 py-28 text-center sm:px-8 sm:py-36">
          <Label className="text-accent">{t('th.nocturne.contact.eyebrow')}</Label>
          <h2 id="nc-contact" className="nc-h2 mx-auto mt-6 max-w-3xl" aria-label={plain(t('th.nocturne.contact.title'))}>
            <Emph text={t('th.nocturne.contact.title')} />
          </h2>
          <p className="mt-6 font-light text-ink-2">{t('th.nocturne.contact.lead')}</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <Link href={href('/configura/')} className="nc-btn nc-btn-solid">
              {t('cta.request')}
            </Link>
            <a href={waContactUrl(t.locale)} target="_blank" rel="noopener noreferrer" className="nc-link nc-label">
              {t('cta.whatsapp')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
