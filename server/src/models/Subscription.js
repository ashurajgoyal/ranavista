import mongoose from 'mongoose';

/**
 * One current subscription per user.
 * source:
 *   free   – default free plan given at sign-up / after cancellation
 *   stripe – paid through Stripe Billing (kept in sync by webhooks)
 *   admin  – assigned manually by an admin
 *   mock   – activated without payment because Stripe is not configured (testing only)
 */
const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    audience: { type: String, enum: ['buyer', 'seller'], required: true, index: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true, index: true },
    status: {
      type: String,
      enum: ['active', 'trialing', 'past_due', 'unpaid', 'incomplete', 'canceled'],
      default: 'active',
      index: true,
    },
    source: { type: String, enum: ['free', 'stripe', 'admin', 'mock'], default: 'free' },

    stripeSubscriptionId: { type: String, index: true },
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    cancelAtPeriodEnd: { type: Boolean, default: false },
    canceledAt: Date,
  },
  { timestamps: true }
);

subscriptionSchema.set('toJSON', { versionKey: false });

export const Subscription = mongoose.model('Subscription', subscriptionSchema);
