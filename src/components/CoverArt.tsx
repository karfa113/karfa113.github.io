import type { Asset } from '../types';

/** Deterministic number from a string, so each placeholder gets its own quiet composition. */
const hash = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};

interface CoverProps {
  seed: string;
  asset?: Asset;
  label?: string;
  className?: string;
}

/**
 * A project cover. If a real image is supplied it is lazy-loaded; otherwise an
 * abstract, clearly-labelled placeholder is drawn — never a fake screenshot.
 */
export function CoverArt({ seed, asset, label = 'Cover placeholder', className = '' }: CoverProps) {
  if (asset?.src) {
    return (
      <figure className={`cover ${className}`}>
        <img src={asset.src} alt={asset.alt} loading="lazy" decoding="async" />
      </figure>
    );
  }

  const h = hash(seed);
  const cx = 20 + (h % 60);
  const cy = 25 + ((h >> 3) % 50);
  const r1 = 14 + ((h >> 6) % 14);
  const rot = (h >> 9) % 60;
  const bars = 3 + ((h >> 12) % 3);

  return (
    <figure className={`cover cover--placeholder ${className}`} aria-label={asset?.alt ?? label}>
      <svg viewBox="0 0 100 62" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeWidth="0.35">
          <circle cx={cx} cy={cy} r={r1} />
          <circle cx={cx} cy={cy} r={r1 * 1.9} opacity="0.55" />
          <circle cx={cx} cy={cy} r={r1 * 2.9} opacity="0.3" />
          <rect x="52" y="12" width="34" height="38" rx="2" transform={`rotate(${rot - 30} 69 31)`} opacity="0.7" />
          {Array.from({ length: bars }, (_, i) => (
            <path key={i} d={`M8 ${50 + i * 3.2}H${30 + ((h >> (i + 2)) % 40)}`} opacity={0.6 - i * 0.12} />
          ))}
        </g>
      </svg>
      <figcaption className="cover__label mono">{asset?.caption ?? label}</figcaption>
    </figure>
  );
}
