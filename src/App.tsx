import { useEffect, useState } from 'react';
import { WindowManagerProvider, useWindowManager } from './state/windowManager';
import { useTheme } from './hooks/useTheme';
import { SystemBar } from './components/SystemBar';
import { Desktop } from './components/Desktop';
import { Dock } from './components/Dock';
import { MobileShell } from './components/MobileShell';
import { CommandPalette } from './components/CommandPalette';

function Shell() {
  const wm = useWindowManager();
  const { theme, toggleTheme } = useTheme();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const mobile = wm.viewport.kind === 'mobile';
  const front = wm.windows.find((w) => w.id === wm.frontId);

  // The only global key handler: ⌘K / Ctrl K toggles the launcher.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.title = front ? `${front.title} — MONO OS` : 'MONO OS — Portfolio';
  }, [front?.title]);

  const openPalette = () => setPaletteOpen(true);

  return (
    <>
      {mobile ? (
        <MobileShell theme={theme} onToggleTheme={toggleTheme} onOpenPalette={openPalette} />
      ) : (
        <>
          <SystemBar theme={theme} onToggleTheme={toggleTheme} onOpenPalette={openPalette} />
          <Desktop />
          <Dock onOpenPalette={openPalette} />
        </>
      )}
      {paletteOpen ? <CommandPalette theme={theme} onToggleTheme={toggleTheme} onClose={() => setPaletteOpen(false)} /> : null}
    </>
  );
}

export default function App() {
  return (
    <WindowManagerProvider>
      <Shell />
    </WindowManagerProvider>
  );
}
