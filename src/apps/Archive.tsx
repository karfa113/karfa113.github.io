import { archive } from '../data/archive';
import { EmptyState, ExternalLink, Tag } from '../components/ui';
import { useWindowStatus } from '../hooks/useWindowStatus';

export default function Archive() {
  useWindowStatus(`${archive.length} ${archive.length === 1 ? 'item' : 'items'}`);

  return (
    <div className="exp">
      <header className="studio__head">
        <div>
          <p className="eyebrow mono">Experiments &amp; older work</p>
          <h1 className="studio__title">Archive</h1>
        </div>
      </header>

      {archive.length === 0 ? (
        <EmptyState icon="archive" title="The archive is empty">
          Add items in src/data/archive.ts.
        </EmptyState>
      ) : (
        <ul className="docs">
          {archive.map((item) => (
            <li key={item.id} className="doc">
              <div>
                <h3>{item.title}</h3>
                <div className="tags">
                  <Tag>{item.kind}</Tag>
                  {item.year ? <Tag>{String(item.year)}</Tag> : null}
                </div>
                <p className="prose">{item.note}</p>
                {item.url ? <ExternalLink href={item.url}>Open</ExternalLink> : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
