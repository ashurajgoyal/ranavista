import { z } from 'zod';
import { Enquiry } from '../models/Enquiry.js';
import { ApiError, asyncHandler } from '../utils/errors.js';
import { escapeRegex, getPaging, pageMeta } from '../utils/paginate.js';
import { sendMail } from '../utils/mailer.js';
import { audit } from '../services/audit.service.js';
import { env } from '../config/env.js';

const TOPIC_LABELS = {
  buying: 'Sourcing enquiry',
  selling: 'Supplier enquiry',
  partnership: 'Partnership / media',
  support: 'Account support',
  other: 'General enquiry',
};

export const schemas = {
  create: z.object({
    name: z.string().trim().min(2, 'Please enter your name').max(120),
    email: z.string().trim().toLowerCase().email('Enter a valid email address'),
    phone: z
      .string()
      .trim()
      .max(25)
      .refine((v) => !v || /^\+?[0-9\s-]{7,20}$/.test(v), 'Enter a valid phone number')
      .optional()
      .default(''),
    company: z.string().trim().max(160).optional().default(''),
    topic: z.enum(['buying', 'selling', 'partnership', 'support', 'other']).default('other'),
    message: z.string().trim().min(10, 'Please write a little more (at least 10 characters)').max(5000),
    website: z.string().optional(), // honeypot
  }),
  update: z.object({
    status: z.enum(['new', 'in_progress', 'closed']).optional(),
    note: z.string().trim().max(2000).optional(),
  }),
};

/** Public: website contact form. */
export const createEnquiry = asyncHandler(async (req, res) => {
  const { website, ...data } = req.body;
  // Bots fill the hidden "website" field; pretend success and drop it.
  if (website) return res.status(201).json({ ok: true });

  const enquiry = await Enquiry.create({ ...data, ip: req.ip });

  const to = env.contactNotifyEmail;
  if (to) {
    await sendMail({
      to,
      subject: `New ${TOPIC_LABELS[data.topic]} from ${data.name}`,
      text: [
        `Topic:   ${TOPIC_LABELS[data.topic]}`,
        `Name:    ${data.name}`,
        `Email:   ${data.email}`,
        `Phone:   ${data.phone || '—'}`,
        `Company: ${data.company || '—'}`,
        '',
        data.message,
        '',
        `Open in admin: ${env.adminUrl}/enquiries`,
      ].join('\n'),
    });
  }

  res.status(201).json({ ok: true, id: enquiry._id });
});

// ─────────────────────────── Admin ───────────────────────────

export const listEnquiries = asyncHandler(async (req, res) => {
  const paging = getPaging(req.query);
  const filter = {};
  if (['new', 'in_progress', 'closed'].includes(req.query.status)) filter.status = req.query.status;
  if (TOPIC_LABELS[req.query.topic]) filter.topic = req.query.topic;
  if (req.query.q) {
    const rx = new RegExp(escapeRegex(String(req.query.q).trim()), 'i');
    filter.$or = [{ name: rx }, { email: rx }, { company: rx }, { message: rx }];
  }
  const [enquiries, total, newCount] = await Promise.all([
    Enquiry.find(filter).sort({ createdAt: -1 }).skip(paging.skip).limit(paging.limit),
    Enquiry.countDocuments(filter),
    Enquiry.countDocuments({ status: 'new' }),
  ]);
  res.json({ enquiries, newCount, ...pageMeta(total, paging) });
});

export const updateEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id);
  if (!enquiry) throw new ApiError(404, 'Enquiry not found.');
  const before = enquiry.status;
  enquiry.set(Object.fromEntries(Object.entries(req.body).filter(([, v]) => v !== undefined)));
  await enquiry.save();
  await audit(req, 'enquiry.update', { targetType: 'Enquiry', targetId: enquiry._id, meta: { from: before, to: enquiry.status, name: enquiry.name } });
  res.json({ enquiry });
});
