import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validate } from '../../middleware/validate.js';
import { get, upsert } from './consumers.controller.js';
import { upsertProfileSchema } from './consumers.schema.js';

const router = Router();

router.use(authenticate, requireRole('CONSUMER'));

router.put('/profile', validate(upsertProfileSchema), upsert);
router.get('/profile', get);

export default router;