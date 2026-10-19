// itinerary — registry entry. Components not listed fall back to components/neutral.
import type { ThemeModule } from '@/lib/themes';
import BuilderLayout from './BuilderLayout';
import Door from './Door';
import FleetSection from './FleetSection';
import Footer from './Footer';
import Header from './Header';
import Hero from './Hero';
import HomeSections from './HomeSections';
import { CarStep, DatesStep, DestinationStep, ExtrasStep, SummaryVariant } from './steps';

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
