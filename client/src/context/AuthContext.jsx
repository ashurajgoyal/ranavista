import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, tokenStore } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(Boolean(tokenStore.get()));

  const clear = useCallback(() => {
    tokenStore.clear();
    setUser(null);
    setSubscription(null);
  }, []);

  const refresh = useCallback(async () => {
    if (!tokenStore.get()) return;
    const data = await api('/auth/me');
    setUser(data.user);
    setSubscription(data.subscription);
    return data;
  }, []);

  // Restore session on page load
  useEffect(() => {
    if (!tokenStore.get()) return;
    refresh()
      .catch(clear)
      .finally(() => setLoading(false));
  }, [refresh, clear]);

  // Token expired somewhere in the app → log out
  useEffect(() => {
    const onExpired = () => clear();
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, [clear]);

  /** Stores a { token, user, subscription } response from login / verify-email. */
  const startSession = useCallback((data) => {
    tokenStore.set(data.token);
    setUser(data.user);
    setSubscription(data.subscription || null);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const data = await api('/auth/login', { method: 'POST', body: { email, password } });
      startSession(data);
      return data;
    },
    [startSession]
  );

  const value = useMemo(
    () => ({ user, subscription, loading, login, logout: clear, startSession, refresh, setUser, setSubscription }),
    [user, subscription, loading, login, clear, startSession, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
