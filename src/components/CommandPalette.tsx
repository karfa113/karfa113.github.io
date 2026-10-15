import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { visibleApps } from '../data/apps';
import { projects } from '../data/projects';
import { Icon, type IconName } from './Icon';
import { isApplePlatform } from './SystemBar';
import { useWindowManager } from '../state/windowManager';
import type { Theme } from '../hooks/useTheme';

interface Item {
  id: string;
  group: 'Applications' | 'Projects' | 'Actions';
  title: string;
  subtitle: string;
  icon: IconName;
  search: string;
  run: () => void;
}

interface Props {
  theme: Theme;
  onToggleTheme: () => void;
  onClose: () => void;
}

/** Developer-style launcher: type to filter apps, projects and actions. Opened with ⌘K / Ctrl K. */
export function CommandPalette({ theme, onToggleTheme, onClose }: Props) {
  const wm = useWindowManager();
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const skipRestore = useRef(false);
  const input = useRef<HTMLInputElement>(null);
  const listId = 'palette-list';

  const items = useMemo<Item[]>(() => {
    const apps: Item[] = visibleApps().map((a) => ({
      id: `app:${a.id}`,
      group: 'Applications',
      title: a.title,
      subtitle: a.blurb,
      icon: a.id,
      search: `${a.title} ${a.blurb} ${a.keywords.join(' ')}`,
      run: () => wm.openApp(a.id),
    }));
    const projs: Item[] = projects.map((p) => ({
      id: `project:${p.slug}`,
      group: 'Projects',
      title: p.title,
      subtitle: `${p.kind === 'design' ? 'Case study' : 'Code'} · ${p.category} · ${p.year}`,
      icon: p.kind === 'design' ? 'design' : 'code',
      search: `${p.title} ${p.summary} ${p.category} ${(p.tools ?? []).join(' ')} ${(p.tech ?? []).join(' ')} ${p.year}`,
      run: () => wm.openProject(p.slug),
    }));
    const actions: Item[] = [
      {
        id: 'action:theme',
        group: 'Actions',
        title: `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`,
        subtitle: 'Appearance',
        icon: theme === 'dark' ? 'sun' : 'moon',
        search: 'theme appearance dark light mode toggle',
        run: onToggleTheme,
      },
      {
        id: 'action:desktop',
        group: 'Actions',
        title: 'Show desktop',
        subtitle: 'Minimise all windows',
        icon: 'home',
        search: 'show desktop minimise minimize all windows hide home',
        run: wm.minimizeAll,
      },
    ];
    return [...apps, ...projs, ...actions];
  }, [wm.openApp, wm.openProject, wm.minimizeAll, theme, onToggleTheme]);

  const results = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return items;
    const q = terms.join(' ');
    return items
      .map((item, index) => ({ item, index, hay: `${item.title} ${item.search}`.toLowerCase() }))
      .filter(({ hay }) => terms.every((t) => hay.includes(t)))
      .sort((a, b) => {
        const rank = (x: typeof a) => (x.item.title.toLowerCase().startsWith(q) ? 0 : x.item.title.toLowerCase().includes(q) ? 1 : 2);
        return rank(a) - rank(b) || a.index - b.index;
      })
      .map(({ item }) => item);
  }, [items, query]);

  // Restore focus to wherever the user was — unless an item opened a window (it takes focus itself).
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    input.current?.focus();
    return () => {
      if (!skipRestore.current) previous?.focus?.();
    };
  }, []);

  useEffect(() => {
    document.getElementById(`palette-opt-${cursor}`)?.scrollIntoView({ block: 'nearest' });
  }, [cursor, results]);

  const run = (item: Item | undefined) => {
    if (!item) return;
    skipRestore.current = item.group !== 'Actions' || item.id === 'action:desktop';
    item.run();
    onClose();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        e.stopPropagation();
        return onClose();
      case 'ArrowDown':
        e.preventDefault();
        return setCursor((c) => (results.length === 0 ? 0 : (c + 1) % results.length));
      case 'ArrowUp':
        e.preventDefault();
        return setCursor((c) => (results.length === 0 ? 0 : (c - 1 + results.length) % results.length));
      case 'Enter':
        e.preventDefault();
        return run(results[cursor]);
      case 'Tab':
        e.preventDefault(); // keep focus inside the dialog
    }
  };

  let lastGroup = '';

  return (
    <div className="palette" onMouseDown={(e: { target: EventTarget; currentTarget: EventTarget }) => e.target === e.currentTarget && onClose()}>
      <div className="palette__box" role="dialog" aria-modal="true" aria-label="Command palette" onKeyDown={onKeyDown}>
        <div className="palette__field">
          <Icon name="search" size={16} />
          <input
            ref={input}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={results.length ? `palette-opt-${cursor}` : undefined}
            aria-label="Search applications, projects and actions"
            placeholder="Search apps, projects, actions…"
            value={query}
            autoComplete="off"
            spellCheck={false}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
          />
          <kbd className="kbd mono">esc</kbd>
        </div>

        <ul className="palette__list" id={listId} role="listbox" aria-label="Results">
          {results.length === 0 ? (
            <li className="palette__empty" role="presentation">
              No results for “{query}”
            </li>
          ) : (
            results.map((item, i) => {
              const header = item.group !== lastGroup && query.trim() === '' ? item.group : null;
              lastGroup = item.group;
              return (
                <li key={item.id} role="presentation">
                  {header ? <p className="palette__group mono">{header}</p> : null}
                  <div
                    id={`palette-opt-${i}`}
                    role="option"
                    aria-selected={i === cursor}
                    className="palette__item"
                    onMouseMove={() => cursor !== i && setCursor(i)}
                    onMouseDown={(e: { preventDefault: () => void }) => e.preventDefault()}
                    onClick={() => run(item)}
                  >
                    <Icon name={item.icon} size={17} />
                    <span className="palette__title">{item.title}</span>
                    <span className="palette__sub mono">{item.subtitle}</span>
                  </div>
                </li>
              );
            })
          )}
        </ul>

        <footer className="palette__foot mono">
          <span>
            <kbd className="kbd">↑</kbd> <kbd className="kbd">↓</kbd> navigate
          </span>
          <span>
            <kbd className="kbd">↵</kbd> open
          </span>
          <span>
            <kbd className="kbd">{isApplePlatform() ? '⌘K' : 'Ctrl K'}</kbd> toggle
          </span>
        </footer>
      </div>
    </div>
  );
}
