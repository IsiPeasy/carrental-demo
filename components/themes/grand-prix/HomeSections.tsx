'use client';

import Link from 'next/link';
import { useStyleHref, useTheme } from '@/components/ThemeProvider';
import { CONTACTS, DELIVERIES, FAQ, PLACEHOLDER, STATS, TESTIMONIALS, carById, carName, cityById } from '@/lib/data';
import { useInView } from '@/lib/hooks';
import { useLocale, useT } from '@/lib/i18n';
import { waContactUrl } from '@/lib/whatsapp';
import { Kicker, RaceNumber, SplitFlap, StepCounter, Stripes } from './parts';

const ROWS = 8;

function DeparturesBoard() {
  const t = useT();
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.25 });
  const statuses = t.dict.th['grand-prix'].board.status;
  const rows = DELIVERIES.slice(0, ROWS).map((d, i) => {
    const city = cityById(d.cityId)!;
    const car = carById(d.carId)!;
    return { key: d.slot, city: t.l(city.name), code: city.code, car: car.model, status: statuses[i % statuses.length] };
  });
  const cols = t.dict.th['grand-prix'].board.cols;
  return (
    <section aria-labelledby="gp-board-title" className="gp-board-section relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Kicker tone="cream">{t('th.grand-prix.board.kicker')}</Kicker>
            <h2 id="gp-board-title" className="gp-display mt-2 text-6xl leading-[0.9] text-[#EFE7D6] sm:text-8xl">
              {t('th.grand-prix.board.title')}
            </h2>
          </div>
          <p className="max-w-sm font-mono text-xs leading-relaxed text-[#CFC8B8]">{t('th.grand-prix.board.note')}</p>
        </div>

        <div ref={ref} role="table" aria-label={t('th.grand-prix.board.title')} className="gp-board mt-10">
          <div role="rowgroup">
            <div role="row" className="gp-board-row gp-board-head">
              <span role="columnheader" className="gp-bc-city">{cols.city}</span>
              <span role="columnheader" className="gp-bc-code">{cols.code}</span>
              <span role="columnheader" className="gp-bc-car">{cols.car}</span>
              <span role="columnheader" className="gp-bc-status">{cols.status}</span>
            </div>
          </div>
          <div role="rowgroup">
            {rows.map((r, i) => (
              <div role="row" key={r.key} className={`gp-board-row ${i >= 6 ? "max-md:hidden" : ""}`}>
                <span role="cell" className="gp-bc-city">
                  <SplitFlap text={r.city} width={17} play={inView} delay={i * 140} />
                </span>
                <span role="cell" className="gp-bc-code">
                  <SplitFlap text={r.code} width={3} play={inView} delay={i * 140 + 200} seed={1} />
                </span>
                <span role="cell" className="gp-bc-car">
                  <SplitFlap text={r.car} width={20} play={inView} delay={i * 140 + 120} seed={2} className="hidden md:inline-flex" />
                  <span className="font-mono text-xs uppercase tracking-wider text-[#CFC8B8] md:hidden">{r.car}</span>
                </span>
                <span role="cell" className="gp-bc-status" data-status={i % statuses.length}>
                  <SplitFlap text={r.status} width={11} play={inView} delay={i * 140 + 320} seed={3} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepsLaps() {
  const t = useT();
  return (
    <section aria-labelledby="gp-steps" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
      <h2 id="gp-steps" className="gp-display text-5xl leading-[0.9] sm:text-7xl">{t('claims.steps')}</h2>
      <ol className="mt-10 grid gap-0 border-2 border-line sm:grid-cols-3">
        {t.dict.steps3.map((s, i) => (
          <li key={s.title} className="gp-lap relative border-line p-6 sm:border-r-2 sm:last:border-r-0 [&:not(:last-child)]:border-b-2 sm:[&:not(:last-child)]:border-b-0">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-ink-2">{t('th.grand-prix.lap', { n: i + 1 })}</p>
            <p aria-hidden className="gp-display gp-lap-num">{i + 1}</p>
            <h3 className="gp-display mt-2 text-3xl">{s.title}</h3>
            <p className="mt-2 text-sm font-medium text-ink-2">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function RulesAndStats() {
  const t = useT();
  const [ref, inView] = useInView<HTMLDListElement>({ threshold: 0.3 });
  return (
    <section aria-labelledby="gp-rules" className="gp-rules border-y-2 border-line bg-surface">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:py-20">
        <div>
          <Kicker tone="red">{t('th.grand-prix.rules.kicker')}</Kicker>
          <h2 id="gp-rules" className="gp-display mt-2 text-5xl leading-[0.9] sm:text-6xl">{t('guarantees.title')}</h2>
          <ul className="mt-8 grid gap-0 sm:grid-cols-2">
            {t.dict.guarantees.items.map((g, i) => (
              <li key={g.id} className="border-t-2 border-line py-4 pr-4">
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-accent-2">{t('th.grand-prix.rules.article', { n: i + 1 })}</p>
                <h3 className="mt-1 text-lg font-extrabold uppercase tracking-tight">{g.title}</h3>
                <p className="text-sm text-ink-2">{g.text}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <Kicker tone="ink">{t('th.grand-prix.stats.kicker')}</Kicker>
          <dl ref={ref} className="gp-stats mt-4">
            {STATS.map((s) => (
              <div key={s.id} className="gp-stat">
                <dt className="font-mono text-xs font-bold uppercase tracking-widest text-ink-2">{t(`stats.${s.id}`)}</dt>
                <dd className="gp-display gp-stat-val">
                  {s.value == null ? PLACEHOLDER : <StepCounter value={s.value} play={inView} from={s.id === 'since' ? s.value - 12 : 0} steps={12} />}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function RedBand() {
  const t = useT();
  const href = useStyleHref();
  return (
    <section aria-labelledby="gp-band" className="gp-band relative overflow-hidden">
      <Stripes className="gp-band-stripes" />
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:py-20">
        <div className="max-w-3xl">
          <p className="gp-kicker gp-kicker-white">{t('th.grand-prix.band.kicker')}</p>
          <h2 id="gp-band" className="gp-display mt-2 text-5xl leading-[0.9] text-white sm:text-7xl">{t('th.grand-prix.band.title')}</h2>
          <p className="mt-4 max-w-xl text-base font-semibold text-white">{t('th.grand-prix.band.text')}</p>
        </div>
        <Link href={href('/configura/?step=0')} className="gp-btn gp-btn-ink gp-btn-xl self-start lg:self-auto">
          {t('th.grand-prix.band.cta')} <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}

function Voices() {
  const t = useT();
  return (
    <section aria-labelledby="gp-voices" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
      <Kicker tone="red">{t('th.grand-prix.voices.kicker')}</Kicker>
      <h2 id="gp-voices" className="gp-display mt-2 text-5xl leading-[0.9] sm:text-6xl">{t('testimonials.title')}</h2>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((q, i) => {
          const car = carById(q.carId)!;
          return (
            <figure key={q.name} className="gp-voice relative flex flex-col border-2 border-line bg-surface p-6">
              <RaceNumber n={i + 1} className="gp-voice-num" />
              <blockquote className="mt-6 flex-1 text-lg font-semibold leading-snug">“{t.l(q.quote)}”</blockquote>
              <figcaption className="mt-6 border-t-2 border-line pt-3">
                <span className="gp-display block text-2xl">{q.name}</span>
                <span className="block font-mono text-xs uppercase tracking-wider text-ink-2">
                  {t.l(q.role)} · {t.l(cityById(q.cityId)!.name)} · {carName(car)}
                </span>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}

function Briefing() {
  const t = useT();
  return (
    <section aria-labelledby="gp-faq" className="border-t-2 border-line">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_2fr] lg:py-24">
        <div>
          <Kicker tone="red">{t('th.grand-prix.faq.kicker')}</Kicker>
          <h2 id="gp-faq" className="gp-display mt-2 text-5xl leading-[0.9] sm:text-6xl">{t('faq.title')}</h2>
        </div>
        <div className="border-t-2 border-line">
          {FAQ.map((f, i) => (
            <details key={f.q.it} className="gp-faq group border-b-2 border-line">
              <summary className="flex cursor-pointer list-none items-start gap-4 py-4">
                <span className="gp-faq-q font-mono text-sm font-bold">{t('th.grand-prix.faq.q', { n: String(i + 1).padStart(2, '0') })}</span>
                <span className="flex-1 text-lg font-bold leading-snug">{t.l(f.q)}</span>
                <span aria-hidden className="gp-faq-plus">+</span>
              </summary>
              <p className="pb-5 pl-12 pr-8 text-ink-2">{t.l(f.a)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function RadioBox() {
  const t = useT();
  const locale = useLocale();
  return (
    <section aria-labelledby="gp-radio" className="gp-radio relative overflow-hidden border-t-2 border-line bg-accent-2">
      <div className="relative z-10 mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:py-20">
        <div>
          <p className="gp-kicker gp-kicker-white">{t('th.grand-prix.radio.kicker')}</p>
          <h2 id="gp-radio" className="gp-display mt-2 text-6xl leading-[0.9] text-white sm:text-8xl">{t('th.grand-prix.radio.title')}</h2>
          <p className="mt-4 max-w-md text-base font-semibold text-white">{t('th.grand-prix.radio.lead')}</p>
        </div>
        <div className="flex flex-col gap-3">
          <a href={waContactUrl(locale)} target="_blank" rel="noopener noreferrer" className="gp-radio-line">
            <span className="font-mono text-xs font-bold uppercase tracking-widest">{t('contacts.whatsapp')}</span>
            <span className="gp-display text-3xl sm:text-4xl">{CONTACTS.whatsapp}</span>
          </a>
          <a href={`mailto:${CONTACTS.email}`} className="gp-radio-line">
            <span className="font-mono text-xs font-bold uppercase tracking-widest">{t('contacts.email')}</span>
            <span className="gp-display text-3xl normal-case sm:text-4xl">{CONTACTS.email}</span>
          </a>
          <p className="font-mono text-xs uppercase tracking-wider text-white">
            {CONTACTS.address} · {CONTACTS.social}
          </p>
        </div>
      </div>
    </section>
  );
}

export default function HomeSections() {
  const { FleetSection } = useTheme().components;
  return (
    <div>
      <StepsLaps />
      <DeparturesBoard />
      <FleetSection variant="home" />
      <RedBand />
      <RulesAndStats />
      <Voices />
      <Briefing />
      <RadioBox />
    </div>
  );
}
