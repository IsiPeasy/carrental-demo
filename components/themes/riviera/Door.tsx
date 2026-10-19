'use client';

import type { DoorProps } from '@/lib/themes';
import { DOOR_COAST } from './coast';
import RouteMap from './RouteMap';

/** Landing mini hero: a small pile of postcards, the top one drawing the route. No 3D, no fetch. */
export default function Door({ active }: DoorProps) {
  return (
    <div className="rv-door" aria-hidden>
      <div className="rv-door-pile">
        <div className="rv-door-back" />
        <div className="rv-door-card">
          <RouteMap rings={DOOR_COAST} compact loop run={active} />
        </div>
      </div>
    </div>
  );
}
