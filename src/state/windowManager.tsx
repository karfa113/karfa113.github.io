import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { AppId, Rect } from '../types';
import { getApp } from '../data/apps';
import { getProject } from '../data/projects';
import { clampRect, initialRect, readViewport, type SnapSide, type Viewport } from './geometry';

/* ───────────────────────── State ───────────────────────── */

export interface WinState {
  id: string;
  appId: AppId;
  projectSlug?: string;
  title: string;
  path: string;
  minimized: boolean;
  maximized: boolean;
  /** Half-screen snap. While set, `rect` is the floating rectangle to restore to. */
  snap: SnapSide | null;
  /** True while the exit animation plays; the window is removed right after. */
  closing: boolean;
  z: number;
  rect: Rect;
}

/** Where a window ends up after a drag: floating (rect), snapped to a half, or maximised. */
export interface Placement {
  /** New floating rectangle. Omit to keep the current one (it is the restore target for snap/maximise). */
  rect?: Rect;
  snap: SnapSide | null;
  maximized: boolean;
}

type NewWin = Pick<WinState, 'id' | 'appId' | 'projectSlug' | 'title' | 'path' | 'rect'>;

interface State {
  windows: WinState[];
  z: number;
}

type Action =
  | { type: 'open'; win: NewWin; maxFloating: number }
  | { type: 'focus'; id: string }
  | { type: 'minimize'; id: string }
  | { type: 'minimizeAll' }
  | { type: 'toggleMax'; id: string }
  | { type: 'setRect'; id: string; rect: Rect }
  | { type: 'place'; id: string; placement: Placement }
  | { type: 'closing'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'clamp'; vp: Viewport };

const initialState: State = { windows: [], z: 0 };

const live = (ws: WinState[]) => ws.filter((w) => !w.minimized && !w.closing);

function reducer(state: State, a: Action): State {
  switch (a.type) {
    case 'open': {
      const z = state.z + 1;
      const existing = state.windows.find((w) => w.id === a.win.id);
      let windows: WinState[];
      if (existing && !existing.closing) {
        windows = state.windows.map((w) => (w.id === existing.id ? { ...w, minimized: false, z } : w));
      } else {
        const fresh: WinState = { ...a.win, minimized: false, maximized: false, snap: null, closing: false, z };
        windows = [...state.windows.filter((w) => w.id !== a.win.id), fresh];
      }
      // Tablet: keep only a few floating windows; minimise the oldest extras.
      const visible = live(windows);
      if (a.maxFloating > 0 && visible.length > a.maxFloating) {
        const drop = visible
          .filter((w) => w.id !== a.win.id)
          .sort((p, q) => p.z - q.z)
          .slice(0, visible.length - a.maxFloating)
          .map((w) => w.id);
        windows = windows.map((w) => (drop.includes(w.id) ? { ...w, minimized: true } : w));
      }
      return { windows, z };
    }
    case 'focus': {
      if (!state.windows.some((w) => w.id === a.id)) return state;
      const z = state.z + 1;
      return { z, windows: state.windows.map((w) => (w.id === a.id ? { ...w, minimized: false, z } : w)) };
    }
    case 'minimize':
      return { ...state, windows: state.windows.map((w) => (w.id === a.id ? { ...w, minimized: true } : w)) };
    case 'minimizeAll':
      return { ...state, windows: state.windows.map((w) => ({ ...w, minimized: true })) };
    case 'toggleMax':
      // A snapped window maximises; a maximised one restores to its floating rectangle.
      return { ...state, windows: state.windows.map((w) => (w.id === a.id ? { ...w, maximized: w.snap ? true : !w.maximized, snap: null } : w)) };
    case 'setRect':
      return { ...state, windows: state.windows.map((w) => (w.id === a.id ? { ...w, rect: a.rect } : w)) };
    case 'place':
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === a.id ? { ...w, rect: a.placement.rect ?? w.rect, snap: a.placement.snap, maximized: a.placement.maximized } : w,
        ),
      };
    case 'closing':
      return { ...state, windows: state.windows.map((w) => (w.id === a.id ? { ...w, closing: true } : w)) };
    case 'remove':
      return { ...state, windows: state.windows.filter((w) => w.id !== a.id) };
    case 'clamp':
      return { ...state, windows: state.windows.map((w) => ({ ...w, rect: clampRect(w.rect, a.vp) })) };
  }
}

/* ───────────────────────── Context ───────────────────────── */

export interface WindowManagerApi {
  windows: WinState[];
  viewport: Viewport;
  /** Id of the top-most window that is neither minimised nor closing. */
  frontId: string | null;
  openApp: (id: AppId) => void;
  openProject: (slug: string) => void;
  /** Dock behaviour: open → focus → minimise (if already in front). */
  toggleApp: (id: AppId) => void;
  focus: (id: string) => void;
  minimize: (id: string) => void;
  minimizeAll: () => void;
  toggleMaximize: (id: string) => void;
  setRect: (id: string, rect: Rect) => void;
  /** Commit the result of a drag: floating, snapped to a half, or maximised. */
  place: (id: string, placement: Placement) => void;
  close: (id: string) => void;
}

const Ctx = createContext<WindowManagerApi | null>(null);

export function useWindowManager(): WindowManagerApi {
  const api = useContext(Ctx);
  if (!api) throw new Error('useWindowManager must be used inside <WindowManagerProvider>');
  return api;
}

const EXIT_MS = 150;
export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface OpenSpec {
  id: string;
  appId: AppId;
  projectSlug?: string;
  title: string;
  path: string;
  size: { w: number; h: number };
}

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [viewport, setViewport] = useState<Viewport>(readViewport);

  // Latest values for stable callbacks (avoids re-creating the API on every render).
  const stateRef = useRef(state);
  const vpRef = useRef(viewport);
  stateRef.current = state;
  vpRef.current = viewport;
  const timers = useRef<Set<number>>(new Set());

  // One resize listener for the whole app, throttled to animation frames.
  useEffect(() => {
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const vp = readViewport();
        setViewport(vp);
        dispatch({ type: 'clamp', vp });
      });
    };
    window.addEventListener('resize', onResize);
    const pending = timers.current;
    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
      pending.forEach((t) => window.clearTimeout(t));
      pending.clear();
    };
  }, []);

  const open = useCallback((spec: OpenSpec) => {
    const vp = vpRef.current;
    const count = stateRef.current.windows.filter((w) => !w.closing).length;
    dispatch({
      type: 'open',
      maxFloating: vp.kind === 'tablet' ? 3 : 0,
      win: {
        id: spec.id,
        appId: spec.appId,
        projectSlug: spec.projectSlug,
        title: spec.title,
        path: spec.path,
        rect: initialRect(spec.size, vp, count),
      },
    });
  }, []);

  const openApp = useCallback(
    (appId: AppId) => {
      const app = getApp(appId);
      open({ id: appId, appId, title: app.title, path: app.path, size: app.size });
    },
    [open],
  );

  const openProject = useCallback(
    (slug: string) => {
      const p = getProject(slug);
      if (!p) return;
      const parent: AppId = p.kind === 'design' ? 'design' : 'code';
      open({
        id: `project:${slug}`,
        appId: parent,
        projectSlug: slug,
        title: p.title,
        path: `~/${parent}/${slug}`,
        size: { w: 880, h: 640 },
      });
    },
    [open],
  );

  const frontOf = (ws: WinState[]) => live(ws).sort((a, b) => b.z - a.z)[0]?.id ?? null;

  const toggleApp = useCallback(
    (appId: AppId) => {
      const w = stateRef.current.windows.find((x) => x.id === appId && !x.closing);
      if (!w) return openApp(appId);
      if (w.minimized) return dispatch({ type: 'focus', id: appId });
      if (frontOf(stateRef.current.windows) === appId && vpRef.current.kind !== 'mobile') {
        return dispatch({ type: 'minimize', id: appId });
      }
      dispatch({ type: 'focus', id: appId });
    },
    [openApp],
  );

  const close = useCallback((id: string) => {
    dispatch({ type: 'closing', id });
    const ms = prefersReducedMotion() ? 0 : EXIT_MS;
    if (ms === 0) return dispatch({ type: 'remove', id });
    const t = window.setTimeout(() => {
      timers.current.delete(t);
      dispatch({ type: 'remove', id });
    }, ms);
    timers.current.add(t);
  }, []);

  const focus = useCallback((id: string) => dispatch({ type: 'focus', id }), []);
  const minimize = useCallback((id: string) => dispatch({ type: 'minimize', id }), []);
  const minimizeAll = useCallback(() => dispatch({ type: 'minimizeAll' }), []);
  const toggleMaximize = useCallback((id: string) => dispatch({ type: 'toggleMax', id }), []);
  const setRect = useCallback((id: string, rect: Rect) => dispatch({ type: 'setRect', id, rect }), []);
  const place = useCallback((id: string, placement: Placement) => dispatch({ type: 'place', id, placement }), []);

  const frontId = frontOf(state.windows);

  const api = useMemo<WindowManagerApi>(
    () => ({
      windows: state.windows,
      viewport,
      frontId,
      openApp,
      openProject,
      toggleApp,
      focus,
      minimize,
      minimizeAll,
      toggleMaximize,
      setRect,
      place,
      close,
    }),
    [state.windows, viewport, frontId, openApp, openProject, toggleApp, focus, minimize, minimizeAll, toggleMaximize, setRect, place, close],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}