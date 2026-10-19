'use client';

import CarSilhouette from '@/components/CarSilhouette';
import Photo, { deliveryCaption } from '@/components/Photo';
import { useTheme } from '@/components/ThemeProvider';
import { useMoney } from '@/components/builder/kit';
import {
  CLIENTELE,
  CONTACTS,
  DELIVERIES,
  FAQ,
  JET_ROUTES,
  PLACEHOLDER,
  STATS,
  TESTIMONIALS,
  carById,
  cityById,
  type ServiceId,
} from '@/lib/data';
import { useT } from '@/lib/i18n';
import { waContactUrl } from '@/lib/whatsapp';
import { DeliveryIcon, Kicker, Ornament, roman } from './shared';

const RATIOS = ['4/5', '3/2', '1/1', '4/3', '3/4', '3/2', '1/1', '4/5', '4/3'];
const TONES = ['accent', 'surface', 'accent', 'surface', 'ink', 'accent', 'surface', 'accent', 'surface'] as const;
const SEA: ServiceId[] = ['yacht', 'jet', 'helicopter'];
const LAND: ServiceId[] = ['chauffeur', 'meet-greet', 'security'];

function SectionHead({ id, kicker, title, lead, center = false }: { id: string; kicker: string; title: string; lead?: string; center?: boolean }) {
  return (
    <header className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <Kicker className={center ? 'justify-center' : ''}>{kicker}</Kicker>
      <h2 id={id} className="rv-display mt-4 text-[clamp(2.2rem,4.6vw,3.6rem)] leading-[1.02]">
        {title}
      </h2>
      {lead && <p className="mt-4 text-ink-2">{lead}</p>}
    </header>
  );
}

export default function HomeSections() {
  const t = useT();
  const money = useMoney();
  const { FleetSection } = useTheme().components;
  const journal = DELIVERIES.slice(0, 9);
  const [lead, ...others] = TESTIMONIALS;

  return (
    <div className="rv-home mx-auto max-w-7xl space-y-28 px-4 sm:px-6 lg:space-y-36">
      {/* I — the method */}
      <section aria-labelledby="h-steps" className="grid gap-12 border-t border-line pt-14 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <SectionHead id="h-steps" kicker={t('th.riviera.home.method')} title={t('claims.steps')} />
        <ol className="grid gap-10 sm:grid-cols-3">
          {t.dict.steps3.map((s, i) => (
            <li key={s.title} className="rv-reveal">
              <span className="rv-numeral" aria-hidden>
                {roman(i + 1)}
              </span>
              <h3 className="rv-display mt-3 text-2xl">{s.title}</h3>
              <p className="mt-2 text-ink-2">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* guarantees + figures */}
      <section aria-labelledby="h-guar" className="rv-panel">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
          <SectionHead id="h-guar" kicker={t('th.riviera.home.guarantees')} title={t('guarantees.title')} />
          <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {t.dict.guarantees.items.map((g, i) => (
              <li key={g.id} className="border-t border-line pt-4">
                <span className="text-xs tracking-[0.2em] text-ink-2">{roman(i + 1)}.</span>
                <h3 className="rv-display rv-it mt-1 text-2xl">{g.title}</h3>
                <p className="mt-1 text-ink-2">{g.text}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-14 border-t border-line pt-8">
          <p className="rv-kicker-plain">{t('th.riviera.home.figures')}</p>
          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-5">
            {STATS.map((s) => (
              <div key={s.id} className="flex flex-col-reverse">
                <dt className="mt-1 text-sm text-ink-2">{t(`stats.${s.id}`)}</dt>
                <dd className={`rv-display text-[2.6rem] leading-none tabular-nums ${s.value == null ? 'text-ink-2' : ''}`}>{s.value ?? PLACEHOLDER}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <FleetSection variant="home" />

      {/* Consegne reali — magazine spread */}
      <section aria-labelledby="h-deliveries">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <SectionHead id="h-deliveries" kicker={t('th.riviera.home.journal')} title={t('deliveries.title')} lead={t('deliveries.lead')} />
          <Ornament className="hidden w-36 text-accent-2 lg:block" />
        </div>
        <div className="rv-masonry mt-12">
          {journal.map((d, i) => {
            const c = deliveryCaption(d.slot, t)!;
            return (
              <div key={d.slot} className="rv-masonry-item">
                <Photo slot={d.slot} ratio={RATIOS[i % RATIOS.length]} tone={TONES[i % TONES.length]} showCaption={false}>
                  <span className={`rv-photo-frame ${TONES[i % TONES.length] === 'surface' ? 'is-light' : ''}`} aria-hidden>
                    <span className="rv-photo-code">{c.city?.code}</span>
                  </span>
                </Photo>
                <p className="mt-3 flex items-baseline gap-3">
                  <span className="rv-display w-10 shrink-0 text-[0.95rem] italic text-ink-2">{roman(i + 1)}.</span>
                  <span className="rv-display rv-it text-xl">
                    {c.place} <span className="text-ink-2">· {c.month}</span>
                  </span>
                </p>
                <p className="mt-0.5 pl-[3.25rem] text-[0.68rem] uppercase tracking-[0.18em] text-ink-2">{c.car}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Yacht & Supercar Concierge — two columns */}
      <section aria-labelledby="h-concierge" className="rv-panel">
        <SectionHead id="h-concierge" kicker={t('th.riviera.home.conciergeKicker')} title={t('th.riviera.home.conciergeTitle')} />
        <div className="mt-14 grid gap-14 md:grid-cols-2 md:gap-0">
          <article className="md:border-r md:border-line md:pr-12">
            <DeliveryIcon type="marina" className="h-14 w-14 text-accent" />
            <h3 className="rv-display rv-it mt-5 text-3xl">{t('th.riviera.home.seaTitle')}</h3>
            <p className="mt-3 max-w-md text-ink-2">{t('th.riviera.home.seaText')}</p>
            <ul className="mt-6 space-y-2">
              {SEA.map((s) => (
                <li key={s} className="flex gap-3 border-b border-line pb-2">
                  <span className="font-medium">{t(`services.${s}.name`)}</span>
                  <span className="text-ink-2">— {t(`services.${s}.desc`)}</span>
                </li>
              ))}
            </ul>
            <h4 className="rv-kicker-plain mt-10">{t('jet.title')}</h4>
            <table className="mt-3 w-full text-sm">
              <tbody>
                {JET_ROUTES.map((r) => (
                  <tr key={r.to} className="border-b border-dotted border-line">
                    <th scope="row" className="py-2 text-left font-normal">{t.l(r.label)}</th>
                    <td className="py-2 text-right tabular-nums">{t('jet.from', { price: money(r.fromPrice) })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-ink-2">{t('price.disclaimer')}</p>
          </article>
          <article className="md:pl-12">
            <CarSilhouette bodyType="gt" color="var(--color-accent)" accent="var(--color-surface)" stroke="var(--color-ink)" strokeWidth={1} shadow={false} className="h-14 w-auto" />
            <h3 className="rv-display rv-it mt-5 text-3xl">{t('th.riviera.home.landTitle')}</h3>
            <p className="mt-3 max-w-md text-ink-2">{t('th.riviera.home.landText')}</p>
            <ul className="mt-6 space-y-2">
              {LAND.map((s) => (
                <li key={s} className="flex gap-3 border-b border-line pb-2">
                  <span className="font-medium">{t(`services.${s}.name`)}</span>
                  <span className="text-ink-2">— {t(`services.${s}.desc`)}</span>
                </li>
              ))}
            </ul>
            <ul className="mt-10 grid grid-cols-3 gap-4 sm:grid-cols-6 md:grid-cols-3 xl:grid-cols-6">
              {(['hotel', 'villa', 'ufficio', 'marina', 'aeroporto', 'fbo'] as const).map((d) => (
                <li key={d} className="flex flex-col items-center gap-1.5 text-center text-xs text-ink-2">
                  <DeliveryIcon type={d} className="h-9 w-9 text-ink" />
                  {t(`deliveryTypes.${d}`)}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      {/* testimonials — editorial pull quotes */}
      <section aria-labelledby="h-test">
        <SectionHead id="h-test" kicker={t('th.riviera.home.letters')} title={t('testimonials.title')} center />
        <figure className="mx-auto mt-14 max-w-4xl text-center">
          <span className="rv-quote-mark" aria-hidden>
            “
          </span>
          <blockquote className="rv-display rv-it text-[clamp(1.6rem,3.4vw,2.6rem)] leading-snug">{t.l(lead.quote)}</blockquote>
          <figcaption className="mt-6 text-sm uppercase tracking-[0.2em] text-ink-2">
            {lead.name} · {t.l(lead.role)} · {t.l(cityById(lead.cityId)!.name)} · {carById(lead.carId)!.model}
          </figcaption>
        </figure>
        <div className="mt-16 grid gap-12 border-t border-line pt-12 md:grid-cols-2">
          {others.map((q) => (
            <figure key={q.name} className="md:px-6">
              <blockquote className="rv-display rv-it text-xl leading-relaxed sm:text-2xl">
                <span className="text-accent-2" aria-hidden>
                  “
                </span>
                {t.l(q.quote)}
              </blockquote>
              <figcaption className="mt-4 text-sm uppercase tracking-[0.2em] text-ink-2">
                {q.name} · {t.l(q.role)} · {t.l(cityById(q.cityId)!.name)} · {carById(q.carId)!.model}
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-14 text-center text-ink-2">
          <span className="rv-kicker-plain">{t('clientele.title')}</span>
          <span className="rv-display rv-it mt-2 block text-xl text-ink">{CLIENTELE.map((c) => t.l(c)).join(' · ')}</span>
        </p>
      </section>

      {/* FAQ */}
      <section aria-labelledby="h-faq" className="grid gap-10 border-t border-line pt-14 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <SectionHead id="h-faq" kicker={t('th.riviera.home.questions')} title={t('faq.title')} />
        <div className="border-b border-line">
          {FAQ.map((f) => (
            <details key={f.q.it} className="rv-faq group border-t border-line">
              <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 py-5">
                <span className="rv-display text-xl sm:text-2xl">{t.l(f.q)}</span>
                <span className="rv-faq-plus" aria-hidden />
              </summary>
              <p className="max-w-2xl pb-6 text-ink-2">{t.l(f.a)}</p>
            </details>
          ))}
        </div>
      </section>

      {/* write to us */}
      <section aria-labelledby="h-write" className="rv-letter-cta text-center">
        <Kicker className="justify-center">{t('th.riviera.home.writeKicker')}</Kicker>
        <h2 id="h-write" className="rv-display rv-it mt-4 text-[clamp(2.2rem,5vw,3.8rem)] leading-none">
          {t('th.riviera.home.writeTitle')}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-ink-2">{t('th.riviera.home.writeText')}</p>
        <div className="mt-8 flex flex-col items-center gap-4">
          <a href={waContactUrl(t.locale)} target="_blank" rel="noopener noreferrer" className="rv-btn rv-btn-primary">
            {t('cta.whatsapp')} · {CONTACTS.whatsapp}
          </a>
          <p className="text-sm text-ink-2">
            {t('th.riviera.home.orEmail')}{' '}
            <a className="rv-link" href={`mailto:${CONTACTS.email}`}>
              {CONTACTS.email}
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
