'use client';

import CarSilhouette from '@/components/CarSilhouette';
import type { DoorProps } from '@/lib/themes';

/** Landing mini hero placeholder: an animated silhouette in the door's tokens. */
export default function Door({ active }: DoorProps) {
  return (
    <div className="flex h-full w-full items-end justify-center p-6">
      <CarSilhouette
        bodyType="supercar"
        color="var(--color-accent)"
        stroke="var(--color-accent)"
        drawProgress={active ? 1 : 0.65}
        className="w-full max-w-xs transition-all duration-700"
      />
    </div>
  );
}
