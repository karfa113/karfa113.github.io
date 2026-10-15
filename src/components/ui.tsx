import { Component } from 'react';
import type { ReactNode } from 'react';
import type { ProjectStatus } from '../types';
import { Icon, type IconName } from './Icon';

/** Safe external link: opens in a new tab, never leaks the opener. */
export function ExternalLink({ href, children, className = 'btn' }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <Icon name="external" size={14} />
    </a>
  );
}

const STATUS_SHAPE: Record<ProjectStatus, string> = {
  Planned: 'hollow',
  'In progress': 'accent',
  Completed: 'solid',
  Paused: 'half',
};

/** Status is communicated by shape + label, not by colour alone. */
export function StatusPill({ status }: { status: ProjectStatus }) {
  return (
    <span className="status mono" data-shape={STATUS_SHAPE[status]}>
      <i aria-hidden="true" />
      {status}
    </span>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="tag mono">{children}</span>;
}

export function SampleBadge() {
  return (
    <span className="sample mono" title="Sample content — replace it in src/data">
      Sample
    </span>
  );
}

export function EmptyState({
  icon = 'folder',
  title,
  children,
  action,
}: {
  icon?: IconName;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty" role="status">
      <span className="empty__icon">
        <Icon name={icon} size={22} />
      </span>
      <p className="empty__title">{title}</p>
      {children ? <p className="empty__body">{children}</p> : null}
      {action}
    </div>
  );
}

export function Loading({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="loading mono" role="status" aria-live="polite">
      <span className="loading__bar" aria-hidden="true" />
      {label}…
    </div>
  );
}

/** Catches failures (e.g. a lazy chunk that could not be fetched) and offers a retry. */
export class ErrorBoundary extends Component<{ children?: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <EmptyState
        icon="close"
        title="This window could not load"
        action={
          <button type="button" className="btn" onClick={() => window.location.reload()}>
            Reload page
          </button>
        }
      >
        Check your connection and try again.
      </EmptyState>
    );
  }
}

export function SectionHeading({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h3 className="eyebrow mono" id={id}>
      {children}
    </h3>
  );
}
