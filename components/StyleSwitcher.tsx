'use client';

// Fixed pill (bottom-right) on every page: 5 styles + IT/EN.
// Switching style keeps the route and the query (/nocturne/configura/?step=2
// → /riserva/configura/?step=2). Builder state lives in the store, so it survives.

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useT } from '@/lib/i18n';
import { STYLE_IDS, THEME_META, isStyleId, type StyleId } from '@/lib/theme-tokens';
import { useUI } from '@/lib/store';

export function swapStyleInPath(pathname: string, search: string, to: StyleId): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length && isStyleId(parts[0])) parts[0] = to;
  else parts.unshift(to);
  const path = '/' + parts.join('/') + '/';
  return path + (search || '');
}

export default function StyleSwitcher() {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const { locale, setLocale } = useUI();
  const current = pathname.split('/').filter(Boolean)[0];
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onClick = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  const go = (id: StyleId) => {
    setOpen(false);
    router.push(swapStyleInPath(pathname, window.location.search, id), { scroll: false });
  };

  return (
    <div
      ref={ref}
      className="switcher no-print fixed right-4 z-[60] font-[system-ui,sans-serif] text-[13px]"
      style={{ colorScheme: 'light' }}
    >
      {open && (
        <div
          role="menu"
          aria-label={t('switcher.label')}
          className="mb-2 w-56 overflow-hidden rounded-2xl border border-black/10 bg-white/95 p-1.5 text-neutral-900 shadow-2xl backdrop-blur"
        >
          {STYLE_IDS.map((id, i) => (
            <button
              key={id}
              role="menuitemradio"
              aria-checked={current === id}
              onClick={() => go(id)}
              data-theme={id}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-neutral-100 focus-visible:bg-neutral-100"
              style={{ color: '#111' }}
            >
              <span
                aria-hidden
                className="h-5 w-5 shrink-0 rounded-full border border-black/10"
                style={{ background: `linear-gradient(135deg, var(--color-bg) 50%, var(--color-accent) 50%)` }}
              />
              <span className="flex-1">
                <span className="text-[10px] text-neutral-500">0{i + 1}</span> {THEME_META[id].name}
              </span>
              {current === id && <span aria-hidden>●</span>}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-1 rounded-full border border-black/10 bg-white/95 p-1 text-neutral-900 shadow-xl backdrop-blur">
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 rounded-full px-3 py-1.5 hover:bg-neutral-100"
        >
          <span aria-hidden className="flex -space-x-1">
            {STYLE_IDS.map((id) => (
              <span key={id} data-theme={id} className="h-3 w-3 rounded-full border border-white" style={{ background: 'var(--color-accent)' }} />
            ))}
          </span>
          <span>{isStyleId(current ?? '') ? THEME_META[current as StyleId].name : t('switcher.open')}</span>
        </button>
        <div role="group" aria-label={t('switcher.lang')} className="flex rounded-full bg-neutral-100 p-0.5">
          {(['it', 'en'] as const).map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={locale === l}
              onClick={() => setLocale(l)}
              className={`rounded-full px-2.5 py-1 uppercase ${locale === l ? 'bg-neutral-900 text-white' : 'text-neutral-600'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
