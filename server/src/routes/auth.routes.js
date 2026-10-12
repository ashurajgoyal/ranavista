import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as auth from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { requireUser } from '../middleware/auth.js';
import { env } from '../config/env.js';

const router = Router();

// Brute-force protection for login / OTP endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.isDev ? 500 : 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please wait a few minutes and try again.' },
});
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: env.isDev ? 100 : 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many code requests. Please wait 10 minutes.' },
});

router.post('/register', otpLimiter, validate(auth.schemas.register), auth.register);
router.post('/verify-email', authLimiter, validate(auth.schemas.verifyEmail), auth.verifyEmail);
router.post('/resend-otp', otpLimiter, validate(auth.schemas.resendOtp), auth.resendOtp);
router.post('/login', authLimiter, validate(auth.schemas.login), auth.login);
router.post('/forgot-password', otpLimiter, validate(auth.schemas.forgotPassword), auth.forgotPassword);
router.post('/reset-password', authLimiter, validate(auth.schemas.resetPassword), auth.resetPassword);

router.get('/me', requireUser, auth.me);
router.patch('/me', requireUser, validate(auth.schemas.updateProfile), auth.updateProfile);
router.post('/change-password', requireUser, validate(auth.schemas.changePassword), auth.changePassword);

export default router;
