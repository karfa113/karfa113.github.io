import { useEffect, useState } from 'react';
import { Icon } from './Icon';
import { ClockMenu } from './ClockMenu';
import { useWindowManager } from '../state/windowManager';
import type { Theme } from '../hooks/useTheme';

export const isApplePlatform = (): boolean => /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent);

function useOnline(): boolean {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);
  return online;
}

interface Props {
  theme: Theme;
  onToggleTheme: () => void;
  onOpenPalette: () => void;
}

export function SystemBar({ theme, onToggleTheme, onOpenPalette }: Props) {
  const wm = useWindowManager();
  const online = useOnline();
  const front = wm.windows.find((w) => w.id === wm.frontId);
  const shortcut = isApplePlatform() ? '⌘K' : 'Ctrl K';

  return (
    <header className="bar">
      <div className="bar__left">
        <button type="button" className="bar__brand mono" onClick={onOpenPalette} aria-label="MONO OS — open launcher">
          <span className="bar__mark" aria-hidden="true" />
          MONO OS
        </button>
        <span className="bar__sep" aria-hidden="true" />
        <span className="bar__context" aria-live="polite">
          <span className="bar__app">{front ? front.title : 'Desktop'}</span>
          <span className="bar__path mono">{front ? front.path : '~/'}</span>
        </span>
      </div>

      <div className="bar__right">
        <button type="button" className="bar__btn bar__btn--search" onClick={onOpenPalette} aria-label={`Open launcher (${shortcut})`}>
          <Icon name="search" size={14} />
          <span>Search</span>
          <kbd className="kbd mono">{shortcut}</kbd>
        </button>
        <span className="bar__status mono" data-online={online} title={online ? 'Online' : 'Offline'}>
          <i aria-hidden="true" />
          {online ? 'ONLINE' : 'OFFLINE'}
        </span>
        <button
          type="button"
          className="bar__btn bar__btn--icon"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15} />
        </button>
        <ClockMenu variant="bar" />
      </div>
    </header>
  );
}