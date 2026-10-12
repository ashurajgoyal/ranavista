# Ranavista — B2B Sourcing Marketplace (Phase 1)

MERN stack: **MongoDB · Express · React · Node.js**

Phase 1 delivers the foundation everything else is built on:

| Part | Folder | Runs on (dev) | Production URL |
|---|---|---|---|
| API | `server/` | http://localhost:5000 | `https://api.domain.com` |
| Buyer & seller website | `client/` | http://localhost:5173 | `https://domain.com` |
| Admin panel | `admin/` | http://localhost:5174 | `https://manage.domain.com` |

The website and admin panel are **separate React apps** with separate logins and separate JWT secrets, so a buyer/seller token can never open the admin API.

---

## What works in Phase 1

**Website (buyers & sellers)**
- Register as buyer or seller (sellers add company, categories, GST, city)
- Email OTP verification (6-digit code, 10-minute expiry, 5 attempts, resend with cooldown)
- Login, logout, forgot password → OTP → reset password, change password
- Sellers stay **pending** until an admin approves them; dashboard shows their status
- Pricing page, plan selection, Stripe Checkout, plan upgrade/downgrade (prorated), cancel at period end, resume, Stripe billing portal (cards & invoices)
- Every new user gets the free default plan automatically
- Dashboard and profile pages

**Admin panel (`manage.` subdomain)**
- Admin login with roles: **Super Admin, Finance, Support, Category Manager**
- Dashboard: buyers, sellers, pending approvals, signups chart, MRR, subscribers by plan
- Seller approval queue — approve / reject with reason (seller is emailed)
- Buyers & sellers list with search, filters, suspend / reactivate
- Plans: create, edit, deactivate, delete — paid plans sync to Stripe automatically
- Subscriptions: view all, assign a plan manually, cancel (now or at period end)
- Admin team management (super admin only)
- Audit log of every admin action

**Coming in later phases:** RFQ posting, admin lead queue & single-seller push, quotations, chat, escrow payments, invoices, reviews, container fill optimizer.

---

## Website pages & brand

Design follows the **Ranavista Brand Color Guide**: Primary Dark Green `#0D3B32`, Brand Gold `#B89B6B`, Warm Cream `#F7F3EA`, Soft Beige `#E8DDD1`, Text Dark `#1F2D2A`, Text Medium `#6B7A78`, with Playfair Display (headings) and Poppins (body). All colours live in `client/src/index.css` and `admin/src/index.css`.

| Page | URL |
|---|---|
| Home | `/` |
| About Us | `/about` |
| Products (10 categories) | `/products` |
| Sourcing Countries | `/sourcing-countries` |
| Trade Fairs | `/trade-fairs` |
| Resources (live currency rates, Incoterms, container guide, RFQ checklist) | `/resources` |
| How It Works | `/how-it-works` |
| Pricing | `/pricing` |
| FAQ | `/faq` |
| Contact Us (saves to Admin → Enquiries) | `/contact` |
| Privacy Policy · Terms & Conditions · Refund & Cancellation · Cookie Policy | `/privacy-policy` · `/terms` · `/refund-policy` · `/cookie-policy` |
| Login · Register · Verify email · Forgot/Reset password | `/login` … |
| Dashboard · Plan & billing · Profile | `/dashboard` · `/billing` · `/profile` |

Site-wide search: the search icon in the header, or **Ctrl/Cmd + K**.

### Edit company details & content (no coding needed)
- `client/src/config/site.js` — email, phone, WhatsApp, address, office hours, social links, legal company name, grievance officer, court jurisdiction. Empty values are hidden automatically.
- `client/src/data/catalog.js` — product categories, sourcing countries, trade fairs (add exact `start`/`end` dates to show Upcoming / Happening now / Ended).
- `client/src/data/faqs.js` — FAQ questions and answers.
- Logo: the lotus mark is drawn in `client/src/components/Logo.jsx`. To use your official logo file, put it in `client/public/` and swap the `<LotusMark>` for an `<img>`.

> The policy pages are well-structured templates for an India-based B2B platform. Have them reviewed by a lawyer before launch.

---

## Run it locally

You need **Node.js 20+** and **MongoDB** (local install or a free MongoDB Atlas cluster).

```bash
# 1. Install everything (root + all three apps)
npm install

# 2. Configure the API
cp server/.env.example server/.env
#    → set MONGO_URI, JWT_SECRET, ADMIN_JWT_SECRET (any long random strings)

# 3. Create the 6 plans + the first super admin
npm run seed

# 4. Start API + website + admin panel together
npm run dev
```

Open:
- Website → http://localhost:5173
- Admin → http://localhost:5174 (log in with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from `.env`, default `admin@domain.com` / `Admin@12345` — **change it**)

### Test mode (no Stripe, no email)
Out of the box nothing external is needed:
- **Email:** with `SMTP_HOST` empty, OTP codes print in the API terminal and also appear on the verify screen (development only).
- **Payments:** with `STRIPE_SECRET_KEY` empty, billing runs in **mock mode** — paid plans switch on instantly without charging. A yellow banner shows in both apps.

---

## Connecting Stripe

1. Create a Stripe account and copy the **secret key** into `server/.env` → `STRIPE_SECRET_KEY`.
2. Set `CURRENCY` (e.g. `inr`, `usd`, `cad`). Your Stripe account must support it.
3. Run `npm run seed` again — paid plans are created in Stripe as Products + Prices.
   (Or open each plan in Admin → Plans and click Save.)
4. Add a webhook endpoint in Stripe → Developers → Webhooks:
   - URL: `https://api.domain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`
   - Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
5. In Stripe → Settings → Billing → Customer portal, turn the portal on.

For local testing use the Stripe CLI:
```bash
stripe listen --forward-to localhost:5000/api/webhooks/stripe
```

> **India note:** Stripe restricts some features for India-registered businesses (recurring card payments need e-mandates, and Stripe Connect for marketplace payouts is limited). Confirm your Stripe account supports subscriptions before launch. The subscription logic lives in one file (`server/src/services/subscription.service.js`), so switching to Razorpay later is contained.

---

## Deploying on subdomains

Build the two front ends:
```bash
VITE_API_URL=https://api.domain.com npm run build
# → client/dist  (website)   admin/dist  (admin panel)
```

Set in `server/.env` for production:
```
NODE_ENV=production
CLIENT_URL=https://domain.com
ADMIN_URL=https://manage.domain.com
SMTP_HOST=...            # real email so OTPs are delivered
```

Run the API with a process manager:
```bash
npm install -g pm2
pm2 start server/src/index.js --name ranavista-api
```

Example **nginx** config (add HTTPS with `certbot --nginx`):
```nginx
# Website
server {
  server_name domain.com www.domain.com;
  root /var/www/ranavista/client/dist;
  location / { try_files $uri /index.html; }
}

# Admin panel
server {
  server_name manage.domain.com;
  root /var/www/ranavista/admin/dist;
  location / { try_files $uri /index.html; }
}

# API
server {
  server_name api.domain.com;
  location / {
    proxy_pass http://127.0.0.1:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Tip: you can also restrict `manage.domain.com` to your office IPs in nginx (`allow …; deny all;`) for extra safety.

---

## Project structure

```
server/src
  config/        env, MongoDB, Stripe
  models/        User, Admin, Plan, Subscription, Otp, AuditLog
  controllers/   auth, subscription, webhook, admin, adminBilling
  services/      subscription (Stripe sync), audit
  middleware/    auth (user/admin/roles), validation, errors
  routes/        /api/auth, /api/plans, /api/subscriptions, /api/admin, /api/webhooks
  scripts/seed.js
client/src       website: pages/, components/, context/AuthContext, lib/
admin/src        admin:   pages/, components/, context/AdminAuth, lib/
```

## API overview

| Method | Path | Who |
|---|---|---|
| POST | `/api/auth/register` · `/verify-email` · `/resend-otp` · `/login` | Public |
| POST | `/api/auth/forgot-password` · `/reset-password` | Public |
| GET/PATCH | `/api/auth/me` · POST `/api/auth/change-password` | User |
| GET | `/api/plans?audience=buyer\|seller` | Public |
| GET | `/api/subscriptions/me` | User |
| POST | `/api/subscriptions/checkout` · `/confirm` · `/portal` · `/cancel` · `/resume` | User |
| POST | `/api/admin/auth/login` · GET `/api/admin/auth/me` | Admin |
| GET | `/api/admin/dashboard` | Any admin |
| GET/PATCH | `/api/admin/users`, `/users/:id`, `/users/:id/status` | Support, Category Mgr |
| CRUD | `/api/admin/plans` | Finance |
| GET/POST | `/api/admin/subscriptions`, `/assign`, `/:id/cancel` | Finance |
| CRUD | `/api/admin/admins` · GET `/api/admin/audit` | Super Admin |

Super Admin can access everything.

## Security built in
- Passwords hashed with bcrypt (12 rounds); OTPs stored as SHA-256 hashes, auto-deleted by MongoDB TTL
- Separate JWT secrets and audiences for website vs admin
- Rate limiting on login, OTP and admin login routes
- Helmet security headers, CORS locked to your two front-end domains
- Input validation on every endpoint (zod)
- Stripe webhook signature verification
- Full audit trail of admin actions
