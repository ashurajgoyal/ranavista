import { ApiError } from '../utils/errors.js';

/** Validates req.body (or req.query) against a zod schema and replaces it with the parsed value. */
export const validate =
  (schema, source = 'body') =>
  (req, _res, next) => {
    const result = schema.safeParse(req[source] ?? {});
    if (!result.success) {
      const details = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
      return next(new ApiError(422, details[0]?.message || 'Invalid input', 'VALIDATION_ERROR', details));
    }
    if (source === 'body') req.body = result.data;
    else req.validated = result.data;
    next();
  };
