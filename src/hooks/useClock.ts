import { useEffect, useState } from 'react';

const timeFmt = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' });
const dateFmt = new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short' });

/** Live local time + date. Re-renders only when the visible minute changes. */
export function useClock(): { time: string; date: string } {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return { time: timeFmt.format(now), date: dateFmt.format(now) };
}