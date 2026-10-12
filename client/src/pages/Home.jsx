import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  FileText,
  Globe,
  Handshake,
  MapPin,
  MessagesSquare,
  ShieldCheck,
  Ship,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { categories, countries, fairDates, fairStatus, tradeFairs } from '../data/catalog';
import { faqGroups } from '../data/faqs';
import { site } from '../config/site';
import { CountryBadge, CtaBand, SectionHeading } from '../components/Section';
import { LotusMark } from '../components/Logo';

const steps = [
  { icon: FileText, title: 'Post your request', text: 'Share the product, quantity, budget, timeline and destination. Add specs or reference images.' },
  { icon: UserCheck, title: 'We hand-pick a supplier', text: 'Our sourcing team reviews every request and matches it with the single best-fit verified supplier.' },
  { icon: MessagesSquare, title: 'Receive a focused quote', text: 'Review the quotation, discuss details in chat, and accept when the terms are right.' },
  { icon: ShieldCheck, title: 'Pay with protection', text: 'Order payments are held securely and released to the supplier after you confirm delivery.' },
];

const pillars = [
  { icon: Globe, title: 'Global Sourcing', text: 'Export-ready makers across India and Asia’s leading home and lifestyle hubs.' },
  { icon: Handshake, title: 'Trusted Partnerships', text: 'Every supplier is reviewed before they receive a single lead.' },
  { icon: Sparkles, title: 'Timeless Value', text: 'Craftsmanship and fair pricing that build long-term buying relationships.' },
];

function HeroVisual() {
  const fair = tradeFairs.find((f) => fairStatus(f) && fairStatus(f) !== 'past');
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="absolute -right-6 -top-8 size-56 rounded-full bg-accent-300/40 blur-3xl" />
      <div className="absolute -bottom-10 -left-8 size-48 rounded-full bg-sage/30 blur-3xl" />

      {/* Request card */}
      <div className="relative rounded-xl border border-slate-200 bg-white p-6 shadow-2xl shadow-brand-950/10">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Sourcing request</span>
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">Quote received</span>
        </div>
        <p className="mt-3 font-display text-xl font-semibold text-ink">Hand-block-printed cotton cushion covers</p>
        <dl className="mt-5 grid grid-cols-3 gap-3 text-sm">
          {[
            ['Quantity', '2,000 pcs'],
            ['Target', '$3.20 / pc'],
            ['Ship to', 'Hamburg'],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg bg-paper p-3">
              <dt className="text-[11px] text-muted">{k}</dt>
              <dd className="mt-0.5 font-medium text-ink">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-brand-100 bg-brand-50 p-3">
          <span className="flex size-10 items-center justify-center rounded-md bg-brand-600">
            <LotusMark className="size-6" color="#C6AA7E" />
          </span>
          <div className="flex-1">
            <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
              Matched supplier <BadgeCheck className="size-4 text-brand-600" />
            </p>
            <p className="text-xs text-muted">Jaipur, India · ships in 35 days</p>
          </div>
        </div>
        <p className="mt-4 flex items-center gap-2 text-xs text-muted">
          <Ship className="size-4 text-accent-600" /> Fits about 40% of a 20ft container
        </p>
      </div>

      {/* Trade fair card */}
      {fair && (
        <div className="relative -mt-6 ml-auto w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-xl sm:-mr-6">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent-700">
            <CalendarDays className="size-3.5" /> {fairStatus(fair) === 'live' ? 'Happening now' : 'Next trade fair'}
          </p>
          <p className="mt-1.5 font-display text-base font-semibold text-ink">{fair.name}</p>
          <p className="text-xs text-muted">{fairDates(fair)}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted">
            <MapPin className="size-3.5" /> {fair.city}, {fair.country}
          </p>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const fairs = tradeFairs.slice(0, 4);
  const previewFaqs = faqGroups.flatMap((g) => g.items).slice(0, 4);

  return (
    <>
      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden">
        <div className="bg-grid absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
        <div className="container-x relative grid items-center gap-14 pb-20 pt-14 lg:grid-cols-[1.15fr_1fr] lg:pb-28 lg:pt-20">
          <div className="animate-fade-up">
            <p className="font-display text-lg italic text-accent-700">{site.pillars.join('  |  ')}</p>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.1] sm:text-5xl lg:text-[3.6rem]">
              Connecting the world to <span className="italic text-brand-600">exceptional</span> home &amp; lifestyle products
            </h1>
            <span className="mt-7 block h-px w-20 bg-accent-500" />
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted">
              Post one sourcing request. Our team hand-picks a verified manufacturer to quote — no bidding wars, no spam, and payments protected until delivery.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/register?role=buyer"
                className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-6 py-3.5 text-sm font-medium text-white shadow-lg shadow-brand-900/20 transition hover:bg-brand-700"
              >
                Start sourcing <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/register?role=seller"
                className="inline-flex items-center gap-2 rounded-md bg-accent-500 px-6 py-3.5 text-sm font-medium text-brand-950 transition hover:bg-accent-400"
              >
                Become a supplier
              </Link>
            </div>
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              {['Free to join', 'Verified suppliers', 'Protected payments'].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <BadgeCheck className="size-4 text-brand-600" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <HeroVisual />
        </div>
      </section>

      {/* ───────── Pillars ───────── */}
      <section className="border-y border-accent-200/60 bg-sand/60">
        <div className="container-x grid divide-y divide-accent-200/70 md:grid-cols-3 md:divide-x md:divide-y-0">
          {pillars.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-4 px-2 py-8 md:px-8">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-accent-400 text-accent-700">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="font-display text-xl font-semibold text-ink">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── Categories ───────── */}
      <section className="container-x py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="What we source"
            title="Product categories"
            text="From hand-loomed textiles to solid-wood furniture — sourced from specialist makers in the regions that do it best."
          />
          <Link to="/products" className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:gap-3 hover:text-brand-700">
            View all categories <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          {categories.map(({ slug, name, icon: Icon, summary }) => (
            <Link
              key={slug}
              to={`/products#${slug}`}
              className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition sm:p-5 hover:-translate-y-0.5 hover:border-accent-400 hover:shadow-xl hover:shadow-brand-950/5"
            >
              <span className="flex size-12 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-accent-300">
                <Icon className="size-6" />
              </span>
              <p className="mt-5 font-display text-lg font-semibold text-ink">{name}</p>
              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted">{summary}</p>
              <ArrowRight className="absolute right-5 top-6 size-4 text-accent-500 opacity-0 transition group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </section>

      {/* ───────── How it works ───────── */}
      <section className="relative overflow-hidden bg-brand-600 py-24">
        <div className="bg-weave absolute inset-0 opacity-50" />
        <div className="container-x relative">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading light eyebrow="How it works" title="Curated matching, not a free-for-all" />
            <Link to="/how-it-works" className="inline-flex items-center gap-2 text-sm font-medium text-accent-300 hover:text-accent-200">
              See the full process <ArrowRight className="size-4" />
            </Link>
          </div>
          <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="relative rounded-xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm">
                <span className="font-display text-5xl font-semibold text-accent-500/40">0{i + 1}</span>
                <span className="mt-4 flex size-11 items-center justify-center rounded-full bg-accent-500 text-brand-950">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 text-xl font-semibold !text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-100">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────── Sourcing countries ───────── */}
      <section className="container-x py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Sourcing countries"
              title="Rooted in India, connected across Asia"
              text="We work with makers in established export clusters — the places with generations of skill in each craft."
            />
            <Link
              to="/sourcing-countries"
              className="mt-8 inline-flex items-center gap-2 rounded-md border border-brand-600 px-5 py-3 text-sm font-medium text-brand-600 transition hover:bg-brand-600 hover:text-white"
            >
              Explore sourcing countries <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {countries.map((c) => (
              <Link
                key={c.code}
                to={`/sourcing-countries#${c.code.toLowerCase()}`}
                className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 transition hover:border-accent-400 hover:shadow-lg"
              >
                <CountryBadge code={c.code} />
                <div>
                  <p className="font-display text-lg font-semibold text-ink">{c.name}</p>
                  <p className="mt-0.5 text-xs text-muted">{c.strengths.slice(0, 3).join(' · ')}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Buyers / suppliers ───────── */}
      <section className="bg-sand/50 py-24">
        <div className="container-x grid gap-6 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm sm:p-10">
            <p className="eyebrow">For buyers</p>
            <h3 className="mt-3 text-3xl font-semibold">Quotes from suppliers we’ve checked</h3>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              {[
                'Only your matched supplier sees your request',
                'Order payments protected until you confirm delivery',
                'Plan container loads before you place the order',
                'Start free; upgrade when you need more requests',
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <BadgeCheck className="mt-0.5 size-4 shrink-0 text-brand-600" /> {t}
                </li>
              ))}
            </ul>
            <Link
              to="/register?role=buyer"
              className="mt-8 inline-flex items-center gap-2 rounded-md bg-brand-600 px-6 py-3 text-sm font-medium text-white hover:bg-brand-700"
            >
              Start sourcing free <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-brand-600 p-8 sm:p-10">
            <div className="bg-weave absolute inset-0 opacity-40" />
            <div className="relative">
              <p className="eyebrow !text-accent-300">For suppliers</p>
              <h3 className="mt-3 text-3xl font-semibold !text-white">Serious buyers, no price war</h3>
              <ul className="mt-6 space-y-3 text-sm text-brand-100">
                {[
                  'Each lead goes to you alone — no undercutting',
                  'Payment secured before you ship',
                  'Build a rating that wins you more leads',
                  'Showcase your craft to international buyers',
                ].map((t) => (
                  <li key={t} className="flex gap-3">
                    <BadgeCheck className="mt-0.5 size-4 shrink-0 text-accent-400" /> {t}
                  </li>
                ))}
              </ul>
              <Link
                to="/register?role=seller"
                className="mt-8 inline-flex items-center gap-2 rounded-md bg-accent-500 px-6 py-3 text-sm font-medium text-brand-950 hover:bg-accent-400"
              >
                Apply as a supplier <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Trade fairs ───────── */}
      <section className="container-x py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Trade fairs" title="Where the industry meets" text="Key home and lifestyle exhibitions our team follows throughout the year." />
          <Link to="/trade-fairs" className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700">
            Full trade-fair calendar <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {fairs.map((f) => {
            const status = fairStatus(f);
            return (
              <div key={f.name} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between gap-2">
                  <span className="flex size-11 items-center justify-center rounded-md bg-brand-600 text-accent-300">
                    <CalendarDays className="size-5" />
                  </span>
                  {status === 'upcoming' && <span className="rounded-full bg-accent-100 px-2.5 py-0.5 text-[11px] font-medium text-accent-800">Upcoming</span>}
                  {status === 'live' && <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">Happening now</span>}
                </div>
                <p className="mt-4 font-display text-lg font-semibold text-ink">{f.name}</p>
                <p className="mt-1 text-sm font-medium text-brand-600">{fairDates(f)}</p>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                  <MapPin className="size-3.5" /> {f.city}, {f.country}
                </p>
                <p className="mt-auto pt-4 text-xs text-muted">{f.focus.join(' | ')}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ───────── FAQ preview ───────── */}
      <section className="container-x">
        <div className="grid gap-10 rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <SectionHeading eyebrow="Questions" title="Good to know" />
            <Link to="/faq" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-brand-600">
              Read all FAQs <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="divide-y divide-slate-200">
            {previewFaqs.map(([q, a]) => (
              <details key={q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink">
                  {q}
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-accent-300 text-accent-700 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
