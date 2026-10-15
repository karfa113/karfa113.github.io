export type AppId =
  | 'about'
  | 'design'
  | 'code'
  | 'projects'
  | 'academics'
  | 'experience'
  | 'resume'
  | 'contact'
  | 'terminal'
  | 'archive';

export type ViewportKind = 'mobile' | 'tablet' | 'desktop';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface AppDef {
  id: AppId;
  title: string;
  /** Terminal-style path shown in the window chrome. */
  path: string;
  blurb: string;
  size: { w: number; h: number };
  keywords: string[];
  /** Shown in the dock. */
  dock: boolean;
}

export type ProjectKind = 'design' | 'code';
export type ProjectStatus = 'Planned' | 'In progress' | 'Completed' | 'Paused';

export interface Asset {
  /** Path or URL of a real image. Leave empty to show a neutral placeholder tile. */
  src?: string;
  alt: string;
  caption?: string;
}

export interface Decision {
  title: string;
  body: string;
}

export interface CaseStudy {
  overview?: string;
  problem?: string;
  audience?: string;
  research?: string[];
  userFlow?: string[];
  wireframes?: Asset[];
  finalInterface?: Asset[];
  decisions?: Decision[];
  outcome?: string;
  lessons?: string[];
}

export interface Project {
  slug: string;
  kind: ProjectKind;
  title: string;
  category: string;
  year: number;
  status: ProjectStatus;
  summary: string;
  role?: string;
  tools?: string[];
  /** Languages / technologies (code projects). */
  tech?: string[];
  cover?: Asset;
  problem?: string;
  repoUrl?: string;
  demoUrl?: string;
  snippet?: { language: string; code: string; caption?: string };
  caseStudy?: CaseStudy;
  /** True for sample entries that should be replaced with real work. */
  sample?: boolean;
}

export interface TimelineEntry {
  id: string;
  organization: string;
  role: string;
  start: string;
  end: string;
  summary?: string;
  responsibilities: string[];
  contributions?: string[];
  links?: { label: string; url: string }[];
  sample?: boolean;
}

export interface AcademicItem {
  title: string;
  meta?: string;
  note?: string;
  url?: string;
  sample?: boolean;
}

export interface AcademicFolder {
  id: string;
  label: string;
  description: string;
  items: AcademicItem[];
}

export interface ArchiveItem {
  id: string;
  title: string;
  kind: 'Experiment' | 'Discontinued' | 'Exploration' | 'Work in progress';
  year?: number;
  note: string;
  url?: string;
}

export interface SocialLink {
  id: string;
  label: string;
  url: string;
  handle?: string;
}