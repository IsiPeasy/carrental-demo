'use client';

import { useTheme } from '@/components/ThemeProvider';

export default function HomeView() {
  const { Hero, HomeSections } = useTheme().components;
  return (
    <>
      <Hero />
      <HomeSections />
    </>
  );
}
