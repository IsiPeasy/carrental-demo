'use client';

import CarSilhouette from '@/components/CarSilhouette';
import { FLEET, STATS } from '@/lib/data';
import { useT } from '@/lib/i18n';
import type { DoorProps } from '@/lib/themes';
import { SpeedLines, Stripes } from './parts';

/** Landing mini poster (no 3D): race number, stripes sliding in, car with speed lines. */
export default function Door({ active }: DoorProps) {
  const t = useT();
  const car = FLEET[1];
  const n = STATS.find((s) => s.id === 'cars')?.value ?? 0;
  return (
    <div className={`gp-door relative h-full w-full overflow-hidden bg-bg ${active ? 'is-active' : ''}`}>
      <Stripes className="gp-door-stripes" play />
      <span aria-hidden className="gp-door-num">
        {n}
      </span>
      <p className="gp-door-title gp-display" aria-hidden>
        {t('th.grand-prix.hero.title')}
      </p>
      <div className="gp-door-car" aria-hidden>
        <SpeedLines className="gp-door-speed" count={6} />
        <CarSilhouette bodyType={car.bodyType} color={car.color.hex} accent="#EFE7D6" stroke="#111111" strokeWidth={1.5} className="relative w-full" />
      </div>
    </div>
  );
}
