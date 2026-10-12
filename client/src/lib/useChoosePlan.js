import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './api';
import { useAuth } from '../context/AuthContext';

/**
 * Shared "choose this plan" action used by Pricing and Billing.
 * Logged out → sign-up; free/mock → activates now; paid → Stripe Checkout redirect.
 */
export function useChoosePlan() {
  const { user, setSubscription } = useAuth();
  const navigate = useNavigate();
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const choose = async (plan) => {
    setError('');
    setNotice('');
    if (!user) {
      navigate(`/register?role=${plan.audience}${plan.price > 0 ? `&plan=${plan._id}` : ''}`);
      return;
    }
    if (plan.audience !== user.role) {
      setError(`That plan is for ${plan.audience}s — you have a ${user.role} account.`);
      return;
    }
    setBusyId(plan._id);
    try {
      const data = await api('/subscriptions/checkout', { method: 'POST', body: { planId: plan._id } });
      if (data.url) {
        window.location.assign(data.url); // Stripe Checkout
        return;
      }
      setSubscription(data.subscription);
      setNotice(
        data.mock
          ? `You're now on the ${plan.name} plan. (Test mode — no payment was taken.)`
          : `You're now on the ${plan.name} plan.`
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return { choose, busyId, error, notice, setError, setNotice };
}
