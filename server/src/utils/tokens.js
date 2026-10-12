import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// Website users and admins use different secrets and audiences,
// so a buyer/seller token can never be used on the admin API.

export function signUserToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
    audience: 'app',
  });
}

export function verifyUserToken(token) {
  return jwt.verify(token, env.jwtSecret, { audience: 'app' });
}

export function signAdminToken(admin) {
  return jwt.sign({ sub: admin._id.toString(), role: admin.role }, env.adminJwtSecret, {
    expiresIn: env.adminJwtExpiresIn,
    audience: 'admin',
  });
}

export function verifyAdminToken(token) {
  return jwt.verify(token, env.adminJwtSecret, { audience: 'admin' });
}

export function getBearerToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : null;
}
