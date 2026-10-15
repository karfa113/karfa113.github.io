import { useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { AppId } from '../types';
import { visibleApps } from '../data/apps';
import { Icon } from './Icon';
import { useWindowManager } from '../state/windowManager';
import { BAR_H, DOCK_RESERVE } from '../state/geometry';

const CELL_H = 100;

interface Props {
  selected: AppId | null;
  onSelect: (id: AppId | null) => void;
}

/**
 * Desktop icon grid.
 * Mouse: click selects, double-click opens. Touch: a single tap opens.
 * Keyboard: arrows move between icons (roving tabindex), Enter / Space opens.
 */
export function DesktopIcons({ selected, onSelect }: Props) {
  const wm = useWindowManager();
  const apps = visibleApps();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);

  const perColumn = Math.max(1, Math.floor((wm.viewport.h - BAR_H - DOCK_RESERVE - 24) / CELL_H));

  const focusIndex = (i: number) => {
    const next = Math.min(Math.max(i, 0), apps.length - 1);
    const app = apps[next];
    if (!app) return;
    setActive(next);
    onSelect(app.id);
    refs.current[next]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number, id: AppId) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        return focusIndex(index + 1);
      case 'ArrowUp':
        e.preventDefault();
        return focusIndex(index - 1);
      case 'ArrowRight':
        e.preventDefault();
        return focusIndex(index + perColumn);
      case 'ArrowLeft':
        e.preventDefault();
        return focusIndex(index - perColumn);
      case 'Home':
        e.preventDefault();
        return focusIndex(0);
      case 'End':
        e.preventDefault();
        return focusIndex(apps.length - 1);
      case 'Enter':
      case ' ':
        e.preventDefault();
        return wm.openApp(id);
    }
  };

  return (
    <nav className="icons" aria-label="Desktop" style={{ gridTemplateRows: `repeat(${perColumn}, ${CELL_H - 8}px)` }}>
      {apps.map((app, i) => (
        <button
          key={app.id}
          type="button"
          className="dicon"
          data-selected={selected === app.id}
          tabIndex={i === active ? 0 : -1}
          ref={(el: HTMLButtonElement | null) => {
            refs.current[i] = el;
          }}
          aria-label={`${app.title} — ${app.blurb}`}
          onFocus={() => setActive(i)}
          onClick={() => {
            onSelect(app.id);
            if (window.matchMedia('(pointer: coarse)').matches) wm.openApp(app.id);
          }}
          onDoubleClick={() => wm.openApp(app.id)}
          onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => onKeyDown(e, i, app.id)}
        >
          <span className="dicon__tile">
            <Icon name={app.id} size={26} strokeWidth={1.4} />
          </span>
          <span className="dicon__label">{app.title}</span>
        </button>
      ))}
    </nav>
  );
}
