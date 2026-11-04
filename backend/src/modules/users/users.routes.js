import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { updateMeHandler } from './users.controller.js';
import { updateMeSchema } from './users.schema.js';

const router = Router();

router.patch('/me', authenticate, validate(updateMeSchema), updateMeHandler);

export default router;