import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validate } from '../../middleware/validate.js';
import * as c from './campaigns.controller.js';
import * as s from './campaigns.schema.js';

const router = Router();

router.use(authenticate, requireRole('FOUNDER'));

router.post('/', validate(s.createCampaignSchema), c.create);
router.get('/', validate(s.listCampaignsSchema), c.list);
router.get('/:id', validate(s.campaignIdSchema), c.get);
router.patch('/:id', validate(s.updateCampaignSchema), c.update);
router.patch('/:id/publish', validate(s.campaignIdSchema), c.publish);
router.patch('/:id/close', validate(s.campaignIdSchema), c.close);
router.delete('/:id', validate(s.campaignIdSchema), c.remove);

export default router;