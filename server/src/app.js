import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { stripeEnabled } from './config/stripe.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { planRouter, subscriptionRouter } from './routes/subscription.routes.js';
import { stripeWebhook } from './controllers/webhook.controller.js';
import contactRoutes from './routes/contact.routes.js';
import { errorHandler, notFound } from './middleware/error.js';

export function createApp() {
  const app = express();
  app.set('trust proxy', 1); // behind nginx / load balancer

  app.use(helmet());
  app.use(
    cors({
      origin(origin, cb) {
        // Allow the website, the admin panel, and tools without an Origin (curl, Stripe)
        if (!origin || [env.clientUrl, env.adminUrl].includes(origin)) return cb(null, true);
        cb(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
    })
  );
  if (env.isDev) app.use(morgan('dev'));

  // Stripe needs the raw body to verify signatures — must come before express.json()
  app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhook);

  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) =>
    res.json({ ok: true, env: env.nodeEnv, billingMode: stripeEnabled ? 'stripe' : 'mock' })
  );

  app.use('/api/auth', authRoutes);
  app.use('/api/plans', planRouter);
  app.use('/api/subscriptions', subscriptionRouter);
  app.use('/api/contact', contactRoutes);
  app.use('/api/admin', adminRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
