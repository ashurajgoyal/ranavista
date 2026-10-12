import { BadgeCheck, Eye, Globe, Handshake, Heart, Leaf, Scale, ShieldCheck, Sparkles, Target, UserCheck } from 'lucide-react';
import { site } from '../config/site';
import { CtaBand, PageHero, SectionHeading } from '../components/Section';
import { LotusMark } from '../components/Logo';

const values = [
  { icon: Handshake, title: 'Trust first', text: 'We verify every supplier and stay involved from request to delivery.' },
  { icon: Scale, title: 'Fairness', text: 'Fair prices for buyers and fair business for makers — no race to the bottom.' },
  { icon: Sparkles, title: 'Craftsmanship', text: 'We celebrate skill, materials and the people behind every product.' },
  { icon: Leaf, title: 'Sustainability', text: 'We favour natural materials, responsible makers and long-term partnerships.' },
  { icon: Heart, title: 'Care', text: 'Real people review every request. You always know who to talk to.' },
  { icon: Globe, title: 'Openness', text: 'Clear terms, clear pricing and clear communication across borders.' },
];

const different = [
  { icon: UserCheck, title: 'Curated, one-to-one matching', text: 'Each sourcing request is reviewed by our team and sent to one supplier who truly fits — not broadcast to hundreds.' },
  { icon: BadgeCheck, title: 'Verified suppliers only', text: 'Suppliers are checked for registration, capability and category fit before they can receive a lead.' },
  { icon: ShieldCheck, title: 'Protected payments', text: 'Order payments are held securely and released when the buyer confirms delivery.' },
];

export default function About() {
  return (
    <>
      <PageHero
        crumbs={['About Us']}
        eyebrow="About Ranavista"
        title="Sourcing today for a brighter tomorrow"
        subtitle={`${site.name} connects international buyers with the makers behind exceptional home and lifestyle products — through careful matching, verified partners and protected payments.`}
      />

      {/* Story */}
      <section className="container-x grid gap-14 py-24 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionHeading eyebrow="Our story" title="Built for the way great products are really made" />
          <div className="mt-6 space-y-4 leading-relaxed text-slate-600">
            <p>
              Behind every hand-loomed throw, carved table or brass lamp is a workshop with years of skill. Yet finding the right maker — and trusting them with an
              order across borders — is still hard. Open marketplaces flood buyers with unverified offers and push suppliers into endless price wars.
            </p>
            <p>
              {site.name} takes a different approach. We review every sourcing request ourselves and introduce it to one supplier we believe is the right fit. It’s
              slower than a free-for-all by design, because good partnerships are built on attention, not volume.
            </p>
            <p>
              Our roots are in India’s great craft and export clusters, and our network extends to the leading sourcing countries across Asia.
            </p>
          </div>
        </div>
        <div className="relative">
          <div className="relative overflow-hidden rounded-2xl bg-brand-600 p-10 sm:p-14">
            <div className="bg-weave absolute inset-0 opacity-50" />
            <LotusMark className="relative size-20" color="#C6AA7E" />
            <p className="relative mt-8 font-display text-3xl leading-snug text-white">“{site.promise}.”</p>
            <span className="relative mt-8 block h-px w-16 bg-accent-500" />
            <p className="relative mt-4 text-sm uppercase tracking-[0.2em] text-accent-300">{site.pillars.join(' · ')}</p>
          </div>
          <div className="absolute -bottom-6 -left-6 -z-10 size-40 rounded-2xl bg-accent-300/50" />
        </div>
      </section>

      {/* Mission & vision */}
      <section className="bg-sand/60 py-24">
        <div className="container-x grid gap-6 md:grid-cols-2">
          {[
            [Target, 'Our mission', 'To make global sourcing of home and lifestyle products simple, safe and fair — by matching every buyer with the right verified maker and standing behind every order.'],
            [Eye, 'Our vision', 'A world where great craftsmanship reaches every market, and where buyers and makers build lasting partnerships based on trust and shared value.'],
          ].map(([Icon, title, text]) => (
            <div key={title} className="rounded-2xl border border-accent-200 bg-white p-8 sm:p-10">
              <span className="flex size-12 items-center justify-center rounded-full bg-brand-600 text-accent-300">
                <Icon className="size-5" />
              </span>
              <h2 className="mt-6 text-2xl font-semibold">{title}</h2>
              <p className="mt-3 leading-relaxed text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What makes us different */}
      <section className="container-x py-24">
        <SectionHeading center eyebrow="Why Ranavista" title="What makes us different" />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {different.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-xl border border-slate-200 bg-white p-8 text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full border border-accent-400 bg-accent-50 text-accent-700">
                <Icon className="size-6" />
              </span>
              <h3 className="mt-6 text-xl font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="relative overflow-hidden bg-brand-600 py-24">
        <div className="bg-weave absolute inset-0 opacity-50" />
        <div className="container-x relative">
          <SectionHeading center light eyebrow="Our values" title="What we stand for" />
          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {values.map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-brand-600 p-8">
                <Icon className="size-6 text-accent-400" />
                <h3 className="mt-4 text-xl font-semibold !text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-100">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand title="Let’s build something lasting together" />
    </>
  );
}
