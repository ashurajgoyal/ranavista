import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Phone,
  Search,
  ShieldCheck,
  User,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo, LotusMark } from './Logo';
import { SocialIcons } from './SocialIcons';
import { SiteSearch } from './SiteSearch';
import { site, mailto, telLink } from '../config/site';
import { categories } from '../data/catalog';

const RESOURCE_LINKS = [
  ['How It Works', '/how-it-works', 'The sourcing process, step by step'],
  ['Pricing', '/pricing', 'Plans for buyers and suppliers'],
  ['Currency Rates', '/resources#currency', 'Live exchange rates & converter'],
  ['Incoterms Guide', '/resources#incoterms', 'FOB, CIF, EXW and more explained'],
  ['Container Guide', '/resources#containers', '20ft, 40ft and 40ft HC capacity'],
  ['FAQ', '/faq', 'Answers to common questions'],
];

// ───────────────────────── Scroll handling ─────────────────────────

/** Scrolls to top on page change, or to #section when the URL has a hash. */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
    return undefined;
  }, [pathname, hash]);
  return null;
}

// ───────────────────────── Desktop dropdowns ─────────────────────────

function useOutsideClose(open, setOpen) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, setOpen]);
  return ref;
}

const navItem = (active) =>
  `flex h-full items-center gap-1 whitespace-nowrap px-2.5 text-[13.5px] font-medium transition 2xl:px-3.5 ${
    active ? 'bg-accent-500 text-brand-950' : 'text-white/90 hover:text-accent-300'
  }`;

function Dropdown({ label, active, children, width = 'w-[520px]' }) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(open, setOpen);
  const { pathname, hash } = useLocation();
  useEffect(() => setOpen(false), [pathname, hash]);
  return (
    <div ref={ref} className="relative h-full" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className={navItem(active)} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {label} <ChevronDown className={`size-3.5 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className={`absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2 ${width}`}>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-2xl shadow-brand-950/15 animate-pop">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

function ProductsMenu() {
  return (
    <>
      <div className="grid grid-cols-2 gap-1">
        {categories.map(({ slug, name, icon: Icon }) => (
          <Link key={slug} to={`/products#${slug}`} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink hover:bg-sand/50">
            <span className="flex size-8 items-center justify-center rounded-md bg-brand-50 text-brand-600">
              <Icon className="size-4" />
            </span>
            {name}
          </Link>
        ))}
      </div>
      <Link
        to="/products"
        className="mt-2 flex items-center justify-between rounded-lg bg-brand-600 px-4 py-3 text-sm font-medium text-white hover:bg-brand-700"
      >
        View all product categories <ArrowRight className="size-4" />
      </Link>
    </>
  );
}

function ResourcesMenu() {
  return (
    <ul className="space-y-0.5">
      {RESOURCE_LINKS.map(([label, to, text]) => (
        <li key={to}>
          <Link to={to} className="block rounded-lg px-3 py-2.5 hover:bg-sand/50">
            <span className="block text-sm font-medium text-ink">{label}</span>
            <span className="block text-xs text-muted">{text}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

// ───────────────────────── User menu ─────────────────────────

function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(open, setOpen);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);

  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-white/20 py-1 pl-1 pr-2.5 text-white hover:border-accent-400"
        aria-expanded={open}
        aria-label="Account menu"
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-accent-500 text-xs font-semibold text-brand-950">{initials}</span>
        <ChevronDown className="size-4 text-white/70" />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl animate-fade-up">
          <div className="border-b border-slate-100 bg-paper px-4 py-3">
            <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
            <p className="mt-1 text-xs font-medium capitalize text-accent-700">{user.role === 'seller' ? 'Supplier' : 'Buyer'} account</p>
          </div>
          {[
            ['/dashboard', LayoutDashboard, 'Dashboard'],
            ['/billing', CreditCard, 'Plan & billing'],
            ['/profile', User, 'Profile & security'],
          ].map(([to, Icon, label]) => (
            <Link key={to} to={to} className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink hover:bg-sand/40">
              <Icon className="size-4 text-muted" /> {label}
            </Link>
          ))}
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="flex w-full items-center gap-3 border-t border-slate-100 px-4 py-2.5 text-sm text-red-700 hover:bg-red-50"
          >
            <LogOut className="size-4" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}

// ───────────────────────── Mobile menu ─────────────────────────

function MobileMenu({ open, onClose, onSearch }) {
  const { user, logout } = useAuth();
  const [section, setSection] = useState(null);
  if (!open) return null;

  const link = 'block rounded-lg px-3 py-3 text-[15px] font-medium text-ink hover:bg-sand/50';
  const toggle = (s) => setSection((cur) => (cur === s ? null : s));

  return (
    <div className="fixed inset-0 z-50 xl:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="absolute inset-0 bg-brand-950/50" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-paper shadow-2xl">
        <div className="flex h-[72px] items-center justify-between border-b border-slate-200 px-4">
          <Logo showTagline={false} />
          <button onClick={onClose} className="rounded-lg p-2 text-ink" aria-label="Close menu">
            <X className="size-6" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <button
            onClick={() => {
              onClose();
              onSearch();
            }}
            className="mb-3 flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-muted"
          >
            <Search className="size-4" /> Search the site…
          </button>
          <NavLink to="/" end className={link}>Home</NavLink>
          <NavLink to="/about" className={link}>About Us</NavLink>

          <button onClick={() => toggle('products')} className={`${link} flex w-full items-center justify-between`} aria-expanded={section === 'products'}>
            Products <ChevronDown className={`size-4 transition ${section === 'products' ? 'rotate-180' : ''}`} />
          </button>
          {section === 'products' && (
            <div className="mb-2 ml-3 border-l-2 border-accent-300 pl-3">
              <Link to="/products" className="block py-2 text-sm font-medium text-brand-600">All categories</Link>
              {categories.map((c) => (
                <Link key={c.slug} to={`/products#${c.slug}`} className="block py-2 text-sm text-slate-600">
                  {c.name}
                </Link>
              ))}
            </div>
          )}

          <NavLink to="/sourcing-countries" className={link}>Sourcing Countries</NavLink>
          <NavLink to="/trade-fairs" className={link}>Trade Fairs</NavLink>

          <button onClick={() => toggle('resources')} className={`${link} flex w-full items-center justify-between`} aria-expanded={section === 'resources'}>
            Resources <ChevronDown className={`size-4 transition ${section === 'resources' ? 'rotate-180' : ''}`} />
          </button>
          {section === 'resources' && (
            <div className="mb-2 ml-3 border-l-2 border-accent-300 pl-3">
              <Link to="/resources" className="block py-2 text-sm font-medium text-brand-600">All resources</Link>
              {RESOURCE_LINKS.map(([label, to]) => (
                <Link key={to} to={to} className="block py-2 text-sm text-slate-600">
                  {label}
                </Link>
              ))}
            </div>
          )}

          <NavLink to="/contact" className={link}>Contact Us</NavLink>
        </nav>
        <div className="space-y-2 border-t border-slate-200 p-4">
          {user ? (
            <>
              <Link to="/dashboard" className="flex w-full items-center justify-center rounded-md bg-brand-600 py-3 text-sm font-medium text-white">
                Go to dashboard
              </Link>
              <button onClick={logout} className="w-full py-2 text-sm text-red-700">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/register" className="flex w-full items-center justify-center rounded-md bg-brand-600 py-3 text-sm font-medium text-white">
                Get started — it’s free
              </Link>
              <Link to="/login" className="flex w-full items-center justify-center rounded-md border border-brand-600 py-3 text-sm font-medium text-brand-600">
                Log in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ───────────────────────── Header ─────────────────────────

function Header() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);

  // Ctrl/Cmd + K opens search
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const is = (p) => (p === '/' ? pathname === '/' : pathname.startsWith(p));

  return (
    <>
      {/* Top strip */}
      <div className="hidden border-b border-accent-200/60 bg-paper md:block">
        <div className="container-x flex h-9 items-center justify-between text-xs text-muted">
          <p className="font-display italic text-accent-700">{site.pillars.join('  ·  ')}</p>
          <div className="flex items-center gap-5">
            {site.email && (
              <a href={mailto(site.email)} className="flex items-center gap-1.5 hover:text-brand-600">
                <Mail className="size-3.5" /> {site.email}
              </a>
            )}
            {site.phone && (
              <a href={telLink(site.phone)} className="flex items-center gap-1.5 hover:text-brand-600">
                <Phone className="size-3.5" /> {site.phone}
              </a>
            )}
            {!user && (
              <Link to="/register?role=seller" className="font-medium text-brand-600 hover:underline">
                Become a supplier
              </Link>
            )}
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-brand-600 shadow-lg shadow-brand-950/10">
        <div className="container-x flex h-[72px] items-center justify-between gap-4">
          <Logo light />

          <nav className="hidden h-full items-stretch xl:flex" aria-label="Main">
            <NavLink to="/" end className={() => navItem(is('/'))}>Home</NavLink>
            <NavLink to="/about" className={() => navItem(is('/about'))}>About Us</NavLink>
            <Dropdown label="Products" active={is('/products')}>
              <ProductsMenu />
            </Dropdown>
            <NavLink to="/sourcing-countries" className={() => navItem(is('/sourcing-countries'))}>Sourcing Countries</NavLink>
            <NavLink to="/trade-fairs" className={() => navItem(is('/trade-fairs'))}>Trade Fairs</NavLink>
            <Dropdown label="Resources" active={['/resources', '/how-it-works', '/pricing', '/faq'].some(is)} width="w-80">
              <ResourcesMenu />
            </Dropdown>
            <NavLink to="/contact" className={() => navItem(is('/contact'))}>Contact Us</NavLink>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="rounded-md p-2.5 text-white/90 hover:bg-white/10 hover:text-accent-300"
              aria-label="Search (Ctrl+K)"
              title="Search (Ctrl+K)"
            >
              <Search className="size-5" />
            </button>
            {user ? (
              <UserMenu />
            ) : (
              <>
                <Link to="/login" className="hidden whitespace-nowrap px-3 py-2 text-[13.5px] font-medium text-white/90 hover:text-accent-300 sm:block">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="hidden whitespace-nowrap rounded-md bg-accent-500 px-4 py-2.5 text-[13.5px] font-medium text-brand-950 transition hover:bg-accent-400 sm:block"
                >
                  Get Started
                </Link>
              </>
            )}
            <button className="rounded-md p-2.5 text-white xl:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <Menu className="size-6" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} onSearch={() => setSearchOpen(true)} />
      <SiteSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

// ───────────────────────── Footer ─────────────────────────

const FOOTER_COLUMNS = [
  [
    'Quick Links',
    [
      ['About Us', '/about'],
      ['Products', '/products'],
      ['Sourcing Countries', '/sourcing-countries'],
      ['Trade Fairs', '/trade-fairs'],
      ['How It Works', '/how-it-works'],
    ],
  ],
  [
    'Support',
    [
      ['Resources', '/resources'],
      ['Pricing', '/pricing'],
      ['FAQ', '/faq'],
      ['Contact Us', '/contact'],
      ['Become a Supplier', '/register?role=seller'],
    ],
  ],
  [
    'Legal',
    [
      ['Privacy Policy', '/privacy-policy'],
      ['Terms & Conditions', '/terms'],
      ['Refund & Cancellation', '/refund-policy'],
      ['Cookie Policy', '/cookie-policy'],
    ],
  ],
];

function Footer() {
  return (
    <footer className="relative overflow-hidden bg-brand-600 text-brand-100">
      <div className="bg-weave absolute inset-0 opacity-40" />
      <div className="container-x relative grid gap-10 py-16 lg:grid-cols-[1.4fr_2fr_1fr]">
        <div>
          <Logo light size="lg" />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-brand-100/90">{site.promise}. A curated sourcing platform where every request is reviewed by our team and matched with one verified supplier.</p>
          <ul className="mt-6 space-y-2 text-sm">
            {site.email && (
              <li>
                <a href={mailto(site.email)} className="flex items-center gap-2 hover:text-accent-300">
                  <Mail className="size-4 text-accent-400" /> {site.email}
                </a>
              </li>
            )}
            {site.phone && (
              <li>
                <a href={telLink(site.phone)} className="flex items-center gap-2 hover:text-accent-300">
                  <Phone className="size-4 text-accent-400" /> {site.phone}
                </a>
              </li>
            )}
            {site.address && (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-accent-400" /> {site.address}
              </li>
            )}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {FOOTER_COLUMNS.map(([title, links]) => (
            <div key={title}>
              <p className="font-display text-lg text-white">{title}</p>
              <span className="mt-3 block h-px w-8 bg-accent-500" />
              <ul className="mt-4 space-y-2.5 text-sm">
                {links.map(([label, to]) => (
                  <li key={to}>
                    <Link to={to} className="text-brand-100/90 transition hover:text-accent-300">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div>
          <p className="font-display text-lg text-white">Stay connected</p>
          <span className="mt-3 block h-px w-8 bg-accent-500" />
          <p className="mt-4 text-sm text-brand-100/90">Follow our sourcing stories, trade-fair updates and supplier spotlights.</p>
          <SocialIcons className="mt-5" />
          <div className="mt-6 space-y-2 text-xs text-brand-100/80">
            <p className="flex items-center gap-2"><BadgeCheck className="size-4 text-accent-400" /> Verified suppliers only</p>
            <p className="flex items-center gap-2"><ShieldCheck className="size-4 text-accent-400" /> Protected order payments</p>
            <p className="flex items-center gap-2"><Users className="size-4 text-accent-400" /> One request, one matched supplier</p>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-xs text-brand-100/80 sm:flex-row">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <p className="font-display italic text-accent-300">{site.footerLine}</p>
        </div>
      </div>
    </footer>
  );
}

// ───────────────────────── Layouts ─────────────────────────

export function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollManager />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

const AUTH_POINTS = [
  'Every supplier verified by our team',
  'One request, one hand-picked supplier — no spam',
  'Order payments held safely until delivery',
];

/** Split-screen layout for login / register / OTP screens. */
export function AuthShell({ title, subtitle, children, footer, wide = false }) {
  return (
    <div className="grid min-h-[calc(100vh-108px)] lg:grid-cols-12">
      <aside className="relative hidden overflow-hidden bg-brand-600 lg:col-span-5 lg:block">
        <div className="bg-weave absolute inset-0 opacity-50" />
        <LotusMark className="pointer-events-none absolute -bottom-16 -left-16 size-[26rem] opacity-[0.08]" color="#C6AA7E" />
        <div className="relative flex h-full flex-col justify-center px-12 py-16 xl:px-16">
          <p className="font-display text-lg italic text-accent-300">{site.pillars.join(' · ')}</p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight !text-white">{site.promise}</h2>
          <span className="mt-6 block h-px w-16 bg-accent-500" />
          <ul className="mt-8 space-y-4">
            {AUTH_POINTS.map((p) => (
              <li key={p} className="flex items-start gap-3 text-brand-100">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-500/20 text-accent-300">
                  <BadgeCheck className="size-4" />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <div className="flex items-start justify-center px-4 py-12 sm:py-16 lg:col-span-7 lg:items-center">
        <div className={`w-full ${wide ? 'max-w-2xl' : 'max-w-md'}`}>
          <div className="mb-8">
            <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
            <span className="mt-4 block h-px w-12 bg-accent-500" />
            {subtitle && <p className="mt-4 text-sm text-muted">{subtitle}</p>}
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-brand-950/5 sm:p-8">{children}</div>
          {footer && <div className="mt-6 text-sm text-muted">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
