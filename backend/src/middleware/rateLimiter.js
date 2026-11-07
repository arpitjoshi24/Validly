import rateLimit from 'express-rate-limit';

const tooMany = { success: false, message: 'Too many requests, please try again later' };

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: tooMany,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: tooMany,
});
export const engagementLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 60,
  keyGenerator: (req) => req.user?.id ?? 'anonymous',
  standardHeaders: true,
  legacyHeaders: false,
  message: tooMany,
});