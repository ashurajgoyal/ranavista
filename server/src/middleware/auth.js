import { User } from '../models/User.js';
import { Admin } from '../models/Admin.js';
import { ApiError, asyncHandler } from '../utils/errors.js';
import { getBearerToken, verifyAdminToken, verifyUserToken } from '../utils/tokens.js';

/** Website (buyer / seller) authentication. */
export const requireUser = asyncHandler(async (req, _res, next) => {
  const token = getBearerToken(req);
  if (!token) throw new ApiError(401, 'Please log in to continue.', 'UNAUTHENTICATED');

  let payload;
  try {
    payload = verifyUserToken(token);
  } catch {
    throw new ApiError(401, 'Your session has expired. Please log in again.', 'TOKEN_INVALID');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw new ApiError(401, 'Account not found.', 'UNAUTHENTICATED');
  if (user.status === 'suspended') throw new ApiError(403, 'Your account is suspended.', 'ACCOUNT_SUSPENDED');

  req.user = user;
  next();
});

export const requireRole =
  (...roles) =>
  (req, _res, next) =>
    roles.includes(req.user?.role)
      ? next()
      : next(new ApiError(403, 'You do not have access to this.', 'FORBIDDEN'));

/** Admin panel authentication. */
export const requireAdmin = asyncHandler(async (req, _res, next) => {
  const token = getBearerToken(req);
  if (!token) throw new ApiError(401, 'Please log in to continue.', 'UNAUTHENTICATED');

  let payload;
  try {
    payload = verifyAdminToken(token);
  } catch {
    throw new ApiError(401, 'Your session has expired. Please log in again.', 'TOKEN_INVALID');
  }

  const admin = await Admin.findById(payload.sub);
  if (!admin || !admin.isActive) throw new ApiError(401, 'Admin account not available.', 'UNAUTHENTICATED');

  req.admin = admin;
  next();
});

/** super_admin always passes. */
export const requireAdminRole =
  (...roles) =>
  (req, _res, next) =>
    req.admin?.role === 'super_admin' || roles.includes(req.admin?.role)
      ? next()
      : next(new ApiError(403, 'Your admin role does not have access to this.', 'FORBIDDEN'));
