'use client';

import Link from 'next/link';
import CarSilhouette from '@/components/CarSilhouette';
import { useStyleHref } from '@/components/ThemeProvider';
import { FLEET } from '@/lib/data';
import { useT } from '@/lib/i18n';

export default function Hero() {
  const t = useT();
  const href = useStyleHref();
  const car = FLEET[1];
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
      <div>
        <p className="label-caps text-accent">{t('brand.claim')}</p>
        <h1 className="mt-4 font-display text-4xl leading-tight sm:text-6xl">{t('claims.main')}</h1>
        <p className="mt-4 max-w-md text-ink-2">{t('claims.concierge')}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={href('/configura/')} className="rounded-theme bg-accent px-5 py-3 text-on-accent">{t('cta.request')}</Link>
          <Link href={href('/flotta/')} className="rounded-theme border border-line px-5 py-3">{t('cta.fleet')}</Link>
        </div>
      </div>
      <CarSilhouette bodyType={car.bodyType} color={car.color.hex} className="w-full" />
    </section>
  );
}
