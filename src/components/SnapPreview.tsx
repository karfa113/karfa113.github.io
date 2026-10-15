import { useEffect, useState } from 'react';
import { zoneRect, type SnapZone } from '../state/geometry';
import { useWindowManager } from '../state/windowManager';

/**
 * Tiny external store: the dragged window publishes the zone under the pointer, and this overlay
 * (the only subscriber) re-renders — the window itself never re-renders during a drag.
 */
let current: SnapZone | null = null;
const listeners = new Set<(zone: SnapZone | null) => void>();

export function setSnapPreview(zone: SnapZone | null): void {
  if (zone === current) return;
  current = zone;
  listeners.forEach((fn) => fn(zone));
}

/** Translucent outline showing where a dragged window will land when released. */
export function SnapPreview() {
  const { viewport } = useWindowManager();
  const [zone, setZone] = useState<SnapZone | null>(current);

  useEffect(() => {
    listeners.add(setZone);
    setZone(current);
    return () => {
      listeners.delete(setZone);
    };
  }, []);

  if (!zone) return null;
  // Drawn inside the slot with an 8px gutter, so it reads as "the window will sit here".
  const GUTTER = 8;
  const r = zoneRect(zone, viewport);
  return (
    <div
      className="snap-preview"
      aria-hidden="true"
      style={{ left: r.x + GUTTER, top: r.y + GUTTER, width: r.w - GUTTER * 2, height: r.h - GUTTER * 2 }}
    />
  );
}