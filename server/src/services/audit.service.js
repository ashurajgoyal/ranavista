import { AuditLog } from '../models/AuditLog.js';

/** Records an admin action. Never throws — auditing must not break the request. */
export async function audit(req, action, { targetType, targetId, meta } = {}) {
  try {
    await AuditLog.create({
      admin: req.admin?._id,
      action,
      targetType,
      targetId,
      meta,
      ip: req.ip,
    });
  } catch (err) {
    console.error('✖ Audit log failed:', err.message);
  }
}
