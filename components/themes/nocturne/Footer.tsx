'use client';

import { FooterContacts, FooterLegal } from '@/components/neutral/Footer';
import { useT } from '@/lib/i18n';
import { Label } from './ui';

export default function Footer() {
  const t = useT();
  return (
    <footer className="nc-footer border-t border-line pb-28">
      <div className="mx-auto max-w-[1440px] px-4 pt-20 sm:px-8">
        <div className="flex flex-col items-center text-center">
          <span aria-hidden className="nc-monogram">{t('brand.monogram')}</span>
          <p className="mt-6 font-display text-2xl italic sm:text-3xl">{t('th.nocturne.footer.line')}</p>
          <Label className="mt-3 text-ink-2">{t('brand.claim')}</Label>
        </div>
        <FooterContacts className="nc-footer-contacts mt-16 border-t border-line pt-10" />
        <FooterLegal className="mt-12 border-t border-line pt-6" />
      </div>
    </footer>
  );
}
