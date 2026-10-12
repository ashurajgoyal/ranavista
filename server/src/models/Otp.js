import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    purpose: { type: String, enum: ['verify_email', 'reset_password'], required: true },
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    // MongoDB TTL index removes the document automatically once expired
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true }
);

export const Otp = mongoose.model('Otp', otpSchema);
