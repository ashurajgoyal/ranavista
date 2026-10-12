import { Check } from 'lucide-react';
import { Button } from './ui';
import { limitText, money } from '../lib/format';

export function PlanCard({ plan, current, onSelect, loading, actionLabel }) {
  const isFree = plan.price === 0;
  const highlight = plan.highlight;
  const limit =
    plan.audience === 'buyer'
      ? limitText(plan.limits?.rfqsPerMonth ?? 0, 'RFQs / month')
      : limitText(plan.limits?.leadsPerMonth ?? 0, 'leads / month');

  return (
    <div
      className={`relative flex flex-col rounded-xl border bg-white p-7 transition ${
        highlight ? 'border-accent-400 shadow-2xl shadow-brand-900/10 ring-1 ring-accent-400' : 'border-slate-200 shadow-sm'
      }`}
    >
      {highlight && (
        <span className="absolute -top-3 left-6 rounded-full bg-accent-500 px-3 py-1 text-xs font-medium text-brand-950">Most popular</span>
      )}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-2xl font-semibold">{plan.name}</h3>
        {current && <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">Current plan</span>}
      </div>
      {plan.description && <p className="mt-1 min-h-10 text-sm text-slate-600">{plan.description}</p>}

      <div className="mt-5 flex items-baseline gap-1">
        <span className="font-display text-4xl font-semibold text-ink">{isFree ? 'Free' : money(plan.price, plan.currency)}</span>
        {!isFree && <span className="text-sm text-slate-500">/ {plan.interval}</span>}
      </div>
      <p className="mt-1 text-sm font-medium text-brand-700">{limit}</p>

      <ul className="mt-6 flex-1 space-y-2.5">
        {plan.features?.map((f) => (
          <li key={f} className="flex gap-2.5 text-sm text-slate-700">
            <Check className="mt-0.5 size-4 shrink-0 text-brand-600" /> {f}
          </li>
        ))}
      </ul>

      {onSelect && (
        <Button
          className="mt-8 w-full"
          variant={highlight ? 'primary' : 'outline'}
          disabled={current}
          loading={loading}
          onClick={() => onSelect(plan)}
        >
          {current ? 'Your current plan' : actionLabel || (isFree ? 'Start free' : `Choose ${plan.name}`)}
        </Button>
      )}
    </div>
  );
}
