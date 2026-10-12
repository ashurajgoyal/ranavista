import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { api } from '../lib/api';
import { Alert, Badge, Card, Empty, Input, PageHeader, PageLoader, Pagination, Select, td, th } from '../components/ui';
import { UserDetail } from '../components/UserDetail';
import { date, money, userStatusColor } from '../lib/format';

/**
 * Buyers & sellers list. With `pendingOnly` it becomes the seller approval queue.
 */
export default function Users({ pendingOnly = false }) {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState(params.get('q') || '');

  const role = pendingOnly ? 'seller' : params.get('role') || '';
  const status = pendingOnly ? 'pending' : params.get('status') || '';
  const page = Number(params.get('page') || 1);
  const openId = params.get('open');

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in patch)) next.delete('page');
    setParams(next);
  };

  const load = useCallback(() => {
    const qs = new URLSearchParams({ page: String(page) });
    if (role) qs.set('role', role);
    if (status) qs.set('status', status);
    if (params.get('q')) qs.set('q', params.get('q'));
    return api(`/admin/users?${qs}`)
      .then((d) => {
        setData(d);
        setError('');
      })
      .catch((e) => setError(e.message));
  }, [page, role, status, params]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <PageHeader
        title={pendingOnly ? 'Supplier approvals' : 'Buyers & suppliers'}
        subtitle={pendingOnly ? 'Review new suppliers before they can receive leads.' : 'Everyone with a verified account.'}
      />

      {!pendingOnly && (
        <form
          className="mb-4 flex flex-wrap gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            update({ q: q.trim() });
          }}
        >
          <div className="relative min-w-60 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input className="pl-9" placeholder="Search name, email, company, phone…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Select className="w-auto" value={role} onChange={(e) => update({ role: e.target.value })}>
            <option value="">All types</option>
            <option value="buyer">Buyers</option>
            <option value="seller">Suppliers</option>
          </Select>
          <Select className="w-auto" value={status} onChange={(e) => update({ status: e.target.value })}>
            <option value="">Any status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </Select>
        </form>
      )}

      {error && <Alert type="error" className="mb-4">{error}</Alert>}

      <Card className="overflow-hidden">
        {!data ? (
          <PageLoader />
        ) : !data.users.length ? (
          <Empty
            title={pendingOnly ? 'No suppliers waiting' : 'No accounts found'}
            text={pendingOnly ? 'New supplier applications will show up here.' : 'Try a different search or filter.'}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead className="bg-slate-50">
                  <tr>
                    <th className={th}>Name</th>
                    <th className={th}>{pendingOnly ? 'Categories' : 'Type'}</th>
                    <th className={th}>Status</th>
                    <th className={th}>Plan</th>
                    <th className={th}>Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.users.map((u) => (
                    <tr key={u._id} className="cursor-pointer hover:bg-slate-50" onClick={() => update({ open: u._id, page: String(page) })}>
                      <td className={td}>
                        <p className="font-medium text-slate-900">{u.name}</p>
                        <p className="text-xs text-slate-500">
                          {u.companyName ? `${u.companyName} · ` : ''}
                          {u.email}
                        </p>
                      </td>
                      <td className={td}>
                        {pendingOnly ? (
                          <span className="text-xs">{u.seller?.categories?.join(', ') || '—'}</span>
                        ) : (
                          <span className="capitalize">{u.role}</span>
                        )}
                      </td>
                      <td className={td}>
                        <Badge color={userStatusColor[u.status]} className="capitalize">
                          {u.status}
                        </Badge>
                      </td>
                      <td className={td}>
                        {u.subscription?.plan ? (
                          <>
                            {u.subscription.plan.name}
                            {u.subscription.plan.price > 0 && (
                              <span className="text-xs text-slate-500"> · {money(u.subscription.plan.price, u.subscription.plan.currency)}</span>
                            )}
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className={td}>{date(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} pages={data.pages} total={data.total} onPage={(p) => update({ page: String(p) })} />
          </>
        )}
      </Card>

      {openId && <UserDetail userId={openId} onClose={() => update({ open: '', page: String(page) })} onChanged={load} />}
    </>
  );
}
