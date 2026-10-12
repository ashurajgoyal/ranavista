import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAdmin } from '../context/AdminAuth';
import { Alert, Button, Field, Input, PasswordInput } from '../components/ui';
import { APP_NAME } from '../lib/format';
import { LotusMark } from '../components/LotusMark';

export default function Login() {
  const { admin, login } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (admin) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-600 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <LotusMark className="mx-auto size-16" color="#C6AA7E" />
          <h1 className="mt-4 text-3xl font-semibold tracking-[0.06em] !text-white">{APP_NAME.toUpperCase()}</h1>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-accent-300">
            <Lock className="size-3.5" /> Admin panel · authorised staff only
          </p>
        </div>
        <form onSubmit={submit} className="space-y-5 rounded-xl border-t-4 border-accent-500 bg-white p-6 shadow-2xl sm:p-8">
          {error && <Alert type="error">{error}</Alert>}
          <Field label="Email" htmlFor="email">
            <Input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </Field>
          <Field label="Password" htmlFor="password">
            <PasswordInput id="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Field>
          <Button type="submit" loading={loading} className="w-full py-3">
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
