import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Clock, FileText, Inbox, MessagesSquare, ShieldCheck, Sparkles, CircleX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Alert, Badge, Card } from '../components/ui';
import { date, limitText, money } from '../lib/format';

function StatusBanner({ user }) {
  if (user.role !== 'seller') return null;
  if (user.status === 'pending') {
    return (
      <div className="flex gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <Clock className="mt-0.5 size-5 shrink-0 text-amber-600" />
        <div>
          <p className="font-semibold text-amber-900">Your supplier account is under review</p>
          <p className="mt-1 text-sm text-amber-800">
            Our team checks every supplier before leads are assigned. This usually takes 1–2 business days — we’ll email you as soon as you’re approved.
          </p>
        </div>
      </div>
    );
  }
  if (user.status === 'rejected') {
    return (
      <div className="flex gap-4 rounded-2xl border border-red-200 bg-red-50 p-5">
        <CircleX className="mt-0.5 size-5 shrink-0 text-red-600" />
        <div>
          <p className="font-semibold text-red-900">We couldn’t approve your supplier account</p>
          {user.statusReason && <p className="mt-1 text-sm text-red-800">Reason: {user.statusReason}</p>}
          <p className="mt-1 text-sm text-red-800">
            Update your <Link to="/profile" className="font-semibold underline">business details</Link> and contact support to be reviewed again.
          </p>
        </div>
      </div>
    );
  }
  return null;
}

export default function Dashboard() {
  const { user, subscription } = useAuth();
  const { state } = useLocation();
  const plan = subscription?.plan;
  const isBuyer = user.role === 'buyer';

  const stats = isBuyer
    ? [
        { icon: FileText, label: 'Open RFQs', value: 0 },
        { icon: Inbox, label: 'Quotes received', value: 0 },
        { icon: ShieldCheck, label: 'Orders in escrow', value: 0 },
      ]
    : [
        { icon: Inbox, label: 'New leads', value: 0 },
        { icon: FileText, label: 'Quotes sent', value: 0 },
        { icon: ShieldCheck, label: 'Payments in escrow', value: 0 },
      ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
      {state?.welcome && <Alert type="success" title={`Welcome aboard, ${user.name.split(' ')[0]}!`}>Your email is verified and your account is ready.</Alert>}

      <div className="relative overflow-hidden rounded-2xl bg-brand-600 px-6 py-8 sm:px-10">
        <div className="bg-weave absolute inset-0 opacity-50" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-300">{isBuyer ? 'Buyer' : 'Supplier'} dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold !text-white sm:text-4xl">Hello, {user.name.split(' ')[0]}</h1>
            {user.companyName && <p className="mt-1 text-sm text-brand-100">{user.companyName}</p>}
          </div>
          <Badge color={user.status === 'active' ? 'green' : user.status === 'pending' ? 'amber' : 'red'} className="capitalize">
            {user.status === 'active' ? (isBuyer ? 'Active' : 'Approved supplier') : user.status}
          </Badge>
        </div>
      </div>

      <StatusBanner user={user} />

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ icon: Icon, label, value }) => (
          <Card key={label} className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">{label}</p>
              <Icon className="size-5 text-slate-300" />
            </div>
            <p className="mt-2 font-display text-3xl font-semibold text-slate-900">{value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              {isBuyer ? <FileText className="size-5" /> : <Inbox className="size-5" />}
            </span>
            <div>
              <h2 className="text-lg font-semibold">{isBuyer ? 'Your RFQs' : 'Your leads'}</h2>
              <p className="text-sm text-slate-500">{isBuyer ? 'Requests you’ve posted will appear here.' : 'Leads our team assigns to you will appear here.'}</p>
            </div>
          </div>
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
            <Sparkles className="mx-auto size-6 text-accent-500" />
            <p className="mt-3 font-semibold text-slate-900">{isBuyer ? 'RFQ posting is coming next' : 'Lead inbox is coming next'}</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
              {isBuyer
                ? 'You’ll soon post requests here and receive quotes from your matched seller.'
                : 'Once you’re approved, the leads our team assigns to you will land here for you to quote.'}
            </p>
          </div>
        </Card>

        <Card className="flex flex-col p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your plan</h2>
            {subscription?.cancelAtPeriodEnd && <Badge color="amber">Ends {date(subscription.currentPeriodEnd)}</Badge>}
            {subscription?.status === 'past_due' && <Badge color="red">Payment due</Badge>}
          </div>
          {plan ? (
            <>
              <p className="mt-4 font-display text-3xl font-semibold text-slate-900">{plan.name}</p>
              <p className="text-sm text-slate-500">{plan.price === 0 ? 'Free plan' : `${money(plan.price, plan.currency)} / ${plan.interval}`}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <FileText className="size-4 text-brand-600" />
                  {isBuyer ? limitText(plan.limits?.rfqsPerMonth ?? 0, 'RFQs / month') : limitText(plan.limits?.leadsPerMonth ?? 0, 'leads / month')}
                </li>
                <li className="flex items-center gap-2">
                  <MessagesSquare className="size-4 text-brand-600" />
                  {limitText(plan.limits?.teamMembers ?? 1, plan.limits?.teamMembers === 1 ? 'team member' : 'team members')}
                </li>
              </ul>
            </>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No plan yet.</p>
          )}
          <div className="mt-auto pt-6">
            <Link
              to="/billing"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              {plan?.price === 0 ? 'Upgrade plan' : 'Manage plan'} <ArrowRight className="size-4" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
