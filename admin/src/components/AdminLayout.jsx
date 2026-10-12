import { useEffect, useState } from 'react';
import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { BadgeCheck, CreditCard, History, Inbox, LayoutDashboard, Layers, LogOut, Menu, Shield, Users, X } from 'lucide-react';
import { useAdmin } from '../context/AdminAuth';
import { APP_NAME, ROLE_LABELS, can } from '../lib/format';
import { PageLoader } from './ui';
import { LotusMark } from './LotusMark';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/sellers', label: 'Supplier approvals', icon: BadgeCheck, area: 'users' },
  { to: '/users', label: 'Buyers & suppliers', icon: Users, area: 'users' },
  { to: '/enquiries', label: 'Enquiries', icon: Inbox, area: 'users' },
  { to: '/plans', label: 'Plans', icon: Layers, area: 'billing' },
  { to: '/subscriptions', label: 'Subscriptions', icon: CreditCard, area: 'billing' },
  { to: '/team', label: 'Admin team', icon: Shield, area: 'team' },
  { to: '/audit', label: 'Audit log', icon: History, area: 'team' },
];

function Sidebar({ onNavigate }) {
  const { admin, logout } = useAdmin();
  return (
    <div className="relative flex h-full flex-col bg-brand-600 text-brand-100">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <LotusMark className="size-9" color="#C6AA7E" />
        <div>
          <p className="font-display text-lg font-semibold tracking-[0.06em] text-white">{APP_NAME.toUpperCase()}</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-accent-400">Admin</p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 px-3">
        {NAV.filter((n) => !n.area || can(admin, n.area)).map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-accent-500 text-brand-950' : 'hover:bg-white/5 hover:text-accent-300'
              }`
            }
          >
            <Icon className="size-[18px]" /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <p className="truncate text-sm font-semibold text-white">{admin.name}</p>
        <p className="truncate text-xs text-accent-300">{ROLE_LABELS[admin.role]}</p>
        <button onClick={logout} className="mt-3 flex items-center gap-2 text-sm text-brand-200 hover:text-accent-300">
          <LogOut className="size-4" /> Log out
        </button>
      </div>
    </div>
  );
}

export function AdminLayout() {
  const { admin, loading, billingMode } = useAdmin();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);

  if (loading) return <PageLoader />;
  if (!admin) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <Sidebar />
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64">
            <Sidebar onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:hidden">
        <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-slate-600" aria-label="Open menu">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
        <p className="font-display text-sm font-semibold">{APP_NAME} Admin</p>
        <span className="w-9" />
      </header>

      {billingMode === 'mock' && (
        <div className="border-b border-amber-200 bg-amber-50 px-6 py-2 text-center text-xs font-medium text-amber-900">
          Billing is in test mode — paid plans activate without payment. Add STRIPE_SECRET_KEY on the server to go live.
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

/** Blocks a page for admin roles that can't use it. */
export function RequireArea({ area, children }) {
  const { admin } = useAdmin();
  if (!can(admin, area)) {
    return (
      <div className="py-24 text-center">
        <Shield className="mx-auto size-8 text-slate-300" />
        <p className="mt-3 font-semibold text-slate-900">Your role doesn’t have access to this page</p>
        <p className="mt-1 text-sm text-slate-500">Ask a super admin if you need it.</p>
      </div>
    );
  }
  return children;
}
