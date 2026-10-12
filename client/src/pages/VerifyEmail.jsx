import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { AuthShell } from '../components/Layout';
import { OtpInput } from '../components/OtpInput';
import { Alert, Button } from '../components/ui';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const RESEND_SECONDS = 30;

export default function VerifyEmail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { startSession } = useAuth();
  const email = state?.email;

  const [code, setCode] = useState('');
  const [devOtp, setDevOtp] = useState(state?.devOtp || '');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  if (!email) return <Navigate to="/register" replace />;

  const verify = async (value = code) => {
    if (!/^\d{6}$/.test(value)) {
      setError('Enter all 6 digits.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await api('/auth/verify-email', { method: 'POST', body: { email, code: value } });
      startSession(data);
      let intended = null;
      try {
        intended = sessionStorage.getItem('tq_intended_plan');
        sessionStorage.removeItem('tq_intended_plan');
      } catch {
        /* ignore */
      }
      navigate(intended ? `/billing?choose=${intended}` : '/dashboard', { replace: true, state: { welcome: true } });
    } catch (err) {
      setError(err.message);
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setError('');
    setInfo('');
    try {
      const data = await api('/auth/resend-otp', { method: 'POST', body: { email, purpose: 'verify_email' } });
      setInfo('A new code is on its way.');
      if (data.devOtp) setDevOtp(data.devOtp);
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AuthShell
      title="Check your email"
      subtitle={
        <>
          We sent a 6-digit code to <span className="font-semibold text-slate-900">{email}</span>
        </>
      }
      footer={
        <>
          Wrong email?{' '}
          <Link to="/register" className="font-semibold text-brand-700 hover:underline">
            Start again
          </Link>
        </>
      }
    >
      <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <MailCheck className="size-7" />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          verify();
        }}
        className="space-y-5"
      >
        <OtpInput
          value={code}
          onChange={(v) => {
            setCode(v);
            if (/^\d{6}$/.test(v)) verify(v);
          }}
          disabled={loading}
        />
        {error && <Alert type="error">{error}</Alert>}
        {info && <Alert type="success">{info}</Alert>}
        {devOtp && (
          <Alert type="warning" title="Development mode">
            Your code is <span className="font-mono font-semibold">{devOtp}</span>. (Shown only while email isn’t set up.)
          </Alert>
        )}
        <Button type="submit" loading={loading} className="w-full py-3">
          Verify email
        </Button>
        <p className="text-center text-sm text-slate-600">
          Didn’t get it?{' '}
          {cooldown > 0 ? (
            <span className="text-slate-400">Resend in {cooldown}s</span>
          ) : (
            <button type="button" onClick={resend} className="font-semibold text-brand-700 hover:underline">
              Resend code
            </button>
          )}
        </p>
      </form>
    </AuthShell>
  );
}
