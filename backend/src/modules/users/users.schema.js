import { z } from 'zod';

export const updateMeSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(80).optional(),
      currentPassword: z.string().optional(),
      newPassword: z.string().min(8).max(72).optional(),
    })
    .refine((d) => Object.keys(d).length > 0, {
      message: 'Provide at least one field to update',
    })
    .refine((d) => !d.newPassword || d.currentPassword, {
      message: 'currentPassword is required to set a new password',
      path: ['currentPassword'],
    }),
});