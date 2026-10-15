import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { Project, ProjectStatus } from '../types';
import { projects } from '../data/projects';
import { Icon } from '../components/Icon';
import { ProjectCard, ProjectRow } from '../components/ProjectViews';
import { EmptyState } from '../components/ui';
import { useWindowManager } from '../state/windowManager';
import { useWindowStatus } from '../hooks/useWindowStatus';

type SortKey = 'newest' | 'oldest' | 'name' | 'status';
type View = 'list' | 'grid';
type Kind = 'all' | 'design' | 'code';

const STATUS_ORDER: Record<ProjectStatus, number> = { 'In progress': 0, Planned: 1, Paused: 2, Completed: 3 };

const SORTERS: Record<SortKey, (a: Project, b: Project) => number> = {
  newest: (a, b) => b.year - a.year || a.title.localeCompare(b.title),
  oldest: (a, b) => a.year - b.year || a.title.localeCompare(b.title),
  name: (a, b) => a.title.localeCompare(b.title),
  status: (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.title.localeCompare(b.title),
};

/** Matches every whitespace-separated term against the project's searchable text. */
const haystack = (p: Project): string =>
  [p.title, p.summary, p.category, p.kind, p.status, String(p.year), p.role, ...(p.tools ?? []), ...(p.tech ?? [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

export default function Projects() {
  const wm = useWindowManager();
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<Kind>('all');
  const [category, setCategory] = useState<string>('All');
  const [sort, setSort] = useState<SortKey>('newest');
  const [view, setView] = useState<View>('list');

  const inKind = useMemo(() => projects.filter((p) => kind === 'all' || p.kind === kind), [kind]);
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of inKind) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    return Array.from(counts.entries());
  }, [inKind]);

  const results = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    return inKind
      .filter((p) => category === 'All' || p.category === category)
      .filter((p) => {
        const h = haystack(p);
        return terms.every((t) => h.includes(t));
      })
      .sort(SORTERS[sort]);
  }, [inKind, category, query, sort]);

  useWindowStatus(`${results.length} of ${projects.length} items`);

  const filtered = query.trim() !== '' || category !== 'All' || kind !== 'all';
  const reset = () => {
    setQuery('');
    setCategory('All');
    setKind('all');
  };

  const changeKind = (k: Kind) => {
    setKind(k);
    setCategory('All');
  };

  return (
    <div className="explorer">
      <aside className="explorer__side" aria-label="Browse by type">
        <p className="eyebrow mono">Locations</p>
        <div className="side-group" role="group" aria-label="Type">
          {(['all', 'design', 'code'] as const).map((k) => (
            <button key={k} type="button" className="side-item" aria-pressed={kind === k} onClick={() => changeKind(k)}>
              <Icon name={k === 'all' ? 'projects' : k} size={15} />
              <span>{k === 'all' ? 'All projects' : k === 'design' ? 'Design' : 'Code'}</span>
            </button>
          ))}
        </div>
        <p className="eyebrow mono">Categories</p>
        <div className="side-group" role="group" aria-label="Category">
          <button type="button" className="side-item" aria-pressed={category === 'All'} onClick={() => setCategory('All')}>
            <Icon name="folder" size={15} />
            <span>All</span>
            <em className="side-count mono">{inKind.length}</em>
          </button>
          {categories.map(([name, n]) => (
            <button key={name} type="button" className="side-item" aria-pressed={category === name} onClick={() => setCategory(name)}>
              <Icon name="folder" size={15} />
              <span>{name}</span>
              <em className="side-count mono">{n}</em>
            </button>
          ))}
        </div>
      </aside>

      <section className="explorer__main" aria-label="Projects">
        <div className="toolbar">
          <label className="search">
            <Icon name="search" size={15} />
            <span className="sr-only">Search projects</span>
            <input
              type="search"
              placeholder="Search projects, tools, years…"
              value={query}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
          </label>
          <label className="select">
            <Icon name="sort" size={14} />
            <span className="sr-only">Sort by</span>
            <select value={sort} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSort(e.target.value as SortKey)}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="name">Name (A–Z)</option>
              <option value="status">Status</option>
            </select>
          </label>
          <div className="seg" role="group" aria-label="View">
            <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')} aria-label="List view" title="List view">
              <Icon name="list" size={15} />
            </button>
            <button type="button" aria-pressed={view === 'grid'} onClick={() => setView('grid')} aria-label="Grid view" title="Grid view">
              <Icon name="grid" size={15} />
            </button>
          </div>
        </div>

        <div className="explorer__results" aria-live="polite">
          {results.length === 0 ? (
            <EmptyState
              icon="search"
              title={filtered ? 'No projects match' : 'No projects yet'}
              action={
                filtered ? (
                  <button type="button" className="btn" onClick={reset}>
                    Clear filters
                  </button>
                ) : undefined
              }
            >
              {filtered ? 'Try a different search term or category.' : 'Add entries in src/data/projects.ts.'}
            </EmptyState>
          ) : view === 'list' ? (
            <>
              <div className="prow prow--head mono" aria-hidden="true">
                <span />
                <span>Name</span>
                <span className="prow__cat">Category</span>
                <span className="prow__year">Year</span>
                <span className="prow__status">Status</span>
              </div>
              <ul className="rows">
                {results.map((p) => (
                  <ProjectRow key={p.slug} project={p} onOpen={wm.openProject} />
                ))}
              </ul>
            </>
          ) : (
            <div className="gallery gallery--dense">
              {results.map((p) => (
                <ProjectCard key={p.slug} project={p} onOpen={wm.openProject} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
