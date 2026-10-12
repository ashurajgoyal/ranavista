import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarDays, FileText, Globe, Package, Search, X } from 'lucide-react';
import { categories, countries, tradeFairs } from '../data/catalog';

const PAGES = [
  ['Home', '/', 'start overview'],
  ['About Us', '/about', 'company story mission vision values'],
  ['Products', '/products', 'categories catalogue'],
  ['Sourcing Countries', '/sourcing-countries', 'india vietnam indonesia turkey bangladesh china'],
  ['Trade Fairs', '/trade-fairs', 'exhibitions events calendar'],
  ['Resources', '/resources', 'tools guides'],
  ['Currency rates', '/resources#currency', 'exchange rate usd inr euro converter'],
  ['Incoterms guide', '/resources#incoterms', 'fob cif exw ddp shipping terms'],
  ['Container guide', '/resources#containers', '20ft 40ft high cube cbm load'],
  ['How It Works', '/how-it-works', 'process rfq quote escrow steps buyers suppliers'],
  ['Pricing', '/pricing', 'plans subscription cost price'],
  ['FAQ', '/faq', 'questions help support'],
  ['Contact Us', '/contact', 'email phone enquiry support'],
  ['Become a supplier', '/register?role=seller', 'sell seller exporter manufacturer join'],
  ['Privacy Policy', '/privacy-policy', 'data personal information'],
  ['Terms & Conditions', '/terms', 'terms of use agreement'],
  ['Refund & Cancellation Policy', '/refund-policy', 'refund cancel subscription money back'],
  ['Cookie Policy', '/cookie-policy', 'cookies storage tracking'],
];

function buildIndex() {
  return [
    ...PAGES.map(([title, to, kw]) => ({ type: 'Page', icon: FileText, title, to, text: kw })),
    ...categories.map((c) => ({
      type: 'Product',
      icon: Package,
      title: c.name,
      to: `/products#${c.slug}`,
      text: `${c.summary} ${c.items.join(' ')}`,
    })),
    ...countries.map((c) => ({
      type: 'Country',
      icon: Globe,
      title: c.name,
      to: `/sourcing-countries#${c.code.toLowerCase()}`,
      text: `${c.headline} ${c.strengths.join(' ')} ${c.hubs.map((h) => h.join(' ')).join(' ')}`,
    })),
    ...tradeFairs.map((f) => ({
      type: 'Trade fair',
      icon: CalendarDays,
      title: f.name,
      to: '/trade-fairs',
      text: `${f.city} ${f.country} ${f.focus.join(' ')}`,
    })),
  ];
}

export function SiteSearch({ open, onClose }) {
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const index = useMemo(buildIndex, []);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return index.filter((r) => r.type === 'Page').slice(0, 8);
    const words = term.split(/\s+/);
    return index
      .map((r) => {
        const title = r.title.toLowerCase();
        const hay = `${title} ${r.text.toLowerCase()}`;
        if (!words.every((w) => hay.includes(w))) return null;
        return { ...r, score: title.startsWith(term) ? 3 : title.includes(term) ? 2 : 1 };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [q, index]);

  useEffect(() => {
    if (open) {
      setQ('');
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  useEffect(() => setActive(0), [q]);

  if (!open) return null;

  const go = (r) => {
    onClose();
    navigate(r.to);
  };

  const onKey = (e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    }
    if (e.key === 'Enter' && results[active]) go(results[active]);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Search">
      <div className="absolute inset-0 bg-brand-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl animate-fade-up">
        <div className="flex items-center gap-3 border-b border-slate-200 px-4">
          <Search className="size-5 text-muted" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
            placeholder="Search products, countries, pages…"
            className="h-14 flex-1 bg-transparent text-[15px] text-ink placeholder:text-slate-400 focus:outline-none"
            aria-label="Search the site"
          />
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:text-ink" aria-label="Close search">
            <X className="size-5" />
          </button>
        </div>
        <ul className="max-h-[50vh] overflow-y-auto p-2" role="listbox">
          {results.map((r, i) => {
            const Icon = r.icon;
            return (
              <li key={`${r.type}-${r.title}`} role="option" aria-selected={i === active}>
                <button
                  onClick={() => go(r)}
                  onMouseEnter={() => setActive(i)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left ${i === active ? 'bg-sand/60' : ''}`}
                >
                  <span className="flex size-9 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                    <Icon className="size-4" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-ink">{r.title}</span>
                    <span className="block text-xs text-muted">{r.type}</span>
                  </span>
                  {i === active && <ArrowRight className="size-4 text-accent-600" />}
                </button>
              </li>
            );
          })}
          {!results.length && <li className="px-3 py-8 text-center text-sm text-muted">No results for “{q}”. Try another word.</li>}
        </ul>
        <div className="hidden items-center gap-4 border-t border-slate-100 bg-slate-50 px-4 py-2 text-[11px] text-muted sm:flex">
          <span>↑ ↓ to move</span>
          <span>Enter to open</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
}
