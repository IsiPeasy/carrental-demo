'use client';

import { useEffect, type ReactNode } from 'react';
import { rehydrateAll, useUI } from '@/lib/store';

/** Rehydrates persisted stores after mount and keeps <html lang> in sync. */
export default function Providers({ children }: { children: ReactNode }) {
  const locale = useUI((s) => s.locale);
  useEffect(() => {
    void rehydrateAll();
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return <>{children}</>;
}
