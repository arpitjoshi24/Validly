import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { COOKIE_NAME, verifyToken } from '../utils/token.js';

export const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) throw new ApiError(401, 'Authentication required');

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new ApiError(401, 'Invalid or expired session');
  }

  // Role and status come from the database, so suspensions take effect immediately.
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, name: true, email: true, role: true, status: true },
  });

  if (!user) throw new ApiError(401, 'Invalid session');
  if (user.status !== 'ACTIVE') throw new ApiError(403, 'Account suspended');

  req.user = user;
  next();
});