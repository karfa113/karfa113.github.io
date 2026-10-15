import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Icon } from './Icon';
import { useClock } from '../hooks/useClock';

/* ───────────────────────── Date helpers ───────────────────────── */

const DAY_MS = 86_400_000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const keyOf = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
/** Whole days from a to b, immune to daylight-saving shifts. */
const diffDays = (a: Date, b: Date) => Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / DAY_MS);

const dayOfYear = (d: Date) => diffDays(new Date(d.getFullYear(), 0, 1), d) + 1;
const daysInYear = (y: number) => diffDays(new Date(y, 0, 1), new Date(y + 1, 0, 1));

/** ISO-8601 week number (weeks start Monday; week 1 contains the first Thursday). */
function isoWeek(d: Date): number {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  return Math.ceil(((t.getTime() - Date.UTC(t.getUTCFullYear(), 0, 1)) / DAY_MS + 1) / 7);
}

/** First day of the week for the visitor's locale, as 1 (Mon) … 7 (Sun). Defaults to Monday. */
function firstWeekday(): number {
  try {
    const loc = new Intl.Locale(navigator.language) as unknown as { getWeekInfo?: () => { firstDay: number }; weekInfo?: { firstDay: number } };
    return loc.getWeekInfo?.().firstDay ?? loc.weekInfo?.firstDay ?? 1;
  } catch {
    return 1;
  }
}

const utcOffset = (d: Date) => {
  const m = -d.getTimezoneOffset();
  const sign = m < 0 ? '−' : '+';
  const abs = Math.abs(m);
  return `UTC${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
};

const timeFmt = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
const utcFmt = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23', timeZone: 'UTC' });
const longDate = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const monthFmt = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' });
const weekdayFmt = new Intl.DateTimeFormat(undefined, { weekday: 'short' });

function relative(days: number): string {
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  return days > 0 ? `In ${days} days` : `${-days} days ago`;
}

/* ───────────────────────── Panel ───────────────────────── */

function ClockPanel({ id, variant }: { id: string; variant: 'bar' | 'mobile' }) {
  const [now, setNow] = useState(() => new Date());
  const [selected, setSelected] = useState(() => startOfDay(new Date()));
  const [view, setView] = useState(() => ({ y: new Date().getFullYear(), m: new Date().getMonth() }));
  const [moveFocus, setMoveFocus] = useState(false);
  const grid = useRef<HTMLDivElement | null>(null);
  const first = useRef(firstWeekday()).current;

  // The panel only exists while open, so this tick costs nothing the rest of the time.
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const today = startOfDay(now);
  const tz = (() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local time';
    } catch {
      return 'Local time';
    }
  })();

  // 6 weeks always, so the panel never changes height between months.
  const offset = (new Date(view.y, view.m, 1).getDay() - (first % 7) + 7) % 7;
  const cells = Array.from({ length: 42 }, (_, i) => new Date(view.y, view.m, 1 - offset + i));
  const labels = Array.from({ length: 7 }, (_, i) => weekdayFmt.format(new Date(2025, 0, 5 + (first % 7) + i)));

  // Keep the visible month in step with keyboard selection, and move focus to the chosen day.
  const select = (d: Date, fromKeyboard = false) => {
    setSelected(d);
    setView({ y: d.getFullYear(), m: d.getMonth() });
    setMoveFocus(fromKeyboard);
  };
  useEffect(() => {
    if (!moveFocus) return;
    grid.current?.querySelector<HTMLElement>(`[data-date="${keyOf(selected)}"]`)?.focus();
    setMoveFocus(false);
  }, [moveFocus, selected]);

  const onGridKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const step: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    const days = step[e.key];
    if (days !== undefined) {
      e.preventDefault();
      select(addDays(selected, days), true);
    } else if (e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault();
      const dir = e.key === 'PageUp' ? -1 : 1;
      const target = new Date(selected.getFullYear(), selected.getMonth() + dir, 1);
      const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
      select(new Date(target.getFullYear(), target.getMonth(), Math.min(selected.getDate(), last)), true);
    }
  };

  const shiftMonth = (dir: number) => setView((v) => ({ y: new Date(v.y, v.m + dir, 1).getFullYear(), m: new Date(v.y, v.m + dir, 1).getMonth() }));
  const viewingToday = view.y === today.getFullYear() && view.m === today.getMonth();
  const rel = diffDays(today, selected);

  return (
    <div className="clockp" id={id} role="dialog" aria-label="Date and time" data-variant={variant}>
      <div className="clockp__now">
        <div className="clockp__time mono" aria-hidden="true">
          {timeFmt.format(now)}
        </div>
        <div className="clockp__date">{longDate.format(now)}</div>
      </div>

      <dl className="clockp__meta mono">
        <div>
          <dt>Time zone</dt>
          <dd>{tz}</dd>
        </div>
        <div>
          <dt>Offset</dt>
          <dd>{utcOffset(now)}</dd>
        </div>
        <div>
          <dt>UTC</dt>
          <dd>{utcFmt.format(now)}</dd>
        </div>
        <div>
          <dt>Week</dt>
          <dd>
            {isoWeek(now)} · day {dayOfYear(now)}/{daysInYear(now.getFullYear())}
          </dd>
        </div>
      </dl>

      <div className="clockp__cal">
        <div className="clockp__nav">
          <button type="button" className="clockp__btn" onClick={() => shiftMonth(-1)} aria-label="Previous month">
            <Icon name="back" size={16} />
          </button>
          <h2 className="clockp__month" aria-live="polite">
            {monthFmt.format(new Date(view.y, view.m, 1))}
          </h2>
          {!viewingToday || !sameDay(selected, today) ? (
            <button
              type="button"
              className="clockp__today mono"
              onClick={() => {
                setSelected(today);
                setView({ y: today.getFullYear(), m: today.getMonth() });
              }}
            >
              Today
            </button>
          ) : null}
          <button type="button" className="clockp__btn" onClick={() => shiftMonth(1)} aria-label="Next month">
            <Icon name="arrow" size={16} />
          </button>
        </div>

        <div className="clockp__week mono" aria-hidden="true">
          {labels.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </div>

        <div className="clockp__grid" role="grid" aria-label={monthFmt.format(new Date(view.y, view.m, 1))} ref={grid} onKeyDown={onGridKey}>
          {cells.map((d) => {
            const isSel = sameDay(d, selected);
            return (
              <button
                key={keyOf(d)}
                type="button"
                role="gridcell"
                className="clockp__day mono"
                data-date={keyOf(d)}
                data-today={sameDay(d, today)}
                data-selected={isSel}
                data-outside={d.getMonth() !== view.m}
                tabIndex={isSel ? 0 : -1}
                aria-selected={isSel}
                aria-current={sameDay(d, today) ? 'date' : undefined}
                aria-label={longDate.format(d)}
                onClick={() => select(d)}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>

        <p className="clockp__rel mono" aria-live="polite">
          <span>{relative(rel)}</span>
          <span>
            {longDate.format(selected)} · week {isoWeek(selected)}
          </span>
        </p>
      </div>
    </div>
  );
}

/* ───────────────────────── Trigger ───────────────────────── */

/** The date/time readout in the system bar. Click it to open the clock and calendar. */
export function ClockMenu({ variant }: { variant: 'bar' | 'mobile' }) {
  const { time, date } = useClock();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const panelId = useId();

  // Listeners exist only while the panel is open.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onDown, true);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="clockm" ref={wrap} data-variant={variant}>
      <button
        type="button"
        ref={trigger}
        className={variant === 'bar' ? 'bar__clock' : 'm-bar__time'}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label="Open clock and calendar"
        onClick={() => setOpen((o) => !o)}
      >
        {variant === 'bar' ? <span className="bar__date mono">{date}</span> : null}
        <span className="bar__time mono">{time}</span>
      </button>
      {open ? <ClockPanel id={panelId} variant={variant} /> : null}
    </div>
  );
}