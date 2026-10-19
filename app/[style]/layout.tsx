import { notFound } from 'next/navigation';
import ThemeProvider from '@/components/ThemeProvider';
import ThemeChrome from '@/components/ThemeChrome';
import { STYLE_IDS, isStyleId } from '@/lib/theme-tokens';

export const dynamicParams = false;

export function generateStaticParams() {
  return STYLE_IDS.map((style) => ({ style }));
}

export default async function StyleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ style: string }>;
}) {
  const { style } = await params;
  if (!isStyleId(style)) notFound();
  return (
    <>
      {/* set data-theme before paint so <html>/<body> backgrounds match */}
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.dataset.theme=${JSON.stringify(style)}` }} />
      <ThemeProvider style={style}>
        <ThemeChrome>{children}</ThemeChrome>
      </ThemeProvider>
    </>
  );
}
