import type { Project } from '../types';
import { CoverArt } from './CoverArt';
import { SampleBadge, StatusPill, Tag } from './ui';

interface ViewProps {
  project: Project;
  onOpen: (slug: string) => void;
}

/** Editorial gallery card — used by Design Studio and the Projects grid view. */
export function ProjectCard({ project, onOpen, featured = false }: ViewProps & { featured?: boolean }) {
  const chips = project.kind === 'design' ? project.tools : project.tech;
  return (
    <article className={`pcard${featured ? ' pcard--featured' : ''}`}>
      <button type="button" className="pcard__hit" onClick={() => onOpen(project.slug)} aria-label={`Open ${project.title}`}>
        <CoverArt seed={project.slug} asset={project.cover} />
        <div className="pcard__body">
          <div className="pcard__meta mono">
            <span>{project.category}</span>
            <span aria-hidden="true">·</span>
            <span>{project.year}</span>
            {project.sample ? <SampleBadge /> : null}
          </div>
          <h3 className="pcard__title">{project.title}</h3>
          <p className="pcard__summary">{project.summary}</p>
          <div className="pcard__foot">
            <StatusPill status={project.status} />
            {project.role ? <span className="pcard__role mono">{project.role}</span> : null}
          </div>
          {chips && chips.length > 0 ? (
            <div className="tags">
              {chips.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          ) : null}
        </div>
      </button>
    </article>
  );
}

/** Compact row — used by the Projects explorer list view. */
export function ProjectRow({ project, onOpen }: ViewProps) {
  return (
    <li>
      <button type="button" className="prow" onClick={() => onOpen(project.slug)} aria-label={`Open ${project.title}`}>
        <CoverArt seed={project.slug} asset={project.cover} className="prow__thumb" label="" />
        <span className="prow__main">
          <span className="prow__title">
            {project.title}
            {project.sample ? <SampleBadge /> : null}
          </span>
          <span className="prow__sub">{project.summary}</span>
        </span>
        <span className="prow__cat mono">{project.category}</span>
        <span className="prow__year mono">{project.year}</span>
        <span className="prow__status">
          <StatusPill status={project.status} />
        </span>
      </button>
    </li>
  );
}
