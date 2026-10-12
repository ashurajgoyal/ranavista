import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleCheck, Clock, CircleHelp, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { PageHero } from '../components/Section';
import { Alert, Button, Field, Input, Textarea } from '../components/ui';
import { api, fieldErrors } from '../lib/api';
import { site, mailto, telLink } from '../config/site';
import { useAuth } from '../context/AuthContext';

const TOPICS = [
  ['buying', 'I want to source products'],
  ['selling', 'I want to become a supplier'],
  ['partnership', 'Partnership or media'],
  ['support', 'Help with my account'],
  ['other', 'Something else'],
];

export default function Contact() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company: user?.companyName || '',
    topic: 'buying',
    message: '',
    website: '', // honeypot — real people leave this empty
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setErrors({});
    setLoading(true);
    try {
      await api('/contact', { method: 'POST', body: form });
      setSent(true);
    } catch (err) {
      setErrors(fieldErrors(err));
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    site.email && [Mail, 'Email us', site.email, mailto(site.email)],
    site.phone && [Phone, 'Call us', site.phone, telLink(site.phone)],
    site.whatsapp && [MessageCircle, 'WhatsApp', 'Chat with our team', `https://wa.me/${site.whatsapp}`],
    site.address && [MapPin, 'Visit us', site.address, null],
    site.hours && [Clock, 'Office hours', site.hours, null],
  ].filter(Boolean);

  return (
    <>
      <PageHero crumbs={['Contact Us']} eyebrow="Contact us" title="Let’s talk sourcing" subtitle="Questions about a product, becoming a supplier or your account? Send us a message and our team will get back to you." />

      <section className="container-x grid gap-10 py-16 lg:grid-cols-[1fr_1.5fr]">
        <div className="space-y-4">
          {cards.map(([Icon, title, text, href]) => {
            const body = (
              <>
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-600 text-accent-300">
                  <Icon className="size-5" />
                </span>
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-accent-700">{title}</span>
                  <span className="mt-1 block text-[15px] font-medium text-ink">{text}</span>
                </span>
              </>
            );
            return href ? (
              <a key={title} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 transition hover:border-accent-400">
                {body}
              </a>
            ) : (
              <div key={title} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5">
                {body}
              </div>
            );
          })}
          <Link to="/faq" className="flex items-center gap-4 rounded-xl bg-sand/70 p-5 transition hover:bg-sand">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-accent-400 text-accent-700">
              <CircleHelp className="size-5" />
            </span>
            <span>
              <span className="block font-medium text-ink">Looking for a quick answer?</span>
              <span className="block text-sm text-muted">Browse our frequently asked questions →</span>
            </span>
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          {sent ? (
            <div className="py-12 text-center animate-fade-up">
              <CircleCheck className="mx-auto size-14 text-emerald-600" />
              <h2 className="mt-5 text-3xl font-semibold">Thank you!</h2>
              <p className="mx-auto mt-3 max-w-sm text-muted">Your message has reached our team. We’ll reply to {form.email} within one business day.</p>
              <Button
                variant="outline"
                className="mt-8"
                onClick={() => {
                  setSent(false);
                  setForm((f) => ({ ...f, message: '' }));
                }}
              >
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5" noValidate>
              <div>
                <h2 className="text-2xl font-semibold">Send us a message</h2>
                <p className="mt-1 text-sm text-muted">Fields marked * are required.</p>
              </div>
              {error && !Object.keys(errors).length && <Alert type="error">{error}</Alert>}

              <fieldset>
                <legend className="text-sm font-medium text-slate-700">How can we help? *</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {TOPICS.map(([value, label]) => (
                    <label
                      key={value}
                      className={`cursor-pointer rounded-full border px-3.5 py-2 text-sm transition ${
                        form.topic === value ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200 text-slate-700 hover:border-accent-400'
                      }`}
                    >
                      <input type="radio" name="topic" value={value} checked={form.topic === value} onChange={set('topic')} className="sr-only" />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name *" htmlFor="c-name" error={errors.name}>
                  <Input id="c-name" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />
                </Field>
                <Field label="Email *" htmlFor="c-email" error={errors.email}>
                  <Input id="c-email" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
                </Field>
                <Field label="Phone" htmlFor="c-phone" error={errors.phone}>
                  <Input id="c-phone" type="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} error={errors.phone} />
                </Field>
                <Field label="Company" htmlFor="c-company">
                  <Input id="c-company" autoComplete="organization" value={form.company} onChange={set('company')} />
                </Field>
              </div>
              <Field label="Message *" htmlFor="c-message" error={errors.message} hint="For sourcing enquiries, include the product, quantity and destination.">
                <Textarea id="c-message" rows={6} value={form.message} onChange={set('message')} error={errors.message} />
              </Field>
              {/* Honeypot field, hidden from people */}
              <input type="text" name="website" value={form.website} onChange={set('website')} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

              <div className="flex flex-col-reverse items-start justify-between gap-4 sm:flex-row sm:items-center">
                <p className="text-xs text-muted">
                  By sending this form you agree to our <Link to="/privacy-policy" className="text-brand-600 underline">Privacy Policy</Link>.
                </p>
                <Button type="submit" loading={loading} className="px-7 py-3">
                  <Send className="size-4" /> Send message
                </Button>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
