import { useEffect, useRef, useState } from 'react';
import type { PointerEvent, ReactNode } from 'react';
import type { Rect } from '../types';
import { Icon } from './Icon';
import { useWindowManager, type WinState } from '../state/windowManager';
import { clampRect, DRAG_SLOP, maxRect, MIN_H, MIN_W, snapRect, snapZoneAt, type SnapZone } from '../state/geometry';
import { setSnapPreview } from './SnapPreview';
import { WindowStatusContext } from '../hooks/useWindowStatus';

interface Gesture {
  mode: 'drag' | 'resize';
  startX: number;
  startY: number;
  rect: Rect;
  next: Rect;
  /** Drag only: past the click-vs-drag threshold. */
  moved: boolean;
  /** Drag only: snap zone under the pointer. */
  zone: SnapZone | null;
}

/**
 * The single window implementation used by every app.
 * Desktop/tablet: floating, draggable (CSS transform), resizable, maximisable.
 * Mobile: the same window becomes a full-screen panel with a back button.
 *
 * During a drag/resize the DOM is updated directly (no React re-render per pointer move);
 * the final rectangle is committed to the window manager on pointer-up.
 */
export function Window({ win, children }: { win: WinState; children: ReactNode }) {
  const wm = useWindowManager();
  const { viewport } = wm;
  const mobile = viewport.kind === 'mobile';
  const isFront = wm.frontId === win.id;
  // Maximised and snapped windows are derived from the viewport; `win.rect` is the floating rectangle to restore.
  const rect = win.maximized ? maxRect(viewport) : win.snap ? snapRect(win.snap, viewport) : win.rect;
  const hidden = !win.closing && (win.minimized || (mobile && !isFront));

  const ref = useRef<HTMLElement>(null);
  const gesture = useRef<Gesture | null>(null);
  const [status, setStatus] = useState('');

  // Keyboard users land inside a window when it comes to the front.
  useEffect(() => {
    const el = ref.current;
    if (isFront && el && !el.contains(document.activeElement)) el.focus({ preventScroll: true });
  }, [isFront]);

  /* ── Dragging (title bar) ── */
  // Snapped and maximised windows can be dragged too: pulling one away restores its floating size.
  const startDrag = (e: PointerEvent<HTMLElement>) => {
    if (mobile || e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    gesture.current = { mode: 'drag', startX: e.clientX, startY: e.clientY, rect: win.rect, next: win.rect, moved: false, zone: null };
    if (ref.current) ref.current.dataset.gesture = 'drag';
  };

  /* ── Resizing (corner handle) ── */
  const startResize = (e: PointerEvent<HTMLElement>) => {
    if (mobile || win.maximized || win.snap || e.button !== 0) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    gesture.current = { mode: 'resize', startX: e.clientX, startY: e.clientY, rect: win.rect, next: win.rect, moved: true, zone: null };
    if (ref.current) ref.current.dataset.gesture = 'resize';
  };

  const moveGesture = (e: PointerEvent<HTMLElement>) => {
    const g = gesture.current;
    const el = ref.current;
    if (!g || !el) return;
    const dx = e.clientX - g.startX;
    const dy = e.clientY - g.startY;
    if (g.mode === 'drag') {
      if (!g.moved) {
        if (Math.hypot(dx, dy) < DRAG_SLOP) return;
        g.moved = true;
        if (win.maximized || win.snap) {
          // Pull the window out of its snapped/maximised state: restore the floating size and keep the
          // same spot of the title bar under the pointer, so it feels like the window "came with" the cursor.
          const cur = win.maximized ? maxRect(viewport) : snapRect(win.snap!, viewport);
          const size = clampRect(win.rect, viewport);
          const grabX = Math.min(Math.max((g.startX - cur.x) / cur.w, 0), 1);
          const grabY = Math.min(g.startY - cur.y, 20);
          g.rect = clampRect({ x: e.clientX - grabX * size.w, y: e.clientY - grabY, w: size.w, h: size.h }, viewport);
          g.startX = e.clientX;
          g.startY = e.clientY;
          el.dataset.max = 'false';
          el.style.width = `${g.rect.w}px`;
          el.style.height = `${g.rect.h}px`;
          el.style.transform = `translate3d(${g.rect.x}px, ${g.rect.y}px, 0)`;
          g.next = g.rect;
          return;
        }
      }
      g.next = clampRect({ ...g.rect, x: g.rect.x + (e.clientX - g.startX), y: g.rect.y + (e.clientY - g.startY) }, viewport);
      el.style.transform = `translate3d(${g.next.x}px, ${g.next.y}px, 0)`;
      const zone = snapZoneAt(e.clientX, e.clientY, viewport);
      if (zone !== g.zone) {
        g.zone = zone;
        setSnapPreview(zone);
      }
    } else {
      const w = Math.min(Math.max(g.rect.w + dx, MIN_W), Math.max(MIN_W, viewport.w - g.rect.x));
      const h = Math.min(Math.max(g.rect.h + dy, MIN_H), Math.max(MIN_H, viewport.h - g.rect.y));
      g.next = { ...g.rect, w, h };
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;
    }
  };

  const finishGesture = (e: PointerEvent<HTMLElement>, cancelled: boolean) => {
    const g = gesture.current;
    if (!g) return;
    gesture.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (ref.current) delete ref.current.dataset.gesture;
    setSnapPreview(null);
    if (g.mode === 'resize') {
      if (g.next !== g.rect) wm.setRect(win.id, g.next);
      return;
    }
    if (!g.moved) return;
    const zone = cancelled ? null : g.zone;
    // `win.rect` (not the dragged position) stays as the restore target when snapping or maximising.
    const target = zone === 'top' ? maxRect(viewport) : zone ? snapRect(zone, viewport) : g.next;
    // React only writes styles that changed between renders. A window dropped back where it started
    // (e.g. a maximised window dragged out and returned to the top) would keep the mid-drag inline
    // styles, so put the DOM in its final state here and let the transition animate the move.
    const el = ref.current;
    if (el) {
      el.dataset.max = String(zone === 'top');
      el.style.width = `${target.w}px`;
      el.style.height = `${target.h}px`;
      el.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
    }
    if (zone === 'top') return wm.place(win.id, { snap: null, maximized: true });
    if (zone) return wm.place(win.id, { snap: zone, maximized: false });
    wm.place(win.id, { rect: g.next, snap: null, maximized: false });
  };
  const endGesture = (e: PointerEvent<HTMLElement>) => finishGesture(e, false);
  const cancelGesture = (e: PointerEvent<HTMLElement>) => finishGesture(e, true);

  // Never leave a stale preview behind if the window unmounts mid-drag.
  useEffect(() => () => setSnapPreview(null), []);

  const style = mobile
    ? { zIndex: 100 + win.z }
    : {
      width: rect.w,
      height: rect.h,
      transform: `translate3d(${rect.x}px, ${rect.y}px, 0)`,
      zIndex: 100 + win.z,
    };

  return (
    <section
      ref={ref}
      className="win"
      role="region"
      aria-label={win.title}
      tabIndex={-1}
      data-app={win.appId}
      data-front={isFront}
      data-hidden={hidden}
      data-closing={win.closing}
      data-max={win.maximized}
      data-snap={win.snap ?? undefined}
      data-mobile={mobile}
      style={style}
      onPointerDownCapture={() => {
        if (!isFront && !win.closing) wm.focus(win.id);
      }}
    >
      <div className="win__frame">
        <header
          className="win__bar"
          onPointerDown={startDrag}
          onPointerMove={moveGesture}
          onPointerUp={endGesture}
          onPointerCancel={cancelGesture}
          onDoubleClick={(e: PointerEvent<HTMLElement>) => {
            if (!mobile && !(e.target as HTMLElement).closest('button')) wm.toggleMaximize(win.id);
          }}
        >
          {mobile ? (
            <button type="button" className="win__back" onClick={() => wm.close(win.id)} aria-label={`Close ${win.title} and go back`}>
              <Icon name="back" size={18} />
              <span>Back</span>
            </button>
          ) : null}
          {!mobile ? (
            <div className="win__controls" role="group" aria-label="Window controls">
              <button type="button" className="tl tl--close" onClick={() => wm.close(win.id)} aria-label={`Close ${win.title}`} title="Close">
                <svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2.6 2.6l4.8 4.8M7.4 2.6L2.6 7.4" /></svg>
              </button>
              <button type="button" className="tl tl--min" onClick={() => wm.minimize(win.id)} aria-label={`Minimise ${win.title}`} title="Minimise">
                <svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2.3 5h5.4" /></svg>
              </button>
              <button
                type="button"
                className="tl tl--max"
                onClick={() => wm.toggleMaximize(win.id)}
                aria-label={win.maximized ? `Restore ${win.title}` : `Maximise ${win.title}`}
                title={win.maximized ? 'Restore' : 'Maximise'}
              >
                {win.maximized ? (
                  <svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2.4 6.2h3.4v3.4M7.6 3.8H4.2V.4" transform="translate(0 -.2)" /></svg>
                ) : (
                  <svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2.6 7.4V3.6M2.6 7.4h3.8M7.4 2.6v3.8M7.4 2.6H3.6" /></svg>
                )}
              </button>
            </div>
          ) : null}
          <div className="win__id">
            <Icon name={win.appId} size={15} className="win__glyph" />
            <h2 className="win__title">{win.title}</h2>
            <span className="win__path mono">{win.path}</span>
          </div>
        </header>

        <div className="win__body">
          <WindowStatusContext.Provider value={setStatus}>{children}</WindowStatusContext.Provider>
        </div>

        {!mobile ? (
          <footer className="win__status mono">
            <span>{status}</span>
            <span>{isFront ? 'ACTIVE' : 'BACKGROUND'}</span>
          </footer>
        ) : null}

        {!mobile && !win.maximized && !win.snap ? (
          <div
            className="win__resize"
            onPointerDown={startResize}
            onPointerMove={moveGesture}
            onPointerUp={endGesture}
            onPointerCancel={cancelGesture}
            aria-hidden="true"
          />
        ) : null}
      </div>
    </section>
  );
}