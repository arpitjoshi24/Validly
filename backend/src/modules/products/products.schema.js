import { z } from 'zod';
import { CATEGORIES } from '../../utils/categories.js';

const id = z.string().uuid();
const productFields = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(2000),
  category: z.enum(CATEGORIES),
});

export const createProductSchema = z.object({ body: productFields });

export const updateProductSchema = z.object({
  params: z.object({ id }),
  body: productFields
    .partial()
    .refine((d) => Object.keys(d).length > 0, { message: 'Provide at least one field to update' }),
});

export const productIdSchema = z.object({ params: z.object({ id }) });

export const listProductsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  }),
});

export const uploadUrlSchema = z.object({
  params: z.object({ id }),
  body: z.object({
    contentType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
    fileSize: z.number().int().min(1).max(5 * 1024 * 1024),
  }),
});

export const registerImageSchema = z.object({
  params: z.object({ id }),
  body: z.object({ key: z.string().min(1).max(300) }),
});

export const imageIdSchema = z.object({ params: z.object({ id, imageId: id }) });