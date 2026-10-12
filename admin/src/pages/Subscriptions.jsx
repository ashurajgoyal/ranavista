import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Alert, Badge, Card, Empty, PageHeader, PageLoader, Pagination, Select, td, th } from '../components/ui';
import { UserDetail } from '../components/UserDetail';
import { date, money, subStatusColor } from '../lib/format';

export default function Subscriptions() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [openUser, setOpenUser] = useState(null);

  const filters = {
    audience: params.get('audience') || '',
    status: params.get('status') || '',
    source: params.get('source') || '',
    paid: params.get('paid') || '',
    page: params.get('page') || '1',
  };

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in patch)) next.delete('page');
    setParams(next);
  };

  const qs = params.toString();
  const load = useCallback(
    () =>
      api(`/admin/subscriptions?${qs}`)
        .then((d) => {
          setData(d);
          setError('');
        })
        .catch((e) => setError(e.message)),
    [qs]
  );

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <PageHeader title="Subscriptions" subtitle="Every buyer and seller plan, kept in sync with Stripe." />

      <div className="mb-4 flex flex-wrap gap-3">
        <Select className="w-auto" value={filters.audience} onChange={(e) => update({ audience: e.target.value })}>
          <option value="">Buyers & sellers</option>
          <option value="buyer">Buyers</option>
          <option value="seller">Sellers</option>
        </Select>
        <Select className="w-auto" value={filters.paid} onChange={(e) => update({ paid: e.target.value })}>
          <option value="">All plans</option>
          <option value="true">Paid plans only</option>
        </Select>
        <Select className="w-auto" value={filters.status} onChange={(e) => update({ status: e.target.value })}>
          <option value="">Any status</option>
          <option value="active">Active</option>
          <option value="past_due">Past due</option>
          <option value="incomplete">Incomplete</option>
          <option value="canceled">Canceled</option>
        </Select>
        <Select className="w-auto" value={filters.source} onChange={(e) => update({ source: e.target.value })}>
          <option value="">Any source</option>
          <option value="stripe">Stripe</option>
          <option value="admin">Admin-assigned</option>
          <option value="free">Free</option>
          <option value="mock">Test mode</option>
        </Select>
      </div>

      {error && <Alert type="error" className="mb-4">{error}</Alert>}

      <Card className="overflow-hidden">
        {!data ? (
          <PageLoader />
        ) : !data.subscriptions.length ? (
          <Empty title="No subscriptions match" text="Try different filters." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px]">
                <thead className="bg-slate-50">
                  <tr>
                    <th className={th}>Customer</th>
                    <th className={th}>Plan</th>
                    <th className={th}>Status</th>
                    <th className={th}>Source</th>
                    <th className={th}>Renews / ends</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.subscriptions.map((s) => (
                    <tr key={s._id} className="cursor-pointer hover:bg-slate-50" onClick={() => s.user && setOpenUser(s.user._id)}>
                      <td className={td}>
                        <p className="font-medium text-slate-900">{s.user?.name || 'Deleted user'}</p>
                        <p className="text-xs capitalize text-slate-500">
                          {s.audience} · {s.user?.companyName || s.user?.email}
                        </p>
                      </td>
                      <td className={td}>
                        <p className="font-medium">{s.plan?.name}</p>
                        <p className="text-xs text-slate-500">{s.plan?.price ? `${money(s.plan.price, s.plan.currency)}/${s.plan.interval}` : 'Free'}</p>
                      </td>
                      <td className={td}>
                        <Badge color={subStatusColor[s.status]} className="capitalize">
                          {s.status.replace('_', ' ')}
                        </Badge>
                        {s.cancelAtPeriodEnd && <p className="mt-1 text-xs text-amber-700">Cancels at period end</p>}
                      </td>
                      <td className={`${td} capitalize`}>{s.source === 'mock' ? 'Test mode' : s.source}</td>
                      <td className={td}>{date(s.currentPeriodEnd)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} pages={data.pages} total={data.total} onPage={(p) => update({ page: String(p) })} />
          </>
        )}
      </Card>

      {openUser && <UserDetail userId={openUser} onClose={() => setOpenUser(null)} onChanged={load} />}
    </>
  );
}
