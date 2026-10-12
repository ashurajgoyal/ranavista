import { site } from '../config/site';

const paths = {
  linkedin:
    'M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.3 8h4.4v14H.3V8zm7.3 0h4.2v1.9h.06c.58-1.1 2.02-2.27 4.16-2.27 4.45 0 5.27 2.93 5.27 6.74V22h-4.39v-6.7c0-1.6-.03-3.66-2.23-3.66-2.23 0-2.57 1.74-2.57 3.54V22H7.6V8z',
  facebook:
    'M14 8.5V6.6c0-.86.2-1.3 1.53-1.3H17.5V2.1A26 26 0 0 0 14.7 2C12 2 10.5 3.6 10.5 6.3v2.2H8v3.3h2.5V22H14V11.8h2.9l.4-3.3H14z',
  instagram:
    'M12 7.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6zm0 7.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2zM17.3 5.6a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2zM21.9 7.9c-.1-1.6-.4-3-1.6-4.2S17.7 2.2 16.1 2.1c-1.6-.1-6.6-.1-8.2 0-1.6.1-3 .4-4.2 1.6S2.2 6.3 2.1 7.9c-.1 1.6-.1 6.6 0 8.2.1 1.6.4 3 1.6 4.2s2.6 1.5 4.2 1.6c1.6.1 6.6.1 8.2 0 1.6-.1 3-.4 4.2-1.6s1.5-2.6 1.6-4.2c.1-1.6.1-6.6 0-8.2zm-2.1 9.9a3.2 3.2 0 0 1-1.8 1.8c-1.3.5-4.3.4-5.7.4s-4.4.1-5.7-.4a3.2 3.2 0 0 1-1.8-1.8c-.5-1.3-.4-4.3-.4-5.8s-.1-4.4.4-5.7A3.2 3.2 0 0 1 6.6 4.5c1.3-.5 4.3-.4 5.7-.4s4.4-.1 5.7.4a3.2 3.2 0 0 1 1.8 1.8c.5 1.3.4 4.3.4 5.7s.1 4.5-.4 5.8z',
  youtube:
    'M23.5 6.5a3 3 0 0 0-2.1-2.1C19.5 4 12 4 12 4s-7.5 0-9.4.4A3 3 0 0 0 .5 6.5 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.5 3 3 0 0 0 2.1 2.1C4.5 20 12 20 12 20s7.5 0 9.4-.4a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.5zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z',
};

const labels = { linkedin: 'LinkedIn', facebook: 'Facebook', instagram: 'Instagram', youtube: 'YouTube' };

/** Renders only the networks that have a link in site.social. */
export function SocialIcons({ className = '' }) {
  const items = Object.entries(site.social).filter(([, url]) => url);
  if (!items.length) return null;
  return (
    <div className={`flex gap-3 ${className}`}>
      {items.map(([key, url]) => (
        <a
          key={key}
          href={url}
          target="_blank"
          rel="noreferrer"
          aria-label={labels[key]}
          className="flex size-10 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-accent-400 hover:text-accent-300"
        >
          <svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor" aria-hidden="true">
            <path d={paths[key]} />
          </svg>
        </a>
      ))}
    </div>
  );
}
