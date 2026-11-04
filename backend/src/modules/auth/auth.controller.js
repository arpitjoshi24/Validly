import { asyncHandler } from '../../utils/asyncHandler.js';
import { clearAuthCookie, setAuthCookie, signToken } from '../../utils/token.js';
import { loginUser, registerUser } from './auth.service.js';

export const register = asyncHandler(async (req, res) => {
  const user = await registerUser(req.validated.body);
  setAuthCookie(res, signToken(user));
  res.status(201).json({ success: true, data: { user } });
});

export const login = asyncHandler(async (req, res) => {
  const user = await loginUser(req.validated.body);
  setAuthCookie(res, signToken(user));
  res.json({ success: true, data: { user } });
});

export const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);
  res.json({ success: true, message: 'Logged out' });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});