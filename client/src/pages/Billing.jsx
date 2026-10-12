import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CreditCard, ExternalLink } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useChoosePlan } from '../lib/useChoosePlan';
import { PlanCard } from '../components/PlanCard';
import { Alert, Badge, Button, Card, PageLoader } from '../components/ui';
import { date, money } from '../lib/format';

const statusBadge = {
  active: ['green', 'Active'],
  trialing: ['blue', 'Trial'],
  past_due: ['red', 'Payment overdue'],
  unpaid: ['red', 'Unpaid'],
  incomplete: ['amber', 'Awaiting payment'],
  canceled: ['gray', 'Canceled'],
};

const sourceText = {
  free: 'Free plan',
  stripe: 'Billed by card',
  admin: 'Assigned by our team',
  mock: 'Test mode (no payment)',
};

export default function Billing() {
  const { user, subscription, setSubscription } = useAuth();
  const [params, setParams] = useSearchParams();
  const [plans, setPlans] = useState([]);
  const [billingMode, setBillingMode] = useState('stripe');
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState('');
  const [msg, setMsg] = useState(null);
  const { choose, busyId, error, notice } = useChoosePlan();
  const handled = useRef(false);

  useEffect(() => {
    api(`/plans?audience=${user.role}`)
      .then((d) => {
        setPlans(d.plans);
        setBillingMode(d.billingMode);
      })
      .catch((e) => setMsg({ type: 'error', text: e.message }))
      .finally(() => setLoading(false));
  }, [user.role]);

  // Return from Stripe Checkout, or arrive with ?choose=<planId> after sign-up
  useEffect(() => {
    if (handled.current || loading) return;
    const checkout = params.get('checkout');
    const sessionId = params.get('session_id');
    const chooseId = params.get('choose');
    if (!checkout && !chooseId) return;
    handled.current = true;

    if (checkout === 'success' && sessionId) {
      setMsg({ type: 'info', text: 'Confirming your payment…' });
      api('/subscriptions/confirm', { method: 'POST', body: { sessionId } })
        .then((d) => {
          if (d.subscription) setSubscription(d.subscription);
          setMsg(
            d.pending
              ? { type: 'info', text: 'Payment received — your plan will update in a moment. Refresh if it doesn’t.' }
              : { type: 'success', text: `Payment successful. You’re on the ${d.subscription?.plan?.name} plan.` }
          );
        })
        .catch((e) => setMsg({ type: 'error', text: e.message }));
    } else if (checkout === 'cancelled') {
      setMsg({ type: 'warning', text: 'Checkout was cancelled. You haven’t been charged.' });
    } else if (chooseId) {
      const plan = plans.find((p) => p._id === chooseId);
      if (plan && plan.price > 0 && subscription?.plan?._id !== plan._id) choose(plan);
    }
    setParams({}, { replace: true });
  }, [loading, params, plans, subscription, choose, setParams, setSubscription]);

  const run = async (name, path) => {
    setAction(name);
    setMsg(null);
    try {
      const d = await api(path, { method: 'POST' });
      if (d.url) {
        window.location.assign(d.url);
        return;
      }
      if (d.subscription !== undefined) setSubscription(d.subscription);
      if (d.message) setMsg({ type: 'success', text: d.message });
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setAction('');
    }
  };

  if (loading) return <PageLoader />;

  const plan = subscription?.plan;
  const [badgeColor, badgeText] = statusBadge[subscription?.status] || ['gray', 'None'];
  const isPaid = plan && plan.price > 0;
  const isStripe = subscription?.source === 'stripe';

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-3xl font-semibold ">Plan & billing</h1>
        <p className="mt-1 text-sm text-slate-600">Manage your {user.role} subscription.</p>
      </div>

      {billingMode === 'mock' && (
        <Alert type="warning" title="Test mode">
          Payments aren’t connected yet, so paid plans switch on instantly without charging. Add your Stripe keys on the server to take real payments.
        </Alert>
      )}
      {msg && <Alert type={msg.type}>{msg.text}</Alert>}
      {error && <Alert type="error">{error}</Alert>}
      {notice && <Alert type="success">{notice}</Alert>}

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-sm text-slate-500">Current plan</p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <p className="font-display text-2xl font-semibold text-slate-900">{plan?.name || 'No plan'}</p>
              <Badge color={badgeColor}>{badgeText}</Badge>
            </div>
            {plan && (
              <p className="mt-1 text-sm text-slate-600">
                {isPaid ? `${money(plan.price, plan.currency)} / ${plan.interval}` : 'Free'} · {sourceText[subscription.source]}
              </p>
            )}
            {isPaid && subscription.currentPeriodEnd && (
              <p className="mt-3 text-sm text-slate-700">
                {subscription.cancelAtPeriodEnd ? (
                  <>
                    Ends on <b>{date(subscription.currentPeriodEnd)}</b> — you’ll move to the free plan after that.
                  </>
                ) : (
                  <>
                    {isStripe ? 'Renews' : 'Active until'} <b>{date(subscription.currentPeriodEnd)}</b>
                  </>
                )}
              </p>
            )}
            {subscription?.status === 'past_due' && (
              <p className="mt-3 text-sm font-medium text-red-700">Your last payment failed. Update your card to keep your plan.</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {isStripe && user.stripeCustomerId && (
              <Button variant="outline" loading={action === 'portal'} onClick={() => run('portal', '/subscriptions/portal')}>
                <CreditCard className="size-4" /> Cards & invoices <ExternalLink className="size-3.5" />
              </Button>
            )}
            {isPaid && isStripe && subscription.cancelAtPeriodEnd && (
              <Button loading={action === 'resume'} onClick={() => run('resume', '/subscriptions/resume')}>
                Keep my plan
              </Button>
            )}
            {isPaid && !subscription.cancelAtPeriodEnd && (
              <Button
                variant="danger"
                loading={action === 'cancel'}
                onClick={() => {
                  const text = isStripe
                    ? 'Cancel your plan? You’ll keep it until the end of this billing period, then move to the free plan.'
                    : 'Cancel your plan and move to the free plan now?';
                  if (window.confirm(text)) run('cancel', '/subscriptions/cancel');
                }}
              >
                Cancel plan
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div>
        <h2 className="text-xl font-semibold">{isPaid ? 'Change plan' : 'Upgrade your plan'}</h2>
        <p className="mt-1 text-sm text-slate-600">
          {isStripe ? 'Changes take effect right away; we’ll prorate the difference on your next invoice.' : 'Pick the plan that fits your volume.'}
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <PlanCard
              key={p._id}
              plan={p}
              current={plan?._id === p._id && !subscription?.cancelAtPeriodEnd}
              loading={busyId === p._id}
              onSelect={choose}
              actionLabel={
                p.price === 0 ? 'Switch to free' : isPaid && p.price < plan.price ? `Downgrade to ${p.name}` : `Upgrade to ${p.name}`
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
