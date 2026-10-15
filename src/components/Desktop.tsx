import { useState } from 'react';
import type { AppId } from '../types';
import { useWindowManager } from '../state/windowManager';
import { Wallpaper } from './Wallpaper';
import { DesktopIcons } from './DesktopIcons';
import { Window } from './Window';
import { SnapPreview } from './SnapPreview';
import { AppContent } from './AppContent';

/** Renders every open window. Shared by the desktop and mobile shells. */
export function WindowLayer() {
  const wm = useWindowManager();
  return (
    <div className="windows">
      {wm.windows.map((win) => (
        <Window key={win.id} win={win}>
          <AppContent win={win} />
        </Window>
      ))}
      <SnapPreview />
    </div>
  );
}

/** The desktop canvas: wallpaper, icon grid and the floating windows. */
export function Desktop() {
  const [selected, setSelected] = useState<AppId | null>(null);

  return (
    <main
      className="desktop"
      onPointerDown={(e: { target: EventTarget; currentTarget: EventTarget }) => {
        if (e.target === e.currentTarget) setSelected(null);
      }}
    >
      <Wallpaper />
      <DesktopIcons selected={selected} onSelect={setSelected} />
      <WindowLayer />
    </main>
  );
}