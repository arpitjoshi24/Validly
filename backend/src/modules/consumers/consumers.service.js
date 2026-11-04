import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/ApiError.js';

export async function upsertProfile(userId, data) {
  return prisma.consumerProfile.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });
}

export async function getProfile(userId) {
  const profile = await prisma.consumerProfile.findUnique({ where: { userId } });
  if (!profile) throw new ApiError(404, 'Consumer profile not found');
  return profile;
}