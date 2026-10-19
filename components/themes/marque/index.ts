// marque — registry entry: "the brand takes the lead".
import type { ThemeModule } from '@/lib/themes';
import { BuilderLayout, CarStep, DatesStep, DestinationStep, ExtrasStep, SummaryVariant } from './builder';
import { Door, Footer, Header } from './chrome';
import { FleetSection } from './fleet';
import { Hero, HomeSections } from './home';

export const components: ThemeModule['components'] = {
  Hero,
  HomeSections,
  FleetSection,
  CarStep,
  DestinationStep,
  DatesStep,
  ExtrasStep,
  SummaryVariant,
  BuilderLayout,
  Header,
  Footer,
  Door,
};
