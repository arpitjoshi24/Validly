import { z } from 'zod';

const campaignId = z.string().uuid();
const params = z.object({ campaignId });

export const campaignParamSchema = z.object({ params });

export const voteSchema = z.object({
  params,
  body: z.object({ variantId: z.string().uuid() }),
});

export const intentSchema = z.object({
  params,
  body: z.object({
    variantId: z.string().uuid(),
    level: z.enum(['DEFINITELY', 'PROBABLY', 'MAYBE', 'NO']),
  }),
});

export const createCommentSchema = z.object({
  params,
  body: z.object({ content: z.string().trim().min(3).max(500) }),
});

export const deleteCommentSchema = z.object({
  params: z.object({ campaignId, commentId: z.string().uuid() }),
});

export const listCommentsSchema = z.object({
  params,
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const joinWaitlistSchema = z.object({
  params,
  body: z.object({ consentToShareEmail: z.boolean().default(false) }),
});

// Founder-side waitlist view (mounted under /api/campaigns/:id/waitlist)
export const founderWaitlistSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
  }),
});