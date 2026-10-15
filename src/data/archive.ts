import type { ArchiveItem } from '../types';

/**
 * ARCHIVE — old experiments, discontinued projects and explorations.
 * The Archive app is hidden everywhere (desktop, dock, launcher, mobile)
 * until it has at least ARCHIVE_MIN_ITEMS entries, so it never feels decorative.
 */
export const ARCHIVE_MIN_ITEMS = 1;

export const archive: ArchiveItem[] = [
  // {
  //   id: 'old-experiment',
  //   title: 'Experiment name',
  //   kind: 'Experiment',
  //   year: 2024,
  //   note: 'What it was and why it was shelved.',
  //   url: 'https://…', // optional — only add real URLs
  // },
];
