import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { categories, getOne, list } from './discovery.controller.js';
import { discoverListSchema, discoverOneSchema } from './discovery.schema.js';

const router = Router();

router.get('/', validate(discoverListSchema), list);
router.get('/categories', categories);
router.get('/:campaignId', validate(discoverOneSchema), getOne);

export default router;