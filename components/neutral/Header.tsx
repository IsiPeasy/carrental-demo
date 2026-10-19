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
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <a href="#main" className="sr-only-focusable absolute left-2 top-2 z-50 bg-accent px-3 py-2 text-on-accent">
        {t('nav.skip')}
      </a>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href={href('/')} className="font-display text-lg tracking-wide">
          {t('brand.name')}
        </Link>
        <nav aria-label={t('nav.menu')} className="flex items-center gap-1 text-sm sm:gap-4">
          {links.map((l) => {
            const active = l.href === href('/') ? path === l.href : path.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? 'page' : undefined}
                className={`rounded-theme px-2 py-1 transition-colors ${active ? 'text-accent' : 'text-ink-2 hover:text-ink'}`}
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
