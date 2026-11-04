import { z } from 'zod';

const id = z.string().uuid();

const variantSchema = z.object({
  name: z.string().trim().min(1).max(60),
  description: z.string().trim().max(200).optional(),
  price: z
    .number()
    .positive()
    .max(100000)
    .refine((v) => Math.round(v * 100) / 100 === v, { message: 'Price can have at most 2 decimals' }),
});

const variantsSchema = z.array(variantSchema).min(1).max(5);

const campaignFields = z.object({
  objective: z.string().trim().max(200).optional(),
  targetAudience: z.string().trim().max(200).optional(),
  location: z.string().trim().max(100).optional(),
  durationDays: z.number().int().min(1).max(60),
});

export const createCampaignSchema = z.object({
  body: campaignFields
    .extend({
      productId: id,
      durationDays: z.number().int().min(1).max(60).default(14),
      variants: variantsSchema,
    }),
});

export const updateCampaignSchema = z.object({
  params: z.object({ id }),
  body: campaignFields
    .partial()
    .extend({ variants: variantsSchema.optional() })
    .refine((d) => Object.keys(d).length > 0, { message: 'Provide at least one field to update' }),
});

export const campaignIdSchema = z.object({ params: z.object({ id }) });

export const listCampaignsSchema = z.object({
  query: z.object({
    status: z.enum(['DRAFT', 'ACTIVE', 'CLOSED']).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  }),
});