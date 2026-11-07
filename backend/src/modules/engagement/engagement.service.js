import { createHash } from 'node:crypto';
import { prisma } from '../../config/db.js';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';

const MAX_COMMENTS_PER_USER = 5;

const liveWhere = (campaignId) => ({
  id: campaignId,
  status: 'ACTIVE',
  endsAt: { gt: new Date() },
});

async function requireLive(campaignId) {
  const campaign = await prisma.campaign.findFirst({
    where: liveWhere(campaignId),
    select: { id: true },
  });
  if (!campaign) throw new ApiError(404, 'Campaign not found or no longer live');
}

async function requireVariant(campaignId, variantId) {
  const variant = await prisma.campaignVariant.findFirst({
    where: { id: variantId, campaignId },
    select: { id: true },
  });
  if (!variant) throw new ApiError(404, 'Variant not found in this campaign');
}

const pagination = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});

// ---------- Votes ----------
export async function castVote(campaignId, userId, variantId) {
  await requireLive(campaignId);
  await requireVariant(campaignId, variantId);
  return prisma.vote.upsert({
    where: { campaignId_userId: { campaignId, userId } },
    update: { variantId },
    create: { campaignId, userId, variantId },
  });
}

export async function removeVote(campaignId, userId) {
  await requireLive(campaignId);
  await prisma.vote.deleteMany({ where: { campaignId, userId } });
}

// ---------- Purchase intent ----------
export async function setIntent(campaignId, userId, { variantId, level }) {
  await requireLive(campaignId);
  await requireVariant(campaignId, variantId);
  return prisma.purchaseIntent.upsert({
    where: { userId_variantId: { userId, variantId } },
    update: { level },
    create: { campaignId, userId, variantId, level },
  });
}

// ---------- Likes ----------
export async function like(campaignId, userId) {
  await requireLive(campaignId);
  await prisma.like.upsert({
    where: { campaignId_userId: { campaignId, userId } },
    update: {},
    create: { campaignId, userId },
  });
}

export async function unlike(campaignId, userId) {
  await requireLive(campaignId);
  await prisma.like.deleteMany({ where: { campaignId, userId } });
}

// ---------- Comments ----------
export async function listComments(campaignId, { page, limit }) {
  await requireLive(campaignId);
  const where = { campaignId, status: 'VISIBLE' };
  const [items, total] = await prisma.$transaction([
    prisma.comment.findMany({
      where,
      select: { id: true, content: true, createdAt: true, user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.comment.count({ where }),
  ]);
  return { items, pagination: pagination(page, limit, total) };
}

export async function createComment(campaignId, userId, content) {
  await requireLive(campaignId);
  const existing = await prisma.comment.count({ where: { campaignId, userId } });
  if (existing >= MAX_COMMENTS_PER_USER) {
    throw new ApiError(429, `You can post at most ${MAX_COMMENTS_PER_USER} comments per campaign`);
  }
  return prisma.comment.create({
    data: { campaignId, userId, content },
    select: { id: true, content: true, createdAt: true, user: { select: { name: true } } },
  });
}

export async function deleteOwnComment(campaignId, commentId, userId) {
  const comment = await prisma.comment.findFirst({ where: { id: commentId, campaignId, userId } });
  if (!comment) throw new ApiError(404, 'Comment not found');
  await prisma.comment.delete({ where: { id: commentId } });
}

// ---------- Waitlist ----------
export async function joinWaitlist(campaignId, userId, consentToShareEmail) {
  await requireLive(campaignId);
  return prisma.waitlistEntry.upsert({
    where: { campaignId_userId: { campaignId, userId } },
    update: { consentToShareEmail },
    create: { campaignId, userId, consentToShareEmail },
  });
}

// Leaving is always allowed, even after the campaign ends.
export async function leaveWaitlist(campaignId, userId) {
  await prisma.waitlistEntry.deleteMany({ where: { campaignId, userId } });
}

export async function getFounderWaitlist(campaignId, founderId, { page, limit }) {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, product: { founderId } },
    select: { id: true },
  });
  if (!campaign) throw new ApiError(404, 'Campaign not found');

  const consentedWhere = { campaignId, consentToShareEmail: true };
  const [total, consented, entries] = await Promise.all([
    prisma.waitlistEntry.count({ where: { campaignId } }),
    prisma.waitlistEntry.count({ where: consentedWhere }),
    prisma.waitlistEntry.findMany({
      where: consentedWhere,
      select: { createdAt: true, user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    total,
    consented,
    entries: entries.map((e) => ({
      name: e.user.name,
      email: e.user.email,
      joinedAt: e.createdAt,
    })),
    pagination: pagination(page, limit, consented),
  };
}

// ---------- My state on a campaign ----------
export async function getMyEngagement(campaignId, userId) {
  await requireLive(campaignId);
  const key = { campaignId_userId: { campaignId, userId } };
  const [vote, intents, liked, waitlist] = await Promise.all([
    prisma.vote.findUnique({ where: key }),
    prisma.purchaseIntent.findMany({ where: { campaignId, userId } }),
    prisma.like.findUnique({ where: key }),
    prisma.waitlistEntry.findUnique({ where: key }),
  ]);

  return {
    votedVariantId: vote?.variantId ?? null,
    intents: intents.map((i) => ({ variantId: i.variantId, level: i.level })),
    liked: !!liked,
    onWaitlist: !!waitlist,
    waitlistConsent: waitlist?.consentToShareEmail ?? false,
  };
}

// ---------- View tracking ----------
// One view per anonymous visitor per campaign per day. No raw IP is stored.
export async function recordView(campaignId, req) {
  const raw = `${req.ip}|${req.get('user-agent') ?? ''}|${env.JWT_SECRET}`;
  const viewerKey = createHash('sha256').update(raw).digest('hex').slice(0, 32);
  const day = new Date().toISOString().slice(0, 10);
  await prisma.campaignView.createMany({
    data: [{ campaignId, viewerKey, day }],
    skipDuplicates: true,
  });
}