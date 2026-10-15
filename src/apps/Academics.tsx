import { useState } from 'react';
import { academicFolders, education } from '../data/academics';
import { Icon } from '../components/Icon';
import { EmptyState, ExternalLink, SampleBadge } from '../components/ui';
import { useWindowStatus } from '../hooks/useWindowStatus';

const OVERVIEW = 'overview';

export default function Academics() {
  const [selected, setSelected] = useState<string>(OVERVIEW);
  const folder = academicFolders.find((f) => f.id === selected);
  useWindowStatus(folder ? `${folder.items.length} items` : 'Education');

  return (
    <div className="archive-app">
      <nav className="tree" aria-label="Academic folders">
        <p className="eyebrow mono">Archive</p>
        <button type="button" className="side-item" aria-pressed={selected === OVERVIEW} onClick={() => setSelected(OVERVIEW)}>
          <Icon name="academics" size={15} />
          <span>Education</span>
        </button>
        {academicFolders.map((f) => (
          <button key={f.id} type="button" className="side-item" aria-pressed={selected === f.id} onClick={() => setSelected(f.id)}>
            <Icon name="folder" size={15} />
            <span>{f.label}</span>
            <em className="side-count mono">{f.items.length}</em>
          </button>
        ))}
      </nav>

      <section className="archive-app__main" aria-live="polite">
        {!folder ? (
          <>
            <p className="eyebrow mono">
              Education {education.sample ? <SampleBadge /> : null}
            </p>
            <h1 className="studio__title">{education.institution}</h1>
            <div className="timeline timeline--single">
              <div className="timeline__item">
                <span className="timeline__dot" aria-hidden="true" />
                <p className="mono muted">{education.period}</p>
                <h3>{education.program}</h3>
                <p className="prose">{education.note}</p>
              </div>
            </div>
            <p className="eyebrow mono">Folders</p>
            <div className="folder-grid">
              {academicFolders.map((f) => (
                <button key={f.id} type="button" className="card card--button" onClick={() => setSelected(f.id)}>
                  <Icon name="folder" size={18} />
                  <h4>{f.label}</h4>
                  <p>{f.description}</p>
                  <span className="mono muted">{f.items.length} {f.items.length === 1 ? 'item' : 'items'}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="eyebrow mono">~/academics/{folder.id}</p>
            <h1 className="studio__title">{folder.label}</h1>
            <p className="prose">{folder.description}</p>
            {folder.items.length === 0 ? (
              <EmptyState icon="folder" title="Nothing here yet">
                Add items to “{folder.label}” in src/data/academics.ts.
              </EmptyState>
            ) : (
              <ul className="docs">
                {folder.items.map((item) => (
                  <li key={item.title} className="doc">
                    <Icon name="file" size={18} />
                    <div>
                      <h3>
                        {item.title} {item.sample ? <SampleBadge /> : null}
                      </h3>
                      {item.meta ? <p className="mono muted">{item.meta}</p> : null}
                      {item.note ? <p className="prose">{item.note}</p> : null}
                      {item.url ? <ExternalLink href={item.url}>Open</ExternalLink> : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </div>
  );
}
