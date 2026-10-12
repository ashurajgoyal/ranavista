import { Plan } from '../models/Plan.js';
import { Subscription } from '../models/Subscription.js';
import { User } from '../models/User.js';
import { stripe, stripeEnabled } from '../config/stripe.js';
import { ApiError } from '../utils/errors.js';

export async function getDefaultPlan(audience) {
  const plan = await Plan.findOne({ audience, isDefault: true, isActive: true });
  if (plan) return plan;
  // Fallback: cheapest active plan for that audience
  return Plan.findOne({ audience, isActive: true }).sort({ price: 1, sortOrder: 1 });
}

export async function getUserSubscription(userId) {
  return Subscription.findOne({ user: userId }).populate('plan');
}

/** Puts a user on a plan (creates or updates their single subscription record). */
export async function setUserPlan(user, plan, fields = {}) {
  return Subscription.findOneAndUpdate(
    { user: user._id },
    {
      $set: {
        audience: user.role,
        plan: plan._id,
        status: 'active',
        source: plan.price === 0 ? 'free' : 'admin',
        stripeSubscriptionId: null,
        currentPeriodStart: new Date(),
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        canceledAt: null,
        ...fields,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).populate('plan');
}

/** Gives a newly verified user the free default plan (no-op if they already have one). */
export async function ensureDefaultSubscription(user) {
  const existing = await getUserSubscription(user._id);
  if (existing) return existing;
  const plan = await getDefaultPlan(user.role);
  if (!plan) return null; // no plans seeded yet
  return setUserPlan(user, plan, { source: 'free' });
}

/** Moves the user back to the free default plan (after a cancellation ends). */
export async function revertToDefaultPlan(user) {
  const plan = await getDefaultPlan(user.role);
  if (!plan) {
    await Subscription.deleteOne({ user: user._id });
    return null;
  }
  return setUserPlan(user, plan, { source: 'free' });
}

export function isStripeSubLive(sub) {
  return (
    sub?.source === 'stripe' &&
    sub.stripeSubscriptionId &&
    ['active', 'trialing', 'past_due', 'unpaid', 'incomplete'].includes(sub.status)
  );
}

// ─────────────────────────── Stripe ───────────────────────────

export async function getOrCreateStripeCustomer(user) {
  if (!stripeEnabled) throw new ApiError(400, 'Stripe is not configured.');
  if (user.stripeCustomerId) return user.stripeCustomerId;
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.companyName || user.name,
    phone: user.phone || undefined,
    metadata: { userId: user._id.toString(), role: user.role },
  });
  user.stripeCustomerId = customer.id;
  await user.save();
  return customer.id;
}

/**
 * Creates/updates the Stripe Product + Price for a paid plan.
 * Stripe prices can't be edited, so a price change creates a new Price
 * and archives the old one (existing subscribers keep their old price
 * until they change plan).
 */
export async function syncPlanToStripe(plan) {
  if (!stripeEnabled || plan.price === 0) return plan;

  if (!plan.stripeProductId) {
    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description || undefined,
      metadata: { planId: plan._id.toString(), audience: plan.audience },
    });
    plan.stripeProductId = product.id;
  } else {
    await stripe.products.update(plan.stripeProductId, {
      name: plan.name,
      description: plan.description || undefined,
      active: plan.isActive,
    });
  }

  const unitAmount = Math.round(plan.price * 100);
  let needsNewPrice = !plan.stripePriceId;
  if (plan.stripePriceId) {
    const current = await stripe.prices.retrieve(plan.stripePriceId);
    needsNewPrice =
      current.unit_amount !== unitAmount ||
      current.currency !== plan.currency ||
      current.recurring?.interval !== plan.interval;
    if (needsNewPrice) await stripe.prices.update(plan.stripePriceId, { active: false });
  }

  if (needsNewPrice) {
    const price = await stripe.prices.create({
      product: plan.stripeProductId,
      unit_amount: unitAmount,
      currency: plan.currency,
      recurring: { interval: plan.interval },
      metadata: { planId: plan._id.toString() },
    });
    plan.stripePriceId = price.id;
  }

  await plan.save();
  return plan;
}

const toDate = (unix) => (unix ? new Date(unix * 1000) : null);

/**
 * Mirrors a Stripe subscription object into our database.
 * Called from webhooks and from the checkout success page.
 */
export async function syncStripeSubscription(stripeSub) {
  const customerId = typeof stripeSub.customer === 'string' ? stripeSub.customer : stripeSub.customer?.id;

  let user = null;
  if (stripeSub.metadata?.userId) user = await User.findById(stripeSub.metadata.userId);
  if (!user && customerId) user = await User.findOne({ stripeCustomerId: customerId });
  if (!user) {
    console.warn(`⚠ Stripe subscription ${stripeSub.id} has no matching user`);
    return null;
  }

  const item = stripeSub.items?.data?.[0];
  const priceId = item?.price?.id;
  const plan =
    (priceId && (await Plan.findOne({ stripePriceId: priceId }))) ||
    (stripeSub.metadata?.planId && (await Plan.findById(stripeSub.metadata.planId)));

  const current = await Subscription.findOne({ user: user._id });

  // Subscription ended → back to free plan (only if this is the user's current Stripe sub)
  if (['canceled', 'incomplete_expired'].includes(stripeSub.status)) {
    if (!current || !current.stripeSubscriptionId || current.stripeSubscriptionId === stripeSub.id) {
      return revertToDefaultPlan(user);
    }
    return current;
  }

  if (!plan) {
    console.warn(`⚠ Stripe price ${priceId} does not match any plan`);
    return current;
  }

  // Newer Stripe API versions moved period dates onto subscription items.
  const periodStart = stripeSub.current_period_start ?? item?.current_period_start;
  const periodEnd = stripeSub.current_period_end ?? item?.current_period_end;

  return Subscription.findOneAndUpdate(
    { user: user._id },
    {
      $set: {
        audience: user.role,
        plan: plan._id,
        status: stripeSub.status === 'paused' ? 'past_due' : stripeSub.status,
        source: 'stripe',
        stripeSubscriptionId: stripeSub.id,
        currentPeriodStart: toDate(periodStart),
        currentPeriodEnd: toDate(periodEnd),
        cancelAtPeriodEnd: Boolean(stripeSub.cancel_at_period_end),
        canceledAt: toDate(stripeSub.canceled_at),
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).populate('plan');
}
