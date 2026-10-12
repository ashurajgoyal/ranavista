export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Ranavista';

export function money(amount, currency = 'inr') {
  const code = (currency || 'inr').toUpperCase();
  try {
    return new Intl.NumberFormat(code === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${code} ${amount}`;
  }
}

export function date(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function dateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export const ROLE_LABELS = {
  super_admin: 'Super Admin',
  finance: 'Finance',
  support: 'Support',
  category_manager: 'Category Manager',
};

/** Must match the server's route permissions (super_admin can do everything). */
export const PERMISSIONS = {
  users: ['support', 'category_manager'],
  billing: ['finance'],
  team: [],
};

export const can = (admin, area) => admin?.role === 'super_admin' || PERMISSIONS[area]?.includes(admin?.role);

export const userStatusColor = { active: 'green', pending: 'amber', rejected: 'red', suspended: 'red' };
export const subStatusColor = { active: 'green', trialing: 'blue', past_due: 'red', unpaid: 'red', incomplete: 'amber', canceled: 'gray' };
