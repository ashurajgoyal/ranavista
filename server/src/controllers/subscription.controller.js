import { z } from 'zod';
import { Plan } from '../models/Plan.js';
import { ApiError, asyncHandler } from '../utils/errors.js';
import { env } from '../config/env.js';
import { stripe, stripeEnabled } from '../config/stripe.js';
import {
  getOrCreateStripeCustomer,
  getUserSubscription,
  isStripeSubLive,
  revertToDefaultPlan,
  setUserPlan,
  syncStripeSubscription,
} from '../services/subscription.service.js';

export const schemas = {
  checkout: z.object({ planId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid plan') }),
  confirm: z.object({ sessionId: z.string().min(1) }),
};

/** Public: list active plans, optionally for one audience. */
export const listPlans = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (['buyer', 'seller'].includes(req.query.audience)) filter.audience = req.query.audience;
  const plans = await Plan.find(filter).sort({ audience: 1, sortOrder: 1, price: 1 });
  res.json({ plans, billingMode: stripeEnabled ? 'stripe' : 'mock' });
});

export const getMine = asyncHandler(async (req, res) => {
  const subscription = await getUserSubscription(req.user._id);
  res.json({ subscription, billingMode: stripeEnabled ? 'stripe' : 'mock' });
});

/**
 * Choose a plan.
 *  - Free plan            → switch immediately
 *  - Paid, mock mode      → activate immediately (no payment, testing only)
 *  - Paid, has live sub   → change price on the existing Stripe subscription (prorated)
 *  - Paid, no live sub    → create a Stripe Checkout session and return its URL
 */
export const checkout = asyncHandler(async (req, res) => {
  const user = req.user;
  const plan = await Plan.findById(req.body.planId);
  if (!plan || !plan.isActive) throw new ApiError(404, 'This plan is not available.');
  if (plan.audience !== user.role) throw new ApiError(400, `This plan is for ${plan.audience}s only.`);

  const current = await getUserSubscription(user._id);
  if (current?.plan?._id?.equals(plan._id) && current.status === 'active' && !current.cancelAtPeriodEnd) {
    throw new ApiError(400, 'You are already on this plan.');
  }

  // Free plan
  if (plan.price === 0) {
    if (isStripeSubLive(current)) {
      throw new ApiError(
        400,
        'To move to the free plan, cancel your paid plan. You’ll switch automatically at the end of the billing period.',
        'CANCEL_FIRST'
      );
    }
    const subscription = await setUserPlan(user, plan, { source: 'free' });
    return res.json({ activated: true, subscription });
  }

  // Paid plan, Stripe not configured → mock activation
  if (!stripeEnabled) {
    const end = new Date();
    if (plan.interval === 'year') end.setFullYear(end.getFullYear() + 1);
    else end.setMonth(end.getMonth() + 1);
    const subscription = await setUserPlan(user, plan, { source: 'mock', currentPeriodEnd: end });
    return res.json({ activated: true, mock: true, subscription });
  }

  if (!plan.stripePriceId) {
    throw new ApiError(400, 'This plan is not connected to Stripe yet. Please contact support.', 'PLAN_NOT_SYNCED');
  }

  // Already paying → switch plan on the same Stripe subscription
  if (isStripeSubLive(current)) {
    const stripeSub = await stripe.subscriptions.retrieve(current.stripeSubscriptionId);
    const updated = await stripe.subscriptions.update(stripeSub.id, {
      items: [{ id: stripeSub.items.data[0].id, price: plan.stripePriceId }],
      cancel_at_period_end: false,
      proration_behavior: 'create_prorations',
      metadata: { userId: user._id.toString(), planId: plan._id.toString() },
    });
    const subscription = await syncStripeSubscription(updated);
    return res.json({ activated: true, subscription });
  }

  // New paid subscription → Stripe Checkout
  const customer = await getOrCreateStripeCustomer(user);
  const metadata = { userId: user._id.toString(), planId: plan._id.toString() };
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer,
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    metadata,
    subscription_data: { metadata },
    allow_promotion_codes: true,
    success_url: `${env.clientUrl}/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.clientUrl}/billing?checkout=cancelled`,
  });
  res.json({ url: session.url });
});

/** Called by the success page so the plan shows immediately, even before the webhook arrives. */
export const confirmCheckout = asyncHandler(async (req, res) => {
  if (!stripeEnabled) throw new ApiError(400, 'Stripe is not configured.');
  const session = await stripe.checkout.sessions.retrieve(req.body.sessionId, { expand: ['subscription'] });
  if (session.metadata?.userId !== req.user._id.toString()) {
    throw new ApiError(403, 'This checkout does not belong to you.');
  }
  if (session.status !== 'complete' || !session.subscription) {
    return res.json({ pending: true, subscription: await getUserSubscription(req.user._id) });
  }
  const subscription = await syncStripeSubscription(session.subscription);
  res.json({ subscription });
});

/** Opens Stripe's hosted billing portal (update card, invoices). */
export const billingPortal = asyncHandler(async (req, res) => {
  if (!stripeEnabled) throw new ApiError(400, 'Billing portal is not available in test mode.');
  if (!req.user.stripeCustomerId) throw new ApiError(400, 'No billing account yet. Choose a paid plan first.');
  const session = await stripe.billingPortal.sessions.create({
    customer: req.user.stripeCustomerId,
    return_url: `${env.clientUrl}/billing`,
  });
  res.json({ url: session.url });
});

export const cancel = asyncHandler(async (req, res) => {
  const current = await getUserSubscription(req.user._id);
  if (!current || current.plan?.price === 0) throw new ApiError(400, 'You are on the free plan.');

  if (isStripeSubLive(current)) {
    const updated = await stripe.subscriptions.update(current.stripeSubscriptionId, { cancel_at_period_end: true });
    const subscription = await syncStripeSubscription(updated);
    return res.json({ subscription, message: 'Your plan will end at the close of the current billing period.' });
  }

  // mock / admin-assigned → back to free right away
  const subscription = await revertToDefaultPlan(req.user);
  res.json({ subscription, message: 'You are now on the free plan.' });
});

export const resume = asyncHandler(async (req, res) => {
  const current = await getUserSubscription(req.user._id);
  if (!isStripeSubLive(current) || !current.cancelAtPeriodEnd) throw new ApiError(400, 'Nothing to resume.');
  const updated = await stripe.subscriptions.update(current.stripeSubscriptionId, { cancel_at_period_end: false });
  const subscription = await syncStripeSubscription(updated);
  res.json({ subscription, message: 'Your plan will continue.' });
});
