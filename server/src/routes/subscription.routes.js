import { Router } from 'express';
import * as subs from '../controllers/subscription.controller.js';
import { validate } from '../middleware/validate.js';
import { requireUser } from '../middleware/auth.js';

export const planRouter = Router();
planRouter.get('/', subs.listPlans);

export const subscriptionRouter = Router();
subscriptionRouter.use(requireUser);
subscriptionRouter.get('/me', subs.getMine);
subscriptionRouter.post('/checkout', validate(subs.schemas.checkout), subs.checkout);
subscriptionRouter.post('/confirm', validate(subs.schemas.confirm), subs.confirmCheckout);
subscriptionRouter.post('/portal', subs.billingPortal);
subscriptionRouter.post('/cancel', subs.cancel);
subscriptionRouter.post('/resume', subs.resume);
