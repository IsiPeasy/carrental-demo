'use client';

import { FooterContacts, FooterLegal } from '@/components/neutral/Footer';
import { useT } from '@/lib/i18n';
import { Monogram } from './ui';

export default function Footer() {
  const t = useT();
  return (
    <footer className="itin-footer mt-24 border-t border-line bg-surface pb-28">
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-center gap-3">
            <Monogram />
            <div>
              <p className="font-semibold tracking-tight">{t('brand.name')}</p>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-2">{t('brand.claim')}</p>
            </div>
          </div>
          <p className="flex items-center gap-2 font-mono text-[11px] text-ink-2">
            <span className="itin-live-dot" aria-hidden />
            {t('th.itinerary.online')}
          </p>
        </div>
        <FooterContacts className="itin-footer-contacts" />
        <FooterLegal className="border-t border-line pt-6" />
      </div>
    </footer>
  );
}
