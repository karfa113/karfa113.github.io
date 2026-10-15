import { useMemo, useState } from 'react';
import { projects } from '../data/projects';
import { ProjectCard } from '../components/ProjectViews';
import { EmptyState } from '../components/ui';
import { useWindowManager } from '../state/windowManager';
import { useWindowStatus } from '../hooks/useWindowStatus';

export default function DesignStudio() {
  const wm = useWindowManager();
  const designs = useMemo(() => projects.filter((p) => p.kind === 'design'), []);
  const categories = useMemo(() => ['All', ...Array.from(new Set(designs.map((p) => p.category)))], [designs]);
  const [category, setCategory] = useState('All');

  const shown = category === 'All' ? designs : designs.filter((p) => p.category === category);
  useWindowStatus(`${shown.length} of ${designs.length} projects`);

  return (
    <div className="studio">
      <header className="studio__head">
        <div>
          <p className="eyebrow mono">Selected work</p>
          <h1 className="studio__title">Design Studio</h1>
        </div>
        <div className="chips" role="group" aria-label="Filter by category">
          {categories.map((c) => (
            <button key={c} type="button" className="chip" aria-pressed={c === category} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
      </header>

      {shown.length === 0 ? (
        <EmptyState icon="design" title="No design projects yet">
          Add entries with kind “design” in src/data/projects.ts and they will appear here.
        </EmptyState>
      ) : (
        <div className="gallery">
          {shown.map((p, i) => (
            <ProjectCard key={p.slug} project={p} onOpen={wm.openProject} featured={i === 0 && category === 'All' && shown.length > 2} />
          ))}
        </div>
      )}
    </div>
  );
}
