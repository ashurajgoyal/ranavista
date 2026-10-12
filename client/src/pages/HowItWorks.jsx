import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  ClipboardList,
  FileText,
  Inbox,
  MessagesSquare,
  PackageCheck,
  Search,
  ShieldCheck,
  Star,
  UserCheck,
  Wallet,
} from 'lucide-react';
import { CtaBand, PageHero, SectionHeading } from '../components/Section';

const FLOWS = {
  buyer: {
    label: 'For buyers',
    cta: ['Start sourcing free', '/register?role=buyer'],
    steps: [
      [ClipboardList, 'Create your free account', 'Register as a buyer and verify your email. You start on the free Basic plan.'],
      [FileText, 'Post a sourcing request (RFQ)', 'Describe the product, quantity, target price, delivery date and destination. Attach specs or images.'],
      [Search, 'Our team reviews it', 'A sourcing specialist checks your request and may ask a quick question to make sure it’s complete.'],
      [UserCheck, 'We match one verified supplier', 'Your request goes to the single supplier best suited to it — nobody else sees it.'],
      [MessagesSquare, 'Review the quote & chat', 'Compare the quotation with your needs, discuss details in chat, and accept when you’re happy.'],
      [ShieldCheck, 'Pay securely', 'Your payment is held safely — the supplier knows the money is there, and you know it isn’t released yet.'],
      [PackageCheck, 'Confirm delivery', 'When the goods arrive as agreed, confirm delivery and the payment is released to the supplier.'],
      [Star, 'Rate the supplier', 'Your rating helps us match future requests even better.'],
    ],
  },
  seller: {
    label: 'For suppliers',
    cta: ['Apply as a supplier', '/register?role=seller'],
    steps: [
      [ClipboardList, 'Apply as a supplier', 'Register with your company details, GST / tax ID and the categories you make or export.'],
      [BadgeCheck, 'Get verified', 'Our team reviews your application. Once approved, you can start receiving leads.'],
      [Inbox, 'Receive matched leads', 'When a request fits your capabilities, we assign it to you alone — no bidding against others.'],
      [FileText, 'Send your quotation', 'Quote price, lead time, terms and packaging. Use chat to clarify anything with the buyer.'],
      [Wallet, 'Payment secured before you ship', 'Once the buyer accepts and pays, the funds are held safely for you.'],
      [PackageCheck, 'Ship & get paid', 'Deliver as agreed. When the buyer confirms delivery, the payment is released to you.'],
      [Star, 'Build your reputation', 'Good ratings and on-time delivery bring you more and better leads.'],
    ],
  },
};

export default function HowItWorks() {
  const [tab, setTab] = useState('buyer');
  const flow = FLOWS[tab];

  return (
    <>
      <PageHero
        crumbs={['How It Works']}
        eyebrow="How it works"
        title="One request. One right supplier. Protected all the way."
        subtitle="A curated process that saves buyers time and gives suppliers leads worth their effort."
      />

      <section className="container-x py-20">
        <div className="mx-auto flex w-fit rounded-full border border-slate-200 bg-white p-1" role="tablist">
          {Object.entries(FLOWS).map(([key, f]) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`rounded-full px-6 py-2.5 text-sm font-medium transition ${tab === key ? 'bg-brand-600 text-white' : 'text-slate-600 hover:text-ink'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <ol className="relative mx-auto mt-14 max-w-3xl">
          <span className="absolute bottom-6 left-[23px] top-6 w-px bg-accent-300" aria-hidden="true" />
          {flow.steps.map(([Icon, title, text], i) => (
            <li key={title} className="relative flex gap-6 pb-10 last:pb-0">
              <span className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border-4 border-paper bg-brand-600 text-accent-300">
                <Icon className="size-5" />
              </span>
              <div className="pt-1.5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-700">Step {i + 1}</p>
                <h3 className="mt-1 text-xl font-semibold">{title}</h3>
                <p className="mt-1.5 leading-relaxed text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-12 text-center">
          <Link
            to={flow.cta[1]}
            className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-6 py-3.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            {flow.cta[0]} <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <section className="bg-sand/50 py-20">
        <div className="container-x">
          <SectionHeading center eyebrow="Protected payments" title="How your money is protected" />
          <div className="mt-12 grid gap-4 md:grid-cols-4">
            {[
              ['1', 'Buyer accepts quote', 'Terms, price and delivery are agreed in writing on the platform.'],
              ['2', 'Payment is held', 'The buyer pays; funds are held and not released to the supplier yet.'],
              ['3', 'Supplier ships', 'With payment secured, the supplier produces and ships the order.'],
              ['4', 'Release on delivery', 'The buyer confirms delivery and the payment is released. Disputes are reviewed by our team.'],
            ].map(([n, t, d]) => (
              <div key={n} className="relative rounded-xl border border-accent-200 bg-white p-6">
                <span className="font-display text-4xl font-semibold text-accent-400">{n}</span>
                <h3 className="mt-3 text-lg font-semibold">{t}</h3>
                <p className="mt-1.5 text-sm text-muted">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
