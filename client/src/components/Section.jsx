import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { LotusMark } from './Logo';

/** Dark green hero used at the top of inner pages. */
export function PageHero({ eyebrow, title, subtitle, crumbs = [], children }) {
  return (
    <section className="relative overflow-hidden bg-brand-600 text-white">
      <div className="bg-weave absolute inset-0 opacity-60" />
      <LotusMark className="pointer-events-none absolute -right-10 -top-6 size-72 opacity-[0.07]" color="#C6AA7E" />
      <div className="container-x relative py-14 sm:py-20">
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-brand-200">
            <Link to="/" className="hover:text-white">
              Home
            </Link>
            {crumbs.map((c) => (
              <span key={c} className="flex items-center gap-1.5">
                <ChevronRight className="size-3.5" />
                <span className="text-accent-300">{c}</span>
              </span>
            ))}
          </nav>
        )}
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-300">{eyebrow}</p>}
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl">{title}</h1>
        <span className="mt-6 block h-px w-16 bg-accent-500" />
        {subtitle && <p className="mt-6 max-w-2xl text-base leading-relaxed text-brand-100 sm:text-lg">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, text, center = false, light = false, className = '' }) {
  return (
    <div className={`${center ? 'mx-auto text-center' : ''} max-w-2xl ${className}`}>
      {eyebrow && <p className={`eyebrow ${light ? '!text-accent-300' : ''}`}>{eyebrow}</p>}
      <h2 className={`mt-3 text-3xl font-semibold leading-tight sm:text-4xl ${light ? '!text-white' : ''}`}>{title}</h2>
      <span className={`mt-5 block h-px w-14 bg-accent-500 ${center ? 'mx-auto' : ''}`} />
      {text && <p className={`mt-5 leading-relaxed ${light ? 'text-brand-100' : 'text-muted'}`}>{text}</p>}
    </div>
  );
}

/** Closing call-to-action band shown near the bottom of public pages. */
export function CtaBand({
  title = 'Ready to source with confidence?',
  text = 'Tell us what you need. Our team will match your request with one verified supplier and you’ll receive a focused quotation.',
}) {
  return (
    <section className="container-x my-20">
      <div className="relative overflow-hidden rounded-2xl bg-brand-600 px-6 py-12 sm:px-12 sm:py-14">
        <div className="bg-weave absolute inset-0 opacity-50" />
        <LotusMark className="pointer-events-none absolute -bottom-10 -right-6 size-64 opacity-10" color="#C6AA7E" />
        <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold !text-white sm:text-4xl">{title}</h2>
            <p className="mt-3 text-brand-100">{text}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/register?role=buyer"
              className="inline-flex items-center gap-2 rounded-md bg-accent-500 px-6 py-3 text-sm font-medium text-brand-950 transition hover:bg-accent-400"
            >
              Start sourcing <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-md border border-white/30 px-6 py-3 text-sm font-medium text-white transition hover:border-white hover:bg-white/10"
            >
              Talk to our team
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Small round country-code badge (emoji flags don't render on Windows). */
export function CountryBadge({ code, className = '' }) {
  return (
    <span
      className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-accent-300 bg-accent-50 text-[11px] font-semibold tracking-wider text-accent-800 ${className}`}
    >
      {code}
    </span>
  );
}
