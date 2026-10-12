import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthShell } from '../components/Layout';
import { OtpInput } from '../components/OtpInput';
import { Alert, Button, Field, PasswordInput } from '../components/ui';
import { api, fieldErrors } from '../lib/api';

export default function ResetPassword() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const email = state?.email;
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!email) return <Navigate to="/forgot-password" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\d{6}$/.test(code)) return setError('Enter the 6-digit code from your email.');
    if (password !== confirm) return setErrors({ confirm: 'Passwords do not match' });
    setErrors({});
    setLoading(true);
    try {
      await api('/auth/reset-password', { method: 'POST', body: { email, code, password } });
      navigate('/login', { replace: true, state: { message: 'Password updated. Log in with your new password.' } });
    } catch (err) {
      setErrors(fieldErrors(err));
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Choose a new password"
      subtitle={
        <>
          Enter the code sent to <span className="font-semibold text-slate-900">{email}</span>
        </>
      }
      footer={
        <Link to="/forgot-password" className="font-semibold text-brand-700 hover:underline">
          Didn’t get a code? Send again
        </Link>
      }
    >
      <form onSubmit={submit} className="space-y-5">
        <OtpInput value={code} onChange={setCode} disabled={loading} />
        {state?.devOtp && (
          <Alert type="warning" title="Development mode">
            Your code is <span className="font-mono font-semibold">{state.devOtp}</span>.
          </Alert>
        )}
        {error && <Alert type="error">{error}</Alert>}
        <Field label="New password" htmlFor="password" error={errors.password} hint="At least 8 characters, with a letter and a number">
          <PasswordInput id="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} required />
        </Field>
        <Field label="Confirm new password" htmlFor="confirm" error={errors.confirm}>
          <PasswordInput id="confirm" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} required />
        </Field>
        <Button type="submit" loading={loading} className="w-full py-3">
          Update password
        </Button>
      </form>
    </AuthShell>
  );
}
