import { asyncHandler } from '../../utils/asyncHandler.js';
import { updateMe } from './users.service.js';

export const updateMeHandler = asyncHandler(async (req, res) => {
  const user = await updateMe(req.user.id, req.validated.body);
  res.json({ success: true, data: { user } });
});