/**
 * Seeds the 6 subscription plans from the quotation and the first super admin.
 * Safe to run more than once: existing plans (matched by slug) and admins are left as they are.
 *   npm run seed
 */
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { connectDB } from '../config/db.js';
import { stripeEnabled } from '../config/stripe.js';
import { Plan } from '../models/Plan.js';
import { Admin } from '../models/Admin.js';
import { syncPlanToStripe } from '../services/subscription.service.js';

// Prices are placeholders — edit them any time from Admin → Plans.
const plans = [
  {
    slug: 'buyer-basic',
    name: 'Basic',
    audience: 'buyer',
    price: 0,
    isDefault: true,
    sortOrder: 1,
    description: 'For trying the marketplace with occasional sourcing needs.',
    limits: { rfqsPerMonth: 3, leadsPerMonth: 0, teamMembers: 1 },
    features: ['Post up to 3 RFQs a month', 'Verified seller quotes', 'In-app chat with your seller', 'Escrow-protected payments'],
  },
  {
    slug: 'buyer-growth',
    name: 'Growth',
    audience: 'buyer',
    price: 1999,
    highlight: true,
    sortOrder: 2,
    description: 'For businesses sourcing every week.',
    limits: { rfqsPerMonth: 25, leadsPerMonth: 0, teamMembers: 3 },
    features: ['Post up to 25 RFQs a month', 'Priority admin review', 'Container fill optimizer', 'Up to 3 team members', 'Email + WhatsApp alerts'],
  },
  {
    slug: 'buyer-enterprise',
    name: 'Enterprise',
    audience: 'buyer',
    price: 4999,
    sortOrder: 3,
    description: 'For procurement teams with high volume.',
    limits: { rfqsPerMonth: -1, leadsPerMonth: 0, teamMembers: 10 },
    features: ['Unlimited RFQs', 'Dedicated account manager', 'Fastest seller matching', 'Up to 10 team members', 'Priority dispute handling'],
  },
  {
    slug: 'seller-starter',
    name: 'Starter',
    audience: 'seller',
    price: 0,
    isDefault: true,
    sortOrder: 1,
    description: 'Get listed and receive your first leads.',
    limits: { rfqsPerMonth: 0, leadsPerMonth: 3, teamMembers: 1 },
    features: ['Up to 3 leads a month', 'Verified seller badge', 'Quote & chat with buyers', 'Secure escrow payouts'],
  },
  {
    slug: 'seller-professional',
    name: 'Professional',
    audience: 'seller',
    price: 2499,
    highlight: true,
    sortOrder: 2,
    description: 'For growing suppliers who want steady leads.',
    limits: { rfqsPerMonth: 0, leadsPerMonth: 30, teamMembers: 3 },
    features: ['Up to 30 leads a month', 'Higher placement in admin matching', 'Up to 3 team members', 'Performance insights'],
  },
  {
    slug: 'seller-enterprise',
    name: 'Enterprise',
    audience: 'seller',
    price: 6999,
    sortOrder: 3,
    description: 'For manufacturers and exporters at scale.',
    limits: { rfqsPerMonth: 0, leadsPerMonth: -1, teamMembers: 10 },
    features: ['Unlimited leads', 'Top priority in admin matching', 'Dedicated account manager', 'Up to 10 team members'],
  },
];

async function seed() {
  await connectDB();

  for (const data of plans) {
    let plan = await Plan.findOne({ slug: data.slug });
    if (plan) {
      console.log(`• Plan exists: ${plan.audience}/${plan.name}`);
    } else {
      plan = await Plan.create({ ...data, currency: env.currency });
      console.log(`✔ Created plan: ${plan.audience}/${plan.name} (${plan.price})`);
    }
    if (stripeEnabled && plan.price > 0 && !plan.stripePriceId) {
      await syncPlanToStripe(plan);
      console.log(`  ↳ synced to Stripe (${plan.stripePriceId})`);
    }
  }

  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@ranavista.com').toLowerCase();
  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log(`• Admin exists: ${email}`);
  } else {
    await Admin.create({
      name: process.env.SEED_ADMIN_NAME || 'Super Admin',
      email,
      password: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345',
      role: 'super_admin',
    });
    console.log(`✔ Created super admin: ${email}  (change the password after first login)`);
  }

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch(async (err) => {
  console.error('✖ Seed failed:', err);
  await mongoose.disconnect();
  process.exit(1);
});
