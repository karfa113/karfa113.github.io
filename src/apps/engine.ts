import type { AppId, Project } from '../types';
import { APPS, visibleApps } from '../data/apps';
import { profile } from '../data/profile';
import { projects, getProject } from '../data/projects';
import { academicFolders, education } from '../data/academics';
import { experience } from '../data/experience';
import { archive } from '../data/archive';
import { applyTheme, currentTheme } from '../hooks/useTheme';
import type { WindowManagerApi } from '../state/windowManager';

/* ───────────────────────── Output model ───────────────────────── */

export type Tone = 'dim' | 'err' | 'ok' | 'accent' | 'head';

/** One styled piece of a line. A segment can be a link: external (href), an app (app) or a project (slug). */
export interface Seg {
  text: string;
  tone?: Tone;
  href?: string;
  app?: AppId;
  slug?: string;
}
export type Line = Seg[];

const t = (text: string, tone?: Tone): Line => [{ text, tone }];
const err = (text: string): Line[] => [t(text, 'err')];
const ok = (text: string): Line[] => [t(text, 'ok')];
const blank: Line = [{ text: '' }];
const kv = (key: string, value: string, width = 10): Line => [{ text: key.padEnd(width), tone: 'accent' }, { text: value }];

/* ───────────────────────── Virtual file system ─────────────────────────
   Built from the real data modules, so `ls`, `cat` and `open` always reflect the portfolio. */

interface Dir {
  kind: 'dir';
  children: Record<string, Node>;
  app?: AppId;
}
interface File {
  kind: 'file';
  content: string;
  app?: AppId;
  slug?: string;
}
type Node = Dir | File;

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'item';

const file = (content: string, extra: Partial<File> = {}): File => ({ kind: 'file', content, ...extra });
const dir = (children: Record<string, Node>, app?: AppId): Dir => ({ kind: 'dir', children, app });

function projectText(p: Project): string {
  const stack = [...(p.tools ?? []), ...(p.tech ?? [])];
  return [
    p.title,
    `${p.category} · ${p.year} · ${p.status}`,
    '',
    p.summary,
    ...(p.role ? ['', `Role:    ${p.role}`] : []),
    ...(stack.length ? [`Stack:   ${stack.join(', ')}`] : []),
    ...(p.problem ? ['', `Problem: ${p.problem}`] : []),
    '',
    `Repo:    ${p.repoUrl ?? '— none linked'}`,
    `Demo:    ${p.demoUrl ?? '— none linked'}`,
    ...(p.sample ? ['', '(sample entry — replace it in src/data/projects.ts)'] : []),
  ].join('\n');
}

const projectDir = (list: Project[], app?: AppId): Dir =>
  dir(
    Object.fromEntries(list.map((p) => [`${p.slug}.md`, file(projectText(p), { slug: p.slug, app: p.kind })])),
    app,
  );

function buildVfs(): Dir {
  const about = dir(
    {
      'intro.txt': file(profile.intro, { app: 'about' }),
      'philosophy.txt': file(profile.philosophy, { app: 'about' }),
      'building.txt': file(profile.building.map((b) => `- ${b}`).join('\n'), { app: 'about' }),
      'approach.txt': file(profile.approach.map((a) => `${a.title}\n  ${a.body}`).join('\n\n'), { app: 'about' }),
      'exploring.txt': file(profile.exploring.map((e) => `- ${e}`).join('\n'), { app: 'about' }),
    },
    'about',
  );

  const academics = dir(
    {
      'education.txt': file(`${education.institution}\n${education.program}\n${education.period}\n${education.note}`, { app: 'academics' }),
      ...Object.fromEntries(
        academicFolders.map((f) => [
          f.id,
          dir(
            Object.fromEntries(
              f.items.map((i) => [`${slugify(i.title)}.txt`, file([i.title, i.meta, i.note].filter(Boolean).join('\n'), { app: 'academics' })]),
            ),
            'academics',
          ),
        ]),
      ),
    },
    'academics',
  );

  const exp = dir(
    Object.fromEntries(
      experience.map((e) => [
        `${slugify(e.organization)}-${e.id}.txt`,
        file(
          [
            `${e.role} — ${e.organization}`,
            `${e.start} → ${e.end}`,
            ...(e.summary ? ['', e.summary] : []),
            '',
            'Responsibilities',
            ...e.responsibilities.map((r) => `  - ${r}`),
            ...(e.contributions?.length ? ['', 'Contributions', ...e.contributions.map((c) => `  - ${c}`)] : []),
          ].join('\n'),
          { app: 'experience' },
        ),
      ]),
    ),
    'experience',
  );

  const resume = dir(
    {
      'summary.txt': file(profile.resume.summary, { app: 'resume' }),
      'skills.txt': file(profile.resume.skills.map((g) => `${g.group}: ${g.items.join(', ')}`).join('\n'), { app: 'resume' }),
    },
    'resume',
  );

  const channels = channelList();
  const contact = dir(
    channels.some((c) => c.value)
      ? Object.fromEntries(channels.filter((c) => c.value).map((c) => [`${c.id}.txt`, file(c.value, { app: 'contact' })]))
      : { 'README.txt': file('No contact channels are set yet. Add your email and profile links in src/data/profile.ts.', { app: 'contact' }) },
    'contact',
  );

  const design = projectDir(projects.filter((p) => p.kind === 'design'), 'design');
  const code = projectDir(projects.filter((p) => p.kind === 'code'), 'code');
  const all = projectDir(projects, 'projects');

  const root: Record<string, Node> = {
    'README.md': file('MONO OS — a portfolio shaped like a tiny operating system.\nType `help` to see what this terminal can do, or `open about` to start.'),
    about,
    design,
    code,
    projects: all,
    academics,
    experience: exp,
    resume,
    contact,
  };
  if (visibleApps().some((a) => a.id === 'archive')) {
    root.archive = dir(
      Object.fromEntries(
        archive.map((a) => [`${slugify(a.title)}.txt`, file(`${a.title}\n${a.kind}${a.year ? ` · ${a.year}` : ''}\n\n${a.note}${a.url ? `\n${a.url}` : ''}`, { app: 'archive' })]),
      ),
      'archive',
    );
  }
  return dir(root);
}

let vfsCache: Dir | null = null;
const vfs = (): Dir => (vfsCache ??= buildVfs());

/* ───────────────────────── Paths ───────────────────────── */

export const pathStr = (segs: string[]): string => '~' + (segs.length ? `/${segs.join('/')}` : '');

/** Resolves `input` against `cwd`. `~` and a leading `/` both mean the root. */
export function resolvePath(cwd: string[], input: string): string[] {
  const absolute = input.startsWith('~') || input.startsWith('/');
  const parts = absolute ? [] : [...cwd];
  for (const seg of input.replace(/^~\/?|^\//, '').split('/')) {
    if (!seg || seg === '.') continue;
    if (seg === '..') parts.pop();
    else parts.push(seg);
  }
  return parts;
}

function lookup(segs: string[]): Node | undefined {
  let node: Node = vfs();
  for (const seg of segs) {
    if (node.kind !== 'dir') return undefined;
    const next: Node | undefined = node.children[seg];
    if (!next) return undefined;
    node = next;
  }
  return node;
}

/** True if the directory at `segs` exists. Used by the UI to validate the working directory. */
export const dirExists = (segs: string[]): boolean => lookup(segs)?.kind === 'dir';

const sortEntries = (a: [string, Node], b: [string, Node]) =>
  a[1].kind === b[1].kind ? a[0].localeCompare(b[0]) : a[1].kind === 'dir' ? -1 : 1;

const isUrl = (s: string) => /^(https?:\/\/|mailto:)\S+$/.test(s);

/* ───────────────────────── Context ───────────────────────── */

export interface Ctx {
  cwd: string[];
  setCwd: (cwd: string[]) => void;
  clear: () => void;
  history: string[];
  wm: Pick<WindowManagerApi, 'openApp' | 'openProject' | 'close' | 'windows' | 'viewport'>;
}

interface Cmd {
  usage: string;
  desc: string;
  examples?: string[];
  run: (args: string[], ctx: Ctx) => Line[] | Promise<Line[]>;
}

const SESSION_START = Date.now();
function uptime(): string {
  const s = Math.floor((Date.now() - SESSION_START) / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  return h ? `${h}h ${m % 60}m` : m ? `${m}m ${s % 60}s` : `${s}s`;
}

function channelList(): { id: string; label: string; value: string; href: string }[] {
  return [
    { id: 'email', label: 'Email', value: profile.email, href: profile.email ? `mailto:${profile.email}` : '' },
    { id: 'github', label: 'GitHub', value: profile.github, href: profile.github },
    { id: 'linkedin', label: 'LinkedIn', value: profile.linkedin, href: profile.linkedin },
    ...profile.socials.map((s) => ({ id: s.id, label: s.label, value: s.url, href: s.url })),
  ];
}

/** Splits a command line into words, honouring "double" and 'single' quotes. */
export function tokenize(input: string): string[] {
  const out: string[] = [];
  for (const m of input.matchAll(/"([^"]*)"|'([^']*)'|(\S+)/g)) out.push(m[1] ?? m[2] ?? m[3] ?? '');
  return out;
}

const treeLines = (node: Dir, prefix = ''): Line[] =>
  Object.entries(node.children)
    .sort(sortEntries)
    .flatMap(([name, child], i, arr): Line[] => {
      const last = i === arr.length - 1;
      const row: Line = [
        { text: prefix + (last ? '└── ' : '├── '), tone: 'dim' },
        { text: name + (child.kind === 'dir' ? '/' : ''), tone: child.kind === 'dir' ? 'accent' : undefined },
      ];
      return child.kind === 'dir' ? [row, ...treeLines(child, prefix + (last ? '    ' : '│   '))] : [row];
    });

function openTarget(raw: string, ctx: Ctx): Line[] {
  const q = raw.trim().toLowerCase();
  if (!q) return err('usage: open <app | project | path | github | linkedin | email>');

  if (q === 'github' || q === 'linkedin' || q === 'email') {
    const url = q === 'email' ? (profile.email ? `mailto:${profile.email}` : '') : profile[q];
    if (!url) return err(`open: ${q} is not set yet — add it in src/data/profile.ts`);
    if (q === 'email') window.location.href = url;
    else window.open(url, '_blank', 'noopener,noreferrer');
    return ok(`opening ${q}…`);
  }

  const app = visibleApps().find((a) => a.id === q || a.title.toLowerCase() === q || a.title.toLowerCase().replace(/\s+/g, '') === q);
  if (app) {
    ctx.wm.openApp(app.id);
    return ok(`opened ${app.title}`);
  }

  const project = getProject(q) ?? projects.find((p) => p.title.toLowerCase().includes(q) || p.slug.includes(q));
  if (project) {
    ctx.wm.openProject(project.slug);
    return ok(`opened ${project.title}`);
  }

  const node = lookup(resolvePath(ctx.cwd, raw.trim()));
  if (node?.kind === 'file' && node.slug) {
    ctx.wm.openProject(node.slug);
    return ok(`opened ${node.slug}`);
  }
  if (node?.app) {
    ctx.wm.openApp(node.app);
    return ok(`opened ${APPS.find((a) => a.id === node.app)?.title ?? node.app}`);
  }
  return err(`open: nothing called "${raw.trim()}" — try \`apps\` or \`projects\``);
}

/* ───────────────────────── Commands ───────────────────────── */

const GROUPS: { title: string; cmds: string[] }[] = [
  { title: 'Explore', cmds: ['about', 'projects', 'apps', 'skills', 'contact', 'open'] },
  { title: 'Files', cmds: ['ls', 'cd', 'pwd', 'cat', 'tree', 'find'] },
  { title: 'System', cmds: ['theme', 'neofetch', 'date', 'uptime', 'history', 'shortcuts', 'clear', 'exit'] },
  { title: 'Extras', cmds: ['copy-email', 'echo', 'sudo'] },
];

const CMDS: Record<string, Cmd> = {
  help: {
    usage: 'help [command]',
    desc: 'Show this list, or details for one command',
    examples: ['help', 'help open'],
    run: ([name]) => {
      if (name) {
        const c = CMDS[name];
        if (!c) return err(`help: no such command: ${name}`);
        return [kv('usage', c.usage, 9), kv('about', c.desc, 9), ...(c.examples ? [kv('try', c.examples.join('   '), 9)] : [])];
      }
      const lines: Line[] = [t('Available commands', 'head'), blank];
      for (const g of GROUPS) {
        lines.push(t(g.title, 'dim'));
        for (const name of g.cmds) lines.push([{ text: `  ${name.padEnd(12)}`, tone: 'accent' }, { text: CMDS[name]?.desc ?? '', tone: undefined }]);
        lines.push(blank);
      }
      lines.push(t('Tab completes · ↑/↓ browse history · Ctrl+L clears · `help <command>` for details', 'dim'));
      return lines;
    },
  },

  about: {
    usage: 'about',
    desc: 'Who is behind this portfolio',
    run: () => [
      t(profile.name, 'head'),
      t(profile.role, 'dim'),
      blank,
      t(profile.intro),
      blank,
      [{ text: 'More: ', tone: 'dim' }, { text: 'cat ~/about/philosophy.txt', tone: 'accent' }, { text: '  ·  ', tone: 'dim' }, { text: 'open about', tone: 'accent' }],
    ],
  },

  skills: {
    usage: 'skills',
    desc: 'Skills grouped by area',
    run: () => profile.resume.skills.flatMap((g): Line[] => [kv(g.group, g.items.join(', '), 14)]),
  },

  projects: {
    usage: 'projects [design|code]',
    desc: 'List projects (click one to open it)',
    examples: ['projects', 'projects code'],
    run: ([kind]) => {
      if (kind && kind !== 'design' && kind !== 'code') return err('usage: projects [design|code]');
      const list = projects.filter((p) => !kind || p.kind === kind);
      if (!list.length) return [t('No projects yet — add some in src/data/projects.ts', 'dim')];
      return [
        ...list.map((p): Line => [
          { text: `${p.kind.padEnd(7)}`, tone: 'dim' },
          { text: p.title, slug: p.slug },
          { text: `  ${p.year} · ${p.status}`, tone: 'dim' },
        ]),
        blank,
        t(`${list.length} project${list.length === 1 ? '' : 's'}`, 'dim'),
      ];
    },
  },

  apps: {
    usage: 'apps',
    desc: 'List applications (click one to open it)',
    run: () =>
      visibleApps().map((a): Line => [
        { text: a.id.padEnd(12), tone: 'accent', app: a.id },
        { text: a.blurb, tone: 'dim' },
      ]),
  },

  contact: {
    usage: 'contact',
    desc: 'Ways to reach me',
    run: () => {
      const channels = channelList();
      const set = channels.filter((c) => c.value);
      if (!set.length) return [t('No contact channels are set yet.', 'dim'), t('Add your email and links in src/data/profile.ts', 'dim')];
      return [...set.map((c): Line => [{ text: c.label.padEnd(10), tone: 'accent' }, { text: c.value, href: c.href }]), blank, t(profile.collaboration, 'dim')];
    },
  },

  open: {
    usage: 'open <app | project | path | github | linkedin | email>',
    desc: 'Open an app window, a project, or a link',
    examples: ['open design', 'open github', 'open about'],
    run: (args, ctx) => openTarget(args.join(' '), ctx),
  },

  ls: {
    usage: 'ls [-l] [path]',
    desc: 'List files and folders',
    examples: ['ls', 'ls -l ~/code'],
    run: (args, ctx) => {
      const long = args.includes('-l');
      const target = args.find((a) => !a.startsWith('-')) ?? '.';
      const node = lookup(resolvePath(ctx.cwd, target));
      if (!node) return err(`ls: cannot access '${target}': no such file or directory`);
      if (node.kind === 'file') return [t(target)];
      const entries = Object.entries(node.children).sort(sortEntries);
      if (!entries.length) return [t('(empty)', 'dim')];
      if (!long) return [entries.flatMap(([name, n], i): Seg[] => [{ text: name + (n.kind === 'dir' ? '/' : ''), tone: n.kind === 'dir' ? 'accent' : undefined }, { text: i < entries.length - 1 ? '   ' : '' }])];
      return entries.map(([name, n]): Line => [
        { text: `${n.kind === 'dir' ? 'd' : '-'}r--  ${String(n.kind === 'dir' ? Object.keys(n.children).length : n.content.length).padStart(5)}  `, tone: 'dim' },
        { text: name + (n.kind === 'dir' ? '/' : ''), tone: n.kind === 'dir' ? 'accent' : undefined },
      ]);
    },
  },

  cd: {
    usage: 'cd [path]',
    desc: 'Change directory (no argument goes home)',
    examples: ['cd code', 'cd ..', 'cd ~'],
    run: ([target], ctx) => {
      const next = target ? resolvePath(ctx.cwd, target) : [];
      const node = lookup(next);
      if (!node) return err(`cd: no such directory: ${target}`);
      if (node.kind !== 'dir') return err(`cd: not a directory: ${target}`);
      ctx.setCwd(next);
      return [];
    },
  },

  pwd: { usage: 'pwd', desc: 'Print the current directory', run: (_a, ctx) => [t(pathStr(ctx.cwd))] },

  cat: {
    usage: 'cat <file>',
    desc: 'Print a file',
    examples: ['cat ~/about/intro.txt', 'cat README.md'],
    run: (args, ctx) => {
      if (!args.length) return err('usage: cat <file>');
      return args.flatMap((a): Line[] => {
        const node = lookup(resolvePath(ctx.cwd, a));
        if (!node) return err(`cat: ${a}: no such file`);
        if (node.kind === 'dir') return err(`cat: ${a}: is a directory`);
        return node.content.split('\n').map((l): Line => (isUrl(l.trim()) ? [{ text: l, href: l.trim() }] : t(l)));
      });
    },
  },

  tree: {
    usage: 'tree [path]',
    desc: 'Show the folder structure',
    run: ([target], ctx) => {
      const segs = resolvePath(ctx.cwd, target ?? '.');
      const node = lookup(segs);
      if (!node) return err(`tree: ${target}: no such directory`);
      if (node.kind !== 'dir') return [t(target ?? '')];
      return [t(pathStr(segs), 'accent'), ...treeLines(node)];
    },
  },

  find: {
    usage: 'find <text>',
    desc: 'Search file names and contents',
    examples: ['find design'],
    run: (args) => {
      const q = args.join(' ').toLowerCase();
      if (q.length < 2) return err('usage: find <text>   (at least 2 characters)');
      const hits: Line[] = [];
      const walk = (node: Dir, segs: string[]) => {
        for (const [name, child] of Object.entries(node.children).sort(sortEntries)) {
          const here = [...segs, name];
          if (child.kind === 'dir') {
            if (name.toLowerCase().includes(q)) hits.push([{ text: pathStr(here) + '/', tone: 'accent' }]);
            walk(child, here);
          } else {
            const line = child.content.split('\n').find((l) => l.toLowerCase().includes(q));
            if (name.toLowerCase().includes(q) || line) hits.push([{ text: pathStr(here), tone: 'accent' }, { text: line ? `  ${line.trim().slice(0, 70)}` : '', tone: 'dim' }]);
          }
        }
      };
      walk(vfs(), []);
      return hits.length ? [...hits.slice(0, 40), ...(hits.length > 40 ? [t(`…and ${hits.length - 40} more`, 'dim')] : [])] : [t(`find: nothing matches "${q}"`, 'dim')];
    },
  },

  theme: {
    usage: 'theme [dark|light|toggle]',
    desc: 'Show or switch the colour theme',
    examples: ['theme light', 'theme toggle'],
    run: ([mode]) => {
      if (!mode) return [kv('theme', currentTheme(), 8), t('usage: theme [dark|light|toggle]', 'dim')];
      const next = mode === 'toggle' ? (currentTheme() === 'dark' ? 'light' : 'dark') : mode;
      if (next !== 'dark' && next !== 'light') return err('usage: theme [dark|light|toggle]');
      applyTheme(next);
      return ok(`theme set to ${next}`);
    },
  },

  neofetch: {
    usage: 'neofetch',
    desc: 'System summary',
    run: (_a, ctx) => {
      const open = ctx.wm.windows.filter((w) => !w.closing).length;
      return [
        t('guest@mono-os', 'head'),
        t('─────────────', 'dim'),
        kv('OS', 'MONO OS'),
        kv('Shell', 'mono-sh'),
        kv('Theme', currentTheme()),
        kv('Screen', `${ctx.wm.viewport.w}×${ctx.wm.viewport.h} (${ctx.wm.viewport.kind})`),
        kv('Windows', `${open} open`),
        kv('Apps', String(visibleApps().length)),
        kv('Projects', String(projects.length)),
        kv('Uptime', uptime()),
      ];
    },
  },

  date: { usage: 'date', desc: 'Current date and time', run: () => [t(new Date().toString())] },
  uptime: { usage: 'uptime', desc: 'How long this session has been running', run: () => [t(`up ${uptime()}`)] },
  echo: { usage: 'echo <text>', desc: 'Print text', run: (args) => [t(args.join(' '))] },

  history: {
    usage: 'history',
    desc: 'Commands from this session',
    run: (_a, ctx) => (ctx.history.length ? ctx.history.map((h, i): Line => [{ text: String(i + 1).padStart(3) + '  ', tone: 'dim' }, { text: h }]) : [t('(no history yet)', 'dim')]),
  },

  shortcuts: {
    usage: 'shortcuts',
    desc: 'Keyboard shortcuts',
    run: () => [
      kv('Ctrl/⌘ + K', 'Open the launcher / search', 14),
      kv('Tab', 'Complete commands and paths', 14),
      kv('↑ / ↓', 'Browse command history', 14),
      kv('Ctrl + L', 'Clear the terminal', 14),
      kv('Ctrl + C', 'Cancel the current line', 14),
      kv('Arrows + Enter', 'Move between and open desktop icons', 14),
      kv('Esc', 'Close the launcher', 14),
    ],
  },

  clear: {
    usage: 'clear',
    desc: 'Clear the screen',
    run: (_a, ctx) => {
      ctx.clear();
      return [];
    },
  },

  exit: {
    usage: 'exit',
    desc: 'Close this terminal window',
    run: (_a, ctx) => {
      ctx.wm.close('terminal');
      return [];
    },
  },

  'copy-email': {
    usage: 'copy-email',
    desc: 'Copy my email address to the clipboard',
    run: async () => {
      if (!profile.email) return err('copy-email: no email is set yet — add it in src/data/profile.ts');
      try {
        await navigator.clipboard.writeText(profile.email);
        return ok(`copied ${profile.email}`);
      } catch {
        return err('copy-email: the browser blocked clipboard access — select the address from `contact` instead');
      }
    },
  },

  sudo: {
    usage: 'sudo <command>',
    desc: 'Try it and see',
    run: (args, ctx) => {
      if (args.join(' ') === 'hire-me') {
        ctx.wm.openApp('contact');
        return [t('Permission granted. Opening Contact…', 'ok')];
      }
      return err('guest is not in the sudoers file. This incident will be reported.');
    },
  },
};

/* ───────────────────────── Run & complete ───────────────────────── */

const lev = (a: string, b: string): number => {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) (d[0] as number[])[j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      (d[i] as number[])[j] = Math.min((d[i - 1]?.[j] ?? 0) + 1, (d[i]?.[j - 1] ?? 0) + 1, (d[i - 1]?.[j - 1] ?? 0) + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length]?.[b.length] ?? 99;
};

export async function run(input: string, ctx: Ctx): Promise<Line[]> {
  const [name, ...args] = tokenize(input);
  if (!name) return [];
  const cmd = CMDS[name.toLowerCase()];
  if (!cmd) {
    const near = Object.keys(CMDS).find((c) => lev(c, name.toLowerCase()) <= 2);
    return [t(`mono-sh: command not found: ${name}`, 'err'), t(near ? `Did you mean \`${near}\`? Type \`help\` for everything.` : 'Type `help` to see what is available.', 'dim')];
  }
  try {
    return await cmd.run(args, ctx);
  } catch (e) {
    return err(`${name}: ${e instanceof Error ? e.message : 'something went wrong'}`);
  }
}

const commonPrefix = (words: string[]): string =>
  words.reduce((p, w) => {
    let i = 0;
    while (i < p.length && i < w.length && p[i]?.toLowerCase() === w[i]?.toLowerCase()) i++;
    return p.slice(0, i);
  });

/** Tab completion: commands for the first word, then paths (plus apps/projects for `open`). */
export function complete(input: string, cwd: string[]): { value: string; options: string[] } {
  const cut = input.lastIndexOf(' ') + 1;
  const head = input.slice(0, cut);
  const token = input.slice(cut);
  const first = tokenize(head)[0]?.toLowerCase() ?? '';

  let candidates: string[];
  if (!head || first === 'help') candidates = Object.keys(CMDS);
  else if (first === 'theme') candidates = ['dark', 'light', 'toggle'];
  else {
    const slash = token.lastIndexOf('/') + 1;
    const dirPart = token.slice(0, slash);
    const node = lookup(resolvePath(cwd, dirPart || '.'));
    candidates =
      node?.kind === 'dir'
        ? Object.entries(node.children).map(([n, c]) => dirPart + n + (c.kind === 'dir' ? '/' : ''))
        : [];
    if (first === 'open') candidates.push(...visibleApps().map((a) => a.id), ...projects.map((p) => p.slug), 'github', 'linkedin', 'email');
  }

  const matches = [...new Set(candidates)].filter((c) => c.toLowerCase().startsWith(token.toLowerCase())).sort();
  if (!matches.length) return { value: input, options: [] };
  if (matches.length === 1) {
    const only = matches[0] ?? '';
    return { value: head + only + (only.endsWith('/') ? '' : ' '), options: [] };
  }
  return { value: head + commonPrefix(matches), options: matches };
}

export const WELCOME: Line[] = [
  t('MONO OS terminal', 'head'),
  [{ text: 'Type ', tone: 'dim' }, { text: 'help', tone: 'accent' }, { text: ' to see what this can do.  Try ', tone: 'dim' }, { text: 'about', tone: 'accent' }, { text: ', ', tone: 'dim' }, { text: 'projects', tone: 'accent' }, { text: ' or ', tone: 'dim' }, { text: 'open design', tone: 'accent' }, { text: '.', tone: 'dim' }],
];