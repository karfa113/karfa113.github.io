import { useMemo, useState } from 'react';
import { CODE_CATEGORIES, projects } from '../data/projects';
import { EmptyState, ExternalLink, SampleBadge, StatusPill, Tag } from '../components/ui';
import { Icon } from '../components/Icon';
import { useWindowManager } from '../state/windowManager';
import { useWindowStatus } from '../hooks/useWindowStatus';

const FILTERS = ['All', ...CODE_CATEGORIES] as const;

export default function CodeLab() {
  const wm = useWindowManager();
  const code = useMemo(() => projects.filter((p) => p.kind === 'code'), []);
  const [filter, setFilter] = useState<string>('All');

  const shown = filter === 'All' ? code : code.filter((p) => p.category === filter);
  useWindowStatus(`${shown.length} of ${code.length} entries`);

  const count = (f: string) => (f === 'All' ? code.length : code.filter((p) => p.category === f).length);

  return (
    <div className="lab">
      <div className="lab__tabs" role="tablist" aria-label="Filter projects">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            className="lab__tab mono"
            aria-selected={f === filter}
            onClick={() => setFilter(f)}
          >
            {f}
            <span className="lab__count">{count(f)}</span>
          </button>
        ))}
      </div>

      <div className="lab__prompt mono" aria-hidden="true">
        <span>~/code</span> <b>$</b> ls {filter === 'All' ? '--all' : `--type=${filter.toLowerCase()}`}
      </div>

      {shown.length === 0 ? (
        <EmptyState icon="code" title={filter === 'All' ? 'No code projects yet' : `Nothing in ${filter} yet`}>
          Add entries with kind “code” in src/data/projects.ts.
        </EmptyState>
      ) : (
        <ul className="lab__list">
          {shown.map((p) => (
            <li key={p.slug} className="entry">
              <div className="entry__top">
                <h3 className="entry__name mono">
                  {p.title}
                  {p.sample ? <SampleBadge /> : null}
                </h3>
                <StatusPill status={p.status} />
              </div>
              <p className="entry__summary">{p.summary}</p>
              {p.problem ? (
                <p className="entry__problem">
                  <span className="eyebrow mono">Problem solved</span>
                  {p.problem}
                </p>
              ) : null}
              {p.tech && p.tech.length > 0 ? (
                <div className="tags">
                  {p.tech.map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </div>
              ) : null}
              {p.snippet ? (
                <pre className="code">
                  <code>{p.snippet.code}</code>
                </pre>
              ) : null}
              <div className="entry__actions">
                <button type="button" className="btn btn--primary" onClick={() => wm.openProject(p.slug)}>
                  Details <Icon name="arrow" size={14} />
                </button>
                {p.repoUrl ? <ExternalLink href={p.repoUrl}>Repository</ExternalLink> : <span className="muted mono">No repository linked</span>}
                {p.demoUrl ? <ExternalLink href={p.demoUrl}>Live demo</ExternalLink> : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
