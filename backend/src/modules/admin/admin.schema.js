import { z } from 'zod';

export const listUsersSchema = z.object({
  query: z.object({
    role: z.enum(['CONSUMER', 'FOUNDER', 'ADMIN']).optional(),
    status: z.enum(['ACTIVE', 'SUSPENDED']).optional(),
    search: z.string().trim().max(80).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const verifyFounderSchema = z.object({
  params: z.object({ userId: z.string().uuid() }),
  body: z.object({ status: z.enum(['VERIFIED', 'REJECTED']) }),
});

export const userStatusSchema = z.object({
  params: z.object({ userId: z.string().uuid() }),
  body: z.object({ status: z.enum(['ACTIVE', 'SUSPENDED']) }),
});