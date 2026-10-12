import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const sellerProfileSchema = new mongoose.Schema(
  {
    gstNumber: { type: String, trim: true },
    categories: [{ type: String, trim: true }],
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    country: { type: String, trim: true },
    website: { type: String, trim: true },
    description: { type: String, trim: true, maxlength: 2000 },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['buyer', 'seller'], required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    companyName: { type: String, trim: true, maxlength: 160 },
    seller: { type: sellerProfileSchema, default: undefined },

    emailVerified: { type: Boolean, default: false },
    /**
     * buyer:  active | suspended
     * seller: pending (awaiting admin approval) | active | rejected | suspended
     */
    status: {
      type: String,
      enum: ['pending', 'active', 'rejected', 'suspended'],
      default: 'active',
      index: true,
    },
    statusReason: { type: String, trim: true },
    approvedAt: Date,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },

    stripeCustomerId: { type: String, index: true },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.model('User', userSchema);
