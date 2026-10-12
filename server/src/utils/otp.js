import crypto from 'node:crypto';
import { Otp } from '../models/Otp.js';
import { ApiError } from './errors.js';

const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;

const hash = (code) => crypto.createHash('sha256').update(code).digest('hex');

/** Creates a fresh 6-digit OTP (replacing any earlier one) and returns the plain code. */
export async function createOtp(email, purpose) {
  const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
  await Otp.deleteMany({ email, purpose });
  await Otp.create({
    email,
    purpose,
    codeHash: hash(code),
    expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
  });
  return code;
}

/** Throws if the code is wrong/expired; deletes the OTP on success. */
export async function consumeOtp(email, purpose, code) {
  const otp = await Otp.findOne({ email, purpose });
  if (!otp || otp.expiresAt < new Date()) {
    throw new ApiError(400, 'This code has expired. Please request a new one.', 'OTP_EXPIRED');
  }
  if (otp.attempts >= MAX_ATTEMPTS) {
    await otp.deleteOne();
    throw new ApiError(429, 'Too many wrong attempts. Please request a new code.', 'OTP_LOCKED');
  }
  const a = Buffer.from(otp.codeHash);
  const b = Buffer.from(hash(String(code)));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    otp.attempts += 1;
    await otp.save();
    throw new ApiError(400, 'Incorrect code. Please check and try again.', 'OTP_INVALID');
  }
  await otp.deleteOne();
}

export const OTP_TTL = OTP_TTL_MINUTES;
