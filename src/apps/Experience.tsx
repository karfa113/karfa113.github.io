import { experience } from '../data/experience';
import { EmptyState, ExternalLink, SampleBadge, SectionHeading } from '../components/ui';
import { useWindowStatus } from '../hooks/useWindowStatus';

export default function Experience() {
  useWindowStatus(`${experience.length} ${experience.length === 1 ? 'record' : 'records'}`);

  return (
    <div className="exp">
      <header className="studio__head">
        <div>
          <p className="eyebrow mono">Timeline</p>
          <h1 className="studio__title">Experience</h1>
        </div>
      </header>

      {experience.length === 0 ? (
        <EmptyState icon="experience" title="No experience added yet">
          Add roles, teams and organisations in src/data/experience.ts.
        </EmptyState>
      ) : (
        <ol className="timeline">
          {experience.map((e) => (
            <li key={e.id} className="timeline__item">
              <span className="timeline__dot" aria-hidden="true" />
              <p className="mono muted">
                {e.start} — {e.end}
              </p>
              <h3 className="timeline__role">
                {e.role} {e.sample ? <SampleBadge /> : null}
              </h3>
              <p className="timeline__org">{e.organization}</p>
              {e.summary ? <p className="prose">{e.summary}</p> : null}

              <SectionHeading>Responsibilities</SectionHeading>
              <ul className="plain-list">
                {e.responsibilities.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>

              {e.contributions && e.contributions.length > 0 ? (
                <>
                  <SectionHeading>Contributions</SectionHeading>
                  <ul className="plain-list">
                    {e.contributions.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </>
              ) : null}

              {e.links && e.links.length > 0 ? (
                <div className="entry__actions">
                  {e.links.map((l) => (
                    <ExternalLink key={l.url} href={l.url}>
                      {l.label}
                    </ExternalLink>
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
