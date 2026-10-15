import { useRef } from 'react';
import type { ReactNode } from 'react';
import type { Asset, Project } from '../types';
import { getProject } from '../data/projects';
import { CoverArt } from '../components/CoverArt';
import { EmptyState, ExternalLink, SampleBadge, SectionHeading, StatusPill, Tag } from '../components/ui';
import { prefersReducedMotion } from '../state/windowManager';
import { useWindowStatus } from '../hooks/useWindowStatus';

interface Section {
  id: string;
  label: string;
  node: ReactNode;
}

const AssetGrid = ({ assets, seed }: { assets: Asset[]; seed: string }) => (
  <div className="assets">
    {assets.map((a, i) => (
      <CoverArt key={`${seed}-${i}`} seed={`${seed}-${a.caption ?? i}`} asset={a} label="Asset placeholder" />
    ))}
  </div>
);

function buildSections(p: Project): Section[] {
  const cs = p.caseStudy;
  const out: Section[] = [];
  const text = (id: string, label: string, body?: string) => {
    if (body) out.push({ id, label, node: <p className="prose">{body}</p> });
  };
  const list = (id: string, label: string, items?: string[]) => {
    if (items && items.length > 0)
      out.push({
        id,
        label,
        node: (
          <ul className="plain-list">
            {items.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        ),
      });
  };

  if (p.kind === 'code') {
    text('problem', 'Problem solved', p.problem);
    if (p.snippet) {
      out.push({
        id: 'snippet',
        label: 'Snippet',
        node: (
          <figure>
            <pre className="code">
              <code>{p.snippet.code}</code>
            </pre>
            {p.snippet.caption ? <figcaption className="muted mono">{p.snippet.caption}</figcaption> : null}
          </figure>
        ),
      });
    }
    return out;
  }

  text('overview', 'Overview', cs?.overview);
  text('problem', 'Problem', cs?.problem);
  text('audience', 'Audience', cs?.audience);
  list('research', 'Research & insights', cs?.research);
  if (cs?.userFlow && cs.userFlow.length > 0) {
    out.push({
      id: 'flow',
      label: 'User flow',
      node: (
        <ol className="flow">
          {cs.userFlow.map((step, i) => (
            <li key={step}>
              <span className="mono">{String(i + 1).padStart(2, '0')}</span>
              {step}
            </li>
          ))}
        </ol>
      ),
    });
  }
  if (cs?.wireframes?.length) out.push({ id: 'wireframes', label: 'Wireframes', node: <AssetGrid assets={cs.wireframes} seed={`${p.slug}-wf`} /> });
  if (cs?.finalInterface?.length) out.push({ id: 'final', label: 'Final interface', node: <AssetGrid assets={cs.finalInterface} seed={`${p.slug}-ui`} /> });
  if (cs?.decisions?.length) {
    out.push({
      id: 'decisions',
      label: 'Design decisions',
      node: (
        <div className="decisions">
          {cs.decisions.map((d) => (
            <div key={d.title} className="card">
              <h4>{d.title}</h4>
              <p>{d.body}</p>
            </div>
          ))}
        </div>
      ),
    });
  }
  text('outcome', 'Outcome', cs?.outcome);
  list('lessons', 'Lessons learned', cs?.lessons);
  return out;
}

/** Case study (design) or project brief (code) — opened in its own window. */
export default function ProjectDetail({ slug }: { slug: string }) {
  const project = getProject(slug);
  const scroller = useRef<HTMLDivElement>(null);
  useWindowStatus(project ? `${project.category} · ${project.year}` : 'Not found');

  if (!project) {
    return (
      <EmptyState icon="file" title="Project not found">
        “{slug}” is not in src/data/projects.ts.
      </EmptyState>
    );
  }

  const sections = buildSections(project);
  const chips = project.kind === 'design' ? project.tools : project.tech;

  const jump = (id: string) => {
    const el = scroller.current?.querySelector(`#sec-${id}`);
    el?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <div className="detail" ref={scroller}>
      <CoverArt seed={project.slug} asset={project.cover} className="detail__cover" />

      <header className="detail__head">
        <p className="eyebrow mono">
          {project.kind === 'design' ? 'Case study' : 'Project'} · {project.category}
          {project.sample ? <SampleBadge /> : null}
        </p>
        <h1 className="detail__title">{project.title}</h1>
        <p className="lede">{project.summary}</p>
      </header>

      <dl className="facts">
        <div>
          <dt className="mono">Year</dt>
          <dd>{project.year}</dd>
        </div>
        <div>
          <dt className="mono">Status</dt>
          <dd>
            <StatusPill status={project.status} />
          </dd>
        </div>
        {project.role ? (
          <div>
            <dt className="mono">Role</dt>
            <dd>{project.role}</dd>
          </div>
        ) : null}
        {chips && chips.length > 0 ? (
          <div>
            <dt className="mono">{project.kind === 'design' ? 'Tools' : 'Technology'}</dt>
            <dd className="tags">
              {chips.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </dd>
          </div>
        ) : null}
      </dl>

      {project.kind === 'code' ? (
        <div className="detail__links">
          {project.repoUrl ? <ExternalLink href={project.repoUrl}>Repository</ExternalLink> : <span className="muted mono">No repository linked</span>}
          {project.demoUrl ? <ExternalLink href={project.demoUrl}>Live demo</ExternalLink> : <span className="muted mono">No live demo</span>}
        </div>
      ) : null}

      {sections.length > 1 ? (
        <nav className="toc" aria-label="Sections">
          {sections.map((s) => (
            <button key={s.id} type="button" className="chip" onClick={() => jump(s.id)}>
              {s.label}
            </button>
          ))}
        </nav>
      ) : null}

      {sections.length === 0 ? (
        <EmptyState icon="file" title="No write-up yet">
          {project.kind === 'design'
            ? 'Add a caseStudy to this project in src/data/projects.ts.'
            : 'Add a “problem” (and optionally a snippet) to this project in src/data/projects.ts.'}
        </EmptyState>
      ) : (
        sections.map((s) => (
          <section key={s.id} id={`sec-${s.id}`} className="detail__section">
            <SectionHeading>{s.label}</SectionHeading>
            {s.node}
          </section>
        ))
      )}
    </div>
  );
}
