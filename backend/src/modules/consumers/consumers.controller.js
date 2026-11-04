import { asyncHandler } from '../../utils/asyncHandler.js';
import { getProfile, upsertProfile } from './consumers.service.js';

export const upsert = asyncHandler(async (req, res) => {
  const profile = await upsertProfile(req.user.id, req.validated.body);
  res.json({ success: true, data: { profile } });
});

export const get = asyncHandler(async (req, res) => {
  const profile = await getProfile(req.user.id);
  res.json({ success: true, data: { profile } });
});