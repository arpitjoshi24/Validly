import { z } from 'zod';

const profileFields = z.object({
  businessName: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).optional(),
  website: z.string().trim().url().optional(),
});

export const createProfileSchema = z.object({ body: profileFields });

export const updateProfileSchema = z.object({
  body: profileFields
    .partial()
    .refine((d) => Object.keys(d).length > 0, {
      message: 'Provide at least one field to update',
    }),
});