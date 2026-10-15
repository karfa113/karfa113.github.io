import { createContext, useContext, useEffect } from 'react';

/** Lets an app write a short status string into its window's footer (e.g. "6 projects"). */
export const WindowStatusContext = createContext<(text: string) => void>(() => {});

export function useWindowStatus(text: string): void {
  const set = useContext(WindowStatusContext);
  useEffect(() => {
    set(text);
  }, [set, text]);
}
