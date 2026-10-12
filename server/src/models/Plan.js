import mongoose from 'mongoose';

/**
 * A subscription plan for buyers (Basic / Growth / Enterprise)
 * or sellers (Starter / Professional / Enterprise).
 * Limits use -1 for "unlimited".
 */
const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    audience: { type: String, enum: ['buyer', 'seller'], required: true, index: true },
    description: { type: String, trim: true, maxlength: 500 },

    price: { type: Number, required: true, min: 0 }, // major units, e.g. 1999 = ₹1,999
    currency: { type: String, default: 'inr', lowercase: true },
    interval: { type: String, enum: ['month', 'year'], default: 'month' },

    features: [{ type: String, trim: true }],
    limits: {
      rfqsPerMonth: { type: Number, default: 0 }, // buyers: RFQs they can post
      leadsPerMonth: { type: Number, default: 0 }, // sellers: leads admin can assign
      teamMembers: { type: Number, default: 1 },
    },

    isDefault: { type: Boolean, default: false }, // free plan given on sign-up
    isActive: { type: Boolean, default: true },
    highlight: { type: Boolean, default: false }, // "Most popular" badge
    sortOrder: { type: Number, default: 0 },

    stripeProductId: String,
    stripePriceId: String,
  },
  { timestamps: true }
);

planSchema.virtual('isFree').get(function isFree() {
  return this.price === 0;
});

planSchema.set('toJSON', { virtuals: true, versionKey: false });

export const Plan = mongoose.model('Plan', planSchema);
