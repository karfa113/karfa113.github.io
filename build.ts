// Production build: bundles index.html (+ TSX, CSS, lazy chunks) into ./dist with Bun.
import { cp, rm } from 'node:fs/promises';

await rm('dist', { recursive: true, force: true });

const result = await Bun.build({
  entrypoints: ['index.html'],
  outdir: 'dist',
  minify: true,
  splitting: true,
  publicPath: './',
  define: { 'process.env.NODE_ENV': '"production"' },
});

if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

// Static assets (favicon, resume.pdf, project images, …) are copied as-is.
await cp('public', 'dist', { recursive: true });

const kb = (n: number) => `${(n / 1024).toFixed(1)} kB`;
for (const out of result.outputs) console.log(out.path.replace(`${process.cwd()}/`, ''), kb(out.size));
console.log('Build complete → dist/');
