'use client';

import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { getTheme, type StyleId, type Theme } from '@/lib/themes';

const ThemeCtx = createContext<StyleId>('nocturne');

/** Sets data-theme on <html> (and on its own wrapper, so SSR output is themed). */
export default function ThemeProvider({ style, children }: { style: StyleId; children: ReactNode }) {
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.theme = style;
    return () => {
      delete html.dataset.theme;
    };
  }, [style]);
  return (
    <ThemeCtx.Provider value={style}>
      <div data-theme={style} className="min-h-dvh bg-bg font-body text-ink">
        {children}
      </div>
    </ThemeCtx.Provider>
  );
}

export function useStyleId(): StyleId {
  return useContext(ThemeCtx);
}

export function useTheme(): Theme {
  return getTheme(useContext(ThemeCtx));
}

/** Build a path inside the current style: href('/collezione/') → '/riserva/collezione/'. */
export function useStyleHref() {
  const style = useContext(ThemeCtx);
  return (path = '/') => `/${style}${path.startsWith('/') ? path : '/' + path}`;
}
