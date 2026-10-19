'use client';

import Link from 'next/link';
import { CONTACTS } from '@/lib/data';
import { waContactUrl } from '@/lib/whatsapp';
import { useT } from '@/lib/i18n';
import { useStyleHref } from '@/components/ThemeProvider';

export function FooterContacts({ className = '' }: { className?: string }) {
  const t = useT();
  return (
    <dl className={`grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
      <div>
        <dt className="label-caps text-ink-2">{t('contacts.whatsapp')} · {t('contacts.phone')}</dt>
        <dd><a className="hover:text-accent" href={waContactUrl(t.locale)} target="_blank" rel="noopener noreferrer">{CONTACTS.whatsapp}</a></dd>
      </div>
      <div>
        <dt className="label-caps text-ink-2">{t('contacts.email')}</dt>
        <dd><a className="hover:text-accent" href={`mailto:${CONTACTS.email}`}>{CONTACTS.email}</a></dd>
      </div>
      <div>
        <dt className="label-caps text-ink-2">{t('contacts.address')}</dt>
        <dd>{CONTACTS.address}</dd>
      </div>
      <div>
        <dt className="label-caps text-ink-2">{t('contacts.social')}</dt>
        <dd>{CONTACTS.social} · {CONTACTS.socialNetworks.join(' / ')}</dd>
      </div>
    </dl>
  );
}

/** Legal line + design-demo disclaimer (required on every footer). */
export function FooterLegal({ className = '', trademarks = false }: { className?: string; trademarks?: boolean }) {
  const t = useT();
  const href = useStyleHref();
  return (
    <div className={`flex flex-col gap-2 text-xs text-ink-2 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <p>
        © {CONTACTS.company} · {CONTACTS.vat} · {t('brand.claim')}
      </p>
      <p className="flex flex-wrap items-center gap-3">
        <span className="font-medium text-ink">{t('footer.disclaimer')}</span>
        <Link href={href('/admin/')} className="underline-offset-4 hover:underline">{t('nav.admin')}</Link>
      </p>
      {trademarks && <p className="sm:basis-full">{t('footer.trademarks')}</p>}
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line pb-24">
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6">
        <FooterContacts />
        <FooterLegal />
      </div>
    </footer>
  );
}
