'use client';

import { useTheme } from '@/components/ThemeProvider';
import { useBuilderNav, useWhatsApp } from '@/components/builder/kit';
import { useEstimate } from '@/lib/store';

export default function BuilderView() {
  const { components: C } = useTheme();
  const nav = useBuilderNav();
  const estimate = useEstimate();
  const wa = useWhatsApp(estimate);
  const steps = [C.CarStep, C.DestinationStep, C.DatesStep, C.ExtrasStep] as const;
  const Step = steps[nav.step];
  return (
    <C.BuilderLayout nav={nav}>
      {Step ? <Step nav={nav} /> : <C.SummaryVariant nav={nav} estimate={estimate} message={wa.message} url={wa.url} />}
    </C.BuilderLayout>
  );
}
