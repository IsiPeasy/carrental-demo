'use client';

// Landing mini hero (no 3D): black stage, CSS spotlight cone that fades in,
// silhouette whose paint crossfades Rosso → Blu Tour de France → Giallo
// Cartagena, mirrored on a reflective floor.

import CarSilhouette from '@/components/CarSilhouette';
import { carById } from '@/lib/data';
import { useT } from '@/lib/i18n';
import type { DoorProps } from '@/lib/themes';
import { Emph } from './ui';

const PAINTS = ['f8-spider', 'roma-spyder', '911-gt3'].map((id) => carById(id)!.color.hex);

export default function Door({ active }: DoorProps) {
  const t = useT();
  return (
    <div className={`nc-door ${active ? 'is-active' : ''}`} aria-hidden>
      <div className="nc-door-cone" />
      <div className="nc-door-pool" />
      <div className="nc-door-car">
        {PAINTS.map((hex, i) => (
          <div key={hex} className={`nc-door-paint nc-door-paint-${i}`}>
            <CarSilhouette bodyType="supercar" color={hex} accent="#C8A96A" className="w-full" />
            <CarSilhouette bodyType="supercar" color={hex} accent="#C8A96A" shadow={false} className="nc-door-reflection w-full" />
          </div>
        ))}
      </div>
      <p className="nc-door-title font-display">
        <Emph text={t('th.nocturne.hero.title')} />
      </p>
    </div>
  );
}
