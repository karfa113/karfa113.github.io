import type { Project } from '../types';

/**
 * ─────────────────────────────────────────────────────────────
 *  PROJECTS — the single source of truth for Design Studio,
 *  Code Lab, the Projects explorer and the command palette.
 *
 *  The entries below are SAMPLES (sample: true) so the interface
 *  can be explored. Replace them with real work and delete the
 *  `sample` flag. Never add repo/demo URLs that don't exist —
 *  leave them undefined and the UI shows an honest empty state.
 * ─────────────────────────────────────────────────────────────
 */

export const DESIGN_CATEGORIES = [
  'Interface Design',
  'Product Design',
  'Design Systems',
  'Visual Identity',
  'Web Design',
  'Design Experiments',
] as const;

export const CODE_CATEGORIES = ['Web', 'Algorithms', 'Applications', 'Experiments'] as const;

export const projects: Project[] = [
  {
    slug: 'sample-interface-concept',
    kind: 'design',
    title: 'Sample — Interface concept',
    category: 'Interface Design',
    year: 2026,
    status: 'In progress',
    summary:
      'A placeholder for a UI/UX project. Replace this with a short description of what you designed, who it was for and why it matters.',
    role: '[Your role]',
    tools: ['[Tool 1]', '[Tool 2]'],
    sample: true,
    caseStudy: {
      overview: 'One or two paragraphs that set the scene: what the project is, the context it lives in and your part in it.',
      problem: 'What problem were you solving, and what made it worth solving? Describe it without exaggeration.',
      audience: 'Who is this for? Describe the people, their goals and the situation they are in.',
      research: [
        'Method 1 — what you did and what you learned from it.',
        'Method 2 — an insight that changed the direction of the work.',
      ],
      userFlow: ['Entry point', 'Key decision', 'Core task', 'Confirmation'],
      wireframes: [
        { alt: 'Wireframe placeholder', caption: 'Low-fidelity wireframe — add an image' },
        { alt: 'Wireframe placeholder', caption: 'Alternative layout — add an image' },
      ],
      finalInterface: [{ alt: 'Final interface placeholder', caption: 'Final screen — add an image' }],
      decisions: [
        { title: 'A decision worth explaining', body: 'What options did you weigh, and why did you choose this one?' },
        { title: 'A trade-off you accepted', body: 'Be candid about what you gave up and why.' },
      ],
      outcome: 'What happened as a result? Only include numbers you can stand behind — qualitative outcomes are fine.',
      lessons: ['What you would do differently.', 'What you would carry into the next project.'],
    },
  },
  {
    slug: 'sample-design-system',
    kind: 'design',
    title: 'Sample — Design system',
    category: 'Design Systems',
    year: 2026,
    status: 'Planned',
    summary: 'Placeholder for a component library or token system: structure, naming, documentation and adoption.',
    role: '[Your role]',
    tools: ['[Tool 1]'],
    sample: true,
    caseStudy: {
      overview: 'Describe the system: foundations, components and how it is meant to be used.',
      decisions: [{ title: 'Token naming', body: 'Explain the structure you chose and the reasoning behind it.' }],
      finalInterface: [{ alt: 'Component sheet placeholder', caption: 'Component overview — add an image' }],
    },
  },
  {
    slug: 'sample-web-design',
    kind: 'design',
    title: 'Sample — Web design',
    category: 'Web Design',
    year: 2025,
    status: 'Completed',
    summary: 'Placeholder for a website or landing page: layout, typography, responsive behaviour and content strategy.',
    role: '[Your role]',
    tools: ['[Tool 1]', '[Tool 2]'],
    sample: true,
    caseStudy: {
      overview: 'Summarise the brief, the constraints and the result.',
      outcome: 'Describe the outcome in your own honest terms.',
    },
  },
  {
    slug: 'sample-web-app',
    kind: 'code',
    title: 'Sample — Web application',
    category: 'Web',
    year: 2026,
    status: 'In progress',
    summary: 'Placeholder for a web project. Explain what it does and how it works in two sentences.',
    problem: 'The specific problem this project solves, and for whom.',
    tech: ['[Language]', '[Framework]'],
    sample: true,
  },
  {
    slug: 'sample-algorithm-visualiser',
    kind: 'code',
    title: 'Sample — Algorithm study',
    category: 'Algorithms',
    year: 2025,
    status: 'Completed',
    summary: 'Placeholder for an algorithms or data-structures project — an implementation, a visualiser or a write-up.',
    problem: 'What concept were you trying to understand or make clearer?',
    tech: ['[Language]'],
    sample: true,
  },
  {
    slug: 'sample-desktop-tool',
    kind: 'code',
    title: 'Sample — Application',
    category: 'Applications',
    year: 2025,
    status: 'Paused',
    summary: 'Placeholder for a standalone application or command-line tool.',
    problem: 'The task it automates or simplifies.',
    tech: ['[Language]'],
    sample: true,
  },
  {
    slug: 'sample-experiment',
    kind: 'code',
    title: 'Sample — Creative experiment',
    category: 'Experiments',
    year: 2026,
    status: 'Planned',
    summary: 'Placeholder for an experiment: a small prototype, a visual study or a what-if.',
    problem: 'The question you were exploring.',
    tech: ['[Language]'],
    sample: true,
  },
];

export const getProject = (slug: string): Project | undefined => projects.find((p) => p.slug === slug);

export const allCategories = (): string[] => Array.from(new Set(projects.map((p) => p.category)));
