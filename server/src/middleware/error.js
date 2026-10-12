import { env } from '../config/env.js';

export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  // Mongo duplicate key (e.g. email already used)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ message: `That ${field} is already in use.`, code: 'DUPLICATE' });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID.', code: 'INVALID_ID' });
  }
  if (err.name === 'ValidationError') {
    const first = Object.values(err.errors)[0];
    return res.status(422).json({ message: first?.message || 'Invalid data.', code: 'VALIDATION_ERROR' });
  }
  if (err.type === 'StripeInvalidRequestError' || err.type === 'StripeCardError') {
    return res.status(400).json({ message: err.message, code: 'STRIPE_ERROR' });
  }

  const status = err.status || 500;
  if (status >= 500) console.error(err);

  res.status(status).json({
    message: status >= 500 && !env.isDev ? 'Something went wrong. Please try again.' : err.message,
    code: err.code,
    details: err.details,
  });
}
