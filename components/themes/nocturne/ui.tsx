'use client';

// Nocturne primitives: italic emphasis markup, labels, roman numerals,
// roving-focus radiogroups.

import { Fragment, type KeyboardEvent, type ReactNode } from 'react';

/** Renders `*word*` segments of a translated string in Bodoni italic. */
export function Emph({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('*') && p.endsWith('*') ? (
          <em key={i} className="nc-em">
            {p.slice(1, -1)}
          </em>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

/** Plain text of an Emph string (for aria-labels). */
export const plain = (s: string) => s.replace(/\*/g, '');

export function Label({ children, className = '', as: Tag = 'p' }: { children: ReactNode; className?: string; as?: 'p' | 'span' | 'h2' | 'h3' | 'dt' | 'legend' }) {
  return <Tag className={`nc-label ${className}`}>{children}</Tag>;
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV'];
export const roman = (n: number) => ROMAN[n - 1] ?? String(n);

/**
 * Arrow-key handler for a container of [role="radio"] buttons:
 * moves focus and selects (WAI-ARIA radiogroup pattern).
 */
export function radioKeyNav(e: KeyboardEvent<HTMLElement>) {
  const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
  const isHome = e.key === 'Home';
  const isEnd = e.key === 'End';
  if (!(e.key in keys) && !isHome && !isEnd) return;
  const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]:not([disabled])'));
  if (!items.length) return;
  const cur = items.indexOf(document.activeElement as HTMLElement);
  let next = isHome ? 0 : isEnd ? items.length - 1 : (cur + (keys[e.key] ?? 0) + items.length) % items.length;
  if (cur < 0 && !isHome && !isEnd) next = 0;
  e.preventDefault();
  items[next].focus();
  items[next].click();
}

/** tabIndex for a roving radio: the checked one (or the first when none is). */
export const rovingTab = (checked: boolean, index: number, anyChecked: boolean) =>
  checked || (!anyChecked && index === 0) ? 0 : -1;

export function Hairline({ className = '' }: { className?: string }) {
  return <span aria-hidden className={`nc-hairline ${className}`} />;
}
