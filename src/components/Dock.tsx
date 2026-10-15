import { visibleApps } from '../data/apps';
import { Icon } from './Icon';
import { isApplePlatform } from './SystemBar';
import { useWindowManager } from '../state/windowManager';

export function Dock({ onOpenPalette }: { onOpenPalette: () => void }) {
  const wm = useWindowManager();
  const items = visibleApps().filter((a) => a.dock);
  const shortcut = isApplePlatform() ? '⌘K' : 'Ctrl K';

  return (
    <nav className="dock" aria-label="Dock">
      <button type="button" className="dock__item" data-label={`Search · ${shortcut}`} aria-label={`Search applications and projects (${shortcut})`} onClick={onOpenPalette}>
        <Icon name="search" size={20} />
      </button>
      <span className="dock__sep" aria-hidden="true" />
      {items.map((app) => {
        const win = wm.windows.find((w) => w.id === app.id && !w.closing);
        const open = Boolean(win);
        const minimized = Boolean(win?.minimized);
        const front = wm.frontId === app.id;
        return (
          <button
            key={app.id}
            type="button"
            className="dock__item"
            data-label={app.title}
            data-open={open}
            data-minimized={minimized}
            data-front={front}
            aria-label={`${app.title}${open ? (minimized ? ' (minimised)' : ' (open)') : ''}`}
            onClick={() => wm.toggleApp(app.id)}
          >
            <Icon name={app.id} size={21} />
            <i className="dock__dot" aria-hidden="true" />
          </button>
        );
      })}
    </nav>
  );
}
