import { z } from 'zod';
import { Admin, ADMIN_ROLES } from '../models/Admin.js';
import { User } from '../models/User.js';
import { Subscription } from '../models/Subscription.js';
import { AuditLog } from '../models/AuditLog.js';
import { Enquiry } from '../models/Enquiry.js';
import { ApiError, asyncHandler } from '../utils/errors.js';
import { signAdminToken } from '../utils/tokens.js';
import { emails, sendMail } from '../utils/mailer.js';
import { escapeRegex, getPaging, pageMeta } from '../utils/paginate.js';
import { audit } from '../services/audit.service.js';
import { stripeEnabled } from '../config/stripe.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID');

export const schemas = {
  login: z.object({
    email: z.string().trim().toLowerCase().email('Enter a valid email'),
    password: z.string().min(1, 'Enter your password'),
  }),
  userStatus: z.object({
    status: z.enum(['active', 'rejected', 'suspended']),
    reason: z.string().trim().max(500).optional(),
  }),
  createAdmin: z.object({
    name: z.string().trim().min(2),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(ADMIN_ROLES),
  }),
  updateAdmin: z.object({
    name: z.string().trim().min(2).optional(),
    role: z.enum(ADMIN_ROLES).optional(),
    isActive: z.boolean().optional(),
    password: z.string().min(8).optional(),
  }),
  objectId,
};

// ─────────────────────────── Auth ───────────────────────────

export const login = asyncHandler(async (req, res) => {
  const admin = await Admin.findOne({ email: req.body.email }).select('+password');
  if (!admin || !(await admin.comparePassword(req.body.password))) {
    throw new ApiError(401, 'Incorrect email or password.', 'INVALID_CREDENTIALS');
  }
  if (!admin.isActive) throw new ApiError(403, 'This admin account is disabled.', 'ADMIN_DISABLED');
  admin.lastLoginAt = new Date();
  await admin.save();
  req.admin = admin;
  await audit(req, 'admin.login', { targetType: 'Admin', targetId: admin._id });
  res.json({ token: signAdminToken(admin), admin });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ admin: req.admin, billingMode: stripeEnabled ? 'stripe' : 'mock' });
});

// ─────────────────────────── Dashboard ───────────────────────────

export const dashboard = asyncHandler(async (_req, res) => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [buyers, sellers, pendingSellers, newUsers30d, byPlan, signupSeries, recentUsers, newEnquiries] = await Promise.all([
    User.countDocuments({ role: 'buyer', emailVerified: true }),
    User.countDocuments({ role: 'seller', emailVerified: true }),
    User.countDocuments({ role: 'seller', status: 'pending', emailVerified: true }),
    User.countDocuments({ emailVerified: true, createdAt: { $gte: since } }),
    Subscription.aggregate([
      { $match: { status: { $in: ['active', 'trialing', 'past_due'] } } },
      { $group: { _id: '$plan', count: { $sum: 1 } } },
      { $lookup: { from: 'plans', localField: '_id', foreignField: '_id', as: 'plan' } },
      { $unwind: '$plan' },
      {
        $project: {
          _id: 0,
          planId: '$plan._id',
          name: '$plan.name',
          audience: '$plan.audience',
          price: '$plan.price',
          interval: '$plan.interval',
          currency: '$plan.currency',
          count: 1,
        },
      },
      { $sort: { audience: 1, price: 1 } },
    ]),
    User.aggregate([
      { $match: { emailVerified: true, createdAt: { $gte: since } } },
      {
        $group: {
          _id: { day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, role: '$role' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.day': 1 } },
    ]),
    User.find({ emailVerified: true }).sort({ createdAt: -1 }).limit(8),
    Enquiry.countDocuments({ status: 'new' }),
  ]);

  // Monthly recurring revenue from paid, active subscriptions
  const mrr = byPlan.reduce((sum, p) => {
    if (!p.price) return sum;
    const monthly = p.interval === 'year' ? p.price / 12 : p.price;
    return sum + monthly * p.count;
  }, 0);
  const paidSubscribers = byPlan.filter((p) => p.price > 0).reduce((s, p) => s + p.count, 0);

  // Fill the last 30 days so the chart has no gaps
  const days = [];
  for (let i = 29; i >= 0; i -= 1) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    days.push({ day: d, buyers: 0, sellers: 0 });
  }
  for (const row of signupSeries) {
    const day = days.find((d) => d.day === row._id.day);
    if (day) day[row._id.role === 'buyer' ? 'buyers' : 'sellers'] = row.count;
  }

  res.json({
    stats: { buyers, sellers, pendingSellers, newUsers30d, mrr: Math.round(mrr), paidSubscribers, newEnquiries },
    byPlan,
    signups: days,
    recentUsers,
    billingMode: stripeEnabled ? 'stripe' : 'mock',
  });
});

// ─────────────────────────── Users (buyers & sellers) ───────────────────────────

export const listUsers = asyncHandler(async (req, res) => {
  const paging = getPaging(req.query);
  const filter = { emailVerified: req.query.unverified === 'true' ? false : true };
  if (['buyer', 'seller'].includes(req.query.role)) filter.role = req.query.role;
  if (['pending', 'active', 'rejected', 'suspended'].includes(req.query.status)) filter.status = req.query.status;
  if (req.query.q) {
    const rx = new RegExp(escapeRegex(String(req.query.q).trim()), 'i');
    filter.$or = [{ name: rx }, { email: rx }, { companyName: rx }, { phone: rx }];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(paging.skip).limit(paging.limit).lean(),
    User.countDocuments(filter),
  ]);

  const subs = await Subscription.find({ user: { $in: users.map((u) => u._id) } })
    .populate('plan', 'name price interval currency')
    .lean();
  const subByUser = new Map(subs.map((s) => [s.user.toString(), s]));
  const rows = users.map(({ password, __v, ...u }) => ({ ...u, subscription: subByUser.get(u._id.toString()) || null }));

  res.json({ users: rows, ...pageMeta(total, paging) });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found.');
  const [subscription, history] = await Promise.all([
    Subscription.findOne({ user: user._id }).populate('plan'),
    AuditLog.find({ targetId: user._id }).sort({ createdAt: -1 }).limit(20).populate('admin', 'name email'),
  ]);
  res.json({ user, subscription, history });
});

/** Approve / reject sellers, suspend / reactivate anyone. */
export const setUserStatus = asyncHandler(async (req, res) => {
  const { status, reason } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found.');
  if (status === 'rejected' && user.role !== 'seller') throw new ApiError(400, 'Only seller applications can be rejected.');

  const previous = user.status;
  user.status = status;
  user.statusReason = reason || undefined;
  if (status === 'active' && user.role === 'seller' && previous !== 'active') {
    user.approvedAt = new Date();
    user.approvedBy = req.admin._id;
  }
  await user.save();

  let action = `user.${status}`;
  if (user.role === 'seller' && previous === 'pending' && status === 'active') action = 'seller.approve';
  if (status === 'rejected') action = 'seller.reject';
  await audit(req, action, { targetType: 'User', targetId: user._id, meta: { from: previous, to: status, reason } });

  if (action === 'seller.approve') await sendMail({ to: user.email, ...emails.sellerApproved(user.name) });
  if (action === 'seller.reject') await sendMail({ to: user.email, ...emails.sellerRejected(user.name, reason) });

  res.json({ user });
});

// ─────────────────────────── Admin team ───────────────────────────

export const listAdmins = asyncHandler(async (_req, res) => {
  res.json({ admins: await Admin.find().sort({ createdAt: 1 }) });
});

export const createAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.create(req.body);
  await audit(req, 'admin.create', { targetType: 'Admin', targetId: admin._id, meta: { email: admin.email, role: admin.role } });
  res.status(201).json({ admin });
});

export const updateAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id);
  if (!admin) throw new ApiError(404, 'Admin not found.');
  const isSelf = admin._id.equals(req.admin._id);
  if (isSelf && (req.body.isActive === false || (req.body.role && req.body.role !== 'super_admin'))) {
    throw new ApiError(400, 'You cannot disable yourself or remove your own super admin role.');
  }
  // Keep at least one active super admin
  if (admin.role === 'super_admin' && (req.body.isActive === false || (req.body.role && req.body.role !== 'super_admin'))) {
    const others = await Admin.countDocuments({ role: 'super_admin', isActive: true, _id: { $ne: admin._id } });
    if (!others) throw new ApiError(400, 'There must be at least one active super admin.');
  }

  admin.set(req.body);
  await admin.save();
  const { password, ...changes } = req.body;
  await audit(req, 'admin.update', {
    targetType: 'Admin',
    targetId: admin._id,
    meta: { ...changes, passwordChanged: Boolean(password) },
  });
  res.json({ admin });
});

// ─────────────────────────── Audit log ───────────────────────────

export const listAudit = asyncHandler(async (req, res) => {
  const paging = getPaging(req.query, 30);
  const filter = {};
  if (req.query.action) filter.action = new RegExp(`^${escapeRegex(String(req.query.action))}`);
  const [logs, total] = await Promise.all([
    AuditLog.find(filter).sort({ createdAt: -1 }).skip(paging.skip).limit(paging.limit).populate('admin', 'name email role'),
    AuditLog.countDocuments(filter),
  ]);
  res.json({ logs, ...pageMeta(total, paging) });
});
