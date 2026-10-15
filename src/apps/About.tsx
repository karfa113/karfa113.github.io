import { profile } from '../data/profile';
import { SectionHeading, Tag } from '../components/ui';
import { useWindowStatus } from '../hooks/useWindowStatus';

const initials = (name: string): string =>
  name
    .replace(/[[\]]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

export default function About() {
  useWindowStatus('Profile');

  return (
    <article className="about">
      <header className="about__hero">
        <div className="monogram mono" aria-hidden="true">
          {initials(profile.name)}
        </div>
        <div>
          <p className="eyebrow mono">{profile.role}</p>
          <h1 className="about__name">{profile.name}</h1>
        </div>
      </header>

      <p className="lede">{profile.intro}</p>

      <section className="about__section" aria-labelledby="about-do">
        <SectionHeading id="about-do">What I do</SectionHeading>
        <div className="about__cards">
          {profile.whatIDo.map((item) => (
            <div key={item.title} className="card">
              <h4>{item.title}</h4>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="about__cols">
        <section className="about__section" aria-labelledby="about-build">
          <SectionHeading id="about-build">What I enjoy building</SectionHeading>
          <ul className="plain-list">
            {profile.building.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>

        <section className="about__section" aria-labelledby="about-explore">
          <SectionHeading id="about-explore">Currently exploring</SectionHeading>
          <div className="tags">
            {profile.exploring.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        </section>
      </div>

      <section className="about__section" aria-labelledby="about-approach">
        <SectionHeading id="about-approach">Approach</SectionHeading>
        <ol className="steps">
          {profile.approach.map((step, i) => (
            <li key={step.title}>
              <span className="steps__n mono">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h4>{step.title}</h4>
                <p>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <blockquote className="pull">{profile.philosophy}</blockquote>
    </article>
  );
}
