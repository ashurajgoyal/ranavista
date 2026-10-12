import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthShell } from '../components/Layout';
import { Alert, Button, Field, Input } from '../components/ui';
import { api } from '../lib/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api('/auth/forgot-password', { method: 'POST', body: { email } });
      navigate('/reset-password', { state: { email, devOtp: data.devOtp } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your account email and we’ll send you a reset code."
      footer={
        <Link to="/login" className="font-semibold text-brand-700 hover:underline">
          Back to log in
        </Link>
      }
    >
      <form onSubmit={submit} className="space-y-5">
        {error && <Alert type="error">{error}</Alert>}
        <Field label="Email" htmlFor="email">
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </Field>
        <Button type="submit" loading={loading} className="w-full py-3">
          Send reset code
        </Button>
      </form>
    </AuthShell>
  );
}
