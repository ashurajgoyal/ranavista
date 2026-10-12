import { z } from 'zod';
import { Plan } from '../models/Plan.js';
import { Subscription } from '../models/Subscription.js';
import { User } from '../models/User.js';
import { ApiError, asyncHandler } from '../utils/errors.js';
import { getPaging, pageMeta } from '../utils/paginate.js';
import { audit } from '../services/audit.service.js';
import { env } from '../config/env.js';
import { stripe, stripeEnabled } from '../config/stripe.js';
import {
  isStripeSubLive,
  revertToDefaultPlan,
  setUserPlan,
  syncPlanToStripe,
  syncStripeSubscription,
} from '../services/subscription.service.js';

const planBody = z.object({
  name: z.string().trim().min(2, 'Plan name is required').max(60),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, 'Slug can use lowercase letters, numbers and dashes')
    .optional(),
  audience: z.enum(['buyer', 'seller']),
  description: z.string().trim().max(500).optional().default(''),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  interval: z.enum(['month', 'year']).default('month'),
  features: z.array(z.string().trim().min(1)).max(30).default([]),
  limits: z
    .object({
      rfqsPerMonth: z.coerce.number().int().min(-1).default(0),
      leadsPerMonth: z.coerce.number().int().min(-1).default(0),
      teamMembers: z.coerce.number().int().min(-1).default(1),
    })
    .default({}),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  highlight: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
});

export const schemas = {
  createPlan: planBody,
  updatePlan: planBody.partial().omit({ audience: true }),
  assign: z.object({ userId: z.string().regex(/^[a-f\d]{24}$/i), planId: z.string().regex(/^[a-f\d]{24}$/i) }),
  cancel: z.object({ immediately: z.boolean().default(false) }),
};

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/** Only one default (free sign-up) plan per audience. */
async function enforceSingleDefault(plan) {
  if (plan.isDefault) {
    await Plan.updateMany({ audience: plan.audience, _id: { $ne: plan._id } }, { $set: { isDefault: false } });
  }
}

// ─────────────────────────── Plans ───────────────────────────

export const listPlans = asyncHandler(async (_req, res) => {
  const plans = await Plan.find().sort({ audience: 1, sortOrder: 1, price: 1 }).lean();
  const counts = await Subscription.aggregate([
    { $match: { status: { $in: ['active', 'trialing', 'past_due'] } } },
    { $group: { _id: '$plan', count: { $sum: 1 } } },
  ]);
  const byId = new Map(counts.map((c) => [c._id.toString(), c.count]));
  res.json({
    plans: plans.map((p) => ({ ...p, subscribers: byId.get(p._id.toString()) || 0 })),
    billingMode: stripeEnabled ? 'stripe' : 'mock',
    currency: env.currency,
  });
});

export const createPlan = asyncHandler(async (req, res) => {
  const data = { ...req.body, currency: env.currency };
  data.slug = data.slug || `${data.audience}-${slugify(data.name)}`;
  if (data.isDefault && data.price > 0) throw new ApiError(400, 'The default sign-up plan must be free (price 0).');

  const plan = await Plan.create(data);
  await enforceSingleDefault(plan);
  await syncPlanToStripe(plan);
  await audit(req, 'plan.create', { targetType: 'Plan', targetId: plan._id, meta: { name: plan.name, price: plan.price } });
  res.status(201).json({ plan });
});

export const updatePlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findById(req.params.id);
  if (!plan) throw new ApiError(404, 'Plan not found.');

  const before = { name: plan.name, price: plan.price, interval: plan.interval, isActive: plan.isActive };
  // Only apply fields that were actually sent
  const updates = Object.fromEntries(Object.entries(req.body).filter(([, v]) => v !== undefined));
  plan.set(updates);
  if (plan.isDefault && plan.price > 0) throw new ApiError(400, 'The default sign-up plan must be free (price 0).');
  if (before.price === 0 && plan.price > 0) {
    const free = await Subscription.countDocuments({ plan: plan._id, source: 'free' });
    if (free) throw new ApiError(400, `${free} users are on this free plan. Create a new paid plan instead.`);
  }

  await plan.save();
  await enforceSingleDefault(plan);
  await syncPlanToStripe(plan);
  await audit(req, 'plan.update', { targetType: 'Plan', targetId: plan._id, meta: { before, after: req.body } });
  res.json({ plan });
});

export const deletePlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findById(req.params.id);
  if (!plan) throw new ApiError(404, 'Plan not found.');
  const inUse = await Subscription.countDocuments({ plan: plan._id });
  if (inUse) throw new ApiError(400, `${inUse} users are on this plan. Deactivate it instead of deleting.`);
  if (plan.isDefault) throw new ApiError(400, 'You cannot delete the default sign-up plan.');

  if (stripeEnabled && plan.stripeProductId) {
    if (plan.stripePriceId) await stripe.prices.update(plan.stripePriceId, { active: false });
    await stripe.products.update(plan.stripeProductId, { active: false });
  }
  await plan.deleteOne();
  await audit(req, 'plan.delete', { targetType: 'Plan', targetId: plan._id, meta: { name: plan.name } });
  res.json({ message: 'Plan deleted.' });
});

// ─────────────────────────── Subscriptions ───────────────────────────

export const listSubscriptions = asyncHandler(async (req, res) => {
  const paging = getPaging(req.query);
  const filter = {};
  if (['buyer', 'seller'].includes(req.query.audience)) filter.audience = req.query.audience;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.source) filter.source = req.query.source;
  if (/^[a-f\d]{24}$/i.test(req.query.plan || '')) filter.plan = req.query.plan;
  if (req.query.paid === 'true') {
    const paidPlans = await Plan.find({ price: { $gt: 0 } }).distinct('_id');
    filter.plan = filter.plan || { $in: paidPlans };
  }

  const [subscriptions, total] = await Promise.all([
    Subscription.find(filter)
      .sort({ updatedAt: -1 })
      .skip(paging.skip)
      .limit(paging.limit)
      .populate('user', 'name email companyName role status')
      .populate('plan', 'name price interval currency audience'),
    Subscription.countDocuments(filter),
  ]);
  res.json({ subscriptions, ...pageMeta(total, paging) });
});

/** Admin manually puts a user on a plan (no payment taken). */
export const assignPlan = asyncHandler(async (req, res) => {
  const [user, plan] = await Promise.all([User.findById(req.body.userId), Plan.findById(req.body.planId)]);
  if (!user) throw new ApiError(404, 'User not found.');
  if (!plan) throw new ApiError(404, 'Plan not found.');
  if (plan.audience !== user.role) throw new ApiError(400, `That plan is for ${plan.audience}s.`);

  const current = await Subscription.findOne({ user: user._id });
  if (isStripeSubLive(current)) {
    throw new ApiError(
      409,
      'This user has an active paid Stripe subscription. Cancel it first, then assign the new plan.',
      'STRIPE_SUB_ACTIVE'
    );
  }

  const subscription = await setUserPlan(user, plan, { source: plan.price === 0 ? 'free' : 'admin' });
  await audit(req, 'subscription.assign', {
    targetType: 'User',
    targetId: user._id,
    meta: { plan: plan.name, previousPlan: current?.plan?.toString() },
  });
  res.json({ subscription });
});

/** Cancels a user's subscription. Stripe subs end at period end unless `immediately`. */
export const cancelSubscription = asyncHandler(async (req, res) => {
  const sub = await Subscription.findById(req.params.id).populate('plan');
  if (!sub) throw new ApiError(404, 'Subscription not found.');
  const user = await User.findById(sub.user);
  if (!user) throw new ApiError(404, 'User not found.');

  let subscription;
  if (isStripeSubLive(sub)) {
    if (req.body.immediately) {
      const canceled = await stripe.subscriptions.cancel(sub.stripeSubscriptionId);
      subscription = await syncStripeSubscription(canceled);
    } else {
      const updated = await stripe.subscriptions.update(sub.stripeSubscriptionId, { cancel_at_period_end: true });
      subscription = await syncStripeSubscription(updated);
    }
  } else {
    subscription = await revertToDefaultPlan(user);
  }

  await audit(req, 'subscription.cancel', {
    targetType: 'User',
    targetId: user._id,
    meta: { plan: sub.plan?.name, immediately: Boolean(req.body.immediately), source: sub.source },
  });
  res.json({ subscription });
});
