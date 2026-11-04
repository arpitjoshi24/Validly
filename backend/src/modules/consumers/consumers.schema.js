import { z } from 'zod';

export const upsertProfileSchema = z.object({
  body: z.object({
    interests: z.array(z.string().trim().min(2).max(40)).max(20).default([]),
    city: z.string().trim().max(80).optional(),
    preferences: z.record(z.string(), z.any()).optional(),
  }),
});