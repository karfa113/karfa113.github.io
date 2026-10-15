import { useEffect, useRef, useState } from 'react';
import { profile } from '../data/profile';
import { Icon, type IconName } from '../components/Icon';
import { useWindowStatus } from '../hooks/useWindowStatus';

interface Channel {
  id: string;
  label: string;
  icon: IconName;
  value: string;
  href: string;
  hint: string;
  external: boolean;
}

const display = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

export default function Contact() {
  const [copied, setCopied] = useState<'idle' | 'ok' | 'failed'>('idle');
  const timer = useRef<number>(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const channels: Channel[] = [
    { id: 'email', label: 'Email', icon: 'contact', value: profile.email, href: `mailto:${profile.email}`, hint: 'email', external: false },
    { id: 'github', label: 'GitHub', icon: 'github', value: profile.github, href: profile.github, hint: 'github', external: true },
    { id: 'linkedin', label: 'LinkedIn', icon: 'linkedin', value: profile.linkedin, href: profile.linkedin, hint: 'linkedin', external: true },
    ...profile.socials.map((s) => ({
      id: s.id,
      label: s.label,
      icon: (s.id in ({ instagram: 1, github: 1, linkedin: 1 }) ? s.id : 'link') as IconName,
      value: s.url,
      href: s.url,
      hint: s.id,
      external: true,
    })),
  ];

  const configured = channels.filter((c) => c.value.trim() !== '').length;
  useWindowStatus(`${configured} of ${channels.length} channels set`);

  /** Success is only reported after the clipboard write actually resolves. */
  const copyEmail = async () => {
    window.clearTimeout(timer.current);
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(profile.email);
      setCopied('ok');
    } catch {
      setCopied('failed');
    }
    timer.current = window.setTimeout(() => setCopied('idle'), 2200);
  };

  return (
    <div className="term">
      <p className="term__line mono">
        <span className="term__prompt">$</span> contact --list
      </p>
      <p className="term__comment mono"># {profile.collaboration}</p>

      <ul className="channels">
        {channels.map((c) => {
          const set = c.value.trim() !== '';
          return (
            <li key={c.id} className="channel" data-set={set}>
              <span className="channel__icon">
                <Icon name={c.icon} size={18} />
              </span>
              <div className="channel__text">
                <span className="eyebrow mono">{c.label}</span>
                {set ? (
                  <span className="channel__value">{c.id === 'email' ? c.value : display(c.value)}</span>
                ) : (
                  <span className="channel__value channel__value--empty">
                    Not set — add <code className="mono">{c.hint}</code> in src/data/profile.ts
                  </span>
                )}
              </div>
              {set ? (
                <div className="channel__actions">
                  {c.id === 'email' ? (
                    <button type="button" className="btn" onClick={copyEmail} aria-live="polite">
                      <Icon name={copied === 'ok' ? 'check' : 'copy'} size={14} />
                      {copied === 'ok' ? 'Copied' : copied === 'failed' ? 'Copy failed' : 'Copy'}
                    </button>
                  ) : null}
                  <a
                    className="btn btn--primary"
                    href={c.href}
                    {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    {c.id === 'email' ? 'Write' : 'Open'} <Icon name={c.external ? 'external' : 'arrow'} size={14} />
                  </a>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      {copied === 'failed' ? (
        <p className="term__error mono" role="alert">
          Could not access the clipboard — select the address and copy it manually.
        </p>
      ) : null}
    </div>
  );
}
