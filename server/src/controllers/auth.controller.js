import { z } from 'zod';
import { User } from '../models/User.js';
import { ApiError, asyncHandler } from '../utils/errors.js';
import { signUserToken } from '../utils/tokens.js';
import { createOtp, consumeOtp, OTP_TTL } from '../utils/otp.js';
import { emails, sendMail } from '../utils/mailer.js';
import { env } from '../config/env.js';
import { ensureDefaultSubscription, getUserSubscription } from '../services/subscription.service.js';

// ─────────────────────────── Validation ───────────────────────────

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password is too long')
  .regex(/[A-Za-z]/, 'Password must include a letter')
  .regex(/[0-9]/, 'Password must include a number');

const email = z.string().trim().toLowerCase().email('Enter a valid email address');
const otpCode = z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit code');

export const schemas = {
  register: z
    .object({
      role: z.enum(['buyer', 'seller'], { message: 'Choose buyer or seller' }),
      name: z.string().trim().min(2, 'Enter your full name').max(120),
      email,
      phone: z.string().trim().regex(/^\+?[0-9\s-]{7,20}$/, 'Enter a valid phone number'),
      password,
      companyName: z.string().trim().max(160).optional().default(''),
      seller: z
        .object({
          gstNumber: z.string().trim().max(30).optional(),
          categories: z.array(z.string().trim().min(1)).max(20).optional(),
          address: z.string().trim().max(300).optional(),
          city: z.string().trim().max(100).optional(),
          country: z.string().trim().max(100).optional(),
          website: z.string().trim().max(200).optional(),
          description: z.string().trim().max(2000).optional(),
        })
        .optional(),
    })
    .superRefine((data, ctx) => {
      if (data.role === 'seller') {
        if (!data.companyName) ctx.addIssue({ code: 'custom', path: ['companyName'], message: 'Company name is required for sellers' });
        if (!data.seller?.categories?.length)
          ctx.addIssue({ code: 'custom', path: ['seller', 'categories'], message: 'Pick at least one category you supply' });
      }
    }),
  verifyEmail: z.object({ email, code: otpCode }),
  resendOtp: z.object({ email, purpose: z.enum(['verify_email', 'reset_password']).default('verify_email') }),
  login: z.object({ email, password: z.string().min(1, 'Enter your password') }),
  forgotPassword: z.object({ email }),
  resetPassword: z.object({ email, code: otpCode, password }),
  changePassword: z.object({ currentPassword: z.string().min(1), newPassword: password }),
  updateProfile: z.object({
    name: z.string().trim().min(2).max(120).optional(),
    phone: z.string().trim().regex(/^\+?[0-9\s-]{7,20}$/, 'Enter a valid phone number').optional(),
    companyName: z.string().trim().max(160).optional(),
    seller: z
      .object({
        gstNumber: z.string().trim().max(30).optional(),
        categories: z.array(z.string().trim().min(1)).max(20).optional(),
        address: z.string().trim().max(300).optional(),
        city: z.string().trim().max(100).optional(),
        country: z.string().trim().max(100).optional(),
        website: z.string().trim().max(200).optional(),
        description: z.string().trim().max(2000).optional(),
      })
      .optional(),
  }),
};

// ─────────────────────────── Helpers ───────────────────────────

async function sendOtp(userEmail, purpose) {
  const code = await createOtp(userEmail, purpose);
  await sendMail({ to: userEmail, ...emails.otp(code, purpose, OTP_TTL) });
  // In development the code is also returned so you can test without email.
  return env.isDev ? { devOtp: code } : {};
}

async function sessionPayload(user) {
  const subscription = await getUserSubscription(user._id);
  return { token: signUserToken(user), user, subscription };
}

// ─────────────────────────── Handlers ───────────────────────────

export const register = asyncHandler(async (req, res) => {
  const { role, name, email: userEmail, phone, password: pwd, companyName, seller } = req.body;

  let user = await User.findOne({ email: userEmail }).select('+password');
  if (user?.emailVerified) {
    throw new ApiError(409, 'An account with this email already exists. Please log in.', 'EMAIL_TAKEN');
  }

  // Unverified accounts can be re-registered (e.g. user lost the OTP email).
  if (!user) user = new User({ email: userEmail });
  user.set({
    role,
    name,
    phone,
    password: pwd,
    companyName,
    seller: role === 'seller' ? seller || {} : undefined,
    emailVerified: false,
    status: role === 'seller' ? 'pending' : 'active',
  });
  await user.save();

  const dev = await sendOtp(userEmail, 'verify_email');
  res.status(201).json({
    message: `We've sent a 6-digit code to ${userEmail}.`,
    email: userEmail,
    ...dev,
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { email: userEmail, code } = req.body;
  const user = await User.findOne({ email: userEmail });
  if (!user) throw new ApiError(404, 'No account found for this email.');
  if (user.emailVerified) throw new ApiError(400, 'Email is already verified. Please log in.', 'ALREADY_VERIFIED');

  await consumeOtp(userEmail, 'verify_email', code);
  user.emailVerified = true;
  user.lastLoginAt = new Date();
  await user.save();
  await ensureDefaultSubscription(user);

  res.json(await sessionPayload(user));
});

export const resendOtp = asyncHandler(async (req, res) => {
  const { email: userEmail, purpose } = req.body;
  const user = await User.findOne({ email: userEmail });
  let dev = {};
  // Respond the same either way so emails can't be enumerated.
  if (user && !(purpose === 'verify_email' && user.emailVerified)) {
    dev = await sendOtp(userEmail, purpose);
  }
  res.json({ message: 'If the account exists, a new code has been sent.', ...dev });
});

export const login = asyncHandler(async (req, res) => {
  const { email: userEmail, password: pwd } = req.body;
  const user = await User.findOne({ email: userEmail }).select('+password');
  if (!user || !(await user.comparePassword(pwd))) {
    throw new ApiError(401, 'Incorrect email or password.', 'INVALID_CREDENTIALS');
  }
  if (!user.emailVerified) {
    const dev = await sendOtp(userEmail, 'verify_email');
    throw new ApiError(403, 'Please verify your email. We’ve sent you a new code.', 'EMAIL_NOT_VERIFIED', {
      email: userEmail,
      ...dev,
    });
  }
  if (user.status === 'suspended') {
    throw new ApiError(403, 'Your account is suspended. Please contact support.', 'ACCOUNT_SUSPENDED');
  }
  // Pending / rejected sellers can log in — the dashboard shows their status.

  user.lastLoginAt = new Date();
  await user.save();
  await ensureDefaultSubscription(user);
  res.json(await sessionPayload(user));
});

export const me = asyncHandler(async (req, res) => {
  const subscription = await getUserSubscription(req.user._id);
  res.json({ user: req.user, subscription });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { seller, ...rest } = req.body;
  req.user.set(rest);
  if (seller && req.user.role === 'seller') {
    req.user.seller = { ...(req.user.seller?.toObject?.() || {}), ...seller };
  }
  await req.user.save();
  res.json({ user: req.user });
});

export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(req.body.currentPassword))) {
    throw new ApiError(400, 'Current password is incorrect.', 'INVALID_PASSWORD');
  }
  user.password = req.body.newPassword;
  await user.save();
  res.json({ message: 'Password updated.' });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  let dev = {};
  if (user) dev = await sendOtp(user.email, 'reset_password');
  res.json({ message: 'If an account exists for this email, we’ve sent a reset code.', ...dev });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email: userEmail, code, password: pwd } = req.body;
  const user = await User.findOne({ email: userEmail }).select('+password');
  if (!user) throw new ApiError(400, 'This code has expired. Please request a new one.', 'OTP_EXPIRED');

  await consumeOtp(userEmail, 'reset_password', code);
  user.password = pwd;
  user.emailVerified = true; // they proved they own the inbox
  await user.save();
  res.json({ message: 'Password reset. You can now log in.' });
});
