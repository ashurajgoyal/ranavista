import 'dotenv/config';

const required = ['MONGO_URI', 'JWT_SECRET', 'ADMIN_JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`✖ Missing required environment variables: ${missing.join(', ')}`);
  console.error('  Copy server/.env.example to server/.env and fill it in.');
  process.exit(1);
}

const nodeEnv = process.env.NODE_ENV || 'development';

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv,
  isDev: nodeEnv === 'development',
  mongoUri: process.env.MONGO_URI,

  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  adminJwtSecret: process.env.ADMIN_JWT_SECRET,
  adminJwtExpiresIn: process.env.ADMIN_JWT_EXPIRES_IN || '12h',

  clientUrl: (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, ''),
  adminUrl: (process.env.ADMIN_URL || 'http://localhost:5174').replace(/\/$/, ''),

  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  currency: (process.env.CURRENCY || 'inr').toLowerCase(),

  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  mailFrom: process.env.MAIL_FROM || 'Ranavista <no-reply@ranavista.com>',
  contactNotifyEmail: process.env.CONTACT_NOTIFY_EMAIL || '',
  brevoApiKey: process.env.BREVO_API_KEY || '',
};
