import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { stripeEnabled } from './config/stripe.js';
import { createApp } from './app.js';

async function start() {
  await connectDB();
  const app = createApp();
  app.listen(env.port, () => {
    console.log(`✔ API running on http://localhost:${env.port}  (${env.nodeEnv})`);
    console.log(`  Website: ${env.clientUrl}   Admin: ${env.adminUrl}`);
    if (!stripeEnabled) {
      console.log('  ⚠ Billing in MOCK mode — add STRIPE_SECRET_KEY to take real payments.');
    }
  });
}

start().catch((err) => {
  console.error('✖ Failed to start server:', err);
  process.exit(1);
});
