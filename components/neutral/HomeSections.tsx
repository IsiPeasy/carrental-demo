'use client';

import Photo from '@/components/Photo';
import { useTheme } from '@/components/ThemeProvider';
import { CLIENTELE, DELIVERIES, FAQ, PLACEHOLDER, STATS, TESTIMONIALS, carById, carName, cityById } from '@/lib/data';
import { useT } from '@/lib/i18n';

export default function HomeSections() {
  const t = useT();
  const { FleetSection } = useTheme().components;
  return (
    <div className="mx-auto max-w-7xl space-y-24 px-4 sm:px-6">
      <section aria-labelledby="h-steps">
        <h2 id="h-steps" className="font-display text-3xl">{t('claims.steps')}</h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-3">
          {t.dict.steps3.map((s, i) => (
            <li key={s.title} className="rounded-theme border border-line p-5">
              <span className="font-mono text-sm text-accent">0{i + 1}</span>
              <h3 className="mt-2 font-display text-xl">{s.title}</h3>
              <p className="mt-1 text-sm text-ink-2">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-label={t('guarantees.title')}>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.dict.guarantees.items.map((g) => (
            <li key={g.id} className="border-t border-line pt-4">
              <h3 className="font-medium">{g.title}</h3>
              <p className="text-sm text-ink-2">{g.text}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-5">
          {STATS.map((s) => (
            <div key={s.id}>
              <dt className="text-xs text-ink-2">{t(`stats.${s.id}`)}</dt>
              <dd className="font-display text-3xl">{s.value ?? PLACEHOLDER}</dd>
            </div>
          ))}
        </dl>
      </section>

      <FleetSection variant="home" />

      <section aria-labelledby="h-deliveries">
        <h2 id="h-deliveries" className="font-display text-3xl">{t('deliveries.title')}</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {DELIVERIES.slice(0, 8).map((d) => (
            <Photo key={d.slot} slot={d.slot} ratio="4/5" />
          ))}
        </div>
      </section>

      <section aria-labelledby="h-test">
        <h2 id="h-test" className="font-display text-3xl">{t('testimonials.title')}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((q) => (
            <blockquote key={q.name} className="rounded-theme border border-line p-5">
              <p>“{t.l(q.quote)}”</p>
              <footer className="mt-3 text-sm text-ink-2">
                {q.name} · {t.l(q.role)} · {t.l(cityById(q.cityId)!.name)} · {carName(carById(q.carId)!)}
              </footer>
            </blockquote>
          ))}
        </div>
        <p className="mt-6 text-sm text-ink-2">
          {t('clientele.title')}: {CLIENTELE.map((c) => t.l(c)).join(' · ')}
        </p>
      </section>

      <section aria-labelledby="h-faq">
        <h2 id="h-faq" className="font-display text-3xl">{t('faq.title')}</h2>
        <div className="mt-6 divide-y divide-line border-y border-line">
          {FAQ.map((f) => (
            <details key={f.q.it} className="group py-4">
              <summary className="cursor-pointer list-none font-medium">{t.l(f.q)}</summary>
              <p className="mt-2 text-sm text-ink-2">{t.l(f.a)}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
