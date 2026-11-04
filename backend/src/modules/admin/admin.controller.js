import { asyncHandler } from '../../utils/asyncHandler.js';
import { listUsers, setFounderVerification, setUserStatus } from './admin.service.js';

export const list = asyncHandler(async (req, res) => {
  const data = await listUsers(req.validated.query);
  res.json({ success: true, data });
});

export const verifyFounder = asyncHandler(async (req, res) => {
  const profile = await setFounderVerification(
    req.validated.params.userId,
    req.validated.body.status
  );
  res.json({ success: true, data: { profile } });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const user = await setUserStatus(
    req.user.id,
    req.validated.params.userId,
    req.validated.body.status
  );
  res.json({ success: true, data: { user } });
});