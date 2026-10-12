import { env } from '../config/env.js';
import { stripe, stripeEnabled } from '../config/stripe.js';
import { syncStripeSubscription } from '../services/subscription.service.js';

/**
 * Stripe webhook. Mounted with express.raw() so the signature can be verified.
 * Events to enable in the Stripe dashboard:
 *   checkout.session.completed, customer.subscription.created,
 *   customer.subscription.updated, customer.subscription.deleted,
 *   invoice.paid, invoice.payment_failed
 */
export async function stripeWebhook(req, res) {
  if (!stripeEnabled) return res.status(400).send('Stripe not configured');

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], env.stripeWebhookSecret);
  } catch (err) {
    console.error('✖ Stripe webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode === 'subscription' && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription);
          await syncStripeSubscription(sub);
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await syncStripeSubscription(event.data.object);
        break;
      case 'invoice.paid':
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subId =
          invoice.subscription || invoice.parent?.subscription_details?.subscription || null;
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(typeof subId === 'string' ? subId : subId.id);
          await syncStripeSubscription(sub);
        }
        break;
      }
      default:
        break;
    }
    res.json({ received: true });
  } catch (err) {
    console.error(`✖ Error handling ${event.type}:`, err);
    // 500 makes Stripe retry later
    res.status(500).send('Webhook handler failed');
  }
}
