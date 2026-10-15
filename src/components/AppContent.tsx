import { lazy, Suspense } from 'react';
import type { FC } from 'react';
import type { AppId } from '../types';
import type { WinState } from '../state/windowManager';
import { ErrorBoundary, Loading } from './ui';

// Each app is its own chunk: it is only downloaded when its window is first opened.
const REGISTRY: Record<AppId, FC<{}>> = {
  about: lazy(() => import('../apps/About')),
  design: lazy(() => import('../apps/DesignStudio')),
  code: lazy(() => import('../apps/CodeLab')),
  projects: lazy(() => import('../apps/Projects')),
  academics: lazy(() => import('../apps/Academics')),
  experience: lazy(() => import('../apps/Experience')),
  resume: lazy(() => import('../apps/Resume')),
  contact: lazy(() => import('../apps/Contact')),
  terminal: lazy(() => import('../apps/Terminal')),
  archive: lazy(() => import('../apps/Archive')),
};

const ProjectDetail = lazy(() => import('../apps/ProjectDetail'));

export function AppContent({ win }: { win: WinState }) {
  const App = REGISTRY[win.appId];
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading label={`Opening ${win.title}`} />}>
        {win.projectSlug ? <ProjectDetail slug={win.projectSlug} /> : <App />}
      </Suspense>
    </ErrorBoundary>
  );
}