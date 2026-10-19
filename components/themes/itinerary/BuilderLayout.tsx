'use client';

// Signature builder: a concierge chat. Answered steps stay in the log as
// concise bubbles (with "edit" → nav.go(i)); the current question is the last
// concierge bubble and the step component (children) is the inline composer.
// On the right an itinerary card composes live. Same 5 steps, same ?step=.

import { useEffect, useRef, useState } from 'react';
import { useMoney, useSwitcherOffset } from '@/components/builder/kit';
import { carById, carName, cityById } from '@/lib/data';
import { usePrefersReducedMotion } from '@/lib/hooks';
import { useT } from '@/lib/i18n';
import { rentalDays } from '@/lib/pricing';
import { LAST_STEP, useBuilder, useBuilderHydrated, useEstimate } from '@/lib/store';
import type { BuilderLayoutProps, BuilderNav } from '@/lib/themes';
import { formatDate } from '@/lib/whatsapp';
import ItineraryCard from './ItineraryCard';
import { Arrow, Monogram } from './ui';

/** Concise answer per step (0..3) for the chat history. */
export function useAnswers(): string[] {
  const t = useT();
  const s = useBuilder();
  const car = carById(s.carId);
  const city = cityById(s.cityId);
  const ret = cityById(s.returnCityId);
  const days = rentalDays(s.dateFrom, s.dateTo);
  return [
    car ? `${carName(car)} · ${t.l(car.color.name)}` : '—',
    city
      ? `${t.l(city.name)}${s.deliveryType ? ' · ' + t(`deliveryTypes.${s.deliveryType}`) : ''}${ret ? ` → ${t.l(ret.name)}` : ''}`
      : '—',
    s.dateFrom && s.dateTo
      ? `${formatDate(s.dateFrom, t.locale)} → ${formatDate(s.dateTo, t.locale)} · ${days === 1 ? t('builder.dates.day') : t('builder.dates.days', { n: days })}`
      : '—',
    s.extras.length ? s.extras.map((x) => t(`services.${x}.name`)).join(', ') : t('th.itinerary.chat.noExtras'),
  ];
}

function Avatar() {
  return (
    <Monogram className="itin-avatar" />
  );
}

function Progress({ nav }: { nav: BuilderNav }) {
  const t = useT();
  return (
    <nav aria-label={t('builder.title')} className="min-w-0">
      <ol className="itin-progress no-scrollbar">
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
                className={`itin-progress-item ${i < nav.step ? 'is-done' : ''}`}
              >
                <span className="itin-progress-bar" aria-hidden />
                <span className="font-mono text-[10px] text-ink-2">0{i + 1}</span>
                <span className="truncate">{label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function ChatNav({ nav }: { nav: BuilderNav }) {
  const t = useT();
  const reset = () => {
    useBuilder.getState().reset();
    nav.go(0);
  };
  return (
    <div className="itin-chat-nav">
      <button type="button" onClick={nav.back} disabled={nav.step === 0} className="itin-btn itin-btn-ghost itin-btn-sm">
        ← {t('builder.back')}
      </button>
      {nav.step < LAST_STEP ? (
        <>
          {nav.reason && (
            <p id="itin-next-reason" className="itin-reason" role="status">
              {t(nav.reason)}
            </p>
          )}
          <button
            type="button"
            onClick={nav.next}
            disabled={!nav.canNext}
            aria-describedby={nav.reason ? 'itin-next-reason' : undefined}
            className="itin-btn itin-btn-primary itin-btn-sm ml-auto"
          >
            {t('builder.next')} <Arrow className="h-3.5 w-3.5" />
          </button>
        </>
      ) : (
        <button type="button" onClick={reset} className="itin-btn itin-btn-ghost itin-btn-sm ml-auto">
          {t('builder.reset')}
        </button>
      )}
    </div>
  );
}

export default function BuilderLayout({ nav, children }: BuilderLayoutProps) {
  const t = useT();
  const est = useEstimate();
  const money = useMoney();
  const answers = useAnswers();
  const hydrated = useBuilderHydrated();
  const reduced = usePrefersReducedMotion();
  const questions = t.dict.th.itinerary.chat.questions;
  const leads = [
    t('builder.car.lead'),
    t('builder.destination.lead'),
    t('builder.dates.pickRange'),
    t('builder.extras.lead'),
    t('builder.summary.lead'),
  ];
  const isSummary = nav.step === LAST_STEP;

  // focus the new question when the step changes (never on first load)
  const qRef = useRef<HTMLDivElement>(null);
  const prev = useRef<number | null>(null);
  useEffect(() => {
    if (!hydrated) return;
    if (prev.current === null) {
      prev.current = nav.step;
      return;
    }
    if (prev.current === nav.step) return;
    prev.current = nav.step;
    const el = qRef.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    el.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
  }, [nav.step, hydrated, reduced]);

  // mobile bottom bar: lift the style switcher by its measured height
  const barRef = useRef<HTMLDivElement>(null);
  const [barH, setBarH] = useState(96);
  const [sheet, setSheet] = useState(false);
  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBarH(Math.round(el.getBoundingClientRect().height) + 8));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useSwitcherOffset(barH);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-44 pt-6 sm:px-6 lg:pb-20 lg:pt-8">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-2">
            {t('builder.title')} · {t('builder.stepOf', { n: nav.step + 1, total: nav.total })}
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl">{t.dict.builder.steps[nav.step]}</h1>
        </div>
        <div className="lg:w-[34rem]">
          <Progress nav={nav} />
        </div>
      </div>

      <div className={`grid items-start gap-5 ${isSummary ? '' : 'lg:grid-cols-[minmax(0,1fr)_23rem]'}`}>
        <section className="itin-card itin-chat" aria-label={t('th.itinerary.chat.log')}>
          <header className="flex items-center gap-3 border-b border-line px-4 py-3 sm:px-5">
            <Avatar />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{t('th.itinerary.chat.concierge')} · {t('brand.name')}</p>
              <p className="flex items-center gap-1.5 font-mono text-[11px] text-ink-2">
                <span className="itin-live-dot" aria-hidden />
                {t('th.itinerary.online')}
              </p>
            </div>
          </header>

          <ol className="itin-thread" role="log" aria-live="polite" aria-relevant="additions text" aria-label={t('th.itinerary.chat.log')}>
            {answers.slice(0, nav.step).flatMap((a, i) => [
              <li key={`q-${i}`} className="itin-row">
                <Avatar />
                <p className="itin-bubble is-concierge is-past">{questions[i]}</p>
              </li>,
              <li key={`a-${i}`} className="itin-row is-user">
                <div className="itin-bubble is-user">
                  <span className="sr-only">{t('th.itinerary.chat.you')}: </span>
                  {a}
                </div>
                <button
                  type="button"
                  onClick={() => nav.go(i)}
                  className="itin-edit"
                  aria-label={t('th.itinerary.chat.editAria', { label: t.dict.builder.steps[i] })}
                >
                  {t('builder.edit')}
                </button>
              </li>,
            ])}
            <li key={`q-${nav.step}`} className="itin-row is-current">
              <Avatar />
              <div ref={qRef} tabIndex={-1} className="itin-bubble is-concierge is-new">
                <p className="font-medium">{questions[nav.step]}</p>
                <p className="mt-1 text-[13px] text-ink-2">{leads[nav.step]}</p>
              </div>
            </li>
          </ol>

          <div className="itin-composer" key={nav.step}>
            {children}
          </div>
          <ChatNav nav={nav} />
        </section>

        {!isSummary && (
          <aside className="hidden lg:sticky lg:top-20 lg:block">
            <ItineraryCard estimate={est} />
          </aside>
        )}
      </div>

      {/* mobile: the itinerary collapses into a sticky bottom bar */}
      <div ref={barRef} className="itin-mobilebar fixed inset-x-0 bottom-0 z-30 lg:hidden">
        {sheet && !isSummary && (
          <div id="itin-sheet" className="max-h-[62vh] overflow-auto border-b border-line p-3">
            <ItineraryCard estimate={est} />
          </div>
        )}
        <div className="flex items-center gap-3 px-4 pb-1 pt-3">
          {!isSummary && (
            <button
              type="button"
              aria-expanded={sheet}
              aria-controls="itin-sheet"
              onClick={() => setSheet((v) => !v)}
              className="itin-btn itin-btn-ghost itin-btn-sm"
            >
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M2 4l4-2 4 2 4-2v10l-4 2-4-2-4 2z M6 2v10 M10 4v10" />
              </svg>
              {sheet ? t('th.itinerary.card.hide') : t('th.itinerary.card.show')}
            </button>
          )}
          <div className="ml-auto text-right" aria-live="polite">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-2">{t('price.total')}</p>
            <p className="font-display text-lg font-semibold tabular-nums leading-tight">{money(est.total)}</p>
          </div>
          {!isSummary && (
            <button type="button" onClick={nav.next} disabled={!nav.canNext} className="itin-btn itin-btn-primary itin-btn-sm">
              {t('builder.next')} <Arrow className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <p className="px-4 pb-2.5 text-[10.5px] text-ink-2">{t('price.disclaimer')}</p>
      </div>
    </div>
  );
}
