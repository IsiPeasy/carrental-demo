'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FooterContacts, FooterLegal } from '@/components/neutral/Footer';
import { useStyleHref } from '@/components/ThemeProvider';
import { CONTACTS } from '@/lib/data';
import { useT } from '@/lib/i18n';
import { Ornament } from './shared';

export function Header() {
  const t = useT();
  const href = useStyleHref();
  const path = usePathname();
  const links = [
    { href: href('/'), label: t('nav.home') },
    { href: href('/flotta/'), label: t('nav.fleet') },
    { href: href('/configura/'), label: t('nav.builder') },
  ];
  return (
    <header className="rv-header no-print sticky top-0 z-40">
      <a href="#main" className="sr-only-focusable absolute left-2 top-2 z-50 bg-accent px-3 py-2 text-surface">
        {t('nav.skip')}
      </a>
      <div className="hidden border-b border-line sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-1.5 text-[0.7rem] uppercase tracking-[0.22em] text-ink-2">
          <span>{t('brand.claim')}</span>
          <a href={`https://wa.me/${CONTACTS.whatsappDigits}`} className="hover:text-accent" target="_blank" rel="noopener noreferrer">
            {t('th.riviera.header.write')} · {CONTACTS.whatsapp}
          </a>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Link href={href('/')} className="rv-logo" aria-label={t('brand.name')}>
          <span className="rv-display rv-it">{t('brand.name')}</span>
        </Link>
        <nav aria-label={t('nav.menu')} className="flex items-center gap-0.5 sm:gap-6">
          {links.map((l) => {
            const active = l.href === href('/') ? path === l.href : path.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href} aria-current={active ? 'page' : undefined} className="rv-nav-link">
                {l.label}
              </Link>
            );
          })}
          <Link href={href('/configura/')} className="rv-btn rv-btn-primary rv-btn-sm ml-3 hidden lg:inline-flex">
            {t('cta.request')}
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  const t = useT();
  return (
    <footer className="rv-footer no-print mt-28 pb-28">
      <div className="mx-auto max-w-7xl px-4 pt-16 sm:px-6">
        <div className="grid gap-10 border-b border-line pb-12 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="rv-display rv-it text-[clamp(2rem,5vw,3.6rem)] leading-[1.02]">{t('claims.concierge')}</p>
            <p className="mt-4 max-w-md text-ink-2">{t('claims.marina')}</p>
          </div>
          <Ornament className="hidden w-40 text-accent-2 lg:block" />
        </div>
        <FooterContacts className="py-10" />
        <FooterLegal className="border-t border-line pt-6" />
      </div>
    </footer>
  );
}
