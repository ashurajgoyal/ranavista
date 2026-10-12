import { useState } from 'react';
import { api, fieldErrors } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Alert, Button, Card, Field, Input, PasswordInput, Textarea } from '../components/ui';
import { SELLER_CATEGORIES } from '../lib/format';

function ProfileForm() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user.name || '',
    phone: user.phone || '',
    companyName: user.companyName || '',
    gstNumber: user.seller?.gstNumber || '',
    city: user.seller?.city || '',
    country: user.seller?.country || '',
    website: user.seller?.website || '',
    address: user.seller?.address || '',
    description: user.seller?.description || '',
  });
  const [categories, setCategories] = useState(user.seller?.categories || []);
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const isSeller = user.role === 'seller';

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setErrors({});
    setLoading(true);
    try {
      const { gstNumber, city, country, website, address, description, ...base } = form;
      const body = isSeller ? { ...base, seller: { gstNumber, city, country, website, address, description, categories } } : base;
      const data = await api('/auth/me', { method: 'PATCH', body });
      setUser(data.user);
      setMsg({ type: 'success', text: 'Profile saved.' });
    } catch (err) {
      setErrors(fieldErrors(err));
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold">Profile</h2>
      <p className="text-sm text-slate-500">Signed in as {user.email}</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        {msg && <Alert type={msg.type}>{msg.text}</Alert>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="p-name" error={errors.name}>
            <Input id="p-name" value={form.name} onChange={set('name')} error={errors.name} />
          </Field>
          <Field label="Phone" htmlFor="p-phone" error={errors.phone}>
            <Input id="p-phone" value={form.phone} onChange={set('phone')} error={errors.phone} />
          </Field>
          <Field label="Company name" htmlFor="p-company">
            <Input id="p-company" value={form.companyName} onChange={set('companyName')} />
          </Field>
          {isSeller && (
            <Field label="GST / Tax ID" htmlFor="p-gst">
              <Input id="p-gst" value={form.gstNumber} onChange={set('gstNumber')} />
            </Field>
          )}
        </div>
        {isSeller && (
          <>
            <Field label="Categories you supply">
              <div className="flex flex-wrap gap-2">
                {[...new Set([...SELLER_CATEGORIES, ...categories])].map((c) => {
                  const on = categories.includes(c);
                  return (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setCategories((cs) => (on ? cs.filter((x) => x !== c) : [...cs, c]))}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                        on ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="City" htmlFor="p-city">
                <Input id="p-city" value={form.city} onChange={set('city')} />
              </Field>
              <Field label="Country" htmlFor="p-country">
                <Input id="p-country" value={form.country} onChange={set('country')} />
              </Field>
              <Field label="Website" htmlFor="p-web">
                <Input id="p-web" value={form.website} onChange={set('website')} placeholder="https://" />
              </Field>
            </div>
            <Field label="Business address" htmlFor="p-address">
              <Input id="p-address" value={form.address} onChange={set('address')} />
            </Field>
            <Field label="About your business" htmlFor="p-desc" hint="What you make, capacity, export markets, certifications.">
              <Textarea id="p-desc" value={form.description} onChange={set('description')} />
            </Field>
          </>
        )}
        <Button type="submit" loading={loading}>
          Save profile
        </Button>
      </form>
    </Card>
  );
}

function PasswordForm() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (form.newPassword !== form.confirm) return setMsg({ type: 'error', text: 'New passwords do not match.' });
    setLoading(true);
    try {
      await api('/auth/change-password', {
        method: 'POST',
        body: { currentPassword: form.currentPassword, newPassword: form.newPassword },
      });
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
      setMsg({ type: 'success', text: 'Password updated.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold">Change password</h2>
      <form onSubmit={submit} className="mt-6 space-y-4">
        {msg && <Alert type={msg.type}>{msg.text}</Alert>}
        <Field label="Current password" htmlFor="cp">
          <PasswordInput id="cp" autoComplete="current-password" value={form.currentPassword} onChange={set('currentPassword')} required />
        </Field>
        <Field label="New password" htmlFor="np" hint="At least 8 characters, with a letter and a number">
          <PasswordInput id="np" autoComplete="new-password" value={form.newPassword} onChange={set('newPassword')} required />
        </Field>
        <Field label="Confirm new password" htmlFor="cnp">
          <PasswordInput id="cnp" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} required />
        </Field>
        <Button type="submit" variant="outline" loading={loading}>
          Update password
        </Button>
      </form>
    </Card>
  );
}

export default function Profile() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold ">Profile & security</h1>
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
        <ProfileForm />
        <PasswordForm />
      </div>
    </div>
  );
}
