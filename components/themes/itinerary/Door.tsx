'use client';

// Landing door: live mini Europe map (no 3D) — pulsing dots, arcs from Milan.

import { useT } from '@/lib/i18n';
import type { DoorProps } from '@/lib/themes';
import EuropeMap, { type BBox, type MapArc } from './EuropeMap';

const BBOX: BBox = [-7, 36, 25, 57];
const DEST = ['londra', 'parigi', 'costa-smeralda', 'ibiza', 'vienna', 'saint-moritz', 'montecarlo', 'berlino', 'madrid'];
const ARCS: MapArc[] = DEST.map((to) => ({ from: 'milano', to }));

export default function Door({ active }: DoorProps) {
  const t = useT();
  return (
    <div className={`itin-door relative h-full w-full overflow-hidden ${active ? 'is-active' : ''}`}>
      <EuropeMap
        bbox={BBOX}
        width={700}
        arcs={ARCS}
        highlight={DEST}
        live
        slice
        stagger={0.6}
        className="absolute inset-0 h-full w-full"
      />
      <p className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-line bg-surface/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink">
        <span className="itin-live-dot" aria-hidden />
        {t('th.itinerary.door.live')}
      </p>
    </div>
  );
}
