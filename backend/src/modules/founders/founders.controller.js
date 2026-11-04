import { asyncHandler } from '../../utils/asyncHandler.js';
import { createProfile, getProfile, updateProfile } from './founders.service.js';

export const create = asyncHandler(async (req, res) => {
  const profile = await createProfile(req.user.id, req.validated.body);
  res.status(201).json({ success: true, data: { profile } });
});

export const get = asyncHandler(async (req, res) => {
  const profile = await getProfile(req.user.id);
  res.json({ success: true, data: { profile } });
});

export const update = asyncHandler(async (req, res) => {
  const profile = await updateProfile(req.user.id, req.validated.body);
  res.json({ success: true, data: { profile } });
});