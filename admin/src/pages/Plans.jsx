import { useEffect, useState } from 'react';
import { Check, Pencil, Plus, Trash2 } from 'lucide-react';
import { api, fieldErrors } from '../lib/api';
import { Alert, Badge, Button, Card, Field, Input, Modal, PageHeader, PageLoader, Select, Textarea } from '../components/ui';
import { money } from '../lib/format';

const blank = (audience) => ({
  name: '',
  audience,
  description: '',
  price: 0,
  interval: 'month',
  features: '',
  rfqsPerMonth: audience === 'buyer' ? 5 : 0,
  leadsPerMonth: audience === 'seller' ? 5 : 0,
  teamMembers: 1,
  isDefault: false,
  isActive: true,
  highlight: false,
  sortOrder: 0,
});

const toForm = (p) => ({
  ...blank(p.audience),
  ...p,
  features: (p.features || []).join('\n'),
  rfqsPerMonth: p.limits?.rfqsPerMonth ?? 0,
  leadsPerMonth: p.limits?.leadsPerMonth ?? 0,
  teamMembers: p.limits?.teamMembers ?? 1,
});

const limit = (n) => (n === -1 ? 'Unlimited' : n);

function Toggle({ label, checked, onChange, hint }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
      <input type="checkbox" className="mt-0.5 size-4 accent-brand-600" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <span className="block text-sm font-medium text-slate-900">{label}</span>
        {hint && <span className="block text-xs text-slate-500">{hint}</span>}
      </span>
    </label>
  );
}

function PlanForm({ initial, currency, billingMode, onClose, onSaved }) {
  const isEdit = Boolean(initial._id);
  const [f, setF] = useState(initial);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e?.target ? e.target.value : e }));

  const save = async () => {
    setSaving(true);
    setError('');
    setErrors({});
    const body = {
      name: f.name,
      description: f.description,
      price: Number(f.price),
      interval: f.interval,
      features: f.features
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      limits: { rfqsPerMonth: Number(f.rfqsPerMonth), leadsPerMonth: Number(f.leadsPerMonth), teamMembers: Number(f.teamMembers) },
      isDefault: f.isDefault,
      isActive: f.isActive,
      highlight: f.highlight,
      sortOrder: Number(f.sortOrder),
      ...(isEdit ? {} : { audience: f.audience }),
    };
    try {
      await api(isEdit ? `/admin/plans/${f._id}` : '/admin/plans', { method: isEdit ? 'PATCH' : 'POST', body });
      onSaved(isEdit ? 'Plan updated.' : 'Plan created.');
    } catch (e) {
      setErrors(fieldErrors(e));
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      size="lg"
      title={isEdit ? `Edit ${initial.name}` : `New ${f.audience} plan`}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} onClick={save}>
            {isEdit ? 'Save changes' : 'Create plan'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <Alert type="error">{error}</Alert>}
        {isEdit && billingMode === 'stripe' && Number(f.price) !== initial.price && initial.price > 0 && (
          <Alert type="warning">
            Changing the price creates a new Stripe price. New subscribers pay the new price; existing subscribers keep their current price.
          </Alert>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Plan name" error={errors.name}>
            <Input value={f.name} onChange={set('name')} error={errors.name} placeholder="Growth" />
          </Field>
          {!isEdit && (
            <Field label="For">
              <Select value={f.audience} onChange={set('audience')}>
                <option value="buyer">Buyers</option>
                <option value="seller">Sellers</option>
              </Select>
            </Field>
          )}
          <Field label={`Price (${currency.toUpperCase()})`} error={errors.price} hint="0 = free plan">
            <Input type="number" min="0" step="1" value={f.price} onChange={set('price')} error={errors.price} />
          </Field>
          <Field label="Billing period">
            <Select value={f.interval} onChange={set('interval')}>
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
            </Select>
          </Field>
        </div>
        <Field label="Short description">
          <Input value={f.description} onChange={set('description')} placeholder="For businesses sourcing every week." />
        </Field>
        <Field label="Features" hint="One per line. Shown on the pricing page.">
          <Textarea rows={5} value={f.features} onChange={set('features')} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          {f.audience === 'buyer' ? (
            <Field label="RFQs per month" hint="-1 = unlimited">
              <Input type="number" min="-1" value={f.rfqsPerMonth} onChange={set('rfqsPerMonth')} />
            </Field>
          ) : (
            <Field label="Leads per month" hint="-1 = unlimited">
              <Input type="number" min="-1" value={f.leadsPerMonth} onChange={set('leadsPerMonth')} />
            </Field>
          )}
          <Field label="Team members" hint="-1 = unlimited">
            <Input type="number" min="-1" value={f.teamMembers} onChange={set('teamMembers')} />
          </Field>
          <Field label="Display order" hint="Lower shows first">
            <Input type="number" value={f.sortOrder} onChange={set('sortOrder')} />
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Toggle label="Active" hint="Visible and purchasable" checked={f.isActive} onChange={set('isActive')} />
          <Toggle label="Most popular" hint="Highlight on pricing" checked={f.highlight} onChange={set('highlight')} />
          <Toggle label="Default free plan" hint="Given at sign-up" checked={f.isDefault} onChange={set('isDefault')} />
        </div>
      </div>
    </Modal>
  );
}

export default function Plans() {
  const [data, setData] = useState(null);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState(null);

  const load = () =>
    api('/admin/plans')
      .then(setData)
      .catch((e) => setMsg({ type: 'error', text: e.message }));

  useEffect(() => {
    load();
  }, []);

  const remove = async (plan) => {
    if (!window.confirm(`Delete the ${plan.name} plan? This can’t be undone.`)) return;
    try {
      await api(`/admin/plans/${plan._id}`, { method: 'DELETE' });
      setMsg({ type: 'success', text: 'Plan deleted.' });
      load();
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    }
  };

  if (!data) return msg ? <Alert type="error">{msg.text}</Alert> : <PageLoader />;

  return (
    <>
      <PageHeader
        title="Subscription plans"
        subtitle={
          data.billingMode === 'stripe'
            ? 'Paid plans are synced to Stripe automatically when you save.'
            : 'Stripe is not connected — paid plans activate without payment (test mode).'
        }
      />
      {msg && <Alert type={msg.type} className="mb-6">{msg.text}</Alert>}

      {['buyer', 'seller'].map((audience) => (
        <section key={audience} className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold capitalize">{audience} plans</h2>
            <Button variant="outline" onClick={() => setEditing(blank(audience))}>
              <Plus className="size-4" /> Add {audience} plan
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.plans
              .filter((p) => p.audience === audience)
              .map((p) => (
                <Card key={p._id} className={`flex flex-col p-5 ${p.isActive ? '' : 'opacity-60'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-display text-lg font-bold text-slate-900">{p.name}</p>
                      <p className="text-sm text-slate-600">{p.price ? `${money(p.price, p.currency)} / ${p.interval}` : 'Free'}</p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-1">
                      {p.isDefault && <Badge color="blue">Default</Badge>}
                      {p.highlight && <Badge color="amber">Popular</Badge>}
                      {!p.isActive && <Badge>Inactive</Badge>}
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    {audience === 'buyer' ? `${limit(p.limits?.rfqsPerMonth)} RFQs` : `${limit(p.limits?.leadsPerMonth)} leads`} / month ·{' '}
                    {limit(p.limits?.teamMembers)} team
                  </p>
                  <ul className="mt-3 flex-1 space-y-1">
                    {p.features?.slice(0, 4).map((f) => (
                      <li key={f} className="flex gap-2 text-xs text-slate-600">
                        <Check className="size-3.5 shrink-0 text-brand-600" /> {f}
                      </li>
                    ))}
                    {p.features?.length > 4 && <li className="text-xs text-slate-400">+{p.features.length - 4} more</li>}
                  </ul>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-sm">
                      <b>{p.subscribers}</b> <span className="text-slate-500">subscribers</span>
                    </span>
                    <div className="flex gap-1">
                      <Button variant="ghost" className="px-2.5 py-1.5" onClick={() => setEditing(toForm(p))} aria-label={`Edit ${p.name}`}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" className="px-2.5 py-1.5 text-red-600" onClick={() => remove(p)} aria-label={`Delete ${p.name}`}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                  {data.billingMode === 'stripe' && p.price > 0 && !p.stripePriceId && (
                    <p className="mt-2 text-xs font-medium text-red-600">Not synced to Stripe — open and save to retry.</p>
                  )}
                </Card>
              ))}
          </div>
        </section>
      ))}

      {editing && (
        <PlanForm
          initial={editing}
          currency={data.currency}
          billingMode={data.billingMode}
          onClose={() => setEditing(null)}
          onSaved={(text) => {
            setEditing(null);
            setMsg({ type: 'success', text });
            load();
          }}
        />
      )}
    </>
  );
}
