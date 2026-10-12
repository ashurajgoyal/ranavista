import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Alert, Card, Empty, PageHeader, PageLoader, Pagination, Select, td, th } from '../components/ui';
import { dateTime } from '../lib/format';

const ACTIONS = [
  ['', 'All actions'],
  ['seller.', 'Seller approvals'],
  ['user.', 'Account status'],
  ['plan.', 'Plans'],
  ['subscription.', 'Subscriptions'],
  ['admin.', 'Admin team & logins'],
];

function describe(log) {
  const m = log.meta || {};
  const parts = [];
  if (m.reason) parts.push(`“${m.reason}”`);
  if (m.plan) parts.push(`plan: ${m.plan}`);
  if (m.name) parts.push(m.name);
  if (m.email) parts.push(m.email);
  if (m.role) parts.push(`role: ${m.role}`);
  if (m.from && m.to) parts.push(`${m.from} → ${m.to}`);
  return parts.join(' · ');
}

export default function Audit() {
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const qs = new URLSearchParams({ page: String(page) });
    if (action) qs.set('action', action);
    api(`/admin/audit?${qs}`)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [action, page]);

  return (
    <>
      <PageHeader title="Audit log" subtitle="Every action taken in the admin panel, and who took it." />
      <div className="mb-4">
        <Select
          className="w-auto"
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
        >
          {ACTIONS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </Select>
      </div>
      {error && <Alert type="error" className="mb-4">{error}</Alert>}
      <Card className="overflow-hidden">
        {!data ? (
          <PageLoader />
        ) : !data.logs.length ? (
          <Empty title="Nothing logged yet" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-slate-50">
                  <tr>
                    <th className={th}>When</th>
                    <th className={th}>Admin</th>
                    <th className={th}>Action</th>
                    <th className={th}>Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.logs.map((l) => (
                    <tr key={l._id}>
                      <td className={`${td} whitespace-nowrap`}>{dateTime(l.createdAt)}</td>
                      <td className={td}>{l.admin?.name || '—'}</td>
                      <td className={td}>
                        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{l.action}</code>
                      </td>
                      <td className={`${td} text-xs text-slate-600`}>{describe(l)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} pages={data.pages} total={data.total} onPage={setPage} />
          </>
        )}
      </Card>
    </>
  );
}
