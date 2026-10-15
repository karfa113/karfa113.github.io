import { useState } from 'react';
import { profile } from '../data/profile';
import { experience } from '../data/experience';
import { education } from '../data/academics';
import { Icon } from '../components/Icon';
import { useWindowStatus } from '../hooks/useWindowStatus';

type Tab = 'preview' | 'pdf';

export default function Resume() {
  const hasPdf = profile.resumeUrl.trim() !== '';
  const [tab, setTab] = useState<Tab>('preview');
  useWindowStatus(hasPdf ? 'PDF linked' : 'No PDF linked');

  const contacts = [profile.email, profile.github, profile.linkedin].filter(Boolean);

  return (
    <div className="resume">
      <div className="resume__bar">
        <div className="seg seg--text" role="tablist" aria-label="Resume view">
          <button type="button" role="tab" aria-selected={tab === 'preview'} onClick={() => setTab('preview')}>
            Preview
          </button>
          {hasPdf ? (
            <button type="button" role="tab" aria-selected={tab === 'pdf'} onClick={() => setTab('pdf')}>
              PDF
            </button>
          ) : null}
        </div>
        <div className="resume__actions">
          {hasPdf ? (
            <>
              <a className="btn" href={profile.resumeUrl} target="_blank" rel="noopener noreferrer">
                Open in new tab <Icon name="external" size={14} />
              </a>
              <a className="btn btn--primary" href={profile.resumeUrl} download>
                <Icon name="download" size={14} /> Download PDF
              </a>
            </>
          ) : (
            <button type="button" className="btn" disabled title="Add a PDF first — see the note below">
              <Icon name="download" size={14} /> Download PDF
            </button>
          )}
        </div>
      </div>

      {!hasPdf ? (
        <div className="notice" role="note">
          <Icon name="file" size={16} />
          <p>
            <strong>No resume PDF linked yet.</strong> Put your file in <code className="mono">public/resume.pdf</code> and set{' '}
            <code className="mono">resumeUrl: './resume.pdf'</code> in <code className="mono">src/data/profile.ts</code>. The download and
            open buttons then work automatically.
          </p>
        </div>
      ) : null}

      {tab === 'pdf' && hasPdf ? (
        <object className="resume__pdf" data={profile.resumeUrl} type="application/pdf" aria-label="Resume PDF">
          <p className="prose">
            Your browser cannot display PDFs inline. <a href={profile.resumeUrl}>Download the PDF</a> instead.
          </p>
        </object>
      ) : (
        <article className="paper" aria-label="Resume preview">
          <header className="paper__head">
            <h1>{profile.name}</h1>
            <p>{profile.role}</p>
            {contacts.length > 0 ? <p className="paper__contact">{contacts.join('  ·  ')}</p> : null}
          </header>

          <section>
            <h2>Summary</h2>
            <p>{profile.resume.summary}</p>
          </section>

          <section>
            <h2>Experience</h2>
            {experience.length === 0 ? (
              <p className="paper__empty">No experience added yet.</p>
            ) : (
              experience.map((e) => (
                <div key={e.id} className="paper__row">
                  <div className="paper__rowhead">
                    <strong>{e.role}</strong>
                    <span>
                      {e.start} — {e.end}
                    </span>
                  </div>
                  <em>{e.organization}</em>
                  <ul>
                    {e.responsibilities.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </section>

          <section>
            <h2>Education</h2>
            <div className="paper__row">
              <div className="paper__rowhead">
                <strong>{education.institution}</strong>
                <span>{education.period}</span>
              </div>
              <em>{education.program}</em>
            </div>
          </section>

          <section>
            <h2>Skills</h2>
            {profile.resume.skills.map((g) => (
              <p key={g.group}>
                <strong>{g.group}:</strong> {g.items.join(', ')}
              </p>
            ))}
          </section>
        </article>
      )}
    </div>
  );
}
