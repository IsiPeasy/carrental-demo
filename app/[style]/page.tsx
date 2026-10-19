import { STYLE_IDS } from '@/lib/theme-tokens';
import HomeView from './HomeView';

export function generateStaticParams() {
  return STYLE_IDS.map((style) => ({ style }));
}

export default function Page() {
  return <HomeView />;
}
