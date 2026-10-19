'use client';

import { FooterContacts, FooterLegal } from '@/components/neutral/Footer';
import { useT } from '@/lib/i18n';

export default function Footer() {
  const t = useT();
  return (
    <footer className="gp-footer mt-0 pb-24">
      <div aria-hidden className="gp-checker" />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-line pb-8">
          <div>
            <p className="gp-kicker gp-kicker-cream">{t('th.grand-prix.footer.kicker')}</p>
            <p className="gp-display mt-2 text-5xl leading-[0.9] sm:text-7xl">{t('brand.name')}</p>
          </div>
          <p className="max-w-xs text-sm text-ink-2">{t('th.grand-prix.footer.lead')}</p>
        </div>
        <FooterContacts className="mt-8" />
        <FooterLegal className="mt-10" />
      </div>
    </footer>
  );
}
