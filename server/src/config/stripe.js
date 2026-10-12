import Stripe from 'stripe';
import { env } from './env.js';

/**
 * Stripe client. When STRIPE_SECRET_KEY is empty the app runs in MOCK mode:
 * paid plans are activated immediately without taking payment, so the whole
 * subscription flow can be tested locally. Never run production in mock mode.
 */
export const stripe = env.stripeSecretKey ? new Stripe(env.stripeSecretKey) : null;
export const stripeEnabled = Boolean(stripe);
