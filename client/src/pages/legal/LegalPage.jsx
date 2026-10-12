import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { PageHero } from '../../components/Section';
import { site } from '../../config/site';

const POLICIES = [
  ['/privacy-policy', 'Privacy Policy'],
  ['/terms', 'Terms & Conditions'],
  ['/refund-policy', 'Refund & Cancellation'],
  ['/cookie-policy', 'Cookie Policy'],
];

/** Shared layout for policy pages: hero, sticky contents list, long-form body. */
export function LegalPage({ title, intro, sections }) {
  return (
    <>
      <PageHero crumbs={['Legal', title]} eyebrow="Legal" title={title} subtitle={`Last updated: ${site.policiesUpdated}`} />
      <div className="container-x grid gap-12 py-16 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-700">On this page</p>
          <ol className="mt-4 space-y-1 border-l border-slate-200">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-sm text-slate-600 hover:border-accent-500 hover:text-ink">
                  {i + 1}. {s.title}
                </a>
              </li>
            ))}
          </ol>
          <div className="mt-8 rounded-xl bg-sand/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-700">Other policies</p>
            <ul className="mt-3 space-y-2">
              {POLICIES.filter(([, t]) => t !== title).map(([to, t]) => (
                <li key={to}>
                  <Link to={to} className="flex items-center gap-2 text-sm text-brand-600 hover:underline">
                    <FileText className="size-4" /> {t}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <article className="prose-rv max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-10">
          <div className="text-[15px] leading-7 text-slate-600">{intro}</div>
          {sections.map((s, i) => (
            <section key={s.id} id={s.id}>
              <h2>
                {i + 1}. {s.title}
              </h2>
              {s.body}
            </section>
          ))}
          <p className="!mt-12 rounded-lg border border-accent-200 bg-accent-50 p-4 !text-sm">
            Questions about this policy? Write to us at <a href={`mailto:${site.email}`}>{site.email}</a> or use our <Link to="/contact">contact form</Link>.
          </p>
        </article>
      </div>
    </>
  );
}
