'use client';

// Demo rate panel — same for every style, only recoloured by the tokens.
// Overrides persist in localStorage (useRates) and feed lib/pricing.

import { FLEET, carName, type Zone } from '@/lib/data';
import { useT } from '@/lib/i18n';
import { DEFAULT_RATES, EXTRA_PER_DAY, REAL_ANCHORS, type RateTable } from '@/lib/pricing';
import { useRates, useRateTable } from '@/lib/store';

function NumField({ label, value, def, onChange, hint }: { label: string; value: number; def: number; onChange: (v: number) => void; hint?: string }) {
  const id = `f-${label.replace(/\W+/g, '-')}`;
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line py-2.5">
      <label htmlFor={id} className="min-w-0 text-sm">
        {label}
        {hint && <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-accent">{hint}</span>}
      </label>
      <span className="flex items-center gap-2">
        {value !== def && <span className="font-mono text-[10px] text-ink-2 line-through">€{def}</span>}
        <span className="text-ink-2">€</span>
        <input
          id={id}
          type="number"
          min={0}
          step={10}
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          className="w-24 rounded-theme border border-line bg-surface px-2 py-1 text-right tabular-nums"
        />
      </span>
    </div>
  );
}

export default function AdminPage() {
  const t = useT();
  const rates = useRateTable();
  const r = useRates();
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl">{t('admin.title')}</h1>
      <p className="mt-2 max-w-2xl text-ink-2">{t('admin.lead')}</p>
      <p className="mt-1 text-sm text-ink-2">{t('price.disclaimer')}</p>
      <button type="button" onClick={r.resetRates} className="mt-6 rounded-theme border border-line px-4 py-2 text-sm hover:border-accent">
        {t('admin.reset')}
      </button>
      <div className="mt-10 grid gap-12 md:grid-cols-2">
        <section>
          <h2 className="label-caps mb-3 text-ink-2">{t('admin.daily')} ({t('admin.perDay')})</h2>
          {FLEET.map((c) => (
            <NumField key={c.id} label={carName(c)} value={rates.daily[c.id]} def={DEFAULT_RATES.daily[c.id]} onChange={(v) => r.setDaily(c.id, v)} hint={REAL_ANCHORS[c.id] ? t('admin.anchor') : t('price.demo')} />
          ))}
        </section>
        <div className="space-y-12">
          <section>
            <h2 className="label-caps mb-3 text-ink-2">{t('admin.zones')}</h2>
            {(Object.keys(DEFAULT_RATES.zone) as Zone[]).map((z) => (
              <NumField key={z} label={z} value={rates.zone[z]} def={DEFAULT_RATES.zone[z]} onChange={(v) => r.setZone(z, v)} />
            ))}
          </section>
          <section>
            <h2 className="label-caps mb-3 text-ink-2">{t('admin.places')}</h2>
            {(Object.keys(DEFAULT_RATES.place) as (keyof RateTable['place'])[]).map((p) => (
              <NumField key={p} label={t(`deliveryTypes.${p}`)} value={rates.place[p]} def={DEFAULT_RATES.place[p]} onChange={(v) => r.setPlace(p, v)} />
            ))}
          </section>
          <section>
            <h2 className="label-caps mb-3 text-ink-2">{t('admin.extras')}</h2>
            {(Object.keys(DEFAULT_RATES.extras) as (keyof RateTable['extras'])[]).map((x) => (
              <NumField
                key={x}
                label={`${t(`services.${x}.name`)} · ${EXTRA_PER_DAY[x] ? t('admin.perDay') : t('admin.flat')}`}
                value={rates.extras[x] ?? 0}
                def={DEFAULT_RATES.extras[x] ?? 0}
                onChange={(v) => r.setExtra(x, v)}
              />
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
