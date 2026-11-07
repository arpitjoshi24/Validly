import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { engagementLimiter } from '../../middleware/rateLimiter.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validate } from '../../middleware/validate.js';
import * as c from './engagement.controller.js';
import * as s from './engagement.schema.js';

const router = Router();
const consumerOnly = [authenticate, requireRole('CONSUMER'), engagementLimiter];

// Public
router.get('/:campaignId/comments', validate(s.listCommentsSchema), c.listComments);

// Consumer
router.get('/:campaignId/me', ...consumerOnly, validate(s.campaignParamSchema), c.me);

router.put('/:campaignId/vote', ...consumerOnly, validate(s.voteSchema), c.castVote);
router.delete('/:campaignId/vote', ...consumerOnly, validate(s.campaignParamSchema), c.removeVote);

router.put('/:campaignId/intent', ...consumerOnly, validate(s.intentSchema), c.setIntent);

router.post('/:campaignId/like', ...consumerOnly, validate(s.campaignParamSchema), c.like);
router.delete('/:campaignId/like', ...consumerOnly, validate(s.campaignParamSchema), c.unlike);

router.post('/:campaignId/comments', ...consumerOnly, validate(s.createCommentSchema), c.createComment);
router.delete(
  '/:campaignId/comments/:commentId',
  ...consumerOnly,
  validate(s.deleteCommentSchema),
  c.deleteComment
);

router.post('/:campaignId/waitlist', ...consumerOnly, validate(s.joinWaitlistSchema), c.joinWaitlist);
router.delete('/:campaignId/waitlist', ...consumerOnly, validate(s.campaignParamSchema), c.leaveWaitlist);

export default router;