import type { AcademicFolder } from '../types';

/**
 * ACADEMICS — education and learning archive.
 * Entries marked `sample: true` are placeholders. Replace them with real details;
 * no grades, certificates or achievements are included on purpose.
 */

export const education = {
  institution: '[Your institution]',
  program: '[Your programme / degree]',
  period: '[Start year] – [End year]',
  note: 'Add a sentence about your focus areas.',
  sample: true,
};

export const academicFolders: AcademicFolder[] = [
  {
    id: 'coursework',
    label: 'Coursework',
    description: 'Subjects that shaped how you think and build.',
    items: [
      { title: 'Data Structures & Algorithms', meta: '[Term]', note: 'Add what you covered and what you enjoyed.', sample: true },
      { title: '[Another subject]', meta: '[Term]', note: 'A one-line note.', sample: true },
    ],
  },
  {
    id: 'assignments',
    label: 'Programming assignments',
    description: 'Selected problems and implementations.',
    items: [{ title: '[Assignment title]', meta: '[Language]', note: 'What it asked for and how you approached it.', sample: true }],
  },
  {
    id: 'explorations',
    label: 'Technical explorations',
    description: 'Self-directed learning outside the syllabus.',
    items: [{ title: '[Topic you explored]', meta: '[Year]', note: 'What you built or learned.', sample: true }],
  },
  {
    id: 'notes',
    label: 'Notes & resources',
    description: 'Study notes and resources worth sharing.',
    items: [],
  },
  {
    id: 'certifications',
    label: 'Certifications',
    description: 'Only verified certifications belong here.',
    items: [],
  },
];
