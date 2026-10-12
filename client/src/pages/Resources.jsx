import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, ArrowRight, BookOpen, CircleDollarSign, ClipboardCheck, Container, FileText, Info, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react';
import { CtaBand, PageHero, SectionHeading } from '../components/Section';

// ───────────────────────── Currency (live, ECB reference rates) ─────────────────────────

const CURRENCIES = [
  ['USD', 'US Dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'British Pound'],
  ['AUD', 'Australian Dollar'],
  ['CAD', 'Canadian Dollar'],
  ['SGD', 'Singapore Dollar'],
  ['JPY', 'Japanese Yen'],
  ['CNY', 'Chinese Yuan'],
];
const SYMBOLS = CURRENCIES.map(([c]) => c).join(',');
const APIS = ['https://api.frankfurter.dev/v1', 'https://api.frankfurter.app'];

async function fetchRates(path) {
  for (const base of APIS) {
    try {
      const res = await fetch(`${base}/${path}?base=INR&symbols=${SYMBOLS}`);
      if (res.ok) return await res.json();
    } catch {
      /* try next */
    }
  }
  throw new Error('unavailable');
}

function useRates() {
  const [state, setState] = useState({ loading: true });
  const load = async () => {
    setState((s) => ({ ...s, loading: true, error: false }));
    try {
      const latest = await fetchRates('latest');
      const prevDay = new Date(`${latest.date}T00:00:00Z`);
      prevDay.setUTCDate(prevDay.getUTCDate() - 1);
      let prev = null;
      try {
        prev = await fetchRates(prevDay.toISOString().slice(0, 10));
        if (prev.date === latest.date) prev = null;
      } catch {
        prev = null;
      }
      setState({ loading: false, date: latest.date, rates: latest.rates, prev: prev?.rates || null });
    } catch {
      setState({ loading: false, error: true });
    }
  };
  useEffect(() => {
    load();
  }, []);
  return { ...state, reload: load };
}

const inr = (n) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: n < 1 ? 4 : 2 })}`;

function CurrencySection() {
  const { loading, error, rates, prev, date, reload } = useRates();
  const [amount, setAmount] = useState('1000');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('INR');

  // rates[X] = units of X per 1 INR
  const perINR = useMemo(() => (rates ? { ...rates, INR: 1 } : null), [rates]);
  const converted = useMemo(() => {
    const n = parseFloat(amount);
    if (!perINR || Number.isNaN(n)) return null;
    return (n / perINR[from]) * perINR[to];
  }, [amount, from, to, perINR]);

  const options = [['INR', 'Indian Rupee'], ...CURRENCIES];

  return (
    <section id="currency" className="scroll-mt-28 py-20">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Currency rates" title="Exchange rates against the Indian Rupee" text="Reference rates for quick pricing checks. Your bank or payment provider will apply its own rate." />
          <button onClick={reload} className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700" disabled={loading}>
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {error ? (
          <p className="mt-10 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <Info className="mt-0.5 size-4 shrink-0" /> Live rates couldn’t be loaded right now. Please try again in a moment.
          </p>
        ) : (
          <>
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
              {CURRENCIES.map(([code, name]) => {
                const value = rates ? 1 / rates[code] : null;
                const before = prev ? 1 / prev[code] : null;
                const change = value && before ? ((value - before) / before) * 100 : null;
                const up = change !== null && change >= 0;
                return (
                  <div key={code} className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">{code}</span>
                      <div>
                        <p className="font-semibold text-ink">{code}</p>
                        <p className="text-xs text-muted">{name}</p>
                      </div>
                    </div>
                    <p className="mt-4 font-display text-2xl font-semibold text-ink">
                      {loading && !rates ? <span className="inline-block h-7 w-24 animate-pulse rounded bg-slate-100" /> : value ? inr(value) : '—'}
                    </p>
                    {change !== null && (
                      <p className={`mt-1 flex items-center gap-1 text-sm font-medium ${up ? 'text-emerald-700' : 'text-red-600'}`}>
                        {up ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                        {up ? '+' : ''}
                        {change.toFixed(2)}%
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Converter */}
            <div className="mt-6 grid items-end gap-4 rounded-xl border border-accent-200 bg-sand/40 p-6 md:grid-cols-[1fr_1fr_auto_1fr]">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Amount</span>
                <input
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1.5 block w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-100"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">From</span>
                <select value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1.5 block w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm">
                  {options.map(([c, n]) => (
                    <option key={c} value={c}>
                      {c} — {n}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => {
                  setFrom(to);
                  setTo(from);
                }}
                className="mx-auto flex size-11 items-center justify-center rounded-full border border-brand-600 text-brand-600 hover:bg-brand-600 hover:text-white"
                aria-label="Swap currencies"
              >
                <ArrowLeftRight className="size-4" />
              </button>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">To</span>
                <select value={to} onChange={(e) => setTo(e.target.value)} className="mt-1.5 block w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm">
                  {options.map(([c, n]) => (
                    <option key={c} value={c}>
                      {c} — {n}
                    </option>
                  ))}
                </select>
              </label>
              <p className="md:col-span-4 font-display text-2xl text-ink" aria-live="polite">
                {converted !== null ? (
                  <>
                    {Number(amount).toLocaleString('en-IN')} {from} ={' '}
                    <span className="font-semibold text-brand-600">
                      {converted.toLocaleString('en-IN', { maximumFractionDigits: 2 })} {to}
                    </span>
                  </>
                ) : (
                  <span className="text-base text-muted">Enter an amount to convert.</span>
                )}
              </p>
            </div>
            {date && (
              <p className="mt-3 text-xs text-muted">
                European Central Bank reference rates for {new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}, via Frankfurter. Change shown against the previous published rate.
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}

// ───────────────────────── Incoterms ─────────────────────────

const INCOTERMS = [
  ['EXW', 'Ex Works', 'Any', 'Buyer collects from the supplier’s premises and handles everything after that, including export clearance.'],
  ['FCA', 'Free Carrier', 'Any', 'Supplier clears goods for export and hands them to the buyer’s carrier at an agreed place.'],
  ['FOB', 'Free On Board', 'Sea', 'Supplier loads goods on the vessel at the port of shipment. Risk passes once on board. The most common term for sea freight.'],
  ['CFR', 'Cost and Freight', 'Sea', 'Supplier pays freight to the destination port; risk passes to the buyer once goods are on board.'],
  ['CIF', 'Cost, Insurance & Freight', 'Sea', 'Like CFR, plus the supplier buys minimum cargo insurance for the buyer.'],
  ['CPT', 'Carriage Paid To', 'Any', 'Supplier pays carriage to the named destination; risk passes at the first carrier.'],
  ['CIP', 'Carriage & Insurance Paid To', 'Any', 'Like CPT, plus the supplier provides higher-level cargo insurance.'],
  ['DAP', 'Delivered At Place', 'Any', 'Supplier delivers to the named place, ready for unloading. Buyer pays import duties.'],
  ['DPU', 'Delivered at Place Unloaded', 'Any', 'Like DAP, but the supplier also unloads the goods at destination.'],
  ['DDP', 'Delivered Duty Paid', 'Any', 'Supplier delivers to the door with import duties and taxes paid — maximum responsibility on the supplier.'],
];

// ───────────────────────── Containers ─────────────────────────

const CONTAINERS = [
  ['20ft Standard', '5.90 × 2.35 × 2.39 m', '≈ 33 m³', '≈ 25–28 m³', 'Dense or heavy goods, smaller orders'],
  ['40ft Standard', '12.03 × 2.35 × 2.39 m', '≈ 67 m³', '≈ 54–58 m³', 'Furniture and mixed home goods'],
  ['40ft High Cube', '12.03 × 2.35 × 2.69 m', '≈ 76 m³', '≈ 65–68 m³', 'Bulky, lightweight items like upholstery and lighting'],
];

const CHECKLIST = [
  'Product description with materials, finish and dimensions',
  'Quantity, plus any minimum order you can accept',
  'Target price per unit and currency',
  'Required delivery date and destination port or city',
  'Preferred Incoterm (FOB, CIF, DDP…)',
  'Packaging, labelling and barcode requirements',
  'Certifications or test reports needed (e.g. for EU or US markets)',
  'Reference images, drawings or tech packs',
];

export default function Resources() {
  return (
    <>
      <PageHero
        crumbs={['Resources']}
        eyebrow="Resources"
        title="Tools & guides for smarter sourcing"
        subtitle="Live currency rates, shipping terms, container sizes and a checklist for writing a request suppliers can quote on quickly."
      >
        <div className="mt-8 flex flex-wrap gap-2">
          {[
            ['#currency', 'Currency rates', CircleDollarSign],
            ['#incoterms', 'Incoterms', FileText],
            ['#containers', 'Containers', Container],
            ['#checklist', 'RFQ checklist', ClipboardCheck],
          ].map(([href, label, Icon]) => (
            <a
              key={href}
              href={href}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-brand-100 transition hover:border-accent-400 hover:text-white"
            >
              <Icon className="size-4 text-accent-300" /> {label}
            </a>
          ))}
        </div>
      </PageHero>

      <CurrencySection />

      <section id="incoterms" className="scroll-mt-28 bg-sand/50 py-20">
        <div className="container-x">
          <SectionHeading
            eyebrow="Shipping terms"
            title="Incoterms® 2020 at a glance"
            text="Incoterms decide who pays for transport, insurance and duties, and where risk passes from supplier to buyer. Agree one with your supplier on every quote."
          />
          <div className="mt-10 overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-brand-600 text-white">
                <tr>
                  <th className="px-5 py-3 font-medium">Term</th>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Transport</th>
                  <th className="px-5 py-3 font-medium">What it means</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {INCOTERMS.map(([code, name, mode, text]) => (
                  <tr key={code} className="align-top hover:bg-paper">
                    <td className="px-5 py-4">
                      <span className="rounded bg-accent-100 px-2 py-1 font-semibold text-accent-800">{code}</span>
                    </td>
                    <td className="px-5 py-4 font-medium text-ink">{name}</td>
                    <td className="px-5 py-4 text-muted">{mode === 'Sea' ? 'Sea & inland waterway' : 'Any mode'}</td>
                    <td className="px-5 py-4 leading-relaxed text-slate-600">{text}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted">Incoterms® is a trademark of the International Chamber of Commerce. This is a simplified summary — refer to the ICC rules for full obligations.</p>
        </div>
      </section>

      <section id="containers" className="container-x scroll-mt-28 py-20">
        <SectionHeading
          eyebrow="Container guide"
          title="How much fits in a container?"
          text="Approximate internal dimensions and capacity. The practical load is lower than the full volume because cartons rarely fill every gap."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {CONTAINERS.map(([name, dims, vol, usable, best], i) => (
            <div key={name} className={`rounded-xl border p-6 ${i === 1 ? 'border-accent-300 bg-white shadow-lg' : 'border-slate-200 bg-white'}`}>
              <Container className="size-8 text-accent-600" />
              <h3 className="mt-4 text-xl font-semibold">{name}</h3>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                  <dt className="text-muted">Inside (L × W × H)</dt>
                  <dd className="text-right font-medium text-ink">{dims}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                  <dt className="text-muted">Full volume</dt>
                  <dd className="font-medium text-ink">{vol}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                  <dt className="text-muted">Practical load</dt>
                  <dd className="font-semibold text-brand-600">{usable}</dd>
                </div>
              </dl>
              <p className="mt-4 text-sm text-slate-600">{best}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted">Exact dimensions and weight limits vary by shipping line and route. Our container fill optimizer is coming soon for registered buyers.</p>
      </section>

      <section id="checklist" className="scroll-mt-28 bg-brand-600 py-20">
        <div className="container-x grid gap-12 lg:grid-cols-2 lg:items-center">
          <SectionHeading
            light
            eyebrow="RFQ checklist"
            title="Write a request suppliers can quote on fast"
            text="Complete requests get faster, more accurate quotes. Use this list before you post."
          />
          <ol className="space-y-3">
            {CHECKLIST.map((item, i) => (
              <li key={item} className="flex items-start gap-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-brand-100">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-500 text-xs font-semibold text-brand-950">{i + 1}</span>
                {item}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-x pt-20">
        <SectionHeading eyebrow="Guides" title="Learn more" />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ['/how-it-works', 'How it works', 'From request to delivery, step by step.'],
            ['/pricing', 'Plans & pricing', 'Free and paid plans for buyers and suppliers.'],
            ['/faq', 'Frequently asked questions', 'Quick answers about matching, payments and more.'],
          ].map(([to, title, text]) => (
            <Link key={to} to={to} className="group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-6 transition hover:border-accent-400">
              <BookOpen className="mt-1 size-5 shrink-0 text-accent-600" />
              <div className="flex-1">
                <p className="font-display text-lg font-semibold text-ink">{title}</p>
                <p className="mt-1 text-sm text-muted">{text}</p>
              </div>
              <ArrowRight className="mt-1 size-4 text-brand-600 transition group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
