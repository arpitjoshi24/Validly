import { z } from 'zod';
import { CATEGORIES } from '../../utils/categories.js';

export const discoverListSchema = z.object({
  query: z.object({
    category: z.enum(CATEGORIES).optional(),
    search: z.string().trim().max(80).optional(),
    sort: z.enum(['recent', 'ending_soon']).default('recent'),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
  }),
});

export const discoverOneSchema = z.object({
  params: z.object({ campaignId: z.string().uuid() }),
});