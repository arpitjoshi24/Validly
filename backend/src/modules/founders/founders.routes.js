import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validate } from '../../middleware/validate.js';
import { create, get, update } from './founders.controller.js';
import { createProfileSchema, updateProfileSchema } from './founders.schema.js';

const router = Router();

router.use(authenticate, requireRole('FOUNDER'));

router.post('/profile', validate(createProfileSchema), create);
router.get('/profile', get);
router.patch('/profile', validate(updateProfileSchema), update);

export default router;