import type { Rect, ViewportKind } from '../types';

/** Layout constants shared by the window manager, desktop and CSS (keep in sync with tokens.css). */
export const BAR_H = 32;
export const DOCK_RESERVE = 84;
export const ICON_ZONE = 148;
export const MIN_W = 360;
export const MIN_H = 260;
export const MOBILE_MAX = 767;
export const TABLET_MAX = 1023;
/** How close (px) the pointer must get to a screen edge while dragging to trigger a snap. */
export const SNAP_EDGE = 16;
/** Pointer movement (px) before a drag counts as a drag — keeps clicks and double-clicks from unsnapping. */
export const DRAG_SLOP = 4;
/** Minimum horizontal sliver of a window that must stay on-screen. */
const GRAB = 96;

export interface Viewport {
  w: number;
  h: number;
  kind: ViewportKind;
}

export const kindFor = (w: number): ViewportKind => (w <= MOBILE_MAX ? 'mobile' : w <= TABLET_MAX ? 'tablet' : 'desktop');

export const readViewport = (): Viewport => {
  const w = window.innerWidth;
  return { w, h: window.innerHeight, kind: kindFor(w) };
};

/** Keeps a window usable: title bar always reachable, size never larger than the screen. */
export function clampRect(r: Rect, vp: Pick<Viewport, 'w' | 'h'>): Rect {
  const w = Math.max(Math.min(MIN_W, vp.w - 16), Math.min(r.w, vp.w - 16));
  const h = Math.max(Math.min(MIN_H, vp.h - BAR_H - 16), Math.min(r.h, vp.h - BAR_H - 16));
  const x = Math.min(Math.max(r.x, GRAB - w), vp.w - GRAB);
  const y = Math.min(Math.max(r.y, BAR_H), vp.h - 56);
  return { x, y, w, h };
}

/** Area used by a maximised window (below the bar, above the dock). */
export const maxRect = (vp: Pick<Viewport, 'w' | 'h' | 'kind'>): Rect => ({
  x: 0,
  y: BAR_H,
  w: vp.w,
  h: vp.h - BAR_H - (vp.kind === 'mobile' ? 0 : DOCK_RESERVE - 24),
});

export function initialRect(size: { w: number; h: number }, vp: Viewport, openCount: number): Rect {
  const left = vp.kind === 'tablet' ? 16 : ICON_ZONE;
  const w = Math.min(size.w, Math.max(MIN_W, vp.w - left - 24));
  const h = Math.min(size.h, vp.h - BAR_H - DOCK_RESERVE - 16);
  const off = (openCount % 6) * 28;
  return clampRect({ x: left + 12 + off, y: BAR_H + 20 + off, w, h }, vp);
}

/* ───────────────────────── Snapping ───────────────────────── */

/** A snapped window fills the left or right half of the work area. Top-snap is a normal maximise. */
export type SnapSide = 'left' | 'right';
export type SnapZone = SnapSide | 'top';

/** Rectangle of a half-screen snap (same vertical extent as a maximised window). */
export function snapRect(side: SnapSide, vp: Pick<Viewport, 'w' | 'h' | 'kind'>): Rect {
  const full = maxRect(vp);
  const w = Math.floor(vp.w / 2);
  return side === 'left' ? { ...full, w } : { ...full, x: w, w: vp.w - w };
}

/** Where a snap preview should be drawn for a zone. */
export const zoneRect = (zone: SnapZone, vp: Pick<Viewport, 'w' | 'h' | 'kind'>): Rect => (zone === 'top' ? maxRect(vp) : snapRect(zone, vp));

/**
 * Which snap zone (if any) the pointer is in. The top zone is the system bar itself: dragging
 * the title bar up into it works even though the window stops just below the bar.
 */
export function snapZoneAt(x: number, y: number, vp: Pick<Viewport, 'w' | 'h' | 'kind'>): SnapZone | null {
  if (vp.kind !== 'desktop') return null;
  if (y <= BAR_H) return 'top';
  if (x <= SNAP_EDGE) return 'left';
  if (x >= vp.w - SNAP_EDGE) return 'right';
  return null;
}