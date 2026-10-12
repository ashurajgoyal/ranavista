import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', index: true },
    action: { type: String, required: true, index: true }, // e.g. seller.approve, plan.update
    targetType: { type: String }, // User | Plan | Subscription | Admin
    targetId: { type: mongoose.Schema.Types.ObjectId },
    meta: { type: mongoose.Schema.Types.Mixed },
    ip: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.set('toJSON', { versionKey: false });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
