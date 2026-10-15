import type { AppDef, AppId } from '../types';
import { archive, ARCHIVE_MIN_ITEMS } from './archive';

export const APPS: AppDef[] = [
  { id: 'about', title: 'About Me', path: '~/about', blurb: 'Profile, approach and what I explore', size: { w: 740, h: 580 }, keywords: ['profile', 'bio', 'intro', 'me'], dock: true },
  { id: 'design', title: 'Design Studio', path: '~/design', blurb: 'UI/UX work and case studies', size: { w: 980, h: 640 }, keywords: ['ui', 'ux', 'figma', 'case study', 'interface'], dock: true },
  { id: 'code', title: 'Code Lab', path: '~/code', blurb: 'Programming and development projects', size: { w: 920, h: 620 }, keywords: ['programming', 'github', 'repo', 'development'], dock: true },
  { id: 'projects', title: 'Projects', path: '~/projects', blurb: 'Browse every project in one place', size: { w: 1000, h: 640 }, keywords: ['explorer', 'files', 'all', 'work', 'portfolio'], dock: true },
  { id: 'academics', title: 'Academics', path: '~/academics', blurb: 'Education and learning archive', size: { w: 900, h: 600 }, keywords: ['education', 'courses', 'study', 'university', 'learning'], dock: false },
  { id: 'experience', title: 'Experience', path: '~/experience', blurb: 'Roles, teams and responsibilities', size: { w: 780, h: 600 }, keywords: ['work', 'timeline', 'internship', 'jobs', 'career'], dock: false },
  { id: 'resume', title: 'Resume', path: '~/resume', blurb: 'Document viewer and download', size: { w: 820, h: 680 }, keywords: ['cv', 'pdf', 'download', 'hire'], dock: true },
  { id: 'contact', title: 'Contact', path: '~/contact', blurb: 'Email, profiles and collaboration', size: { w: 660, h: 520 }, keywords: ['email', 'github', 'linkedin', 'hire', 'message', 'reach'], dock: true },
  { id: 'terminal', title: 'Terminal', path: '~/terminal', blurb: 'Explore this portfolio from a command line', size: { w: 760, h: 520 }, keywords: ['shell', 'cli', 'command', 'console', 'bash', 'help'], dock: true },
  { id: 'archive', title: 'Archive', path: '~/archive', blurb: 'Old experiments and explorations', size: { w: 720, h: 540 }, keywords: ['trash', 'experiments', 'old', 'discontinued'], dock: false },
];

/** Apps that have enough content to be shown. The Archive hides itself when empty. */
export const visibleApps = (): AppDef[] =>
  APPS.filter((a) => a.id !== 'archive' || archive.length >= ARCHIVE_MIN_ITEMS);

export const getApp = (id: AppId): AppDef => {
  const app = APPS.find((a) => a.id === id);
  if (!app) throw new Error(`Unknown app: ${id}`);
  return app;
};