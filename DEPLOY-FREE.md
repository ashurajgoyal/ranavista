# Free deployment (₹0/month)

| Part | Service (free plan) | Example URL |
|---|---|---|
| Database | MongoDB Atlas — Free cluster (512 MB) | — |
| API (`server`) | Render — Free web service | `https://ranavista-api.onrender.com` |
| Website (`client`) | Netlify — Free plan | `https://ranavista.netlify.app` |
| Admin (`admin`) | Netlify — Free plan (2nd site) | `https://ranavista-admin.netlify.app` |
| OTP emails | Brevo — Free plan (300 emails/day) | — |

Free-plan limits: the Render API sleeps after ~15 minutes without traffic, so the first request after that takes 30–60 seconds. Render's free plan also blocks email (SMTP) ports, which is why emails go through Brevo's API.

## 0. Put the code on GitHub
Create a **private** repository and upload the contents of the `b2b-marketplace` folder (not `node_modules`).

## 1. MongoDB Atlas
1. mongodb.com/atlas → sign up → create a **Free** cluster.
2. Database Access → add a user + password.
3. Network Access → Add IP → `0.0.0.0/0` (allow from anywhere — Render's IPs change).
4. Connect → Drivers → copy the string and add the database name before `?`:
   `mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/ranavista?retryWrites=true&w=majority`

## 2. Brevo (for OTP emails)
1. brevo.com → sign up (free).
2. Senders & IP → Senders → add and verify the email you will send from (a Gmail works).
3. SMTP & API → API Keys → generate a key.

## 3. Render (API)
New → Web Service → connect the GitHub repo.

| Setting | Value |
|---|---|
| Root Directory | `server` |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `npm run seed && npm start` |
| Instance type | Free |

Environment variables:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGO_URI` | your Atlas string |
| `JWT_SECRET` | any long random text (40+ characters) |
| `ADMIN_JWT_SECRET` | a *different* long random text |
| `CLIENT_URL` | `https://ranavista.netlify.app` (your website URL, no trailing `/`) |
| `ADMIN_URL` | `https://ranavista-admin.netlify.app` |
| `BREVO_API_KEY` | from Brevo |
| `MAIL_FROM` | `Ranavista <the-email-you-verified@gmail.com>` |
| `CONTACT_NOTIFY_EMAIL` | where contact-form messages should go (optional) |
| `SEED_ADMIN_EMAIL` | your admin login email |
| `SEED_ADMIN_PASSWORD` | a strong admin password |
| `CURRENCY` | `inr` |

Leave `STRIPE_SECRET_KEY` empty for now (test mode). Deploy, then open `https://<your-api>.onrender.com/api/health` — it should show `{"ok":true,...}`.

`npm run seed` runs on every start; it only creates the plans and first admin if they don't exist yet.

## 4. Netlify (website)
Add new site → Import from Git → pick the repo.

| Setting | Value |
|---|---|
| Base directory | `client` |
| Build command | `npm run build` |
| Publish directory | `client/dist` |
| Environment variable | `VITE_API_URL` = `https://<your-api>.onrender.com` |

Site configuration → change the site name to `ranavista` (or anything free).

## 5. Netlify (admin panel)
Repeat step 4 as a **second site** with Base directory `admin`, Publish `admin/dist`, the same `VITE_API_URL`, and a name like `ranavista-admin`.

## 6. Connect them
If your Netlify names differ from step 3, update `CLIENT_URL` / `ADMIN_URL` on Render to the exact URLs and redeploy.

## 7. Test
1. Website → Register → you should receive the 6-digit code by email.
   (If email isn't set up, the code is printed in Render → Logs.)
2. Admin → log in with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` → approve suppliers, check Enquiries.

**"Cannot reach the server"?** Check that `VITE_API_URL` is correct, then trigger a new Netlify deploy (env changes need a rebuild). Also check that `CLIENT_URL`/`ADMIN_URL` on Render match exactly.
