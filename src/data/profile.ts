/**
 * ─────────────────────────────────────────────────────────────
 *  PROFILE — edit this file to make MONO OS yours.
 *  Anything left empty ('' or []) is shown as an intentional,
 *  clearly-labelled empty state instead of fake content.
 * ─────────────────────────────────────────────────────────────
 */

const name = 'MONOJIT KARFA';

export const profile = {
  name,
  role: 'Designer & Developer',

  intro: `Hi, I'm ${name} — a designer and developer interested in building thoughtful digital experiences. I explore the intersection of interface design, code, and creative problem-solving.`,

  whatIDo: [
    { title: 'UI / UX design', body: 'Turning loosely defined problems into clear, usable interfaces and flows.' },
    { title: 'Frontend development', body: 'Translating design intent into responsive, accessible interfaces.' },
    { title: 'Programming', body: 'Data structures, algorithms and small tools that make ideas testable.' },
  ],

  building: [
    'Interfaces that feel considered down to the smallest state.',
    'Small, focused tools that solve one problem well.',
    'Experiments that test how design and code can shape each other.',
  ],

  approach: [
    { title: 'Start with the problem', body: 'Understand who it is for and what they are trying to do before drawing a single screen.' },
    { title: 'Design in the medium', body: 'Prototype in code early so behaviour, motion and edge cases are real, not imagined.' },
    { title: 'Remove, then refine', body: 'Every element needs a reason to exist. Spacing, type and contrast carry the hierarchy.' },
  ],

  exploring: ['Interaction design for the web', 'Design systems and tokens', 'Algorithms and how they are visualised'],

  philosophy: 'Quiet interfaces, loud ideas. Good design should be felt more than it is noticed.',

  /** Contact — leave a value empty and its action is disabled (no dead links). */
  email: 'monojit.karfa.24@aot.edu.in',
  github: 'https://github.com/karfa113',
  linkedin: 'https://linkedin.com/in/karfa113',
  /** Extra links, e.g. { id: 'dribbble', label: 'Dribbble', url: 'https://…' } */
  socials: [
    { id: 'instagram', label: 'Instagram', url: 'https://instagram.com/wl_monojit' },
  ] as { id: string; label: string; url: string }[],
  collaboration:
    "Open to collaborations, internships and interesting problems. If you're building something thoughtful, I'd like to hear about it.",

  /**
   * Resume — put your PDF in /public (e.g. public/resume.pdf) and set
   * resumeUrl to './resume.pdf'. While empty, the Resume app shows setup instructions.
   */
  resumeUrl: '',
  resume: {
    summary: 'A short professional summary goes here — two or three lines on what you do and what you are looking for.',
    skills: [
      { group: 'Design', items: ['Interface design', 'Prototyping', 'Design systems'] },
      { group: 'Development', items: ['TypeScript', 'React', 'HTML & CSS'] },
      { group: 'Foundations', items: ['Data structures', 'Algorithms'] },
    ],
  },
};
