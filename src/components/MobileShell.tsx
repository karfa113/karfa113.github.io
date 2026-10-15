import { visibleApps } from '../data/apps';
import { profile } from '../data/profile';
import { Icon } from './Icon';
import { ClockMenu } from './ClockMenu';
import { useWindowManager } from '../state/windowManager';
import type { Theme } from '../hooks/useTheme';
import { WindowLayer } from './Desktop';
import { Wallpaper } from './Wallpaper';

interface Props {
  theme: Theme;
  onToggleTheme: () => void;
  onOpenPalette: () => void;
}

/**
 * Mobile is its own interface, not a shrunk desktop: a launcher grid,
 * full-screen apps with a Back button. No navigation bar: the home screen is the nav.
 */
export function MobileShell({ theme, onToggleTheme, onOpenPalette }: Props) {
  const wm = useWindowManager();
  const apps = visibleApps();
  const front = wm.windows.find((w) => w.id === wm.frontId);

  return (
    <div className="m-shell">
      <Wallpaper />
      <header className="m-bar" data-app-open={front ? true : undefined}>
        <ClockMenu variant="mobile" />
        <div className="m-bar__right">
          <button type="button" className="bar__btn bar__btn--icon" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={17} />
          </button>
        </div>
      </header>

      <main className="m-home" inert={front ? true : undefined}>
        <h1 className="m-home__name">{profile.name}</h1>
        <p className="m-home__role">{profile.role}</p>

        <div className="m-grid" role="list" aria-label="Applications">
          {apps.map((app) => (
            <button key={app.id} type="button" className="m-app" role="listitem" onClick={() => wm.openApp(app.id)}>
              <span className="m-app__tile">
                <Icon name={app.id} size={28} strokeWidth={1.4} />
              </span>
              <span className="m-app__label">{app.title}</span>
            </button>
          ))}
        </div>
      </main>

      {!front ? (
        <button type="button" className="m-search" onClick={onOpenPalette} aria-label="Search apps and projects">
          <Icon name="search" size={16} />
          <span>Search</span>
        </button>
      ) : null}

      <WindowLayer />
    </div>
  );
}