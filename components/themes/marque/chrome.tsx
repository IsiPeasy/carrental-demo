'use client';

// Marque — Header, Footer, landing Door.

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type CSSProperties } from 'react';
import CarSilhouette from '@/components/CarSilhouette';
import { useStyleHref } from '@/components/ThemeProvider';
import { FooterContacts, FooterLegal } from '@/components/neutral/Footer';
import { brandsInFleet } from '@/lib/data';
import { useT } from '@/lib/i18n';
import { usePrefersReducedMotion } from '@/lib/hooks';
import type { DoorProps } from '@/lib/themes';
import BrandMark, { BrandScope, brandStyle, flagshipOf } from './brand';

export function Header() {
  const t = useT();
  const href = useStyleHref();
  const path = usePathname();
  const links = [
    { href: href('/#marche'), label: t('th.marque.nav.brands'), match: '#', cls: 'hidden xs:inline-flex' },
    { href: href('/flotta/'), label: t('nav.fleet'), match: href('/flotta/'), cls: 'inline-flex' },
  ];
  const inBuilder = path.startsWith(href('/configura/'));
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/95 backdrop-blur">
      <a href="#main" className="sr-only-focusable absolute left-2 top-2 z-50 bg-ink px-3 py-2 text-bg">
        {t('nav.skip')}
      </a>
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-8">
        <Link href={href('/')} className="flex min-w-0 items-baseline gap-3" aria-label={`${t('brand.name')} · ${t('nav.home')}`}>
          <span className="m-wordmark text-[1.05rem] sm:text-lg">{t('brand.name')}</span>
          <span className="m-kicker hidden truncate lg:inline">{t('brand.claim')}</span>
        </Link>
        <nav aria-label={t('nav.menu')} className="flex items-center gap-1 text-sm sm:gap-2">
          {links.map((l) => {
            const active = l.match !== '#' && path.startsWith(l.match);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? 'page' : undefined}
                className={`${l.cls} items-center px-2.5 py-2 font-medium transition-colors ${active ? 'text-ink underline decoration-2 underline-offset-[10px]' : 'text-ink-2 hover:text-ink'}`}
              >
                {l.label}
              </Link>
            );
          })}
          <Link
            href={href('/configura/')}
            aria-current={inBuilder ? 'page' : undefined}
            className="ml-1 inline-flex min-h-10 items-center rounded-theme bg-ink px-4 text-sm font-semibold text-bg transition-opacity hover:opacity-85"
          >
            {t('th.marque.nav.cta')}
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  const t = useT();
  const href = useStyleHref();
  const brands = brandsInFleet();
  return (
    <footer className="mt-24 border-t border-line bg-surface pb-24">
      <div className="mx-auto max-w-[1440px] space-y-12 px-4 py-14 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="m-wordmark text-3xl sm:text-4xl">{t('brand.name')}</p>
            <p className="m-kicker mt-3">{t('brand.claim')}</p>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-3" aria-label={t('th.marque.marquee.title')}>
            {brands.map((b) => (
              <li key={b.slug}>
                <Link href={href(`/#marca-${b.slug}`)} className="text-ink-2 transition-colors hover:text-ink">
                  <BrandMark slug={b.slug} className="text-sm" style={{ '--m-h': '1.1rem' } as CSSProperties} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <FooterContacts className="border-t border-line pt-10" />
        <FooterLegal trademarks className="border-t border-line pt-6 sm:flex-wrap sm:gap-x-8" />
      </div>
    </footer>
  );
}

/** Landing mini hero: marques cycle, accent + flagship silhouette follow. No 3D. */
export function Door({ active }: DoorProps) {
  const t = useT();
  const brands = brandsInFleet();
  const reduced = usePrefersReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % brands.length), active ? 1800 : 2600);
    return () => window.clearInterval(id);
  }, [reduced, active, brands.length]);
  const b = brands[i];
  const car = flagshipOf(b.slug);
  return (
    <BrandScope brand={b.slug} className="relative h-full w-full overflow-hidden bg-bg" aria-hidden>
      <span className="m-acc-bg absolute inset-x-0 top-0 h-1.5" />
      <div className="flex items-center justify-between px-6 pt-6">
        <span className="m-kicker">{t('th.marque.door.brands', { n: brands.length })}</span>
        <span className="m-kicker tabular-nums">
          {String(i + 1).padStart(2, '0')} / {String(brands.length).padStart(2, '0')}
        </span>
      </div>
      <div className="absolute inset-x-6 top-[16%]">
        <div className="relative h-24">
          {brands.map((x, n) => (
            <div
              key={x.slug}
              className="m-door-word absolute inset-x-0 top-0"
              style={{
                opacity: n === i ? 1 : 0,
                transform: n === i ? 'none' : 'translateY(14px)',
                color: n === i ? 'var(--m-ink)' : undefined,
                ['--m-max' as string]: '4.2rem',
              }}
            >
              <BrandMark slug={x.slug} fit />
            </div>
          ))}
        </div>
        <ul className="mt-2 flex gap-1.5">
          {brands.map((x, n) => (
            <li key={x.slug} className={`h-0.5 flex-1 m-tr ${n === i ? 'bg-accent' : 'bg-line'}`} />
          ))}
        </ul>
      </div>
      <div key={b.slug} className="m-enter m-floor absolute inset-x-[8%] top-[38%]">
        <CarSilhouette bodyType={car.bodyType} color={brandStyle(b.slug).accent} accent="#C9C9C9" className="w-full" />
      </div>
    </BrandScope>
  );
}
