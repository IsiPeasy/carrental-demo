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
    { href: href('/collezione/'), label: t('nav.fleet') },
    { href: href('/configura/'), label: t('nav.builder') },
  ];
  return (
    <header className="gp-header sticky top-0 z-40">
      <a href="#main" className="sr-only-focusable absolute left-2 top-2 z-50 bg-ink px-3 py-2 text-bg">
        {t('nav.skip')}
      </a>
      <div aria-hidden className="gp-header-tape" />
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <Link href={href('/')} className="gp-logo">
          <span aria-hidden className="gp-logo-plate">
            {t('brand.monogram')}
          </span>
          <span className="gp-logo-word">{t('brand.name')}</span>
        </Link>
        <nav aria-label={t('nav.menu')} className="flex items-center">
          {links.map((l) => {
            const active = l.href === href('/') ? path === l.href : path.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href} aria-current={active ? 'page' : undefined} className="gp-navlink">
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
