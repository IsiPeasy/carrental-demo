import type { Metadata, Viewport } from 'next';
import Providers from '@/components/Providers';
import StyleSwitcher from '@/components/StyleSwitcher';
import { fontVariables } from '@/lib/fonts';
import { themeCSS } from '@/lib/theme-tokens';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rial Rent — demo · cinque stili',
  description: 'European Luxury Mobility Concierge — demo di design multi-tema.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0A0A0B' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={fontVariables} suppressHydrationWarning>
      <head>
        {/* no favicon: an explicit empty icon stops browsers reusing a cached
            icon from other projects served on the same localhost port */}
        <link rel="icon" href="data:," />
        {/* theme tokens generated from the registry (lib/theme-tokens.ts) */}
        <style dangerouslySetInnerHTML={{ __html: themeCSS() }} />
      </head>
      <body>
        <Providers>
          {children}
          <StyleSwitcher />
        </Providers>
      </body>
    </html>
  );
}
