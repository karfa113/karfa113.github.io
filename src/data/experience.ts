import type { TimelineEntry } from '../types';

/**
 * EXPERIENCE — verified roles only. Entries marked `sample: true` are placeholders.
 * Replace them with real organisations and dates, then delete the flag.
 */
export const experience: TimelineEntry[] = [
  {
    id: 'sample-1',
    organization: '[Organisation]',
    role: '[Role — e.g. Design team member]',
    start: '[Start]',
    end: '[End or Present]',
    summary: 'A one-line summary of the role.',
    responsibilities: ['A responsibility you actually held.', 'Another responsibility.'],
    contributions: ['A contribution you can describe honestly.'],
    sample: true,
  },
  {
    id: 'sample-2',
    organization: '[Student organisation or club]',
    role: '[Role]',
    start: '[Start]',
    end: '[End]',
    responsibilities: ['What you were responsible for.'],
    sample: true,
  },
];
