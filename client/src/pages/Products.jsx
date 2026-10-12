import { Link } from 'react-router-dom';
import { ArrowRight, Check, MapPin } from 'lucide-react';
import { categories, countries } from '../data/catalog';
import { CountryBadge, CtaBand, PageHero } from '../components/Section';
import { useAuth } from '../context/AuthContext';

const codeFor = (name) => countries.find((c) => c.name === name)?.code || name.slice(0, 2).toUpperCase();

export default function Products() {
  const { user } = useAuth();
  const requestLink = user ? '/dashboard' : '/register?role=buyer';

  return (
    <>
      <PageHero
        crumbs={['Products']}
        eyebrow="What we source"
        title="Home & lifestyle product categories"
        subtitle="Tell us what you need in any of these categories — our team will match your request with a verified specialist supplier."
      >
        <div className="mt-8 flex flex-wrap gap-2">
          {categories.map((c) => (
            <a
              key={c.slug}
              href={`#${c.slug}`}
              className="rounded-full border border-white/20 px-3.5 py-1.5 text-xs text-brand-100 transition hover:border-accent-400 hover:text-white"
            >
              {c.name}
            </a>
          ))}
        </div>
      </PageHero>

      <section className="container-x space-y-6 py-20">
        {categories.map(({ slug, name, icon: Icon, summary, items, hubs }, i) => (
          <article
            key={slug}
            id={slug}
            className="grid scroll-mt-28 gap-8 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 lg:grid-cols-[1.1fr_1fr_0.8fr]"
          >
            <div>
              <div className="flex items-center gap-4">
                <span className={`flex size-14 items-center justify-center rounded-xl ${i % 2 ? 'bg-accent-100 text-accent-800' : 'bg-brand-600 text-accent-300'}`}>
                  <Icon className="size-7" />
                </span>
                <span className="font-display text-4xl font-semibold text-slate-200">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <h2 className="mt-6 text-3xl font-semibold">{name}</h2>
              <p className="mt-3 leading-relaxed text-muted">{summary}</p>
              <Link
                to={requestLink}
                className="mt-6 inline-flex items-center gap-2 rounded-md bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700"
              >
                Request a quote <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="rounded-xl bg-paper p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-700">Typical products</p>
              <ul className="mt-4 space-y-2.5">
                {items.map((it) => (
                  <li key={it} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand-600" /> {it}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-700">Key sourcing countries</p>
              <ul className="mt-4 space-y-3">
                {hubs.map((h) => (
                  <li key={h}>
                    <Link to={`/sourcing-countries#${codeFor(h).toLowerCase()}`} className="flex items-center gap-3 text-sm font-medium text-ink hover:text-brand-600">
                      <CountryBadge code={codeFor(h)} className="size-8 text-[10px]" /> {h}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-muted">
                <MapPin className="mt-0.5 size-3.5 shrink-0" />
                Need a different material, finish or country? Mention it in your request.
              </p>
            </div>
          </article>
        ))}
      </section>

      <CtaBand title="Can’t find your product?" text="We source well beyond these categories. Describe what you need and our team will tell you if we can help." />
    </>
  );
}
