import { useMemo } from 'react';

/**
 * "Signal ridges": a calm, layered landscape drawn from the accent colour.
 * Thirty ridge lines rise from the bottom edge, fading in toward the viewer, in front of a soft glow
 * and a partly hidden ring. Generated once (deterministic — no randomness), so it never shifts between
 * renders. Purely decorative (aria-hidden); colours come from CSS tokens, so it follows theme + accent.
 */
const W = 1600;
const H = 1000;
const ROWS = 30;
const STEP = 16;
const PEAK_X = 900;

const noise = (x: number, i: number) =>
  Math.sin(x * 0.0042 + i * 0.9) * 0.5 + Math.sin(x * 0.0113 - i * 1.7) * 0.3 + Math.sin(x * 0.0271 + i * 2.3) * 0.2;

const envelope = (x: number) => 0.32 + 0.68 * Math.exp(-(((x - PEAK_X) / 430) ** 2));

function buildRidges() {
  return Array.from({ length: ROWS }, (_, i) => {
    const t = i / (ROWS - 1); // 0 = far, 1 = near
    const base = 440 + t * 520;
    const amp = 46 + t * 150;
    let d = `M0 ${H}`;
    for (let x = 0; x <= W; x += STEP) {
      const y = base - amp * envelope(x) * (0.5 + 0.5 * noise(x, i));
      d += ` L${x} ${y.toFixed(1)}`;
    }
    d += ` L${W} ${H}Z`;
    return { d, opacity: 0.1 + 0.55 * t ** 1.5 };
  });
}

export function Wallpaper() {
  const ridges = useMemo(buildRidges, []);

  return (
    <div className="wallpaper" aria-hidden="true">
      <svg className="wallpaper__art" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="wp-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0" style={{ stopColor: 'var(--accent)', stopOpacity: 0.42 }} />
            <stop offset="0.45" style={{ stopColor: 'var(--accent)', stopOpacity: 0.12 }} />
            <stop offset="1" style={{ stopColor: 'var(--accent)', stopOpacity: 0 }} />
          </radialGradient>
          <linearGradient id="wp-fill" gradientUnits="userSpaceOnUse" x1="0" y1="380" x2="0" y2={H}>
            <stop offset="0" style={{ stopColor: 'color-mix(in srgb, var(--accent) 9%, var(--bg))' }} />
            <stop offset="0.5" style={{ stopColor: 'var(--bg)' }} />
            <stop offset="1" style={{ stopColor: 'var(--bg)' }} />
          </linearGradient>
        </defs>

        {/* glow + a ring that the nearest ridges partly cover */}
        <circle cx={PEAK_X} cy="440" r="520" fill="url(#wp-glow)" />
        <g fill="none" stroke="var(--accent)" strokeWidth="1">
          <circle cx={PEAK_X} cy="440" r="150" opacity="0.38" />
          <circle cx={PEAK_X} cy="440" r="250" opacity="0.2" />
          <circle cx={PEAK_X} cy="440" r="380" opacity="0.1" />
        </g>

        {/* ridges, far → near; each fill hides the lines behind it */}
        <g className="wallpaper__ridges">
          {ridges.map((r, i) => (
            <path key={i} d={r.d} fill="url(#wp-fill)" stroke="var(--accent)" strokeWidth="1" strokeOpacity={r.opacity} />
          ))}
        </g>

        {/* registration marks */}
        <g fill="none" stroke="var(--wall-line)" strokeWidth="1">
          <path d="M72 120h24M84 108v24" />
          <path d="M1528 120h-24M1516 108v24" />
        </g>
      </svg>
      <div className="wallpaper__grain" />
      <div className="wallpaper__vignette" />
    </div>
  );
}