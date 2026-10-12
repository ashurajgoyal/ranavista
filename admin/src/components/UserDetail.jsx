import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAdmin } from '../context/AdminAuth';
import { Alert, Badge, Button, Field, Modal, PageLoader, Select, Textarea } from './ui';
import { can, date, dateTime, money, subStatusColor, userStatusColor } from '../lib/format';

function Row({ label, children }) {
  return (
    <div className="grid grid-cols-3 gap-3 py-2 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="col-span-2 break-words text-slate-900">{children || '—'}</dd>
    </div>
  );
}

/**
 * Detail + actions for one buyer/seller.
 * onChanged is called after any change so the list can refresh.
 */
export function UserDetail({ userId, onClose, onChanged }) {
  const { admin } = useAdmin();
  const [data, setData] = useState(null);
  const [plans, setPlans] = useState([]);
  const [planId, setPlanId] = useState('');
  const [reasonFor, setReasonFor] = useState(null); // 'rejected' | 'suspended'
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState(null);
  const billing = can(admin, 'billing');

  const load = useCallback(async () => {
    const d = await api(`/admin/users/${userId}`);
    setData(d);
    return d;
  }, [userId]);

  useEffect(() => {
    setData(null);
    setMsg(null);
    setReasonFor(null);
    load().catch((e) => setMsg({ type: 'error', text: e.message }));
  }, [load]);

  useEffect(() => {
    if (!billing || !data?.user) return;
    api('/admin/plans')
      .then((d) => setPlans(d.plans.filter((p) => p.audience === data.user.role && p.isActive)))
      .catch(() => {});
  }, [billing, data?.user]);

  const act = async (name, fn, success) => {
    setBusy(name);
    setMsg(null);
    try {
      await fn();
      await load();
      onChanged?.();
      setMsg({ type: 'success', text: success });
      setReasonFor(null);
      setReason('');
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setBusy('');
    }
  };

  const setStatus = (status, text) =>
    act(status, () => api(`/admin/users/${userId}/status`, { method: 'PATCH', body: { status, reason: reason || undefined } }), text);

  const user = data?.user;
  const sub = data?.subscription;

  return (
    <Modal open title={user ? user.name : 'Loading…'} onClose={onClose} size="lg">
      {!data ? (
        msg ? <Alert type="error">{msg.text}</Alert> : <PageLoader />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color="blue" className="capitalize">{user.role}</Badge>
            <Badge color={userStatusColor[user.status]} className="capitalize">{user.status}</Badge>
            {!user.emailVerified && <Badge color="amber">Email not verified</Badge>}
          </div>

          {msg && <Alert type={msg.type}>{msg.text}</Alert>}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {user.role === 'seller' && user.status !== 'active' && user.status !== 'suspended' && (
              <Button loading={busy === 'active'} onClick={() => setStatus('active', 'Supplier approved. They’ve been emailed.')}>
                Approve supplier
              </Button>
            )}
            {user.role === 'seller' && user.status === 'pending' && (
              <Button variant="danger" onClick={() => setReasonFor('rejected')}>
                Reject
              </Button>
            )}
            {user.status !== 'suspended' && (user.status === 'active' || user.role === 'buyer') && (
              <Button variant="danger" onClick={() => setReasonFor('suspended')}>
                Suspend account
              </Button>
            )}
            {user.status === 'suspended' && (
              <Button variant="outline" loading={busy === 'active'} onClick={() => setStatus('active', 'Account reactivated.')}>
                Reactivate
              </Button>
            )}
          </div>

          {reasonFor && (
            <div className="space-y-3 rounded-xl border border-red-200 bg-red-50/50 p-4">
              <Field label={reasonFor === 'rejected' ? 'Reason for rejection (sent to the supplier)' : 'Reason for suspension (internal note)'}>
                <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. GST number could not be verified" />
              </Field>
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  loading={busy === reasonFor}
                  onClick={() => setStatus(reasonFor, reasonFor === 'rejected' ? 'Supplier rejected and notified.' : 'Account suspended.')}
                >
                  Confirm {reasonFor === 'rejected' ? 'rejection' : 'suspension'}
                </Button>
                <Button variant="ghost" onClick={() => setReasonFor(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Profile */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Account</h3>
            <dl className="mt-2 divide-y divide-slate-100">
              <Row label="Email">{user.email}</Row>
              <Row label="Phone">{user.phone}</Row>
              <Row label="Company">{user.companyName}</Row>
              <Row label="Joined">{date(user.createdAt)}</Row>
              <Row label="Last login">{dateTime(user.lastLoginAt)}</Row>
              {user.statusReason && <Row label="Status note">{user.statusReason}</Row>}
            </dl>
          </section>

          {user.role === 'seller' && (
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Business</h3>
              <dl className="mt-2 divide-y divide-slate-100">
                <Row label="Categories">
                  {user.seller?.categories?.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {user.seller.categories.map((c) => (
                        <Badge key={c}>{c}</Badge>
                      ))}
                    </div>
                  ) : null}
                </Row>
                <Row label="GST / Tax ID">{user.seller?.gstNumber}</Row>
                <Row label="Location">{[user.seller?.city, user.seller?.country].filter(Boolean).join(', ')}</Row>
                <Row label="Address">{user.seller?.address}</Row>
                <Row label="Website">{user.seller?.website}</Row>
                <Row label="About">{user.seller?.description}</Row>
                {user.approvedAt && <Row label="Approved">{date(user.approvedAt)}</Row>}
              </dl>
            </section>
          )}

          {/* Subscription */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Subscription</h3>
            {sub ? (
              <dl className="mt-2 divide-y divide-slate-100">
                <Row label="Plan">
                  <span className="font-semibold">{sub.plan?.name}</span>{' '}
                  {sub.plan?.price ? `· ${money(sub.plan.price, sub.plan.currency)}/${sub.plan.interval}` : '· Free'}
                </Row>
                <Row label="Status">
                  <Badge color={subStatusColor[sub.status]} className="capitalize">{sub.status.replace('_', ' ')}</Badge>
                  {sub.cancelAtPeriodEnd && <span className="ml-2 text-xs text-amber-700">Cancels at period end</span>}
                </Row>
                <Row label="Billing source" >
                  <span className="capitalize">{sub.source}</span>
                </Row>
                <Row label="Period ends">{date(sub.currentPeriodEnd)}</Row>
                {sub.stripeSubscriptionId && <Row label="Stripe ID"><code className="text-xs">{sub.stripeSubscriptionId}</code></Row>}
              </dl>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No subscription.</p>
            )}

            {billing && (
              <div className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Assign a plan manually</p>
                <p className="text-xs text-slate-500">No payment is taken. Use for deals agreed offline or trials.</p>
                <div className="flex gap-2">
                  <Select value={planId} onChange={(e) => setPlanId(e.target.value)}>
                    <option value="">Choose plan…</option>
                    {plans.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} — {p.price ? `${money(p.price, p.currency)}/${p.interval}` : 'Free'}
                      </option>
                    ))}
                  </Select>
                  <Button
                    disabled={!planId}
                    loading={busy === 'assign'}
                    onClick={() =>
                      act('assign', () => api('/admin/subscriptions/assign', { method: 'POST', body: { userId, planId } }), 'Plan assigned.')
                    }
                  >
                    Assign
                  </Button>
                </div>
                {sub && sub.plan?.price > 0 && (
                  <Button
                    variant="danger"
                    loading={busy === 'cancel'}
                    onClick={() => {
                      const now = sub.source === 'stripe' && window.confirm('Cancel immediately? Press Cancel to end at the period end instead.');
                      act(
                        'cancel',
                        () => api(`/admin/subscriptions/${sub._id}/cancel`, { method: 'POST', body: { immediately: Boolean(now) } }),
                        'Subscription cancelled.'
                      );
                    }}
                  >
                    Cancel paid subscription
                  </Button>
                )}
              </div>
            )}
          </section>

          {data.history?.length > 0 && (
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Admin history</h3>
              <ul className="mt-2 space-y-2">
                {data.history.map((h) => (
                  <li key={h._id} className="text-sm">
                    <span className="font-medium text-slate-900">{h.action}</span>{' '}
                    <span className="text-slate-500">
                      by {h.admin?.name || 'system'} · {dateTime(h.createdAt)}
                    </span>
                    {h.meta?.reason && <p className="text-xs text-slate-500">“{h.meta.reason}”</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </Modal>
  );
}
