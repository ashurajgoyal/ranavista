import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as admin from '../controllers/admin.controller.js';
import * as billing from '../controllers/adminBilling.controller.js';
import * as contact from '../controllers/contact.controller.js';
import { validate } from '../middleware/validate.js';
import { requireAdmin, requireAdminRole } from '../middleware/auth.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please wait 15 minutes.' },
});

router.post('/auth/login', loginLimiter, validate(admin.schemas.login), admin.login);

router.use(requireAdmin);
router.get('/auth/me', admin.me);

// Who can do what (super_admin can always do everything)
const people = requireAdminRole('support', 'category_manager');
const money = requireAdminRole('finance');
const superOnly = requireAdminRole();

router.get('/dashboard', admin.dashboard);

router.get('/users', people, admin.listUsers);
router.get('/users/:id', people, admin.getUser);
router.patch('/users/:id/status', people, validate(admin.schemas.userStatus), admin.setUserStatus);

router.get('/enquiries', people, contact.listEnquiries);
router.patch('/enquiries/:id', people, validate(contact.schemas.update), contact.updateEnquiry);

router.get('/plans', money, billing.listPlans);
router.post('/plans', money, validate(billing.schemas.createPlan), billing.createPlan);
router.patch('/plans/:id', money, validate(billing.schemas.updatePlan), billing.updatePlan);
router.delete('/plans/:id', money, billing.deletePlan);

router.get('/subscriptions', money, billing.listSubscriptions);
router.post('/subscriptions/assign', money, validate(billing.schemas.assign), billing.assignPlan);
router.post('/subscriptions/:id/cancel', money, validate(billing.schemas.cancel), billing.cancelSubscription);

router.get('/admins', superOnly, admin.listAdmins);
router.post('/admins', superOnly, validate(admin.schemas.createAdmin), admin.createAdmin);
router.patch('/admins/:id', superOnly, validate(admin.schemas.updateAdmin), admin.updateAdmin);

router.get('/audit', superOnly, admin.listAudit);

export default router;
