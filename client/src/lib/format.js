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

export const limitText = (n, unit) => (n === -1 ? `Unlimited ${unit}` : `${n} ${unit}`);

import { categories } from '../data/catalog';

export const SELLER_CATEGORIES = categories.map((c) => c.name);
