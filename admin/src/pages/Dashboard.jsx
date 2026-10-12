import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Wallet, ShoppingCart, Store, TrendingUp } from 'lucide-react';
import { api } from '../lib/api';
import { useAdmin } from '../context/AdminAuth';
import { Alert, Badge, Card, PageHeader, PageLoader, td, th } from '../components/ui';
import { can, date, money, userStatusColor } from '../lib/format';

function Stat({ icon: Icon, label, value, sub, to }) {
  const body = (
    <Card className="h-full p-5 transition hover:border-slate-300">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <span className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Icon className="size-[18px]" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold text-slate-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </Card>
  );
  return to ? <Link to={to}>{body}</Link> : body;
}

function SignupChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.buyers + d.sellers));
  return (
    <div>
      <div className="flex h-40 items-end gap-1" role="img" aria-label="Daily signups, last 30 days">
        {data.map((d) => {
          const total = d.buyers + d.sellers;
          return (
            <div key={d.day} className="group relative flex h-full flex-1 flex-col justify-end" title={`${d.day}: ${d.buyers} buyers, ${d.sellers} sellers`}>
              <div className="w-full rounded-t bg-accent-500" style={{ height: `${(d.sellers / max) * 100}%` }} />
              <div className={`w-full bg-brand-600 ${d.sellers ? '' : 'rounded-t'}`} style={{ height: `${(d.buyers / max) * 100}%` }} />
              {total === 0 && <div className="h-0.5 w-full rounded bg-slate-200" />}
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-slate-400">
        <span>{date(data[0]?.day)}</span>
        <span>Today</span>
      </div>
      <div className="mt-3 flex gap-4 text-xs text-slate-600">
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-brand-600" /> Buyers</span>
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-accent-500" /> Suppliers</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { admin } = useAdmin();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/admin/dashboard').then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <Alert type="error">{error}</Alert>;
  if (!data) return <PageLoader />;
  const { stats, byPlan, signups, recentUsers } = data;
  const currency = byPlan.find((p) => p.currency)?.currency || 'inr';
  const showUsers = can(admin, 'users');

  return (
    <>
      <PageHeader title={`Good to see you, ${admin.name.split(' ')[0]}`} subtitle="Here’s what’s happening on the marketplace." />

      {stats.newEnquiries > 0 && showUsers && (
        <Link to="/enquiries?status=new" className="mb-3 flex items-center justify-between rounded-xl border border-info-200 bg-info-50 px-5 py-4 text-sm hover:bg-info-50/70">
          <span className="font-semibold text-info-800">
            {stats.newEnquiries} new contact enquir{stats.newEnquiries === 1 ? 'y' : 'ies'} from the website
          </span>
          <ArrowRight className="size-4 text-info-800" />
        </Link>
      )}

      {stats.pendingSellers > 0 && showUsers && (
        <Link to="/sellers" className="mb-6 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm hover:bg-amber-100/60">
          <span className="font-semibold text-amber-900">
            {stats.pendingSellers} supplier{stats.pendingSellers === 1 ? '' : 's'} waiting for approval
          </span>
          <ArrowRight className="size-4 text-amber-700" />
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Stat icon={ShoppingCart} label="Buyers" value={stats.buyers} to={showUsers ? '/users?role=buyer' : undefined} />
        <Stat icon={Store} label="Suppliers" value={stats.sellers} to={showUsers ? '/users?role=seller' : undefined} />
        <Stat icon={BadgeCheck} label="Pending approval" value={stats.pendingSellers} to={showUsers ? '/sellers' : undefined} />
        <Stat icon={TrendingUp} label="New signups" value={stats.newUsers30d} sub="Last 30 days" />
        <Stat icon={Wallet} label="Monthly recurring revenue" value={money(stats.mrr, currency)} sub={`${stats.paidSubscribers} paying subscribers`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Card className="p-6">
          <h2 className="font-bold">Signups · last 30 days</h2>
          <div className="mt-5">
            <SignupChart data={signups} />
          </div>
        </Card>

        <Card className="overflow-hidden">
          <h2 className="px-6 pt-6 font-bold">Subscribers by plan</h2>
          <table className="mt-3 w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className={th}>Plan</th>
                <th className={th}>Price</th>
                <th className={`${th} text-right`}>Users</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {byPlan.map((p) => (
                <tr key={p.planId}>
                  <td className={td}>
                    <span className="font-medium text-slate-900">{p.name}</span>{' '}
                    <span className="text-xs capitalize text-slate-500">· {p.audience}</span>
                  </td>
                  <td className={td}>{p.price ? `${money(p.price, p.currency)}/${p.interval === 'year' ? 'yr' : 'mo'}` : 'Free'}</td>
                  <td className={`${td} text-right font-semibold`}>{p.count}</td>
                </tr>
              ))}
              {!byPlan.length && (
                <tr>
                  <td colSpan={3} className={`${td} text-center text-slate-500`}>
                    No subscriptions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>

      {showUsers && (
        <Card className="mt-6 overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-6">
            <h2 className="font-bold">Newest accounts</h2>
            <Link to="/users" className="text-sm font-semibold text-brand-700 hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-slate-50">
                <tr>
                  <th className={th}>Name</th>
                  <th className={th}>Type</th>
                  <th className={th}>Status</th>
                  <th className={th}>Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentUsers.map((u) => (
                  <tr key={u._id}>
                    <td className={td}>
                      <Link to={`/users?open=${u._id}`} className="font-medium text-slate-900 hover:text-brand-700">
                        {u.name}
                      </Link>
                      <p className="text-xs text-slate-500">{u.companyName || u.email}</p>
                    </td>
                    <td className={`${td} capitalize`}>{u.role}</td>
                    <td className={td}>
                      <Badge color={userStatusColor[u.status]} className="capitalize">
                        {u.status}
                      </Badge>
                    </td>
                    <td className={td}>{date(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}
