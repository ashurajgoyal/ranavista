import { Link } from 'react-router-dom';
import { CalendarDays, MapPin } from 'lucide-react';
import { countries } from '../data/catalog';
import { CountryBadge, CtaBand, PageHero, SectionHeading } from '../components/Section';

export default function SourcingCountries() {
  return (
    <>
      <PageHero
        crumbs={['Sourcing Countries']}
        eyebrow="Where we source"
        title="Sourcing countries & craft clusters"
        subtitle="Great products come from places with deep skill in a craft. We work with suppliers in established export hubs across India and Asia."
      >
        <div className="mt-8 flex flex-wrap gap-2">
          {countries.map((c) => (
            <a
              key={c.code}
              href={`#${c.code.toLowerCase()}`}
              className="flex items-center gap-2 rounded-full border border-white/20 py-1 pl-1 pr-3.5 text-xs text-brand-100 transition hover:border-accent-400 hover:text-white"
            >
              <span className="flex size-6 items-center justify-center rounded-full bg-accent-500 text-[9px] font-semibold text-brand-950">{c.code}</span>
              {c.name}
            </a>
          ))}
        </div>
      </PageHero>

      <section className="container-x py-20">
        <div className="grid gap-6 lg:grid-cols-2">
          {countries.map((c, i) => (
            <article
              key={c.code}
              id={c.code.toLowerCase()}
              className={`flex scroll-mt-28 flex-col overflow-hidden rounded-2xl border bg-white ${i === 0 ? 'border-accent-300 lg:col-span-2' : 'border-slate-200'}`}
            >
              <div className={`flex items-center gap-4 px-6 py-5 sm:px-8 ${i === 0 ? 'bg-brand-600' : 'bg-sand/60'}`}>
                <CountryBadge code={c.code} className="size-12 text-sm" />
                <div>
                  <h2 className={`text-2xl font-semibold ${i === 0 ? '!text-white' : ''}`}>{c.name}</h2>
                  <p className={`text-sm ${i === 0 ? 'text-accent-300' : 'text-accent-700'}`}>{c.headline}</p>
                </div>
                {i === 0 && <span className="ml-auto hidden rounded-full bg-accent-500 px-3 py-1 text-xs font-medium text-brand-950 sm:block">Our home base</span>}
              </div>
              <div className={`grid flex-1 gap-8 p-6 sm:p-8 ${i === 0 ? 'lg:grid-cols-3' : ''}`}>
                <div>
                  <p className="leading-relaxed text-slate-600">{c.text}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {c.strengths.map((s) => (
                      <span key={s} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-700">Key hubs</p>
                  <ul className="mt-3 divide-y divide-slate-100">
                    {c.hubs.map(([city, what]) => (
                      <li key={city} className="flex items-start gap-3 py-2.5 text-sm">
                        <MapPin className="mt-0.5 size-4 shrink-0 text-accent-600" />
                        <span>
                          <span className="font-medium text-ink">{city}</span>
                          <span className="text-muted"> — {what}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-700">Trade fairs</p>
                  <ul className="mt-3 space-y-2">
                    {c.fairs.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                        <CalendarDays className="size-4 text-brand-600" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link to="/trade-fairs" className="mt-4 inline-block text-sm font-medium text-brand-600 hover:underline">
                    View trade-fair calendar →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-sand/50 py-20">
        <div className="container-x grid gap-10 lg:grid-cols-2 lg:items-center">
          <SectionHeading
            eyebrow="Not sure where to source?"
            title="Let our team recommend the right country"
            text="Tell us the product, quantity, quality level and target price. We’ll match you with a supplier in the cluster best suited to your order — balancing cost, lead time and craftsmanship."
          />
          <ul className="grid gap-4 sm:grid-cols-2">
            {[
              ['Cost', 'Labour and material costs vary widely by country.'],
              ['Lead time', 'Production capacity and shipping routes affect delivery.'],
              ['Craft', 'Some techniques are only done well in specific regions.'],
              ['Compliance', 'Certifications and duties differ by origin and destination.'],
            ].map(([t, d]) => (
              <li key={t} className="rounded-xl border border-accent-200 bg-white p-5">
                <p className="font-display text-lg font-semibold text-ink">{t}</p>
                <p className="mt-1 text-sm text-muted">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
