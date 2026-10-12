import mongoose from 'mongoose';

/** A message sent through the website's Contact Us form. */
const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true, maxlength: 160 },
    topic: { type: String, enum: ['buying', 'selling', 'partnership', 'support', 'other'], default: 'other', index: true },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    status: { type: String, enum: ['new', 'in_progress', 'closed'], default: 'new', index: true },
    note: { type: String, trim: true, maxlength: 2000 }, // internal admin note
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ip: String,
  },
  { timestamps: true }
);

enquirySchema.set('toJSON', { versionKey: false });

export const Enquiry = mongoose.model('Enquiry', enquirySchema);
