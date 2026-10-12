import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Minus, Plus, Search } from 'lucide-react';
import { faqGroups } from '../data/faqs';
import { CtaBand, PageHero } from '../components/Section';

function Item({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 last:border-0">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-4 py-5 text-left" aria-expanded={open}>
        <span className="font-medium text-ink">{q}</span>
        <span className={`flex size-8 shrink-0 items-center justify-center rounded-full border transition ${open ? 'border-brand-600 bg-brand-600 text-white' : 'border-accent-300 text-accent-700'}`}>
          {open ? <Minus className="size-4" /> : <Plus className="size-4" />}
        </span>
      </button>
      {open && <p className="-mt-1 pb-5 pr-12 text-[15px] leading-relaxed text-slate-600 animate-fade-up">{a}</p>}
    </div>
  );
}

export default function Faq() {
  const [q, setQ] = useState('');
  const groups = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return faqGroups;
    return faqGroups
      .map((g) => ({ ...g, items: g.items.filter(([question, answer]) => `${question} ${answer}`.toLowerCase().includes(term)) }))
      .filter((g) => g.items.length);
  }, [q]);

  return (
    <>
      <PageHero crumbs={['FAQ']} eyebrow="Help centre" title="Frequently asked questions" subtitle="Everything you need to know about sourcing, supplying, plans and payments.">
        <div className="relative mt-8 max-w-lg">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search questions…"
            className="w-full rounded-md border-0 bg-white py-3.5 pl-12 pr-4 text-sm text-ink placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-accent-400/40"
            aria-label="Search questions"
          />
        </div>
      </PageHero>

      <section className="container-x grid gap-10 py-16 lg:grid-cols-[220px_1fr]">
        <nav className="hidden lg:block" aria-label="FAQ sections">
          <ul className="sticky top-28 space-y-1">
            {faqGroups.map((g) => (
              <li key={g.id}>
                <a href={`#${g.id}`} className="block rounded-md border-l-2 border-transparent px-3 py-2 text-sm text-slate-600 hover:border-accent-500 hover:bg-white hover:text-ink">
                  {g.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-8">
          {groups.map((g) => (
            <div key={g.id} id={g.id} className="scroll-mt-28 rounded-xl border border-slate-200 bg-white px-6 sm:px-8">
              <h2 className="border-b border-slate-200 py-5 text-2xl font-semibold">{g.title}</h2>
              {g.items.map(([question, answer]) => (
                <Item key={question} q={question} a={answer} />
              ))}
            </div>
          ))}
          {!groups.length && (
            <p className="rounded-xl border border-slate-200 bg-white p-10 text-center text-muted">
              No questions match “{q}”. <Link to="/contact" className="font-medium text-brand-600">Ask our team</Link>.
            </p>
          )}
          <div className="flex flex-col items-start justify-between gap-4 rounded-xl bg-sand/70 p-6 sm:flex-row sm:items-center">
            <div>
              <p className="font-display text-xl font-semibold text-ink">Still have a question?</p>
              <p className="text-sm text-muted">Our team usually replies within one business day.</p>
            </div>
            <Link to="/contact" className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-5 py-3 text-sm font-medium text-white hover:bg-brand-700">
              <Mail className="size-4" /> Contact us
            </Link>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
