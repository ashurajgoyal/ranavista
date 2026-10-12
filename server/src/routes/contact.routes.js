import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as contact from '../controllers/contact.controller.js';
import { validate } from '../middleware/validate.js';
import { env } from '../config/env.js';

const router = Router();

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: env.isDev ? 200 : 8,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'You’ve sent several messages already. Please try again later or email us directly.' },
});

router.post('/', limiter, validate(contact.schemas.create), contact.createEnquiry);

export default router;
