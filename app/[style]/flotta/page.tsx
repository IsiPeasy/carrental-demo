'use client';

import { useTheme } from '@/components/ThemeProvider';

export default function FleetPage() {
  const { FleetSection } = useTheme().components;
  return <FleetSection variant="catalog" />;
}
