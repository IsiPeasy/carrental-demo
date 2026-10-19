'use client';

import type { ReactNode } from 'react';
import { useTheme } from './ThemeProvider';

/** Header + main + Footer from the active theme's registry entry. */
export default function ThemeChrome({ children }: { children: ReactNode }) {
  const { Header, Footer } = useTheme().components;
  return (
    <>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
