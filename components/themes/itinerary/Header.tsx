'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStyleHref } from '@/components/ThemeProvider';
import { useT } from '@/lib/i18n';
import { Monogram } from './ui';

export default function Header() {
  const t = useT();
  const href = useStyleHref();
  const path = usePathname();
  const links = [
    { href: href('/'), label: t('nav.home') },
    { href: href('/collezione/'), label: t('nav.fleet') },
    { href: href('/configura/'), label: t('nav.builder') },
  ];
  return (
    <header className="itin-header sticky top-0 z-40">
      <a href="#main" className="sr-only-focusable absolute left-2 top-2 z-50 rounded-theme bg-ink px-3 py-2 text-bg">
        {t('nav.skip')}
      </a>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <Link href={href('/')} className="flex items-center gap-2.5" aria-label={t('brand.name')}>
          <Monogram />
          <span className="hidden flex-col leading-none sm:flex">
            <span className="text-[15px] font-semibold tracking-tight">{t('brand.name')}</span>
            <span className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-2">{t('th.itinerary.os')}</span>
          </span>
        </Link>
        <nav aria-label={t('nav.menu')} className="itin-seg">
          {links.map((l) => {
            const active = l.href === href('/') ? path === l.href : path.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href} aria-current={active ? 'page' : undefined} className="itin-seg-item">
                {l.label}
              </Link>
            );
          })}
        </nav>
        <p className="hidden items-center gap-2 font-mono text-[11px] text-ink-2 md:flex">
          <span className="itin-live-dot" aria-hidden />
          {t('th.itinerary.online')}
        </p>
      </div>
    </header>
  );
}
