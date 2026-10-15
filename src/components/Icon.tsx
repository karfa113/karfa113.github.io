import type { ReactNode } from 'react';

/**
 * One coherent icon family: 24×24 grid, 1.5 stroke, round caps and joins, currentColor.
 * App glyphs share names with AppId so any app can render its own icon.
 */
const GLYPHS = {
  // ── Applications ───────────────────────────────
  about: (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c.8-3.6 3.5-5.5 7-5.5s6.2 1.9 7 5.5" />
    </>
  ),
  design: (
    <>
      <path d="M12 3l5.5 7.5L12 21 6.5 10.5 12 3z" />
      <circle cx="12" cy="11" r="1.4" />
      <path d="M12 12.4V21" />
    </>
  ),
  code: (
    <>
      <path d="M8.5 7l-5 5 5 5" />
      <path d="M15.5 7l5 5-5 5" />
      <path d="M13.5 5l-3 14" />
    </>
  ),
  projects: (
    <>
      <path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2.2h7a2 2 0 0 1 2 2v7.8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />
      <path d="M8 13h8" />
    </>
  ),
  academics: (
    <>
      <path d="M2.5 9.5L12 5l9.5 4.5L12 14z" />
      <path d="M6.5 11.8V16c0 1.2 2.5 2.5 5.5 2.5s5.5-1.3 5.5-2.5v-4.2" />
      <path d="M21.5 9.5V15" />
    </>
  ),
  experience: (
    <>
      <circle cx="6" cy="6.5" r="2" />
      <circle cx="6" cy="17.5" r="2" />
      <path d="M6 8.5v7" />
      <path d="M11.5 6.5H20" />
      <path d="M11.5 12H17" />
      <path d="M11.5 17.5H20" />
    </>
  ),
  resume: (
    <>
      <path d="M6.5 3.5H14l4 4V20a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 20V4a.5.5 0 0 1 .5-.5z" />
      <path d="M14 3.5V8h4" />
      <path d="M9 12.5h6M9 15.5h6M9 9.5h2.5" />
    </>
  ),
  contact: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="M3.5 7l8.5 6 8.5-6" />
    </>
  ),
  archive: (
    <>
      <rect x="3" y="4.5" width="18" height="4.5" rx="1" />
      <path d="M5 9v9.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9" />
      <path d="M10 13h4" />
    </>
  ),

  // ── Interface ──────────────────────────────────
  close: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  minimize: <path d="M6.5 12h11" />,
  maximize: <rect x="6.5" y="6.5" width="11" height="11" rx="1.5" />,
  restore: (
    <>
      <path d="M9.5 9V7a1 1 0 0 1 1-1H17a1 1 0 0 1 1 1v6.5a1 1 0 0 1-1 1h-2" />
      <rect x="6" y="9.5" width="8.5" height="8.5" rx="1.5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20l-4.2-4.2" />
    </>
  ),
  command: <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="3.8" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" />
    </>
  ),
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />,
  github: (
    <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
  ),
  linkedin: (
    <>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </>
  ),
  instagram: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  link: (
    <>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </>
  ),
  copy: (
    <>
      <rect x="8.5" y="8.5" width="11" height="11" rx="2" />
      <path d="M15.5 8.5v-2a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  external: (
    <>
      <path d="M14 4h6v6" />
      <path d="M20 4l-9 9" />
      <path d="M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10" />
    </>
  ),
  back: <path d="M14.5 6l-6 6 6 6" />,
  chevron: <path d="M9.5 6l6 6-6 6" />,
  home: (
    <>
      <path d="M4 11l8-6.5 8 6.5" />
      <path d="M6 10v9.5h12V10" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1" />
    </>
  ),
  list: <path d="M9 6.5h11M9 12h11M9 17.5h11M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01" />,
  download: (
    <>
      <path d="M12 4v11" />
      <path d="M7.5 11l4.5 4.5 4.5-4.5" />
      <path d="M5 19.5h14" />
    </>
  ),
  folder: <path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2.2h7a2 2 0 0 1 2 2v7.8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />,
  file: (
    <>
      <path d="M6.5 3.5H14l4 4V20a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 20V4a.5.5 0 0 1 .5-.5z" />
      <path d="M14 3.5V8h4" />
    </>
  ),
  sort: <path d="M8 5v14M8 5L4.5 8.5M8 5l3.5 3.5M16 19V5M16 19l-3.5-3.5M16 19l3.5-3.5" />,
  terminal: (
    <>
      <path d="M5 7l5 5-5 5" />
      <path d="M12.5 18H19" />
    </>
  ),
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof GLYPHS;

interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function Icon({ name, size = 18, strokeWidth = 1.5, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {GLYPHS[name]}
    </svg>
  );
}
