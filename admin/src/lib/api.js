const BASE = `${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api`;
const TOKEN_KEY = 'tq_admin_token';

export const tokenStore = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* storage unavailable */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage unavailable */
    }
  },
};

export class ApiError extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/** Small fetch wrapper: JSON in/out, adds the auth token, normalises errors. */
export async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection and try again.', 0, 'NETWORK');
  }

  let data = {};
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }

  if (!res.ok) {
    if (res.status === 401 && token) {
      tokenStore.clear();
      window.dispatchEvent(new Event('admin:expired'));
    }
    throw new ApiError(data.message || 'Something went wrong.', res.status, data.code, data.details);
  }
  return data;
}

/** Turns an ApiError's field details into { field: message } for forms. */
export function fieldErrors(err) {
  const out = {};
  for (const d of err?.details && Array.isArray(err.details) ? err.details : []) {
    if (d.field && !out[d.field]) out[d.field] = d.message;
  }
  return out;
}
