import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, tokenStore } from '../lib/api';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [billingMode, setBillingMode] = useState('stripe');
  const [loading, setLoading] = useState(Boolean(tokenStore.get()));

  const logout = useCallback(() => {
    tokenStore.clear();
    setAdmin(null);
  }, []);

  useEffect(() => {
    if (!tokenStore.get()) return;
    api('/admin/auth/me')
      .then((d) => {
        setAdmin(d.admin);
        setBillingMode(d.billingMode);
      })
      .catch(logout)
      .finally(() => setLoading(false));
  }, [logout]);

  useEffect(() => {
    window.addEventListener('admin:expired', logout);
    return () => window.removeEventListener('admin:expired', logout);
  }, [logout]);

  const login = useCallback(async (email, password) => {
    const d = await api('/admin/auth/login', { method: 'POST', body: { email, password } });
    tokenStore.set(d.token);
    setAdmin(d.admin);
    const me = await api('/admin/auth/me');
    setBillingMode(me.billingMode);
  }, []);

  const value = useMemo(() => ({ admin, billingMode, loading, login, logout }), [admin, billingMode, loading, login, logout]);
  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdmin must be used inside <AdminAuthProvider>');
  return ctx;
}
