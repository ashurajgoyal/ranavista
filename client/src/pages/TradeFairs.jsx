import { useMemo, useState } from 'react';
import { CalendarDays, ExternalLink, Info, MapPin } from 'lucide-react';
import { countries as sourcingCountries, fairDates, fairStatus, tradeFairs } from '../data/catalog';
import { CtaBand, PageHero } from '../components/Section';

const STATUS = {
  upcoming: ['Upcoming', 'bg-accent-100 text-accent-800'],
  live: ['Happening now', 'bg-emerald-50 text-emerald-700'],
  past: ['Ended', 'bg-slate-100 text-slate-600'],
};

const codeFor = (name) => sourcingCountries.find((c) => c.name === name)?.code || name.slice(0, 2).toUpperCase();

export default function TradeFairs() {
  const [country, setCountry] = useState('All');
  const allCountries = useMemo(() => ['All', ...new Set(tradeFairs.map((f) => f.country))], []);

  const list = useMemo(() => {
    const rank = { live: 0, upcoming: 1, null: 2, past: 3 };
    return tradeFairs
      .filter((f) => country === 'All' || f.country === country)
      .slice()
      .sort((a, b) => rank[fairStatus(a)] - rank[fairStatus(b)]);
  }, [country]);

  return (
    <>
      <PageHero
        crumbs={['Trade Fairs']}
        eyebrow="Trade fairs"
        title="Home & lifestyle trade-fair calendar"
        subtitle="The exhibitions where buyers discover new collections and makers launch them. Meet us there, or let us source on your behalf."
      />

      <section className="container-x py-16">
        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Filter by country">
          {allCountries.map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={country === c}
              onClick={() => setCountry(c)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                country === c ? 'bg-brand-600 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:border-accent-400'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {list.map((f) => {
            const status = fairStatus(f);
            return (
              <article key={f.name} className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 transition hover:border-accent-300 hover:shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-12 items-center justify-center rounded-md bg-brand-600 text-xs font-semibold tracking-wider text-accent-300">
                      {codeFor(f.country)}
                    </span>
                    <div>
                      <h2 className="font-display text-xl font-semibold leading-tight">{f.name}</h2>
                      <p className="text-sm text-muted">{f.country}</p>
                    </div>
                  </div>
                  {status && <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS[status][1]}`}>{STATUS[status][0]}</span>}
                </div>
                <ul className="mt-5 space-y-2 text-sm text-slate-700">
                  <li className="flex items-center gap-2">
                    <CalendarDays className="size-4 text-accent-600" />
                    <span className={f.start ? 'font-medium text-brand-600' : ''}>{fairDates(f)}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-accent-600" /> {f.venue}, {f.city}
                  </li>
                </ul>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {f.focus.map((t) => (
                    <span key={t} className="rounded bg-paper px-2 py-1 text-[11px] text-slate-600">
                      {t}
                    </span>
                  ))}
                </div>
                {f.url && (
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-medium text-brand-600 hover:text-brand-700"
                  >
                    Official website <ExternalLink className="size-3.5" />
                  </a>
                )}
              </article>
            );
          })}
        </div>

        <p className="mt-8 flex items-start gap-2 rounded-lg border border-info-200 bg-info-50 px-4 py-3 text-sm text-info-800">
          <Info className="mt-0.5 size-4 shrink-0" />
          Dates and venues are set by each organiser and can change. Always confirm on the official website before you travel.
        </p>
      </section>

      <CtaBand title="Can’t make it to the fair?" text="Send us your requirements and we’ll connect you with a verified supplier — no travel needed." />
    </>
  );
}
