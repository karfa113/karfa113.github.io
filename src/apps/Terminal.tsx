import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { useWindowManager } from '../state/windowManager';
import { useWindowStatus } from '../hooks/useWindowStatus';
import { complete, pathStr, run, WELCOME, type Line, type Seg } from './engine';

interface Entry {
  id: number;
  /** Present for commands the user typed; absent for the welcome banner. */
  input?: string;
  cwd: string[];
  out: Line[];
}

const MAX_ENTRIES = 200;

function Prompt({ cwd }: { cwd: string[] }) {
  return (
    <span className="term__prompt">
      <span className="term__user">guest@mono</span>
      <span className="term__colon">:</span>
      <span className="term__cwd">{pathStr(cwd)}</span>
      <span className="term__sigil">$</span>
    </span>
  );
}

export default function Terminal() {
  const wm = useWindowManager();
  const [cwd, setCwd] = useState<string[]>([]);
  const [entries, setEntries] = useState<Entry[]>([{ id: 0, cwd: [], out: WELCOME }]);
  const [value, setValue] = useState('');
  const [hints, setHints] = useState<string[]>([]);
  const history = useRef<string[]>([]);
  const cursor = useRef(0); // position while browsing history (history.length = "new line")
  const draft = useRef('');
  const nextId = useRef(1);
  const input = useRef<HTMLInputElement | null>(null);
  const scroller = useRef<HTMLDivElement | null>(null);
  const cwdRef = useRef<string[]>([]);

  useWindowStatus(pathStr(cwd));

  // Focus on open — but not on touch devices, where it would pop the keyboard unprompted.
  useEffect(() => {
    if (window.matchMedia('(pointer: fine)').matches) input.current?.focus();
  }, []);

  // Keep the newest output in view.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries, hints]);

  const push = (entry: Omit<Entry, 'id'>) =>
    setEntries((prev) => [...prev, { ...entry, id: nextId.current++ }].slice(-MAX_ENTRIES));

  const submit = async () => {
    const line = value;
    const trimmed = line.trim();
    setValue('');
    setHints([]);
    draft.current = '';
    if (!trimmed) {
      push({ input: '', cwd, out: [] });
      cursor.current = history.current.length;
      return;
    }
    if (history.current[history.current.length - 1] !== trimmed) history.current.push(trimmed);
    cursor.current = history.current.length;

    let cleared = false;
    const out = await run(trimmed, {
      cwd: cwdRef.current,
      setCwd: (next) => {
        cwdRef.current = next;
        setCwd(next);
      },
      clear: () => {
        cleared = true;
      },
      history: history.current,
      wm,
    });
    if (cleared) {
      setEntries([]);
      return;
    }
    push({ input: trimmed, cwd, out });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void submit();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const h = history.current;
      if (!h.length) return;
      if (cursor.current === h.length) draft.current = value;
      cursor.current = Math.min(h.length, Math.max(0, cursor.current + (e.key === 'ArrowUp' ? -1 : 1)));
      setValue(cursor.current === h.length ? draft.current : (h[cursor.current] ?? ''));
      setHints([]);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const res = complete(value, cwd);
      setValue(res.value);
      setHints(res.options);
    } else if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      setEntries([]);
      setHints([]);
    } else if (e.ctrlKey && e.key.toLowerCase() === 'c') {
      // Only cancel the line when nothing is selected, so copy still works.
      if (input.current && input.current.selectionStart !== input.current.selectionEnd) return;
      e.preventDefault();
      push({ input: `${value}^C`, cwd, out: [] });
      setValue('');
      setHints([]);
      cursor.current = history.current.length;
    } else if (e.key === 'Escape') {
      setHints([]);
    }
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (hints.length) setHints([]);
  };

  const renderSeg = (seg: Seg, i: number) => {
    const cls = `term__seg${seg.tone ? ` term__seg--${seg.tone}` : ''}`;
    if (seg.href) {
      const external = /^https?:/.test(seg.href);
      return (
        <a key={i} className={`${cls} term__link`} href={seg.href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {seg.text}
        </a>
      );
    }
    if (seg.app || seg.slug) {
      const open = () => (seg.slug ? wm.openProject(seg.slug) : seg.app ? wm.openApp(seg.app) : undefined);
      return (
        <button key={i} type="button" className={`${cls} term__link`} onClick={open}>
          {seg.text}
        </button>
      );
    }
    return (
      <span key={i} className={cls}>
        {seg.text}
      </span>
    );
  };

  return (
    <div
      className="term"
      ref={scroller}
      onClick={() => {
        // A click focuses the prompt, unless the user is selecting text.
        if (window.getSelection()?.isCollapsed ?? true) input.current?.focus();
      }}
    >
      <div className="term__log" role="log" aria-live="polite" aria-label="Terminal output">
        {entries.map((entry) => (
          <div className="term__entry" key={entry.id}>
            {entry.input !== undefined ? (
              <div className="term__line">
                <Prompt cwd={entry.cwd} />
                <span className="term__typed">{entry.input}</span>
              </div>
            ) : null}
            {entry.out.map((line, i) => (
              <div className="term__line term__line--out" key={i}>
                {line.length ? line.map(renderSeg) : ' '}
              </div>
            ))}
          </div>
        ))}
      </div>

      {hints.length ? (
        <div className="term__hints" aria-hidden="true">
          {hints.join('   ')}
        </div>
      ) : null}

      <label className="term__line term__input-row">
        <Prompt cwd={cwd} />
        <input
          ref={input}
          className="term__input"
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          aria-label="Terminal input"
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
        />
      </label>
    </div>
  );
}