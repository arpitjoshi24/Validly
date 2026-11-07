import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validate } from '../../middleware/validate.js';
import { list, updateStatus, verifyFounder, updateCommentVisibility } from './admin.controller.js';
import { listUsersSchema, userStatusSchema, verifyFounderSchema, commentVisibilitySchema } from './admin.schema.js';

const router = Router();

router.use(authenticate, requireRole('ADMIN'));

router.get('/users', validate(listUsersSchema), list);
router.patch('/founders/:userId/verify', validate(verifyFounderSchema), verifyFounder);
router.patch('/users/:userId/status', validate(userStatusSchema), updateStatus);
router.patch('/comments/:commentId/visibility', validate(commentVisibilitySchema), updateCommentVisibility);
export default router;