import { useCallback, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

const THEME_COLOR: Record<Theme, string> = { dark: '#101112', light: '#e9e7e1' };

export const currentTheme = (): Theme => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');

/** Applies a theme everywhere and persists it (storage access is guarded — it can throw). */
export function applyTheme(next: Theme): void {
  document.documentElement.dataset.theme = next;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[next]);
  try {
    localStorage.setItem('mono-os-theme', next);
  } catch {
    /* storage unavailable (private mode) — the theme still applies for this session */
  }
}

/**
 * Dark by default. The <html data-theme> attribute is the single source of truth, so anything that
 * changes it (the system bar, the command palette, the terminal) keeps every consumer in sync.
 */
export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  const [theme, setTheme] = useState<Theme>(currentTheme);

  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(currentTheme()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = useCallback(() => applyTheme(currentTheme() === 'dark' ? 'light' : 'dark'), []);

  return { theme, toggleTheme };
}