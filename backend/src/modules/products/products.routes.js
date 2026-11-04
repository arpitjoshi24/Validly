import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validate } from '../../middleware/validate.js';
import * as c from './products.controller.js';
import * as s from './products.schema.js';

const router = Router();

router.use(authenticate, requireRole('FOUNDER'));

router.post('/', validate(s.createProductSchema), c.create);
router.get('/', validate(s.listProductsSchema), c.list);
router.get('/:id', validate(s.productIdSchema), c.get);
router.patch('/:id', validate(s.updateProductSchema), c.update);
router.delete('/:id', validate(s.productIdSchema), c.remove);

router.post('/:id/images/upload-url', validate(s.uploadUrlSchema), c.uploadUrl);
router.post('/:id/images', validate(s.registerImageSchema), c.addImage);
router.delete('/:id/images/:imageId', validate(s.imageIdSchema), c.removeImage);

export default router;