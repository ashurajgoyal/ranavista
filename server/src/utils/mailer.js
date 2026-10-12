import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const transporter = env.smtp.host
  ? nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
    })
  : null;

/** "Name <email@x.com>" → { name, email } */
function parseFrom(from) {
  const m = /^\s*"?([^"<]*)"?\s*<([^>]+)>\s*$/.exec(from);
  return m ? { name: m[1].trim() || undefined, email: m[2].trim() } : { email: from.trim() };
}

/**
 * Brevo (formerly Sendinblue) HTTP API — works on hosts that block SMTP ports,
 * such as Render's free plan. Free tier: 300 emails/day.
 */
async function sendViaBrevo({ to, subject, text, html }) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': env.brevoApiKey, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      sender: parseFrom(env.mailFrom),
      to: [{ email: to }],
      subject,
      textContent: text,
      htmlContent: html || `<pre style="font-family:Arial,sans-serif">${text}</pre>`,
    }),
  });
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${await res.text()}`);
}

/**
 * Sends an email using, in order: Brevo API → SMTP → console.
 * Without any email settings (development) the email is printed
 * to the server console/logs instead, so OTPs can be read there.
 */
export async function sendMail({ to, subject, text, html }) {
  if (env.brevoApiKey) {
    try {
      await sendViaBrevo({ to, subject, text, html });
    } catch (err) {
      console.error(`✖ Failed to send email to ${to}:`, err.message);
    }
    return;
  }
  if (!transporter) {
    console.log('\n──────── ✉  EMAIL (console mode) ────────');
    console.log(`To:      ${to}\nSubject: ${subject}\n\n${text}`);
    console.log('─────────────────────────────────────────\n');
    return;
  }
  try {
    await transporter.sendMail({ from: env.mailFrom, to, subject, text, html: html || undefined });
  } catch (err) {
    // Don't break the request if email fails; log it for follow-up.
    console.error(`✖ Failed to send email to ${to}:`, err.message);
  }
}

const wrap = (title, body) => `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #E8DDD1;border-top:4px solid #B89B6B;border-radius:8px;background:#ffffff">
    <h2 style="margin:0 0 16px;color:#1F2D2A">${title}</h2>
    ${body}
    <p style="color:#64748b;font-size:12px;margin-top:24px">If you didn't request this, you can ignore this email.</p>
  </div>`;

export const emails = {
  otp(code, purpose, minutes) {
    const title = purpose === 'reset_password' ? 'Reset your password' : 'Verify your email';
    const text = `${title}\n\nYour code is: ${code}\nIt expires in ${minutes} minutes.`;
    const html = wrap(
      title,
      `<p>Your one-time code is:</p>
       <p style="font-size:32px;letter-spacing:8px;font-weight:bold;color:#0D3B32;margin:12px 0">${code}</p>
       <p>It expires in ${minutes} minutes.</p>`
    );
    return { subject: `${code} is your verification code`, text, html };
  },
  sellerApproved(name) {
    const text = `Hi ${name},\n\nYour supplier account has been approved. You can now receive leads.\n\n${env.clientUrl}/login`;
    return {
      subject: 'Your supplier account is approved',
      text,
      html: wrap('You’re approved 🎉', `<p>Hi ${name},</p><p>Your supplier account has been approved. You can now receive leads.</p><p><a href="${env.clientUrl}/login">Log in</a></p>`),
    };
  },
  sellerRejected(name, reason) {
    const text = `Hi ${name},\n\nWe couldn't approve your supplier account.${reason ? `\nReason: ${reason}` : ''}\nReply to this email if you have questions.`;
    return {
      subject: 'Update on your supplier application',
      text,
      html: wrap('Supplier application update', `<p>Hi ${name},</p><p>We couldn't approve your supplier account.</p>${reason ? `<p><b>Reason:</b> ${reason}</p>` : ''}`),
    };
  },
};
