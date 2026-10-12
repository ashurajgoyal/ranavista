import { useState } from 'react';
import { CircleAlert, CircleCheck, Eye, EyeOff, Info, LoaderCircle } from 'lucide-react';

const cx = (...c) => c.filter(Boolean).join(' ');

const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm shadow-brand-900/10',
  accent: 'bg-accent-500 text-brand-950 hover:bg-accent-400',
  outline: 'border border-slate-300 bg-white text-ink hover:border-brand-600 hover:text-brand-600',
  ghost: 'text-slate-700 hover:bg-sand/60',
  danger: 'border border-red-200 bg-white text-red-700 hover:bg-red-50',
};

export function Button({ variant = 'primary', loading, className, children, disabled, ...props }) {
  return (
    <button
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoaderCircle className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

export function Field({ label, error, hint, children, htmlFor }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs font-medium text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

const inputBase =
  'block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-4';

export function Input({ error, className, ...props }) {
  return (
    <input
      className={cx(
        inputBase,
        error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-300 focus:border-brand-500 focus:ring-brand-100',
        className
      )}
      aria-invalid={Boolean(error)}
      {...props}
    />
  );
}

export function PasswordInput({ error, ...props }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input type={show ? 'text' : 'password'} error={error} className="pr-11" {...props} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 hover:text-slate-600"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export function Textarea({ error, className, ...props }) {
  return (
    <textarea
      className={cx(
        inputBase,
        'min-h-24',
        error ? 'border-red-300 focus:ring-red-100' : 'border-slate-300 focus:border-brand-500 focus:ring-brand-100',
        className
      )}
      {...props}
    />
  );
}

const alertStyles = {
  error: ['border-red-200 bg-red-50 text-red-800', CircleAlert],
  success: ['border-emerald-200 bg-emerald-50 text-emerald-800', CircleCheck],
  info: ['border-info-200 bg-info-50 text-info-800', Info],
  warning: ['border-amber-200 bg-amber-50 text-amber-900', CircleAlert],
};

export function Alert({ type = 'info', title, children, className }) {
  const [style, Icon] = alertStyles[type];
  return (
    <div className={cx('flex gap-3 rounded-xl border px-4 py-3 text-sm', style, className)} role={type === 'error' ? 'alert' : 'status'}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="space-y-0.5">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div>{children}</div>}
      </div>
    </div>
  );
}

const badgeStyles = {
  gray: 'bg-slate-100 text-slate-700',
  blue: 'bg-info-50 text-info-800 ring-info-200',
  gold: 'bg-accent-100 text-accent-800 ring-accent-200',
  green2: 'bg-brand-50 text-brand-700 ring-brand-200',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
};

export function Badge({ color = 'gray', children, className }) {
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ring-transparent', badgeStyles[color], className)}>
      {children}
    </span>
  );
}

export function Card({ className, children }) {
  return <div className={cx('rounded-xl border border-slate-200 bg-white shadow-sm shadow-brand-950/5', className)}>{children}</div>;
}

export function Spinner({ className }) {
  return <LoaderCircle className={cx('size-6 animate-spin text-brand-600', className)} />;
}

export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner />
    </div>
  );
}

// ─────────────── Admin-only building blocks ───────────────

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cx(
        'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Modal({ open, title, onClose, children, footer, size = 'md' }) {
  if (!open) return null;
  const width = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' }[size];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div className={cx('relative flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl', width)}>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Close">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

export function Pagination({ page, pages, total, onPage }) {
  if (!total) return null;
  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-600">
      <span>
        {total} result{total === 1 ? '' : 's'}
      </span>
      <div className="flex items-center gap-2">
        <Button variant="outline" className="px-3 py-1.5" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Previous
        </Button>
        <span>
          {page} / {pages}
        </span>
        <Button variant="outline" className="px-3 py-1.5" disabled={page >= pages} onClick={() => onPage(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}

export function Empty({ title, text }) {
  return (
    <div className="px-6 py-14 text-center">
      <p className="font-semibold text-slate-900">{title}</p>
      {text && <p className="mt-1 text-sm text-slate-500">{text}</p>}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-semibold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export const th = 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500';
export const td = 'px-4 py-3 text-sm text-slate-700';
