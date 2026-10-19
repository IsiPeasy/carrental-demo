'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStyleHref } from '@/components/ThemeProvider';
import { useT } from '@/lib/i18n';

export default function Header() {
  const t = useT();
  const href = useStyleHref();
  const path = usePathname();
  const links = [
    { href: href('/'), label: t('nav.home') },
    { href: href('/flotta/'), label: t('nav.fleet') },
    { href: href('/configura/'), label: t('nav.builder') },
  ];
  return (
    <header className="nc-header sticky top-0 z-40">
      <a href="#main" className="sr-only-focusable absolute left-2 top-2 z-50 bg-accent px-3 py-2 text-bg">
        {t('nav.skip')}
      </a>
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-8">
        <Link href={href('/')} className="nc-wordmark group flex items-center gap-3" aria-label={t('brand.name')}>
          <span aria-hidden className="nc-mono-badge">{t('brand.monogram')}</span>
          <span className="hidden font-display text-lg tracking-[0.18em] uppercase xs:inline">{t('brand.name')}</span>
        </Link>
        <nav aria-label={t('nav.menu')} className="flex items-center gap-4 sm:gap-8">
          {links.map((l) => {
            const active = l.href === href('/') ? path === l.href : path.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? 'page' : undefined}
                className={`nc-navlink nc-label ${active ? 'is-active' : ''}`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
