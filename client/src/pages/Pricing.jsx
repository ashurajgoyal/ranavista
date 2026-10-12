import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useChoosePlan } from '../lib/useChoosePlan';
import { PlanCard } from '../components/PlanCard';
import { Alert, PageLoader } from '../components/ui';
import { CtaBand, PageHero } from '../components/Section';

export default function Pricing() {
  const { user, subscription } = useAuth();
  const [params, setParams] = useSearchParams();
  const audience = user?.role || (params.get('for') === 'seller' ? 'seller' : 'buyer');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const { choose, busyId, error, notice } = useChoosePlan();

  useEffect(() => {
    setLoading(true);
    setLoadError('');
    api(`/plans?audience=${audience}`)
      .then((d) => setPlans(d.plans))
      .catch((e) => setLoadError(e.message))
      .finally(() => setLoading(false));
  }, [audience]);

  return (
    <>
      <PageHero
        crumbs={['Pricing']}
        eyebrow="Plans & pricing"
        title="Plans that grow with your trade"
        subtitle="Start free. Upgrade when you need more requests or leads. Cancel any time."
      />

      <section className="container-x py-16">
        {!user ? (
          <div className="mx-auto flex w-fit rounded-full border border-slate-200 bg-white p-1" role="tablist">
            {[
              ['buyer', 'For buyers'],
              ['seller', 'For suppliers'],
            ].map(([a, label]) => (
              <button
                key={a}
                role="tab"
                aria-selected={audience === a}
                onClick={() => setParams(a === 'seller' ? { for: 'seller' } : {})}
                className={`rounded-full px-6 py-2.5 text-sm font-medium transition ${audience === a ? 'bg-brand-600 text-white' : 'text-slate-600 hover:text-ink'}`}
              >
                {label}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-muted">
            Showing plans for your {user.role === 'seller' ? 'supplier' : 'buyer'} account.
          </p>
        )}

        <div className="mx-auto mt-8 max-w-3xl space-y-3">
          {error && <Alert type="error">{error}</Alert>}
          {notice && <Alert type="success">{notice}</Alert>}
          {loadError && <Alert type="error">{loadError}</Alert>}
        </div>

        {loading ? (
          <PageLoader />
        ) : (
          <div className="mx-auto mt-10 grid max-w-6xl gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard key={plan._id} plan={plan} current={subscription?.plan?._id === plan._id} loading={busyId === plan._id} onSelect={choose} />
            ))}
            {!plans.length && !loadError && <p className="col-span-3 text-center text-muted">No plans are available yet.</p>}
          </div>
        )}

        <p className="mx-auto mt-10 flex max-w-2xl items-start justify-center gap-2 text-center text-sm text-muted">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-600" />
          Secure card payments. Change or cancel any time from your account. See our{' '}
          <Link to="/refund-policy" className="text-brand-600 underline">
            Refund &amp; Cancellation Policy
          </Link>
          .
        </p>
      </section>

      <CtaBand />
    </>
  );
}
