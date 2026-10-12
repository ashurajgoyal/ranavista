import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, Check, ShoppingCart, X } from 'lucide-react';
import { AuthShell } from '../components/Layout';
import { Alert, Button, Field, Input, PasswordInput } from '../components/ui';
import { api, fieldErrors } from '../lib/api';
import { SELLER_CATEGORIES } from '../lib/format';

const roles = [
  { id: 'buyer', icon: ShoppingCart, title: 'I’m a buyer', text: 'Source products & get quotes' },
  { id: 'seller', icon: Building2, title: 'I’m a supplier', text: 'Receive matched leads' },
];

export default function Register() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [role, setRole] = useState(params.get('role') === 'seller' ? 'seller' : 'buyer');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    password: '',
    confirm: '',
    gstNumber: '',
    city: '',
    country: 'India',
  });
  const [categories, setCategories] = useState([]);
  const [customCat, setCustomCat] = useState('');
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggleCat = (c) => setCategories((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));
  const addCustom = () => {
    const c = customCat.trim();
    if (c && !categories.includes(c)) setCategories((cs) => [...cs, c]);
    setCustomCat('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const local = {};
    if (form.password !== form.confirm) local.confirm = 'Passwords do not match';
    if (role === 'seller' && !categories.length) local['seller.categories'] = 'Pick at least one category you supply';
    setErrors(local);
    if (Object.keys(local).length) return;

    setLoading(true);
    try {
      const body = {
        role,
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        companyName: form.companyName,
        ...(role === 'seller' && {
          seller: { categories, gstNumber: form.gstNumber || undefined, city: form.city || undefined, country: form.country || undefined },
        }),
      };
      const data = await api('/auth/register', { method: 'POST', body });
      try {
        const plan = params.get('plan');
        if (plan) sessionStorage.setItem('tq_intended_plan', plan);
      } catch {
        /* ignore */
      }
      navigate('/verify-email', { state: { email: data.email, devOtp: data.devOtp } });
    } catch (err) {
      setErrors(fieldErrors(err));
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      wide
      title="Create your account"
      subtitle="Free to join. Takes about a minute."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-700 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-6" noValidate>
        <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Account type">
          {roles.map(({ id, icon: Icon, title, text }) => (
            <button
              type="button"
              key={id}
              role="radio"
              aria-checked={role === id}
              onClick={() => setRole(id)}
              className={`relative rounded-xl border p-4 text-left transition ${
                role === id ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {role === id && <Check className="absolute right-3 top-3 size-4 text-brand-600" />}
              <Icon className={`size-5 ${role === id ? 'text-brand-600' : 'text-slate-400'}`} />
              <p className="mt-2 text-sm font-semibold text-slate-900">{title}</p>
              <p className="text-xs text-slate-500">{text}</p>
            </button>
          ))}
        </div>

        {error && !Object.keys(errors).length && <Alert type="error">{error}</Alert>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="name" error={errors.name}>
            <Input id="name" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} required />
          </Field>
          <Field label={role === 'seller' ? 'Company name' : 'Company name (optional)'} htmlFor="company" error={errors.companyName}>
            <Input id="company" autoComplete="organization" value={form.companyName} onChange={set('companyName')} error={errors.companyName} />
          </Field>
          <Field label="Work email" htmlFor="email" error={errors.email}>
            <Input id="email" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} required />
          </Field>
          <Field label="Phone" htmlFor="phone" error={errors.phone}>
            <Input id="phone" type="tel" autoComplete="tel" placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} error={errors.phone} required />
          </Field>
          <Field label="Password" htmlFor="password" error={errors.password} hint="At least 8 characters, with a letter and a number">
            <PasswordInput id="password" autoComplete="new-password" value={form.password} onChange={set('password')} error={errors.password} required />
          </Field>
          <Field label="Confirm password" htmlFor="confirm" error={errors.confirm}>
            <PasswordInput id="confirm" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} required />
          </Field>
        </div>

        {role === 'seller' && (
          <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
            <div>
              <p className="text-sm font-semibold text-slate-900">Business details</p>
              <p className="text-xs text-slate-500">Our team reviews every supplier before you can receive leads.</p>
            </div>
            <Field label="What do you supply?" error={errors['seller.categories']}>
              <div className="flex flex-wrap gap-2">
                {[...SELLER_CATEGORIES, ...categories.filter((c) => !SELLER_CATEGORIES.includes(c))].map((c) => {
                  const on = categories.includes(c);
                  return (
                    <button
                      type="button"
                      key={c}
                      onClick={() => toggleCat(c)}
                      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        on ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {c} {on && !SELLER_CATEGORIES.includes(c) && <X className="size-3" />}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 flex gap-2">
                <Input
                  placeholder="Other category…"
                  value={customCat}
                  onChange={(e) => setCustomCat(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustom();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addCustom}>
                  Add
                </Button>
              </div>
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="GST / Tax ID" htmlFor="gst" error={errors['seller.gstNumber']}>
                <Input id="gst" value={form.gstNumber} onChange={set('gstNumber')} />
              </Field>
              <Field label="City" htmlFor="city">
                <Input id="city" autoComplete="address-level2" value={form.city} onChange={set('city')} />
              </Field>
              <Field label="Country" htmlFor="country">
                <Input id="country" autoComplete="country-name" value={form.country} onChange={set('country')} />
              </Field>
            </div>
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full py-3">
          Create {role === 'seller' ? 'supplier' : 'buyer'} account
        </Button>
        <p className="text-center text-xs text-slate-500">
          By creating an account you agree to our{' '}
          <Link to="/terms" className="text-brand-600 underline">Terms &amp; Conditions</Link> and{' '}
          <Link to="/privacy-policy" className="text-brand-600 underline">Privacy Policy</Link>. We’ll email you a 6-digit code to verify your address.
        </p>
      </form>
    </AuthShell>
  );
}
